'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'

function StepBadge({ step }: { step: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
    >
      {step}
    </span>
  )
}

export function NbpSetupAccountForm() {
  const router = useRouter()
  const mobileId = useId()
  const [mobileNumber, setMobileNumber] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const pinRefs = useRef<Array<HTMLInputElement | null>>([])

  const canContinue = mobileNumber.trim().length > 0 && pin.every((digit) => digit.length === 1)

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setPin((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < pin.length - 1) {
      pinRefs.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

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
          onSubmit={(e) => {
            e.preventDefault()
            if (canContinue) {
              const digits = mobileNumber.replace(/\D/g, '')
              const formatted = digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits
              router.push(`/verify-otp?mobile=${encodeURIComponent(`+92 ${formatted}`)}`)
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
            <h1 className="text-xl font-bold text-balance text-foreground">Set Up Your Account</h1>
            <p className="text-sm text-muted-foreground">Just a few more steps to get started</p>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <StepBadge step={1} />
                <h2 className="text-base font-bold text-primary">Verify Mobile Number</h2>
              </div>
              <p className="pl-[34px] text-sm text-muted-foreground">
                Enter your mobile number to receive a verification code
              </p>
            </div>

            <div className="relative">
              <span className="absolute -top-2.5 left-3 z-10 bg-card px-1 text-sm font-medium text-primary">
                Mobile Number
              </span>
              <div className="flex items-center gap-3 rounded-lg border-2 border-primary px-4 py-3">
                <div className="relative flex shrink-0 items-center gap-1">
                  <select
                    aria-label="Country code"
                    defaultValue="+92"
                    className="appearance-none bg-transparent pr-5 text-sm font-medium text-foreground outline-none"
                  >
                    <option value="+92">+92</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-0 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="h-6 w-px shrink-0 bg-border" />
                <label htmlFor={mobileId} className="sr-only">
                  Mobile number
                </label>
                <input
                  id={mobileId}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>We will send you a 6-digit verification code</span>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Step 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <StepBadge step={2} />
                <h2 className="text-base font-bold text-primary">Create 4-Digit PIN</h2>
              </div>
              <p className="pl-[34px] text-sm text-muted-foreground">
                Create a 4-digit PIN to secure your account
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    pinRefs.current[index] = el
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`PIN digit ${index + 1}`}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="size-16 rounded-lg border-2 border-primary text-center text-lg text-foreground outline-none focus:border-primary"
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>This PIN will be used to login to your account</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={!canContinue}
              className="h-12 w-full rounded-md bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </Button>

            <Button
              type="button"
              onClick={() => router.push('/')}
              variant="outline"
              className="h-12 w-full rounded-md border-2 border-primary bg-transparent text-sm font-bold uppercase tracking-wide text-primary hover:bg-accent"
            >
              Cancel
            </Button>
          </div>

          <p className="text-center text-sm text-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-bold text-primary">
              LOGIN
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
