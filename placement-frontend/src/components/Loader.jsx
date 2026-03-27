import { useSelector } from 'react-redux'
import Logo from './Logo'

export default function Loader({ label = 'Syncing Data...', fullScreen = false }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Premium Loader Ring Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Aura */}
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-indigo-500/10" />
        
        {/* Middle Rotating Ring */}
        <div className="absolute h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-indigo-600 border-r-indigo-600/30" />
        
        {/* Core Logo */}
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl transition-all duration-500 ${
          isDark ? 'bg-zinc-900 shadow-indigo-500/10' : 'bg-white shadow-zinc-200'
        }`}>
          <Logo className="h-10 w-10 text-indigo-600" />
        </div>
      </div>

      {/* Label Styling */}
      <div className="flex flex-col items-center gap-1">
        <p className={`text-[11px] font-black uppercase tracking-[0.25em] ${
          isDark ? 'text-indigo-400' : 'text-indigo-600'
        }`}>
          {label}
        </p>
        <div className="flex gap-1">
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500" />
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md transition-colors duration-500 ${
        isDark ? 'bg-zinc-950/80' : 'bg-zinc-50/80'
      }`}>
        {/* Background Ambient Glow */}
        <div className="absolute h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />
        {content}
      </div>
    )
  }

  return (
    <div className={`flex w-full items-center justify-center rounded-[2.5rem] border p-12 transition-all ${
      isDark 
        ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
        : 'border-white bg-white/80 backdrop-blur-xl shadow-2xl shadow-zinc-200/50'
    }`}>
      {content}
    </div>
  )
}