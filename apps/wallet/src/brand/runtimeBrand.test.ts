import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { extractBrandToken, resolveRuntimeBrand, sanitizeBranding } from './runtimeBrand'

const HUB = 'https://app.skippy.id'
const TOKEN = 'abcdef0123456789abcdef0123456789'

describe('extractBrandToken', () => {
  it('accepts a wallet link on the configured hub', () => {
    assert.equal(extractBrandToken(`${HUB}/wallet?token=${TOKEN}`, HUB), TOKEN)
    assert.equal(extractBrandToken(`${HUB}/wallet/receive?token=${TOKEN}`, HUB), TOKEN)
  })

  // The token is a bearer credential, so the host check is the security boundary:
  // it must match the build-time hub, never whatever host the link names.
  it('refuses to hand the token to another host', () => {
    assert.equal(extractBrandToken(`https://evil.example/wallet?token=${TOKEN}`, HUB), null)
    assert.equal(extractBrandToken(`https://app.skippy.id.evil.com/wallet?token=${TOKEN}`, HUB), null)
    assert.equal(extractBrandToken(`https://notapp.skippy.id/wallet?token=${TOKEN}`, HUB), null)
  })

  it('refuses non-https and non-wallet links', () => {
    assert.equal(extractBrandToken(`http://app.skippy.id/wallet?token=${TOKEN}`, HUB), null)
    assert.equal(extractBrandToken(`${HUB}/admin?token=${TOKEN}`, HUB), null)
    assert.equal(extractBrandToken(`id.skippy.wallet:///wallet?token=${TOKEN}`, HUB), null)
  })

  it('rejects malformed or implausible tokens', () => {
    assert.equal(extractBrandToken(`${HUB}/wallet`, HUB), null)
    assert.equal(extractBrandToken(`${HUB}/wallet?token=abc`, HUB), null)
    assert.equal(extractBrandToken(`${HUB}/wallet?token=${'a'.repeat(20)}<script>`, HUB), null)
  })

  it('tolerates missing input', () => {
    assert.equal(extractBrandToken(null, HUB), null)
    assert.equal(extractBrandToken(`${HUB}/wallet?token=${TOKEN}`, undefined), null)
    assert.equal(extractBrandToken('not a url', HUB), null)
  })
})

describe('sanitizeBranding', () => {
  it('returns null for empty or non-object payloads', () => {
    assert.equal(sanitizeBranding(null), null)
    assert.equal(sanitizeBranding({}), null)
    assert.equal(sanitizeBranding('nope'), null)
  })

  it('keeps valid fields and drops invalid ones', () => {
    const branding = sanitizeBranding({
      appName: 'Acme',
      logos: { mark: 'https://cdn.acme.test/mark.png', horizontal: 'http://insecure.test/x.png' },
      colors: { primary: '#0F766E', secondary: 'not-a-colour' },
      walletCopy: { productName: 'Acme Wallet', claimSubtitle: 'Claim your card' },
      poweredBy: { visible: false },
      brandingVersion: 7,
    })
    assert.ok(branding)
    assert.equal(branding.logos?.mark, 'https://cdn.acme.test/mark.png')
    assert.equal(branding.logos?.horizontal, undefined, 'http logo must be dropped')
    assert.equal(branding.colors?.primary, '#0F766E')
    assert.equal(branding.colors?.secondary, undefined, 'unparseable colour must be dropped')
    assert.equal(branding.walletCopy?.productName, 'Acme Wallet')
    assert.equal(branding.poweredBy?.visible, false)
    assert.equal(branding.brandingVersion, 7)
  })

  it('drops logo URLs that are not absolute https', () => {
    assert.equal(sanitizeBranding({ logos: { mark: 'javascript:alert(1)' } }), null)
    assert.equal(sanitizeBranding({ logos: { mark: 'data:text/html,<script>' } }), null)
  })

  it('drops over-long strings', () => {
    assert.equal(sanitizeBranding({ appName: 'x'.repeat(500) }), null)
  })
})

describe('resolveRuntimeBrand', () => {
  it('returns null without branding', () => {
    assert.equal(resolveRuntimeBrand(null), null)
  })

  it('prefers walletCopy.productName over appName', () => {
    const resolved = resolveRuntimeBrand(
      sanitizeBranding({ appName: 'Acme', walletCopy: { productName: 'Acme Wallet' } })
    )
    assert.equal(resolved?.productName, 'Acme Wallet')
    assert.equal(resolveRuntimeBrand(sanitizeBranding({ appName: 'Acme' }))?.productName, 'Acme')
  })

  it('builds a theme anchored on the tenant primary', () => {
    const resolved = resolveRuntimeBrand(sanitizeBranding({ appName: 'Acme', colors: { primary: '#0F766E' } }))
    assert.equal(resolved?.theme?.['primary-500'], '#0F766E')
    assert.equal(resolved?.accent, '#0F766E')
    // With no secondary, the accent ramp stays inside the tenant's palette
    // rather than falling back to the build-time brand's accent.
    assert.ok(resolved?.theme?.['feature-500'])
  })

  it('omits the theme when no colours are configured', () => {
    assert.equal(resolveRuntimeBrand(sanitizeBranding({ appName: 'Acme' }))?.theme, undefined)
  })
})
