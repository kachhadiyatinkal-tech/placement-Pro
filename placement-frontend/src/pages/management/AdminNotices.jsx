import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  sendNotice,
  deleteNotice,
  fetchAllNotices,
  updateNotice,
} from '../../features/management/managementSlice'
import { validateRequired } from '../../utils/validation'
import NoticeDetailModal from '../../components/NoticeDetailModal'
import { API_BASE_URL } from '../../services/axios'
import { downloadPDF } from '../../utils/download'
import { Download, PenLine, Eye, Plus, Shield, Trash, Megaphone, Clock } from 'lucide-react'
import Pagination from '../../components/common/Pagination'
import IconButton from '../../components/common/IconButton'

const inputClass = (err, isDark) =>
  `mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-wide outline-none transition-all ${isDark
    ? `bg-zinc-950/50 focus:border-indigo-500/50 ${err ? 'border-red-500' : 'border-zinc-800'}`
    : `bg-white focus:border-zinc-400 ${err ? 'border-red-500' : 'border-zinc-200'}`
  }`

export default function AdminNotices() {
  const dispatch = useDispatch()
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
      dispatch(fetchAllNotices())
    })
  }

  function canEditNotice(n) {
    if (!n?.createdAt) return false
    return Date.now() - new Date(n.createdAt).getTime() <= 30 * 60 * 1000 // Extended to 30 mins
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
  }

  const getRecipientStyle = (role) => {
    const map = {
        student: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
        tpo: isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100',
        management: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-100'
    }
    return map[role] || (isDark ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-100 text-zinc-600 border-zinc-200')
  }

  return (
    <div className={`mx-auto max-w-7xl space-y-8 animate-fade-in`}>

      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Megaphone size={12} /> Communication Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Bulletin <span className="text-brand-500">Archive</span></h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Internal broadcasting and announcement logs.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              downloadPDF(
                `notices-archive-${new Date().toISOString().slice(0, 10)}.pdf`,
                (allNotices || []).map((n) => ({ ...n })),
                undefined,
                { title: 'Notices communication log' },
              )
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 shadow-sm'}`}
            title="Export Logs"
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

      {/* Notice Table Container */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="flex items-center justify-between border-b px-8 py-5 dark:border-zinc-800/50">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Archive Strength: <span className="text-emerald-500">{allNotices?.length || 0} Broadcasts</span></p>
           <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Server Connection</span>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Notice Heading</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Timestamps</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Audience</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedNotices.map((n) => (
                <tr key={n._id} className="group transition-colors hover:bg-indigo-600/[0.02]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{n.title || 'Broadcast Record'}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Ref ID: {n._id.slice(-8)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Clock size={12} className="opacity-40" />
                        <span className="text-[10px] font-bold tracking-tight">
                            {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getRecipientStyle(n.receiver_role)}`}>
                      {n.receiver_role || 'Broadcast'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1">
                       <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedNotice(n)} 
                        variant="zinc"
                        size={16}
                      />
                       {canEditNotice(n) && (
                        <IconButton 
                            icon={PenLine} 
                            onClick={() => {
                                setUpdateNoticeErrors({})
                                setEditingNotice({ ...n })
                            }} 
                            variant="indigo"
                            size={16}
                        />
                       )}
                       <IconButton 
                        icon={Trash} 
                        onClick={() => {
                            if (window.confirm("Permanently remove this notice?")) {
                                dispatch(deleteNotice(n._id)).finally(() => dispatch(fetchAllNotices()))
                            }
                        }} 
                        variant="red"
                        size={16}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

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
                <textarea 
                    value={noticeForm.message} 
                    onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} 
                    rows={4} 
                    className={`${inputClass(noticeErrors.message, isDark)} normal-case`} 
                    placeholder="Enter detailed announcement content..."
                />
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
                className={`${inputClass(!!updateNoticeErrors.message, isDark)} normal-case`}
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