import { env } from '@/lib/env'

/** Initialize Google Analytics */
async function initialize() {
  const trackingId = env.GA_TRACKING_ID

  if (!trackingId) {
    return
  }

  const { default: ReactGA } = await import('react-ga4')

  /** Initialize Google Analytics */
  ReactGA.initialize(trackingId, {
    gaOptions: {
      cookieFlags: 'max-age=7200;SameSite=None;Secure',
    },
  })

  console.log('Google Analytics initialized')
}

export default initialize

/**
 * TODO: Add event tracking
 * TODO: Add page view tracking
 */
