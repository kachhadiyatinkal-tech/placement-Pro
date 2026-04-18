import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Mail, Shield, Save, Power, Server, Hash, Activity, RefreshCw } from 'lucide-react'
import { api } from '../../services/axios'
import { toastSuccess, toastError } from '../../utils/toast'
import FormError from '../../components/FormError'

const inputClass = (isDark) =>
  `w-full rounded-2xl border px-10 py-3.5 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
    isDark 
      ? 'border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500' 
      : 'border-zinc-100 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600'
  }`

export default function AdminSmtpSettings() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    isEnabled: true
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/v1/management/smtp-config')
      if (res.data?.data) {
        setConfig(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch SMTP config:', error)
      toastError('Failed to load SMTP settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setFormError('')

    try {
      await api.post('/api/v1/management/update-smtp-config', config)
      toastSuccess('SMTP configuration updated successfully')
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Failed to update configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Activity size={12} /> System Infrastructure
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none text-app">Email <span className="text-brand-500">Gateway</span></h1>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full ${config.isEnabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status:</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{config.isEnabled ? 'Live' : 'Stopped'}</span>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="border-b border-zinc-100 px-8 py-5 dark:border-zinc-800/50 flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">SMTP Core Configuration</p>
           {config.updatedAt && (
             <p className="text-[9px] font-bold uppercase text-zinc-500">Last updated: {new Date(config.updatedAt).toLocaleString()}</p>
           )}
        </div>

        <div className="p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
            <FormError error={formError} />

            {/* Feature Toggle Block */}
            <div className={`group flex items-center justify-between rounded-3xl border p-6 transition-all ${
              config.isEnabled 
                ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100')
                : (isDark ? 'bg-zinc-800/20 border-zinc-800' : 'bg-zinc-50 border-zinc-100')
            }`}>
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                  config.isEnabled 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-zinc-500/10 text-zinc-500'
                }`}>
                  <Power className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Outgoing Email Service</p>
                  <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Global switch for system notifications and reset links.</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  name="isEnabled"
                  checked={config.isEnabled}
                  onChange={handleChange}
                  className="peer sr-only" 
                />
                <div className="peer h-8 w-14 rounded-full bg-zinc-200 after:absolute after:start-[4px] after:top-[4px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-6 dark:bg-zinc-800" />
              </label>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* SMTP Host */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">SMTP Host Connection</label>
                <div className="relative">
                  <Server className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
                  <input
                    name="host"
                    value={config.host}
                    onChange={handleChange}
                    className={inputClass(isDark)}
                    placeholder="e.g. smtp.gmail.com"
                  />
                </div>
              </div>

              {/* SMTP Port */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Service Port</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="port"
                    type="number"
                    value={config.port}
                    onChange={handleChange}
                    className={inputClass(isDark)}
                    placeholder="587"
                  />
                </div>
              </div>

              {/* SMTP User */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Authentication User</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="user"
                    value={config.user}
                    onChange={handleChange}
                    className={inputClass(isDark)}
                    placeholder="authorized@email.com"
                  />
                </div>
              </div>

              {/* SMTP Password */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Secret / App Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="pass"
                    type="password"
                    value={config.pass}
                    onChange={handleChange}
                    className={inputClass(isDark)}
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-4">
              <label className="group flex items-center gap-4 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    name="secure"
                    checked={config.secure}
                    onChange={handleChange}
                    className="peer sr-only" 
                  />
                  <div className={`h-6 w-6 rounded-lg border-2 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`} />
                  <Save className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-80 group-hover:text-brand-500 transition-colors">Apply SSL/TLS Secure Bridge</p>
                  <p className="text-[9px] font-bold uppercase opacity-40 mt-0.5">Required for port 465 or certain security protocols.</p>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl dark:bg-zinc-50 dark:text-zinc-950 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Syncing...' : 'Update Infrastructure'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Info Block */}
      <div className={`rounded-3xl border p-8 transition-all ${isDark ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-app">Security Advisory</h4>
            <p className="mt-2 text-[10px] font-bold leading-relaxed text-muted opacity-60 uppercase tracking-widest max-w-2xl">
              Changes to SMTP settings involve critical system connectivity. Improper configuration may interrupt password resets and account activation flows. It is recommended to test your credentials using a developer test script before applying global changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
