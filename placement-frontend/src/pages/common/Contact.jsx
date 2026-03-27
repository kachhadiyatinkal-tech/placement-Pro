import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Send, Mail, Phone } from 'lucide-react'
import { api } from '../../services/axios'
import { toast } from 'react-toastify'

const fallbackPage = {
  pageTitle: 'How can we help?',
  introText:
    'Have questions about the placement process? Send us a message and our team will respond within 24 hours.',
  displayEmail: 'support@placementpro.com',
  displayPhone: '+1 (555) 000-0000',
  address: '',
  officeHours: '',
  testimonialQuote:
    'The support team was incredibly helpful in resolving my profile verification issues!',
  testimonialAuthor: '— Student, CS Dept',
}

export const Contact = () => {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [page, setPage] = useState(fallbackPage)
  const [pageLoading, setPageLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get('/api/contact/page')
      .then(({ data }) => {
        setPage((p) => ({
          ...p,
          ...data,
          pageTitle: data.pageTitle || p.pageTitle,
          introText: data.introText || p.introText,
          displayEmail: data.displayEmail || p.displayEmail,
          displayPhone: data.displayPhone || p.displayPhone,
          testimonialQuote: data.testimonialQuote || p.testimonialQuote,
          testimonialAuthor: data.testimonialAuthor || p.testimonialAuthor,
        }))
      })
      .catch(() => {})
      .finally(() => setPageLoading(false))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) {
      e.email = 'Email required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Invalid email'
    }
    const digits = form.phone.replace(/\D/g, '')
    if (!digits) {
      e.phone = 'Phone required'
    } else if (digits.length !== 10) {
      e.phone = 'Enter a valid 10-digit phone'
    }
    if (!form.subject.trim()) e.subject = 'Subject required'
    if (!form.message.trim()) {
      e.message = 'Message required'
    } else if (form.message.length < 10) {
      e.message = 'Minimum 10 characters'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post('/api/contact/inquiry', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ''),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setErrors({})
    } catch {
      /* toast from axios interceptor */
    } finally {
      setSubmitting(false)
    }
  }

  const inputWrapper = 'space-y-1.5 flex-1'
  const labelStyle = 'text-xs font-bold uppercase tracking-widest ml-1 text-zinc-500'
  const fieldClass = (key) =>
    `w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
      errors[key]
        ? 'border-red-500 bg-red-500/5 focus:border-red-500 dark:bg-red-950/20'
        : isDark
          ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500 text-zinc-100'
          : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600 text-zinc-900'
    }`
  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((er) => {
      if (!er[key]) return er
      const next = { ...er }
      delete next[key]
      return next
    })
  }

  const phoneDigits = (raw) => raw.replace(/\D/g, '').slice(0, 10)

  return (
    <div
      className={`relative flex min-h-dvh items-center justify-center px-4 py-20 transition-colors duration-500 ${
        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'
      }`}
    >
      <div className="absolute left-1/2 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 bg-indigo-500 opacity-20 blur-[120px]" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-xl border border-indigo-600/20 bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Contact Us
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            {pageLoading ? '…' : page.pageTitle}
          </h1>
          <p className={`mx-auto max-w-md text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {page.introText}
          </p>
        </div>

        <div
          className={`grid gap-0 overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all md:grid-cols-5 ${
            isDark
              ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl'
              : 'border-white bg-white/80 shadow-zinc-200/50 backdrop-blur-xl'
          }`}
        >
          <div className="relative flex flex-col justify-between overflow-hidden bg-blue-900 p-10 text-white md:col-span-2">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <h3 className="mb-8 text-2xl font-black tracking-tight">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                    <Mail className="text-xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Email us</p>
                    <p className="font-bold">{page.displayEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                    <Phone className="text-xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Call us</p>
                    <p className="font-bold">{page.displayPhone}</p>
                  </div>
                </div>
                {page.address ? (
                  <p className="text-sm leading-relaxed text-white/90 whitespace-pre-line">{page.address}</p>
                ) : null}
                {page.officeHours ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{page.officeHours}</p>
                ) : null}
              </div>
            </div>

            <div className="relative z-10 mt-12 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm font-medium italic opacity-90">&ldquo;{page.testimonialQuote}&rdquo;</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                {page.testimonialAuthor}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-8 md:col-span-3 md:p-12">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className={inputWrapper}>
                <label className={labelStyle}>Full name *</label>
                <input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={fieldClass('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className={inputWrapper}>
                <label className={labelStyle}>Phone *</label>
                <input
                  placeholder="10-digit number"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setField('phone', phoneDigits(e.target.value))}
                  className={fieldClass('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className={inputWrapper}>
              <label className={labelStyle}>Email *</label>
              <input
                placeholder="john@university.edu"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={fieldClass('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className={inputWrapper}>
              <label className={labelStyle}>Subject *</label>
              <input
                placeholder="Topic of inquiry"
                value={form.subject}
                onChange={(e) => setField('subject', e.target.value)}
                className={fieldClass('subject')}
              />
              {errors.subject && (
                <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-red-500">
                  {errors.subject}
                </p>
              )}
            </div>

            <div className={inputWrapper}>
              <label className={labelStyle}>Message *</label>
              <textarea
                rows="4"
                placeholder="Tell us more (at least 10 characters)..."
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                className={`${fieldClass('message')} resize-none`}
              />
              {errors.message && (
                <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-red-500">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`group flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-4 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 ${
                isDark
                  ? 'border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10 hover:bg-indigo-500 hover:text-white'
                  : 'border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-600/10 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {submitting ? 'Sending…' : 'Send Message'}
              <Send className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
