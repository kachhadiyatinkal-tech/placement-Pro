import { useEffect, useMemo, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { fetchJobs } from '../../features/jobs/jobSlice'
import { fetchApplicantsByJob, updateStatus, scheduleInterview, uploadOfferLetter } from '../../features/applications/applicationSlice'
import { Users, Briefcase, Mail, Activity, Calendar, UploadCloud, CheckCircle, Download, Eye, X, Phone, GraduationCap, BookOpen, Award, FileText, Building2 } from 'lucide-react'
import Pagination from '../../components/common/Pagination'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Applicant Detail Modal ────────────────────────────────────────────────────
function ApplicantModal({ applicant, isDark, onClose }) {
  if (!applicant) return null

  const student = applicant?.studentId || {}
  const sp = student?.studentProfile || {}       // shorthand for studentProfile

  const studentName = applicant?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
  const email = applicant?.email || student?.email || '—'
  const contactNumber = student?.number ? String(student.number) : '—'
  const gender = student?.gender || null
  const resumeLink = applicant?.resume || sp?.resume?.filepath

  // Application-specific fields stored in studentProfile.appliedJobs[]
  // Match the entry by jobId (could be ObjectId string or populated object)
  const rawJobId = typeof applicant?.jobId === 'object' ? applicant?.jobId?._id : applicant?.jobId
  const appliedJobEntry = (sp?.appliedJobs || []).find(
    (j) => String(j?.jobId?._id || j?.jobId) === String(rawJobId)
  )
  const coverLetter = appliedJobEntry?.coverLetter || null
  const appPhone = appliedJobEntry?.phone || contactNumber
  const expectedGradYear = appliedJobEntry?.expectedGraduationYear || null

  // Resolve job details
  const jobObj = applicant?.jobId || {}
  const isJobPopulated = typeof jobObj === 'object' && jobObj?._id
  const jobTitle = isJobPopulated ? (jobObj?.jobTitle || '—') : '—'
  const rawCompany = isJobPopulated ? jobObj?.company : null
  const companyDisplayName = rawCompany
    ? (typeof rawCompany === 'object' ? rawCompany?.companyName : rawCompany)
    : '—'

  // Academic profile fields (directly on studentProfile)
  const department = sp?.department || null
  const uin = sp?.UIN || null
  const rollNumber = sp?.rollNumber || null
  const currentYear = sp?.year || null
  const admissionYear = sp?.addmissionYear || null
  const liveKT = sp?.liveKT ?? null
  const hasGap = sp?.gap ?? null

  // SGPA across all sems — only show sems that have a value
  const sgpa = sp?.SGPA || {}
  const sgpaEntries = ['sem1', 'sem2', 'sem3', 'sem4', 'sem5', 'sem6', 'sem7', 'sem8']
    .map((key) => ({ label: key.replace('sem', 'Sem '), value: sgpa[key] }))
    .filter((e) => e.value != null)

  // Past qualifications
  const ssc = sp?.pastQualification?.ssc
  const hsc = sp?.pastQualification?.hsc
  const diploma = sp?.pastQualification?.diploma
  const hasPastQuals = ssc?.percentage || hsc?.percentage || diploma?.percentage

  // Internships
  const internships = sp?.internships || []

  const appliedAt = applicant?.createdAt
    ? new Date(applicant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  // Interview details — supports both top-level fields and sub-doc
  const iDate = applicant?.interviewDate || applicant?.interviewDetails?.date
  const iLink = applicant?.interviewLink || applicant?.interviewDetails?.meetingLink
  const interviewDate = iDate ? new Date(iDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

  const statusColors = {
    applied: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
    under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shortlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    interview: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const statusKey = String(applicant?.status || 'applied').toLowerCase()
  const statusClass = statusColors[statusKey] || statusColors.applied

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all ${isDark
          ? 'bg-stone-950 border-stone-800'
          : 'bg-white border-stone-200'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="relative overflow-hidden rounded-t-3xl px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
        >
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {(studentName || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
                <Users size={10} /> Applicant Profile
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{studentName}</h2>
              <p className="text-white/70 text-sm mt-0.5">{email}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="relative mt-4 flex items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass}`}>
              {(applicant?.status || 'applied').replace('_', ' ')}
            </span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest">Applied on {appliedAt}</span>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="px-8 py-6 space-y-6">

          {/* ── Application Submission Details ── */}
          <Section isDark={isDark} icon={<FileText size={15} className="text-[#8b5cf6]" />} title="Application Submission">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard isDark={isDark} icon={<Mail size={14} className="text-[#8b5cf6]" />} label="Email">{email}</InfoCard>
              <InfoCard isDark={isDark} icon={<Phone size={14} className="text-[#8b5cf6]" />} label="Contact Phone">{appPhone}</InfoCard>
              <InfoCard isDark={isDark} icon={<Briefcase size={14} className="text-[#8b5cf6]" />} label="Applied For">{jobTitle}</InfoCard>
              <InfoCard isDark={isDark} icon={<Building2 size={14} className="text-[#8b5cf6]" />} label="Company">{companyDisplayName}</InfoCard>
              <InfoCard isDark={isDark} icon={<Calendar size={14} className="text-[#8b5cf6]" />} label="Expected Graduation Year">{expectedGradYear || '—'}</InfoCard>
              {gender && (
                <InfoCard isDark={isDark} icon={<Users size={14} className="text-[#8b5cf6]" />} label="Gender">{gender}</InfoCard>
              )}
            </div>

            {/* Cover Letter */}
            {coverLetter && (
              <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 flex items-center gap-1.5">
                  <FileText size={11} className="text-[#8b5cf6]" /> Cover Letter
                </p>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  {coverLetter}
                </p>
              </div>
            )}
          </Section>

          {/* ── Academic Profile ── */}
          {(department || uin || rollNumber || sgpaEntries.length > 0) && (
            <Section isDark={isDark} icon={<GraduationCap size={15} className="text-[#8b5cf6]" />} title="Academic Profile">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {department && <MiniStat label="Department" value={department} />}
                {uin && <MiniStat label="UIN" value={uin} />}
                {rollNumber && <MiniStat label="Roll Number" value={rollNumber} />}
                {currentYear && <MiniStat label="Current Year" value={`Year ${currentYear}`} />}
                {admissionYear && <MiniStat label="Admission Year" value={admissionYear} />}
                {hasGap != null && <MiniStat label="Gap Year" value={hasGap ? 'Yes' : 'No'} />}
              </div>

              {sgpaEntries.length > 0 && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Semester SGPA</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {sgpaEntries.map((e) => (
                      <div key={e.label} className={`rounded-xl border p-2 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-stone-500">{e.label}</p>
                        <p className={`text-sm font-black mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{e.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>
          )}

          {/* ── Past Qualifications ── */}
          {hasPastQuals && (
            <Section isDark={isDark} icon={<BookOpen size={15} className="text-[#8b5cf6]" />} title="Past Qualifications">
              <div className="space-y-3">
                {ssc?.percentage && (
                  <QualCard isDark={isDark} title="SSC (10th)" board={ssc.board} percentage={ssc.percentage} year={ssc.year} />
                )}
                {hsc?.percentage && (
                  <QualCard isDark={isDark} title="HSC (12th)" board={hsc.board} percentage={hsc.percentage} year={hsc.year} />
                )}
                {diploma?.percentage && (
                  <QualCard isDark={isDark} title={`Diploma${diploma.department ? ` — ${diploma.department}` : ''}`} percentage={diploma.percentage} year={diploma.year} />
                )}
              </div>
            </Section>
          )}

          {/* ── Internships ── */}
          {internships.length > 0 && (
            <Section isDark={isDark} icon={<Award size={15} className="text-[#8b5cf6]" />} title="Internships">
              <div className="space-y-3">
                {internships.map((intern, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-sm">{intern?.companyName || '—'}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {intern?.type || ''}{intern?.internshipDuration ? ` · ${intern.internshipDuration} months` : ''}
                        </p>
                      </div>
                      {intern?.monthlyStipend && (
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                          ₹{intern.monthlyStipend}/mo
                        </span>
                      )}
                    </div>
                    {intern?.description && (
                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{intern.description}</p>
                    )}
                    {(intern?.startDate || intern?.endDate) && (
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                        {intern.startDate ? new Date(intern.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
                        {intern.endDate ? ` → ${new Date(intern.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Interview Details ── */}
          {interviewDate && (
            <Section isDark={isDark} icon={<Calendar size={15} className="text-orange-500" />} title="Interview Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard isDark={isDark} icon={<Calendar size={13} className="text-orange-500" />} label="Interview Date">
                  {interviewDate}
                </InfoCard>
                {iLink && (
                  <InfoCard isDark={isDark} icon={<Activity size={13} className="text-orange-500" />} label="Meeting Link">
                    <a href={iLink} target="_blank" rel="noreferrer" className="text-[#8b5cf6] hover:underline break-all">
                      {iLink}
                    </a>
                  </InfoCard>
                )}
              </div>
            </Section>
          )}

          {/* ── Offer Letter ── */}
          {applicant?.status === 'selected' && applicant?.offerLetter && (
            <Section isDark={isDark} icon={<CheckCircle size={15} className="text-emerald-500" />} title="Offer Letter">
              <a
                href={applicant.offerLetter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <FileText size={13} /> View Offer Letter
              </a>
            </Section>
          )}

          {/* ── Resume ── */}
          {resumeLink && (
            <Section isDark={isDark} icon={<FileText size={15} className="text-[#8b5cf6]" />} title="Resume">
              <a
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 px-4 py-2 text-xs font-bold text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-all"
              >
                <Download size={13} /> Download Resume
              </a>
            </Section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={`px-8 py-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
          <button
            onClick={onClose}
            className={`w-full rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDark
              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Small helper components ─────────────────────────────────────────────────
function InfoCard({ isDark, icon, label, children }) {
  return (
    <div className={`rounded-xl border p-3 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{label}</span>
      </div>
      <p className={`text-sm font-semibold break-all ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
        {children || '—'}
      </p>
    </div>
  )
}

function Section({ isDark, icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-500">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-0.5">{label}</span>
      <span className="text-sm font-bold">{value ?? '—'}</span>
    </div>
  )
}

function QualCard({ isDark, title, board, percentage, year }) {
  return (
    <div className={`rounded-xl border p-3 flex items-center justify-between gap-4 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
      }`}>
      <div>
        <p className="text-sm font-bold">{title}</p>
        {board && <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{board}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-black text-[#8b5cf6]">{percentage}%</p>
        {year && <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{year}</p>}
      </div>
    </div>
  )
}

// ─── Main Applicants Page ──────────────────────────────────────────────────────
export default function Applicants() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { jobs } = useSelector((s) => s.jobs)
  const { applicantsByJob, loading: applicationsLoading } = useSelector((s) => s.applications)

  const [jobId, setJobId] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewApplicant, setViewApplicant] = useState(null)

  const fileInputRef = useRef(null)
  const [activeUploadId, setActiveUploadId] = useState(null)

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  // Once jobs are loaded, fetch applicants for every job so we can show all by default
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      jobs.forEach((j) => {
        const id = j?._id || j?.id
        if (id) dispatch(fetchApplicantsByJob(id))
      })
    }
  }, [dispatch, jobs])

  useEffect(() => {
    if (jobId) {
      dispatch(fetchApplicantsByJob(jobId))
    }
  }, [dispatch, jobId])

  // When no job selected, show all applicants merged; otherwise filter by selected job
  const applicants = useMemo(() => {
    if (jobId) return applicantsByJob[jobId] || []
    // Merge all applicants from all fetched jobs, deduplicate by _id
    const seen = new Set()
    const all = []
    Object.values(applicantsByJob).forEach((list) => {
      (list || []).forEach((a) => {
        const id = a?._id || a?.id
        if (id && !seen.has(id)) {
          seen.add(id)
          all.push(a)
        }
      })
    })
    return all
  }, [applicantsByJob, jobId])

  // Are we still loading initial data (no applicants fetched yet)?
  const isInitialLoading = applicationsLoading && Object.keys(applicantsByJob).length === 0

  const totalPages = Math.max(1, Math.ceil(applicants.length / itemsPerPage))
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return applicants.slice(start, start + itemsPerPage)
  }, [applicants, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [jobId])

  const statusClasses = (status) => {
    const s = String(status || 'applied').toLowerCase()
    if (s === 'applied') return 'bg-stone-500/10 text-stone-500 border-stone-500/20'
    if (s === 'under_review') return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    if (s === 'shortlisted') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (s === 'interview') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (s === 'selected') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-stone-500/10 text-stone-500 border-stone-500/20'
  }

  async function handleStatusChange(app, nextStatus) {
    const id = app?._id || app?.id
    if (!id || !nextStatus || nextStatus === app.status) return

    setUpdatingId(id)

    if (nextStatus === 'interview') {
      const interviewDate = window.prompt('Interview Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
      if (!interviewDate) { setUpdatingId(''); return; }
      const interviewLink = window.prompt('Meeting Link (Optional):', '')
      await dispatch(scheduleInterview({ id, interviewDate, interviewLink }))
    } else {
      await dispatch(updateStatus({ id, status: nextStatus, interviewDetails: {} }))
    }

    setUpdatingId('')
  }

  const handleUploadClick = (id) => {
    setActiveUploadId(id)
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !activeUploadId) return

    setUpdatingId(activeUploadId)
    await dispatch(uploadOfferLetter({ id: activeUploadId, file }))
    setUpdatingId('')
    setActiveUploadId(null)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const companyName = (j) =>
    typeof j?.company === 'object' ? j?.company?.companyName : j?.companyName || j?.company || 'Company'

  // Helper: resolve job title + company for an application row
  // Works whether jobId is populated (object) or just an ID string
  function resolveJobInfo(a) {
    const jobObj = a?.jobId
    if (jobObj && typeof jobObj === 'object' && jobObj?._id) {
      const jTitle = jobObj?.jobTitle || '—'
      const jCompany = typeof jobObj?.company === 'object'
        ? (jobObj?.company?.companyName || '—')
        : (jobObj?.company || '—')
      return { jobTitle: jTitle, company: jCompany }
    }
    // jobId is a plain string — look up in jobs list
    const jobIdStr = typeof jobObj === 'string' ? jobObj : (a?.jobId?._id || '')
    const found = (jobs || []).find((j) => (j?._id || j?.id) === jobIdStr)
    if (found) {
      return { jobTitle: found?.jobTitle || '—', company: companyName(found) }
    }
    return { jobTitle: '—', company: '—' }
  }

  // ─── PDF Export ────────────────────────────────────────────────────────────
  function handleDownloadPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Resolve the selected job label for report title
    const selectedJob = jobId ? (jobs || []).find((j) => (j?._id || j?.id) === jobId) : null
    const jobLabel = selectedJob
      ? `${selectedJob?.jobTitle || 'Job'} — ${companyName(selectedJob)}`
      : 'All Jobs'

    // Purple header strip
    doc.setFillColor(139, 92, 246)
    doc.rect(0, 0, pageWidth, 50, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Applicants Report', 40, 33)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 40, 33, { align: 'right' })

    // Sub-header: filter info + count
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.text(
      `Total records: ${applicants.length}  |  Filter: ${jobLabel}`,
      40,
      65,
    )

    const rows = applicants.map((a, i) => {
      const student = a?.studentId || {}
      const studentName = a?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
      const email = a?.email || student?.email || '—'
      const { jobTitle, company } = resolveJobInfo(a)
      const status = (a?.status || 'applied').replace('_', ' ').toUpperCase()
      const appliedAt = a?.createdAt
        ? new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'
      return [i + 1, studentName, email, jobTitle, company, status, appliedAt]
    })

    autoTable(doc, {
      startY: 80,
      head: [['#', 'STUDENT', 'EMAIL', 'JOB TITLE', 'COMPANY', 'STATUS', 'APPLIED ON']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 8, lineColor: [240, 240, 240], lineWidth: 0.5 },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center' },
        6: { halign: 'center' },
      },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 15,
          { align: 'center' },
        )
      },
    })

    const safeName = jobId && selectedJob
      ? (selectedJob?.jobTitle || 'job').toLowerCase().replace(/\s+/g, '-')
      : 'all-jobs'
    doc.save(`applicants-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const cardStyle = `rounded-2xl border p-6 shadow-2xl transition-all ${isDark
    ? 'border-stone-800 bg-stone-900/50 backdrop-blur-xl'
    : 'border-white bg-white/80 backdrop-blur-xl shadow-stone-200/50'
    }`

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      {/* Hidden File Input for Offer Letter */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />

      {/* Applicant Detail Modal */}
      {viewApplicant && (
        <ApplicantModal
          applicant={viewApplicant}
          isDark={isDark}
          onClose={() => setViewApplicant(null)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="inline-block w-fit rounded-xl bg-[#8b5cf6]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-[#8b5cf6] border border-[#8b5cf6]/20">
          Recruitment
        </div>
        <h1 className="text-4xl font-black tracking-tight">Applicants</h1>
        <p className={`text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}>
          Review and manage candidates for your active job listings.
        </p>
      </div>

      {/* Filter Card */}
      <div className={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-stone-500 mb-2 block">
              Select Active Job
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b5cf6]" />
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all appearance-none focus:ring-4 focus:ring-indigo-500/10 ${isDark
                  ? 'border-stone-800 bg-stone-950 focus:border-indigo-500 text-stone-100'
                  : 'border-stone-200 bg-stone-50 focus:border-indigo-600 text-stone-900'
                  }`}
              >
                <option value="">Choose a job to view candidates...</option>
                {(jobs || []).map((j) => (
                  <option key={j?._id || j?.id} value={j?._id || j?.id}>
                    {j?.jobTitle || j?.title || 'Job'} — {companyName(j)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            <div className="px-6 py-3 rounded-2xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-tight text-stone-500">Total Applicants</p>
              <p className="text-xl font-black text-[#8b5cf6]">{applicants.length}</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!applicants.length}
              title="Download PDF report"
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 ${isDark
                ? 'border-stone-700 bg-stone-900 text-stone-300 hover:border-[#8b5cf6] hover:text-[#8b5cf6]'
                : 'border-stone-200 bg-white text-stone-600 hover:border-[#8b5cf6] hover:text-[#8b5cf6] shadow-sm'
                }`}
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {isInitialLoading && (
        <div className="flex justify-center p-10">
          <Loader label="Syncing candidate data..." />
        </div>
      )}

      {/* Table Container */}
      <div className={`${cardStyle} !p-0 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`${isDark ? 'bg-stone-950/50' : 'bg-stone-50/50'} border-b border-stone-500/10`}>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><Users size={16} className="text-[#8b5cf6]" /> Student</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><Mail size={16} className="text-[#8b5cf6]" /> Email</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><Briefcase size={16} className="text-[#8b5cf6]" /> Applied For</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Action</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">
                  <div className="flex items-center gap-2 justify-end"><Activity size={16} className="text-[#8b5cf6]" /> Current Status</div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-stone-800' : 'divide-stone-200'}`}>
              {paginatedApplicants.map((a, idx) => {
                const student = a?.studentId || {}
                const studentName = a?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
                const email = a?.email || student?.email || '—'
                const resumeLink = a?.resume || student?.studentProfile?.resume?.filepath
                const profileLink = student?.profile
                const appId = a?._id || a?.id
                const isSelected = a?.status === 'selected'

                // Resolve job details
                const jobObj = a?.jobId || {}
                const isJobPopulated = typeof jobObj === 'object' && jobObj?._id
                const jobTitle = isJobPopulated ? (jobObj?.jobTitle || '—') : '—'
                const rawCompany = isJobPopulated ? jobObj?.company : null
                const companyDisplayName = rawCompany
                  ? (typeof rawCompany === 'object' ? rawCompany?.companyName : rawCompany)
                  : '—'

                return (
                  <tr
                    key={appId || `applicant-${idx}`}
                    className={`group hover:bg-indigo-600/[0.02] transition-colors ${updatingId === appId ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {(studentName || 'S').charAt(0)}
                        </div>
                        <span className="font-bold tracking-tight text-base">
                          {studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`font-medium ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                        {email}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#8b5cf6] tracking-tight">{jobTitle}</span>
                        <span className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${isDark ? "text-stone-500" : "text-stone-400"}`}>{companyDisplayName}</span>
                      </div>
                    </td>
                    {/* View Button */}
                    <td className="px-8 py-5">
                      <button
                        type="button"
                        onClick={() => setViewApplicant(a)}
                        title="View applicant details"
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDark
                          ? 'border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white hover:border-[#8b5cf6]'
                          : 'border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white hover:border-[#8b5cf6]'
                          }`}
                      >
                        <Eye size={11} />
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClasses(a?.status)}`}>
                          {a?.status?.replace('_', ' ') || 'Applied'}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-3 flex justify-end">
                          {a?.offerLetter ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                              <CheckCircle size={10} /> Offer Uploaded
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUploadClick(appId)}
                              className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <UploadCloud size={10} /> Upload Offer Letter
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {!applicants.length && !isInitialLoading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={48} className="text-stone-500" />
                      <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
                        {jobId ? 'No candidates found for this listing' : 'No applications found'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!!applicants.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={applicants.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      )}
    </div>
  )
}