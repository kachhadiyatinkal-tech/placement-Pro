import React from 'react';
import { X, Database } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function DetailViewerModal({ isOpen, onClose, title = "Complete Record Details", data }) {
  const mode = useSelector((s) => s.theme?.mode) || 'light';
  const isDark = mode === 'dark';

  if (!isOpen || !data) return null;

  // Render safe content, leaving internal state/urls out
  const filterKeys = (key) => {
    const k = key.toLowerCase();
    if (k === '_id' || k === 'id' || k === '__v' || k === 'password') return false;
    if (k.includes('token') || k.includes('url') || k.includes('website') || k.includes('link') || k.includes('logo') || k.includes('image') || k.includes('avatar') || k.includes('profile') || k.includes('sender')) return false;
    return true;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') {
        if (Array.isArray(val)) return val.length > 0 ? val.map(formatValue).join(', ') : 'Empty Array';
        if (val._id || val.companyName || val.name) return val.companyName || val.name || val.title || val._id;
        return JSON.stringify(val);
    }
    if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return String(val);
  };
  
  // Attempt to intelligently pick a title from common name fields
  const displayTitle = data?.companyName || data?.title || data?.jobTitle || (data?.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : null);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-3xl bg-black/60 transition-all duration-500 overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-[2.5rem] border shadow-2xl p-8 sm:p-10 animate-modal-in transform my-auto ${isDark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-900'}`}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-2xl border border-transparent text-zinc-400 dark:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 active:ring-2 active:ring-brand-500 active:border-brand-500 hover:text-zinc-500 dark:hover:text-zinc-400"
        >
          <X size={20} className="stroke-[3]" />
        </button>

        <div className="mb-8">
           <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-500 border border-brand-500/20 mb-4">
             <Database size={14} /> Full Record Access
           </div>
           <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-tight">
             {displayTitle || title}
           </h2>
        </div>

        <div className={`max-h-[60vh] overflow-y-auto custom-scrollbar rounded-3xl border ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-100 bg-zinc-50/50'} p-2 sm:p-4 shadow-inner`}>
          <div className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
            {Object.entries(data).filter(([k]) => filterKeys(k)).map(([key, value]) => {
              // Convert camelCase or snake_case to readable Title Case words
              const formatedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-start py-5 px-4 hover:bg-brand-500/[0.03] transition-colors rounded-xl gap-2 sm:gap-6">
                  <div className="sm:w-1/3 shrink-0">
                    <p className="text-[10px] sm:pt-0.5 font-black uppercase tracking-widest text-zinc-500">{formatedKey}</p>
                  </div>
                  <div className="sm:w-2/3">
                    <p className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'} whitespace-pre-wrap break-words leading-relaxed`}>
                      {formatValue(value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors bg-zinc-900 text-white hover:bg-brand-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
