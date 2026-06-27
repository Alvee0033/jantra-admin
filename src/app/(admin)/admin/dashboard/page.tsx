"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    ArrowRight,
    Bell,
    Briefcase,
    Clock3,
    FileText,
    Mail,
    MessageSquare,
    Users,
    X,
    Activity,
    Layers,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardStats {
    counts: {
        leads: number;
        blogs: number;
        projects: number;
        applications: number;
        reports: number;
    };
    recentLeads: LeadRecord[];
}

interface LeadRecord {
    id: string;
    name: string;
    email: string;
    service: string;
    status: string;
    company?: string | null;
    country?: string | null;
    budget?: string | null;
    description: string;
    createdAt: string;
}

const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/dashboard-stats");
                setStats(response.data);
            } catch (err) {
                console.error("Error loading dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: "Leads", value: stats?.counts.leads || 0, icon: Bell, href: "/admin/leads", tone: "bg-orange-50 text-orange-600 border-orange-100", hoverTone: "hover:border-orange-300" },
        { label: "Applicants", value: stats?.counts.applications || 0, icon: Users, href: "/admin/careers", tone: "bg-blue-50 text-blue-600 border-blue-100", hoverTone: "hover:border-blue-300" },
        { label: "Blogs", value: stats?.counts.blogs || 0, icon: FileText, href: "/admin/blog", tone: "bg-amber-50 text-amber-600 border-amber-100", hoverTone: "hover:border-amber-300" },
        { label: "Projects", value: stats?.counts.projects || 0, icon: Briefcase, href: "/admin/work", tone: "bg-purple-50 text-purple-600 border-purple-100", hoverTone: "hover:border-purple-300" },
    ];

    return (
        <div className="space-y-6 text-left">
            {/* Header section with minimal styling */}
            <motion.section 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
            >
                <div className="relative z-10 space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 md:text-2xl">
                        Dashboard<span className="text-orange-500">.</span>
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 leading-normal">
                        Manage incoming client requests, job applications, blog content, and portfolio projects.
                    </p>
                </div>
            </motion.section>

            {/* Metrics cards grid */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Link href={stat.href} key={stat.label}>
                        <motion.article 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-350 cursor-pointer`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-xl border p-2.5 transition-colors ${stat.tone}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                                    Manage
                                </span>
                            </div>
                            <p className={`mt-4 text-2xl font-black tracking-tight text-slate-900 ${loading ? 'animate-pulse text-slate-200' : ''}`}>
                                {loading ? "-" : stat.value}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                        </motion.article>
                    </Link>
                ))}
            </section>

            {/* Content main list */}
            <section className="grid gap-6 grid-cols-1">
                {/* Recent Leads Panel */}
                <motion.article 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 flex flex-col gap-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight text-slate-900">Recent Leads</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Inbound project requests and general inquiries.</p>
                        </div>
                        <Link 
                            href="/admin/leads" 
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-orange-600"
                        >
                            All Leads <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
                                <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Loading leads...</span>
                            </div>
                        ) : stats?.recentLeads.length ? (
                            stats.recentLeads.map((lead) => (
                                <motion.button
                                    whileHover={{ scale: 1.002 }}
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left shadow-2xs transition hover:border-orange-500/20 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="truncate text-xs font-black uppercase tracking-wide text-slate-900">{lead.name}</p>
                                        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{lead.service || "General Inquiry"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 sm:justify-end">
                                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                            lead.status === "NEW" ? "bg-orange-50 text-orange-700 border border-orange-100" :
                                            lead.status === "CONTACTED" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                            lead.status === "QUALIFIED" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                                            lead.status === "PROPOSAL" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                            lead.status === "CLOSED_WON" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                            "bg-rose-50 text-rose-700 border border-rose-100"
                                        }`}>
                                            {statusLabel(lead.status)}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </motion.button>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Queue Empty</span>
                                <p className="text-xs text-slate-400">No leads have entered the system yet.</p>
                            </div>
                        )}
                    </div>
                </motion.article>
            </section>

            {/* Modal details */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs"
                    >
                        <motion.div 
                            initial={{ scale: 0.98, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.98, y: 10 }}
                            className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl text-left"
                        >
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="absolute right-4 top-4 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="mb-5 space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-orange-600 block">Lead Details</span>
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 pr-8">{selectedLead.name}</h3>
                                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Mail className="h-3.5 w-3.5 text-orange-500" />
                                    {selectedLead.email}
                                </p>
                            </div>

                            <div className="mb-5 grid grid-cols-3 gap-3">
                                {[
                                    { label: "Company", val: selectedLead.company },
                                    { label: "Country", val: selectedLead.country },
                                    { label: "Est. Budget", val: selectedLead.budget }
                                ].map((cell, idx) => (
                                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{cell.label}</p>
                                        <p className="mt-0.5 text-xs font-black uppercase tracking-wide text-slate-800 truncate">{cell.val || "N/A"}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4">
                                <p className="mb-2 inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                                    <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                                    Requirements
                                </p>
                                <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-slate-700">{selectedLead.description}</p>
                            </div>

                            <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                                <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                    Received: {new Date(selectedLead.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                    <a
                                        href={`mailto:${selectedLead.email}`}
                                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-white hover:bg-orange-600 transition-all text-center"
                                    >
                                        Initiate Email
                                    </a>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        <button
                            aria-label="Close modal"
                            onClick={() => setSelectedLead(null)}
                            className="absolute inset-0 -z-10 cursor-default"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
