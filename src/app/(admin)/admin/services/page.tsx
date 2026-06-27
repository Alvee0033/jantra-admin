"use client";

import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import {
    Plus,
    Edit3,
    Trash2,
    X,
    Server,
    Loader2,
    Sparkles,
    Shield,
    Layers,
    Search,
    MoveUpRight,
    CheckCircle2,
    UploadCloud,
    Image as ImageIcon,
    Code,
    Bot,
    Workflow,
    Cpu,
    Smartphone,
    Cloud,
    Database,
    Zap,
    ChevronDown
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
    features: string[];
    techStack: string[];
    priceMin?: number | null;
    priceMax?: number | null;
    icon?: string | null;
    image?: string | null;
    banner?: string | null;
    demoUrl?: string | null;
}

export default function ServicesManagementPage() {
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchServices = async () => {
        setLoading(true);
        try {
            // Note: The backend route lists public services on GET /services, but since we are admin,
            // we want to list all services. The backend GET /services returns only published ones by default,
            // but let's check if there is an admin endpoint or if we just fetch from `/services` and manage them.
            // Wait, in jontro-backend/src/routes/services.js:
            // router.get('/', async (req, res, next) => {
            //     try {
            //         const services = await prisma.service.findMany({
            //             where: { published: true }, // wait! The public endpoint filters published: true
            //             orderBy: { order: 'asc' }
            //         });
            //         res.json(services);
            //     }
            // });
            // And wait! Is there an admin route `/api/admin/services`?
            // In routes/services.js, there is no GET `/admin/services` or separate admin GET endpoint.
            // Wait, let's verify if there is any admin list endpoint in routes/services.js.
            // In routes/services.js, we saw:
            // router.get('/', ...) and router.get('/:slug', ...)
            // and POST '/', PUT '/:id', DELETE '/:id' which are auth protected.
            // Wait, what if we want to list ALL services (including unpublished ones) for the admin?
            // If the public GET `/` filters by published: true, then the admin dashboard would only see published ones.
            // Let's modify the backend routes/services.js to support GET `/admin/services` or let GET `/` return all services if auth token is present, OR just add a separate admin endpoint!
            // Wait, let's check routes/services.js to see if we can easily add a GET `/admin` or bypass the published filter when the user is logged in.
            // Let's make an admin service fetch: we'll fetch from `/services` for now, but let's make sure we also add an admin endpoint in backend or make GET `/` return all if req.admin exists?
            // Wait! In backend services route:
            // app.use('/api/services', serviceRoutes);
            // Wait, let's check if there is an admin services route defined.
            // In jontro-backend/src/routes/services.js, there is no auth middleware on GET `/`.
            // Let's look at `jontro-backend/src/routes/services.js`:
            // `router.get('/', async (req, res, next) => { ... })`
            // Let's modify the backend routes/services.js to add a GET `/admin` endpoint or let GET `/` accept a query param or auth to show unpublished services!
            // Actually, adding a query param or a GET `/admin/list` endpoint is very easy. Let's do that! We can add GET `/admin` to backend routes/services.js.
            const response = await api.get("/services/admin/all");
            // If the backend has been updated to return all, or we fetch from the public endpoint:
            const apiData = response.data?.data || response.data || [];
            setServices(Array.isArray(apiData) ? apiData : []);
        } catch (error) {
            console.error("Failed to fetch services:", error);
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
        } finally {
            setDeletingId(null);
        }
    };

    const filteredServices = useMemo(() => {
        return services.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.order - b.order);
    }, [services, searchQuery]);

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
                        <Layers className="w-8 h-8 text-orange-500" />
                        Services
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Manage company service offerings and check which plans they appear under in the pricing section.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full sm:w-64 shadow-sm font-medium"
                        />
                    </div>

                    <button
                        onClick={() => { setEditingService(null); setShowModal(true); }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add New Service</span>
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
                <div className="md:hidden p-4 space-y-4 bg-slate-50/40">
                    {loading ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Loading services...</p>
                            </div>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <Server className="w-16 h-16 text-slate-300" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No services found</p>
                            </div>
                        </div>
                    ) : (
                        filteredServices.map((service, index) => {
                            let plans: string[] = [];
                            try {
                                if (Array.isArray(service.pricingTiers)) {
                                    plans = service.pricingTiers;
                                } else if (typeof service.pricingTiers === "string") {
                                    plans = JSON.parse(service.pricingTiers);
                                }
                            } catch { }

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm space-y-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="relative w-16 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                                            {service.image ? (
                                                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-350">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h3 className="font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5 truncate">
                                                {React.createElement(iconMap[service.icon || ""] || Zap, { className: "w-3.5 h-3.5 text-orange-500 shrink-0" })}
                                                <span className="truncate">{service.title}</span>
                                            </h3>
                                            <p className="text-[8px] text-slate-400 font-mono tracking-tighter uppercase truncate">/{service.slug} · #{service.order}</p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{service.description}</p>

                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {plans.includes("starter") && (
                                            <span className="text-[8px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-orange-100">
                                                Starter
                                            </span>
                                        )}
                                        {plans.includes("growth") && (
                                            <span className="text-[8px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-sky-100">
                                                Growth
                                            </span>
                                        )}
                                        {plans.includes("enterprise") && (
                                            <span className="text-[8px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-purple-100">
                                                Enterprise
                                            </span>
                                        )}
                                        {plans.length === 0 && (
                                            <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-slate-100">
                                                Unplaced
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                                            service.published ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-450 border-slate-100"
                                        )}>
                                            {service.published ? "Published" : "Draft"}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingService(service); setShowModal(true); }}
                                                className="p-2.5 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(service.id)}
                                                className="p-2.5 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pricing Tiers</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Loading services...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Server className="w-16 h-16 text-slate-300" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">No services found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service, index) => {
                                    // Parse pricing plans from pricingTiers
                                    let plans: string[] = [];
                                    try {
                                        if (Array.isArray(service.pricingTiers)) {
                                            plans = service.pricingTiers;
                                        } else if (typeof service.pricingTiers === "string") {
                                            plans = JSON.parse(service.pricingTiers);
                                        }
                                    } catch { }

                                    return (
                                        <motion.tr
                                            key={service.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-orange-50/20 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4 max-w-md">
                                                    {/* Service Cover thumbnail */}
                                                    <div className="relative w-16 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                                                        {service.image ? (
                                                            <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-350">
                                                                <ImageIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight flex items-center gap-2">
                                                            {React.createElement(iconMap[service.icon || ""] || Zap, { className: "w-4 h-4 text-orange-500 shrink-0" })}
                                                            <span className="truncate">{service.title}</span>
                                                        </h3>
                                                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase truncate">SLUG: {service.slug} // ORDER: {service.order}</p>
                                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-1 mt-0.5">{service.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {plans.includes("starter") && (
                                                        <span className="text-[9px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-orange-100">
                                                            Starter Plan
                                                        </span>
                                                    )}
                                                    {plans.includes("growth") && (
                                                        <span className="text-[9px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-sky-100">
                                                            Growth Plan
                                                        </span>
                                                    )}
                                                    {plans.includes("enterprise") && (
                                                        <span className="text-[9px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-purple-100">
                                                            Enterprise
                                                        </span>
                                                    )}
                                                    {plans.length === 0 && (
                                                        <span className="text-[9px] bg-slate-50 text-slate-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-slate-100">
                                                            No pricing section
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                    service.published ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-455 border border-slate-100"
                                                )}>
                                                    {service.published ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => { setEditingService(service); setShowModal(true); }}
                                                        className="p-3 bg-white hover:bg-slate-955 hover:text-white border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(service.id)}
                                                        className="p-3 bg-white hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 rounded-2xl transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

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
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Delete Member?</h3>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Service Settings</span>
                        </div>

                        <div>
                            <h3 className="text-4xl font-black tracking-tight leading-tight mb-4">
                                {service ? "Edit Service" : "Add New Service"}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic opacity-60">
                                Configure feature metrics, tech stack layers, and pricing inclusions.
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
                        <span className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase">Status: Active</span>
                    </div>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service Details</span>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-4 block">Service Image</label>
                                    <div className="flex items-stretch gap-6">
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
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-450">No Image</span>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                                formData.published ? "bg-orange-500 border-orange-500 shadow-lg text-white" : "bg-white border-slate-200 text-slate-300"
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
                    <div className="p-8 md:px-12 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-5 shrink-0">
                        <button
                            type="button" onClick={onClose}
                            className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all"
                        >
                            Abort Configuration
                        </button>
                        <button
                            disabled={loading || uploadingImage}
                            onClick={handleSubmit}
                            className="inline-flex items-center justify-center gap-3 bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 disabled:opacity-50 min-w-[220px]"
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
