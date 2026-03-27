import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, ArrowUp, CheckCircle, Search, Briefcase, Zap } from 'lucide-react';
import { api } from "../services/axios";
import JobCard from "./JobCard";
import { isJobAcceptingApplications, formatDeadlineLabel } from "../utils/jobDeadline";
import Loader from "./Loader";

export const Footer = () => {
  const mode = useSelector((s) => s.theme.mode);
  const isDark = mode === "dark";

  // Navigation Data
  const footerGroups = [
    {
      title: "Platform",
      links: [
        { name: "Browse Jobs", path: "/jobs" },
        { name: "Company Directory", path: "/companies" },
        { name: "Placement Stats", path: "/stats" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help" },
        { name: "Student FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ],
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={`border-t transition-colors duration-500 ${isDark ? "bg-zinc-950 border-zinc-900 text-zinc-400" : "bg-slate-50 border-zinc-200 text-zinc-600"
      }`}>
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">

          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 w-fit group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                P
              </div>
              <span className={`text-2xl font-black tracking-tight uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                Placement<span className="text-brand-500">Pro</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm font-medium">
              The official career portal for our institution. Connecting ambitious students
              with global industry leaders through a unified digital ecosystem.
            </p>

            {/* Newsletter Input */}
            <div className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                Placement Alerts
              </h4>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter university email"
                  className={`flex-1 px-5 py-3 rounded-2xl border text-sm outline-none transition-all ${isDark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500"
                      : "bg-white border-zinc-200 text-zinc-900 focus:border-indigo-600"
                    }`}
                />
                <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-6">
              <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                {group.title}
              </h4>
              <ul className="space-y-4 text-sm font-bold">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="hover:text-indigo-500 transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className={`pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-8 ${isDark ? "border-zinc-900" : "border-zinc-200"
          }`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            © 2026 Placement<span className="text-brand-500">Pro</span> CMS. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                target="_blank"
                rel="noreferrer"
                className={`transition-all hover:-translate-y-1 ${isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <button
            onClick={scrollToTop}
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all group ${isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"
              }`}
          >
            Back to top <ArrowUp className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

// REUSABLE LAYOUT FOR INFO PAGES
const InfoLayout = ({ title, children }) => {
  const isDark = useSelector((s) => s.theme.mode) === "dark";
  return (
    <div className={`min-h-screen pt-32 pb-20 px-6 transition-colors ${isDark ? "bg-zinc-950 text-zinc-50" : "bg-slate-50 text-zinc-900"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4">{title}</h1>
          <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
};

export const BrowseJobs = () => {
  const navigate = useNavigate();
  const isDark = useSelector((s) => s.theme.mode) === "dark";
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/api/v1/tpo/jobs")
      .then(({ data }) => {
        if (!cancelled) {
          setJobs(data?.data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const onApply = (job) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/jobs");
    } else {
      // If student is logged in, send them to the actual app board to apply
      navigate("/student/jobs");
    }
  };

  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = jobs.filter(j => {
      const title = (j.jobTitle || "").toLowerCase();
      const comp = (j.company?.companyName || "").toLowerCase();
      return title.includes(q) || comp.includes(q);
    });

    const map = {};
    filtered.forEach(j => {
      const c = j.company?.companyName || "Other";
      if (!map[c]) map[c] = [];
      map[c].push(j);
    });
    return map;
  }, [jobs, query]);

  const companyNames = Object.keys(grouped).sort();

  return (
    <InfoLayout title="Opportunity Board">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <p className="text-lg text-zinc-500 font-medium">
          Explore the latest career paths from our {companyNames.length} partner companies.
        </p>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by role or company..."
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all ${isDark ? "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-zinc-200 focus:border-indigo-600"
              }`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader label="Synchronizing opportunities..." />
        </div>
      ) : companyNames.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          <Zap className="mx-auto text-4xl text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="font-black uppercase tracking-widest text-zinc-400">No matching roles found.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {companyNames.map(comp => (
            <div key={comp} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-indigo-600 dark:text-indigo-400">
                  {comp}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {grouped[comp].length} Openings
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {grouped[comp].map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onApply={() => onApply(job)}
                    deadlineLabel={formatDeadlineLabel(job.applicationDeadline)}
                    closed={!isJobAcceptingApplications(job)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </InfoLayout>
  );
};

export const PlacementStats = () => (
  <InfoLayout title="Placement Statistics 2025-26">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Total Offers", value: "1,240" },
        { label: "Avg. Package", value: "$12 LPA" },
        { label: "Top Sector", value: "FinTech" },
        { label: "Students Placed", value: "88%" }
      ].map(s => (
        <div key={s.label} className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 transition-transform hover:scale-[1.02]">
          <h3 className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-4">{s.label}</h3>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{s.value}</p>
        </div>
      ))}
    </div>
  </InfoLayout>
);

export const FAQ = ({ type = "Student" }) => {
  const isDark = useSelector((s) => s.theme.mode) === "dark";

  const faqs = [
    { q: "How do I update my resume?", a: "Go to Profile > Documents > Upload New Resume." },
    { q: "When does the recruitment drive start?", a: "The main drive begins in August every year." },
    { q: "Can I apply for multiple roles?", a: "Yes, unless a company specifies a single-application policy." }
  ];

  return (
    <InfoLayout title={`${type} Help Center`}>
      <div className="space-y-4 max-w-3xl">
        {faqs.map((item, i) => (
          <details key={i} className={`group p-6 rounded-[2rem] border transition-all ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-white bg-white shadow-lg shadow-zinc-200/50"}`}>
            <summary className="text-lg font-bold cursor-pointer list-none flex justify-between items-center">
              {item.q}
              <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-open:rotate-180 transition-transform">
                ▼
              </div>
            </summary>
            <p className="mt-4 text-zinc-500 font-medium leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </InfoLayout>
  );
};

export const LegalPage = ({ title }) => {
  const isDark = useSelector((s) => s.theme.mode) === "dark";

  return (
    <InfoLayout title={title}>
      <div className={`prose prose-lg max-w-none font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
        <section className="mb-12">
          <h2 className={`text-2xl font-black mb-6 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>1. Introduction</h2>
          <p className="leading-relaxed">This {title.toLowerCase()} governs your use of the PlacementPro platform. By accessing this portal, you agree to comply with our data handling standards.</p>
        </section>
        <section className="mb-12">
          <h2 className={`text-2xl font-black mb-6 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>2. Data Usage</h2>
          <p className="leading-relaxed">We collect student academic records and resumes solely for the purpose of sharing with registered recruiters for hiring processes.</p>
        </section>
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <CheckCircle className="text-indigo-500" />
          <p className="text-xs font-bold uppercase tracking-widest italic">Last Updated: March 2026</p>
        </div>
      </div>
    </InfoLayout>
  );
};