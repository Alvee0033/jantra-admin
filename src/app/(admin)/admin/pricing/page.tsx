"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Save,
    Layers,
    DollarSign,
    Loader2,
    Sparkles,
    CheckCircle2,
    Search,
    Info,
    HelpCircle,
    Image as ImageIcon,
    Zap,
    Code,
    Bot,
    Workflow,
    Cpu,
    Smartphone,
    Cloud,
    Database,
    Edit3,
    Trash2,
    Plus,
    X,
    Server,
    UploadCloud,
    ChevronDown,
    MoveUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
    Code,
    Bot,
    Workflow,
    Cpu,
    Smartphone,
    Cloud,
    Database,
    Zap
};

interface ServiceRecord {
    id: string;
    title: string;
    slug: string;
    description: string;
    order: number;
    published: boolean;
    pricingTiers: any; // Storing array of plan slugs, e.g. ["starter", "growth"]
    priceMin: number | null;
    priceMax: number | null;
    priceMinUsd?: number | null;
    priceMaxUsd?: number | null;
    priceMinEur?: number | null;
    priceMaxEur?: number | null;
    priceMinBdt?: number | null;
    priceMaxBdt?: number | null;
    features: string[];
    techStack: string[];
    icon?: string | null;
    image?: string | null;
    banner?: string | null;
    demoUrl?: string | null;
}

export default function PricingManagementPage() {
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    // Add state for modals and operations
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchServices = async () => {
        try {
            // Admin endpoint fetches all services
            const response = await api.get("/services/admin/all");
            setServices(response.data || []);
        } catch (err: any) {
            console.error("Failed to load services for pricing:", err);
            setErrorMsg("Failed to retrieve services. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/services/${deletingId}`);
            fetchServices();
        } catch (error) {
            console.error("Failed to delete service:", error);
            setErrorMsg("Failed to delete service.");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePriceChange = (
        id: string,
        field:
            | "priceMin"
            | "priceMax"
            | "priceMinUsd"
            | "priceMaxUsd"
            | "priceMinEur"
            | "priceMaxEur"
            | "priceMinBdt"
            | "priceMaxBdt",
        value: string
    ) => {
        setServices(prev =>
            prev.map(s => {
                if (s.id === id) {
                    const numVal = value === "" ? null : parseInt(value, 10);
                    return { ...s, [field]: isNaN(numVal as number) ? null : numVal };
                }
                return s;
            })
        );
    };

    const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

    const handleRowImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImageId(id);
        const data = new FormData();
        data.append("image", file);

        try {
            const response = await api.post("/upload/image", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setServices(prev =>
                prev.map(s => (s.id === id ? { ...s, image: response.data.url } : s))
            );
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImageId(null);
        }
    };

    const togglePlan = (id: string, planSlug: string) => {
        setServices(prev =>
            prev.map(s => {
                if (s.id === id) {
                    let plans: string[] = [];
                    try {
                        if (Array.isArray(s.pricingTiers)) {
                            plans = [...s.pricingTiers];
                        } else if (typeof s.pricingTiers === "string") {
                            plans = JSON.parse(s.pricingTiers);
                        }
                    } catch {}
                    
                    const index = plans.indexOf(planSlug);
                    if (index > -1) {
                        plans.splice(index, 1);
                    } else {
                        plans.push(planSlug);
                    }
                    return { ...s, pricingTiers: plans };
                }
                return s;
            })
        );
    };

    const handleSaveService = async (service: ServiceRecord) => {
        setSavingId(service.id);
        setErrorMsg("");

        const isInvalidRange =
            (service.priceMinUsd != null && service.priceMaxUsd != null && service.priceMinUsd > service.priceMaxUsd) ||
            (service.priceMinEur != null && service.priceMaxEur != null && service.priceMinEur > service.priceMaxEur) ||
            (service.priceMinBdt != null && service.priceMaxBdt != null && service.priceMinBdt > service.priceMaxBdt);

        if (isInvalidRange) {
            setSavingId(null);
            setErrorMsg("Invalid price range: min cannot be greater than max for a currency.");
            return;
        }

        try {
            // Build request payload matching Zod validation schema
            const payload = {
                title: service.title,
                slug: service.slug,
                description: service.description,
                order: service.order,
                published: service.published,
                features: service.features,
                techStack: service.techStack,
                pricingTiers: service.pricingTiers,
                priceMin: service.priceMin,
                priceMax: service.priceMax,
                priceMinUsd: service.priceMinUsd ?? service.priceMin ?? null,
                priceMaxUsd: service.priceMaxUsd ?? service.priceMax ?? null,
                priceMinEur: service.priceMinEur ?? null,
                priceMaxEur: service.priceMaxEur ?? null,
                priceMinBdt: service.priceMinBdt ?? null,
                priceMaxBdt: service.priceMaxBdt ?? null,
                icon: service.icon || null,
                image: service.image || null,
                banner: service.banner || null,
                demoUrl: service.demoUrl || null
            };

            await api.put(`/services/${service.id}`, payload);
            setSuccessId(service.id);
            setTimeout(() => setSuccessId(null), 3000);
        } catch (err: any) {
            console.error("Failed to save service pricing:", err);
            setErrorMsg(err.response?.data?.error || err.message || "Failed to update service pricing.");
        } finally {
            setSavingId(null);
        }
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Services Registry...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header info card */}
            <motion.section 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-md"
            >
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" /> Pricing Schema
                    </span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
                        Service Price Ranges<span className="text-orange-500">.</span>
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Configure price ranges and landing page pricing plan inclusions for all digital services.
                    </p>
                </div>
            </motion.section>

            {/* Error notifications */}
            {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold uppercase tracking-wide text-red-600 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* Search Filter Controls with Add button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search services by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-250/60 bg-white/80 py-3 pl-10 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingService(null); setShowModal(true); }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-xs group whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Service Offering</span>
                    </button>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Showing {filteredServices.length} of {services.length} services
                </div>
            </div>

            {/* Services Grid/Table */}
            <div className="grid gap-6">
                {filteredServices.length ? (
                    filteredServices.map((service, index) => {
                        let activePlans: string[] = [];
                        try {
                            if (Array.isArray(service.pricingTiers)) {
                                activePlans = service.pricingTiers;
                            } else if (typeof service.pricingTiers === "string") {
                                activePlans = JSON.parse(service.pricingTiers);
                            }
                        } catch {}

                        const isSaving = savingId === service.id;
                        const isSuccess = successId === service.id;

                        return (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="group relative rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-slate-300/80"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                    {/* Service Title (Clickable) */}
                                    <div className="lg:col-span-4 flex items-center gap-4">
                                        <label className="relative w-16 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 border border-slate-200 hover:border-orange-500 hover:shadow-sm cursor-pointer shrink-0 group/img flex items-center justify-center transition-all select-none">
                                            {uploadingImageId === service.id ? (
                                                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                            ) : service.image ? (
                                                <>
                                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-[7px] font-black uppercase tracking-widest text-white bg-slate-900/60 px-1 py-0.5 rounded">Change</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-350 hover:text-orange-500 hover:bg-orange-50/20 transition-all gap-0.5">
                                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-[6px] font-black uppercase tracking-widest">Upload</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleRowImageUpload(service.id, e)}
                                                disabled={uploadingImageId !== null}
                                            />
                                        </label>
                                        <div 
                                            onClick={() => { setEditingService(service); setShowModal(true); }}
                                            className="space-y-1 min-w-0 cursor-pointer group/title"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-1 group-hover/title:text-orange-550 transition-colors">
                                                {React.createElement(iconMap[service.icon || ""] || Zap, { className: "h-3 w-3" })} Service Module
                                            </span>
                                            <h3 className="text-base font-black uppercase tracking-tight text-slate-900 leading-tight truncate group-hover/title:text-orange-600 transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                                                Slug: {service.slug} | Status: {service.published ? "Published" : "Draft"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Multi-currency Price Range inputs */}
                                    <div className="lg:col-span-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">USD Min</label>
                                                <input
                                                    type="number"
                                                    placeholder="5000"
                                                    value={service.priceMinUsd ?? service.priceMin ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMinUsd", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">USD Max</label>
                                                <input
                                                    type="number"
                                                    placeholder="15000"
                                                    value={service.priceMaxUsd ?? service.priceMax ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMaxUsd", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">EUR Min</label>
                                                <input
                                                    type="number"
                                                    placeholder="4500"
                                                    value={service.priceMinEur ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMinEur", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">EUR Max</label>
                                                <input
                                                    type="number"
                                                    placeholder="13000"
                                                    value={service.priceMaxEur ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMaxEur", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">BDT Min</label>
                                                <input
                                                    type="number"
                                                    placeholder="550000"
                                                    value={service.priceMinBdt ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMinBdt", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">BDT Max</label>
                                                <input
                                                    type="number"
                                                    placeholder="1600000"
                                                    value={service.priceMaxBdt ?? ""}
                                                    onChange={(e) => handlePriceChange(service.id, "priceMaxBdt", e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-bold uppercase tracking-wider text-slate-800 focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan inclusions checkboxes (col-span 3) */}
                                    <div className="lg:col-span-3 space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block ml-1">Plan Tiers Inclusion</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[
                                                { label: "Starter", slug: "starter", color: "peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-checked:border-orange-200" },
                                                { label: "Growth", slug: "growth", color: "peer-checked:bg-sky-50 peer-checked:text-sky-700 peer-checked:border-sky-200" },
                                                { label: "Enterprise", slug: "enterprise", color: "peer-checked:bg-purple-50 peer-checked:text-purple-700 peer-checked:border-purple-200" }
                                            ].map((plan) => (
                                                <label key={plan.slug} className="flex-1 relative flex items-center justify-center border border-slate-200 bg-white px-2 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={activePlans.includes(plan.slug)}
                                                        onChange={() => togglePlan(service.id, plan.slug)}
                                                        className="peer sr-only"
                                                    />
                                                    <span className={`text-[8px] font-black uppercase tracking-wider text-slate-455 ${plan.color} peer-checked:text-slate-800 transition-colors`}>
                                                        {plan.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Operations Column (col-span 2) */}
                                    <div className="lg:col-span-2 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 lg:pt-0 lg:border-t-0 w-full lg:w-auto">
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => { setEditingService(service); setShowModal(true); }}
                                            className="p-3 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                            title="Edit Service Details"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => setDeletingId(service.id)}
                                            className="p-3 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                                            title="Decommission Service"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {/* Save Button */}
                                        <button
                                            disabled={isSaving}
                                            onClick={() => handleSaveService(service)}
                                            className={`p-3 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
                                                isSuccess
                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                                    : "bg-slate-950 border-slate-950 text-white hover:bg-orange-600 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                                            }`}
                                            title="Save Service Pricing Settings"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isSuccess ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/40 p-16 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">No services found</span>
                        <p className="text-xs text-slate-400">Create services under the Services menu or expand filters.</p>
                    </div>
                )}
            </div>

            {/* Premium Modals */}
            <AnimatePresence>
                {showModal && (
                    <ServiceModal
                        service={editingService}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => { fetchServices(); setShowModal(false); }}
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
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Decommission Node?</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-10">
                                This will remove the service from all public layouts including individual details and pricing tables.
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

function ServiceModal({ service, onClose, onSuccess }: { service: ServiceRecord | null, onClose: () => void, onSuccess: () => void }) {
    // Parse plans from pricingTiers
    let initialPlans: string[] = [];
    try {
        if (service) {
            if (Array.isArray(service.pricingTiers)) {
                initialPlans = service.pricingTiers;
            } else if (typeof service.pricingTiers === "string") {
                initialPlans = JSON.parse(service.pricingTiers);
            }
        }
    } catch { }

    const [formData, setFormData] = useState({
        title: service?.title || "",
        slug: service?.slug || "",
        description: service?.description || "",
        order: service?.order || 0,
        published: service?.published ?? true,
        features: Array.isArray(service?.features) ? service.features.join(", ") : "",
        techStack: Array.isArray(service?.techStack) ? service.techStack.join(", ") : "",
        pricingTiers: initialPlans, // Storing the plans checklist
        priceMin: service?.priceMin === null || service?.priceMin === undefined ? "" : service.priceMin.toString(),
        priceMax: service?.priceMax === null || service?.priceMax === undefined ? "" : service.priceMax.toString(),
        icon: service?.icon || "Code",
        image: service?.image || "",
        banner: service?.banner || "",
        demoUrl: service?.demoUrl || ""
    });

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingDemo, setUploadingDemo] = useState(false);
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
            setFormData(prev => ({ ...prev, image: response.data.url }));
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBanner(true);
        const data = new FormData();
        data.append("image", file);

        try {
            const response = await api.post("/upload/image", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, banner: response.data.url }));
        } catch (error) {
            console.error("Failed to upload banner image:", error);
            alert("Failed to upload banner image. Please try again.");
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleDemoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDemo(true);
        const data = new FormData();
        data.append("image", file);

        try {
            // General uploader works through the same supabase storage endpoint
            const response = await api.post("/upload/image", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, demoUrl: response.data.url }));
        } catch (error) {
            console.error("Failed to upload demo document/media:", error);
            alert("Failed to upload demo file. Please try again.");
        } finally {
            setUploadingDemo(false);
        }
    };

    const togglePlan = (planSlug: string) => {
        setFormData(prev => {
            const current = [...prev.pricingTiers];
            const index = current.indexOf(planSlug);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(planSlug);
            }
            return { ...prev, pricingTiers: current };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError("");

        // Format commas to array
        const formattedFeatures = formData.features
            .split(",")
            .map(f => f.trim())
            .filter(Boolean);

        const formattedTechStack = formData.techStack
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);

        const payload = {
            title: formData.title,
            slug: formData.slug || undefined, // backend auto slug if empty
            description: formData.description,
            order: formData.order,
            published: formData.published,
            features: formattedFeatures,
            techStack: formattedTechStack,
            pricingTiers: formData.pricingTiers, // matches backend z.array(z.any())
            priceMin: formData.priceMin === "" ? null : parseInt(formData.priceMin, 10),
            priceMax: formData.priceMax === "" ? null : parseInt(formData.priceMax, 10),
            icon: formData.icon || null,
            image: formData.image || null,
            banner: formData.banner || null,
            demoUrl: formData.demoUrl || null
        };

        try {
            if (service) {
                await api.put(`/services/${service.id}`, payload);
            } else {
                await api.post("/services", payload);
            }
            onSuccess();
        } catch (error: any) {
            const fieldErrors = error?.response?.data?.errors;
            const message = fieldErrors
                ? Object.values(fieldErrors).flat().filter(Boolean).join(" ")
                : "";
            setSubmitError(message || "Unable to save service configuration.");
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Service Config</span>
                        </div>

                        <div>
                            <h3 className="text-4xl font-black tracking-tight leading-tight mb-4">
                                {service ? "Calibrate Service Node" : "Synchronize New Service"}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic opacity-60">
                                Configure feature metrics, tech stack layers, and pricing inclusions.
                            </p>
                        </div>

                        {/* Order Indicator */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Order</span>
                                <span className="text-2xl font-black text-orange-500">#{formData.order.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase">Status: Online</span>
                    </div>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-grow flex flex-col bg-white min-w-0">
                    <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-100 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service Specification</span>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Service Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="AI Agent Development"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">URL Slug (Optional)</label>
                                    <input
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="ai-agent-development"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Service Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium leading-relaxed text-slate-600 focus:outline-none focus:border-orange-500 transition-all resize-none"
                                    placeholder="Describe the service details and client value proposition..."
                                />
                            </div>

                            {/* Service Icon & Image */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                {/* Service Icon */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Service Icon</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all cursor-pointer pr-12"
                                        >
                                            <option value="Code">Code Icon</option>
                                            <option value="Bot">Bot Icon</option>
                                            <option value="Workflow">Workflow Icon</option>
                                            <option value="Cpu">Cpu Icon</option>
                                            <option value="Smartphone">Smartphone Icon</option>
                                            <option value="Cloud">Cloud Icon</option>
                                            <option value="Database">Database Icon</option>
                                            <option value="Zap">Zap Icon</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                                            {React.createElement(iconMap[formData.icon] || Zap, { className: "w-5 h-5 text-orange-500" })}
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Service Image */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Service Card Photo</label>
                                    <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                        <div className="relative w-28 aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center group flex-shrink-0">
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} alt="Service Cover" className="object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, image: "" })}
                                                            className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-slate-350">
                                                    <ImageIcon className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-455">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow flex flex-col justify-center space-y-2">
                                            <label className={cn(
                                                "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all border-2 shadow-sm w-full active:scale-95",
                                                uploadingImage
                                                    ? "bg-slate-50 text-slate-300 border-slate-100 pointer-events-none"
                                                    : "bg-white border-slate-100 hover:border-orange-500 hover:text-orange-600 hover:shadow-orange-500/10"
                                            )}>
                                                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-orange-500" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{uploadingImage ? 'TRANSMITTING...' : 'UPLOAD IMAGE'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Or paste image URL directly..."
                                                value={formData.image}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-350"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Banner Image */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Service Details Page Banner</label>
                                <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                    <div className="relative w-full sm:w-64 aspect-[21/9] rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center group flex-shrink-0">
                                        {formData.banner ? (
                                            <>
                                                <img src={formData.banner} alt="Service Banner" className="object-cover w-full h-full" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, banner: "" })}
                                                        className="bg-red-500 text-white p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-slate-350">
                                                <ImageIcon className="w-6 h-6" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-455">No Banner Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col justify-center space-y-2">
                                        <label className={cn(
                                            "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all border-2 shadow-sm w-full active:scale-95",
                                            uploadingBanner
                                                ? "bg-slate-50 text-slate-300 border-slate-100 pointer-events-none"
                                                : "bg-white border-slate-100 hover:border-orange-500 hover:text-orange-600 hover:shadow-orange-500/10"
                                        )}>
                                            {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-orange-500" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{uploadingBanner ? 'TRANSMITTING...' : 'UPLOAD BANNER'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Or paste banner image URL directly..."
                                            value={formData.banner}
                                            onChange={e => setFormData({ ...formData, banner: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-350"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Demo Link / Document Upload */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Service Live Demo / Document Link</label>
                                <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                    <div className="relative w-full sm:w-64 aspect-[21/9] rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center group flex-shrink-0">
                                        {formData.demoUrl ? (
                                            <div className="p-4 text-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Demo Loaded</span>
                                                <a href={formData.demoUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-slate-400 hover:text-orange-500 underline break-all line-clamp-1">{formData.demoUrl}</a>
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, demoUrl: "" })}
                                                        className="bg-red-500 text-white p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-slate-350">
                                                <UploadCloud className="w-6 h-6 text-slate-300" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-455">No Demo Link/File</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col justify-center space-y-2">
                                        <label className={cn(
                                            "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all border-2 shadow-sm w-full active:scale-95",
                                            uploadingDemo
                                                ? "bg-slate-50 text-slate-300 border-slate-100 pointer-events-none"
                                                : "bg-white border-slate-100 hover:border-orange-500 hover:text-orange-600 hover:shadow-orange-500/10"
                                        )}>
                                            {uploadingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-orange-500" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{uploadingDemo ? 'TRANSMITTING...' : 'UPLOAD DEMO FILE'}</span>
                                            <input type="file" className="hidden" onChange={handleDemoUpload} />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Or enter live demo URL directly..."
                                            value={formData.demoUrl}
                                            onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-350"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Service Features (Comma Separated)</label>
                                    <input
                                        value={formData.features}
                                        onChange={e => setFormData({ ...formData, features: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="Responsive UI, REST APIs, Database Setup"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Tech Stack Layers (Comma Separated)</label>
                                    <input
                                        value={formData.techStack}
                                        onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="React, Next.js, PostgreSQL"
                                    />
                                </div>
                            </div>

                            {/* Pricing Plans Inclusion Checkboxes */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Pricing Section Inclusions</label>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4 mb-2">Check the plans where this service should be listed as an included feature:</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                    {[
                                        { name: "Starter Plan", slug: "starter", tone: "peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-checked:border-orange-200" },
                                        { name: "Growth Plan", slug: "growth", tone: "peer-checked:bg-sky-50 peer-checked:text-sky-700 peer-checked:border-sky-200" },
                                        { name: "Enterprise Plan", slug: "enterprise", tone: "peer-checked:bg-purple-50 peer-checked:text-purple-700 peer-checked:border-purple-200" }
                                    ].map((plan) => (
                                        <label key={plan.slug} className="relative flex items-center justify-between border-2 border-slate-100 bg-slate-50/50 p-6 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-wide text-slate-900">{plan.name}</span>
                                                <span className="text-[8px] font-bold text-slate-400 tracking-wider mt-0.5 uppercase">Plan Slug: {plan.slug}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={formData.pricingTiers.includes(plan.slug)}
                                                onChange={() => togglePlan(plan.slug)}
                                                className="w-5 h-5 rounded border-slate-200 text-orange-500 focus:ring-orange-500/20"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Min Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 5000"
                                        value={formData.priceMin}
                                        onChange={e => setFormData({ ...formData, priceMin: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Max Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 15000"
                                        value={formData.priceMax}
                                        onChange={e => setFormData({ ...formData, priceMax: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4">Broadcast Deployment</label>
                                    <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, published: !formData.published })}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2",
                                                formData.published ? "bg-orange-500 border-orange-500 shadow-lg text-white" : "bg-white border-slate-200 text-slate-350"
                                            )}
                                        >
                                            <MoveUpRight className="w-5 h-5" />
                                        </button>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Visibility Status</span>
                                            <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{formData.published ? 'Live Broadcast' : 'Draft Mode'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {submitError && (
                                <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                                    {submitError}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-5 sm:p-8 md:px-12 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-5 shrink-0">
                        <button
                            type="button" onClick={onClose}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-455 hover:text-red-500 transition-all text-center"
                        >
                            Abort Configuration
                        </button>
                        <button
                            disabled={loading || uploadingImage || uploadingBanner || uploadingDemo}
                            onClick={handleSubmit}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 disabled:opacity-50 min-w-0 sm:min-w-[220px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{loading ? "Calibrating..." : service ? "Update Service" : "Confirm Onboarding"}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
