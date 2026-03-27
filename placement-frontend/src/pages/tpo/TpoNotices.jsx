import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNoticesByRole } from '../../features/notices/noticesSlice'
import NoticeDetailModal from '../../components/NoticeDetailModal'
import { API_BASE_URL } from '../../services/axios'
import { Bell, Paperclip, ExternalLink, Download, Clock, Maximize2 } from 'lucide-react'

function getAttachmentUrls(n) {
  if (!n) return []
  if (Array.isArray(n.attachmentUrls)) return n.attachmentUrls.filter(Boolean)
  if (Array.isArray(n.attachments)) {
    return n.attachments
      .map((a) => {
        if (!a) return null
        if (typeof a === 'string') return a
        return a.url || a.path || a.fileUrl || null
      })
      .filter(Boolean)
      .map((url) => (url.startsWith('http') || url.startsWith('data:') ? url : `${API_BASE_URL}${url}`))
  }
  if (typeof n.attachmentUrl === 'string') return [n.attachmentUrl.startsWith('http') || n.attachmentUrl.startsWith('data:') ? n.attachmentUrl : `${API_BASE_URL}${n.attachmentUrl}`]
  if (typeof n.attachment === 'string') return [n.attachment.startsWith('http') || n.attachment.startsWith('data:') ? n.attachment : `${API_BASE_URL}${n.attachment}`]
  return []
}

function isImageUrl(url) {
  return (
    url?.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|gif|webp)$/i.test(url || '')
  )
}

function isPdfUrl(url) {
  return url?.startsWith('data:application/pdf') || /\.pdf$/i.test(url || '')
}

export default function TpoNotices() {
  const dispatch = useDispatch()
  const { notices, status } = useSelector((s) => s.notices)
  const [selectedNotice, setSelectedNotice] = useState(null)

  useEffect(() => {
    dispatch(fetchNoticesByRole('tpo,tpo_admin'))
  }, [dispatch])
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const cardStyle = `rounded-[2.5rem] border p-6 shadow-2xl transition-all ${isDark
      ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-zinc-950/50'
      : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
    }`

  const noticeItemStyle = `rounded-3xl border p-5 transition-all duration-300 hover:shadow-lg ${isDark
      ? 'border-zinc-800 bg-zinc-950/50 hover:border-indigo-500/50'
      : 'border-zinc-100 bg-zinc-50/50 hover:border-indigo-600/30'
    }`

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="inline-block w-fit rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
          Communications
        </div>
        <h1 className="text-4xl font-black tracking-tight">Notices</h1>
        <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Role-based announcements and critical updates from the TPO cell.
        </p>
      </div>

      <div className={cardStyle}>
        {/* Inbox Header */}
        <div className="flex items-center justify-between border-b border-zinc-500/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase text-xs">Recent Inbox</h2>
          </div>
          <span className="rounded-full bg-indigo-600/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            {status === 'loading' ? 'Syncing...' : `${notices?.length ?? 0} Announcements`}
          </span>
        </div>

        {/* Notice List */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {(notices || []).map((n) => {
            const attachmentUrls = getAttachmentUrls(n)
            return (
              <div key={n?._id} className={noticeItemStyle}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      <h3 className="truncate text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {n?.title || 'Notice'}
                      </h3>
                    </div>

                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {n?.message}
                    </p>

                    {n?.createdAt && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-zinc-500">
                        <Clock />
                        {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotice(n)}
                    className="shrink-0 flex items-center gap-2 rounded-xl border border-indigo-600/20 bg-indigo-600/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    <Maximize2 /> Expand
                  </button>
                </div>

                {/* Attachments Section */}
                {attachmentUrls.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-500/10">
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <Paperclip /> Attachments ({attachmentUrls.length})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachmentUrls.map((url, idx) => {
                        const isImg = isImageUrl(url);
                        const isPdf = isPdfUrl(url);

                        if (isImg) {
                          return (
                            <div key={url} className="group relative overflow-hidden rounded-2xl border border-zinc-500/10">
                              <img src={url} alt="Attachment" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a href={url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform"><ExternalLink /></a>
                                <a href={url} download className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform"><Download /></a>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div key={url} className={`flex items-center justify-between p-3 rounded-2xl border border-zinc-500/10 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
                            <span className="text-[10px] font-bold truncate max-w-[120px] uppercase text-zinc-500">
                              {isPdf ? 'Document.pdf' : 'Attachment'}
                            </span>
                            <div className="flex gap-2">
                              <a href={url} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-colors"><ExternalLink size={14} /></a>
                              <a href={url} download className="p-2 text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-colors"><Download size={14} /></a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {!(notices || []).length && (
            <div className="py-20 text-center opacity-40">
              <Bell size={48} className="mx-auto mb-4 text-zinc-500" />
              <p className="text-sm font-black uppercase tracking-widest">Your inbox is clear</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal Component */}
      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  )
  // return (
  //   <div className="space-y-6">
  //     <div>
  //       <h1 className="text-xl font-semibold tracking-tight">Notices</h1>
  //       <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
  //         Role-based announcements for TPO users.
  //       </p>
  //     </div>

  //     <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
  //       <div className="flex items-center justify-between gap-3">
  //         <h2 className="text-sm font-semibold">Inbox</h2>
  //         <p className="text-xs text-zinc-500 dark:text-zinc-400">
  //           {status === 'loading' ? 'Loading…' : `${notices?.length ?? 0} notice(s)`}
  //         </p>
  //       </div>

  //       <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
  //         {(notices || []).map((n) => {
  //           const attachmentUrls = getAttachmentUrls(n)
  //           return (
  //             <div
  //               key={n?._id}
  //               className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
  //             >
  //               <div className="min-w-0">
  //                 <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
  //                   {n?.title || 'Notice'}
  //                 </p>
  //                 <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
  //                   {n?.message}
  //                 </p>

  //                 {n?.createdAt ? (
  //                   <p className="mt-2 text-[10px] text-zinc-400">
  //                     {new Date(n.createdAt).toLocaleDateString()}
  //                   </p>
  //                 ) : null}
  //               </div>

  //               {attachmentUrls.length ? (
  //                 <div className="mt-3 space-y-2">
  //                   {attachmentUrls.map((url) => {
  //                     if (isImageUrl(url)) {
  //                       return (
  //                         <img
  //                           key={url}
  //                           src={url}
  //                           alt="Notice attachment"
  //                           className="max-h-56 w-full rounded-lg border border-zinc-200 object-contain bg-white dark:border-zinc-800 dark:bg-zinc-900"
  //                         />
  //                       )
  //                     }

  //                     if (isPdfUrl(url)) {
  //                       return (
  //                         <div key={url} className="grid grid-cols-2 gap-2">
  //                           <a
  //                             href={url}
  //                             target="_blank"
  //                             rel="noreferrer"
  //                             className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
  //                           >
  //                             Open PDF
  //                           </a>
  //                           <a
  //                             href={url}
  //                             download
  //                             className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
  //                           >
  //                             Download
  //                           </a>
  //                         </div>
  //                       )
  //                     }

  //                     return (
  //                       <div key={url} className="grid grid-cols-2 gap-2">
  //                         <a
  //                           href={url}
  //                           target="_blank"
  //                           rel="noreferrer"
  //                           className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
  //                         >
  //                           Open attachment
  //                         </a>
  //                         <a
  //                           href={url}
  //                           download
  //                           className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
  //                         >
  //                           Download
  //                         </a>
  //                       </div>
  //                     )
  //                   })}
  //                 </div>
  //               ) : null}
  //               <div className="mt-3">
  //                 <button
  //                   type="button"
  //                   onClick={() => setSelectedNotice(n)}
  //                   className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
  //                 >
  //                   View Notice
  //                 </button>
  //               </div>
  //             </div>
  //           )
  //         })}

  //         {!(notices || []).length && (
  //           <p className="text-sm text-zinc-500 dark:text-zinc-400">No notices yet.</p>
  //         )}
  //       </div>
  //     </div>
  //     <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
  //   </div>
  // )
}

