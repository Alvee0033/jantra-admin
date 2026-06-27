"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Briefcase,
    Mail,
    Download,
    X,
    Phone,
    Plus,
    Edit3,
    Trash2,
    Settings,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
    id: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl: string;
    coverLetter?: string;
    portfolioUrl?: string;
    linkedIn?: string;
    status: string;
    createdAt: string;
    job: {
        title: string;
    };
}

interface Job {
    id: string;
    title: string;
    department: string;
    type: string;
    location: string;
    published: boolean;
    description: string;
    responsibilities: string[];
    requirements: string[];
}

export default function AdminCareersPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"applications" | "jobs">("applications");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobLoading, setJobLoading] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingType, setDeletingType] = useState<"job" | "application">("job");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [applicationStats, setApplicationStats] = useState({
        total: 0,
        withResume: 0,
        withLinkedIn: 0,
        withCoverLetter: 0,
        withPhone: 0
    });

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get("/careers/admin/applications", {
                params: { page, limit: 10 }
            });
            setApplications(response.data.applications || []);
            setTotalPages(response.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationStats = async () => {
        try {
            const response = await api.get("/careers/admin/applications", {
                params: { page: 1, limit: 1000 }
            });

            const rows: Application[] = response.data.applications || [];
            const hasValue = (value?: string) => Boolean(value && value.trim().length > 0);

            setApplicationStats({
                total: response.data.total || rows.length,
                withResume: rows.filter((r) => hasValue(r.resumeUrl)).length,
                withLinkedIn: rows.filter((r) => hasValue(r.linkedIn)).length,
                withCoverLetter: rows.filter((r) => hasValue(r.coverLetter)).length,
                withPhone: rows.filter((r) => hasValue(r.phone)).length
            });
        } catch {
        }
    };

    const fetchJobs = async () => {
        setJobLoading(true);
        try {
            const response = await api.get("/careers/admin/jobs");
            setJobs(response.data || []);
        } finally {
            setJobLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "applications") fetchApplications();
        else fetchJobs();
    }, [page, activeTab]);

    useEffect(() => {
        if (activeTab === "applications") fetchApplicationStats();
    }, [activeTab]);

    const handleDeleteJob = async (id: string) => {
        setDeletingId(id);
        setDeletingType("job");
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/careers/admin/${deletingId}`);
            fetchJobs();
        } catch {
            alert("Failed to delete job");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Careers</h2>
                    <p className="text-sm text-slate-500">Review and manage incoming job applications.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => { setActiveTab("applications"); setPage(1); }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "applications" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Applications
                    </button>
                    <button
                        onClick={() => { setActiveTab("jobs"); setPage(1); }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "jobs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Job Listings
                    </button>
                </div>
            </header>

            {activeTab === "jobs" && (
                <div className="flex justify-end">
                    <button
                        onClick={() => { setEditingJob(null); setShowJobModal(true); }}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Post New Job
                    </button>
                </div>
            )}

            {activeTab === "applications" && (
                <div className="sticky top-3 z-20 flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 rounded-2xl bg-slate-50/95 backdrop-blur px-2 py-2 border border-slate-200/70 no-scrollbar">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shrink-0 min-w-[130px] flex-1 lg:flex-initial">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Apply</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{applicationStats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shrink-0 min-w-[130px] flex-1 lg:flex-initial">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">CV Attached</p>
                        <p className="mt-1 text-xl font-black text-orange-600">{applicationStats.withResume}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shrink-0 min-w-[130px] flex-1 lg:flex-initial">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">LinkedIn</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{applicationStats.withLinkedIn}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shrink-0 min-w-[130px] flex-1 lg:flex-initial">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cover Letter</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{applicationStats.withCoverLetter}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shrink-0 min-w-[130px] flex-1 lg:flex-initial">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Phone Added</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{applicationStats.withPhone}</p>
                    </div>
                </div>
            )}

            <div className="glass-panel overflow-hidden border border-slate-200 bg-white/80 shadow-xl rounded-[2.5rem] backdrop-blur-md">
                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4 bg-slate-50/40 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {loading || (activeTab === "jobs" && jobLoading) ? (
                        <div className="px-8 py-20 text-center">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : activeTab === "applications" ? (
                        applications.length === 0 ? (
                            <div className="px-8 py-20 text-center text-slate-400 text-sm">
                                No applications received yet.
                            </div>
                        ) : (
                            applications.map((app) => (
                                <div key={app.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs shrink-0">
                                            {app.name[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 truncate">{app.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{app.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">Position:</span>
                                            <span className="font-medium text-slate-700">{app.job?.title || "Unknown Job"}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">Applied:</span>
                                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-3.5 py-2 rounded-full hover:bg-orange-100 transition-colors">
                                            <Download className="w-3 h-3" /> Resume
                                        </a>
                                        {app.portfolioUrl && (
                                            <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full hover:bg-slate-200 transition-colors">
                                                <ExternalLink className="w-3 h-3" /> Portfolio
                                            </a>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setSelectedApplication(app)}
                                            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md"
                                        >
                                            Analysis <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        jobs.length === 0 ? (
                            <div className="px-8 py-20 text-center text-slate-400 text-sm">
                                No job listings created yet.
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-base truncate">{job.title}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{job.department}</p>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${job.published ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {job.published ? 'Active' : 'Draft'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-xs text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                                        <span className="font-semibold text-slate-700">{job.location}</span>
                                        <span className="font-black uppercase text-[9px] tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{job.type}</span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                                            className="flex-1 inline-flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-slate-900 hover:text-white border border-slate-250 rounded-xl transition-all shadow-sm text-xs font-bold active:scale-95"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-red-500 hover:text-white border border-slate-250 rounded-xl transition-all shadow-sm text-xs font-bold text-red-500 hover:border-red-500 active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block max-h-[65vh] overflow-y-auto overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/20 bg-slate-900/5">
                                {activeTab === "applications" ? (
                                    <>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicant</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Position</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Resume / Links</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Applied On</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Job Title</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location / Type</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                    </>
                                )}
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading || (activeTab === "jobs" && jobLoading) ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : activeTab === "applications" ? (
                                applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-sm">
                                            No applications received yet.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-white/40 transition-colors group">
                                            <td className="px-8 py-6 text-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                                                        {app.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{app.name}</p>
                                                        <p className="text-xs text-slate-500">{app.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-medium text-slate-700">{app.job?.title || "Unknown Job"}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
                                                        <Download className="w-3 h-3" /> Resume
                                                    </a>
                                                    {app.portfolioUrl && (
                                                        <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
                                                            <ExternalLink className="w-3 h-3" /> Portfolio
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => setSelectedApplication(app)}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 group transition-all"
                                                >
                                                    Analysis <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-sm">
                                            No job listings created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-white/40 transition-colors group text-sm">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-800">{job.title}</p>
                                            </td>
                                            <td className="px-8 py-6 text-slate-600">
                                                {job.department}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-slate-700">{job.location}</span>
                                                    <span className="text-[10px] uppercase text-slate-400 font-bold">{job.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${job.published ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {job.published ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                                                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-blue-100"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteJob(job.id)}
                                                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {activeTab === "applications" && (
                    <div className="px-8 py-6 bg-slate-900/5 flex items-center justify-between border-t border-white/20">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-orange-50 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-orange-50 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Application Detail Modal */}
            <AnimatePresence>
                {selectedApplication && (
                    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col text-left align-middle relative max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-slate-900 p-5 sm:px-8 sm:py-6 flex items-center justify-between text-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg uppercase shadow-inner">
                                        {selectedApplication.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">{selectedApplication.name}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Talent Pipeline Analysis</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Position Applied</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedApplication.job?.title || "Unknown Job"}</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Applied Date</p>
                                        <p className="text-sm font-bold text-slate-800">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Contact Info</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm">
                                                <Mail className="w-4 h-4 text-orange-500" /> {selectedApplication.email}
                                            </div>
                                            {selectedApplication.phone && (
                                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm">
                                                    <Phone className="w-4 h-4 text-orange-500" /> {selectedApplication.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <a href={selectedApplication.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-all shadow-lg">
                                                <Download className="w-4 h-4" /> Download CV
                                            </a>
                                            {selectedApplication.portfolioUrl && (
                                                <a href={selectedApplication.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-lg">
                                                    <ExternalLink className="w-4 h-4" /> Portfolio Site
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Cover Letter / Highlights</h4>
                                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[120px]">
                                            {selectedApplication.coverLetter || "No cover letter provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 sm:px-8 sm:py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Submitted: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <button onClick={() => setSelectedApplication(null)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all text-center">
                                        Close Details
                                    </button>
                                    <a href={`mailto:${selectedApplication.email}`} className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                                        Contact Applicant
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Job Create/Edit Modal */}
            <AnimatePresence>
                {showJobModal && (
                    <JobModal
                        job={editingJob}
                        onClose={() => setShowJobModal(false)}
                        onSuccess={() => { fetchJobs(); setShowJobModal(false); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-200 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Removal</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                            This action is permanent and cannot be reversed. Are you sure you wish to delete this {deletingType}?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all"
                            >
                                Keep it
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                            >
                                Delete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function JobModal({ job, onClose, onSuccess }: { job: Job | null, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        title: job?.title || "",
        department: job?.department || "Engineering",
        type: job?.type || "Full-Time",
        location: job?.location || "Dhaka / Remote",
        description: job?.description || "",
        responsibilities: job?.responsibilities?.join("\n") || "",
        requirements: job?.requirements?.join("\n") || "",
        published: job?.published ?? true
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            ...formData,
            responsibilities: formData.responsibilities.split("\n").filter(l => l.trim()),
            requirements: formData.requirements.split("\n").filter(l => l.trim())
        };

        try {
            if (job) await api.put(`/careers/admin/${job.id}`, data);
            else await api.post("/careers/admin", data);
            onSuccess();
        } catch (error: any) {
            console.error("Failed to save job:", error);
            const fieldErrors = error?.response?.data?.errors;
            const message = fieldErrors
                ? Object.values(fieldErrors).flat().filter(Boolean).join(" ")
                : "";
            alert(message || error?.response?.data?.error || "Failed to save job listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 custom-scrollbar">
            <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col text-left align-middle relative max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white shrink-0">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{job ? "Edit Job Posting" : "Add New Job Posting"}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Careers Management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Job Title</label>
                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Department</label>
                            <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-sm font-medium">
                                <option>Engineering</option>
                                <option>Design</option>
                                <option>Product</option>
                                <option>Business</option>
                                <option>Support</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Location</label>
                            <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Employment Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-sm font-medium">
                                <option>Full-Time</option>
                                <option>Part-Time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Overview / Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-sm leading-relaxed" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Responsibilities (One per line)</label>
                                <textarea rows={6} value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-xs font-mono" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Requirements (One per line)</label>
                                <textarea rows={6} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all text-xs font-mono" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 ml-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, published: !formData.published })}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.published ? 'bg-orange-500' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.published ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Enable Live Publication</span>
                    </div>
                </form>

                <div className="p-5 sm:px-8 sm:py-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-5 shrink-0">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100">Cancel</button>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50"
                    >
                        {loading ? "Processing..." : job ? "Update Listing" : "Publish Job Post"}
                    </button>
                </div>
            </motion.div>
            </div>
        </div>
    );
}
