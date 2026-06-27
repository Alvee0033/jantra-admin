"use client";

import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import axios from "axios";
import {
    Plus,
    Edit3,
    Trash2,
    X,
    User,
    Loader2,
    Link2,
    Globe,
    Sparkles,
    Shield,
    Users,
    Search,
    Camera,
    MoveUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    department?: string;
    teamId?: string | null;
    workEmail?: string | null;
    employeeActive?: boolean;
    bio: string;
    avatar?: string;
    linkedIn?: string;
    twitter?: string;
    order: number;
    published: boolean;
    reportStats?: {
        reportCount: number;
        approvedCount: number;
        latestStatus: string;
        latestSubmittedAt?: string | null;
    };
    latestReport?: {
        id: string;
        title: string;
        periodType: string;
        status: string;
        blockers?: string;
        submittedAt?: string | null;
    } | null;
}

export default function TeamManagementPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const response = await api.get("/reports/team-overview");
            setTeam(response.data.team || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/team/${deletingId}`);
            fetchTeam();
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTeam = useMemo(() => {
        return team.filter(m => 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.department || "").toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.order - b.order);
    }, [team, searchQuery]);

    return (
        <div className="space-y-8 pb-24">
            {/* Command Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-orange-500" />
                        Team Members
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Managing the senior team members and management.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full sm:w-64 shadow-sm font-medium"
                        />
                    </div>
                    
                    <button
                        onClick={() => { setEditingMember(null); setShowModal(true); }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
                        <span>Add Team Member</span>
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
                                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Scanning Biosignatures...</p>
                            </div>
                        </div>
                    ) : filteredTeam.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <Users className="w-16 h-16 text-slate-300" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No team members identified</p>
                            </div>
                        </div>
                    ) : (
                        filteredTeam.map((member, index) => (
                            <motion.div 
                                key={member.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <div className="absolute inset-0 bg-orange-500/10 rounded-2xl rotate-6" />
                                        <div className="relative w-full h-full rounded-2xl bg-white border-2 border-slate-100 overflow-hidden">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                    <User className="w-6 h-6 text-slate-200" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-slate-900 truncate">{member.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Member #{member.order.toString().padStart(3, '0')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex text-[9px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">
                                            {member.role}
                                        </span>
                                        <span className="text-[9px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-orange-100">
                                            {member.department || "Operations"}
                                        </span>
                                        {member.teamId && (
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-slate-200">
                                                {member.teamId}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.linkedIn && (
                                            <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-slate-150 rounded-lg text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-sm">
                                                <Link2 className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        {member.twitter && (
                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-slate-150 rounded-lg text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                <Globe className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[1.25rem] bg-slate-50 border border-slate-100 p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            member.latestReport?.status === "APPROVED" && "bg-orange-50 text-orange-700 border-orange-100",
                                            member.latestReport?.status === "SUBMITTED" && "bg-orange-50 text-orange-700 border-orange-100",
                                            member.latestReport?.status === "NEEDS_REVISION" && "bg-red-50 text-red-700 border-red-100",
                                            !member.latestReport && "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            {member.latestReport?.status?.replace("_", " ") || "No Reports"}
                                        </span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.reportStats?.reportCount || 0} Reports</span>
                                    </div>
                                    {member.latestReport?.title && (
                                        <p className="text-xs font-semibold text-slate-600 line-clamp-1 leading-relaxed">
                                            {member.latestReport.title}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button 
                                        onClick={() => { setEditingMember(member); setShowModal(true); }}
                                        className="p-2.5 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeletingId(member.id)}
                                        className="p-2.5 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Positioning</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">WorkStream</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Scanning Biosignatures...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTeam.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Users className="w-16 h-16 text-slate-300" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">No team members identified</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTeam.map((member, index) => (
                                    <motion.tr 
                                        key={member.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-orange-50/20 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-16 h-16 shrink-0">
                                                    <div className="absolute inset-0 bg-orange-500/10 rounded-2xl rotate-6 group-hover:rotate-0 transition-transform" />
                                                    <div className="relative w-full h-full rounded-2xl bg-white border-2 border-slate-100 overflow-hidden group-hover:border-orange-200 transition-colors">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                                <User className="w-6 h-6 text-slate-200" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{member.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Member #{member.order.toString().padStart(3, '0')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <span className="inline-flex text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-slate-200">
                                                    {member.role}
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[9px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                                                        {member.department || "Operations"}
                                                    </span>
                                                    {member.teamId && (
                                                        <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                                                            {member.teamId}
                                                        </span>
                                                    )}
                                                </div>
                                                 <div className="flex items-center gap-3">
                                                    {member.linkedIn && (
                                                        <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-slate-100 rounded-lg text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-sm">
                                                            <Link2 className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    {member.twitter && (
                                                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                            <Globe className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center">
                                                <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 px-4 py-3 min-w-[220px]">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                            member.latestReport?.status === "APPROVED" && "bg-orange-50 text-orange-700",
                                                            member.latestReport?.status === "SUBMITTED" && "bg-orange-50 text-orange-700",
                                                            member.latestReport?.status === "NEEDS_REVISION" && "bg-red-50 text-red-700",
                                                            !member.latestReport && "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {member.latestReport?.status?.replace("_", " ") || "No Reports"}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {member.reportStats?.reportCount || 0} Total
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-xs font-semibold text-slate-700 line-clamp-2">
                                                        {member.latestReport?.title || "No report activity recorded yet."}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => { setEditingMember(member); setShowModal(true); }}
                                                    className="p-3 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-90"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(member.id)}
                                                    className="p-3 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-2xl transition-all shadow-sm active:scale-90"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Premium Modals */}
            <AnimatePresence>
                {showModal && (
                    <TeamMemberModal
                        member={editingMember}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => { fetchTeam(); setShowModal(false); }}
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
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 border border-white/20 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Delete Member?</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-10">
                                This will remove the architect from the public interface. Biosignature records will remain in the secure archive.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TeamMemberModal({ member, onClose, onSuccess }: { member: TeamMember | null, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: member?.name || "",
        role: member?.role || "",
        department: member?.department || "Operations",
        teamId: member?.teamId || "",
        workEmail: member?.workEmail || "",
        employeePassword: "",
        employeeActive: member?.employeeActive ?? true,
        bio: member?.bio || "",
        avatar: member?.avatar || "",
        linkedIn: member?.linkedIn || "",
        twitter: member?.twitter || "",
        order: member?.order || 0,
        published: member?.published ?? true
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("image", file);

        try {
            const response = await api.post("/upload/image", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, avatar: response.data.url }));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError("");
        try {
            if (member) await api.put(`/team/${member.id}`, formData);
            else await api.post("/team", formData);
            onSuccess();
        } catch (error: any) {
            const fieldErrors = error?.response?.data?.errors;
            const message = fieldErrors
                ? Object.values(fieldErrors).flat().filter(Boolean).join(" ")
                : "";
            setSubmitError(message || "Unable to save employee.");
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
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
                {/* Visual Context Panel */}
                <div className="hidden md:flex md:w-1/3 bg-slate-950 p-12 flex-col justify-between text-white shrink-0">
                    <div className="space-y-12">
                        <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Member Profile</span>
                        </div>
                        
                        <div>
                            <h3 className="text-4xl font-black tracking-tight leading-tight mb-4">
                                {member ? "Edit Team Member" : "Add New Team Member"}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic opacity-60">
                                Engineering the human element of industrial excellence.
                            </p>
                        </div>

                        {/* Order Indicator */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Display Order</span>
                                <span className="text-2xl font-black text-orange-500">#{formData.order.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase">Status: Connected</span>
                    </div>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-100 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Team Member Details</span>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                            {/* Avatar Upload Core */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block text-center md:text-left">Profile Picture</label>
                                <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 group">
                                    <div className="relative w-32 h-32 shrink-0">
                                        <div className="absolute inset-0 bg-orange-500/10 rounded-[2rem] scale-110 rotate-6 group-hover:rotate-0 transition-transform" />
                                        <div className="relative w-full h-full rounded-[2rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                            {formData.avatar ? (
                                                <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <User className="w-10 h-10 text-slate-200" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload Photo</h4>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">JPG/PNG encoded data limited to 2MB. Recommendation: Transparent PNG or Corporate Backdrop.</p>
                                        <label className="inline-flex items-center gap-3 bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all cursor-pointer shadow-lg active:scale-95">
                                            <Camera className="w-4 h-4" />
                                            Select Asset
                                            <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Full Identity</label>
                                    <input 
                                        required value={formData.name} 
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="Full Legal Name"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Corporate Role</label>
                                    <input 
                                        required value={formData.role} 
                                        onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="Lead Systems Designer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Department</label>
                                    <input
                                        required value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="Operations"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Team ID</label>
                                    <input
                                        value={formData.teamId}
                                        onChange={e => setFormData({ ...formData, teamId: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="alpha-core"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Employee Login Email</label>
                                    <input
                                        type="email"
                                        value={formData.workEmail}
                                        onChange={e => setFormData({ ...formData, workEmail: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="employee@jantra.com"
                                    />
                                    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Set this if the team member should log in at `/report`.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">{member ? "Reset Employee Password" : "Employee Password"}</label>
                                    <input
                                        type="password"
                                        value={formData.employeePassword}
                                        onChange={e => setFormData({ ...formData, employeePassword: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder={member ? "Leave blank to keep current password" : "Minimum 6 characters"}
                                    />
                                    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Required the first time you enable employee login.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Biography (Bio)</label>
                                <textarea
                                    required rows={4} 
                                    value={formData.bio} 
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium leading-relaxed text-slate-600 focus:outline-none focus:border-orange-500 transition-all resize-none"
                                    placeholder="Describe their strategic impact..."
                                />
                            </div>

                            {submitError && (
                                <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                                    {submitError}
                                </div>
                            )}

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 lg:text-center block">LinkedIn Link</label>
                                    <div className="relative">
                                        <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0077b5]" />
                                        <input 
                                            value={formData.linkedIn} 
                                            onChange={e => setFormData({ ...formData, linkedIn: e.target.value })} 
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-4 py-4 text-[10px] font-bold focus:outline-none focus:border-orange-500 transition-all"
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 lg:text-center block">X (Twitter)</label>
                                    <div className="relative">
                                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900" />
                                        <input 
                                            value={formData.twitter} 
                                            onChange={e => setFormData({ ...formData, twitter: e.target.value })} 
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-4 py-4 text-[10px] font-bold focus:outline-none focus:border-orange-500 transition-all"
                                            placeholder="https://x.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 lg:text-center block">Display Order</label>
                                    <input 
                                        type="number" 
                                        value={formData.order} 
                                        onChange={e => setFormData({ ...formData, order: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })} 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 transition-all text-center"
                                    />
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center gap-6 bg-slate-50 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 group/status">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, published: !formData.published })}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                        formData.published ? "bg-orange-500 border-orange-500 shadow-xl shadow-orange-500/20" : "bg-white border-slate-200"
                                    )}
                                >
                                    <MoveUpRight className={cn("w-6 h-6", formData.published ? "text-white" : "text-slate-300")} />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Broadcast Profile to Network</span>
                                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formData.published ? 'Active Deployment' : 'Restricted Draft'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-50 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 group/status">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, employeeActive: !formData.employeeActive })}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                        formData.employeeActive ? "bg-orange-500 border-orange-500 shadow-xl shadow-orange-500/20" : "bg-white border-slate-200"
                                    )}
                                >
                                    <Shield className={cn("w-6 h-6", formData.employeeActive ? "text-white" : "text-slate-300")} />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Employee Report Access</span>
                                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formData.employeeActive ? 'Enabled For Login' : 'Access Disabled'}</span>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-5 sm:p-8 md:px-12 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-5 shrink-0">
                        <button 
                            type="button" onClick={onClose} 
                            className="w-full sm:w-auto px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all text-center"
                        >
                            Abort Process
                        </button>
                        <button
                            disabled={loading || uploading}
                            onClick={handleSubmit}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 disabled:opacity-50 min-w-0 sm:min-w-[220px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            <span>{loading ? "Synchronizing..." : member ? "Update Node" : "Confirm Onboarding"}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
