/**
 * Which brand this bundle was built for.
 *
 * Must be `EXPO_PUBLIC_`-prefixed: only those are inlined into the app bundle by
 * babel-preset-expo. app.config.js reads the same variable from the Node process.
 * Changing it requires a Metro cache reset (`expo start -c`).
 */
export const APP_BRAND = process.env.EXPO_PUBLIC_APP_BRAND ?? 'skippy'
