/** Initialize */
import initializeReactScan from '@/lib/analytics/react-scan'
import { initializeAuth } from '@/stores/authStore'

/** Initialize all libraries */
async function initialize() {
  /** Initialize i18n */
  await import('@/i18n')
  /** Initialize React Scan */
  await initializeReactScan()
  /** Initialize Auth */
  await initializeAuth()
}

export default initialize
