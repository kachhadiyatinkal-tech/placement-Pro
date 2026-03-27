import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, TrendingUp, AlertTriangle, ArrowRight, Zap, BarChart2 } from 'lucide-react';

export default function TestResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const mode = useSelector((s) => s.theme.mode);
    const isDark = mode === 'dark';

    const result = location.state?.result;

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <BarChart2 className="text-zinc-400 animate-pulse text-5xl" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Retrieving intelligence dashboard...</p>
                <button onClick={() => navigate('/student/practice-test')} className="premium-gradient px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">Back to Tests</button>
            </div>
        );
    }

    const { score, totalQuestions, accuracy, strongAreas, weakAreas, aiFeedback, categoryBreakdown } = result;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Evaluation Logic Complete</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Strategic <span className="text-zinc-500">Outcome</span>
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/student/practice-test')}
                    className="premium-gradient px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20"
                >
                    New Practice Session
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card p-6 rounded-3xl space-y-2 border-l-4 border-l-brand-500">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Score</p>
                    <p className="text-4xl font-bold tracking-tight text-brand-500">{score}<span className="text-lg text-zinc-500"> / {totalQuestions}</span></p>
                </div>

                <div className="glass-card p-6 rounded-3xl space-y-2 border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Precision Rate</p>
                    <p className="text-4xl font-bold tracking-tight text-emerald-500">{accuracy}<span className="text-lg text-zinc-500">%</span></p>
                </div>

                <div className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Session ID Validated</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="text-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Analysis Active</span>
                    </div>
                </div>
            </div>

            {/* Profile Insights & AI Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-3xl space-y-6 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold flex items-center gap-3">
                            <Zap className="text-brand-500" />
                            AI Career <span className="text-brand-500">Feedback</span>
                        </h3>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-brand-500/30 rounded-full" />
                        <p className="italic font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
                            "{aiFeedback || 'Performance analysis engine is calculating the optimal career path feedback based on your responses.'}"
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass-card p-6 rounded-3xl flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl">
                            <TrendingUp />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Primary Domain Mastery</p>
                            <div className="flex flex-wrap gap-1.5">
                                {strongAreas.length > 0 ? strongAreas.map(s => (
                                    <span key={s} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">{s}</span>
                                )) : <span className="text-[10px] font-medium italic text-zinc-500">Collecting benchmark data...</span>}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl">
                            <AlertTriangle />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Improvement Areas</p>
                            <div className="flex flex-wrap gap-1.5">
                                {weakAreas.length > 0 ? weakAreas.map(w => (
                                    <span key={w} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-widest border border-amber-500/20">{w}</span>
                                )) : <span className="text-[10px] font-medium italic text-zinc-500">No critical failures identified.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Analysis Table (Minimal) */}
            <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Detailed Domain Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                    {Object.keys(categoryBreakdown).map((cat) => (
                        <div key={cat} className="p-6 space-y-2 text-center group transition-colors hover:bg-brand-500/5">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-brand-500 transition-colors uppercase">{cat}</span>
                            <p className="text-2xl font-bold tracking-tight">
                                {categoryBreakdown[cat].score} <span className="text-sm font-medium text-zinc-500">/ {categoryBreakdown[cat].total}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center pb-6 pt-4">
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-500 transition-all group"
                >
                    Back to Systems Overview <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
