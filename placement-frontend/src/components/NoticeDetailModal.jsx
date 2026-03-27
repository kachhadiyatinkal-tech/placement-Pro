import { useSelector } from 'react-redux'
import { X, Download, ExternalLink, FileText, Paperclip, Calendar, User, Shield } from 'lucide-react'
import { API_BASE_URL } from '../services/axios'

export default function NoticeDetailModal({ notice, onClose }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  if (!notice) return null

  const attachmentUrls = Array.isArray(notice.attachmentUrls)
    ? notice.attachmentUrls.filter(Boolean)
    : Array.isArray(notice.attachments)
      ? notice.attachments
        .map((a) => (typeof a === 'string' ? a : a?.url || a?.path || a?.fileUrl))
        .filter(Boolean)
        .map((url) => (url.startsWith('http') || url.startsWith('data:') ? url : `${API_BASE_URL}${url}`))
      : []

  const downloadNoticeDetails = () => {
    const text = [
      `Title: ${notice?.title || 'Notice'}`,
      `To: ${notice?.receiver_role || 'N/A'}`,
      `Date: ${notice?.createdAt ? new Date(notice.createdAt).toLocaleString() : 'N/A'}`,
      '',
      `Message:`,
      `${notice?.message || ''}`,
      '',
      `Attachments:`,
      ...(attachmentUrls.length ? attachmentUrls : ['None']),
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notice-${notice?._id || Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper to check if file is an image for preview
  const isImage = (url) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

  return (
    // <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
    //   {/* Backdrop */}
    //   <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity" aria-hidden />

    //   <div
    //     className={`relative w-full max-w-2xl rounded-[2.5rem] border p-2 shadow-2xl transition-all ${
    //       isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
    //     }`}
    //     onClick={(e) => e.stopPropagation()}
    //   >
    //     <div className="max-h-[85vh] overflow-y-auto px-8 py-10 custom-scrollbar">
    //       {/* Header */}
    //       <div className="mb-8 flex items-start justify-between gap-6">
    //         <div className="space-y-3">
    //           <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
    //             Official Notice
    //           </div>
    //           <h2 className="text-3xl font-black tracking-tight leading-tight uppercase">
    //             {notice?.title || 'Notice'}
    //           </h2>

    //           <div className="flex flex-wrap gap-4 pt-1">
    //             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
    //               <User className="text-indigo-500" />
    //               To: <span className={isDark ? 'text-zinc-300' : 'text-zinc-900'}>{notice?.receiver_role || 'General'}</span>
    //             </div>
    //             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
    //               <Calendar className="text-indigo-500" />
    //               Date: <span className={isDark ? 'text-zinc-300' : 'text-zinc-900'}>
    //                 {notice?.createdAt ? new Date(notice.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
    //               </span>
    //             </div>
    //           </div>
    //         </div>

    //         <button
    //           onClick={onClose}
    //           className={`rounded-2xl p-3 transition-colors ${
    //             isDark ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'
    //           }`}
    //         >
    //           <X size={24} />
    //         </button>
    //       </div>

    //       {/* Message Content */}
    //       <div className={`relative mb-8 rounded-3xl border p-6 ${
    //         isDark ? 'border-zinc-800 bg-zinc-950/50 text-zinc-300' : 'border-zinc-100 bg-zinc-50 text-zinc-700'
    //       }`}>
    //         <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
    //           {notice?.message || 'No message content provided.'}
    //         </p>
    //       </div>

    //       {/* Attachments Section */}
    //       {attachmentUrls.length > 0 && (
    //         <div className="space-y-4">
    //           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
    //             <Paperclip className="text-indigo-500" />
    //             Attachments ({attachmentUrls.length})
    //           </div>

    //           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    //             {attachmentUrls.map((url, idx) => (
    //               <div 
    //                 key={idx} 
    //                 className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:border-indigo-500/50 ${
    //                   isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-100 bg-white'
    //                 }`}
    //               >
    //                 {/* Visual Preview */}
    //                 <div className={`flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl ${
    //                   isDark ? 'bg-zinc-900' : 'bg-zinc-50'
    //                 }`}>
    //                   {isImage(url) ? (
    //                     <img src={url} alt="Attachment" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
    //                   ) : (
    //                     <FileText className="text-4xl text-zinc-300" />
    //                   )}
    //                 </div>

    //                 {/* Action Links */}
    //                 <div className="flex gap-2">
    //                   <a
    //                     href={url}
    //                     target="_blank"
    //                     rel="noreferrer"
    //                     className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-500/10 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-indigo-600 hover:text-white"
    //                   >
    //                     <ExternalLink /> Open
    //                   </a>
    //                   <a
    //                     href={url}
    //                     download
    //                     className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600/10 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
    //                   >
    //                     <Download /> Get File
    //                   </a>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       )}
    //     </div>

    //     {/* Footer Actions */}
    //     <div className={`flex gap-3 border-t p-6 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
    //       <button
    //         onClick={downloadNoticeDetails}
    //         className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
    //           isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
    //         }`}
    //       >
    //         <Download /> Download Details
    //       </button>
    //       <button
    //         onClick={onClose}
    //         className="flex-1 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
    //       >
    //         Back to Dashboard
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop with high-spec blur */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl transition-opacity" aria-hidden />

      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transition-all ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner Scroll Container */}
        <div className="max-h-[85vh] overflow-y-auto px-10 py-12 custom-scrollbar">
          {/* Header Section */}
          <div className="mb-10 flex items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
                <Shield className="text-[11px]" />
                Official Broadcast
              </div>

              <h2 className={`text-3xl font-black tracking-tighter leading-[1.1] uppercase ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {notice?.title || 'System Notice'}
              </h2>

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Destination</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-500">
                    <User size={14} />
                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>{notice?.receiver_role || 'General'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Timestamp</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-500">
                    <Calendar size={14} />
                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>
                      {notice?.createdAt ? new Date(notice.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`group rounded-2xl p-4 transition-all active:scale-90 ${isDark ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Message Body - Modern Brutalist Card */}
          <div className={`relative mb-10 rounded-[2rem] border p-8 transition-all ${isDark ? 'border-zinc-800 bg-zinc-950/50 text-zinc-300 shadow-inner' : 'border-zinc-100 bg-zinc-50/50 text-zinc-700'
            }`}>
            <div className="absolute -top-3 left-8 rounded-md bg-indigo-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
              Content Body
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
              {notice?.message || 'The system has not provided specific message details for this record.'}
            </p>
          </div>

          {/* Attachments UI */}
          {attachmentUrls.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  <Paperclip className="text-indigo-500" />
                  Assets ({attachmentUrls.length})
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {attachmentUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className={`group overflow-hidden rounded-[1.5rem] border transition-all duration-300 hover:shadow-xl ${isDark ? 'border-zinc-800 bg-zinc-950 hover:border-indigo-500/50' : 'border-zinc-100 bg-white hover:border-indigo-200'
                      }`}
                  >
                    {/* Visual Preview */}
                    <div className={`flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-50'
                      }`}>
                      {isImage(url) ? (
                        <img src={url} alt="Attachment" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="text-5xl text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PDF Document</span>
                        </div>
                      )}
                    </div>

                    {/* Industrial Action Bar */}
                    <div className="flex divide-x divide-zinc-100 dark:divide-zinc-800">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-indigo-400"
                      >
                        <ExternalLink /> Open
                      </a>
                      <a
                        href={url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                      >
                        <Download /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar - Fixed */}
        <div className={`flex gap-4 border-t p-8 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
          <button
            onClick={downloadNoticeDetails}
            className={`flex-1 flex items-center justify-center gap-3 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
          >
            <Download /> Export PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            Return to Vault
          </button>
        </div>
      </div>
    </div>
  )
}