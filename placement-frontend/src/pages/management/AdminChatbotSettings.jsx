import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../services/axios'
import { MessageCircle, RefreshCw, Save, Shield, Layout, Type, Eye, CheckCircle } from 'lucide-react'

const defaultForm = {
  title: 'Placement Assistant',
  chatbotIcon: '/chatbot-placement-bot.svg',
  welcomeMessage: '',
  primaryColor: '#059669',
  secondaryColor: '#0d9488',
  chatBgColor: '#f4f4f5',
  launcherSize: 56,
  panelWidth: 320,
  panelHeight: 420,
  launcherPosition: 'right-bottom',
  positionBottom: 20,
  positionRight: 20,
  positionLeft: 20,
  positionTop: 20,
  inputPlaceholder: 'Type a message…',
  thinkingLabel: 'Thinking…',
  widgetEnabled: true,
}

const LAUNCHER_OPTIONS = [
  { value: 'right-bottom', label: 'Right — bottom' },
  { value: 'right-middle', label: 'Right — middle' },
  { value: 'right-top', label: 'Right — top' },
  { value: 'left-bottom', label: 'Left — bottom' },
  { value: 'left-middle', label: 'Left — middle' },
  { value: 'left-top', label: 'Left — top' },
  { value: 'center', label: 'Center (screen)' },
]

const AVATAR_OPTIONS = [
  { value: '/chatbot-placement-bot.svg', label: 'Chat Bubble' },
  { value: '/avatar-robot.svg', label: 'Robot' },
  { value: '/avatar-headset.svg', label: 'Headset Agent' },
  { value: '/avatar-sparkle.svg', label: 'AI Sparkle' },
  { value: '/avatar-briefcase.svg', label: 'Briefcase' },
  { value: '/avatar-graduation.svg', label: 'Graduation' },
]

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '')
  const valid = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const big = Number.parseInt(valid, 16)
  if (Number.isNaN(big)) return [5, 150, 105]
  return [(big >> 16) & 255, (big >> 8) & 255, big & 255]
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixHex(a, b, weight = 0.5) {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex(ar + (br - ar) * w, ag + (bg - ag) * w, ab + (bb - ab) * w)
}

export default function AdminChatbotSettings() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const inputClass = (err) =>
    `mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200 ${isDark
      ? `bg-zinc-900/50 focus:ring-2 focus:ring-indigo-500/40 ${err ? 'border-red-500' : 'border-zinc-800'} text-zinc-100`
      : `bg-white focus:ring-2 focus:ring-indigo-600/20 ${err ? 'border-red-500' : 'border-zinc-200'} text-zinc-900`
    }`

  const load = () => {
    setLoading(true)
    setError('')
    api
      .get('/api/chatbot/settings')
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          ...data,
          title: data.title ?? f.title,
          chatbotIcon: data.chatbotIcon ?? f.chatbotIcon,
          welcomeMessage: data.welcomeMessage ?? f.welcomeMessage,
          primaryColor: data.primaryColor ?? f.primaryColor,
          secondaryColor: data.secondaryColor ?? f.secondaryColor,
          chatBgColor: data.chatBgColor ?? f.chatBgColor,
          launcherSize: data.launcherSize ?? f.launcherSize,
          panelWidth: data.panelWidth ?? f.panelWidth,
          panelHeight: data.panelHeight ?? f.panelHeight,
          launcherPosition: data.launcherPosition ?? f.launcherPosition,
          positionBottom: data.positionBottom ?? f.positionBottom,
          positionRight: data.positionRight ?? f.positionRight,
          positionLeft: data.positionLeft ?? f.positionLeft,
          positionTop: data.positionTop ?? f.positionTop,
          inputPlaceholder: data.inputPlaceholder ?? f.inputPlaceholder,
          thinkingLabel: data.thinkingLabel ?? f.thinkingLabel,
          widgetEnabled: data.widgetEnabled !== false,
        }))
      })
      .catch(() => setError('Could not load settings. Check that the backend is running.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setShowSuccess(false)
    const payload = { ...form }
    delete payload._id
    delete payload.__v
    delete payload.createdAt
    delete payload.updatedAt
    api
      .put('/api/chatbot/settings', payload)
      .then(({ data }) => {
        setForm((f) => ({ ...f, ...data }))
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Save failed.')
      })
      .finally(() => setSaving(false))
  }

  const primary = form.primaryColor || '#059669'
  const secondary = form.secondaryColor || '#0d9488'
  const blend = mixHex(primary, secondary, 0.5)
  const chatBg = form.chatBgColor || '#f4f4f5'

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6 px-4">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            <Shield size={12} /> System Admin
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Assistant <span className="text-indigo-600">Configuration</span>
          </h1>
          <p className="max-w-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Customize your AI assistant's personality and appearance. Changes are synchronized across all user dashboards instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            form="chatbot-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" /> : <Save />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle /> Settings updated successfully!
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 p-20 text-center animate-pulse dark:border-zinc-700">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Engine...</span>
            </div>
          ) : (
            <form id="chatbot-form" onSubmit={handleSave} className="space-y-6">
              {/* Visibility Card */}
              <div className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <Eye /> Status
                </h2>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/50">
                  <div className="space-y-0.5">
                    <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">Active Mode</span>
                    <span className="block text-[11px] text-zinc-500">Toggle the visibility of the widget site-wide</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.widgetEnabled}
                    onChange={(e) => setForm((f) => ({ ...f, widgetEnabled: e.target.checked }))}
                    className="h-6 w-6 rounded-lg border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              {/* Branding Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <MessageCircle /> Visual Branding
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Assistant Name</label>
                    <input
                      className={inputClass()}
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Bot Avatar</label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, chatbotIcon: av.value }))}
                          className={`relative group flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all duration-200 hover:scale-105 ${form.chatbotIcon === av.value
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20 dark:bg-indigo-950/30'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900'
                            }`}
                        >
                          <img src={av.value} alt={av.label} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                          <span className={`text-[9px] font-bold uppercase tracking-wide ${form.chatbotIcon === av.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
                            }`}>{av.label}</span>
                          {form.chatbotIcon === av.value && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow">
                              <CheckCircle size={12} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="text-[9px] font-bold text-zinc-400 ml-1">Or paste custom URL</label>
                      <input
                        className={inputClass()}
                        type="url"
                        placeholder="https://example.com/avatar.svg"
                        value={AVATAR_OPTIONS.some(a => a.value === form.chatbotIcon) ? '' : form.chatbotIcon}
                        onChange={(e) => setForm((f) => ({ ...f, chatbotIcon: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Primary Brand Color</label>
                      <div className="flex gap-2">
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="color"
                            value={primary}
                            onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                            className="absolute -inset-2 h-14 w-16 cursor-pointer"
                          />
                        </div>
                        <input
                          className={inputClass()}
                          value={form.primaryColor}
                          onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Accent Color</label>
                      <div className="flex gap-2">
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="color"
                            value={secondary}
                            onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                            className="absolute -inset-2 h-14 w-16 cursor-pointer"
                          />
                        </div>
                        <input
                          className={inputClass()}
                          value={form.secondaryColor}
                          onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy/Messages Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <Type /> Conversation Copy
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Welcome Message</label>
                    <textarea
                      className={`${inputClass()} min-h-[120px] resize-none font-medium leading-relaxed pt-3`}
                      value={form.welcomeMessage}
                      onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))}
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Input Placeholder</label>
                    <input
                      className={inputClass()}
                      value={form.inputPlaceholder}
                      onChange={(e) => setForm((f) => ({ ...f, inputPlaceholder: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Layout Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <Layout /> Dimensions &amp; position
                </h2>
                <div className="mb-6 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                    Launcher anchor
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Preset corner or center. Use gap fields below for pixel offsets from screen edges.
                  </p>
                  <select
                    className={inputClass()}
                    value={form.launcherPosition || 'right-bottom'}
                    onChange={(e) => setForm((f) => ({ ...f, launcherPosition: e.target.value }))}
                  >
                    {LAUNCHER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Launcher (px)</label>
                    <input type="number" min={48} max={80} className={inputClass()} value={form.launcherSize} onChange={(e) => setForm((f) => ({ ...f, launcherSize: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Panel width (px)</label>
                    <input type="number" min={280} max={480} className={inputClass()} value={form.panelWidth} onChange={(e) => setForm((f) => ({ ...f, panelWidth: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Panel height (px)</label>
                    <input type="number" min={320} max={640} className={inputClass()} value={form.panelHeight} onChange={(e) => setForm((f) => ({ ...f, panelHeight: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Gap from bottom</label>
                    <input type="number" min={8} max={64} className={inputClass()} value={form.positionBottom} onChange={(e) => setForm((f) => ({ ...f, positionBottom: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Gap from right</label>
                    <input type="number" min={8} max={64} className={inputClass()} value={form.positionRight} onChange={(e) => setForm((f) => ({ ...f, positionRight: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">Gap from left</label>
                    <input type="number" min={8} max={64} className={inputClass()} value={form.positionLeft} onChange={(e) => setForm((f) => ({ ...f, positionLeft: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-400">Gap from top</label>
                    <input type="number" min={8} max={64} className={inputClass()} value={form.positionTop} onChange={(e) => setForm((f) => ({ ...f, positionTop: Number(e.target.value) }))} />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 dark:border-zinc-700 dark:bg-zinc-950/20">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Interactive Preview</h3>
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>

              {/* The "Real" Mockup */}
              <div
                className="mx-auto overflow-hidden rounded-[28px] shadow-2xl transition-all duration-500"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '460px',
                  border: `1.5px solid ${primary}30`,
                  background: `linear-gradient(180deg, #ffffff 0%, ${chatBg} 72%, ${mixHex(chatBg, primary, 0.08)} 100%)`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header with avatar */}
                <div
                  className="relative flex items-center justify-between overflow-hidden px-4 py-3.5 text-white"
                  style={{
                    background: `linear-gradient(120deg, ${primary} 0%, ${blend} 55%, ${secondary} 100%)`,
                    borderRadius: '28px 28px 0 0'
                  }}
                >
                  <div className="pointer-events-none absolute right-[-24px] top-[-32px] h-20 w-20 rounded-full blur-xl" style={{ background: `${secondary}66` }} />
                  <div className="pointer-events-none absolute left-[-22px] bottom-[-42px] h-24 w-24 rounded-full blur-xl" style={{ background: `${primary}4d` }} />
                  <svg className="pointer-events-none absolute bottom-0 left-0 h-6 w-full opacity-35" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0,30 C70,52 125,5 200,22 C265,38 315,52 400,20 L400,48 L0,48 Z" fill="rgba(255,255,255,0.55)" />
                  </svg>
                  <svg className="pointer-events-none absolute bottom-0 left-0 h-5 w-full opacity-25" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0,22 C58,8 128,42 198,26 C266,10 333,8 400,28 L400,48 L0,48 Z" fill="rgba(255,255,255,0.35)" />
                  </svg>
                  <svg className="pointer-events-none absolute bottom-0 left-0 h-4 w-full opacity-20" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0,18 C66,35 120,8 190,18 C272,32 320,42 400,24 L400,48 L0,48 Z" fill="rgba(255,255,255,0.28)" />
                  </svg>
                  <div className="flex items-center gap-3">
                    <img key={`prev-hdr-${form.chatbotIcon}`} src={form.chatbotIcon || '/chatbot-placement-bot.svg'} alt="" className="h-10 w-10 rounded-full shadow-lg ring-[3px] ring-white/50 object-cover" />
                    <span className="text-sm font-bold tracking-wide truncate max-w-[130px]">{form.title || 'Assistant'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <span className="text-sm">⬇</span>
                    <span className="text-base">ˬ</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ background: `linear-gradient(180deg, ${mixHex(chatBg, '#ffffff', 0.08)} 0%, ${mixHex(chatBg, primary, 0.12)} 100%)` }}>
                  {/* Bot message with avatar at bottom */}
                  <div className="flex justify-start">
                    <div className="flex flex-col items-start max-w-[82%]">
                      <div className="rounded-2xl rounded-bl-sm p-3 text-[11px] bg-white shadow-sm" style={{ border: `1px solid ${primary}20`, color: '#334155' }}>
                        {form.welcomeMessage || 'Welcome message will appear here...'}
                      </div>
                      <div className="mt-1 ml-1 flex items-center gap-1.5">
                        <img key={`prev-msg1-${form.chatbotIcon}`} src={form.chatbotIcon || '/chatbot-placement-bot.svg'} alt="" className="h-5 w-5 rounded-full object-cover" />
                        <span className="text-[8px] text-zinc-400 font-medium">{form.title || 'Bot'}</span>
                      </div>
                    </div>
                  </div>
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-sm p-3 text-[11px] text-white shadow-md" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                      How does it look?
                    </div>
                  </div>
                  {/* Typing dots only */}
                  <div className="flex justify-start">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 bg-white shadow-sm" style={{ border: `1px solid ${primary}20` }}>
                        <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: primary, animationDelay: '0s' }} />
                        <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: primary, animationDelay: '0.15s' }} />
                        <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: primary, animationDelay: '0.3s' }} />
                      </div>
                      <div className="mt-1 ml-1 flex items-center gap-1.5">
                        <img key={`prev-msg2-${form.chatbotIcon}`} src={form.chatbotIcon || '/chatbot-placement-bot.svg'} alt="" className="h-5 w-5 rounded-full object-cover" />
                        <span className="text-[8px] text-zinc-400">typing…</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div className="border-t px-3 py-2" style={{ borderColor: `${primary}14`, background: `linear-gradient(180deg, ${mixHex(chatBg, primary, 0.16)} 0%, ${mixHex(chatBg, primary, 0.26)} 100%)` }}>
                  <div className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5" style={{ borderColor: `${primary}2b`, background: `linear-gradient(180deg, ${mixHex(chatBg, '#ffffff', 0.35)} 0%, ${mixHex(chatBg, primary, 0.1)} 100%)` }}>
                    <div className="flex-1 text-[11px] text-zinc-400 px-2">
                      {form.inputPlaceholder}
                    </div>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${blend} 58%, ${secondary} 100%)` }}>
                      <Save size={12} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Launcher preview */}
              <div className="mt-8 flex justify-center">
                <div
                  className="rounded-full shadow-xl flex items-center justify-center text-white"
                  style={{
                    width: form.launcherSize,
                    height: form.launcherSize,
                    background: `linear-gradient(135deg, ${primary} 0%, ${blend} 58%, ${secondary} 100%)`,
                    boxShadow: `0 6px 24px ${primary}50`,
                  }}
                >
                  <MessageCircle size={form.launcherSize * 0.4} />
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Live preview reflects changes in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 