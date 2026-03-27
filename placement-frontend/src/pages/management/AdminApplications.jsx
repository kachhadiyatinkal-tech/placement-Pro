import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, FileText, Inbox, Search, Layers } from 'lucide-react'
import Loader from '../../components/Loader'
import { downloadPDF } from '../../utils/download'
import { fetchApplicants, fetchJobs } from '../../features/jobs/jobSlice'
import Pagination from '../../components/common/Pagination'

// Helper functions for data normalization
function companyName(job) {
  if (!job) return 'Company'
  if (typeof job?.company === 'object') return job?.company?.companyName || job?.company?.name || 'Company'
  return job?.companyName || job?.company || 'Company'
}

function jobTitle(job) {
  return job?.jobTitle || job?.title || job?.name || 'Job'
}

function resumeHref(student) {
  return student?.resumeUrl || student?.resume || student?.resumePath || undefined
}

export default function AdminApplications() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { jobs, applicantsByJobId, status } = useSelector((s) => s.jobs)
  const [jobId, setJobId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  const applicants = useMemo(
    () => (jobId ? applicantsByJobId[jobId] || [] : []),
    [applicantsByJobId, jobId],
  )
  const totalPages = Math.max(1, Math.ceil(applicants.length / itemsPerPage))
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return applicants.slice(start, start + itemsPerPage)
  }, [applicants, currentPage, itemsPerPage])

  useEffect(() => {
    if (!jobId) return
    setCurrentPage(1)
    dispatch(fetchApplicants(jobId))
  }, [dispatch, jobId])

  const selectedJob = useMemo(() => jobs.find((j) => (j?._id || j?.id) === jobId), [jobs, jobId])
  const isApplicantsLoading = status === 'loading' && !!jobId

  const downloadApplicantsPDF = () => {
    const rows = applicants.map((a) => ({
      name: a?.name || a?.studentName || '—',
      email: a?.email || '—',
      skills: a?.skills || a?.studentSkills || '—',
      status: a?.status || 'Applied',
      resume: resumeHref(a) || '—',
    }))
    const file = `applicants-${jobTitle(selectedJob).replaceAll(' ', '-').toLowerCase()}.pdf`
    downloadPDF(file, rows, ['name', 'email', 'skills', 'status', 'resume'], {
      title: `Applicants — ${companyName(selectedJob)} / ${jobTitle(selectedJob)}`,
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Layers /> Submission Portal
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Application Manager</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Audit candidate profiles and export recruitment data.
          </p>
        </div>
      </div>

      {/* Selection & Action Bar */}
      <div className={`rounded-[2rem] border p-6 transition-all ${isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
        }`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Role</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={`w-full appearance-none rounded-2xl border pl-11 pr-10 py-4 text-sm font-bold outline-none transition-all ${isDark
                  ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500'
                  : 'border-zinc-100 bg-zinc-50 focus:border-indigo-600'
                  }`}
              >
                <option value="">Select a listing to audit...</option>
                {(jobs || []).map((j) => {
                  const id = j?._id || j?.id
                  return (
                    <option key={id} value={id}>
                      {jobTitle(j)} — {companyName(j)}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadApplicantsPDF}
            disabled={!jobId || isApplicantsLoading || !applicants?.length}
            className="flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-zinc-800 disabled:opacity-20 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 active:scale-95"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {status === 'loading' && !jobs?.length ? <Loader label="Syncing recruitment database..." /> : null}

      {/* Table Section */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-100 bg-white'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Expertise</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Portfolio</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isApplicantsLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <Loader label="Decrypting applicant data..." />
                  </td>
                </tr>
              ) : null}

              {!isApplicantsLoading && paginatedApplicants.map((a, idx) => (
                <tr key={a?._id || a?.id || idx} className="group transition-colors hover:bg-indigo-600/[0.02]">
                  <td className="px-8 py-6">
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-tight">{a?.name || a?.studentName || 'Anonymous'}</p>
                      <p className="mt-1 text-[10px] font-bold text-zinc-500">{a?.email || 'No email provided'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {a?.skills || a?.studentSkills || 'General Application'}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {resumeHref(a) ? (
                      <a
                        href={resumeHref(a)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400' : 'bg-zinc-100 text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                      >
                        <FileText size={14} /> Resume
                      </a>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-zinc-400 opacity-40">N/A</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                      }`}>
                      {a?.status || 'Applied'}
                    </span>
                  </td>
                </tr>
              ))}

              {!isApplicantsLoading && jobId && !(applicants || []).length ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-zinc-50 p-6 dark:bg-zinc-800/50">
                        <Inbox className="text-4xl text-zinc-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Zero submissions found for this position.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isApplicantsLoading && !jobId ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Search className="text-5xl text-zinc-300" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Awaiting role selection from the console.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
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