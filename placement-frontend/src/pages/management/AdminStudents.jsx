import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { adminAPI } from '../../services/api/adminAPI'
import { downloadPDF } from '../../utils/download'
import { toastError } from '../../utils/toast'
import { Download, PenLine, Eye, Hash, ShieldCheck, X, Trash } from 'lucide-react'
import IconButton from '../../components/common/IconButton'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import DetailViewerModal from '../../components/common/DetailViewerModal'

// Helper pickers remain the same
function safePickName(s) { return s?.first_name || s?.name || s?.fullName || '—' }
function safePickEmail(s) { return s?.email || '—' }
function safePickPhone(s) { return s?.number || s?.phone || '—' }

export default function AdminStudents() {
  const role = useSelector((s) => s.auth.role)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadStudents = () =>
    adminAPI.getStudentUsers({ page: currentPage, limit: itemsPerPage }).then((res) => {
      const data = res?.data
      setTotalPages(Number(data?.totalPages) || 1)
      setTotalItems(Number(data?.totalItems) || 0)
      setStudents(
        Array.isArray(data?.studentUsers) ? data.studentUsers :
          Array.isArray(data?.students) ? data.students :
            Array.isArray(data?.users) ? data.users :
              Array.isArray(data) ? data : []
      )
    })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    loadStudents()
      .catch((err) => toastError(err?.response?.data?.message || 'Failed to fetch'))
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [currentPage, itemsPerPage])

  async function toggleStudentActive(student) {
    await adminAPI.setUserActive({
      userId: student?._id,
      email: student?.email,
      isActive: !(student?.isActive !== false),
    })
    await loadStudents()
  }

  async function handleDeleteStudent(student) {
    if (!window.confirm(`Are you sure you want to delete student: ${safePickName(student)}?`)) return
    try {
      await adminAPI.deleteStudentUser({ email: student.email })
      loadStudents()
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  const downloadRows = useMemo(() => students.map((s) => ({ ...s })), [students])

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 animate-fade-in">
      {/* Header Section */}
      <PageHeader 
        title="Students Database" 
        subtitle="Manage and export student pool records"
        actionButton={
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex px-4 py-2 rounded-2xl border border-app bg-surface shadow-sm items-center gap-4 transition-all duration-500`}>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted opacity-60">Total Pool</span>
                <span className="text-sm font-black text-app leading-none mt-1">
                  {loading ? '--' : totalItems}
                </span>
              </div>
              <div className="h-6 w-px bg-app" />
              <button
                onClick={() =>
                  downloadPDF(`students-${new Date().toISOString().slice(0, 10)}.pdf`, downloadRows, undefined, {
                    title: 'Students export',
                  })
                }
                disabled={loading || !students.length}
                className="group flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition-all active:scale-90 hover:shadow-lg shadow-brand-500/20 disabled:opacity-30"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        }
      />

      {/* Main Table Container */}
      <div className="rounded-[2.5rem] border border-app bg-surface shadow-sm overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app bg-surface-soft/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Contact Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-center">Account Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {(students || []).map((s) => (
                <tr key={s?._id} className="group transition-colors hover:bg-surface-soft/30">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight text-app uppercase">
                        {safePickName(s)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Hash size={10} className="text-brand-500" />
                        <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-none">
                          {s?._id?.slice(-8) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-app opacity-80">{safePickEmail(s)}</span>
                      <span className="text-[10px] font-medium text-muted tracking-wide">{safePickPhone(s)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={s?.isActive !== false}
                          onChange={() => toggleStudentActive(s)}
                        />
                        <div className={`h-6 w-11 rounded-full transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                      </label>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-1 px-2">
                      <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedStudent(s)} 
                        variant="zinc"
                        size={16}
                      />
                      <IconButton 
                        icon={PenLine} 
                        onClick={() => setEditingStudent({ ...s })} 
                        variant="indigo"
                        size={16}
                      />
                      <IconButton 
                        icon={Trash} 
                        onClick={() => handleDeleteStudent(s)} 
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
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(size) => {
          setCurrentPage(1)
          setItemsPerPage(size)
        }}
      />

      {/* Modern Modal for Details/Edit */}
      <DetailViewerModal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} data={selectedStudent} title="Student Database Details" />

      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 transition-all duration-500">
          <div className="relative w-full max-w-xl rounded-[2.5rem] border border-app bg-surface shadow-2xl p-8 animate-modal-in transform">
            <button 
              onClick={() => setEditingStudent(null)}
              className="absolute top-8 right-8 text-muted hover:text-app transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
               <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-500 border border-brand-500/20 mb-4">
                 <ShieldCheck size={12} /> Student Records
               </div>
               <h2 className="text-3xl font-black tracking-tighter text-app uppercase">
                 Update Details
               </h2>
               <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-2">
                 Registry ID: {editingStudent?._id}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted opacity-60">Full Name</p>
                <p className="text-sm font-bold text-app">{safePickName(editingStudent)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted opacity-60">Auth Level</p>
                <p className="text-sm font-bold text-brand-500 uppercase tracking-tighter">Verified Professional</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted opacity-60">Email Access</p>
                <p className="text-sm font-bold text-app">{safePickEmail(editingStudent)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted opacity-60">Telecom Identifier</p>
                <p className="text-sm font-bold text-app">{safePickPhone(editingStudent)}</p>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-surface-soft text-muted hover:bg-surface hover:text-app border border-app"
              >
                Dismiss Window
              </button>
              {editingStudent && (
                 <button className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20">
                   Synchronize Changes
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
