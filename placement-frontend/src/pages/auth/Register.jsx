import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { companyRegister, studentRegister } from '../../features/auth/authSlice'
import ThemeToggle from '../../components/ThemeToggle'
import { validateEmail, validatePassword, validateRequired, validatePhoneRequired } from '../../utils/validation'
import { Briefcase, Lock, Mail, MapPin, Phone, User, ChevronRight, Globe } from 'lucide-react'
import FormError from '../../components/FormError'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector((s) => s.auth.status)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const isLoading = status === 'loading'

  const [kind, setKind] = useState('student')

  const [studentForm, setStudentForm] = useState({
    first_name: '',
    email: '',
    number: '',
    password: '',
  })
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    email: '',
    password: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: '',
    companyDifficulty: 'Moderate',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const handleStudentChange = (field) => (e) => {
    const v = e.target.value
    setStudentForm((s) => ({ ...s, [field]: v }))
    if (formError) setFormError('')
    if (errors[field]) setErrors((s) => ({ ...s, [field]: '' }))
  }

  const handleCompanyChange = (field) => (e) => {
    const v = e.target.value
    setCompanyForm((s) => ({ ...s, [field]: v }))
    if (formError) setFormError('')
    if (errors[field]) setErrors((s) => ({ ...s, [field]: '' }))
  }

  const validateStudent = () => {
    const e = {}
    e.first_name = validateRequired(studentForm.first_name, 'Name')
    e.email = validateEmail(studentForm.email)
    e.number = validatePhoneRequired(studentForm.number)
    e.password = validatePassword(studentForm.password)
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const validateCompany = () => {
    const e = {}
    e.companyName = validateRequired(companyForm.companyName, 'Company name')
    e.email = validateEmail(companyForm.email)
    e.password = validatePassword(companyForm.password)
    e.companyWebsite = validateRequired(companyForm.companyWebsite, 'Website')
    e.companyLocation = validateRequired(companyForm.companyLocation, 'Location')
    e.companyDescription = validateRequired(companyForm.companyDescription, 'About the company')
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (kind === 'student') {
      if (!validateStudent()) return
      const res = await dispatch(
        studentRegister({
          first_name: studentForm.first_name.trim(),
          email: studentForm.email.trim(),
          number: Number(String(studentForm.number).replace(/\D/g, '')),
          password: studentForm.password,
        }),
      )
      if (res.meta.requestStatus !== 'fulfilled') {
        const apiErrors = res?.payload?.errors
        if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length) {
          setErrors((prev) => ({ ...prev, ...apiErrors }))
        } else {
          setFormError(res?.payload?.message || res?.payload?.msg || 'Registration failed')
        }
        return
      }
      navigate('/login', { replace: true })
      return
    }

    if (!validateCompany()) return
    const res = await dispatch(
      companyRegister({
        companyName: companyForm.companyName.trim(),
        email: companyForm.email.trim(),
        password: companyForm.password,
        companyWebsite: companyForm.companyWebsite.trim(),
        companyLocation: companyForm.companyLocation.trim(),
        companyDescription: companyForm.companyDescription.trim(),
        companyDifficulty: companyForm.companyDifficulty || 'Moderate',
      }),
    )
    if (res.meta.requestStatus !== 'fulfilled') {
      const apiErrors = res?.payload?.errors
      if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length) {
        setErrors((prev) => ({ ...prev, ...apiErrors }))
      } else {
        setFormError(res?.payload?.message || res?.payload?.msg || 'Registration failed')
      }
      return
    }
    navigate('/login', { replace: true })
  }

  const surface = isDark
    ? 'border-zinc-800 bg-zinc-900/60 backdrop-blur-xl'
    : 'border-white/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-zinc-200/40'

  const inputClass = (name, extra = '') =>
    `w-full rounded-2xl border pl-11 pr-4 py-3.5 text-[15px] leading-snug outline-none transition-all focus:ring-4 focus:ring-indigo-500/15 ${
      errors[name]
        ? 'border-red-500'
        : isDark
          ? 'border-zinc-800 bg-zinc-950 text-zinc-100 focus:border-indigo-500'
          : 'border-zinc-200 bg-zinc-50 text-zinc-900 focus:border-indigo-600'
    } ${extra}`

  return (
    <div
      className={`relative min-h-dvh flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-gradient-to-b from-slate-50 to-indigo-50/40 text-zinc-900'
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 -z-10 ${isDark ? 'opacity-30' : 'opacity-40'}`} aria-hidden>
        <div className="absolute top-20 right-0 h-64 w-64 rounded-full bg-violet-500 blur-[100px]" />
        <div className="absolute bottom-32 left-0 h-56 w-56 rounded-full bg-indigo-500 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-white shadow-lg shadow-brand-500/25">
              P
            </div>
            <span className="text-sm font-black tracking-tight uppercase">
              Placement<span className="text-brand-500">Pro</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className={`rounded-[2rem] border p-8 sm:p-10 ${surface}`}>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Create account</h1>
          <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Register as a student or as a recruiting company.
          </p>

          <div
            className={`mt-8 grid grid-cols-2 gap-2 rounded-2xl p-1.5 ${isDark ? 'bg-zinc-950/80' : 'bg-zinc-100/90'}`}
          >
            <button
              type="button"
              onClick={() => {
                setKind('student')
                setErrors({})
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                kind === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                    ? 'text-zinc-400 hover:bg-zinc-900'
                    : 'text-zinc-600 hover:bg-white'
              }`}
            >
              <User className="text-sm" />
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setKind('company')
                setErrors({})
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                kind === 'company'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                    ? 'text-zinc-400 hover:bg-zinc-900'
                    : 'text-zinc-600 hover:bg-white'
              }`}
            >
              <Briefcase className="text-sm" />
              Company
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <FormError error={formError} className="mt-0" />
            {kind === 'student' ? (
              <>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Full name *
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={studentForm.first_name}
                      onChange={handleStudentChange('first_name')}
                      className={inputClass('first_name')}
                      placeholder="Your name"
                    />
                  </div>
                  <FormError error={errors.first_name} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Email *
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={studentForm.email}
                      onChange={handleStudentChange('email')}
                      type="email"
                      className={inputClass('email')}
                      placeholder="you@university.edu"
                    />
                  </div>
                  <FormError error={errors.email} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Phone *
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={studentForm.number}
                      onChange={handleStudentChange('number')}
                      type="tel"
                      className={inputClass('number', 'pl-11')}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <FormError error={errors.number} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={studentForm.password}
                      onChange={handleStudentChange('password')}
                      type="password"
                      className={inputClass('password')}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <FormError error={errors.password} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Company name *
                  </label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={companyForm.companyName}
                      onChange={handleCompanyChange('companyName')}
                      className={inputClass('companyName')}
                      placeholder="Acme Technologies"
                    />
                  </div>
                  <FormError error={errors.companyName} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Work email *
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={companyForm.email}
                      onChange={handleCompanyChange('email')}
                      type="email"
                      className={inputClass('email')}
                      placeholder="hr@company.com"
                    />
                  </div>
                  <FormError error={errors.email} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={companyForm.password}
                      onChange={handleCompanyChange('password')}
                      type="password"
                      className={inputClass('password')}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <FormError error={errors.password} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Website *
                  </label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={companyForm.companyWebsite}
                      onChange={handleCompanyChange('companyWebsite')}
                      className={inputClass('companyWebsite', 'pl-11')}
                      placeholder="https://company.com"
                    />
                  </div>
                  <FormError error={errors.companyWebsite} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Location *
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={companyForm.companyLocation}
                      onChange={handleCompanyChange('companyLocation')}
                      className={inputClass('companyLocation', 'pl-11')}
                      placeholder="City, state or country"
                    />
                  </div>
                  <FormError error={errors.companyLocation} />
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Hiring difficulty *
                  </label>
                  <select
                    value={companyForm.companyDifficulty}
                    onChange={handleCompanyChange('companyDifficulty')}
                    className={`${inputClass('companyDifficulty', 'pl-4')} appearance-none`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    About *
                  </label>
                  <textarea
                    value={companyForm.companyDescription}
                    onChange={handleCompanyChange('companyDescription')}
                    rows={3}
                    className={`${inputClass('companyDescription', 'min-h-[88px] resize-none pl-4')}`}
                    placeholder="What does your company do? (2–4 sentences)"
                  />
                  <FormError error={errors.companyDescription} />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white transition-all active:scale-[0.99] disabled:opacity-60 ${
                isDark ? 'bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating…
                </span>
              ) : (
                <>
                  Create account
                  <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className={`mt-8 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
