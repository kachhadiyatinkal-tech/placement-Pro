import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNoticesByRole } from '../../features/notices/noticesSlice'
import NoticeDetailModal from '../../components/NoticeDetailModal'
import { API_BASE_URL } from '../../services/axios'
import { Bell, File, Image, Download, Maximize2, Calendar, ExternalLink } from 'lucide-react'

// Logic preserved exactly as provided
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

export default function StudentNotices() {
  const dispatch = useDispatch()
  const { notices, status } = useSelector((s) => s.notices)
  const mode = useSelector((s) => s.theme?.mode || 'light')
  const isDark = mode === 'dark'
  const [selectedNotice, setSelectedNotice] = useState(null)

  useEffect(() => {
    dispatch(fetchNoticesByRole('student'))
  }, [dispatch])

  const cardStyle = `rounded-[2.5rem] border transition-all duration-300 ${
    isDark ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-md' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
  }`

  return (
    <div className={`space-y-8 p-2 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Communications</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Official <span className="text-zinc-500">Notices</span>
        </h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
          {status === 'loading' ? 'Syncing archive...' : `Secure archive: ${notices?.length ?? 0} active notices`}
        </p>
      </div>

      <div className={`${cardStyle} overflow-hidden`}>
        {/* Inbox Header Bar */}
        <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? 'border-zinc-800 bg-zinc-900/80' : 'bg-zinc-50'}`}>
          <div className="flex items-center gap-2">
            <Bell className="text-indigo-500" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notification Feed</h2>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Latest First
          </span>
        </div>

        {/* Notices Container */}
        <div className={`divide-y max-h-[70vh] overflow-y-auto custom-scrollbar ${isDark ? 'divide-zinc-800/50' : 'divide-zinc-100'}`}>
          {(notices || []).map((n) => {
            const attachmentUrls = getAttachmentUrls(n)
            return (
              <div key={n?._id} className="group p-8 hover:bg-indigo-500/[0.02] transition-colors">
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg font-black uppercase tracking-tight truncate leading-tight">
                        {n?.title || 'System Notification'}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Calendar className="text-indigo-500" />
                        {n?.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Unknown Date'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(n)}
                      className={`p-3 rounded-2xl transition-all shadow-lg hover:bg-indigo-600 hover:text-white ${isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>

                  <p className={`text-sm font-medium leading-relaxed max-w-3xl italic ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {n?.message}
                  </p>

                  {/* Attachments Section */}
                  {attachmentUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {attachmentUrls.map((url, idx) => {
                        const isImg = isImageUrl(url)
                        const isPdf = isPdfUrl(url)
                        
                        return (
                          <div key={url} className={`flex items-center gap-3 rounded-2xl border p-3 pr-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                            <div className={`p-2.5 rounded-xl ${isPdf ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                              {isImg ? <Image size={18} /> : <File size={18} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-tight text-zinc-500">Attachment {idx + 1}</span>
                              <div className="flex gap-4 mt-1">
                                <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1">
                                  VIEW <ExternalLink size={10} />
                                </a>
                                <a href={url} download className={`text-[10px] font-black hover:underline flex items-center gap-1 ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                  DOWNLOAD <Download size={10} />
                                </a>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Empty State */}
          {!(notices || []).length && status !== 'loading' && (
            <div className="py-24 text-center">
              <div className={`inline-flex h-20 w-20 items-center justify-center rounded-[2rem] mb-6 ${isDark ? 'bg-zinc-800/30 text-zinc-600' : 'bg-zinc-100 text-zinc-400'}`}>
                <Bell size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Inbox Clear — No New Alerts</p>
            </div>
          )}
        </div>
      </div>

      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  )
}