"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", { email, password });
            login(response.data.token, response.data.user);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Invalid credentials";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] p-4 relative overflow-hidden selection:bg-orange-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/[0.03] blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-500/[0.02] blur-[110px] rounded-full pointer-events-none" />

            {/* Clean minimal background grid */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10 opacity-[0.015] [mask-image:radial-gradient(circle_at_center,#000_70%,transparent_100%)]">
                <div className="w-full h-full bg-[linear-gradient(to_right,#ea580c_1px,transparent_1px),linear-gradient(to_bottom,#ea580c_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="w-full max-w-sm relative group flex flex-col">
                {/* Background offset layer */}
                <div className="absolute inset-0 rounded-3xl border border-orange-500/15 bg-orange-500/[0.02] translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500 -z-10" />

                {/* Foreground Card */}
                <div className="w-full relative bg-white rounded-3xl border border-slate-200/85 p-6 sm:p-8 transition-all duration-300 group-hover:border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                    <div className="mb-6 text-left">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-500/10">
                            <Logo className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-orange-600 font-bold tracking-widest text-[8px] uppercase font-mono">Console Login</span>
                            <Sparkles className="h-3 w-3 text-orange-500 animate-pulse" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">Admin Login<span className="text-orange-500">.</span></h1>
                        <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">Sign in to control the Jantra Soft platform.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group space-y-1.5 text-left">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-orange-600 transition-colors ml-1 font-mono">Email Address</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group space-y-1.5 text-left">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-orange-600 transition-colors ml-1 font-mono">Password</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-600 text-left">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-3 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[8.5px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-orange-600 shadow-sm cursor-pointer mt-5",
                                loading && "cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
