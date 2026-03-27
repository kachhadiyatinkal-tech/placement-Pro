import { useCallback, useEffect, useRef, useState } from 'react'
import {
  X, Send, MessageCircle, ChevronDown, Paperclip,
  Loader2, RotateCcw, Languages, Download
} from 'lucide-react'
import { api } from '../../services/axios'
import { useSelector } from 'react-redux'
import Message from './Message'
import { jsPDF } from 'jspdf'

/* ── Utilities ─────────────────────────────────── */
function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

const FALLBACK_SETTINGS = {
  title: 'Placement Assistant',
  welcomeMessage: "Hi! I'm your Smart Placement Assistant. Ask about jobs, applications, interview prep, or upload your resume for analysis.",
  primaryColor: '#059669',
  secondaryColor: '#0d9488',
  launcherSize: 56,
  panelWidth: 370,
  panelHeight: 540,
  launcherPosition: 'right-bottom',
  inputPlaceholder: 'Ask anything about placements…',
  widgetEnabled: true,
}

const LANG_LABELS = { en: 'EN', gu: 'ગુ' }
const LANG_PROMPTS = {
  en: FALLBACK_SETTINGS.inputPlaceholder,
  gu: 'પ્લેસમેન્ટ વિશે પૂછો…',
}

const QUICK_PROMPTS = [
  { label: '🔍 Jobs for me', msg: 'show me job recommendations' },
  { label: '📋 My status', msg: 'check my application status' },
  { label: '🎤 Interview prep', msg: 'help me prepare for interviews' },
  { label: '🧪 Mock interview', msg: 'start a mock interview' },
]

function getLauncherPlacement(pos, offsets) {
  const { bottom = 24, right = 24, left = 24, top = 24 } = offsets
  const base = { position: 'fixed', zIndex: 9999, pointerEvents: 'none' }
  switch (pos) {
    case 'right-middle': return { style: { ...base, right, top: '50%', transform: 'translateY(-50%)' }, align: 'items-end' }
    case 'right-top': return { style: { ...base, right, top }, align: 'items-end' }
    case 'left-bottom': return { style: { ...base, bottom, left }, align: 'items-start' }
    case 'left-middle': return { style: { ...base, left, top: '50%', transform: 'translateY(-50%)' }, align: 'items-start' }
    case 'left-top': return { style: { ...base, left, top }, align: 'items-start' }
    case 'center': return { style: { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }, align: 'items-center' }
    default: return { style: { ...base, bottom, right }, align: 'items-end' }
  }
}

/* ── Component ─────────────────────────────────── */
export default function Chatbot() {
  const theme = useSelector((s) => s.theme?.mode)
  const isDark = theme === 'dark'

  const [settings, setSettings] = useState(null)
  const [ready, setReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lang, setLang] = useState('en')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)

  const listRef = useRef(null)
  const chatbotRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  /* ── Load settings ── */
  useEffect(() => {
    let cancelled = false
    api.get('/api/chatbot/settings')
      .then(({ data }) => {
        if (cancelled) return
        setSettings(data)
        const welcome = data?.welcomeMessage || FALLBACK_SETTINGS.welcomeMessage
        setMessages([{ id: 'welcome', role: 'bot', text: welcome, actions: [] }])
      })
      .catch(() => {
        if (cancelled) return
        setSettings(FALLBACK_SETTINGS)
        setMessages([{ id: 'welcome', role: 'bot', text: FALLBACK_SETTINGS.welcomeMessage, actions: [] }])
      })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  const s = settings || FALLBACK_SETTINGS
  const primary = s.primaryColor || '#059669'
  const secondary = s.secondaryColor || '#0d9488'
  const avatarSrc = s.chatbotIcon || '/chatbot-placement-bot.svg'
  const title = s.title || FALLBACK_SETTINGS.title

  /* ── Auto scroll ── */
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, uploading])

  /* ── Focus input on open ── */
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (chatbotRef.current && !chatbotRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  /* ── Send message ── */
  const sendChatMessage = useCallback(async (text) => {
    const trimmed = typeof text === 'string' ? text.trim() : ''
    if (!trimmed || sending || uploading) return
    setShowQuickPrompts(false)
    setMessages(prev => [...prev, { id: newId(), role: 'user', text: trimmed }])
    setInput('')
    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.post(
        '/api/chatbot/chat',
        { message: trimmed, lang },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      )
      const botMsg = { id: newId(), role: 'bot', text: data?.reply ?? '', actions: data?.actions || [] }
      setMessages(prev => [...prev, botMsg])
      if (!isOpen) setUnreadCount(c => c + 1)
    } catch {
      setMessages(prev => [...prev, { id: newId(), role: 'bot', text: '❌ Something went wrong. Please try again.', actions: [] }])
    } finally {
      setSending(false)
    }
  }, [sending, uploading, lang, isOpen])

  /* ── File upload (resume) ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowQuickPrompts(false)
    setMessages(prev => [...prev, {
      id: newId(), role: 'user',
      text: `📎 Uploaded: ${file.name}`,
      actions: []
    }])
    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.post('/api/chatbot/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      setMessages(prev => [...prev, { id: newId(), role: 'bot', text: data.reply, actions: data.actions || [] }])
      if (!isOpen) setUnreadCount(c => c + 1)
    } catch {
      setMessages(prev => [...prev, { id: newId(), role: 'bot', text: '❌ Failed to analyze resume. Please try again.', actions: [] }])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /* ── Clear chat ── */
  const handleClearChat = () => {
    setMessages([{ id: 'welcome', role: 'bot', text: s.welcomeMessage || FALLBACK_SETTINGS.welcomeMessage, actions: [] }])
    setShowQuickPrompts(true)
  }

  /* ── Toggle lang ── */
  const toggleLang = () => setLang(l => l === 'en' ? 'gu' : 'en')

  /* ── PDF Download ── */
  const handleDownloadChat = useCallback(async () => {
    try {
      // Use try/catch within the function for immediate error reporting
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let y = 30

      // Helper to draw rounded bubble
      const drawBubble = (x, y, w, h, radius, color) => {
        doc.setFillColor(color[0], color[1], color[2])
        doc.roundedRect(x, y, w, h, radius, radius, 'F')
      }

      // Pre-load icon to ensure it displays in PDF
      const loadImage = (url) => new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' 
        img.src = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` // Bypass cache for fresh fetch
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null) // Resolve with null on error so we can still generate the PDF
      })

      const iconImg = avatarSrc ? await loadImage(avatarSrc) : null

      // Title
      doc.setFontSize(22)
      doc.setTextColor(primary)
      doc.text(title, margin, 18)
      doc.setFontSize(9)
      doc.setTextColor(140, 140, 140)
      doc.text(`Transcript: ${new Date().toLocaleString()}`, margin, 24)
      doc.setDrawColor(240, 240, 240)
      doc.line(margin, 26, pageWidth - margin, 26)

      for (const m of messages) {
        const isBot = m.role === 'bot'
        const hasActions = isBot && m.actions?.length > 0
        const textLines = doc.splitTextToSize(m.text, pageWidth - margin * 5)
        
        let bubbleHeight = textLines.length * 5 + 8
        if (hasActions) bubbleHeight += (m.actions.length * 6) + 4
        
        const bubbleWidth = Math.min(doc.getTextWidth(m.text) + 12, pageWidth - margin * 4)
        
        if (y + bubbleHeight > pageHeight - 20) {
          doc.addPage()
          y = 20
        }

        if (isBot) {
          // Bot Icon Frame
          if (iconImg) {
            try {
              doc.addImage(iconImg, 'PNG', margin, y, 10, 10)
            } catch (imageErr) {
              // Internal library error fallback
              doc.setFillColor(primary)
              doc.circle(margin + 5, y + 5, 5, 'F')
            }
          } else {
            doc.setFillColor(primary)
            doc.circle(margin + 5, y + 5, 5, 'F')
          }
          
          const xPos = margin + 12
          const bColor = isDark ? [40, 40, 45] : [245, 249, 248]
          drawBubble(xPos, y, bubbleWidth, bubbleHeight, 4, bColor)
          
          doc.setTextColor(60, 60, 60)
          doc.setFontSize(9)
          doc.text(textLines, xPos + 4, y + 6)

          if (hasActions) {
            doc.setFontSize(8)
            doc.setTextColor(primary)
            m.actions.forEach((a, idx) => {
               doc.text(`> ${a.label}`, xPos + 5, y + (textLines.length * 5) + 10 + (idx * 6))
            })
          }
        } else {
          // User bubble on right
          const xPos = pageWidth - margin - bubbleWidth
          const color = hexToRgb(primary)
          drawBubble(xPos, y, bubbleWidth, bubbleHeight, 4, color)
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(9)
          doc.text(textLines, xPos + 4, y + 6)
        }
        y += bubbleHeight + 8
      }

      doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-transcript.pdf`)
    } catch (err) {
      console.error('PDF Generation failed:', err)
      alert("⚠️ I couldn't generate the PDF right now. This usually happens if the bot's icon cannot be loaded for printing. Try again, or clear chat and retry.")
    }
  }, [messages, title, primary, isDark, avatarSrc])

  const onSubmit = (e) => { e.preventDefault(); void sendChatMessage(input) }

  if (!ready || s.widgetEnabled === false) return null

  const placement = getLauncherPlacement(
    s.launcherPosition || FALLBACK_SETTINGS.launcherPosition,
    { bottom: s.positionBottom, right: s.positionRight, left: s.positionLeft, top: s.positionTop }
  )

  // Dark/light theme
  const panelBg = isDark ? '#18181b' : '#ffffff'
  const listBg = isDark ? '#111113' : '#f8faf9'
  const composerBg = isDark ? '#1c1c1e' : '#f0f4f3'
  const border = isDark ? '#2a2a2e' : '#e5ede8'
  const inputTextColor = isDark ? '#f0f0f0' : '#1a1a1a'
  const placeholderColor = isDark ? '#666' : '#9ca3af'

  return (
    <div
      ref={chatbotRef}
      className={`pointer-events-none flex flex-col gap-3 ${placement.align}`}
      style={{ ...placement.style }}
    >
      {/* ═══ CHAT PANEL ═══ */}
      <div
        className={[
          'pointer-events-auto flex flex-col overflow-hidden',
          'transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-10 scale-90 opacity-0',
        ].join(' ')}
        style={{
          width: s.panelWidth || 370,
          height: s.panelHeight || 540,
          maxHeight: 'min(88vh, 680px)',
          borderRadius: 20,
          background: panelBg,
          boxShadow: isDark
            ? '0 32px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="Placement Assistant Chat"
      >
        {/* ── HEADER ── */}
        <div
          className="relative flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            borderRadius: '20px 20px 0 0',
          }}
        >
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute right-[-20px] top-[-30px] h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: secondary }} />
          <div className="pointer-events-none absolute left-[-10px] bottom-[-40px] h-20 w-20 rounded-full opacity-15 blur-2xl" style={{ background: primary }} />

          <div className="flex items-center gap-3 z-10">
            <div className="relative">
              <img
                src={avatarSrc}
                alt=""
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30 bg-white/10 shadow-sm"
              />
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight tracking-tight">{title}</p>
              <p className="text-[10px] text-white/75 font-medium tracking-widest uppercase">Smart AI • Online</p>
            </div>
          </div>

          <div className="flex items-center gap-1 z-10">
            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLang}
              title={`Switch to ${lang === 'en' ? 'Gujarati' : 'English'}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white active:scale-90 transition-all text-[11px] font-bold"
            >
              {LANG_LABELS[lang]}
            </button>
            {/* Download */}
            <button
              type="button"
              onClick={handleDownloadChat}
              title="Download chat transcript"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white active:scale-90 transition-all"
            >
              <Download className="h-[15px] w-[15px]" />
            </button>
            {/* Clear chat */}
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white active:scale-90 transition-all"
            >
              <RotateCcw className="h-[15px] w-[15px]" />
            </button>
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white active:scale-90 transition-all"
              aria-label="Close chat"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth"
          style={{ background: listBg }}
        >
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <Message
                key={m.id}
                message={m}
                primary={primary}
                secondary={secondary}
                avatarSrc={avatarSrc}
                title={title}
                isDark={isDark}
                onMessageSend={sendChatMessage}
              />
            ))}

            {/* Quick prompt chips — show only at start */}
            {showQuickPrompts && messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 animate-fadeIn">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.msg}
                    type="button"
                    onClick={() => sendChatMessage(p.msg)}
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium border transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                    style={{
                      background: `${primary}12`,
                      color: primary,
                      borderColor: `${primary}25`,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Typing / loading indicator */}
            {(sending || uploading) && (
              <div className="flex justify-start" style={{ animation: 'cbSlide .3s ease' }}>
                <div
                  className="flex items-center gap-1.5 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm"
                  style={{
                    background: isDark ? '#2a2a2e' : '#ffffff',
                    border: `1px solid ${primary}20`,
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: primary }} />
                      <span className="text-[12px]" style={{ color: isDark ? '#aaa' : '#666' }}>Analyzing resume…</span>
                    </>
                  ) : (
                    <>
                      <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '0s' }} />
                      <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.15s' }} />
                      <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.3s' }} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── COMPOSER ── */}
        <div
          className="flex-shrink-0 border-t p-3"
          style={{ background: composerBg, borderColor: border }}
        >
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-200"
            style={{
              background: panelBg,
              border: `1.5px solid ${border}`,
              boxShadow: `0 0 0 0 ${primary}00`,
            }}
          >
            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload resume (PDF) for analysis"
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{ color: isDark ? '#888' : '#9ca3af' }}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
            />

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={LANG_PROMPTS[lang] || s.inputPlaceholder || FALLBACK_SETTINGS.inputPlaceholder}
              className="flex-1 bg-transparent py-1.5 text-[13.5px] focus:outline-none"
              style={{ color: inputTextColor }}
              disabled={sending || uploading}
              autoComplete="off"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={sending || uploading || !input.trim()}
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <p className="mt-1.5 text-center text-[10px]" style={{ color: isDark ? '#555' : '#c0c0c0' }}>
            Powered by Google Gemini · PlacementPro
          </p>
        </div>
      </div>

      {/* ═══ LAUNCHER BUTTON ═══ */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="pointer-events-auto group relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl"
        style={{
          width: s.launcherSize || 56,
          height: s.launcherSize || 56,
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          boxShadow: `0 8px 24px ${primary}55`,
        }}
        aria-label={isOpen ? 'Close chat' : 'Open Placement Assistant'}
        aria-expanded={isOpen}
      >
        {/* Pulse ring */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: primary }}
          />
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md z-10">
            {unreadCount}
          </span>
        )}

        <div className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <X className="h-6 w-6 text-white" strokeWidth={2.5} />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes cbSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn .5s ease; }
        .cb-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          opacity: 0.4;
          animation: cbBounce 0.9s infinite ease-in-out alternate;
        }
        @keyframes cbBounce {
          from { transform: translateY(0); opacity: 0.3; }
          to   { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
