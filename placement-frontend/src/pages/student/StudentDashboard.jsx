import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadResume } from '../../features/students/studentSlice'
import { fetchJobs } from '../../features/jobs/jobSlice'
import { fetchStudentApplications } from '../../features/applications/applicationSlice'
import { fetchNoticesByRole } from '../../features/notices/noticesSlice'
import { Briefcase, FileText, Bell, UploadCloud, CheckCircle, Zap, ArrowRight, BarChart2 } from 'lucide-react'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-2.5 ${color} bg-opacity-10 text-xl`}>
          {icon}
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${color.replace('text', 'bg')}`} />
    </div>
  )
}

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { jobs } = useSelector((s) => s.jobs)
  const { applications } = useSelector((s) => s.applications)
  const { status } = useSelector((s) => s.students)
  const noticeCount = useSelector((s) => s.notices.notices?.length || 0)
  const user = useSelector((s) => s.auth.user)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const isUploading = status === 'loading'
  const studentId = user?._id || user?.id || localStorage.getItem('studentId')

  const openJobsCount = useMemo(
    () => (jobs || []).length,
    [jobs],
  )

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchNoticesByRole('student'))
    if (studentId) dispatch(fetchStudentApplications())
  }, [dispatch, studentId])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">Candidate Dashboard</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase leading-none">
          Systems <span className="text-brand-500">Overview</span>
        </h1>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
          Hello, {user?.first_name || 'Candidate'} — Welcome back.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Open roles"
          value={openJobsCount}
          icon={<Briefcase />}
          color="text-brand-500"
        />
        <StatCard
          label="Active Pipeline"
          value={applications?.length ?? 0}
          icon={<FileText />}
          color="text-amber-500"
        />
        <StatCard
          label="Direct Alerts"
          value={noticeCount}
          icon={<Bell />}
          color="text-emerald-500"
        />
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Practice Test Section */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-8 group hover:shadow-xl hover:shadow-brand-500/5 transition-all">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="text-brand-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">Self-Evaluation Matrix</span>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Skill <span className="text-brand-500">Evolution</span> Analysis
              </h2>
              <p className="mt-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-relaxed">
                Test your logic, language, and quantitative skills. Receive AI-enhanced insights.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/student/practice-test'}
              className="group/btn premium-gradient flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
            >
              Start Training
              <ArrowRight className="text-lg group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-2 pt-2">
              <CheckCircle className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                10 Questions • AI Powered Review
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 opacity-[0.05] grayscale group-hover:grayscale-0 transition-all group-hover:scale-110">
            <BarChart2 size={120} className="text-brand-500 -rotate-12" />
          </div>
        </div>

        {/* Resume Section */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-8">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">Credential Manager</span>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Resume <span className="text-brand-500">Update</span>
              </h2>
              <p className="mt-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-relaxed">
                Keep your profile current for automated recruiter filters.
              </p>
            </div>
            <label className="group block cursor-pointer">
              <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 transition-all ${isUploading ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-brand-500/5'
                }`}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="text-2xl text-zinc-400 mb-2 group-hover:text-brand-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Deploy New PDF</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) dispatch(uploadResume({ file, userId: studentId }))
                      }}
                    />
                  </>
                )}
              </div>
            </label>
            <div className="flex items-center justify-center gap-2 pt-2">
              <CheckCircle className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                PDF / DOCX Max 5MB
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <FileText size={100} className="rotate-12 text-zinc-500" />
          </div>
        </div>
      </div>
    </div>
  )
}