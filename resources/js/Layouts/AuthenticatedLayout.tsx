import { useState, PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import ToastListener from "@/Components/ToastListener";

interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
}

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const user = (usePage().props as any).auth.user as User;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isFacilityRoute =
        route().current("buildings.*") ||
        route().current("floors.*") ||
        route().current("stalls.*");

    // NEW: Check if current route is a Report
    const isReportRoute = route().current("reports.*");

    const [facilityMenuOpen, setFacilityMenuOpen] = useState(isFacilityRoute);
    const [reportsMenuOpen, setReportsMenuOpen] = useState(isReportRoute);

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <ToastListener />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 transition-opacity lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-2xl border-r-2 border-slate-800 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 py-6 border-b-2 border-slate-800 bg-slate-950 shrink-0">
                    <div className="bg-amber-500 text-slate-900 p-2 rounded-xl border-2 border-amber-600 shadow-inner">
                        <Icon icon="solar:shop-2-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white uppercase leading-tight">Gerona Stall</div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Management System</div>
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {/* Dashboard */}
                    <Link
                        href={route("dashboard")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("dashboard")
                            ? "bg-blue-700 text-white border-blue-900 shadow-sm"
                            : "hover:bg-slate-800 hover:text-white border-transparent"
                            }`}
                    >
                        <Icon icon="solar:pie-chart-2-bold-duotone" className="w-6 h-6" />
                        Dashboard
                    </Link>

                    {/* Facility Setup Dropdown */}
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={() => setFacilityMenuOpen(!facilityMenuOpen)}
                            className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${isFacilityRoute ? "bg-slate-800 text-white border-slate-700" : "hover:bg-slate-800 hover:text-white border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:city-bold-duotone" className="w-6 h-6" />
                                Facility Setup
                            </div>
                            <Icon icon="solar:alt-arrow-down-bold" className={`w-4 h-4 transition-transform ${facilityMenuOpen ? "rotate-180 text-white" : "text-slate-500"}`} />
                        </button>

                        {facilityMenuOpen && (
                            <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-700 rounded-full"></div>
                                <Link href={route("buildings.index")} className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("buildings.*") ? "bg-blue-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>Buildings</Link>
                                <Link href={route("floors.index")} className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("floors.*") ? "bg-blue-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>Floors</Link>
                                <Link href={route("stalls.index")} className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("stalls.*") ? "bg-blue-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>Stalls</Link>
                            </div>
                        )}
                    </div>

                    {/* 🔥 NEW: Operational Reports Dropdown (PHASE 7) 🔥 */}
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
                            className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${isReportRoute ? "bg-slate-800 text-white border-slate-700" : "hover:bg-slate-800 hover:text-white border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:document-list-bold-duotone" className="w-6 h-6 text-rose-500" />
                                LGU Reports
                            </div>
                            <Icon icon="solar:alt-arrow-down-bold" className={`w-4 h-4 transition-transform ${reportsMenuOpen ? "rotate-180 text-white" : "text-slate-500"}`} />
                        </button>

                        {reportsMenuOpen && (
                            <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-700 rounded-full"></div>
                                <Link
                                    href={route("reports.balances")}
                                    className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("reports.balances") ? "bg-rose-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                >
                                    With Balances
                                </Link>
                                <Link
                                    href={route("reports.closures")}
                                    className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("reports.closures") ? "bg-rose-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                >
                                    For Closure
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-800 my-4 mx-2"></div>

                    {/* Map */}
                    <Link
                        href={route("layouts.mapper")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("layouts.mapper") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Icon icon="solar:map-bold-duotone" className={`w-6 h-6 ${route().current("layouts.mapper") ? "text-white" : "text-amber-500"}`} />
                        Stall Layout Map
                    </Link>

                    {/* Tenants */}
                    <Link
                        href={route("tenants.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("tenants.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-6 h-6" />
                        Manage Tenants
                    </Link>

                    {/* Contracts */}
                    <Link
                        href={route("contracts.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("contracts.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Icon icon="solar:document-text-bold-duotone" className="w-6 h-6 text-blue-400" />
                        Lease Contracts
                    </Link>

                    {/* Treasury */}
                    <Link
                        href={route("payments.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("payments.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Icon icon="solar:wallet-bold-duotone" className="w-6 h-6 text-emerald-500" />
                        Treasury & Payments
                    </Link>

                    {/* Users */}
                    <Link
                        href={route("users.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("users.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Icon icon="solar:shield-user-bold-duotone" className="w-6 h-6" />
                        Manage Personnel
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t-2 border-slate-800 bg-slate-950 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center text-white font-black rounded-lg">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white font-black text-sm truncate">{user.name}</div>
                            <div className="text-xs text-slate-400 font-bold truncate">@{user.username || "admin"}</div>
                        </div>
                    </div>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 rounded-xl font-black uppercase text-sm tracking-wide hover:bg-rose-600 hover:border-rose-800 hover:text-white transition-all"
                    >
                        <Icon icon="solar:logout-2-bold-duotone" className="w-5 h-5" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
                {/* Mobile-Only Top Bar */}
                <div className="lg:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b-2 border-slate-300 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-600 hover:text-slate-900 focus:outline-none bg-slate-100 border-2 border-slate-300 p-1.5 rounded-lg transition-colors"
                        >
                            <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6" />
                        </button>
                        <span className="font-black text-slate-900 tracking-tight uppercase">Gerona Stall</span>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}