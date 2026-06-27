"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    BarChart3,
    CalendarRange,
    CheckCircle2,
    Clock3,
    FileText,
    Filter,
    Loader2,
    Save,
    Send,
    ShieldAlert,
    Sparkles,
    User2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "NEEDS_REVISION";
type ReportPeriod = "DAILY" | "WEEKLY" | "MONTHLY";
type BlockerSeverity = "NONE" | "LOW" | "MEDIUM" | "CRITICAL";

interface TeamMemberOption {
    id: string;
    name: string;
    role: string;
    department: string;
    teamId?: string | null;
}

interface ReportRecord {
    id: string;
    title: string;
    periodType: ReportPeriod;
    status: ReportStatus;
    department: string;
    teamId?: string | null;
    accomplishments: string;
    nextSteps: string;
    blockers?: string;
    blockerSeverity: BlockerSeverity;
    feedback?: string;
    revisionCount: number;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    teamMember?: TeamMemberOption | null;
    author?: { id: string; email: string; name?: string | null; role: string } | null;
    reviewer?: { id: string; email: string; name?: string | null; role: string } | null;
}

interface Analytics {
    summary: {
        totalReports: number;
        pendingReports: number;
        approvedReports: number;
        needsRevisionReports: number;
        draftReports: number;
        criticalBlockers: number;
    };
    organizationHealth: {
        activeDepartments: number;
        complianceRate: number;
        averageApprovalHours: number;
    };
    velocity: Array<{ key: string; label: string; submitted: number; approved: number }>;
    departmentCompliance: Array<{
        department: string;
        total: number;
        approved: number;
        submitted: number;
        needsRevision: number;
        complianceRate: number;
    }>;
    teamRoster: Array<{
        teamMemberId: string;
        memberName: string;
        department: string;
        teamId?: string | null;
        reportCount: number;
        approvedCount: number;
        latestStatus: string;
        latestSubmittedAt?: string | null;
    }>;
}

interface Settings {
    id: string;
    dailyCutoffTime: string;
    weeklySummaryDay: string;
    weeklySummaryTime: string;
    emailNotifications: boolean;
    alertRouting: boolean;
}

interface AuditEntry {
    id: string;
    action: string;
    actor: string;
    subject: string;
    status: string;
    occurredAt: string;
}

interface TeamOverviewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    teamId?: string | null;
}

const defaultAnalytics: Analytics = {
    summary: {
        totalReports: 0,
        pendingReports: 0,
        approvedReports: 0,
        needsRevisionReports: 0,
        draftReports: 0,
        criticalBlockers: 0
    },
    organizationHealth: {
        activeDepartments: 0,
        complianceRate: 0,
        averageApprovalHours: 0
    },
    velocity: [],
    departmentCompliance: [],
    teamRoster: []
};

const defaultSettings: Settings = {
    id: "global",
    dailyCutoffTime: "18:00",
    weeklySummaryDay: "Friday",
    weeklySummaryTime: "17:00",
    emailNotifications: true,
    alertRouting: true
};

export default function ReportPage() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<ReportRecord[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>(defaultAnalytics);
    const [team, setTeam] = useState<TeamMemberOption[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [savingSettings, setSavingSettings] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
    const [reviewFeedback, setReviewFeedback] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
    const [periodFilter, setPeriodFilter] = useState<ReportPeriod | "ALL">("ALL");
    const [formData, setFormData] = useState({
        teamMemberId: "",
        periodType: "DAILY" as ReportPeriod,
        title: "",
        accomplishments: "",
        nextSteps: "",
        blockers: "",
        blockerSeverity: "NONE" as BlockerSeverity,
        status: "SUBMITTED" as "DRAFT" | "SUBMITTED"
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [reportsRes, teamRes, settingsRes, auditRes] = await Promise.all([
                api.get("/reports"),
                api.get("/reports/team-overview"),
                api.get("/reports/settings"),
                api.get("/reports/audit")
            ]);

            setReports(reportsRes.data.reports || []);
            setAnalytics(reportsRes.data.analytics || defaultAnalytics);
            setTeam((teamRes.data.team || []).map((member: TeamOverviewMember) => ({
                id: member.id,
                name: member.name,
                role: member.role,
                department: member.department,
                teamId: member.teamId
            })));
            setSettings(settingsRes.data || defaultSettings);
            setAuditLog(auditRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        if (!formData.teamMemberId && team.length) {
            setFormData((current) => ({ ...current, teamMemberId: team[0].id }));
        }
    }, [team, formData.teamMemberId]);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (statusFilter !== "ALL" && report.status !== statusFilter) return false;
            if (periodFilter !== "ALL" && report.periodType !== periodFilter) return false;
            return true;
        });
    }, [reports, statusFilter, periodFilter]);

    const reviewQueue = useMemo(() => {
        return reports.filter((report) => report.status === "SUBMITTED" || report.status === "NEEDS_REVISION").slice(0, 6);
    }, [reports]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/reports", formData);
            setComposerOpen(false);
            setFormData({
                teamMemberId: team[0]?.id || "",
                periodType: "DAILY",
                title: "",
                accomplishments: "",
                nextSteps: "",
                blockers: "",
                blockerSeverity: "NONE",
                status: "SUBMITTED"
            });
            await fetchAll();
        } catch (error: any) {
            console.error("Error submitting report:", error);
            alert(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to submit report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReview = async (nextStatus: "APPROVED" | "NEEDS_REVISION") => {
        if (!selectedReport) return;
        setReviewing(true);
        try {
            await api.patch(`/reports/${selectedReport.id}/review`, {
                status: nextStatus,
                feedback: reviewFeedback
            });
            setSelectedReport(null);
            setReviewFeedback("");
            await fetchAll();
        } catch (error: any) {
            console.error("Error reviewing report:", error);
            alert(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to submit review. Please try again.");
        } finally {
            setReviewing(false);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await api.put("/reports/settings", settings);
            await fetchAll();
            alert("Settings updated successfully.");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            alert(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save settings. Please try again.");
        } finally {
            setSavingSettings(false);
        }
    };

    const statCards = [
        {
            label: "Total Reports",
            value: analytics.summary.totalReports,
            tone: "from-slate-900 to-slate-700",
            accent: "text-white"
        },
        {
            label: "Pending Review",
            value: analytics.summary.pendingReports,
            tone: "from-orange-500 to-amber-400",
            accent: "text-white"
        },
        {
            label: "Compliance Rate",
            value: `${analytics.organizationHealth.complianceRate}%`,
            tone: "from-orange-500 to-orange-400",
            accent: "text-white"
        },
        {
            label: "Critical Blockers",
            value: analytics.summary.criticalBlockers,
            tone: "from-red-500 to-rose-400",
            accent: "text-white"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-28">
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.94))] p-6 sm:p-8 text-white shadow-2xl shadow-slate-300/40"
            >
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.18),_transparent_45%)] pointer-events-none" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-orange-200">
                            <Sparkles className="w-4 h-4" />
                            WorkStream
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Operational Reporting Nexus</h1>
                            <p className="mt-3 max-w-2xl text-sm text-slate-300 leading-relaxed">
                                Submit daily, weekly, and monthly work reports, route review decisions, monitor blockers, and keep organization-wide reporting health visible in one place.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/admin/team"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                        >
                            <User2 className="w-4 h-4" />
                            Team Roster
                        </Link>
                        <button
                            onClick={() => setComposerOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
                        >
                            <Send className="w-4 h-4" />
                            New Report
                        </button>
                    </div>
                </div>
            </motion.header>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className={cn("rounded-[2rem] p-[1px] bg-gradient-to-br shadow-xl shadow-slate-200/50", card.tone)}>
                        <div className="rounded-[2rem] bg-white/95 p-5 sm:p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                            <p className="mt-4 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{card.value}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Velocity</p>
                            <h2 className="text-2xl font-black text-slate-900 mt-2">Submission vs Approval Trend</h2>
                        </div>
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.velocity}>
                                <defs>
                                    <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="approvedFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0f172a" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#0f172a" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="submitted" stroke="#14b8a6" fill="url(#submittedFill)" strokeWidth={3} />
                                <Area type="monotone" dataKey="approved" stroke="#0f172a" fill="url(#approvedFill)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Org Health</p>
                            <h2 className="text-2xl font-black text-slate-900 mt-2">Department Compliance</h2>
                        </div>
                        <CalendarRange className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.departmentCompliance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="department" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="complianceRate" fill="#0f172a" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-6">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Review Queue</p>
                            <h2 className="text-2xl font-black text-slate-900 mt-2">Actionable Report Feed</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["ALL", "SUBMITTED", "APPROVED", "NEEDS_REVISION", "DRAFT"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as ReportStatus | "ALL")}
                                    className={cn(
                                        "rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                                        statusFilter === status
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-500"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Filter className="w-4 h-4 text-orange-500" />
                        {["ALL", "DAILY", "WEEKLY", "MONTHLY"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setPeriodFilter(period as ReportPeriod | "ALL")}
                                className={cn(
                                    "rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                                    periodFilter === period
                                        ? "bg-orange-500 text-white"
                                        : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredReports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => {
                                    setSelectedReport(report);
                                    setReviewFeedback(report.feedback || "");
                                }}
                                className="w-full rounded-[2rem] border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-orange-300 hover:bg-white"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                                                {report.periodType}
                                            </span>
                                            <span className={cn(
                                                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em]",
                                                report.status === "APPROVED" && "bg-orange-50 text-orange-700",
                                                report.status === "SUBMITTED" && "bg-orange-50 text-orange-700",
                                                report.status === "NEEDS_REVISION" && "bg-red-50 text-red-700",
                                                report.status === "DRAFT" && "bg-slate-200 text-slate-700"
                                            )}>
                                                {report.status.replace("_", " ")}
                                            </span>
                                            {report.blockerSeverity === "CRITICAL" && (
                                                <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                                                    Critical Blocker
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-3 text-lg font-black text-slate-900">{report.title}</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {report.teamMember?.name || "Unassigned"} · {report.department}
                                            {report.teamId ? ` · ${report.teamId}` : ""}
                                        </p>
                                    </div>
                                    <div className="text-sm text-slate-400 sm:text-right">
                                        <p>{new Date(report.submittedAt || report.createdAt).toLocaleDateString()}</p>
                                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em]">Revision {report.revisionCount}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Queue Summary</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-2">Priority Review Lane</h2>
                        <div className="mt-6 space-y-3">
                            {reviewQueue.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setReviewFeedback(report.feedback || "");
                                    }}
                                    className="flex w-full items-start justify-between gap-3 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-left transition hover:bg-orange-50"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{report.teamMember?.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{report.title}</p>
                                    </div>
                                    <Clock3 className="w-4 h-4 text-orange-500 shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Admin Settings</p>
                                <h2 className="text-2xl font-black text-slate-900 mt-2">Deadlines & Routing</h2>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                disabled={savingSettings}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-orange-500 disabled:opacity-50"
                            >
                                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Daily Cutoff</span>
                                <input
                                    value={settings.dailyCutoffTime}
                                    onChange={(e) => setSettings((current) => ({ ...current, dailyCutoffTime: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Weekly Day</span>
                                <input
                                    value={settings.weeklySummaryDay}
                                    onChange={(e) => setSettings((current) => ({ ...current, weeklySummaryDay: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Weekly Time</span>
                                <input
                                    value={settings.weeklySummaryTime}
                                    onChange={(e) => setSettings((current) => ({ ...current, weeklySummaryTime: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900"
                                />
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setSettings((current) => ({ ...current, emailNotifications: !current.emailNotifications }))}
                                    className={cn("rounded-2xl px-4 py-3 text-left text-sm font-semibold transition", settings.emailNotifications ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-500")}
                                >
                                    Email Notifications: {settings.emailNotifications ? "On" : "Off"}
                                </button>
                                <button
                                    onClick={() => setSettings((current) => ({ ...current, alertRouting: !current.alertRouting }))}
                                    className={cn("rounded-2xl px-4 py-3 text-left text-sm font-semibold transition", settings.alertRouting ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-500")}
                                >
                                    Alert Routing: {settings.alertRouting ? "On" : "Off"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Audit Ledger</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-2">Latest System Actions</h2>
                        <div className="mt-6 space-y-3 max-h-80 overflow-y-auto">
                            {auditLog.slice(0, 8).map((entry) => (
                                <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">{entry.action.replaceAll("_", " ")}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{entry.subject}</p>
                                    <p className="mt-1 text-xs text-slate-500">{entry.actor} · {new Date(entry.occurredAt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {composerOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" onClick={() => setComposerOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="relative w-full max-w-3xl rounded-[2.5rem] border border-white/20 bg-white shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Submission Engine</p>
                                    <h2 className="text-2xl font-black text-slate-900 mt-2">Create Work Report</h2>
                                </div>
                                <button onClick={() => setComposerOpen(false)} className="rounded-2xl bg-slate-50 p-3 text-slate-500 transition hover:bg-slate-900 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Team Member</span>
                                        <select
                                            value={formData.teamMemberId}
                                            onChange={(e) => setFormData((current) => ({ ...current, teamMemberId: e.target.value }))}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900"
                                        >
                                            {team.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} · {member.department}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Period Type</span>
                                        <select
                                            value={formData.periodType}
                                            onChange={(e) => setFormData((current) => ({ ...current, periodType: e.target.value as ReportPeriod }))}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900"
                                        >
                                            <option value="DAILY">Daily</option>
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                        </select>
                                    </label>
                                </div>

                                <label className="space-y-2 block">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Report Title</span>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900"
                                        placeholder="Optional, leave blank for generated title"
                                    />
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="space-y-2 block">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Accomplishments</span>
                                        <textarea
                                            value={formData.accomplishments}
                                            onChange={(e) => setFormData((current) => ({ ...current, accomplishments: e.target.value }))}
                                            rows={5}
                                            className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 resize-none"
                                        />
                                    </label>
                                    <label className="space-y-2 block">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Next Steps</span>
                                        <textarea
                                            value={formData.nextSteps}
                                            onChange={(e) => setFormData((current) => ({ ...current, nextSteps: e.target.value }))}
                                            rows={5}
                                            className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 resize-none"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.6fr] gap-4">
                                    <label className="space-y-2 block">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Blockers</span>
                                        <textarea
                                            value={formData.blockers}
                                            onChange={(e) => setFormData((current) => ({ ...current, blockers: e.target.value }))}
                                            rows={4}
                                            className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 resize-none"
                                        />
                                    </label>
                                    <div className="space-y-4">
                                        <label className="space-y-2 block">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Severity</span>
                                            <select
                                                value={formData.blockerSeverity}
                                                onChange={(e) => setFormData((current) => ({ ...current, blockerSeverity: e.target.value as BlockerSeverity }))}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900"
                                            >
                                                <option value="NONE">None</option>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="CRITICAL">Critical</option>
                                            </select>
                                        </label>
                                        <label className="space-y-2 block">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Lifecycle</span>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData((current) => ({ ...current, status: e.target.value as "DRAFT" | "SUBMITTED" }))}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900"
                                            >
                                                <option value="SUBMITTED">Submit for Review</option>
                                                <option value="DRAFT">Save as Draft</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                    <button type="button" onClick={() => setComposerOpen(false)} className="rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 transition hover:text-red-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-orange-500 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                        {formData.status === "DRAFT" ? "Save Draft" : "Submit Report"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 z-[1000] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative h-full w-full max-w-xl overflow-y-auto border-l border-white/20 bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Interactive Review</p>
                                    <h2 className="text-2xl font-black text-slate-900 mt-2">{selectedReport.title}</h2>
                                </div>
                                <button onClick={() => setSelectedReport(null)} className="rounded-2xl bg-slate-50 p-3 text-slate-500 transition hover:bg-slate-900 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6 p-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-[1.5rem] bg-slate-50 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Member</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">{selectedReport.teamMember?.name}</p>
                                    </div>
                                    <div className="rounded-[1.5rem] bg-slate-50 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Department</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">{selectedReport.department}</p>
                                    </div>
                                </div>

                                <div className="rounded-[2rem] border border-slate-200 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Accomplishments</p>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedReport.accomplishments}</p>
                                </div>
                                <div className="rounded-[2rem] border border-slate-200 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Next Steps</p>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedReport.nextSteps}</p>
                                </div>
                                <div className="rounded-[2rem] border border-slate-200 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Blockers</p>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedReport.blockers || "No blockers recorded."}</p>
                                </div>

                                <label className="space-y-2 block">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Manager Feedback</span>
                                    <textarea
                                        value={reviewFeedback}
                                        onChange={(e) => setReviewFeedback(e.target.value)}
                                        rows={5}
                                        className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 resize-none"
                                    />
                                </label>
                            </div>

                            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-100 bg-white p-6">
                                <button
                                    onClick={() => handleReview("APPROVED")}
                                    disabled={reviewing}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-orange-400 disabled:opacity-50"
                                >
                                    {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Approve Report
                                </button>
                                <button
                                    onClick={() => handleReview("NEEDS_REVISION")}
                                    disabled={reviewing}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-red-400 disabled:opacity-50"
                                >
                                    {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                    Request Revision
                                </button>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
