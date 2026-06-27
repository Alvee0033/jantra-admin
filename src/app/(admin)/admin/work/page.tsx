"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";
import {
    Plus,
    Edit3,
    Trash2,
    Loader2,
    X,
    UploadCloud,
    Image as ImageIcon,
    ExternalLink,
    CheckCircle2,
    Circle,
    LayoutGrid,
    Globe,
    Zap,
    ChevronRight,
    Search,
    Monitor,
    Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    title: string;
    slug: string;
    client: string;
    thumbnail?: string;
    category: string[];
    description?: string;
    challenge?: string;
    approach?: string;
    features?: string[];
    techStack?: string[];
    results?: string;
    liveUrl?: string;
    published: boolean;
    featured: boolean;
    createdAt: string;
}

const AVAILABLE_CATEGORIES = [
    "Web Design", 
    "Web App",
    "Mobile App", 
    "AI & ML", 
    "Automation", 
    "SaaS", 
    "Cloud Infra", 
    "UI/UX Design", 
    "Enterprise", 
    "E-Commerce",
    "Software Dev",
    "Data Science",
    "Cybersecurity",
    "Branding",
    "IoT & Embedded"
];

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const normalizeTextList = (values: string[]) =>
    values.map((value) => value.trim()).filter(Boolean);

export default function WorkManagementPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        client: "",
        thumbnail: "",
        category: [] as string[],
        description: "",
        challenge: "",
        approach: "",
        features: [] as string[],
        techStack: [] as string[],
        results: "",
        liveUrl: "",
        featured: false,
        published: true
    });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/work/all");
            setProjects(response.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Auto-slug generation
    useEffect(() => {
        if (!editingId && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, editingId]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);

        setUploadingImage(true);
        try {
            const res = await api.post('/admin/work/upload-image', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.url) {
                setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
            }
        } catch {
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const payload: Record<string, unknown> = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                client: formData.client.trim(),
                thumbnail: normalizeUrl(formData.thumbnail),
                category: formData.category,
                description: formData.description.trim(),
                challenge: formData.challenge.trim(),
                approach: formData.approach.trim(),
                features: formData.features,
                techStack: formData.techStack,
                results: formData.results.trim(),
                featured: formData.featured,
                published: formData.published,
                liveUrl: normalizeUrl(formData.liveUrl),
                order: 0,
            };

            if (editingId) {
                await api.put(`/admin/work/${editingId}`, payload);
            } else {
                await api.post("/admin/work", payload);
            }
            setModalOpen(false);
            setEditingId(null);
            fetchProjects();
            resetForm();
        } catch (error: any) {
            console.error("Failed to save project:", error);
            const message = error?.response?.data?.error || error?.response?.data?.message || "Failed to save project Blueprint.";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "", slug: "", client: "", thumbnail: "",
            category: [], description: "", challenge: "", approach: "",
            features: [], techStack: [], results: "",
            liveUrl: "",
            featured: false, published: true
        });
        setSubmitError("");
    };

    const handleEdit = (project: Project) => {
        setFormData({
            title: project.title,
            slug: project.slug,
            client: project.client,
            thumbnail: project.thumbnail || "",
            category: project.category || [],
            description: project.description || "",
            challenge: project.challenge || "",
            approach: project.approach || "",
            features: project.features || [],
            techStack: project.techStack || [],
            results: project.results || "",
            liveUrl: project.liveUrl || "",
            featured: project.featured,
            published: project.published
        });
        setEditingId(project.id);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/work/${id}`);
            fetchProjects();
        } catch {
        }
    };

    const handleTogglePublish = async (id: string) => {
        try {
            await api.patch(`/admin/work/${id}/publish`);
            setProjects(prev => prev.map(p => p.id === id ? { ...p, published: !p.published } : p));
        } catch {
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await api.patch(`/admin/work/${id}/featured`);
            setProjects(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
        } catch {
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.client.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    return (
        <div className="space-y-8 pb-24 md:pb-20">
            {/* Header Section */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6"
            >
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-orange-500" />
                        Portfolio Management
                    </h2>
                    <p className="text-slate-500 font-medium">Engineer, catalog, and showcase your technological milestones.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find a project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full sm:w-64 shadow-sm font-medium"
                        />
                    </div>
                    
                    <button
                        onClick={() => {
                            setEditingId(null);
                            resetForm();
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
                        <span>Add New Project</span>
                    </button>
                </div>
            </motion.header>

            {/* Main Content Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden"
            >
                <div className="md:hidden p-4 space-y-4 bg-slate-50/40">
                    {loading ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Datagrid...</p>
                            </div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <LayoutGrid className="w-16 h-16 text-slate-300" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No matching infrastructure found</p>
                            </div>
                        </div>
                    ) : (
                        filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex gap-4">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner">
                                        {project.thumbnail ? (
                                            <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-300">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate">{project.title}</h3>
                                                <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">/{project.slug}</p>
                                            </div>
                                            {project.featured && (
                                                <span className="flex items-center gap-1 text-[8px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-black uppercase shrink-0">
                                                    <Zap className="w-2 h-2 fill-current" /> Premium
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 mt-2">{project.client}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {project.category.map((cat, i) => (
                                        <span key={i} className="text-[9px] bg-slate-100/80 text-slate-500 px-2.5 py-1 rounded-lg font-bold tracking-tight border border-slate-200">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => handleTogglePublish(project.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                                            project.published
                                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                                : "bg-orange-50 text-orange-600 border-orange-100"
                                        )}
                                    >
                                        {project.published ? <Globe className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                                        {project.published ? "Live" : "Draft"}
                                    </button>
                                    <button
                                        onClick={() => handleToggleFeatured(project.id)}
                                        className={cn(
                                            "p-2 rounded-xl border transition-all",
                                            project.featured
                                                ? "bg-purple-50 text-purple-600 border-purple-100"
                                                : "bg-slate-50 text-slate-300 border-slate-100"
                                        )}
                                        title={project.featured ? "Featured" : "Regular"}
                                    >
                                        <Zap className={cn("w-4 h-4", project.featured && "fill-current")} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="inline-flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="inline-flex items-center justify-center gap-2 p-3 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-2xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity & Design</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Client Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Architecture</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status Matrix</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Datagrid...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <LayoutGrid className="w-16 h-16 text-slate-300" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">No matching infrastructure found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project, index) => (
                                    <motion.tr 
                                        key={project.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-orange-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-5 max-w-sm">
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner group-hover:border-orange-200 transition-colors">
                                                    {project.thumbnail ? (
                                                        <img src={project.thumbnail} alt="" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-slate-300">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate pr-2">{project.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">/{project.slug}</span>
                                                        {project.featured && (
                                                            <span className="flex items-center gap-1 text-[8px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase">
                                                                <Zap className="w-2 h-2 fill-current" /> Premium
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{project.client}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Enterprise Stakeholder</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {project.category.map((cat, i) => (
                                                    <span key={i} className="text-[9px] bg-slate-100/80 text-slate-500 px-2.5 py-1 rounded-lg font-bold tracking-tight border border-slate-200 group-hover:border-orange-100 group-hover:bg-orange-50 transition-colors">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleTogglePublish(project.id)}
                                                    className={cn(
                                                        "group/status flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                                                        project.published 
                                                            ? "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100" 
                                                            : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                                                    )}
                                                >
                                                    {project.published ? <Globe className="w-3 h-3 animate-pulse" /> : <Monitor className="w-3 h-3" />}
                                                    {project.published ? 'Live Environment' : 'Sandbox Draft'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFeatured(project.id)}
                                                    className={cn(
                                                        "p-2 rounded-xl border transition-all",
                                                        project.featured 
                                                            ? "bg-purple-50 text-purple-600 border-purple-100 shadow-sm" 
                                                            : "bg-slate-50 text-slate-300 border-slate-100 hover:border-slate-200 hover:text-slate-400"
                                                    )}
                                                    title={project.featured ? "Featured" : "Regular"}
                                                >
                                                    <Zap className={cn("w-4 h-4", project.featured && "fill-current")} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(project)} 
                                                    className="p-2.5 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-90 group/btn"
                                                >
                                                    <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-2.5 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-2xl transition-all shadow-sm active:scale-90 group/btn"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Professional Modal System */}
            {isMounted && modalOpen && createPortal(
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
                        >
                            {/* Left Side: Visual/Context */}
                            <div className="hidden md:flex md:w-1/3 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center">
                                        <LayoutGrid className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tight leading-none leading-[1.1]">{editingId ? "Refine Project Blueprint" : "Initialize New Milestone"}</h3>
                                        <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">Systematic architecture for high-performance portfolio showcasing.</p>
                                    </div>

                                    <div className="pt-8 space-y-4">
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            AUTOGEN SLUG CAPABILITY
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            REAL-TIME CLOUD UPLOAD
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            ENTERPRISE STATUS MATRIX
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Jantra Cloud Infrastructure v4.0</p>
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <div className="flex items-center justify-between p-5 sm:p-6 md:px-12 border-b border-slate-100 shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Project Parameters</span>
                                    <button 
                                        onClick={() => setModalOpen(false)}
                                        className="p-3 bg-slate-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 md:p-12 space-y-8 md:space-y-10">
                                    <form id="project-form" onSubmit={handleAddProject} className="space-y-10">
                                        {/* Core Identity */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Project Title*</label>
                                                <input
                                                    type="text" required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                    placeholder="e.g. Advanced AI Engine"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Universal Slug</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-mono text-sm">/</span>
                                                    <input
                                                        type="text" required
                                                        value={formData.slug}
                                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] pl-8 pr-5 py-4 text-sm font-mono text-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                                        placeholder="auto-generated-slug"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Media */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Cinematic Keyframe (Thumbnail)</label>
                                            <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                                <div className="relative w-full sm:w-48 aspect-video sm:aspect-square md:aspect-video rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center group flex-shrink-0">
                                                    {formData.thumbnail ? (
                                                        <>
                                                            <img src={formData.thumbnail} alt="" className="object-cover w-full h-full" />
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, thumbnail: "" })}
                                                                    className="bg-red-500 text-white p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                                            <ImageIcon className="w-8 h-8 opacity-40 shrink-0" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">No Keyframe</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 flex flex-col justify-center space-y-4">
                                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                        Recommended: <span className="text-slate-900 font-bold">1920x1080px (16:9)</span>. 
                                                        Format: JPNG/PNG. Max size: 2MB. This image defines the project in the public grid.
                                                    </p>
                                                    <label className={cn(
                                                        "cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all border-2 shadow-sm w-full sm:w-fit active:scale-95",
                                                        uploadingImage 
                                                            ? "bg-slate-50 text-slate-300 border-slate-100 pointer-events-none" 
                                                            : "bg-white border-slate-100 hover:border-orange-500 hover:text-orange-600 hover:shadow-orange-500/10"
                                                    )}>
                                                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                                        <span>{uploadingImage ? 'TRANSMITTING...' : 'UPLOAD FRAME'}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client & Deployment */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Client Entity</label>
                                                <input
                                                    type="text" required
                                                    value={formData.client}
                                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                                    placeholder="e.g. Global Tech Solutions"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Production URL</label>
                                                <div className="relative">
                                                     <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        inputMode="url"
                                                        value={formData.liveUrl}
                                                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                                                        onBlur={(e) => setFormData({ ...formData, liveUrl: normalizeUrl(e.target.value) })}
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-mono text-slate-500"
                                                        placeholder="https://cloud.engine.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Architecture Classification</label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {AVAILABLE_CATEGORIES.map(cat => {
                                                    const isActive = formData.category.includes(cat);
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    category: isActive
                                                                        ? formData.category.filter(c => c !== cat)
                                                                        : [...formData.category, cat]
                                                                });
                                                            }}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                                                isActive 
                                                                    ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/30 scale-105" 
                                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:border-orange-200"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Project Brief */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Project Brief</label>
                                            <textarea
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                placeholder="Summarize the project in a few sharp lines..."
                                            />
                                        </div>

                                        {/* Technical Narrative */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">The Challenge</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.challenge}
                                                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                    placeholder="Identify the core problem..."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Our Strategy</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.approach}
                                                    onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                    placeholder="Describe the execution plan and strategic direction..."
                                                />
                                            </div>
                                        </div>

                                        {/* Feature System */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Key Features</label>
                                                <textarea
                                                    rows={5}
                                                    value={formData.features.join("\n")}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        features: e.target.value.split("\n").map(item => item.trim()).filter(Boolean)
                                                    })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                    placeholder={`Authentication flow\nReal-time dashboard\nRole-based access`}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Technology Protocol</label>
                                                <textarea
                                                    rows={5}
                                                    value={formData.techStack.join(", ")}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        techStack: e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                                                    })}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                    placeholder="Next.js, Node.js, Prisma, PostgreSQL"
                                                />
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Performance Metrics</label>
                                            <textarea
                                                rows={3}
                                                value={formData.results}
                                                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                placeholder="98% uptime improvement, 3x faster reporting, 42% lower manual workload"
                                            />
                                        </div>

                                        {/* Directives */}
                                        <div className="flex flex-wrap items-center gap-8 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                                    formData.featured ? "bg-purple-600 border-purple-600 shadow-md" : "bg-white border-slate-300 group-hover:border-purple-300"
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.featured}
                                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                        className="hidden"
                                                    />
                                                    {formData.featured && <Zap className="w-3.5 h-3.5 text-white fill-current" />}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-700">Premium Spotlight</span>
                                            </label>
                                            
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                                    formData.published ? "bg-orange-600 border-orange-600 shadow-md" : "bg-white border-slate-300 group-hover:border-orange-300"
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.published}
                                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                                        className="hidden"
                                                    />
                                                    {formData.published && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-700">Live Status</span>
                                            </label>
                                        </div>

                                        {submitError && (
                                            <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-6 py-4 text-xs font-bold text-red-600">
                                                {submitError}
                                            </div>
                                        )}
                                    </form>
                                </div>

                                <div className="p-5 sm:p-6 md:px-12 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-500 transition-all active:scale-95"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        form="project-form"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-w-[200px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Transmitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Deploy Blueprint</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
