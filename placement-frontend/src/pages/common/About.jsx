import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Target, Eye, Cpu, Award, Users, Globe } from "lucide-react";

const stats = [
    { label: "Universities", value: "50+", icon: <Award className="w-4 h-4" /> },
    { label: "Recruiters", value: "200+", icon: <Users className="w-4 h-4" /> },
    { label: "Placements", value: "10k+", icon: <Globe className="w-4 h-4" /> },
];

const data = [
    {
        title: "Our Mission",
        desc: "To simplify and digitalize the placement process for students and institutions.",
        icon: <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        gradient: "from-indigo-600/10 to-transparent"
    },
    {
        title: "Our Vision",
        desc: "To become a leading platform connecting students with top companies globally.",
        icon: <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        gradient: "from-indigo-600/10 to-transparent"
    },
    {
        title: "Technology",
        desc: "Built using MERN stack with scalable and modern UI/UX design.",
        icon: <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        gradient: "from-indigo-600/10 to-transparent"
    }
];

export const About = () => {
    const mode = useSelector((s) => s.theme.mode);
    const isDark = mode === "dark";

    return (
        <div className={`relative min-h-dvh px-6 py-20 transition-colors duration-500 overflow-hidden ${
            isDark ? "bg-zinc-950 text-zinc-50" : "bg-slate-50 text-zinc-900"
        }`}>
            
            {/* Background Glow - Matching your theme */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 blur-[150px] opacity-20 -z-10 bg-indigo-500" />

            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center mb-20"
            >
                <span className="px-3 py-1.5 rounded-xl bg-indigo-600/10 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
                    Our Story
                </span>
                <h1 className="text-4xl md:text-6xl font-black mt-6 mb-6 tracking-tight leading-none">
                    Empowering the next generation of <br/>
                    <span className="text-indigo-600 dark:text-indigo-400">
                        professionals.
                    </span>
                </h1>
                <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    We bridge the gap between academic excellence and professional opportunity 
                    through a seamless, transparent, and data-driven placement ecosystem.
                </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {data.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                            isDark 
                            ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
                            : 'border-white bg-white/80 backdrop-blur-xl shadow-2xl shadow-zinc-200/50'
                        }`}
                    >
                        {/* Gradient Glow on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.gradient}`} />
                        
                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                                isDark ? "bg-zinc-950" : "bg-slate-50"
                            }`}>
                                {item.icon}
                            </div>
                            
                            <h2 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h2>
                            <p className={`leading-relaxed text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                                {item.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Stats Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-24 flex flex-wrap justify-center gap-12 md:gap-20"
            >
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-indigo-600 dark:text-indigo-400">{stat.icon}</span>
                            <span className="text-4xl font-black tracking-tighter">{stat.value}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};