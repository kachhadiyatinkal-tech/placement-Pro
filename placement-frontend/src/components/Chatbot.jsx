import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Send, Download, MessageCircle, ChevronDown } from 'lucide-react'
import { api } from '../services/axios'
import { jsPDF } from 'jspdf'

/* ── hex helpers ───────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const big = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
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

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const FALLBACK_SETTINGS = {
  title: 'Placement Assistant',
  welcomeMessage:
    "Hi! I'm your placement assistant. Ask me about jobs, registration, or getting started.",
  primaryColor: '#059669',
  secondaryColor: '#0d9488',
  chatBgColor: '#f8fafc',
  launcherSize: 56,
  panelWidth: 370,
  panelHeight: 520,
  launcherPosition: 'right-bottom',
  positionBottom: 24,
  positionRight: 24,
  positionLeft: 24,
  positionTop: 24,
  inputPlaceholder: 'Type a message…',
  thinkingLabel: 'Thinking…',
  widgetEnabled: true,
}

function getLauncherPlacement(pos, offsets) {
  const bottom = offsets.bottom ?? 24
  const right = offsets.right ?? 24
  const left = offsets.left ?? 24
  const top = offsets.top ?? 24
  const base = { position: 'fixed', zIndex: 100, pointerEvents: 'none' }
  switch (pos) {
    case 'right-middle':
      return { style: { ...base, right, top: '50%', transform: 'translateY(-50%)' }, align: 'items-end' }
    case 'right-top':
      return { style: { ...base, right, top }, align: 'items-end' }
    case 'left-bottom':
      return { style: { ...base, bottom, left }, align: 'items-start' }
    case 'left-middle':
      return { style: { ...base, left, top: '50%', transform: 'translateY(-50%)' }, align: 'items-start' }
    case 'left-top':
      return { style: { ...base, left, top }, align: 'items-start' }
    case 'center':
      return { style: { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }, align: 'items-center' }
    case 'right-bottom':
    default:
      return { style: { ...base, bottom, right }, align: 'items-end' }
  }
}

export default function Chatbot() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [ready, setReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const chatbotRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/chatbot/settings')
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
  const primary = s.primaryColor || FALLBACK_SETTINGS.primaryColor
  const secondary = s.secondaryColor || FALLBACK_SETTINGS.secondaryColor
  const blend = mixHex(primary, secondary, 0.5)
  const chatBg = s.chatBgColor || FALLBACK_SETTINGS.chatBgColor
  const avatarSrc = s.chatbotIcon || '/chatbot-placement-bot.svg'

  /* ── PDF Download ── */
  const handleDownloadChat = useCallback(() => {
    try {
      const doc = new jsPDF()
      const [pr, pg, pb] = hexToRgb(primary)
      doc.setFontSize(16)
      doc.setTextColor(pr, pg, pb)
      doc.text(s.title || FALLBACK_SETTINGS.title, 14, 18)
      doc.setFontSize(9)
      doc.setTextColor(140, 140, 140)
      doc.text('Conversation Transcript', 14, 24)

      let y = 32
      const pageH = doc.internal.pageSize.height
      const pageW = doc.internal.pageSize.width
      doc.setFontSize(10.5)

      messages.forEach((m) => {
        const isUser = m.role === 'user'
        const textLines = doc.splitTextToSize(m.text, 120)
        let bw = 0
        textLines.forEach(l => { const w = doc.getTextWidth(l); if (w > bw) bw = w })
        bw += 14
        const bh = textLines.length * 5.2 + 6
        if (y + bh > pageH - 20) { doc.addPage(); y = 20 }

        if (isUser) {
          const x = pageW - 14 - bw
          doc.setFillColor(pr, pg, pb)
          doc.roundedRect(x, y, bw, bh, 4, 4, 'F')
          doc.setTextColor(255, 255, 255)
          doc.text(textLines, x + 7, y + 7)
        } else {
          const x = 14
          doc.setDrawColor(220, 225, 230)
          doc.setFillColor(248, 249, 252)
          doc.roundedRect(x, y, bw, bh, 4, 4, 'FD')
          doc.setTextColor(40, 40, 40)
          doc.text(textLines, x + 7, y + 7)
        }
        y += bh + 5
      })
      doc.save('chatbot-transcript.pdf')
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    }
  }, [messages, s.title, primary])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event) => {
      const root = chatbotRef.current
      if (!root) return
      if (!root.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  const sendChatMessage = useCallback(
    async (text) => {
      const trimmed = typeof text === 'string' ? text.trim() : ''
      if (!trimmed || sending) return
      setMessages((prev) => [...prev, { id: newId(), role: 'user', text: trimmed }])
      setInput('')
      setSending(true)
      try {
        const { data } = await api.post('/api/chatbot/chat', { message: trimmed })
        const reply = data?.reply ?? ''
        const actions = Array.isArray(data?.actions) ? data.actions : []
        setMessages((prev) => [...prev, { id: newId(), role: 'bot', text: reply, actions }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'bot', text: 'Sorry, something went wrong. Please try again.', actions: [] },
        ])
      } finally {
        setSending(false)
      }
    },
    [sending],
  )

  const handleAction = useCallback(
    (action) => {
      if (!action?.target) return
      switch (action.type) {
        case 'navigate': navigate(action.target); break
        case 'link': window.open(action.target, '_blank', 'noopener,noreferrer'); break
        case 'message': void sendChatMessage(action.target); break
        default: break
      }
    },
    [navigate, sendChatMessage],
  )

  const onSubmit = (e) => { e.preventDefault(); void sendChatMessage(input) }
  if (!ready) return null
  if (s.widgetEnabled === false) return null

  const panelW = s.panelWidth || FALLBACK_SETTINGS.panelWidth
  const panelH = s.panelHeight || FALLBACK_SETTINGS.panelHeight
  const launcherPx = s.launcherSize || FALLBACK_SETTINGS.launcherSize
  const bottom = s.positionBottom ?? FALLBACK_SETTINGS.positionBottom
  const right = s.positionRight ?? FALLBACK_SETTINGS.positionRight
  const posLeft = s.positionLeft ?? FALLBACK_SETTINGS.positionLeft
  const posTop = s.positionTop ?? FALLBACK_SETTINGS.positionTop
  const placeholder = s.inputPlaceholder || FALLBACK_SETTINGS.inputPlaceholder
  const title = s.title || FALLBACK_SETTINGS.title
  const launcherPos = s.launcherPosition || FALLBACK_SETTINGS.launcherPosition
  const placement = getLauncherPlacement(launcherPos, { bottom, right, left: posLeft, top: posTop })

  return (
    // <div
    //   className={`pointer-events-none flex flex-col gap-3 ${placement.align}`}
    //   style={{ ...placement.style, ['--cb-primary']: primary, ['--cb-secondary']: secondary }}
    // >
    //   {/* ═══ PANEL ═══ */}
    //   <div
    //     className={[
    //       'pointer-events-auto flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
    //       isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-8 scale-95 opacity-0',
    //     ].join(' ')}
    //     style={{
    //       width: panelW,
    //       height: panelH,
    //       maxHeight: 'min(80vh, 700px)',
    //       borderRadius: 20,
    //       boxShadow: `0 25px 60px -12px rgba(0,0,0,.25), 0 0 0 1px ${primary}15`,
    //       background: '#fff',
    //     }}
    //     aria-hidden={!isOpen}
    //   >
    //     {/* ── HEADER ── */}
    //     <div
    //       className="flex items-center justify-between px-5 py-4"
    //       style={{
    //         background: `linear-gradient(100deg, ${primary} 0%, ${secondary} 50%, ${secondary}cc 100%)`,
    //         borderRadius: '20px 20px 0 0',
    //       }}
    //     >
    //       <div className="flex items-center gap-3">
    //         <img
    //           src={avatarSrc}
    //           alt=""
    //           className="h-11 w-11 rounded-full object-cover ring-[3px] ring-white/50 shadow-lg"
    //         />
    //         <span className="text-[15px] font-bold text-white tracking-wide">{title}</span>
    //       </div>
    //       <div className="flex items-center gap-1">
    //         <button
    //           type="button"
    //           onClick={handleDownloadChat}
    //           className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-90"
    //           title="Download chat as PDF"
    //         >
    //           <Download className="h-[18px] w-[18px]" />
    //         </button>
    //         <button
    //           type="button"
    //           onClick={() => setIsOpen(false)}
    //           className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-90"
    //           aria-label="Close chat"
    //         >
    //           <ChevronDown className="h-5 w-5" />
    //         </button>
    //       </div>
    //     </div>

    //     {/* ── MESSAGES ── */}
    //     <div
    //       ref={listRef}
    //       className="flex-1 overflow-y-auto px-4 py-4"
    //       style={{ backgroundColor: chatBg }}
    //     >
    //       <div className="flex flex-col gap-4">
    //         {messages.map((m) => {
    //           const isBot = m.role === 'bot'
    //           return (
    //             <div
    //               key={m.id}
    //               className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    //               style={{ animation: 'cbSlide .3s ease-out' }}
    //             >
    //               {isBot ? (
    //                 /* Bot message: bubble + avatar at bottom-left */
    //                 <div className="flex flex-col items-start max-w-[85%]">
    //                   <div
    //                     className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
    //                     style={{
    //                       background: '#fff',
    //                       color: '#334155',
    //                       border: `1px solid ${primary}20`,
    //                       boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    //                     }}
    //                   >
    //                     {m.text}
    //                     {m.actions?.length > 0 && (
    //                       <div className="mt-2 flex flex-wrap gap-1.5 pt-1 border-t" style={{ borderColor: `${primary}15` }}>
    //                         {m.actions.map((a, i) => (
    //                           <button
    //                             key={`${m.id}-a-${i}`}
    //                             type="button"
    //                             onClick={() => handleAction(a)}
    //                             className="rounded-full px-3 py-1 text-[10px] font-bold transition hover:brightness-95 active:scale-95"
    //                             style={{
    //                               background: `${primary}12`,
    //                               color: primary,
    //                               border: `1px solid ${primary}25`,
    //                             }}
    //                           >
    //                             {a.label}
    //                           </button>
    //                         ))}
    //                       </div>
    //                     )}
    //                   </div>
    //                   <div className="mt-1 ml-1 flex items-center gap-1.5">
    //                     <img src={avatarSrc} alt="" className="h-5 w-5 rounded-full object-cover" />
    //                     <span className="text-[9px] text-zinc-400 font-medium">{title}</span>
    //                   </div>
    //                 </div>
    //               ) : (
    //                 /* User message */
    //                 <div className="max-w-[80%]">
    //                   <div
    //                     className="rounded-2xl rounded-br-sm px-4 py-2.5 text-[13px] leading-relaxed text-white whitespace-pre-wrap"
    //                     style={{
    //                       background: `linear-gradient(135deg, ${primary}, ${secondary})`,
    //                       boxShadow: `0 2px 8px ${primary}30`,
    //                     }}
    //                   >
    //                     {m.text}
    //                   </div>
    //                 </div>
    //               )}
    //             </div>
    //           )
    //         })}

    //         {/* Typing indicator — simple animated dots, no button */}
    //         {sending && (
    //           <div className="flex justify-start" style={{ animation: 'cbSlide .3s ease-out' }}>
    //             <div className="flex flex-col items-start">
    //               <div
    //                 className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3"
    //                 style={{
    //                   background: '#fff',
    //                   border: `1px solid ${primary}20`,
    //                   boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    //                 }}
    //               >
    //                 <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '0s' }} />
    //                 <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.15s' }} />
    //                 <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.3s' }} />
    //               </div>
    //               <div className="mt-1 ml-1 flex items-center gap-1.5">
    //                 <img src={avatarSrc} alt="" className="h-5 w-5 rounded-full object-cover" />
    //                 <span className="text-[9px] text-zinc-400 font-medium">typing…</span>
    //               </div>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     </div>

    //     {/* ── COMPOSER ── */}
    //     <div className="border-t" style={{ borderColor: `${primary}12`, background: '#fff' }}>
    //       <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2.5">
    //         <input
    //           type="text"
    //           value={input}
    //           onChange={(e) => setInput(e.target.value)}
    //           placeholder={placeholder}
    //           className="flex-1 bg-transparent px-2 py-1.5 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
    //           disabled={sending}
    //           autoComplete="off"
    //         />
    //         <button
    //           type="submit"
    //           disabled={sending || !input.trim()}
    //           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 hover:shadow-lg active:scale-90 disabled:opacity-30"
    //           style={{
    //             background: `linear-gradient(135deg, ${primary}, ${secondary})`,
    //           }}
    //           aria-label="Send"
    //         >
    //           <Send className="h-4 w-4" />
    //         </button>
    //       </form>
    //     </div>
    //   </div>

    //   {/* ═══ LAUNCHER ═══ */}
    //   <button
    //     type="button"
    //     onClick={() => setIsOpen((o) => !o)}
    //     className="pointer-events-auto group relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
    //     style={{
    //       width: launcherPx,
    //       height: launcherPx,
    //       background: `linear-gradient(135deg, ${primary}, ${secondary})`,
    //       boxShadow: `0 6px 24px ${primary}50`,
    //     }}
    //     aria-label={isOpen ? 'Close chat' : 'Open chat'}
    //     aria-expanded={isOpen}
    //   >
    //     <div
    //       className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
    //       style={{ boxShadow: `0 0 20px 4px ${primary}40` }}
    //     />
    //     {isOpen ? (
    //       <X className="h-6 w-6 text-white" strokeWidth={2.5} />
    //     ) : (
    //       <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
    //     )}
    //   </button>

    //   {/* Keyframes */}
    //   <style>{`
    //     @keyframes cbSlide {
    //       from { opacity: 0; transform: translateY(8px); }
    //       to   { opacity: 1; transform: translateY(0); }
    //     }
    //     .cb-dot {
    //       display: inline-block;
    //       width: 6px;
    //       height: 6px;
    //       border-radius: 50%;
    //       opacity: .6;
    //       animation: cbBounce .6s infinite alternate;
    //     }
    //     @keyframes cbBounce {
    //       from { transform: translateY(0); }
    //       to   { transform: translateY(-4px); }
    //     }
    //   `}</style>
    // </div>
    <div
      ref={chatbotRef}
      className={`pointer-events-none flex flex-col gap-4 ${placement.align}`}
      style={{
        ...placement.style,
        ['--cb-primary']: primary,
        ['--cb-secondary']: secondary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* ═══ PANEL ═══ */}
      <div
        className={[
          'pointer-events-auto flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-12 scale-90 opacity-0',
        ].join(' ')}
        style={{
          width: panelW,
          height: panelH,
          maxHeight: 'min(85vh, 750px)',
          borderRadius: 24,
          boxShadow: `0 30px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px ${primary}10`,
          background: `linear-gradient(180deg, #ffffff 0%, ${chatBg} 72%, ${mixHex(chatBg, primary, 0.08)} 100%)`,
          backdropFilter: 'blur(10px)',
        }}
        aria-hidden={!isOpen}
      >
        {/* ── HEADER ── */}
        <div
          className="relative flex items-center justify-between overflow-hidden px-6 py-5"
          style={{
            background: `linear-gradient(120deg, ${primary} 0%, ${blend} 55%, ${secondary} 100%)`,
            boxShadow: `inset 0 -1px 0 rgba(255,255,255,0.25), 0 6px 18px ${primary}26`,
          }}
        >
          <div
            className="pointer-events-none absolute right-[-40px] top-[-52px] h-36 w-36 rounded-full blur-2xl"
            style={{ background: `${secondary}66` }}
          />
          <div
            className="pointer-events-none absolute left-[-30px] bottom-[-72px] h-40 w-40 rounded-full blur-2xl"
            style={{ background: `${primary}4d` }}
          />
          <svg
            className="pointer-events-none absolute bottom-0 left-0 h-8 w-full opacity-35"
            viewBox="0 0 400 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,30 C70,52 125,5 200,22 C265,38 315,52 400,20 L400,48 L0,48 Z"
              fill="rgba(255,255,255,0.55)"
            />
          </svg>
          <svg
            className="pointer-events-none absolute bottom-0 left-0 h-7 w-full opacity-25"
            viewBox="0 0 400 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,22 C58,8 128,42 198,26 C266,10 333,8 400,28 L400,48 L0,48 Z"
              fill="rgba(255,255,255,0.35)"
            />
          </svg>
          <svg
            className="pointer-events-none absolute bottom-0 left-0 h-6 w-full opacity-20"
            viewBox="0 0 400 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,18 C66,35 120,8 190,18 C272,32 320,42 400,24 L400,48 L0,48 Z"
              fill="rgba(255,255,255,0.28)"
            />
          </svg>
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={avatarSrc}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-[3px] ring-white/30 shadow-md"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-white leading-tight tracking-tight">{title}</span>
              <span className="text-[11px] text-white/70 font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadChat}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/90 transition-all hover:bg-white/20 active:scale-90"
              title="Download chat"
            >
              <Download className="h-[19px] w-[19px]" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/90 transition-all hover:bg-white/20 active:scale-90"
              aria-label="Close chat"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-5 py-6 scroll-smooth"
          style={{
            background: `linear-gradient(180deg, ${mixHex(chatBg || '#f8fafc', '#ffffff', 0.08)} 0%, ${mixHex(chatBg || '#f8fafc', primary, 0.12)} 100%)`,
          }}
        >
          <div className="flex flex-col gap-6">
            {messages.map((m) => {
              const isBot = m.role === 'bot'
              return (
                <div
                  key={m.id}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  style={{ animation: 'cbSlide .4s cubic-bezier(0, 0, 0.2, 1)' }}
                >
                  {isBot ? (
                    <div className="flex flex-col items-start max-w-[88%]">
                      <div
                        className="relative rounded-2xl rounded-bl-none px-4 py-3 text-[14px] leading-relaxed shadow-sm"
                        style={{
                          background: '#ffffff',
                          color: '#1e293b',
                          border: `1px solid ${primary}10`,
                        }}
                      >
                        {m.text}
                        {m.actions?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            {m.actions.map((a, i) => (
                              <button
                                key={`${m.id}-a-${i}`}
                                type="button"
                                onClick={() => handleAction(a)}
                                className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                                style={{
                                  background: `${primary}10`,
                                  color: primary,
                                  border: `1px solid ${primary}20`,
                                }}
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 ml-1 flex items-center gap-2 opacity-60">
                        <img src={avatarSrc} alt="" className="h-4 w-4 rounded-full opacity-80" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{title}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      <div
                        className="rounded-2xl rounded-br-none px-4 py-3 text-[14px] leading-relaxed text-white shadow-lg shadow-blue-500/10"
                        style={{
                          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {sending && (
              <div className="flex justify-start" style={{ animation: 'cbSlide .3s ease-out' }}>
                <div className="flex flex-col items-start">
                  <div
                    className="flex items-center gap-1.5 rounded-2xl rounded-bl-none px-5 py-4 bg-white border border-slate-100 shadow-sm"
                  >
                    <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '0s' }} />
                    <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.15s' }} />
                    <span className="cb-dot" style={{ backgroundColor: primary, animationDelay: '.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── COMPOSER ── */}
        <div
          className="border-t p-4"
          style={{
            borderColor: `${primary}14`,
            background: `linear-gradient(180deg, ${mixHex(chatBg, primary, 0.16)} 0%, ${mixHex(chatBg, primary, 0.26)} 100%)`,
          }}
        >
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 rounded-2xl border-2 px-3 py-1.5 transition-all duration-200"
            style={{
              borderColor: `${primary}2b`,
              background: `linear-gradient(180deg, ${mixHex(chatBg, '#ffffff', 0.35)} 0%, ${mixHex(chatBg, primary, 0.1)} 100%)`,
              boxShadow: `0 8px 24px ${primary}1f`,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-2 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              disabled={sending}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${blend} 55%, ${secondary} 100%)`,
              }}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ═══ LAUNCHER ═══ */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="pointer-events-auto group relative flex items-center justify-center rounded-full transition-all duration-500 hover:rotate-12"
        style={{
          width: launcherPx,
          height: launcherPx,
          background: `linear-gradient(135deg, ${primary} 0%, ${blend} 58%, ${secondary} 100%)`,
          boxShadow: `0 12px 32px ${primary}40`,
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        <div
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `0 0 30px 8px ${primary}30` }}
        />
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          {isOpen ? (
            <X className="h-7 w-7 text-white" strokeWidth={2.5} />
          ) : (
            <MessageCircle className="h-7 w-7 text-white" strokeWidth={2} />
          )}
        </div>
      </button>

      <style>{`
    @keyframes cbSlide {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .cb-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      opacity: 0.5;
      animation: cbBounce 0.8s infinite ease-in-out alternate;
    }
    @keyframes cbBounce {
      from { transform: translateY(0); opacity: 0.3; }
      to   { transform: translateY(-5px); opacity: 1; }
    }
  `}</style>
    </div>
  )
}