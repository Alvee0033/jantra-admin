"use client";

import { Monitor, Cpu, Database, Cloud, Shield, Sparkles, Zap, Network } from "lucide-react";
import { motion } from "framer-motion";

export default function ArchitecturePage() {
    const techStack = [
        { name: 'React 19', category: 'Frontend Engine', icon: Monitor, color: 'text-blue-500' },
        { name: 'Next.js 15', category: 'Orchestration', icon: Cpu, color: 'text-slate-900' },
        { name: 'Tailwind 4', category: 'Design System', icon: Cloud, color: 'text-amber-500' },
        { name: 'TypeScript', category: 'Logic Layer', icon: Shield, color: 'text-blue-600' },
        { name: 'Node.js', category: 'Runtime', icon: Zap, color: 'text-orange-500' },
        { name: 'PostgreSQL', category: 'Data Vault', icon: Database, color: 'text-indigo-500' },
        { name: 'Prisma', category: 'ORM Bridge', icon: Network, color: 'text-slate-600' },
        { name: 'Gemini AI', category: 'Intelligence', icon: Sparkles, color: 'text-orange-500' },
    ];

    return (
        <div className="space-y-12 pb-24">
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col pt-4"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-1 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">System Blueprint</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-none">
                    Technical<br/>Infrastructure
                </h2>
                <p className="text-slate-500 font-medium mt-4 max-w-xl leading-relaxed italic opacity-70">
                    The underlying hardware and software matrix powering JANTRA's high-density industrial operations.
                </p>
            </motion.header>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8">
                    <Cpu className="w-24 h-24 text-slate-50 opacity-[0.03] rotate-12" />
                </div>

                <div className="flex items-center gap-6 mb-12">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Core Stack Matrix</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Version 2.4.9 // Verified Stable</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {techStack.map((tech, index) => (
                        <motion.div 
                             key={tech.name}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.2 + (index * 0.05) }}
                             className="group p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:border-orange-200 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn("p-4 bg-white rounded-2xl shadow-sm transition-transform group-hover:-rotate-6", tech.color)}>
                                    <tech.icon className="w-6 h-6" />
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            </div>
                            <p className="font-extrabold text-slate-900 text-xl tracking-tight mb-1">{tech.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{tech.category}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-950 p-6 sm:p-16 rounded-[2rem] sm:rounded-[4rem] shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[200%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-orange-600/20 transition-all duration-1000" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.5em]">Future State Optimization</h4>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white mb-6 leading-tight max-w-xl">
                        Engineering Next-Gen High-Density Orchestration
                    </h3>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl font-medium italic opacity-80">
                        Our roadmap includes the implementation of a full distributed node management system, cluster-level diagnostics, and AI-driven edge publication controls. 
                        We are building for a future of unprecedented reliability and industrial-scale performance.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

