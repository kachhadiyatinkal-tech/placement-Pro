import { X, Users, Mail, Phone, Briefcase, Building2, Calendar, FileText, GraduationCap, BookOpen, Award, Download, CheckCircle, Activity, Clock } from 'lucide-react'

export default function ApplicantDetailModal({ applicant, isDark, onClose }) {
  if (!applicant) return null

  const student = applicant?.studentId || {}
  const sp = student?.studentProfile || {}       // shorthand for studentProfile

  const studentName = applicant?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
  const email = applicant?.email || student?.email || '—'
  const contactNumber = student?.number ? String(student.number) : '—'
  const gender = student?.gender || null
  const resumeLink = applicant?.resume || sp?.resume?.filepath

  // Application-specific fields stored in studentProfile.appliedJobs[]
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

  // SGPA across all sems
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

  // Interview details
  const iDate = applicant?.interviewDate || applicant?.interviewDetails?.date
  const iTime = applicant?.interviewTime || applicant?.interviewDetails?.time
  const iLink = applicant?.interviewLink || applicant?.interviewDetails?.meetingLink
  const interviewDateStr = iDate ? new Date(iDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

  const statusColors = {
    pending: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
    applied: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
    under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shortlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    interview: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const statusKey = String(applicant?.status || 'pending').toLowerCase()
  const statusClass = statusColors[statusKey] || statusColors.pending

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
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
        {/* Modal Header */}
        <div className="relative overflow-hidden rounded-t-3xl px-8 pt-8 pb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
        >
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
              <h2 className="text-2xl font-black tracking-tight">{studentName}</h2>
              <p className="text-white/70 text-sm mt-0.5">{email}</p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass}`}>
              {(applicant?.status || 'pending').replace('_', ' ')}
            </span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest">Applied on {appliedAt}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 py-6 space-y-6">
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

          {hasPastQuals && (
            <Section isDark={isDark} icon={<BookOpen size={15} className="text-[#8b5cf6]" />} title="Past Qualifications">
              <div className="space-y-3">
                {ssc?.percentage && <QualCard isDark={isDark} title="SSC (10th)" board={ssc.board} percentage={ssc.percentage} year={ssc.year} />}
                {hsc?.percentage && <QualCard isDark={isDark} title="HSC (12th)" board={hsc.board} percentage={hsc.percentage} year={hsc.year} />}
                {diploma?.percentage && <QualCard isDark={isDark} title={`Diploma${diploma.department ? ` — ${diploma.department}` : ''}`} percentage={diploma.percentage} year={diploma.year} />}
              </div>
            </Section>
          )}

          {internships.length > 0 && (
            <Section isDark={isDark} icon={<Award size={15} className="text-[#8b5cf6]" />} title="Internships">
              <div className="space-y-3">
                {internships.map((intern, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-sm uppercase">{intern?.companyName || '—'}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {intern?.type || ''}{intern?.internshipDuration ? ` · ${intern.internshipDuration} months` : ''}
                        </p>
                      </div>
                      {intern?.monthlyStipend && <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">₹{intern.monthlyStipend}/mo</span>}
                    </div>
                    {intern?.description && <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{intern.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {interviewDateStr && (
            <Section isDark={isDark} icon={<Calendar size={15} className="text-orange-500" />} title="Interview Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard isDark={isDark} icon={<Calendar size={13} className="text-orange-500" />} label="Interview Date">{interviewDateStr}</InfoCard>
                {iTime && (
                  <InfoCard isDark={isDark} icon={<Clock size={13} className="text-orange-500" />} label="Interview Time">{iTime}</InfoCard>
                )}
                {iLink && (
                  <InfoCard isDark={isDark} icon={<Activity size={13} className="text-orange-500" />} label="Meeting Link">
                    <a href={iLink} target="_blank" rel="noreferrer" className="text-[#8b5cf6] hover:underline break-all">{iLink}</a>
                  </InfoCard>
                )}
              </div>
            </Section>
          )}

          {applicant?.status === 'selected' && applicant?.offerLetter && (
            <Section isDark={isDark} icon={<CheckCircle size={15} className="text-emerald-500" />} title="Offer Letter">
              <a href={applicant.offerLetter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                <FileText size={13} /> View Offer Letter
              </a>
            </Section>
          )}

          {resumeLink && (
            <Section isDark={isDark} icon={<FileText size={15} className="text-[#8b5cf6]" />} title="Resume">
              <a href={resumeLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 px-4 py-2 text-xs font-bold text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-all">
                <Download size={13} /> Download Resume
              </a>
            </Section>
          )}
        </div>

        <div className={`px-8 py-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
          <button onClick={onClose} className={`w-full rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>Close</button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ isDark, icon, label, children }) {
  return (
    <div className={`rounded-xl border p-3 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{label}</span>
      </div>
      <p className={`text-sm font-semibold break-all ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{children || '—'}</p>
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
    <div className={`rounded-xl border p-3 flex items-center justify-between gap-4 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
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
