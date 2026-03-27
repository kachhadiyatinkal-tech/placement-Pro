import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { adminAPI } from '../../services/api/adminAPI'
import { downloadPDF } from '../../utils/download'
import { toastError } from '../../utils/toast'
import { Download, Edit2, Eye, User, Hash } from 'lucide-react'
import IconButton from '../../components/common/IconButton'
import Pagination from '../../components/common/Pagination'

// Helper pickers remain the same
function safePickName(s) { return s?.first_name || s?.name || s?.fullName || '—' }
function safePickEmail(s) { return s?.email || '—' }
function safePickPhone(s) { return s?.number || s?.phone || '—' }

export default function AdminStudents() {
  const role = useSelector((s) => s.auth.role)
  // Assuming isDark comes from your theme state
  const isDark = useSelector((s) => s.theme?.isDark ?? true)

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Pagination State
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

  async function handleUpdateStudent(e) {
    e.preventDefault()
    await adminAPI.updateUser({
      userId: editingStudent?._id,
      ...editingStudent
    })
    setEditingStudent(null)
    await loadStudents()
  }

  const downloadRows = useMemo(() => students.map((s) => ({ ...s })), [students])

  // Reset page when search or filters change (if any added later)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [students.length, totalPages])

  return (
    <div className="space-y-8 p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <User className="text-xs" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
              User Management
            </span>
          </div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Students <span className="text-emerald-500">Database</span>
          </h1>
          <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Manage and export student accounts {role ? `• Access: ${role}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-white'}`}>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Total Records</p>
              <p className={`text-lg font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {loading ? '--' : students.length}
              </p>
            </div>
            <button
              onClick={() =>
                downloadPDF(`students-${new Date().toISOString().slice(0, 10)}.pdf`, downloadRows, undefined, {
                  title: 'Students export',
                })
              }
              disabled={loading || !students.length}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all active:scale-95 ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
            >
              <Download />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${isDark ? 'border-zinc-800 bg-zinc-950/50 backdrop-blur-md' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
        }`}>
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b ${isDark ? 'border-zinc-800/50 bg-zinc-900/90 backdrop-blur-md' : 'border-zinc-100 bg-zinc-50/90 backdrop-blur-md'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Student Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Account Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800/50' : 'divide-zinc-100'}`}>
              {(students || []).map((s) => (
                <tr key={s?._id} className={`group transition-colors ${isDark ? 'hover:bg-indigo-400/[0.03]' : 'hover:bg-indigo-600/[0.02]'}`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {safePickName(s)}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        ID: {s?._id?.slice(-8) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{safePickEmail(s)}</span>
                      <span className="text-[10px] font-medium text-zinc-500 italic">{safePickPhone(s)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {/* The Toggle Switch */}
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={s?.isActive !== false}
                          onChange={() => toggleStudentActive(s)}
                        />
                        <div className={`
        group relative h-5 w-9 rounded-full transition-all duration-300
        ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
        peer-checked:bg-emerald-500/20
        after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 
        after:rounded-full after:transition-all after:duration-300
        ${isDark ? 'after:bg-zinc-500' : 'after:bg-white'}
        peer-checked:after:translate-x-full peer-checked:after:bg-emerald-500
        peer-focus:ring-2 peer-focus:ring-emerald-500/20
      `}>
                          {/* Subtle Inner Glow for Dark Mode */}
                          {isDark && (
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
                          )}
                        </div>
                      </label>

                      {/* Status Label */}
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${s?.isActive === false
                          ? 'text-zinc-500'
                          : 'text-emerald-500'
                        }`}>
                        {s?.isActive === false ? 'Offline' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedStudent(s)} 
                        title="View Details"
                        variant="zinc"
                      />
                      <IconButton 
                        icon={Edit2} 
                        onClick={() => setEditingStudent({ ...s })} 
                        title="Edit Profile"
                        variant="indigo"
                      />
                      <button
                        onClick={() => toggleStudentActive(s)}
                        className={`ml-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all h-10 ${s?.isActive === false
                            ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white'
                            : 'border-zinc-700 text-zinc-400 hover:bg-red-500 hover:border-red-500 hover:text-white'
                          }`}
                      >
                        {s?.isActive === false ? 'Activate' : 'Suspend'}
                      </button>
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

      {/* Modern Modal for Details/Edit (shared logic) */}
      {(selectedStudent || editingStudent) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
          <div
            className={`relative w-full max-w-2xl rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'
              }`}
          >
            {/* Modal UI Content here... */}
            <div className="p-10">
              <h2 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {editingStudent ? 'Update Profile' : 'Student Overview'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-8">
                System Reference: {(selectedStudent?._id || editingStudent?._id)}
              </p>

              {/* Form or Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Map your fields here based on whether editing or viewing */}
              </div>

              <div className="mt-10 flex justify-end gap-3">
                <button
                  onClick={() => { setSelectedStudent(null); setEditingStudent(null); }}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}