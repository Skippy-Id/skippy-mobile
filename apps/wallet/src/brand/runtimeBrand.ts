/**
 * Runtime (per-tenant) branding.
 *
 * A Skippy customer configures branding on their organisation in the Skippy
 * dashboard; the hub serves it unauthenticated from
 * `GET /app/v1/public/brand?token=` keyed on a wallet access token. When the
 * wallet is opened through one of that customer's links, we resolve their brand
 * and re-skin the holder-facing surfaces.
 *
 * This complements the build-time brand (brands/): build-time decides what the
 * app *is* (name, icon, bundle id), runtime decides whose credentials the holder
 * is currently dealing with. Build-time always remains the fallback.
 */
import { buildAppTheme, parseColor } from '../../brands/ramp'
import type { Theme } from '../../brands/types'
import { mmkv } from '../storage/mmkv'

const CACHE_KEY = 'skippy.runtimeBrand'
const FETCH_TIMEOUT_MS = 8000
const MAX_STRING = 200

/** The subset of the hub's `OrganisationBranding` the wallet consumes. */
export interface TenantBranding {
  appName?: string
  logos?: { horizontal?: string; mark?: string }
  colors?: { primary?: string; secondary?: string }
  walletCopy?: { productName?: string; claimSubtitle?: string }
  poweredBy?: { visible?: boolean }
  whiteLabel?: boolean
  brandingVersion?: number
}

export interface RuntimeBrand {
  productName?: string
  claimSubtitle?: string
  logoUri?: string
  /** Full token set derived from the tenant's primary; undefined when unset. */
  theme?: Theme
  /** Tenant primary, for one-off accents that don't read the theme. */
  accent?: string
  poweredByVisible: boolean
  brandingVersion: number
}

interface CacheEntry {
  branding: TenantBranding
  fetchedAt: number
}

// ── validation ────────────────────────────────────────────────────────────────
// Everything here is attacker-influenceable remote data: a token from a link we
// were handed decides what the hub returns. Validate rather than trust.

function safeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_STRING) return undefined
  return trimmed
}

/** Only absolute https URLs — no http, data: or javascript: logo sources. */
function safeHttpsUrl(value: unknown): string | undefined {
  const raw = safeString(value)
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function safeColor(value: unknown): string | undefined {
  const raw = safeString(value)
  return raw && parseColor(raw) ? raw : undefined
}

/** Treat an unknown value as a plain object so nested reads stay type-safe. */
function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/** Narrow an unknown JSON payload to the fields we use, dropping anything odd. */
export function sanitizeBranding(input: unknown): TenantBranding | null {
  if (!input || typeof input !== 'object') return null
  const raw = asObject(input)
  const logos = asObject(raw.logos)
  const colors = asObject(raw.colors)
  const walletCopy = asObject(raw.walletCopy)
  const poweredBy = asObject(raw.poweredBy)

  const branding: TenantBranding = {
    appName: safeString(raw.appName),
    logos: {
      horizontal: safeHttpsUrl(logos.horizontal),
      mark: safeHttpsUrl(logos.mark),
    },
    colors: {
      primary: safeColor(colors.primary),
      secondary: safeColor(colors.secondary),
    },
    walletCopy: {
      productName: safeString(walletCopy.productName),
      claimSubtitle: safeString(walletCopy.claimSubtitle),
    },
    poweredBy: { visible: poweredBy.visible !== false },
    whiteLabel: raw.whiteLabel === true,
    brandingVersion: typeof raw.brandingVersion === 'number' ? raw.brandingVersion : 0,
  }

  const hasAnything =
    branding.appName ||
    branding.logos?.horizontal ||
    branding.logos?.mark ||
    branding.colors?.primary ||
    branding.walletCopy?.productName
  return hasAnything ? branding : null
}

// ── token extraction ──────────────────────────────────────────────────────────

/**
 * Pull the wallet access token out of an incoming link.
 *
 * Restricted to https links on the configured hub host: the token is a bearer
 * credential, and matching on the *build-time* hub (never the link's own origin)
 * keeps a hostile link from steering us at another server.
 */
export function extractBrandToken(url: string | null | undefined, hubUrl: string | undefined): string | null {
  if (!url || !hubUrl) return null
  try {
    const parsed = new URL(url)
    const hub = new URL(hubUrl)
    if (parsed.protocol !== 'https:' || parsed.host !== hub.host) return null
    if (!parsed.pathname.startsWith('/wallet')) return null
    const token = parsed.searchParams.get('token')
    if (!token || !/^[\w.\-~+/=]{16,512}$/.test(token)) return null
    return token
  } catch {
    return null
  }
}

// ── fetching ──────────────────────────────────────────────────────────────────

export async function fetchPublicBrand(hubUrl: string, token: string): Promise<TenantBranding | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const endpoint = `${hubUrl.replace(/\/$/, '')}/app/v1/public/brand?token=${encodeURIComponent(token)}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) return null
    const json = (await response.json()) as { data?: unknown }
    // The hub answers `{ data: null }` for an unknown/expired token or an org
    // without branding — an expected outcome, not an error.
    return sanitizeBranding(json?.data)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ── cache ─────────────────────────────────────────────────────────────────────

export function readCachedBranding(): TenantBranding | null {
  try {
    const raw = mmkv.getString(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    return sanitizeBranding(entry?.branding)
  } catch {
    return null
  }
}

export function writeCachedBranding(branding: TenantBranding): void {
  try {
    mmkv.set(CACHE_KEY, JSON.stringify({ branding, fetchedAt: Date.now() } satisfies CacheEntry))
  } catch {
    // A failed cache write only costs a refetch.
  }
}

export function clearCachedBranding(): void {
  mmkv.remove(CACHE_KEY)
}

// ── resolution ────────────────────────────────────────────────────────────────

/** Turn validated tenant branding into the values the UI reads. */
export function resolveRuntimeBrand(branding: TenantBranding | null): RuntimeBrand | null {
  if (!branding) return null

  const primary = branding.colors?.primary
  // Fall back to the primary when no accent is set, so the derived feature ramp
  // stays inside the tenant's palette instead of reverting to Skippy amber.
  const secondary = branding.colors?.secondary ?? primary

  return {
    productName: branding.walletCopy?.productName ?? branding.appName,
    claimSubtitle: branding.walletCopy?.claimSubtitle,
    logoUri: branding.logos?.mark ?? branding.logos?.horizontal,
    theme: primary && secondary ? buildAppTheme({ primary, feature: secondary }) : undefined,
    accent: primary,
    poweredByVisible: branding.poweredBy?.visible !== false,
    brandingVersion: branding.brandingVersion ?? 0,
  }
}
