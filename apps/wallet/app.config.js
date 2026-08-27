import { createBaseConfig } from './base.app.config'
import { getBrandConfig } from './brands/configs.js'
import { version } from './package.json'

// Which brand to build. Same variable the app bundle reads (brands/current.ts);
// EXPO_PUBLIC_ so it is inlined there too. Switching brands needs `expo start -c`.
const brandName = process.env.EXPO_PUBLIC_APP_BRAND ?? 'skippy'

const config = createBaseConfig({
  ...getBrandConfig(brandName),
  version,
})

export default () => config
