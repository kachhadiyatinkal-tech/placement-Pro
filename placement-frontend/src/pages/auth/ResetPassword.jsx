import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Lock } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import { api } from '../../services/axios'
import { validateMatch, validatePassword } from '../../utils/validation'
import { toastSuccess } from '../../utils/toast'
import handleApiError from '../../utils/handleApiError'
import FormError from '../../components/FormError'

export default function ResetPassword() {
  const mode = useSelector((s) => s.theme.mode)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(null)
  const [token, setToken] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      // Verify token is valid
      verifyToken(tokenFromUrl)
    } else {
      setIsValidToken(false)
    }
  }, [searchParams])

  const verifyToken = async (token) => {
    try {
      await api.post('/api/v1/user/verify-reset-token', { token })
      setIsValidToken(true)
    } catch (error) {
      const parsed = handleApiError(error)
      setFormError(parsed.message || 'Failed to verify reset token')
      setIsValidToken(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const ep = validatePassword(password)
    const ec = validatePassword(confirmPassword)
    const em = !ep && !ec ? validateMatch(password, confirmPassword, 'Passwords must match') : ''
    const next = { password: ep, confirmPassword: ec || em }
    setFieldErrors(next)
    setFormError('')
    if (Object.values(next).some(Boolean)) return

    setIsLoading(true)

    try {
      await api.post('/api/v1/user/reset-password', { token, password })
      toastSuccess('Updated successfully')
      navigate('/login')
    } catch (error) {
      const parsed = handleApiError(error)
      if (parsed.errors && Object.keys(parsed.errors).length) {
        setFieldErrors((prev) => ({ ...prev, ...parsed.errors }))
      } else {
        setFormError(parsed.message || 'Failed to reset password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      // <div className="min-h-dvh px-4 py-10 transition-colors bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      //   <div className="mx-auto w-full max-w-md">
      //     <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
      //       <div className="text-center">
      //         <div className="animate-spin mx-auto h-8 w-8 border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-50 rounded-full"></div>
      //         <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Verifying reset link...</p>
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
          
          {/* Branding (Keeps user oriented while loading) */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              P
            </div>
            <span className="font-bold tracking-tight text-xs uppercase opacity-50">PlacementPro</span>
          </div>
  
          <div className={`rounded-[2.5rem] border p-12 shadow-2xl transition-all ${
            mode === 'dark' 
              ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
              : 'border-white bg-white/80 backdrop-blur-xl shadow-indigo-900/5'
          }`}>
            <div className="text-center">
              {/* Themed Spinner */}
              <div className="relative mx-auto h-12 w-12">
                {/* Outer track */}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600/10"></div>
                {/* Spinning head */}
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600"></div>
              </div>
              
              <h2 className="mt-8 font-bold tracking-tight text-lg">
                Security Check
              </h2>
              <p className={`mt-2 text-sm font-medium ${mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Verifying reset link...
              </p>
  
              {/* Subtle progress bar hint */}
              <div className="mt-8 h-1 w-24 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-indigo-600 animate-[loading_1.5s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      // <div className="min-h-dvh px-4 py-10 transition-colors bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      //   <div className="mx-auto w-full max-w-md">
      //     <div className="flex items-center justify-end pb-4">
      //       <ThemeToggle />
      //     </div>
      //     <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
      //       <div className="text-center">
      //         <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
      //           <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      //           </svg>
      //         </div>
      //         <h1 className="text-xl font-semibold tracking-tight">Invalid reset link</h1>
      //         <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
      //           This password reset link is invalid or has expired.
      //         </p>
      //         <div className="mt-6">
      //           <a
      //             href="/forgot-password"
      //             className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      //           >
      //             Request new reset link
      //           </a>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      <div className={`min-h-dvh flex items-center justify-center px-4 py-10 transition-colors duration-500 ${mode === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'
        }`}>

        {/* Subtle Background Glow (Red tint for error state) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-[0.07] -z-10 bg-red-500" />

        <div className="mx-auto w-full max-w-md space-y-4">

          {/* Branding */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 group opacity-50">
              <div className="h-7 w-7 rounded-lg bg-zinc-400 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-bold tracking-tight text-sm uppercase">PlacementPro</span>
            </div>
            <ThemeToggle />
          </div>

          <div className={`rounded-[2.5rem] border p-10 shadow-2xl text-center transition-all ${mode === 'dark'
              ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl'
              : 'border-white bg-white/80 backdrop-blur-xl shadow-red-900/5'
            }`}>

            {/* Error Icon (Modern Squircle) */}
            <div className="mx-auto mb-6 h-20 w-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center ring-8 ring-red-500/5">
              <svg className="h-10 w-10 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-3 text-red-500 dark:text-red-400">
              Link Expired
            </h1>

            <p className={`text-sm leading-relaxed ${mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Security protocols require reset links to expire quickly. <br />
              This link is no longer valid.
            </p>

            <div className="mt-10">
              <Link
                to="/forgot-password"
                className={`group inline-flex w-full items-center justify-center rounded-2xl py-4 text-sm font-bold transition-all duration-300 border-2 active:scale-95 ${mode === 'dark'
                    ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                    : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                  }`}
              >
                Request new reset link
              </Link>
            </div>

            <div className="mt-8">
              <Link to="/login" className="text-xs font-bold text-zinc-500 hover:text-indigo-500 transition-colors uppercase tracking-widest">
                Back to Sign In
              </Link>
            </div>
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
    //           <h1 className="text-xl font-semibold tracking-tight">Set new password</h1>
    //           <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
    //             Enter your new password below.
    //           </p>
    //         </div>
    //         <div className="rounded-2xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
    //           Placement
    //         </div>
    //       </div>

    //       <form onSubmit={onSubmit} className="mt-6 space-y-4">
    //         <div>
    //           <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
    //             New Password
    //           </label>
    //           <input
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             type="password"
    //             className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
    //             placeholder="••••••••"
    //             required
    //             minLength={6}
    //           />
    //         </div>

    //         <div>
    //           <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
    //             Confirm New Password
    //           </label>
    //           <input
    //             value={confirmPassword}
    //             onChange={(e) => setConfirmPassword(e.target.value)}
    //             type="password"
    //             className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
    //             placeholder="••••••••"
    //             required
    //             minLength={6}
    //           />
    //         </div>

    //         <button
    //           type="submit"
    //           disabled={isLoading}
    //           className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
    //         >
    //           {isLoading ? 'Resetting…' : 'Reset password'}
    //         </button>
    //       </form>
    //     </div>
    //   </div>
    // </div>
    <div className={`min-h-dvh flex items-center justify-center px-4 py-10 transition-colors duration-500 ${
      mode === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'
    }`}>
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-20 -z-10 bg-indigo-500" />

      <div className="mx-auto w-full max-w-md space-y-4">
        
        {/* Top Branding / Toggle */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold tracking-tight text-sm uppercase">PlacementPro</span>
          </div>
          <ThemeToggle />
        </div>

        <div className={`rounded-[2.5rem] border p-8 shadow-2xl transition-all ${
          mode === 'dark' 
            ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
            : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
        }`}>
          
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none">Set password</h1>
              <p className={`mt-2 text-sm ${mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Create a secure password for your account.
              </p>
            </div>
            <div className="rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
              Placement
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <FormError error={formError} className="mt-0" />
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest ml-1 text-zinc-500">
                New password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors((s) => ({ ...s, password: '' }))
                  }}
                  type="password"
                  className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
                    fieldErrors.password
                      ? 'border-red-500'
                      : mode === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500'
                        : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600'
                  }`}
                  placeholder="At least 6 characters"
                />
              </div>
              <FormError error={fieldErrors.password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest ml-1 text-zinc-500">
                Confirm password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (fieldErrors.confirmPassword) setFieldErrors((s) => ({ ...s, confirmPassword: '' }))
                  }}
                  type="password"
                  className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500'
                      : mode === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500'
                        : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600'
                  }`}
                  placeholder="Re-enter new password"
                />
              </div>
              <FormError error={fieldErrors.confirmPassword} />
            </div>

            {/* TRANSPARENT GHOST BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-300 border-2 active:scale-95 disabled:opacity-60 ${
                mode === 'dark'
                  ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white shadow-lg shadow-indigo-500/10'
                  : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg shadow-indigo-600/10'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Resetting...
                </span>
              ) : 'Update Password'}
            </button>
          </form>

          <div className="mt-8 text-center">
             <Link to="/login" className="text-xs font-bold text-zinc-500 hover:text-indigo-500 transition-colors uppercase tracking-widest">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}