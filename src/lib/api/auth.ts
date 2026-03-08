import { apiClient } from './client'

interface OtpVerifyResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: { id: string, email: string }
}

export function sendOtp(email: string) {
  return apiClient.post<{ message: string }>('/auth/otp', { email })
}

export function verifyOtp(email: string, token: string) {
  return apiClient.post<OtpVerifyResponse>('/auth/otp/verify', { email, token })
}
