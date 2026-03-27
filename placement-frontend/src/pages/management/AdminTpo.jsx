import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTpoUsers, deleteTpo } from '../../features/management/managementSlice'
import { downloadPDF } from '../../utils/download'
import { adminAPI } from '../../services/api/adminAPI'
import { validateEmail, validatePassword, validatePhoneRequired, validateRequired } from '../../utils/validation'
import { Download, PenLine, Eye, Plus, Briefcase, X, User, Trash } from 'lucide-react'
import IconButton from '../../components/common/IconButton'
import Pagination from '../../components/common/Pagination'

export default function AdminTpo() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { tpoUsers, status } = useSelector((s) => s.management)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ first_name: '', middle_name: '', last_name: '', email: '', number: '', gender: '', position: '', password: '' })
  const [selectedTpo, setSelectedTpo] = useState(null)
  const [editingTpo, setEditingTpo] = useState(null)
  const [addErrors, setAddErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const totalPages = Math.max(1, Math.ceil((tpoUsers?.length || 0) / itemsPerPage))
  const paginatedTpoUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return (tpoUsers || []).slice(start, start + itemsPerPage)
  }, [tpoUsers, currentPage, itemsPerPage])

  useEffect(() => {
    dispatch(fetchTpoUsers())
  }, [dispatch])

  async function handleAddTpo(e) {
    e.preventDefault()
    const e1 = {}
    e1.first_name = validateRequired(form.first_name, 'First name')
    e1.middle_name = validateRequired(form.middle_name, 'Middle name')
    e1.last_name = validateRequired(form.last_name, 'Last name')
    e1.email = validateEmail(form.email)
    e1.number = validatePhoneRequired(form.number)
    e1.gender = validateRequired(form.gender, 'Gender')
    e1.position = validateRequired(form.position, 'Position')
    e1.password = validatePassword(form.password)
    setAddErrors(e1)
    if (Object.values(e1).some(Boolean)) return

    const payload = {
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      number: Number(String(form.number).replace(/\D/g, '')),
      gender: form.gender,
      position: form.position.trim(),
      password: form.password,
    }
    const res = await adminAPI.addTpoUser(payload)
    if (res?.data) {
      setShowAddModal(false)
      setAddErrors({})
      setForm({ first_name: '', middle_name: '', last_name: '', email: '', number: '', gender: '', position: '', password: '' })
      dispatch(fetchTpoUsers())
    }
  }

  async function toggleTpoActive(user) {
    await adminAPI.setUserActive({
      userId: user?._id,
      email: user?.email,
      isActive: !(user?.isActive !== false),
    })
    dispatch(fetchTpoUsers())
  }

  async function handleUpdateTpo(e) {
    e.preventDefault()
    const eu = editingTpo || {}
    const ve = {}
    ve.first_name = validateRequired(eu.first_name, 'First name')
    ve.middle_name = validateRequired(eu.middle_name, 'Middle name')
    ve.last_name = validateRequired(eu.last_name, 'Last name')
    ve.email = validateEmail(eu.email || '')
    ve.number = validatePhoneRequired(eu.number != null ? String(eu.number) : '')
    ve.gender = validateRequired(eu.gender, 'Gender')
    ve.position = validateRequired(eu.tpoProfile?.position, 'Position')
    setEditErrors(ve)
    if (Object.values(ve).some(Boolean)) return

    await adminAPI.updateUser({
      userId: eu._id,
      first_name: eu.first_name?.trim() || '',
      middle_name: eu.middle_name?.trim() || '',
      last_name: eu.last_name?.trim() || '',
      email: eu.email?.trim() || '',
      number: Number(String(eu.number).replace(/\D/g, '')),
      gender: eu.gender || '',
      position: eu.tpoProfile?.position?.trim() || '',
    })
    setEditingTpo(null)
    setEditErrors({})
    dispatch(fetchTpoUsers())
  }

  const inputBase = `w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none ${
    isDark
      ? 'border-zinc-800 bg-zinc-950 text-white focus:border-indigo-500 placeholder:text-zinc-600'
      : 'border-zinc-200 bg-white text-zinc-900 focus:border-indigo-600 placeholder:text-zinc-400'
  }`
  const addField = (key) => `${inputBase} ${addErrors[key] ? 'border-red-500 ring-1 ring-red-500/30' : ''}`
  const editField = (key) => `${inputBase} ${editErrors[key] ? 'border-red-500 ring-1 ring-red-500/30' : ''}`

  return (
    <div className={`min-h-screen space-y-8 p-4 transition-colors duration-300 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <Briefcase size={12} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Official Access</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            TPO <span className="text-brand-500">Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Plus size={14} /> New Officer
          </button>
          <button 
            onClick={() =>
              downloadPDF(
                `tpo-users-${new Date().toISOString().slice(0, 10)}.pdf`,
                (tpoUsers || []).map((u) => ({ ...u })),
                undefined,
                { title: 'TPO users export' },
              )
            }
            className={`h-11 w-11 flex items-center justify-center rounded-2xl border transition-all ${
              isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 shadow-sm'
            }`}
          >
            <Download />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${
        isDark ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-md' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${isDark ? 'bg-zinc-900/80 text-zinc-500' : 'bg-zinc-50 text-zinc-500'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Officer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
              {paginatedTpoUsers.map((u) => (
                <tr key={u._id} className={`group transition-colors ${isDark ? 'hover:bg-indigo-500/[0.02]' : 'hover:bg-indigo-500/[0.02]'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                        {u.first_name[0]}
                      </div>
                      <span className="text-sm font-bold uppercase tracking-tight">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className={`px-8 py-6 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {u.email}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only peer" checked={u?.isActive !== false} onChange={() => toggleTpoActive(u)} />
                        <div className={`h-5 w-9 rounded-full transition-all duration-300 border ${
                          isDark ? 'bg-zinc-950 border-zinc-800 peer-checked:border-emerald-500/50' : 'bg-zinc-200 border-zinc-300 peer-checked:border-emerald-200'
                        } after:absolute after:top-[3px] after:left-[4px] after:h-3 after:w-3 after:rounded-full after:transition-all ${
                          isDark ? 'after:bg-zinc-700' : 'after:bg-white'
                        } peer-checked:after:translate-x-3.5 peer-checked:after:bg-emerald-500`} />
                      </label>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${u?.isActive === false ? 'text-zinc-500' : 'text-emerald-500'}`}>
                        {u?.isActive === false ? 'Disabled' : 'Enabled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 px-2">
                      <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedTpo(u)} 
                        title="View Details"
                        variant="zinc"
                        size={16}
                      />
                      <IconButton 
                        icon={PenLine} 
                        onClick={() => {
                          setEditErrors({})
                          setEditingTpo({ ...u, tpoProfile: u?.tpoProfile || {} })
                        }} 
                        title="Edit TPO"
                        variant="indigo"
                        size={16}
                      />
                      <IconButton 
                        icon={Trash} 
                        onClick={() => {
                          if (window.confirm(`Permanently delete officer ${u.first_name}?`)) {
                            dispatch(deleteTpo({ email: u.email }))
                          }
                        }}
                        title="Delete TPO"
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
        totalItems={(tpoUsers || []).length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(size) => {
          setCurrentPage(1)
          setItemsPerPage(size)
        }}
      />

      {/* --- ALL MODALS (FULLY RESTORED) --- */}

      {/* Add TPO Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60" onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTpo} className={`relative w-full max-w-md rounded-[2.5rem] border p-8 shadow-2xl transition-all ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Create TPO Account</h2>
            <div className="space-y-3">
              <input value={form.first_name} onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))} placeholder="First name *" className={addField('first_name')} />
              <input value={form.middle_name} onChange={(e) => setForm((s) => ({ ...s, middle_name: e.target.value }))} placeholder="Middle name *" className={addField('middle_name')} />
              <input value={form.last_name} onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))} placeholder="Last name *" className={addField('last_name')} />
              <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Official email *" type="email" className={addField('email')} />
              <input value={form.number} onChange={(e) => setForm((s) => ({ ...s, number: e.target.value }))} placeholder="10-digit phone *" className={addField('number')} inputMode="numeric" />
              <input value={form.position} onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))} placeholder="Designation / role *" className={addField('position')} />
              <select value={form.gender} onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))} className={addField('gender')}>
                <option value="">Select gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Password (min 6) *" type="password" className={addField('password')} />
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setAddErrors({})
                }}
                className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-zinc-200 text-zinc-500'}`}
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">Add User</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingTpo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          onClick={() => {
            setEditErrors({})
            setEditingTpo(null)
          }}
        >
          <form onSubmit={handleUpdateTpo} className={`relative w-full max-w-xl rounded-[2.5rem] border p-10 shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit TPO Profile</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={editingTpo.first_name || ''} onChange={(e) => setEditingTpo((s) => ({ ...s, first_name: e.target.value }))} className={editField('first_name')} placeholder="First name *" />
              <input value={editingTpo.middle_name || ''} onChange={(e) => setEditingTpo((s) => ({ ...s, middle_name: e.target.value }))} className={editField('middle_name')} placeholder="Middle name *" />
              <input value={editingTpo.last_name || ''} onChange={(e) => setEditingTpo((s) => ({ ...s, last_name: e.target.value }))} className={editField('last_name')} placeholder="Last name *" />
              <input
                value={editingTpo.email || ''}
                onChange={(e) => setEditingTpo((s) => ({ ...s, email: e.target.value }))}
                className={editField('email')}
                placeholder="Email *"
                type="email"
              />
              <input
                value={editingTpo.number || ''}
                onChange={(e) => setEditingTpo((s) => ({ ...s, number: e.target.value }))}
                className={editField('number')}
                placeholder="Phone *"
                inputMode="numeric"
              />
              <select
                value={editingTpo.gender || ''}
                onChange={(e) => setEditingTpo((s) => ({ ...s, gender: e.target.value }))}
                className={editField('gender')}
              >
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                value={editingTpo.tpoProfile?.position || ''}
                onChange={(e) => setEditingTpo((s) => ({ ...s, tpoProfile: { ...(s.tpoProfile || {}), position: e.target.value } }))}
                className={`${editField('position')} md:col-span-2`}
                placeholder="Position *"
              />
            </div>
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditingTpo(null)
                  setEditErrors({})
                }}
                className={`flex-1 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-zinc-200 text-zinc-400'}`}
              >
                Discard
              </button>
              <button type="submit" className="flex-1 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">Save Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Details View Modal */}
      {selectedTpo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60" onClick={() => setSelectedTpo(null)}>
          <div className={`relative w-full max-w-lg rounded-[2.5rem] border p-10 shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Information</h3>
              <button onClick={() => setSelectedTpo(null)} className={isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}><X size={20}/></button>
            </div>
            <div className="grid gap-4">
              {[
                { label: 'Officer', value: `${selectedTpo.first_name} ${selectedTpo.last_name}` },
                { label: 'Email', value: selectedTpo.email },
                { label: 'Phone', value: selectedTpo.number },
                { label: 'Designation', value: selectedTpo?.tpoProfile?.position },
                { label: 'Account', value: selectedTpo?.isActive === false ? 'Suspended' : 'Live', color: 'text-emerald-500' }
              ].map((item, i) => (
                <div key={i} className={`flex justify-between border-b pb-2 ${isDark ? 'border-zinc-800' : 'border-zinc-50'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</span>
                  <span className={`font-bold text-sm ${item.color || (isDark ? 'text-zinc-200' : 'text-zinc-800')}`}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}