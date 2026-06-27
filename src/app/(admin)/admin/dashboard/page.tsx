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
    ShieldAlert,
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
    recentReports: ReportSummary[];
    reportAnalytics: {
        summary: {
            pendingReports: number;
            criticalBlockers: number;
        };
        organizationHealth: {
            complianceRate: number;
            averageApprovalHours: number;
        };
    };
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
    referral?: string | null;
    createdAt: string;
}

interface ReportSummary {
    id: string;
    title: string;
    status: string;
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
        { label: "Leads", value: stats?.counts.leads || 0, icon: Bell, tone: "bg-orange-50 text-orange-600 border-orange-100", hoverTone: "hover:border-orange-300" },
        { label: "Applicants", value: stats?.counts.applications || 0, icon: Users, tone: "bg-sky-50 text-sky-600 border-sky-100", hoverTone: "hover:border-sky-300" },
        { label: "Blogs", value: stats?.counts.blogs || 0, icon: FileText, tone: "bg-amber-50 text-amber-600 border-amber-100", hoverTone: "hover:border-amber-300" },
        { label: "Projects", value: stats?.counts.projects || 0, icon: Briefcase, tone: "bg-purple-50 text-purple-600 border-purple-100", hoverTone: "hover:border-purple-300" },
        { label: "Reports", value: stats?.counts.reports || 0, icon: ShieldAlert, tone: "bg-slate-50 text-slate-600 border-slate-150", hoverTone: "hover:border-slate-300" }
    ];

    return (
        <div className="space-y-6">
            {/* Header section with technical styling */}
            <motion.section 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-5 md:p-8 shadow-sm backdrop-blur-md"
            >
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 animate-pulse" /> System Overview
                    </span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
                        Control Center<span className="text-orange-500">.</span>
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Operational intelligence, communications pipeline, and analytics.
                    </p>
                </div>
            </motion.section>

            {/* Metrics cards grid */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {statCards.map((stat, i) => (
                    <motion.article 
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group relative overflow-hidden rounded-2xl border border-white/40 bg-white/75 p-5 shadow-lg shadow-slate-100/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${stat.hoverTone}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-xl border p-2.5 transition-colors ${stat.tone}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                                {loading ? "Syncing..." : "Status Active"}
                            </span>
                        </div>
                        <p className={`mt-5 text-3xl font-black tracking-tight text-slate-900 ${loading ? 'animate-pulse text-slate-300' : ''}`}>
                            {loading ? "-" : stat.value}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                    </motion.article>
                ))}
            </section>

            {/* Content main split view */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* Recent Leads Panel */}
                <motion.article 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between"
                >
                    <div>
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Pipeline Inbound</span>
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Recent Leads</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Click any entry to inspect full description payload.</p>
                            </div>
                            <Link 
                                href="/admin/leads" 
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/10"
                            >
                                All Leads <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="rounded-2xl border border-dashed border-slate-200/80 p-12 text-center">
                                    <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Fetching pipeline data...</span>
                                </div>
                            ) : stats?.recentLeads.length ? (
                                stats.recentLeads.map((lead) => (
                                    <motion.button
                                        whileHover={{ scale: 1.005 }}
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className="flex w-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white/50 p-4 text-left shadow-sm transition hover:border-orange-200/80 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="truncate text-xs font-black uppercase tracking-wide text-slate-900">{lead.name}</p>
                                            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{lead.service || "General Inquiry"}</p>
                                        </div>
                                        <div className="flex items-center gap-3 sm:justify-end">
                                            <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
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
                                <div className="rounded-2xl border border-dashed border-slate-200/80 p-12 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Queue Empty</span>
                                    <p className="text-xs text-slate-400">No leads have entered the system yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.article>

                {/* Operational Health Card with Dark styling */}
                <motion.article 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 p-6 text-slate-100 shadow-xl shadow-slate-950/20 flex flex-col justify-between"
                >
                    <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-orange-600/10 blur-3xl" />
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500">Telemetry</span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">Operational Health</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Real-time summaries and audit reports status.</p>
                        
                        <div className="mt-6 space-y-3">
                            {[
                                { label: "Pending Reports", value: stats?.reportAnalytics?.summary.pendingReports || 0 },
                                { label: "Critical Blockers", value: stats?.reportAnalytics?.summary.criticalBlockers || 0, highlight: (stats?.reportAnalytics?.summary.criticalBlockers || 0) > 0 },
                                { label: "Organization Compliance", value: `${stats?.reportAnalytics?.organizationHealth.complianceRate || 0}%` },
                                { label: "Avg Approval Latency", value: `${stats?.reportAnalytics?.organizationHealth.averageApprovalHours || 0} Hrs` }
                            ].map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/[0.03] px-4 py-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                                    <span className={`text-xs font-black uppercase tracking-wide ${row.highlight ? "text-red-500" : "text-white"}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Link 
                        href="/admin/report" 
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/10"
                    >
                        Open Reports Hub <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </motion.article>
            </section>

            {/* Modal Redesign - premium details */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/40 bg-white/95 p-5 md:p-8 shadow-2xl backdrop-blur-xl"
                        >
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="absolute right-4 top-4 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="mb-6 space-y-1.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 block">Lead Details Payload</span>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight pr-8">{selectedLead.name}</h3>
                                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Mail className="h-3.5 w-3.5 text-orange-500" />
                                    {selectedLead.email}
                                </p>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {[
                                    { label: "Company", val: selectedLead.company },
                                    { label: "Country", val: selectedLead.country },
                                    { label: "Est. Budget", val: selectedLead.budget }
                                ].map((cell, idx) => (
                                    <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{cell.label}</p>
                                        <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-800 truncate">{cell.val || "N/A"}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <p className="mb-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                                    Description / Requirements
                                </p>
                                <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-slate-700">{selectedLead.description}</p>
                            </div>

                            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                                <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                    Received: {new Date(selectedLead.createdAt).toLocaleString()}
                                </p>
                                <div className="flex gap-2.5">
                                    <a
                                        href={`mailto:${selectedLead.email}`}
                                        className="rounded-xl bg-slate-950 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/10 transition-all text-center"
                                    >
                                        Initiate Email
                                    </a>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
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
