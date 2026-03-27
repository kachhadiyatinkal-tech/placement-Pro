import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useSelector } from 'react-redux'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Charts({ trends, companyStats, branchStats }) {
  const mode = useSelector((s) => s.theme?.mode) || 'light'
  const isDark = mode === 'dark'

  const textColor = isDark ? '#fafafa' : '#09090b'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'

  const chartContainerClass = "rounded-3xl border border-app bg-surface p-6 shadow-sm transition-all duration-300"
  
  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Top Row: Line Chart and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placement Trends Line Chart */}
        <div className={chartContainerClass}>
          <h3 className="mb-6 border-b border-zinc-100 pb-2 text-sm font-bold uppercase tracking-widest text-stone-500 dark:border-zinc-800 dark:text-stone-400">
            Placement Trends
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} tick={{fill: textColor, fontSize: 12}} />
                <YAxis stroke={textColor} tick={{fill: textColor, fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor, borderRadius: '12px' }} 
                  itemStyle={{ color: textColor }}
                />
                <Line 
                  type="monotone" 
                  dataKey="placements" 
                  name="Placements"
                  stroke="#6366f1" 
                  strokeWidth={4}
                  activeDot={{ r: 8 }} 
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Hiring Stats Bar Chart */}
        <div className={chartContainerClass}>
          <h3 className="mb-6 border-b border-zinc-100 pb-2 text-sm font-bold uppercase tracking-widest text-stone-500 dark:border-zinc-800 dark:text-stone-400">
            Company Hiring Stats
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} tick={{fill: textColor, fontSize: 12}} />
                <YAxis stroke={textColor} tick={{fill: textColor, fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor, borderRadius: '12px' }}
                  cursor={{fill: isDark ? '#292524' : '#f5f5f4'}}
                />
                <Bar dataKey="count" name="Hires" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row: Branch Stats Pie Chart */}
      <div className={chartContainerClass}>
        <h3 className="mb-6 border-b border-zinc-100 pb-2 text-sm font-bold uppercase tracking-widest text-stone-500 dark:border-zinc-800 dark:text-stone-400">
          Branch-wise Placement
        </h3>
        <div className="flex flex-col md:flex-row items-center">
          <div className="h-80 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {branchStats?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor, borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col gap-4 pl-0 md:pl-10 mt-6 md:mt-0">
             {branchStats?.map((entry, index) => (
               <div key={entry.name} className="flex items-center gap-3">
                 <div 
                   className="w-4 h-4 rounded-full shadow-sm" 
                   style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                 />
                 <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {entry.name}
                 </span>
                 <span className="ml-auto text-sm font-medium text-stone-500">
                    {entry.value} placements
                 </span>
               </div>
             ))}
             {(!branchStats || branchStats.length === 0) && (
               <p className="text-sm text-stone-500">No branch data available.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
