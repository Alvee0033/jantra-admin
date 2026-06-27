"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    Calendar,
    Edit3,
    Trash2,
    X,
    Loader2,
    Info,
    ArrowUpDown,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

interface TransactionRecord {
    id: string;
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    reference: string | null;
    note: string | null;
    date: string;
    createdAt: string;
}

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

const CATEGORIES = [
    "Project Payment",
    "Client Retainer",
    "Ad Revenue",
    "Consulting",
    "Hosting/Servers",
    "Software Subscriptions",
    "Salaries/Payouts",
    "Marketing/Ads",
    "Office Expenses",
    "Other"
];

export default function FundManagementPage() {
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [chartData, setChartData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Summary statistics state
    const [stats, setStats] = useState({
        overall: { income: 0, expense: 0, balance: 0 },
        filtered: { income: 0, expense: 0, balance: 0 }
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "INCOME" as "INCOME" | "EXPENSE",
        category: CATEGORIES[0],
        reference: "",
        note: "",
        date: new Date().toISOString().split("T")[0]
    });
    const [modalSubmitting, setModalSubmitting] = useState(false);

    // Load transactions with active filters
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                limit: 20
            };

            if (selectedType !== "ALL") params.type = selectedType;
            if (selectedCategory !== "ALL") params.category = selectedCategory;
            if (searchTerm) params.search = searchTerm;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get("/finance", { params });
            if (response.data?.success) {
                setTransactions(response.data.data || []);
                setTotalRecords(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
                setStats(response.data.stats || {
                    overall: { income: 0, expense: 0, balance: 0 },
                    filtered: { income: 0, expense: 0, balance: 0 }
                });
            }
        } catch (error: any) {
            console.error("Failed to load transactions:", error);
            setErrorMsg("Failed to retrieve financial ledger.");
        } finally {
            setLoading(false);
        }
    };

    // Load monthly aggregation chart data
    const fetchChartData = async () => {
        setChartLoading(true);
        try {
            const response = await api.get("/finance/charts");
            if (response.data?.success) {
                setChartData(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to load chart metrics:", error);
        } finally {
            setChartLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, selectedType, selectedCategory, startDate, endDate]);

    useEffect(() => {
        fetchChartData();
    }, []);

    // Handle search input with debounce or trigger
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchTransactions();
    };

    // Open Modal for Create
    const handleAddClick = () => {
        setEditingTransaction(null);
        setFormData({
            title: "",
            amount: "",
            type: "INCOME",
            category: CATEGORIES[0],
            reference: "",
            note: "",
            date: new Date().toISOString().split("T")[0]
        });
        setSubmitError("");
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleEditClick = (tx: TransactionRecord) => {
        setEditingTransaction(tx);
        setFormData({
            title: tx.title,
            amount: tx.amount.toString(),
            type: tx.type,
            category: tx.category,
            reference: tx.reference || "",
            note: tx.note || "",
            date: new Date(tx.date).toISOString().split("T")[0]
        });
        setSubmitError("");
        setShowModal(true);
    };

    // Delete transaction handler
    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/finance/${deletingId}`);
            fetchTransactions();
            fetchChartData();
        } catch (error) {
            console.error("Failed to delete record:", error);
            setErrorMsg("Failed to delete financial record.");
        } finally {
            setDeletingId(null);
        }
    };

    // Form submission error
    const [submitError, setSubmitError] = useState("");

    // Submit form (create/update)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalSubmitting(true);
        setSubmitError("");

        const payload = {
            title: formData.title,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            reference: formData.reference || null,
            note: formData.note || null,
            date: new Date(formData.date).toISOString()
        };

        if (isNaN(payload.amount) || payload.amount <= 0) {
            setSubmitError("Amount must be a positive number.");
            setModalSubmitting(false);
            return;
        }

        try {
            if (editingTransaction) {
                await api.put(`/finance/${editingTransaction.id}`, payload);
            } else {
                await api.post("/finance", payload);
            }
            fetchTransactions();
            fetchChartData();
            setShowModal(false);
        } catch (error: any) {
            console.error("Failed to save transaction:", error);
            setSubmitError(error.response?.data?.error || "Error saving record.");
        } finally {
            setModalSubmitting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedType("ALL");
        setSelectedCategory("ALL");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header segment */}
            <motion.section 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-md"
            >
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5" /> Ledger System
                        </span>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
                            Fund Management<span className="text-orange-500">.</span>
                        </h2>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Monitor enterprise cash inflows, expense outflows, profit margins, and reference indexes.
                        </p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-xs group shrink-0"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Fund Entry</span>
                    </button>
                </div>
            </motion.section>

            {/* Error messaging */}
            {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold uppercase tracking-wide text-red-600 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="relative group overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Total Inflow</span>
                        <p className="text-2xl font-black text-slate-900">${stats.overall.income.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Total Outflow</span>
                        <p className="text-2xl font-black text-slate-900">${stats.overall.expense.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Net Balance</span>
                        <p className={cn(
                            "text-2xl font-black",
                            stats.overall.balance >= 0 ? "text-slate-900" : "text-rose-600"
                        )}>${stats.overall.balance.toLocaleString()}</p>
                    </div>
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center",
                        stats.overall.balance >= 0 ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                    )}>
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-6">Cash Flow Trends (Last 6 Months)</span>
                <div className="h-72 w-full">
                    {chartLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    labelStyle={{ textTransform: "uppercase", fontSize: "9px", fontWeight: "900", color: "#64748b" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }} />
                                <Bar dataKey="income" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No ledger entries found to generate trends.
                        </div>
                    )}
                </div>
            </div>

            {/* Filter and Table Section */}
            <div className="rounded-3xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md overflow-hidden">
                
                {/* Search & Filter Controls */}
                <div className="p-6 border-b border-slate-200/50 space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search ledger (Name, reference, notes)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-800 placeholder-slate-450 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-2xl px-3 py-2 shrink-0">
                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-455" />
                                <select 
                                    value={selectedType}
                                    onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 outline-none border-none cursor-pointer"
                                >
                                    <option value="ALL">All Flows</option>
                                    <option value="INCOME">Inflow</option>
                                    <option value="EXPENSE">Outflow</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-2xl px-3 py-2 shrink-0">
                                <Filter className="w-3.5 h-3.5 text-slate-455" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 outline-none border-none cursor-pointer"
                                >
                                    <option value="ALL">All Categories</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-2xl px-3 py-2 shrink-0 text-slate-700">
                                <Calendar className="w-3.5 h-3.5 text-slate-455" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[9px] font-bold outline-none border-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[9px] font-bold outline-none border-none"
                                />
                            </div>

                            {(searchTerm || selectedType !== "ALL" || selectedCategory !== "ALL" || startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-[10px] font-black uppercase tracking-wider text-orange-600 hover:text-slate-950 p-2"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Filtered summaries */}
                    {(selectedType !== "ALL" || selectedCategory !== "ALL" || startDate || endDate) && (
                        <div className="flex flex-wrap gap-4 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <div>Filtered Inflow: <span className="text-emerald-600">${stats.filtered.income.toLocaleString()}</span></div>
                            <div>Filtered Outflow: <span className="text-rose-600">${stats.filtered.expense.toLocaleString()}</span></div>
                            <div>Filtered Margin: <span className={stats.filtered.balance >= 0 ? "text-slate-700" : "text-rose-600"}>${stats.filtered.balance.toLocaleString()}</span></div>
                        </div>
                    )}
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading ledger records...</span>
                        </div>
                    ) : transactions.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/50 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">
                                    <th className="px-6 py-4">Flow Type</th>
                                    <th className="px-6 py-4">Title / Item Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-slate-200/50 hover:bg-slate-50/55 transition-colors text-xs font-semibold text-slate-700">
                                        <td className="px-6 py-4.5 whitespace-nowrap">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider",
                                                tx.type === "INCOME" 
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                            )}>
                                                {tx.type === "INCOME" ? "Inflow" : "Outflow"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4.5">
                                            <div className="min-w-[150px]">
                                                <p className="font-bold text-slate-900 text-sm">{tx.title}</p>
                                                {tx.note && <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5" title={tx.note}>{tx.note}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-500 uppercase text-[10px] font-black tracking-wider">
                                            {tx.category}
                                        </td>
                                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-500 font-medium font-mono">
                                            {tx.reference || "—"}
                                        </td>
                                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-450 font-medium">
                                            {new Date(tx.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4.5 whitespace-nowrap text-right font-black text-sm",
                                            tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {tx.type === "INCOME" ? "+" : "-"}${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4.5 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEditClick(tx)}
                                                    className="p-2 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Edit Record"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(tx.id)}
                                                    className="p-2 bg-white hover:bg-red-550 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-24 text-center border-dashed border border-slate-200 m-6 rounded-3xl bg-white/40">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">No transactions found</span>
                            <p className="text-xs text-slate-400">Record a new transaction or reset search parameters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200/50 bg-slate-50/50 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Page {page} of {totalPages} ({totalRecords} records)
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Create/Update Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 shrink-0">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600">Form Console</span>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {editingTransaction ? "Modify Fund Record" : "Add Fund Record"}
                                    </h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                                <form onSubmit={handleFormSubmit} className="space-y-5">
                                    {submitError && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                            {submitError}
                                        </div>
                                    )}

                                    {/* Type Toggle (Income vs Expense) */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Flow Type *</label>
                                        <div className="flex gap-3">
                                            {[
                                                { label: "Inflow (Income)", value: "INCOME", color: "peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500" },
                                                { label: "Outflow (Expense)", value: "EXPENSE", color: "peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500" }
                                            ].map(opt => (
                                                <label key={opt.value} className="flex-1 relative flex items-center justify-center border border-slate-200 bg-white py-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all select-none">
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        checked={formData.type === opt.value}
                                                        onChange={() => setFormData(prev => ({ ...prev, type: opt.value as "INCOME" | "EXPENSE" }))}
                                                        className="peer sr-only"
                                                    />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all",
                                                        formData.type === opt.value && (opt.value === "INCOME" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold")
                                                    )}>
                                                        {opt.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name / Title */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Item Title / Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. AWS Invoice May 2026"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Amount and Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount ($ USD) *</label>
                                            <input
                                                required
                                                type="number"
                                                step="any"
                                                min="0.01"
                                                placeholder="150"
                                                value={formData.amount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction Date *</label>
                                            <input
                                                required
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Category and Reference */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Category *</label>
                                            <div className="relative border border-slate-200 bg-slate-50 rounded-xl px-3 py-3">
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 outline-none border-none cursor-pointer"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference Index (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. INVOICE-4982, Client name"
                                                value={formData.reference}
                                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description / Notes</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Write optional transaction reference details..."
                                            value={formData.note}
                                            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 resize-none"
                                        />
                                    </div>

                                    {/* Submit action */}
                                    <button
                                        type="submit"
                                        disabled={modalSubmitting}
                                        className="w-full mt-4 py-3.5 bg-orange-600 hover:bg-slate-950 text-white font-black uppercase tracking-[0.15em] text-[9px] rounded-xl shadow-lg hover:shadow-orange-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                                    >
                                        {modalSubmitting ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                Save Ledger Record
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
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
                            <div className="w-20 h-20 bg-red-550/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Wipe Ledger Entry?</h3>
                            <p className="text-slate-505 font-medium leading-relaxed mb-10">
                                This action will delete the transaction item. Overall inflow/outflow balances will automatically recalculate.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-55 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                                >
                                    Cancel
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
