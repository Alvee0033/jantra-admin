"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Search,
    Filter,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Mail,
    Calendar,
    MessageSquare,
    Trash2,
    X,
    Eye,
    ArrowUpRight,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Lead {
    id: string;
    name: string;
    email: string;
    company?: string;
    country?: string;
    service: string;
    budget?: string;
    phone?: string;
    description: string;
    status: string;
    createdAt: string;
    referral?: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await api.get("/leads/admin", {
                params: { page, limit: 10, search, status }
            });
            setLeads(response.data.leads || []);
            setTotalPages(response.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, status]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLeads();
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/leads/admin/${id}`, { status: newStatus });
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === id) {
                setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error: any) {
            console.error("Failed to update status:", error);
            alert(error?.response?.data?.error || error?.response?.data?.message || "Failed to update status");
        }
    };

    const deleteLead = async (leadId: string) => {
        if (!confirm('Archive this signal permanently?')) return;
        try {
            await api.delete(`/leads/admin/${leadId}`);
            setLeads(leads.filter(lead => lead.id !== leadId));
            if (selectedLead?.id === leadId) setSelectedLead(null);
        } catch (error: any) {
            console.error("Failed to delete lead:", error);
            alert(error?.response?.data?.error || error?.response?.data?.message || "Failed to delete lead");
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <motion.header 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-1 bg-orange-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Leads Management</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-none">
                        Lead<br/>Signals
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative group flex-1 sm:flex-initial">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-slate-200/80 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-orange-300 w-full sm:w-64 transition-all shadow-sm font-medium"
                        />
                    </form>
                    <div className="relative group flex-1 sm:flex-initial">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-white border border-slate-200/80 rounded-[1.5rem] pl-12 pr-10 py-4 text-sm focus:ring-2 focus:ring-orange-300 appearance-none cursor-pointer shadow-sm font-bold text-slate-700 w-full sm:w-48"
                        >
                            <option value="">All Statuses</option>
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="PROPOSAL">Proposal</option>
                            <option value="CLOSED_WON">Won</option>
                            <option value="CLOSED_LOST">Lost</option>
                        </select>
                    </div>
                </div>
            </motion.header>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 rounded-[2.5rem] sm:rounded-[3rem]"
            >
                <div className="md:hidden p-4 space-y-4 bg-slate-50/30">
                    {loading && !leads.length ? (
                        <div className="px-6 py-20 text-center">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto shadow-xl" />
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <Target className="w-12 h-12 text-slate-150 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leads found</p>
                        </div>
                    ) : (
                        leads.map((lead, i) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelectedLead(lead)}
                                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4 cursor-pointer hover:border-orange-200 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md group-hover:bg-orange-500 transition-colors">
                                        {lead.name[0]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-extrabold text-slate-900 truncate text-base">{lead.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" /> {lead.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center gap-3">
                                    <div>
                                        <p className="font-black text-slate-800 tracking-tight text-xs">{lead.service}</p>
                                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">{lead.budget || 'UNDISCLOSED'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2.5">
                                        <span className={cn(
                                            "text-[9px] font-black px-3.5 py-2 rounded-full border shadow-sm flex items-center gap-1.5",
                                            lead.status === 'NEW' ? 'bg-orange-500/5 text-orange-600 border-orange-200' :
                                                lead.status === 'CONTACTED' ? 'bg-sky-500/5 text-sky-600 border-sky-200' :
                                                    lead.status === 'QUALIFIED' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-200' :
                                                        lead.status === 'PROPOSAL' ? 'bg-purple-500/5 text-purple-600 border-purple-200' :
                                                            lead.status === 'CLOSED_WON' ? 'bg-emerald-600/5 text-emerald-700 border-emerald-300' :
                                                                'bg-rose-500/5 text-rose-600 border-rose-200'
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", 
                                                lead.status === 'NEW' ? 'bg-orange-500 animate-pulse' :
                                                lead.status === 'CONTACTED' ? 'bg-sky-500' :
                                                lead.status === 'QUALIFIED' ? 'bg-emerald-500' :
                                                lead.status === 'PROPOSAL' ? 'bg-purple-500' :
                                                lead.status === 'CLOSED_WON' ? 'bg-emerald-600' : 'bg-rose-500'
                                            )} />
                                            {lead.status}
                                        </span>
                                        <div className="relative">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                            />
                                            <div className="px-3.5 py-2 rounded-full border border-slate-200 text-slate-500 text-[9px] font-bold bg-white hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1">
                                                Update
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedLead(lead)}
                                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-500 active:scale-95 transition-all shadow-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteLead(lead.id)}
                                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 active:scale-95 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/[0.02] border-b border-slate-100">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Contact Info</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Service</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Date Received</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 italic-none">
                            {loading && !leads.length ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto shadow-xl" />
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <Target className="w-12 h-12 text-slate-150 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead, i) => (
                                    <motion.tr 
                                        key={lead.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer" 
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:bg-orange-500 transition-colors">
                                                    {lead.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 text-lg tracking-tight">{lead.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 group-hover:text-slate-600 transition-colors">
                                                        <Mail className="w-3 h-3 text-orange-500" /> {lead.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-sm">
                                            <p className="font-black text-slate-800 tracking-tight">{lead.service}</p>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">{lead.budget || 'UNDISCLOSED'}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative group/status flex items-center gap-2">
                                                <div className={cn(
                                                    "text-[9px] font-black px-4 py-2 rounded-full border shadow-sm transition-all flex items-center gap-1.5",
                                                    lead.status === 'NEW' ? 'bg-orange-500/5 text-orange-600 border-orange-200' :
                                                        lead.status === 'CONTACTED' ? 'bg-sky-500/5 text-sky-600 border-sky-200' :
                                                            lead.status === 'QUALIFIED' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-200' :
                                                                lead.status === 'PROPOSAL' ? 'bg-purple-500/5 text-purple-600 border-purple-200' :
                                                                    lead.status === 'CLOSED_WON' ? 'bg-emerald-600/5 text-emerald-700 border-emerald-300' :
                                                                        'bg-rose-500/5 text-rose-600 border-rose-200'
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", 
                                                        lead.status === 'NEW' ? 'bg-orange-500 animate-pulse' :
                                                        lead.status === 'CONTACTED' ? 'bg-sky-500' :
                                                        lead.status === 'QUALIFIED' ? 'bg-emerald-500' :
                                                        lead.status === 'PROPOSAL' ? 'bg-purple-500' :
                                                        lead.status === 'CLOSED_WON' ? 'bg-emerald-600' : 'bg-rose-500'
                                                    )} />
                                                    {lead.status}
                                                </div>
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all text-[8px] bg-white cursor-pointer shadow-sm"
                                                >
                                                    <option value="NEW">NEW</option>
                                                    <option value="CONTACTED">CONTACTED</option>
                                                    <option value="QUALIFIED">QUALIFIED</option>
                                                    <option value="PROPOSAL">PROPOSAL</option>
                                                    <option value="CLOSED_WON">WON</option>
                                                    <option value="CLOSED_LOST">LOST</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-orange-500 hover:shadow-lg transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteLead(lead.id);
                                                    }}
                                                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:shadow-lg transition-all"
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

                <div className="px-10 py-8 bg-slate-900/[0.02] flex items-center justify-between border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Page <span className="text-slate-900">{page}</span> // Total Pages <span className="text-slate-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="p-3 rounded-2xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="p-3 rounded-2xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedLead && (
                    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl bg-white rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-80 bg-slate-950 p-6 sm:p-10 text-white shrink-0 relative flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Target className="w-32 h-32 rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-orange-500 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-2xl mb-6 sm:mb-8">
                                        {selectedLead.name[0]}
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none mb-3">{selectedLead.name}</h3>
                                    <div className="flex items-center gap-2 mb-6 sm:mb-8">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Live Connection</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Referral</p>
                                            <p className="text-xs font-bold text-slate-300 italic opacity-80">{selectedLead.referral || 'Direct Infrastructure'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Information</p>
                                            <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-orange-500" /> {selectedLead.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-3 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white md:hidden">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 p-5 sm:p-8 md:p-12 overflow-y-auto custom-scrollbar bg-slate-50/50 flex flex-col">
                                <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lead Details</h4>
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} className="p-3 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-900 hidden md:block">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-10 shrink-0">
                                    <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Company</p>
                                        <p className="text-base font-black text-slate-900 tracking-tight leading-none truncate">{selectedLead.company || 'Personal Node'}</p>
                                    </div>
                                    <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Country</p>
                                        <p className="text-base font-black text-slate-900 tracking-tight leading-none truncate">{selectedLead.country || 'Global Grid'}</p>
                                    </div>
                                    <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Budget</p>
                                        <p className="text-base font-black text-orange-600 tracking-tight leading-none">{selectedLead.budget || 'Undetermined'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 sm:space-y-8 flex-1">
                                    <div className="flex flex-col h-full min-h-[250px] sm:min-h-[300px]">
                                        <div className="flex items-center gap-3 mb-4 shrink-0">
                                            <MessageSquare className="w-4 h-4 text-orange-500" />
                                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Message</h3>
                                        </div>
                                        <div className="p-5 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-white border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap shadow-inner-xl flex-1 font-medium opacity-90 overflow-y-auto custom-scrollbar border-dashed">
                                            {selectedLead.description}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200 shrink-0">
                                        <div className="text-center sm:text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                                {new Date(selectedLead.createdAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <button
                                                onClick={() => deleteLead(selectedLead.id)}
                                                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            >
                                                Archive
                                            </button>
                                            <a
                                                href={`mailto:${selectedLead.email}`}
                                                className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-slate-950 text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl flex items-center justify-center gap-2 group"
                                            >
                                                Respond <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

