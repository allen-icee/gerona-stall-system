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

    // Smart state: Automatically open the dropdown if we are on any of its child routes
    const isFacilityRoute =
        route().current("buildings.*") ||
        route().current("floors.*") ||
        route().current("stalls.*");
    const [facilityMenuOpen, setFacilityMenuOpen] = useState(isFacilityRoute);

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <ToastListener />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 transition-opacity lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-2xl border-r-2 border-slate-800 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Brand / Logo Area */}
                <div className="flex items-center gap-3 px-5 py-6 border-b-2 border-slate-800 shrink-0 bg-slate-950">
                    <div className="bg-amber-500 text-slate-900 p-2 rounded-xl shadow-inner border-2 border-amber-600">
                        <Icon
                            icon="solar:shop-2-bold-duotone"
                            className="w-8 h-8"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white uppercase tracking-wide leading-tight">
                            Gerona Stall
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                            Management System
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {/* Dashboard */}
                    <Link
                        href={route("dashboard")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 ${
                            route().current("dashboard")
                                ? "bg-blue-700 text-white shadow-sm border-blue-900"
                                : "hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                        }`}
                    >
                        <Icon
                            icon="solar:pie-chart-2-bold-duotone"
                            className="w-6 h-6"
                        />
                        Dashboard
                    </Link>

                    {/* Collapsible Facility Setup Menu */}
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={() =>
                                setFacilityMenuOpen(!facilityMenuOpen)
                            }
                            className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 ${
                                isFacilityRoute
                                    ? "bg-slate-800 text-white border-slate-700"
                                    : "hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    icon="solar:city-bold-duotone"
                                    className="w-6 h-6"
                                />
                                Facility Setup
                            </div>
                            <Icon
                                icon="solar:alt-arrow-down-bold"
                                className={`w-4 h-4 transition-transform duration-200 ${facilityMenuOpen ? "rotate-180 text-white" : "text-slate-500"}`}
                            />
                        </button>

                        {/* Dropdown Children */}
                        {facilityMenuOpen && (
                            <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                {/* Visual left border line to show hierarchy */}
                                <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-700 rounded-full"></div>

                                <Link
                                    href={route("buildings.index")}
                                    className={`flex items-center gap-3 px-10 py-2.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wide ${
                                        route().current("buildings.*")
                                            ? "bg-blue-700 text-white shadow-sm"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    Facility Buildings
                                </Link>
                                <Link
                                    href={route("floors.index")}
                                    className={`flex items-center gap-3 px-10 py-2.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wide ${
                                        route().current("floors.*")
                                            ? "bg-blue-700 text-white shadow-sm"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    Floors & Sections
                                </Link>
                                <Link
                                    href={route("stalls.index")}
                                    className={`flex items-center gap-3 px-10 py-2.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wide ${
                                        route().current("stalls.*")
                                            ? "bg-blue-700 text-white shadow-sm"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    Manage Stalls
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Map Route */}
                    <Link
                        href={route("layouts.mapper")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 ${
                            route().current("layouts.mapper")
                                ? "bg-blue-700 text-white shadow-sm border-blue-900"
                                : "hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                        }`}
                    >
                        <Icon
                            icon="solar:map-bold-duotone"
                            className={`w-6 h-6 ${route().current("layouts.mapper") ? "text-white" : "text-amber-500"}`}
                        />
                        Stall Layout Map
                    </Link>

                    {/* Tenants Route */}
                    <Link
                        href={route("tenants.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 ${
                            route().current("tenants.*")
                                ? "bg-blue-700 text-white shadow-sm border-blue-900"
                                : "hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                        }`}
                    >
                        <Icon
                            icon="solar:users-group-rounded-bold-duotone"
                            className="w-6 h-6"
                        />
                        Manage Tenants
                    </Link>

                    {/* Treasury Route */}
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 border-transparent hover:bg-slate-800 hover:border-slate-700 hover:text-white"
                    >
                        <Icon
                            icon="solar:wallet-bold-duotone"
                            className="w-6 h-6 text-emerald-500"
                        />
                        Treasury & Payments
                    </Link>

                    {/* Users Route */}
                    <Link
                        href={route("users.index")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-black text-sm uppercase tracking-wide border-2 ${
                            route().current("users.*")
                                ? "bg-blue-700 text-white shadow-sm border-blue-900"
                                : "hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                        }`}
                    >
                        <Icon
                            icon="solar:shield-user-bold-duotone"
                            className="w-6 h-6"
                        />
                        Manage Personnel
                    </Link>
                </nav>

                {/* Sidebar Footer (User Info & Logout) */}
                <div className="p-4 border-t-2 border-slate-800 shrink-0 flex flex-col gap-2 bg-slate-950">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black uppercase shrink-0 border-2 border-slate-700 shadow-inner">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-white truncate">
                                {user.name}
                            </span>
                            <span className="text-xs font-bold text-slate-400 truncate">
                                @{user.username || "admin"}
                            </span>
                        </div>
                    </div>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-rose-500 bg-rose-500/10 hover:bg-rose-600 hover:text-white transition-all border-2 border-rose-500/30 hover:border-rose-800 uppercase tracking-wide"
                    >
                        <Icon
                            icon="solar:logout-2-bold-duotone"
                            className="w-5 h-5"
                        />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
                {/* Mobile-Only Top Bar (For Hamburger Menu) */}
                <div className="lg:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b-2 border-slate-300 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-600 hover:text-slate-900 focus:outline-none bg-slate-100 border-2 border-slate-300 p-1.5 rounded-lg transition-colors"
                        >
                            <Icon
                                icon="solar:hamburger-menu-linear"
                                className="w-6 h-6"
                            />
                        </button>
                        <span className="font-black text-slate-900 tracking-tight uppercase">
                            Gerona Stall
                        </span>
                    </div>
                </div>

                {/* Actual Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
