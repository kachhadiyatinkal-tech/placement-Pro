import { X, Calendar, Clock, Link, Users } from 'lucide-react'
import { useState } from 'react'

export default function ScheduleInterviewModal({ applicant, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    meetingLink: '',
  })

  if (!applicant) return null

  const studentName = applicant?.name || `${applicant?.studentId?.first_name || ''} ${applicant?.studentId?.last_name || ''}`.trim() || 'Student'

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 rounded-full -ml-16 -mb-16 blur-3xl" />

        <div className="relative">
          <button onClick={onClose} className="absolute -top-2 -right-2 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 mb-3">
              <Users size={12} /> Schedule Interview
            </div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
              {studentName}
            </h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Select date and link for the technical round
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Interview Date
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  required
                  type="date"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Interview Time
              </label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  required
                  type="time"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Meeting Link
              </label>
              <div className="relative group">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  required
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-70 transition-all mt-4"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
