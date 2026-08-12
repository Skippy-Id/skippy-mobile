import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-json'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['nl', 'en', 'fi', 'sw', 'de', 'al', 'pt', 'fr'],
  format: formatter({ style: 'lingui' }),
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      // brands/ carries per-brand copy defined with defineMessage, so it has to be
      // scanned too or those strings never reach the catalogs.
      include: ['<rootDir>/src', '<rootDir>/brands', '<rootDir>/../../packages'],
      exclude: ['**/node_modules/**', 'node_modules', '<rootDir>/../../packages/**/node_modules/**'],
    },
  ],
  fallbackLocales: {
    default: 'en',
  },
})
