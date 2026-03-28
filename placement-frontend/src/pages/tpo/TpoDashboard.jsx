import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, GraduationCap, Building, PieChartIcon } from 'lucide-react'

// Analytics
import StatCard from '../../components/dashboard/StatCard'
import Charts from '../../components/dashboard/Charts'
import { fetchOverview, fetchTrends, fetchCompanyStats, fetchBranchStats } from '../../features/analytics/analyticsSlice'

function Card({ label, value, icon: Icon }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  return (
    <div className={`rounded-[2rem] border p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
      isDark 
        ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-zinc-950/50' 
        : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TpoDashboard() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { overview, trends, companyStats, branchStats, loading: analyticsLoading } = useSelector((s) => s.analytics)

  useEffect(() => {
    dispatch(fetchOverview())
    dispatch(fetchTrends())
    dispatch(fetchCompanyStats())
    dispatch(fetchBranchStats())
  }, [dispatch])

  return (
    <div className="max-w-6xl space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-block rounded-xl bg-[#8b5cf6]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-[#8b5cf6] border border-[#8b5cf6]/20">
            Administration
          </div>
          <h1 className="text-4xl font-black tracking-tight">TPO Dashboard</h1>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Orchestrate placement opportunities and manage career listings.
          </p>
        </div>

      </div>

      {/* Analytics Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-12">
          <StatCard title="Total Students" value={overview.totalStudents} icon={Users} />
          <StatCard title="Placed Students" value={overview.totalPlacedStudents} icon={GraduationCap} />
          <StatCard title="Total Companies" value={overview.totalCompanies} icon={Building} />
          <StatCard title="Placement %" value={overview.placementPercentage} icon={PieChartIcon} isPercentage />
        </div>
      )}

      {/* Analytics Charts */}
      {!analyticsLoading && (
        <Charts trends={trends} companyStats={companyStats} branchStats={branchStats} />
      )}

    </div>
  )
}