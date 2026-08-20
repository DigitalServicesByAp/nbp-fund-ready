import { Suspense } from 'react'

import { NbpVerifyOtpForm } from '@/components/nbp-verify-otp-form'

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <NbpVerifyOtpForm />
    </Suspense>
  )
}
