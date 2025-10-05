/** Initialize */
import initializeGoogleAnalytics from '@/lib/analytics/google-analytics'
import initializeReactScan from '@/lib/analytics/react-scan'

/** Initialize all libraries */
async function initialize() {
  /** Initialize i18n */
  await import('@/i18n')
  /** Initialize Google Analytics */
  await initializeGoogleAnalytics()
  /** Initialize React Scan */
  await initializeReactScan()
}

export default initialize
