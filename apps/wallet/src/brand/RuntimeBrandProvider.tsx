import { skippyHubUrl } from '@app/constants'
import * as Linking from 'expo-linking'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { brand } from '../../brands'
import { clearCachedBranding, readCachedBranding, writeCachedBranding } from './brandCache'
import {
  extractBrandToken,
  fetchPublicBrand,
  type RuntimeBrand,
  resolveRuntimeBrand,
  type TenantBranding,
} from './runtimeBrand'

interface RuntimeBrandContextValue {
  /** Tenant brand, or null when running as the plain build-time brand. */
  runtime: RuntimeBrand | null
  /** Wallet name to show holders: tenant override, else the build-time brand. */
  productName: string
  clear: () => void
}

const RuntimeBrandContext = createContext<RuntimeBrandContextValue | null>(null)

/**
 * Resolves the tenant brand for links opened from a Skippy customer's wallet
 * pages, and keeps the last one so the app stays on-brand across restarts.
 *
 * Deliberately non-blocking: the app renders the build-time brand immediately and
 * swaps in the tenant brand when (and only if) one resolves. A slow or offline
 * hub must never gate the wallet.
 */
export function RuntimeBrandProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding | null>(() => readCachedBranding())
  // The token is a one-shot credential; don't refetch for one already handled.
  const handledTokens = useRef<Set<string>>(new Set())

  const url = Linking.useURL()

  useEffect(() => {
    const token = extractBrandToken(url, skippyHubUrl)
    if (!token || handledTokens.current.has(token)) return
    handledTokens.current.add(token)

    let cancelled = false
    void fetchPublicBrand(skippyHubUrl as string, token).then((resolved) => {
      // A null result means "no tenant branding for this link" — keep whatever we
      // already had rather than flashing back to the platform default.
      if (cancelled || !resolved) return
      setBranding(resolved)
      writeCachedBranding(resolved)
    })

    return () => {
      cancelled = true
    }
  }, [url])

  const clear = useCallback(() => {
    clearCachedBranding()
    handledTokens.current.clear()
    setBranding(null)
  }, [])

  const value = useMemo<RuntimeBrandContextValue>(() => {
    const runtime = resolveRuntimeBrand(branding)
    return {
      runtime,
      productName: runtime?.productName ?? brand.productName,
      clear,
    }
  }, [branding, clear])

  return <RuntimeBrandContext.Provider value={value}>{children}</RuntimeBrandContext.Provider>
}

function useRuntimeBrandContext(): RuntimeBrandContextValue {
  const context = useContext(RuntimeBrandContext)
  // Usable outside the provider (e.g. in isolated screens) — falls back to build-time.
  return context ?? { runtime: null, productName: brand.productName, clear: () => {} }
}

/** Tenant brand when one is active, else null. */
export function useRuntimeBrand(): RuntimeBrand | null {
  return useRuntimeBrandContext().runtime
}

/** Wallet name for holder-facing copy: tenant override, else build-time brand. */
export function useProductName(): string {
  return useRuntimeBrandContext().productName
}

/**
 * Accent colour for tenant-identity surfaces. Returns undefined with no tenant
 * brand, so callers keep their existing Tamagui token.
 */
export function useBrandAccent(): string | undefined {
  return useRuntimeBrandContext().runtime?.accent
}

/** Drops the cached tenant brand — call from wallet reset. */
export function useClearRuntimeBrand(): () => void {
  return useRuntimeBrandContext().clear
}
