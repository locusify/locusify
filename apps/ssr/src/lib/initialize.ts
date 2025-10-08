/** Initialize */
import initializeGoogleAnalytics from '@/lib/analytics/google-analytics'
import initializeReactScan from '@/lib/analytics/react-scan'

/** Initialize all libraries */
async function initialize() {
  /** Initialize Google Analytics */
  await initializeGoogleAnalytics()
  /** Initialize React Scan */
  await initializeReactScan()
}

export default initialize
