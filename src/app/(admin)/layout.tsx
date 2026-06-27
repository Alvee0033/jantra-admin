"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Bell,
    Briefcase,
    FileText,
    LayoutDashboard,
    Layers,
    LogOut,
    Server,
    ShieldCheck,
    Users,
    UserSquare2,
    DollarSign,
    Menu,
    X
} from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Services", href: "/admin/services", icon: Layers },
    { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
    { label: "Funds", href: "/admin/funds", icon: DollarSign },
    { label: "Leads", href: "/admin/leads", icon: Bell },
    { label: "Reports", href: "/admin/report", icon: ShieldCheck },
    { label: "Architecture", href: "/admin/architecture", icon: Server },
    { label: "Team", href: "/admin/team", icon: UserSquare2 },
    { label: "Careers", href: "/admin/careers", icon: Users },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Portfolio", href: "/admin/work", icon: Briefcase }
];

const mobileQuickActions = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/admin/leads", icon: Bell },
    { label: "Reports", href: "/admin/report", icon: ShieldCheck }
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user, loading, token } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        if (!loading && !token && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [loading, token, pathname, router]);

    // Close mobile menu drawer when pathname changes (user navigated)
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* Dynamic ambient background glows */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_10%_-10%,rgba(249,115,22,0.12),transparent),radial-gradient(900px_460px_at_100%_0%,rgba(148,163,184,0.15),transparent),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]" />
            
            {/* Desktop Sidebar (md and up) */}
            <aside className="fixed left-4 top-4 bottom-4 z-40 hidden w-66 rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-xl backdrop-blur-md md:flex md:flex-col">
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-white">
                    <Logo className="h-7 w-7" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">Jantra Admin</p>
                        <p className="text-[9px] uppercase tracking-[0.16em] text-slate-300">Management</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                                    isActive
                                        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-900")} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={logout}
                    className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                    <LogOut className="h-4.5 w-4.5 text-slate-400" />
                    Sign Out
                </button>
            </aside>

            {/* Mobile Slide-Over Drawer Navigation */}
            <div className={cn(
                "fixed inset-0 z-50 transition-all duration-300 md:hidden",
                isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
            )}>
                {/* Backdrop overlay */}
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300",
                        isMobileMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                />
                
                {/* Left sliding panel */}
                <aside className={cn(
                    "absolute left-3 top-3 bottom-24 z-50 w-72 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out flex flex-col justify-between",
                    isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                )}>
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-white flex-1">
                                <Logo className="h-6 w-6" />
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold">Jantra Admin</p>
                                    <p className="text-[9px] uppercase tracking-[0.16em] text-slate-300">Management</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="ml-3 rounded-xl border border-slate-250 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <nav className="space-y-1.5 max-h-[52vh] overflow-y-auto pr-1 no-scrollbar">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                                            isActive
                                                ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-orange-600" : "text-slate-400")} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    
                    <div className="border-t border-slate-200/80 pt-4">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                logout();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                            <LogOut className="h-4.5 w-4.5 text-slate-400" />
                            Sign Out
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Area */}
            <main className="relative z-10 pb-24 md:ml-76 md:pb-6">
                <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-md md:px-6">
                    <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 md:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <Logo className="h-7 w-7" />
                            <div className="min-w-0 text-left">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Jantra</p>
                                <h1 className="truncate text-base font-bold text-slate-900 md:text-lg">Admin Control</h1>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                            {/* Hamburger Menu Trigger in Header */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:hidden cursor-pointer"
                                aria-label="Toggle navigation menu"
                            >
                                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-[1400px] px-4 py-4 md:px-6 md:py-6">
                    {loading ? (
                        <div className="flex min-h-[60vh] items-center justify-center">
                            <div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                        </div>
                    ) : token ? (
                        children
                    ) : null}
                </section>
            </main>

            {/* Mobile Bottom Navigation Bar (md:hidden) */}
            <nav className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur md:hidden items-center justify-between">
                {mobileQuickActions.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-[10px] font-bold transition-all duration-200",
                                isActive ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <item.icon className="mb-0.5 h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-[10px] font-bold transition-all duration-200 cursor-pointer",
                        isMobileMenuOpen ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                    )}
                >
                    {isMobileMenuOpen ? <X className="mb-0.5 h-4 w-4" /> : <Menu className="mb-0.5 h-4 w-4" />}
                    Menu
                </button>
            </nav>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    );
}
