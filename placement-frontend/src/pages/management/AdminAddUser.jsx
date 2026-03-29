import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, PenLine, Eye, Plus, Trash, Shield, X } from 'lucide-react'
import {
  addTpo,
  addManagement,
  addStudent,
  deleteTpo,
  deleteManagement,
  deleteStudent,
} from '../../features/management/managementSlice'
import { validateEmail, validatePassword, validateRequired, validatePhoneRequired } from '../../utils/validation'
import { adminAPI } from '../../services/api/adminAPI'
import { downloadPDF } from '../../utils/download'
import Pagination from '../../components/common/Pagination'
import IconButton from '../../components/common/IconButton'
import DetailViewerModal from '../../components/common/DetailViewerModal'

const inputClass = (err, isDark) =>
  `w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
    err 
      ? 'border-red-500 bg-red-50/50' 
      : isDark ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500' : 'border-zinc-100 bg-zinc-50 focus:border-indigo-600'
  }`

export default function AdminAddUser() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ type: 'tpo', first_name: '', email: '', number: '', password: '' })
  const [addFormErrors, setAddFormErrors] = useState({})
  const [editFormErrors, setEditFormErrors] = useState({})
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  async function loadUsers() {
    try {
      const [m, t, s] = await Promise.all([
        adminAPI.getManagementUsers(),
        adminAPI.getTpoUsers(),
        adminAPI.getStudentUsers(),
      ])
      const management = (m?.data?.managementUsers || []).map((u) => ({ ...u, listType: 'management' }))
      const tpo = (t?.data?.tpoUsers || []).map((u) => ({ ...u, listType: 'tpo' }))
      const students = (s?.data?.studentUsers || []).map((u) => ({ ...u, listType: 'student' }))
      setUsers([...management, ...tpo, ...students])
    } catch (err) {
      console.error("Failed to load users", err)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = (e) => {
    e.preventDefault()
    const e1 = {}
    e1.first_name = validateRequired(addForm.first_name, 'Name')
    e1.email = validateEmail(addForm.email)
    e1.number = validatePhoneRequired(addForm.number)
    e1.password = validatePassword(addForm.password)
    setAddFormErrors(e1)
    if (Object.values(e1).some(Boolean)) return

    const payload = {
      first_name: addForm.first_name.trim(),
      email: addForm.email.trim(),
      number: Number(String(addForm.number).replace(/\D/g, '')),
      password: addForm.password,
    }
    
    if (addForm.type === 'tpo') dispatch(addTpo(payload))
    else if (addForm.type === 'management') dispatch(addManagement(payload))
    else dispatch(addStudent(payload))

    setAddForm({ ...addForm, first_name: '', email: '', number: '', password: '' })
    setAddFormErrors({})
    setShowAddModal(false)
    setTimeout(() => loadUsers(), 300)
  }

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return users.slice(start, start + itemsPerPage)
  }, [users, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage))

  async function handleUpdateUser(e) {
    e.preventDefault()
    const eu = editingUser || {}
    const ve = {}
    ve.first_name = validateRequired(eu.first_name, 'First name')
    ve.middle_name = validateRequired(eu.middle_name, 'Middle name')
    ve.last_name = validateRequired(eu.last_name, 'Last name')
    ve.email = validateEmail(eu.email || '')
    ve.number = validatePhoneRequired(eu.number != null ? String(eu.number) : '')
    setEditFormErrors(ve)
    if (Object.values(ve).some(Boolean)) return

    await adminAPI.updateUser({
      userId: eu._id,
      first_name: eu.first_name?.trim() || '',
      middle_name: eu.middle_name?.trim() || '',
      last_name: eu.last_name?.trim() || '',
      email: eu.email?.trim() || '',
      number: Number(String(eu.number).replace(/\D/g, '')),
    })
    setEditingUser(null)
    setEditFormErrors({})
    await loadUsers()
  }

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Permanently remove ${u.first_name} (${u.listType})?`)) return
    const payload = { email: u.email }
    if (u.listType === 'tpo') await dispatch(deleteTpo(payload))
    else if (u.listType === 'management') await dispatch(deleteManagement(payload))
    else await dispatch(deleteStudent(payload))
    await loadUsers()
  }

  async function toggleUserActive(u) {
    await adminAPI.setUserActive({
      userId: u?._id,
      email: u?.email,
      isActive: !(u?.isActive !== false),
    })
    await loadUsers()
  }

  const getTypeStyle = (type) => {
    const styles = {
      management: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-100',
      tpo: isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100',
      student: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }
    return styles[type] || (isDark ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-50 text-zinc-600 border-zinc-100')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Shield /> Admin Console
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">User <span className="text-brand-500">Directory</span></h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Provision and manage cross-platform accounts.
          </p>
        </div>
        
        <div className="flex gap-3">
            <button 
                type="button" 
                onClick={() =>
                  downloadPDF(`all-users-${new Date().toISOString().slice(0, 10)}.pdf`, users, undefined, {
                    title: 'User directory export',
                  })
                } 
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
                <Download size={20} />
            </button>
            <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
            >
                <Plus size={18} />
                Create New User
            </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="border-b border-zinc-100 px-8 py-5 dark:border-zinc-800/50">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Database Status: <span className="text-emerald-500">{users.length} Active Profiles</span></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Contact Email</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Account Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Account Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {pagedUsers.map((u) => (
                <tr key={u?._id} className="group transition-colors hover:bg-indigo-600/[0.02]">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black uppercase tracking-tight">{u?.first_name || 'Anonymous User'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-zinc-500">{u?.email || '—'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(u?.listType || u?.role)}`}>
                      {u?.listType || u?.role || 'User'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={u?.isActive !== false}
                          onChange={() => toggleUserActive(u)}
                        />
                        <div className={`h-6 w-11 rounded-full transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                      </label>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 px-2">
                       <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedUser(u)} 
                        variant="zinc"
                        size={16}
                      />
                       <IconButton 
                        icon={PenLine} 
                        onClick={() => {
                          setEditFormErrors({})
                          setEditingUser({ ...u })
                        }} 
                        variant="indigo"
                        size={16}
                      />
                       <IconButton 
                        icon={Trash} 
                        onClick={() => handleDeleteUser(u)} 
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
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border shadow-2xl ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'}`}>
            <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight">Create Profile</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Access Level</label>
                    <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })} className={inputClass(null, isDark)}>
                        <option value="tpo">Training & Placement Officer (TPO)</option>
                        <option value="management">Management Executive</option>
                        <option value="student">Student Portal User</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Legal name *</label>
                    <input
                      value={addForm.first_name}
                      onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                      className={inputClass(addFormErrors.first_name, isDark)}
                      placeholder="Full name as on ID"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Primary email *</label>
                    <input
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      type="email"
                      className={inputClass(addFormErrors.email, isDark)}
                      placeholder="user@college.edu"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone *</label>
                    <input
                      value={addForm.number}
                      onChange={(e) => setAddForm({ ...addForm, number: e.target.value })}
                      type="tel"
                      inputMode="numeric"
                      className={inputClass(addFormErrors.number, isDark)}
                      placeholder="10-digit mobile number"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Security password *</label>
                    <input
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      type="password"
                      className={inputClass(addFormErrors.password, isDark)}
                      placeholder="At least 6 characters"
                    />
                </div>
                <button type="submit" className="mt-4 w-full rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700">
                    Authorize & Create
                </button>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <DetailViewerModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} data={selectedUser} title="User Database Details" />

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={() => setEditingUser(null)} />
          <div className={`relative w-full max-w-xl rounded-[2.5rem] border p-8 shadow-2xl ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'}`}>
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Modify Profile</h3>
                <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">First name *</label>
                    <input
                      value={editingUser.first_name || ''}
                      onChange={(e) => setEditingUser((s) => ({ ...s, first_name: e.target.value }))}
                      className={inputClass(editFormErrors.first_name, isDark)}
                      placeholder="First name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Middle name *</label>
                    <input
                      value={editingUser.middle_name || ''}
                      onChange={(e) => setEditingUser((s) => ({ ...s, middle_name: e.target.value }))}
                      className={inputClass(editFormErrors.middle_name, isDark)}
                      placeholder="Middle name (use — if none)"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Last name *</label>
                    <input
                      value={editingUser.last_name || ''}
                      onChange={(e) => setEditingUser((s) => ({ ...s, last_name: e.target.value }))}
                      className={inputClass(editFormErrors.last_name, isDark)}
                      placeholder="Last name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone *</label>
                    <input
                      value={editingUser.number || ''}
                      onChange={(e) => setEditingUser((s) => ({ ...s, number: e.target.value }))}
                      type="tel"
                      inputMode="numeric"
                      className={inputClass(editFormErrors.number, isDark)}
                      placeholder="10-digit number"
                    />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Email *</label>
                  <input
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser((s) => ({ ...s, email: e.target.value }))}
                    type="email"
                    className={inputClass(editFormErrors.email, isDark)}
                    placeholder="user@college.edu"
                  />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null)
                    setEditFormErrors({})
                  }}
                  className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest border transition-all ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`}
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20">Sync Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}