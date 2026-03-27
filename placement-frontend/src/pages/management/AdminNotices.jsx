import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  sendNotice,
  deleteNotice,
  fetchAllNotices,
  updateNotice,
} from '../../features/management/managementSlice'
import { fetchNoticesByRole } from '../../features/notices/noticesSlice'
import { validateRequired } from '../../utils/validation'
import NoticeDetailModal from '../../components/NoticeDetailModal'
import { API_BASE_URL } from '../../services/axios'
import { downloadPDF } from '../../utils/download'
import { Download, Edit2, Eye, Plus, Shield, Trash2 } from 'lucide-react'
import Pagination from '../../components/common/Pagination'

const inputClass = (err, isDark) =>
  `mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-wide outline-none transition-all ${isDark
    ? `bg-zinc-950/50 focus:border-indigo-500/50 ${err ? 'border-red-500' : 'border-zinc-800'}`
    : `bg-white focus:border-zinc-400 ${err ? 'border-red-500' : 'border-zinc-200'}`
  }`

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
  return (url?.startsWith('data:image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(url || ''))
}

export default function AdminNotices() {
  const dispatch = useDispatch()
  const { notices: noticesForMe } = useSelector((s) => s.notices)
  const { notices: allNotices } = useSelector((s) => s.management)
  const user = useSelector((s) => s.auth.user)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [selectedNotice, setSelectedNotice] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)

  const [noticeForm, setNoticeForm] = useState({ receiver_role: 'student', title: '', message: '' })
  const [attachments, setAttachments] = useState([])
  const [noticeErrors, setNoticeErrors] = useState({})
  const [updateNoticeErrors, setUpdateNoticeErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const senderId = user?.id || user?._id
  const totalPages = Math.max(1, Math.ceil((allNotices?.length || 0) / itemsPerPage))
  const paginatedNotices = (allNotices || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    dispatch(fetchNoticesByRole('management,management_admin'))
    dispatch(fetchAllNotices())
  }, [dispatch])

  const handleSendNotice = (e) => {
    e.preventDefault()
    const e1 = {}
    e1.title = validateRequired(noticeForm.title, 'Title')
    e1.message = validateRequired(noticeForm.message, 'Message')
    setNoticeErrors(e1)
    if (Object.values(e1).some(Boolean)) return
    if (!senderId) return

    const title = noticeForm.title.trim()
    const message = noticeForm.message.trim()

    let sendPromise
    if (attachments.length) {
      const form = new FormData()
      form.append('sender', senderId)
      form.append('sender_role', 'management_admin')
      form.append('receiver_role', noticeForm.receiver_role)
      if (title) form.append('title', title)
      form.append('message', message)
      attachments.forEach((f) => form.append('attachments', f))
      sendPromise = dispatch(sendNotice(form))
    } else {
      sendPromise = dispatch(sendNotice({
        sender: senderId,
        sender_role: 'management_admin',
        receiver_role: noticeForm.receiver_role,
        title: title || undefined,
        message,
      }))
    }

    setNoticeForm({ receiver_role: 'student', title: '', message: '' })
    setAttachments([])
    setNoticeErrors({})
    setShowCompose(false)
    sendPromise.finally(() => {
      dispatch(fetchNoticesByRole('management,management_admin'))
      dispatch(fetchAllNotices())
    })
  }

  function canEditNotice(n) {
    if (!n?.createdAt) return false
    return Date.now() - new Date(n.createdAt).getTime() <= 5 * 60 * 1000
  }

  async function handleUpdateNotice(e) {
    e.preventDefault()
    if (!editingNotice?._id) return
    const ve = {}
    ve.title = validateRequired(editingNotice.title, 'Title')
    ve.message = validateRequired(editingNotice.message, 'Message')
    setUpdateNoticeErrors(ve)
    if (Object.values(ve).some(Boolean)) return

    await dispatch(updateNotice({
      noticeId: editingNotice._id,
      title: editingNotice.title || '',
      message: editingNotice.message || '',
      receiver_role: editingNotice.receiver_role || 'student',
    }))
    setEditingNotice(null)
    setUpdateNoticeErrors({})
    dispatch(fetchAllNotices())
    dispatch(fetchNoticesByRole('management,management_admin'))
  }

  return (
    <div className={`mx-auto max-w-7xl space-y-8 transition-colors duration-300 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>

      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20'
            }`}>
            <Shield /> Communications
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Bulletin Board</h1>
          <p className={`mt-2 text-sm font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Send notices to students, TPO, or management.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              downloadPDF(
                `notices-${new Date().toISOString().slice(0, 10)}.pdf`,
                (allNotices || []).map((n) => ({ ...n })),
                undefined,
                { title: 'Notices export' },
              )
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all active:scale-90 ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            title="Download PDF"
          >
            <Download size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              setNoticeErrors({})
              setShowCompose(true)
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={18} /> New Notice
          </button>
        </div>
      </div>

      {/* Notices for You */}
      <section className={`space-y-4 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
        <div className="px-2">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Notices for you</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(noticesForMe || []).map((n) => (
            <div key={n._id} className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border p-8 transition-all ${isDark
              ? 'border-zinc-800 bg-zinc-950/40 hover:border-indigo-500/30'
              : 'border-zinc-100 bg-white hover:shadow-2xl hover:shadow-zinc-200/50'
              }`}>
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20'
                  }`}>
                  To: {n.receiver_role}
                </span>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedNotice(n)} className="text-zinc-400 hover:text-indigo-500 transition-colors"><Eye size={16} /></button>
                  {canEditNotice(n) && (
                    <button
                      onClick={() => {
                        setUpdateNoticeErrors({})
                        setEditingNotice({ ...n })
                      }}
                      className="text-zinc-400 hover:text-amber-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(deleteNotice(n._id)).finally(() => dispatch(fetchNoticesByRole('management,management_admin')))}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className={`text-lg font-black uppercase tracking-tight leading-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{n.title || 'Untitled Notice'}</h3>
              <p className={`mt-3 line-clamp-3 text-xs font-bold leading-relaxed uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {n.message}
              </p>

              {getAttachmentUrls(n).length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {getAttachmentUrls(n).map((url, idx) => (
                    <div key={idx} className={`overflow-hidden rounded-2xl border ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                      {isImageUrl(url) ? (
                        <img src={url} alt="Attachment" className="h-32 w-full object-cover opacity-80 group-hover:opacity-100" />
                      ) : (
                        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                          <span className="text-[10px] font-black uppercase text-zinc-500">Document Asset</span>
                          <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-indigo-500 hover:underline">Open</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!noticesForMe?.length && <p className="px-2 text-xs font-black uppercase tracking-widest text-zinc-500">Inbox empty.</p>}
        </div>
      </section>

      {/* Admin Archive Table */}
      {/* <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${isDark ? 'border-zinc-800 bg-zinc-100 backdrop-blur-md' : 'border-zinc-100 bg-zink-900 shadow-2xl shadow-zinc-200/50'
        }`}>
        <div className={`border-b px-8 py-5 ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
            Admin Archive: <span className="text-emerald-500">{allNotices?.length || 0} Records</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800/50 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Notice Title</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Recipient Group</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800/50' : 'divide-zinc-100'}`}>
              {paginatedNotices.map((n) => (
                <tr key={n._id} className={`group transition-colors ${isDark ? 'hover:bg-indigo-400/[0.02]' : 'hover:bg-indigo-600/[0.02]'}`}>
                  <td className="px-8 py-6">
                    <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{n.title || 'No Title'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-block rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-100 text-zinc-500'
                      }`}>
                      {n.receiver_role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {canEditNotice(n) && (
                        <button
                          onClick={() => {
                            setUpdateNoticeErrors({})
                            setEditingNotice({ ...n })
                          }}
                          className={`rounded-xl border px-3 py-1 text-[10px] uppercase transition-all ${isDark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-100 hover:bg-zinc-50'
                            }`}
                        >
                          Edit
                        </button>
                      )}
                      <button onClick={() => setSelectedNotice(n)} className={`rounded-xl border px-3 py-1 text-[10px] uppercase transition-all ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-indigo-600 hover:border-indigo-600' : 'border-zinc-100 hover:bg-zinc-50'
                        }`}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
      {/* Admin Archive Table */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${isDark
          ? 'border-zinc-800 bg-zinc-100 shadow-none'
          : 'border-zinc-200 bg-zinc-50 shadow-2xl shadow-zinc-200/50'
        }`}>
        {/* Table Top Bar */}
        <div className={`border-b px-8 py-5 ${isDark ? 'border-zinc-300/50' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Admin Archive: <span className="text-emerald-500">{allNotices?.length || 0} Records</span>
            </p>
            <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500" />
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <tbody className={`divide-y ${isDark ? 'divide-zinc-200' : 'divide-zinc-200'}`}>
              {(allNotices || []).map((n) => (
                <tr
                  key={n._id}
                  className="group transition-colors hover:bg-black/[0.02]"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tight text-zinc-900">
                        {n.title || 'Broadcast Record'}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 group-hover:text-indigo-500 transition-colors">
                        ID: {n._id.slice(-8)}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-center">
                    <span className="inline-block rounded-lg px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-zinc-400 text-white border border-zinc-500/50 shadow-sm">
                      {n.receiver_role || 'N/A'}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {canEditNotice(n) && (
                        <button
                          onClick={() => {
                            setUpdateNoticeErrors({})
                            setEditingNotice({ ...n })
                          }}
                          className="rounded-[1rem] border border-zinc-300 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-50 active:scale-95 shadow-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedNotice(n)}
                        className="rounded-[1rem] border border-zinc-800 bg-zinc-800 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-700 active:scale-95 shadow-md shadow-zinc-800/20"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!!allNotices?.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={allNotices.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={() => setShowCompose(false)} />
          <div className={`relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border p-10 shadow-2xl transition-all ${isDark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-white bg-white text-zinc-900'
            }`}>
            <h2 className="text-2xl font-black uppercase tracking-tight">Dispatch Notice</h2>
            <form onSubmit={handleSendNotice} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Receiver Group</label>
                <select value={noticeForm.receiver_role} onChange={(e) => setNoticeForm({ ...noticeForm, receiver_role: e.target.value })} className={inputClass(false, isDark)}>
                  <option value="student">Students</option><option value="tpo">TPO</option><option value="management">Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Heading *</label>
                <input
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className={inputClass(!!noticeErrors.title, isDark)}
                  placeholder="Notice title"
                />
                {noticeErrors.title && <p className="mt-1 text-[10px] font-black uppercase text-red-500">{noticeErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Message Body *</label>
                <textarea value={noticeForm.message} onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} rows={4} className={inputClass(noticeErrors.message, isDark)} />
                {noticeErrors.message && <p className="mt-1 text-[10px] font-black uppercase text-red-500">{noticeErrors.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">File Attachments</label>
                <input type="file" accept="application/pdf,image/*" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} className={`w-full rounded-2xl border px-4 py-3 text-[10px] font-black uppercase ${isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-zinc-100 bg-zinc-50'}`} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCompose(false)} className={`flex-1 rounded-2xl border py-4 text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-100 hover:bg-zinc-50'}`}>Cancel</button>
                <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700">Send Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl"
            onClick={() => {
              setUpdateNoticeErrors({})
              setEditingNotice(null)
            }}
          />
          <form onSubmit={handleUpdateNotice} className={`relative w-full max-w-xl rounded-[2.5rem] border p-10 shadow-2xl transition-all ${isDark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-white bg-white text-zinc-900'
            }`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black uppercase tracking-tight">Edit Notice</h2>
            <div className="mt-6 space-y-4">
              <select value={editingNotice.receiver_role || 'student'} onChange={(e) => setEditingNotice((s) => ({ ...s, receiver_role: e.target.value }))} className={inputClass(false, isDark)}>
                <option value="student">Students</option><option value="tpo">TPO</option><option value="management">Management</option>
              </select>
              <input
                value={editingNotice.title || ''}
                onChange={(e) => setEditingNotice((s) => ({ ...s, title: e.target.value }))}
                className={inputClass(!!updateNoticeErrors.title, isDark)}
                placeholder="Title *"
              />
              {updateNoticeErrors.title && <p className="text-[10px] font-black uppercase text-red-500">{updateNoticeErrors.title}</p>}
              <textarea
                value={editingNotice.message || ''}
                onChange={(e) => setEditingNotice((s) => ({ ...s, message: e.target.value }))}
                rows={4}
                className={inputClass(!!updateNoticeErrors.message, isDark)}
                placeholder="Message *"
              />
              {updateNoticeErrors.message && <p className="text-[10px] font-black uppercase text-red-500">{updateNoticeErrors.message}</p>}
            </div>
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setUpdateNoticeErrors({})
                  setEditingNotice(null)
                }}
                className={`flex-1 rounded-2xl border py-4 text-xs font-black uppercase tracking-widest ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-100 hover:bg-zinc-50'}`}
              >
                Discard
              </button>
              <button type="submit" className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'}`}>Update Archive</button>
            </div>
          </form>
        </div>
      )}

      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  )
}