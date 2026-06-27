"use client";

import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle,
    X,
    User,
    Loader2,
    Calendar,
    Tag,
    ChevronLeft,
    ChevronRight,
    FileText,
    Eye,
    Globe,
    Zap,
    LayoutGrid,
    ChevronDown,
    Layers,
    Clock,
    Sparkles,
    UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Post {
    id: string;
    title: string;
    category: string;
    published: boolean;
    author: {
        name: string;
    };
    authorId: string;
    content: string;
    excerpt: string;
    readTime: number;
    createdAt: string;
    heroImage?: string;
}

interface TeamMember {
    id: string;
    name: string;
}

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [authors, setAuthors] = useState<TeamMember[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAuthors = async () => {
        try {
            const response = await api.get("/team");
            setAuthors(response.data || []);
        } catch {
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get("/blog/admin", {
                params: { page, limit: 10 }
            });
            setPosts(response.data.posts || []);
            setTotalPages(response.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.put(`/blog/${id}`, { published: true });
            setPosts(prev => prev.map(p => p.id === id ? { ...p, published: true } : p));
        } catch {
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/blog/${deletingId}`);
            fetchPosts();
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchAuthors();
    }, [page]);

    const filteredPosts = useMemo(() => {
        return posts.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [posts, searchQuery]);

    return (
        <div className="space-y-8 pb-24">
            {/* Header / Command Center */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-orange-500" />
                        Content Repository
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Curate industrial insights and high-performance engineering narratives.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Scan articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full sm:w-64 shadow-sm font-medium"
                        />
                    </div>
                    
                    <button
                        onClick={() => { setEditingPost(null); setShowPostModal(true); }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
                        <span>Create Insight</span>
                    </button>
                </div>
            </motion.header>

            {/* Datagrid Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden"
            >
                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4 bg-slate-50/40">
                    {loading ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Fetching Intel...</p>
                            </div>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <Layers className="w-16 h-16 text-slate-300" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No matching insights recorded</p>
                            </div>
                        </div>
                    ) : (
                        filteredPosts.map((post, index) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm space-y-4"
                            >
                                <div className="flex gap-4">
                                    {post.heroImage && (
                                        <div className="relative w-16 aspect-video overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                                            <img src={post.heroImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <h3 className="font-bold text-slate-900 truncate">{post.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <User className="w-2.5 h-2.5 text-slate-400" />
                                            </div>
                                            <span className="text-[9px] text-slate-505 font-bold uppercase tracking-wider truncate">{post.author?.name || "Jantra Intelligence"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">
                                        · {post.readTime} min read
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => !post.published && handlePublish(post.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-[8px] font-black uppercase tracking-widest",
                                            post.published 
                                                ? "bg-orange-50 text-orange-600 border-orange-100" 
                                                : "bg-slate-50 text-slate-400 border-slate-100 hover:text-orange-600 hover:border-orange-100"
                                        )}
                                    >
                                        {post.published ? <Globe className="w-3 h-3 animate-pulse" /> : <Clock className="w-3 h-3" />}
                                        {post.published ? 'Live' : 'Draft'}
                                    </button>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setEditingPost(post); setShowPostModal(true); }}
                                            className="p-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(post.id)}
                                            className="p-2 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Article Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Taxonomy</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Temporal Data</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Environment</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Fetching Intel...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Layers className="w-16 h-16 text-slate-300" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">No matching insights recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post, index) => (
                                    <motion.tr 
                                        key={post.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-orange-50/20 transition-colors group"
                                    >
                                        <td className="px-8 py-5 max-w-sm">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">{post.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <User className="w-2.5 h-2.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{post.author?.name || "Jantra Intelligence"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center">
                                                <span className="text-[10px] bg-white border-2 border-slate-100 text-slate-500 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest group-hover:border-orange-200 group-hover:text-orange-600 transition-all">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                                <span className="text-[9px] text-slate-300 font-black tracking-[0.2em]">{post.readTime}M READ</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => !post.published && handlePublish(post.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest",
                                                        post.published 
                                                            ? "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100" 
                                                            : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100"
                                                    )}
                                                >
                                                    {post.published ? <Globe className="w-3.5 h-3.5 animate-pulse" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {post.published ? 'Live Node' : 'In Review'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button 
                                                    onClick={() => { setEditingPost(post); setShowPostModal(true); }}
                                                    className="p-3 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-90 group/btn"
                                                >
                                                    <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(post.id)}
                                                    className="p-3 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-2xl transition-all shadow-sm active:scale-90 group/btn"
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

                {/* Pagination Controls */}
                <div className="px-12 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Cluster <span className="text-slate-900">{page}</span> / {totalPages}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 disabled:opacity-50 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-1 text-slate-100 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                                className="h-full bg-orange-500" 
                                initial={{ width: "0%" }}
                                animate={{ width: `${(page / totalPages) * 100}%` }}
                             />
                        </div>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 disabled:opacity-50 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Premium Modals */}
            <AnimatePresence>
                {showPostModal && (
                    <BlogPostModal
                        post={editingPost}
                        authors={authors}
                        onClose={() => setShowPostModal(false)}
                        onSuccess={() => { fetchPosts(); setShowPostModal(false); }}
                    />
                )}

                {deletingId && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeletingId(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform hover:rotate-0">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Decommission Insight?</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-10">
                                This will permanently remove the article from the production network. This operation is irreversible.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
                                >
                                    Confirm Wipe
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BlogPostModal({ post, authors, onClose, onSuccess }: {
    post: Post | null,
    authors: TeamMember[],
    onClose: () => void,
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState({
        title: post?.title || "",
        category: post?.category || "Technology",
        authorId: post?.authorId || authors[0]?.id || "",
        excerpt: post?.excerpt || "",
        content: post?.content || "",
        readTime: post?.readTime || 5,
        published: post?.published ?? false,
        heroImage: post?.heroImage || ""
    });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const data = new FormData();
        data.append("image", file);

        try {
            const response = await api.post("/upload/image", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, heroImage: response.data.url }));
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.authorId) {
            alert("Security Protocol: Author identification required. Please assign an engineer.");
            return;
        }
        setLoading(true);
        setSubmitError("");

        const payload = {
            title: formData.title,
            category: formData.category,
            authorId: formData.authorId,
            excerpt: formData.excerpt,
            content: formData.content,
            readTime: formData.readTime,
            published: formData.published,
            heroImage: formData.heroImage ? formData.heroImage : undefined
        };

        try {
            if (post) {
                await api.put(`/blog/${post.id}`, payload);
            } else {
                await api.post("/blog", payload);
            }
            onSuccess();
        } catch (error: any) {
            console.error("Failed to save post:", error);
            const fieldErrors = error?.response?.data?.errors;
            const message = fieldErrors
                ? Object.values(fieldErrors).flat().filter(Boolean).join(" ")
                : "";
            setSubmitError(message || error?.response?.data?.error || "Unable to save blog post configuration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
                {/* Side Context */}
                <div className="hidden md:flex md:w-1/4 bg-slate-900 p-12 flex-col justify-between text-white shrink-0">
                    <div className="space-y-8">
                        <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight leading-tight">
                                {post ? "Refining Corporate Intel" : "Architecting New Insight"}
                            </h3>
                            <p className="text-slate-400 text-xs mt-6 font-bold leading-relaxed tracking-widest uppercase opacity-60">Insight Module v2.0</p>
                        </div>

                        <div className="pt-10 space-y-5">
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Markdown Capable
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Real-time Cache
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Global Node Link
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase">SYSTEM.LOG_UP</div>
                </div>

                {/* Main Form Area */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-100 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Content Configuration</span>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 md:p-12">
                        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2">Article Headline</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-6 text-xl font-black text-slate-800 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all placeholder:text-slate-200"
                                    placeholder="Enter Compelling Headline..."
                                />
                            </div>

                            {/* Hero Image Section */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2 block">Hero Image</label>
                                <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-square md:aspect-video rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center group flex-shrink-0">
                                        {formData.heroImage ? (
                                            <>
                                                <img src={formData.heroImage} alt="Hero" className="object-cover w-full h-full" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, heroImage: "" })}
                                                        className="bg-red-500 text-white p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">No Image Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center space-y-4">
                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                            Select a high-resolution hero image (JPG/PNG). This image represents the article in the insights grid.
                                        </p>
                                        <label className={cn(
                                            "cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all border-2 shadow-sm w-full sm:w-fit active:scale-95",
                                            uploadingImage 
                                                ? "bg-slate-50 text-slate-300 border-slate-100 pointer-events-none" 
                                                : "bg-white border-slate-100 hover:border-orange-500 hover:text-orange-600 hover:shadow-orange-500/10"
                                        )}>
                                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5 text-orange-500" />}
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-800">{uploadingImage ? 'TRANSMITTING...' : 'UPLOAD IMAGE'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2 text-center block">Category Cluster</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                                        >
                                            <option>Technology</option>
                                            <option>Data Science</option>
                                            <option>AI & Machine Learning</option>
                                            <option>Business</option>
                                            <option>Engineering</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2 text-center block">Lead Author</label>
                                    <select
                                        required
                                        value={formData.authorId}
                                        onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                                        className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-orange-500 transition-all"
                                    >
                                        <option value="" disabled>IDENTIFY AUTHOR</option>
                                        {authors.map(author => (
                                            <option key={author.id} value={author.id}>{author.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2 text-center block">Time Optimization</label>
                                    <div className="relative">
                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="number" required min={1}
                                            value={formData.readTime}
                                            onChange={e => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-slate-600 focus:outline-none focus:border-orange-500"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-widest">MINUTES</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-2">Article Abstract (Hook)</label>
                                <textarea
                                    required rows={3}
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all resize-none leading-relaxed text-slate-600"
                                    placeholder="Synthesize the core message..."
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Research Body (Markdown)</label>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Sparkles className="w-3 h-3 text-orange-500" /> Rich formatting active
                                    </div>
                                </div>
                                <textarea
                                    required rows={12}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-8 text-sm font-mono leading-loose text-slate-700 focus:outline-none focus:border-orange-500 transition-all custom-scrollbar"
                                    placeholder="# START TYPING ARCHITECTURE..."
                                />
                            </div>

                            {/* Switches */}
                            <div className="flex items-center gap-6 bg-slate-50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100 group/status">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, published: !formData.published })}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                        formData.published ? "bg-orange-600 border-orange-600 shadow-lg shadow-orange-500/20" : "bg-white border-slate-200"
                                    )}
                                >
                                    <Globe className={cn("w-6 h-6", formData.published ? "text-white animate-pulse" : "text-slate-300")} />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Public Environment Broadcast</span>
                                    <span className="text-[9px] font-bold text-slate-400 mt-1">{formData.published ? 'ACTIVE SIGNAL' : 'OFFLINE DRAFT'}</span>
                                </div>
                            </div>

                            {submitError && (
                                <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-6 py-4 text-xs font-bold text-red-600">
                                    {submitError}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="p-5 sm:p-8 md:px-12 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-5 shrink-0">
                        <button 
                            type="button" onClick={onClose} 
                            className="w-full sm:w-auto px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all text-center"
                        >
                            Abort
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 disabled:opacity-50 min-w-0 sm:min-w-[200px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>{loading ? "Transmitting..." : post ? "Update Core" : "Launch Insight"}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
