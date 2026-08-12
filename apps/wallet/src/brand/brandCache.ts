/**
 * Persistence for the resolved tenant brand.
 *
 * Split from runtimeBrand.ts so the parsing and validation logic stays free of
 * native imports and can be exercised outside React Native.
 */
import { mmkv } from '../storage/mmkv'
import { sanitizeBranding, type TenantBranding } from './runtimeBrand'

const CACHE_KEY = 'skippy.runtimeBrand'

interface CacheEntry {
  branding: TenantBranding
  fetchedAt: number
}

export function readCachedBranding(): TenantBranding | null {
  try {
    const raw = mmkv.getString(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    // Re-validate on read: the cache is only as trustworthy as what wrote it.
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
