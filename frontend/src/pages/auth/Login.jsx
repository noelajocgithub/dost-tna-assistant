import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    setServerError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Login failed. Please try again.'
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-10 w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-xl bg-white p-2 shadow-sm">
            <img src="/dost-logo.svg" alt="DOST" className="w-full h-full" />
          </span>
          <h1 className="text-2xl font-bold text-primary">
            TNA Collection System
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Technology Needs Assessment — Form 01
          </p>
        </div>

        {serverError && (
          <div className="mb-4 border border-red-300 bg-red-50/80 text-red-700 text-sm px-3 py-2 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="you@dost.gov.ph"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in…' : 'Log In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
