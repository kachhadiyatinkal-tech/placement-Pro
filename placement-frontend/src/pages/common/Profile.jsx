import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api, API_BASE_URL } from '../../services/axios'
import { toastError, toastSuccess } from '../../utils/toast'
import { setRole } from '../../features/auth/authSlice'
import { User, Camera, CheckCircle, Globe, MapPin, BarChart, Book, Save } from 'lucide-react'
import FormError from '../../components/FormError'
import handleApiError from '../../utils/handleApiError'
import {
  validateEmail,
  validateNumberRequired,
  validatePhoneRequired,
  validateRequired,
} from '../../utils/validation'

const DEPTS = ['Computer', 'Civil', 'ECS', 'AIDS', 'Mechanical']

function collectProfileErrors(role, form) {
  const o = {}
  const add = (key, msg) => {
    if (msg) o[key] = msg
  }
  if (role === 'company') {
    add('companyName', validateRequired(form.companyName, 'Company name'))
    add('email', validateEmail(form.email))
    add('companyWebsite', validateRequired(form.companyWebsite, 'Website'))
    add('companyLocation', validateRequired(form.companyLocation, 'Location'))
    add('companyDescription', validateRequired(form.companyDescription, 'Description'))
  } else {
    add('first_name', validateRequired(form.first_name, 'First name'))
    add('middle_name', validateRequired(form.middle_name, 'Middle name'))
    add('last_name', validateRequired(form.last_name, 'Last name'))
    add('email', validateEmail(form.email))
    add('number', validatePhoneRequired(form.number))
    add('gender', validateRequired(form.gender, 'Gender'))
    add('dateOfBirth', validateRequired(form.dateOfBirth, 'Date of birth'))
    add('address', validateRequired(form.address, 'Address'))
    add('pincode', validateRequired(form.pincode, 'Pincode'))
    if (role === 'tpo') add('tpoPosition', validateRequired(form.tpoPosition, 'Position'))
    if (role === 'management' || role === 'admin') {
      add('managementPosition', validateRequired(form.managementPosition, 'Position'))
    }
    if (role === 'student') {
      add('rollNumber', validateRequired(form.rollNumber, 'Roll number'))
      add('UIN', validateRequired(form.UIN, 'UIN'))
      add('department', validateRequired(form.department, 'Department'))
      add('year', validateRequired(form.year, 'Year'))
      add('addmissionYear', validateNumberRequired(form.addmissionYear, 'Admission year', 1990, 2035))
      add('liveKT', validateNumberRequired(form.liveKT, 'Live KT', 0, 50))
      for (let n = 1; n <= 8; n++) {
        const k = `sem${n}`
        add(`sgpa_${k}`, validateNumberRequired(form.sgpa[k], `Semester ${n} SGPA`, 0, 10))
      }
      add('ssc_board', validateRequired(form.ssc.board, 'SSC board'))
      add('ssc_percentage', validateNumberRequired(form.ssc.percentage, 'SSC percentage', 0, 100))
      add('ssc_year', validateNumberRequired(form.ssc.year, 'SSC year', 1990, 2035))
      add('hsc_board', validateRequired(form.hsc.board, 'HSC board'))
      add('hsc_percentage', validateNumberRequired(form.hsc.percentage, 'HSC percentage', 0, 100))
      add('hsc_year', validateNumberRequired(form.hsc.year, 'HSC year', 1990, 2035))
      add('diploma_department', validateRequired(form.diploma.department, 'Diploma department'))
      add('diploma_percentage', validateNumberRequired(form.diploma.percentage, 'Diploma percentage', 0, 100))
      add('diploma_year', validateNumberRequired(form.diploma.year, 'Diploma year', 1990, 2035))
    }
  }
  return o
}

function isoToDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function Profile() {
  const dispatch = useDispatch()
  const role = useSelector((s) => s.auth.role) || localStorage.getItem('role')
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    number: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    pincode: '',
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyLocation: '',
    companyDifficulty: 'Moderate',
    tpoPosition: '',
    managementPosition: '',
    rollNumber: '',
    UIN: '',
    department: '',
    year: '',
    addmissionYear: '',
    gap: false,
    liveKT: '',
    sgpa: { sem1: '', sem2: '', sem3: '', sem4: '', sem5: '', sem6: '', sem7: '', sem8: '' },
    ssc: { board: '', percentage: '', year: '' },
    hsc: { board: '', percentage: '', year: '' },
    diploma: { department: '', percentage: '', year: '' },
  })

  const labelStyle = `mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wider ${
    isDark ? 'text-zinc-500' : 'text-zinc-500'
  }`
  const inputBase = `w-full rounded-2xl border px-4 py-3 text-[15px] leading-snug outline-none transition-all focus:ring-4 focus:ring-indigo-500/15 ${
    isDark
      ? 'border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500'
      : 'border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600'
  }`
  const fieldClass = (key) => `${inputBase}${fieldErrors[key] ? ' border-red-500 ring-1 ring-red-500/25' : ''}`
  const touch = (key) => {
    setFieldErrors((er) => {
      if (!er[key]) return er
      const n = { ...er }
      delete n[key]
      return n
    })
  }

  const cardStyle = `rounded-[2rem] border p-8 shadow-xl transition-all ${
    isDark ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' : 'border-white/80 bg-white/90 backdrop-blur-xl shadow-zinc-200/40'
  }`

  async function loadProfile() {
    setLoading(true)
    try {
      if (role === 'company') {
        const res = await api.get('/api/v1/company/my-profile')
        const company = res?.data?.company || {}
        setProfile(company)
        setForm((f) => ({
          ...f,
          companyName: company.companyName || '',
          companyDescription: company.companyDescription || '',
          companyWebsite: company.companyWebsite || '',
          companyLocation: company.companyLocation || '',
          companyDifficulty: company.companyDifficulty || 'Moderate',
          email: company.email || '',
        }))
      } else {
        const res = await api.get('/api/v1/user/detail')
        const user = res?.data || {}
        setProfile(user)
        if (user.role) dispatch(setRole(user.role))

        const sp = user.studentProfile || {}
        const sg = sp.SGPA || {}
        const pq = sp.pastQualification || {}

        setForm((f) => ({
          ...f,
          first_name: user.first_name || '',
          middle_name: user.middle_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          number: user.number != null && user.number !== '' ? String(user.number) : '',
          gender: user.gender || '',
          dateOfBirth: isoToDateInput(user.dateOfBirth),
          address: user.fullAddress?.address || '',
          pincode: user.fullAddress?.pincode != null ? String(user.fullAddress.pincode) : '',
          tpoPosition: user.tpoProfile?.position || '',
          managementPosition: user.managementProfile?.position || '',
          rollNumber: sp.rollNumber != null ? String(sp.rollNumber) : '',
          UIN: sp.UIN || sp.uin || '',
          department: sp.department || '',
          year: sp.year != null ? String(sp.year) : '',
          addmissionYear: sp.addmissionYear != null ? String(sp.addmissionYear) : '',
          gap: Boolean(sp.gap),
          liveKT: sp.liveKT != null ? String(sp.liveKT) : '',
          sgpa: {
            sem1: sg.sem1 != null ? String(sg.sem1) : '',
            sem2: sg.sem2 != null ? String(sg.sem2) : '',
            sem3: sg.sem3 != null ? String(sg.sem3) : '',
            sem4: sg.sem4 != null ? String(sg.sem4) : '',
            sem5: sg.sem5 != null ? String(sg.sem5) : '',
            sem6: sg.sem6 != null ? String(sg.sem6) : '',
            sem7: sg.sem7 != null ? String(sg.sem7) : '',
            sem8: sg.sem8 != null ? String(sg.sem8) : '',
          },
          ssc: {
            board: pq.ssc?.board || '',
            percentage: pq.ssc?.percentage != null ? String(pq.ssc.percentage) : '',
            year: pq.ssc?.year != null ? String(pq.ssc.year) : '',
          },
          hsc: {
            board: pq.hsc?.board || '',
            percentage: pq.hsc?.percentage != null ? String(pq.hsc.percentage) : '',
            year: pq.hsc?.year != null ? String(pq.hsc.year) : '',
          },
          diploma: {
            department: pq.diploma?.department || '',
            percentage: pq.diploma?.percentage != null ? String(pq.diploma.percentage) : '',
            year: pq.diploma?.year != null ? String(pq.diploma.year) : '',
          },
        }))
      }
    } catch (err) {
      toastError(err?.response?.data?.msg || err?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [role])

  const avatarUrl = useMemo(() => {
    const raw = role === 'company' ? profile?.logo : profile?.profile
    if (!raw) return ''
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw
    return `${API_BASE_URL}${raw}`
  }, [profile, role])

  async function handleSave(e) {
    e.preventDefault()
    const ve = collectProfileErrors(role, form)
    setFieldErrors(ve)
    if (Object.keys(ve).length > 0) {
      setFormError('Please complete all required fields')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      if (role === 'company') {
        await api.post('/api/v1/company/update-profile', {
          companyName: form.companyName,
          companyDescription: form.companyDescription,
          companyWebsite: form.companyWebsite,
          companyLocation: form.companyLocation,
          companyDifficulty: form.companyDifficulty,
          email: form.email,
        })
      } else {
        const body = {
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          email: form.email,
          number: form.number ? Number(form.number) : undefined,
          gender: form.gender || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          fullAddress: {
            address: form.address || undefined,
            pincode: form.pincode ? Number(form.pincode) : undefined,
          },
        }
        if (role === 'tpo') {
          body.tpoProfile = { position: form.tpoPosition }
        }
        if (role === 'management' || role === 'admin') {
          body.managementProfile = { position: form.managementPosition }
        }
        if (role === 'student') {
          body.studentProfile = {
            rollNumber: form.rollNumber ? Number(form.rollNumber) : undefined,
            UIN: form.UIN || undefined,
            department: form.department || undefined,
            year: form.year ? Number(form.year) : undefined,
            addmissionYear: form.addmissionYear ? Number(form.addmissionYear) : undefined,
            gap: form.gap,
            liveKT: form.liveKT !== '' ? Number(form.liveKT) : undefined,
            SGPA: Object.fromEntries(
              Object.entries(form.sgpa).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, Number(v)]),
            ),
            pastQualification: {
              ssc: {
                board: form.ssc.board || undefined,
                percentage: form.ssc.percentage !== '' ? Number(form.ssc.percentage) : undefined,
                year: form.ssc.year !== '' ? Number(form.ssc.year) : undefined,
              },
              hsc: {
                board: form.hsc.board || undefined,
                percentage: form.hsc.percentage !== '' ? Number(form.hsc.percentage) : undefined,
                year: form.hsc.year !== '' ? Number(form.hsc.year) : undefined,
              },
              diploma: {
                department: form.diploma.department || undefined,
                percentage: form.diploma.percentage !== '' ? Number(form.diploma.percentage) : undefined,
                year: form.diploma.year !== '' ? Number(form.diploma.year) : undefined,
              },
            },
          }
        }
        await api.post('/api/v1/user/update-profile', body)
      }
      toastSuccess('Profile updated successfully')
      setFieldErrors({})
      await loadProfile()
    } catch (err) {
      const parsed = handleApiError(err)
      if (parsed.errors && Object.keys(parsed.errors).length) {
        setFieldErrors((prev) => ({ ...prev, ...parsed.errors }))
      } else {
        setFormError(parsed.message || 'Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadAvatar() {
    if (!avatarFile) return
    const fd = new FormData()
    fd.append('profileImgs', avatarFile)
    try {
      if (role === 'company') {
        await api.post('/api/v1/company/upload-logo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post('/api/v1/user/upload-photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toastSuccess('Avatar updated successfully')
      setAvatarFile(null)
      await loadProfile()
    } catch (err) {
      toastError(err?.response?.data?.msg || err?.message || 'Failed to upload avatar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Loading profile…</p>
      </div>
    )
  }

  const displayRole = role === 'admin' ? 'Admin' : role === 'management' ? 'Management' : role

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-[#8b5cf6]">
          Account
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My profile</h1>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Keep your details accurate for placements and communications.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className={cardStyle}>
            <div className="flex flex-col items-center text-center">
              <div className="group relative">
                <img
                  src={avatarUrl || `${API_BASE_URL}/profileImgs/default/defaultProfileImg.jpg`}
                  alt="Avatar"
                  className="h-32 w-32 rounded-[2rem] border-4 border-[#8b5cf6]/15 object-cover shadow-lg transition-transform group-hover:scale-[1.02]"
                />
                <label className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-4 border-white bg-[#8b5cf6] text-white shadow-lg hover:bg-[#8b5cf6] dark:border-zinc-900">
                  <Camera size={18} />
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              <h2 className="mt-6 text-xl font-bold tracking-tight">
                {role === 'company' ? form.companyName : [form.first_name, form.last_name].filter(Boolean).join(' ') || 'User'}
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-[#8b5cf6]">{displayRole}</p>

              {avatarFile && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20"
                >
                  <CheckCircle /> Save photo
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className={`${cardStyle} space-y-8 lg:col-span-2`}>
          <FormError error={formError} className="mt-0" />
          <div className={`flex items-center gap-2 border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <User className="text-[#8b5cf6] dark:text-[#8b5cf6]" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Details</h3>
          </div>

          {role === 'company' ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelStyle}>Company name *</label>
                <input
                  value={form.companyName}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, companyName: e.target.value }))
                    touch('companyName')
                  }}
                  className={fieldClass('companyName')}
                  placeholder="Registered company name"
                />
              </div>
              <div>
                <label className={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, email: e.target.value }))
                    touch('email')
                  }}
                  className={fieldClass('email')}
                  placeholder="hr@company.com"
                />
              </div>
              <div>
                <label className={labelStyle}>Website *</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    value={form.companyWebsite}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, companyWebsite: e.target.value }))
                      touch('companyWebsite')
                    }}
                    className={`${fieldClass('companyWebsite')} pl-11`}
                    placeholder="https://"
                  />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    value={form.companyLocation}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, companyLocation: e.target.value }))
                      touch('companyLocation')
                    }}
                    className={`${fieldClass('companyLocation')} pl-11`}
                    placeholder="City, region"
                  />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Recruitment difficulty *</label>
                <div className="relative">
                  <BarChart className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <select
                    value={form.companyDifficulty}
                    onChange={(e) => setForm((s) => ({ ...s, companyDifficulty: e.target.value }))}
                    className={`${fieldClass('companyDifficulty')} pl-11 appearance-none`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Description *</label>
                <textarea
                  value={form.companyDescription}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, companyDescription: e.target.value }))
                    touch('companyDescription')
                  }}
                  rows={4}
                  className={`${fieldClass('companyDescription')} resize-none`}
                  placeholder="Company overview for students"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>First name *</label>
                  <input
                    value={form.first_name}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, first_name: e.target.value }))
                      touch('first_name')
                    }}
                    className={fieldClass('first_name')}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Middle name *</label>
                  <input
                    value={form.middle_name}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, middle_name: e.target.value }))
                      touch('middle_name')
                    }}
                    className={fieldClass('middle_name')}
                    placeholder="Middle name (or —)"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Last name *</label>
                  <input
                    value={form.last_name}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, last_name: e.target.value }))
                      touch('last_name')
                    }}
                    className={fieldClass('last_name')}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Date of birth *</label>
                  <input
                    type="date"
                    title="Your date of birth"
                    value={form.dateOfBirth}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, dateOfBirth: e.target.value }))
                      touch('dateOfBirth')
                    }}
                    className={fieldClass('dateOfBirth')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelStyle}>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, email: e.target.value }))
                      touch('email')
                    }}
                    className={fieldClass('email')}
                    placeholder="you@college.edu"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Phone *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.number}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, number: e.target.value }))
                      touch('number')
                    }}
                    className={fieldClass('number')}
                    placeholder="10-digit number"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, gender: e.target.value }))
                      touch('gender')
                    }}
                    className={`${fieldClass('gender')} appearance-none`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelStyle}>Address *</label>
                  <input
                    value={form.address}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, address: e.target.value }))
                      touch('address')
                    }}
                    className={fieldClass('address')}
                    placeholder="Street, area"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Pincode *</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, pincode: e.target.value }))
                      touch('pincode')
                    }}
                    className={fieldClass('pincode')}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              {role === 'tpo' && (
                <div>
                  <label className={labelStyle}>Position / title *</label>
                  <input
                    value={form.tpoPosition}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, tpoPosition: e.target.value }))
                      touch('tpoPosition')
                    }}
                    className={fieldClass('tpoPosition')}
                    placeholder="e.g. Training & Placement Officer"
                  />
                </div>
              )}

              {(role === 'management' || role === 'admin') && (
                <div>
                  <label className={labelStyle}>Position / title *</label>
                  <input
                    value={form.managementPosition}
                    onChange={(e) => {
                      setForm((s) => ({ ...s, managementPosition: e.target.value }))
                      touch('managementPosition')
                    }}
                    className={fieldClass('managementPosition')}
                    placeholder="Your role at the institute"
                  />
                </div>
              )}

              {role === 'student' && (
                <>
                  <div className={`flex items-center gap-2 border-b pb-3 pt-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <Book className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Academic</h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelStyle}>Roll number *</label>
                      <input
                        value={form.rollNumber}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, rollNumber: e.target.value }))
                          touch('rollNumber')
                        }}
                        className={fieldClass('rollNumber')}
                        placeholder="Institute roll no."
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>UIN *</label>
                      <input
                        value={form.UIN}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, UIN: e.target.value }))
                          touch('UIN')
                        }}
                        className={fieldClass('UIN')}
                        placeholder="Unique identification number"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Department *</label>
                      <select
                        value={form.department}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, department: e.target.value }))
                          touch('department')
                        }}
                        className={`${fieldClass('department')} appearance-none`}
                      >
                        <option value="">Select department</option>
                        {DEPTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Year *</label>
                      <select
                        value={form.year}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, year: e.target.value }))
                          touch('year')
                        }}
                        className={`${fieldClass('year')} appearance-none`}
                      >
                        <option value="">Select year</option>
                        {[1, 2, 3, 4].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Admission year *</label>
                      <input
                        value={form.addmissionYear}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, addmissionYear: e.target.value }))
                          touch('addmissionYear')
                        }}
                        className={fieldClass('addmissionYear')}
                        placeholder="e.g. 2022"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Live KT *</label>
                      <input
                        value={form.liveKT}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, liveKT: e.target.value }))
                          touch('liveKT')
                        }}
                        className={fieldClass('liveKT')}
                        type="number"
                        min={0}
                        placeholder="0 if none"
                      />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        id="gap"
                        type="checkbox"
                        checked={form.gap}
                        onChange={(e) => setForm((s) => ({ ...s, gap: e.target.checked }))}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                      />
                      <label htmlFor="gap" className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Education gap year
                      </label>
                    </div>
                  </div>

                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>SGPA * (all semesters)</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                      const key = `sem${n}`
                      const errKey = `sgpa_${key}`
                      return (
                        <div key={key}>
                          <label className={labelStyle}>Sem {n} *</label>
                          <input
                            value={form.sgpa[key]}
                            onChange={(e) => {
                              setForm((s) => ({ ...s, sgpa: { ...s.sgpa, [key]: e.target.value } }))
                              touch(errKey)
                            }}
                            className={fieldClass(errKey)}
                            inputMode="decimal"
                            placeholder="0–10"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Past qualifications *</p>
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      ['SSC', 'ssc', form.ssc],
                      ['HSC', 'hsc', form.hsc],
                      ['Diploma', 'diploma', form.diploma],
                    ].map(([title, key, block]) => (
                      <div key={key} className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-200 bg-zinc-50/80'}`}>
                        <p className="mb-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{title}</p>
                        <div className="space-y-3">
                          <div>
                            <label className={labelStyle}>{key === 'diploma' ? 'Department *' : 'Board *'}</label>
                            <input
                              value={key === 'diploma' ? block.department : block.board}
                              onChange={(e) => {
                                const sub = key === 'diploma' ? 'department' : 'board'
                                setForm((s) => ({
                                  ...s,
                                  [key]: { ...s[key], [sub]: e.target.value },
                                }))
                                touch(`${key}_${sub}`)
                              }}
                              className={fieldClass(`${key}_${key === 'diploma' ? 'department' : 'board'}`)}
                              placeholder={key === 'diploma' ? 'Branch or N/A' : 'Board name'}
                            />
                          </div>
                          <div>
                            <label className={labelStyle}>% *</label>
                            <input
                              value={block.percentage}
                              onChange={(e) => {
                                setForm((s) => ({ ...s, [key]: { ...s[key], percentage: e.target.value } }))
                                touch(`${key}_percentage`)
                              }}
                              className={fieldClass(`${key}_percentage`)}
                              placeholder="e.g. 85"
                            />
                          </div>
                          <div>
                            <label className={labelStyle}>Year *</label>
                            <input
                              value={block.year}
                              onChange={(e) => {
                                setForm((s) => ({ ...s, [key]: { ...s[key], year: e.target.value } }))
                                touch(`${key}_year`)
                              }}
                              className={fieldClass(`${key}_year`)}
                              placeholder="e.g. 2020"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8b5cf6] px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving…
              </>
            ) : (
              <>
                <Save size={18} /> Save changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
