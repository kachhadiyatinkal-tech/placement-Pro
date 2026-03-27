import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { api } from '../../services/axios'
import { useSelector } from 'react-redux'
import { Mail } from 'lucide-react'
import { toastSuccess } from '../../utils/toast'
import handleApiError from '../../utils/handleApiError'
import FormError from '../../components/FormError'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const mode = useSelector((s) => s.theme.mode);
  const validate = () => {
    if (!email?.trim()) {
      setErrors({ email: 'Email is required' })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Enter a valid email address' })
      return false
    }
    setErrors({})
    setFormError('')
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)

    try {
      await api.post('/api/v1/user/forgot-password', { email: email.trim() })
      setIsSubmitted(true)
      toastSuccess('Updated successfully')
    } catch (error) {
      const parsed = handleApiError(error)
      if (parsed.errors && Object.keys(parsed.errors).length) {
        setErrors((prev) => ({ ...prev, ...parsed.errors }))
      } else {
        setFormError(parsed.message || 'Failed to send reset link')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      // <div className="min-h-dvh px-4 py-10 transition-colors bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      //   <div className="mx-auto w-full max-w-md">
      //     <div className="flex items-center justify-end pb-4">
      //       <ThemeToggle />
      //     </div>
      //     <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
      //       <div className="text-center">
      //         <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
      //           <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      //           </svg>
      //         </div>
      //         <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
      //         <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
      //           We've sent a password reset link to <strong>{email}</strong>
      //         </p>
      //         <div className="mt-6">
      //           <Link
      //             to="/login"
      //             className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      //           >
      //             Back to login
      //           </Link>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      <div className={`min-h-dvh flex items-center justify-center px-4 py-10 transition-colors duration-500 ${
        mode === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'
      }`}>
        
        {/* Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-20 -z-10 bg-indigo-500" />
  
        <div className="mx-auto w-full max-w-md space-y-4">
          
          {/* Top Branding */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 group">
              <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-black text-xs">P</span>
              </div>
              <span className="font-black tracking-tight text-sm uppercase">Placement<span className="text-brand-500">Pro</span></span>
            </div>
            <ThemeToggle />
          </div>
  
          <div className={`rounded-[2.5rem] border p-10 shadow-2xl text-center transition-all ${
            mode === 'dark' 
              ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
              : 'border-white bg-white/80 backdrop-blur-xl shadow-indigo-900/5'
          }`}>
            
            {/* Animated Success Icon */}
            <div className="mx-auto mb-6 h-20 w-20 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center ring-8 ring-indigo-600/5">
              <svg className="h-10 w-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
  
            <h1 className="text-3xl font-black tracking-tight mb-3">Check your email</h1>
            
            <p className={`text-sm leading-relaxed ${mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              We've sent a password reset link to <br />
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>
            </p>
  
            <div className="mt-10">
              <Link
                to="/login"
                className={`group inline-flex w-full items-center justify-center rounded-2xl py-4 text-sm font-bold transition-all duration-300 border-2 active:scale-95 ${
                  mode === 'dark'
                    ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                    : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                Back to login
              </Link>
            </div>
  
            <p className="mt-8 text-xs text-zinc-500">
              Didn't receive it? Check your spam folder or <button type="button" className="font-bold text-indigo-500 hover:underline">try again</button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    // <div className="min-h-dvh px-4 py-10 transition-colors bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
    //   <div className="mx-auto w-full max-w-md">
    //     <div className="flex items-center justify-end pb-4">
    //       <ThemeToggle />
    //     </div>
    //     <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
    //       <div className="flex items-start justify-between gap-4">
    //         <div>
    //           <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
    //           <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
    //             Enter your email address and we'll send you a link to reset your password.
    //           </p>
    //         </div>
    //         <div className="rounded-2xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
    //           Placement
    //         </div>
    //       </div>

    //       <form onSubmit={onSubmit} className="mt-6 space-y-4">
    //         <div>
    //           <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
    //             Email
    //           </label>
    //           <input
    //             value={email}
    //             onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); } }
    //             type="email"
    //             className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 ${
    //               errors.email ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
    //             }`}
    //             placeholder="you@example.com"
    //           />
    //           {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
    //         </div>

    //         <button
    //           type="submit"
    //           disabled={isLoading}
    //           className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
    //         >
    //           {isLoading ? 'Sending…' : 'Send reset link'}
    //         </button>
    //       </form>

    //       <div className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
    //         Remember your password?{' '}
    //         <Link
    //           to="/login"
    //           className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
    //         >
    //           Sign in
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className={`min-h-dvh flex items-center justify-center px-4 py-10 transition-colors duration-500 ${
      mode === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'
    }`}>
      
      {/* Indigo Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-20 -z-10 bg-indigo-500" />

      <div className="mx-auto w-full max-w-md space-y-4">
        
        {/* Branding & Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-black text-xs">
              P
            </div>
            <span className="font-black tracking-tight text-sm uppercase">Placement<span className="text-brand-500">Pro</span></span>
          </div>
          <ThemeToggle />
        </div>

        <div className={`rounded-[2.5rem] border p-8 shadow-2xl transition-all ${
          mode === 'dark' 
            ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
            : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
        }`}>
          
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight leading-none">
                Reset password
              </h1>
              <p className={`text-sm ${mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                We'll send a secure link to your institutional email.
              </p>
            </div>
            <div className="rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
              Placement
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <FormError error={formError} className="mt-0" />
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest ml-1 text-zinc-500">
                Email address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                  type="email"
                  className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
                    errors.email 
                      ? 'border-red-500' 
                      : mode === 'dark' ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500' : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600'
                  }`}
                  placeholder="name@university.edu"
                />
              </div>
              <FormError error={errors.email} />
            </div>

            {/* TRANSPARENT GHOST BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-300 border-2 active:scale-95 disabled:opacity-60 ${
                mode === 'dark'
                  ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                  : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sending link...
                </span>
              ) : 'Send reset link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${mode === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}