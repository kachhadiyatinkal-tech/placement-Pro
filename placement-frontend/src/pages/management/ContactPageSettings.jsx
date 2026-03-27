import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../../services/axios'
import { Mail, Phone, Save, RefreshCw, MapPin, Clock, MessageSquare } from 'lucide-react'
import { toast } from 'react-toastify'

const defaultForm = {
  pageTitle: 'How can we help?',
  introText: '',
  displayEmail: '',
  displayPhone: '',
  address: '',
  officeHours: '',
  testimonialQuote: '',
  testimonialAuthor: '',
}

export default function ContactPageSettings() {
  const location = useLocation()
  const isTpo = location.pathname.startsWith('/tpo')
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const inputClass =
    `mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ` +
    (isDark
      ? 'border-zinc-800 bg-zinc-900/50 text-zinc-100 focus:ring-2 focus:ring-emerald-500/30'
      : 'border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-emerald-600/20')

  const load = () => {
    setLoading(true)
    api
      .get('/api/contact/page')
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          ...data,
          pageTitle: data.pageTitle ?? f.pageTitle,
          introText: data.introText ?? f.introText,
          displayEmail: data.displayEmail ?? f.displayEmail,
          displayPhone: data.displayPhone ?? f.displayPhone,
          address: data.address ?? '',
          officeHours: data.officeHours ?? '',
          testimonialQuote: data.testimonialQuote ?? f.testimonialQuote,
          testimonialAuthor: data.testimonialAuthor ?? f.testimonialAuthor,
        }))
      })
      .catch(() => toast.error('Could not load contact page settings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    delete payload._id
    delete payload.__v
    delete payload.createdAt
    delete payload.updatedAt
    api
      .put('/api/contact/page', payload)
      .then(({ data }) => {
        setForm((f) => ({ ...f, ...data }))
        toast.success('Contact page saved.')
      })
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div>
        <div className="mb-2 inline-block rounded-xl border border-emerald-600/20 bg-emerald-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          {isTpo ? 'TPO' : 'Admin'} · Campus content
        </div>
        <h1 className="text-3xl font-black tracking-tight text-app uppercase">
          Contact <span className="text-brand-500">Page</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          These details appear on the public <span className="font-semibold text-zinc-700 dark:text-zinc-300">/contact</span>{' '}
          page (sidebar, email, phone, and testimonial). Students and visitors see updates immediately.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div
            className={`rounded-3xl border p-6 shadow-sm ${
              isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-200 bg-white'
            }`}
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-500">
              <MessageSquare /> Headlines
            </h2>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Page title
            </label>
            <input className={inputClass} value={form.pageTitle} onChange={(e) => setField('pageTitle', e.target.value)} />
            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Intro paragraph
            </label>
            <textarea
              rows={3}
              className={inputClass}
              value={form.introText}
              onChange={(e) => setField('introText', e.target.value)}
            />
          </div>

          <div
            className={`rounded-3xl border p-6 shadow-sm ${
              isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-200 bg-white'
            }`}
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-500">
              <Mail /> Contact details (public)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Display email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.displayEmail}
                  onChange={(e) => setField('displayEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Display phone</label>
                <input
                  className={inputClass}
                  value={form.displayPhone}
                  onChange={(e) => setField('displayPhone', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <MapPin className="inline" /> Address (optional)
              </label>
              <textarea
                rows={2}
                className={inputClass}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Clock className="inline" /> Office hours (optional)
              </label>
              <input
                className={inputClass}
                value={form.officeHours}
                onChange={(e) => setField('officeHours', e.target.value)}
                placeholder="Mon–Fri, 9:00–17:00"
              />
            </div>
          </div>

          <div
            className={`rounded-3xl border p-6 shadow-sm ${
              isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-200 bg-white'
            }`}
          >
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-zinc-500">Sidebar testimonial</h2>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Quote</label>
            <textarea
              rows={3}
              className={inputClass}
              value={form.testimonialQuote}
              onChange={(e) => setField('testimonialQuote', e.target.value)}
            />
            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">Attribution</label>
            <input
              className={inputClass}
              value={form.testimonialAuthor}
              onChange={(e) => setField('testimonialAuthor', e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save /> {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={load}
              className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold ${
                isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <RefreshCw /> Reload
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
