import React from "react";
import { useSelector } from "react-redux";
import { ArrowRight, CheckCircle, Activity, Users, Award } from 'lucide-react';
import { Link } from "react-router-dom";

export const Home = () => {
  const mode = useSelector((s) => s.theme.mode);
  const isDark = mode === "dark";
  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? "bg-zinc-950 text-zinc-50" : "bg-slate-50 text-zinc-900"
    }`}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Deep Indigo Ambient Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-30 blur-[140px] -z-10 ${
          isDark ? "bg-indigo-900" : "bg-indigo-200"
        }`} />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {/* Live Indicator Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${
              isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
            }`}>
              <Activity className="animate-pulse" />
              Direct Hiring Phase 2026
            </div>

            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] lg:leading-[1.1]">
              Elevate Your <br />
              <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/20 underline-offset-8">Professional</span> Path.
            </h1>

            <p className={`text-xl leading-relaxed max-w-lg ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              The intelligent placement ecosystem connecting elite students with top-tier global recruiters through data-driven matching.
            </p>

            {/* BUTTON MANAGEMENT: Primary is now transparent/outline */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className={`group px-10 py-4 rounded-2xl font-bold border-2 flex items-center gap-3 transition-all duration-300 ${
                isDark 
                  ? "border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white" 
                  : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
              }`}>
                Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className={`px-10 py-4 rounded-2xl font-semibold border-2 transition-all ${
                isDark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" : "border-zinc-200 bg-white hover:border-zinc-300 shadow-sm text-zinc-700"
              }`}>
                Explore Jobs
              </Link>
            </div>
          </div>

          {/* Feature Highlight Card (Unchanged for hierarchy) */}
          <div className={`p-1 rounded-[3rem] border ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-white bg-white/50"} backdrop-blur-md shadow-2xl`}>
            <div className={`rounded-[2.8rem] p-10 ${isDark ? "bg-zinc-900" : "bg-white shadow-inner"}`}>
              <div className="grid gap-8">
                {[
                  { icon: <Users />, t: "12k+ Active Students", d: "Verified profiles from 50+ departments." },
                  { icon: <CheckCircle />, t: "Auto-Verification", d: "Smart parsing for academic credentials." },
                  { icon: <Award />, t: "Premier Partners", d: "Direct access to Fortune 500 recruiters." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group cursor-default">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.t}</h4>
                      <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <div className={`border-y ${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-indigo-600 border-indigo-700 text-white"}`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { l: "Placement Rate", v: "98.2%" },
              { l: "Top CTC", v: "$62 LPA" },
              { l: "Companies", v: "240+" },
              { l: "Offers", v: "1,500+" }
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="text-4xl font-black">{s.v}</div>
                <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-100 opacity-80"}`}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};