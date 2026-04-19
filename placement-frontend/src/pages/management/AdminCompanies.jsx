import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, PenLine, Eye, Plus, Trash, Globe, MapPin, Activity, X, Check } from 'lucide-react'
import IconButton from '../../components/common/IconButton'
import Pagination from '../../components/common/Pagination'
import { fetchCompanies, addCompany, deleteCompany } from '../../features/companies/companiesSlice'
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation'
import { downloadPDF } from '../../utils/download'
import { adminAPI } from '../../services/api/adminAPI'
import { toastSuccess, toastError } from '../../utils/toast'
import DetailViewerModal from '../../components/common/DetailViewerModal'

const inputClass = (err, isDark) =>
  `w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${err
    ? 'border-red-500 bg-red-50/50'
    : isDark ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500' : 'border-zinc-100 bg-zinc-50 focus:border-indigo-600'
  }`

export default function AdminCompanies() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { companies } = useSelector((s) => s.companies)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyForm, setCompanyForm] = useState({
    companyName: '', companyDescription: '', companyWebsite: '', companyLocation: '',
    companyDifficulty: 'Moderate', email: '', password: '',
  })
  const [companyFormErrors, setCompanyFormErrors] = useState({})
  const [editCompanyErrors, setEditCompanyErrors] = useState({})

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch])

  // Pagination Logic
  const totalPages = Math.ceil(companies.length / itemsPerPage)
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return companies.slice(start, start + itemsPerPage)
  }, [companies, currentPage])

  // Reset page
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [companies.length, totalPages])

  const handleAddCompany = async (e) => {
    e.preventDefault()
    const e1 = {}
    e1.companyName = validateRequired(companyForm.companyName, 'Company name')
    e1.companyDescription = validateRequired(companyForm.companyDescription, 'Description')
    e1.companyWebsite = validateRequired(companyForm.companyWebsite, 'Website')
    e1.companyLocation = validateRequired(companyForm.companyLocation, 'Location')
    e1.email = validateEmail(companyForm.email)
    e1.password = validatePassword(companyForm.password)
    setCompanyFormErrors(e1)
    if (Object.values(e1).some(Boolean)) return

    await dispatch(addCompany({
      companyName: companyForm.companyName.trim(),
      companyDescription: companyForm.companyDescription.trim(),
      companyWebsite: companyForm.companyWebsite.trim(),
      companyLocation: companyForm.companyLocation.trim(),
      companyDifficulty: companyForm.companyDifficulty || 'Moderate',
      email: companyForm.email.trim(),
      password: companyForm.password,
    }))
    
    // Refresh the list after adding
    dispatch(fetchCompanies())
    setCompanyForm({ companyName: '', companyDescription: '', companyWebsite: '', companyLocation: '', companyDifficulty: 'Moderate', email: '', password: '' })
    setCompanyFormErrors({})
    setShowAddModal(false)
  }

  async function toggleCompanyActive(company) {
    try {
      const res = await adminAPI.setCompanyActive({
        companyId: company?._id,
        isActive: !(company?.isActive !== false),
      })
      toastSuccess(res.data?.msg || 'Status updated')
      dispatch(fetchCompanies())
    } catch (err) {
      toastError(err?.response?.data?.msg || 'Failed to update status')
    }
  }

  async function handleUpdateRegistrationStatus(companyId, status) {
    try {
      const res = await adminAPI.updateCompanyRegistrationStatus({ companyId, status })
      toastSuccess(res.data?.msg || `Company ${status}`)
      dispatch(fetchCompanies())
    } catch (err) {
      toastError(err?.response?.data?.msg || 'Operation failed')
    }
  }

  async function handleUpdateCompany(e) {
    e.preventDefault()
    if (!editingCompany?._id) return
    const ec = editingCompany
    const ve = {}
    ve.companyName = validateRequired(ec.companyName, 'Company name')
    ve.companyDescription = validateRequired(ec.companyDescription, 'Description')
    ve.companyWebsite = validateRequired(ec.companyWebsite, 'Website')
    ve.companyLocation = validateRequired(ec.companyLocation, 'Location')
    ve.email = validateEmail(ec.email || '')
    setEditCompanyErrors(ve)
    if (Object.values(ve).some(Boolean)) return

    try {
      const res = await adminAPI.updateCompany({
        companyId: editingCompany._id,
        companyName: editingCompany.companyName,
        companyDescription: editingCompany.companyDescription || '',
        companyWebsite: editingCompany.companyWebsite || '',
        companyLocation: editingCompany.companyLocation || '',
        companyDifficulty: editingCompany.companyDifficulty || 'Moderate',
        email: editingCompany.email || '',
      });
      toastSuccess(res.data?.msg || 'Company updated successfully')
      setEditingCompany(null)
      setEditCompanyErrors({})
      dispatch(fetchCompanies())
    } catch (err) {
      toastError(err?.response?.data?.msg || 'Failed to update company')
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Activity /> Partner Registry
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Corporate <span className="text-brand-500">Entities</span></h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              downloadPDF(`companies-${new Date().toISOString().slice(0, 10)}.pdf`, companies, undefined, {
                title: 'Companies export',
              })
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl dark:bg-zinc-50 dark:text-zinc-950 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Entity
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="border-b border-zinc-100 px-8 py-5 dark:border-zinc-800/50">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Database Status: <span className="text-emerald-500">{companies.length} Registered Entities</span></p>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Corporate Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Location</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Difficulty</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Account Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedCompanies.map((c) => (
                <tr key={c._id} className="group transition-colors hover:bg-indigo-600/[0.02]">
                  <td className="px-8 py-6">
                    <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{c.companyName}</p>
                    <p className="text-[10px] font-bold text-zinc-500 truncate max-w-[200px] mt-1">{c.email || 'No admin email'}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <MapPin size={12} className="opacity-40" />
                      {c.companyLocation || 'Remote'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${c.companyDifficulty === 'Hard' ? (isDark ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-red-600 bg-red-50 border-red-100') :
                        c.companyDifficulty === 'Easy' ? (isDark ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-emerald-600 bg-emerald-50 border-emerald-100') :
                          (isDark ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-amber-600 bg-amber-50 border-amber-100')
                      }`}>
                      {c.companyDifficulty || 'Moderate'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center">
                      {c.registrationStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRegistrationStatus(c._id, 'accepted')}
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white p-2 rounded-xl border border-emerald-500/20 transition-all active:scale-95"
                            title="Approve Registration"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateRegistrationStatus(c._id, 'rejected')}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-xl border border-red-500/20 transition-all active:scale-95"
                            title="Reject Registration"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : c.registrationStatus === 'rejected' ? (
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
                          Rejected
                        </span>
                      ) : (
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={c?.isActive !== false}
                            onChange={() => toggleCompanyActive(c)}
                          />
                          <div className={`h-6 w-11 rounded-full transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                            }`} />
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 px-2">
                       <IconButton 
                        icon={Eye} 
                        onClick={() => setSelectedCompany(c)} 
                        variant="zinc"
                        size={16}
                      />
                       <IconButton 
                        icon={PenLine} 
                        onClick={() => {
                          setEditCompanyErrors({})
                          setEditingCompany({ ...c })
                        }} 
                        variant="indigo"
                        size={16}
                      />
                       <IconButton 
                        icon={Trash} 
                        onClick={async () => {
                            if (window.confirm(`Permanently remove ${c.companyName}?`)) {
                                await dispatch(deleteCompany(c._id))
                                dispatch(fetchCompanies())
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
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={companies.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-2xl rounded-[2.5rem] border shadow-2xl ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'}`}>
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Onboard Entity</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCompany} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Company name *</label>
                  <input
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className={inputClass(companyFormErrors.companyName, isDark)}
                    placeholder="Registered name"
                  />
                  {companyFormErrors.companyName && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.companyName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Difficulty *</label>
                  <select
                    value={companyForm.companyDifficulty}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyDifficulty: e.target.value })}
                    className={inputClass(null, isDark)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">HQ location *</label>
                  <input
                    value={companyForm.companyLocation}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyLocation: e.target.value })}
                    className={inputClass(companyFormErrors.companyLocation, isDark)}
                    placeholder="City, country"
                  />
                  {companyFormErrors.companyLocation && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.companyLocation}</p>}
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Website *</label>
                  <input
                    value={companyForm.companyWebsite}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyWebsite: e.target.value })}
                    className={inputClass(companyFormErrors.companyWebsite, isDark)}
                    placeholder="https://"
                  />
                  {companyFormErrors.companyWebsite && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.companyWebsite}</p>}
                </div>
                <div className="md:col-span-2 space-y-1 pt-4 border-t dark:border-zinc-800">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Description *</label>
                  <textarea
                    value={companyForm.companyDescription}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyDescription: e.target.value })}
                    rows={2}
                    className={inputClass(companyFormErrors.companyDescription, isDark)}
                    placeholder="Short company summary"
                  />
                  {companyFormErrors.companyDescription && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.companyDescription}</p>}
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Login email *</label>
                  <input
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    type="email"
                    className={inputClass(companyFormErrors.email, isDark)}
                    placeholder="admin@company.com"
                  />
                  {companyFormErrors.email && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Password *</label>
                  <input
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    type="password"
                    className={inputClass(companyFormErrors.password, isDark)}
                    placeholder="At least 6 characters"
                  />
                  {companyFormErrors.password && <p className="mt-1 text-[10px] font-bold text-red-500">{companyFormErrors.password}</p>}
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700">
                    Finalize Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      <DetailViewerModal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} data={selectedCompany} title="Company Database Details" />

      {/* Edit Modal (Logic identical to Add Modal) */}
      {editingCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={() => setEditingCompany(null)} />
          <form onSubmit={handleUpdateCompany} className={`relative w-full max-w-2xl rounded-[2.5rem] border p-8 shadow-2xl ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Edit Configuration</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Company name *</label>
                <input
                  value={editingCompany.companyName}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, companyName: e.target.value }))}
                  className={inputClass(editCompanyErrors.companyName, isDark)}
                  placeholder="Registered name"
                />
                {editCompanyErrors.companyName && <p className="mt-1 text-[10px] font-bold text-red-500">{editCompanyErrors.companyName}</p>}
              </div>
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Difficulty *</label>
                <select
                  value={editingCompany.companyDifficulty}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, companyDifficulty: e.target.value }))}
                  className={inputClass(null, isDark)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">HQ location *</label>
                <input
                  value={editingCompany.companyLocation}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, companyLocation: e.target.value }))}
                  className={inputClass(editCompanyErrors.companyLocation, isDark)}
                  placeholder="City, country"
                />
                {editCompanyErrors.companyLocation && <p className="mt-1 text-[10px] font-bold text-red-500">{editCompanyErrors.companyLocation}</p>}
              </div>
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Website *</label>
                <input
                  value={editingCompany.companyWebsite}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, companyWebsite: e.target.value }))}
                  className={inputClass(editCompanyErrors.companyWebsite, isDark)}
                  placeholder="https://"
                />
                {editCompanyErrors.companyWebsite && <p className="mt-1 text-[10px] font-bold text-red-500">{editCompanyErrors.companyWebsite}</p>}
              </div>
              <div className="md:col-span-2 space-y-1 pt-4 border-t dark:border-zinc-800">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Description *</label>
                <textarea
                  value={editingCompany.companyDescription}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, companyDescription: e.target.value }))}
                  rows={2}
                  className={inputClass(editCompanyErrors.companyDescription, isDark)}
                  placeholder="Short company summary"
                />
                {editCompanyErrors.companyDescription && <p className="mt-1 text-[10px] font-bold text-red-500">{editCompanyErrors.companyDescription}</p>}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Login email *</label>
                <input
                  value={editingCompany.email}
                  onChange={(e) => setEditingCompany((s) => ({ ...s, email: e.target.value }))}
                  className={inputClass(editCompanyErrors.email, isDark)}
                  placeholder="admin@company.com"
                  type="email"
                />
                {editCompanyErrors.email && <p className="mt-1 text-[10px] font-bold text-red-500">{editCompanyErrors.email}</p>}
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCompany(null)
                  setEditCompanyErrors({})
                }}
                className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest border ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-2xl bg-zinc-950 py-4 text-xs font-black uppercase tracking-widest text-white dark:bg-zinc-50 dark:text-zinc-950">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}