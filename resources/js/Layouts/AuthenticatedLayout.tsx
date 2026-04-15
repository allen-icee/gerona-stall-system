import { useState, useEffect, useRef, PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import ToastListener from "@/Components/ToastListener";
import Modal from "@/Components/Modal";

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { user, permissions = [] } = (usePage().props as any).auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isFacilityRoute =
        route().current("buildings.*") ||
        route().current("floors.*") ||
        route().current("stalls.*");

    const isReportRoute = route().current("reports.*");

    const [facilityMenuOpen, setFacilityMenuOpen] = useState(isFacilityRoute);
    const [reportsMenuOpen, setReportsMenuOpen] = useState(isReportRoute);

    const hasPermission = (perm: string) => permissions.includes(perm);

    // 🔥 THE OJT DEVELOPER EASTER EGG STATE 🔥
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const secretKeys = useRef<string[]>([]);

    // 1. Keyboard Shortcut Listener (typing "devs")
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            secretKeys.current = [
                ...secretKeys.current,
                e.key.toLowerCase(),
            ].slice(-4);
            if (secretKeys.current.join("") === "devs") {
                setShowEasterEgg(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // 2. Click Timer Reset
    useEffect(() => {
        if (clickCount > 0) {
            const timer = setTimeout(() => setClickCount(0), 1000);
            return () => clearTimeout(timer);
        }
    }, [clickCount]);

    // 3. Logo Click Handler
    const handleSecretClick = () => {
        setClickCount((prev) => {
            if (prev + 1 >= 5) {
                setShowEasterEgg(true);
                return 0;
            }
            return prev + 1;
        });
    };

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
                {/* Brand with Easter Egg Trigger */}
                <div className="flex items-center gap-3 px-5 py-6 border-b-2 border-slate-800 bg-slate-950 shrink-0 select-none">
                    <div
                        onClick={handleSecretClick}
                        title="System Core"
                        className="bg-amber-500 text-slate-900 p-2 rounded-xl border-2 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                        <Icon
                            icon="solar:shop-2-bold-duotone"
                            className="w-8 h-8"
                        />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white uppercase leading-tight">
                            Gerona Stall
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                            Management System
                        </div>
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Dashboard */}
                    <Link
                        href={route("dashboard")}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("dashboard")
                                ? "bg-blue-700 text-white border-blue-900 shadow-sm"
                                : "hover:bg-slate-800 hover:text-white border-transparent"
                            }`}
                    >
                        <Icon
                            icon="solar:pie-chart-2-bold-duotone"
                            className="w-6 h-6"
                        />
                        Dashboard
                    </Link>

                    {/* Facility Setup Dropdown */}
                    {hasPermission("manage facilities") && (
                        <div className="flex flex-col space-y-1">
                            <button
                                onClick={() =>
                                    setFacilityMenuOpen(!facilityMenuOpen)
                                }
                                className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${isFacilityRoute
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "hover:bg-slate-800 hover:text-white border-transparent"
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
                                    className={`w-4 h-4 transition-transform ${facilityMenuOpen ? "rotate-180 text-white" : "text-slate-500"}`}
                                />
                            </button>

                            {facilityMenuOpen && (
                                <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                    <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-700 rounded-full"></div>
                                    <Link
                                        href={route("buildings.index")}
                                        className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("buildings.*") ? "bg-blue-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        Buildings
                                    </Link>
                                    <Link
                                        href={route("floors.index")}
                                        className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("floors.*") ? "bg-blue-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        Floors/Sections
                                    </Link>
                                    <Link
                                        href={route("stalls.index")}
                                        className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("stalls.*") ? "bg-blue-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        Stalls
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LGU Reports Dropdown */}
                    {hasPermission("view reports") && (
                        <div className="flex flex-col space-y-1">
                            <button
                                onClick={() =>
                                    setReportsMenuOpen(!reportsMenuOpen)
                                }
                                className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${isReportRoute
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "hover:bg-slate-800 hover:text-white border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        icon="solar:clipboard-list-bold-duotone"
                                        className="w-6 h-6 text-rose-500"
                                    />
                                    LGU Reports
                                </div>
                                <Icon
                                    icon="solar:alt-arrow-down-bold"
                                    className={`w-4 h-4 transition-transform ${reportsMenuOpen ? "rotate-180 text-white" : "text-slate-500"}`}
                                />
                            </button>

                            {reportsMenuOpen && (
                                <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                    <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-700 rounded-full"></div>
                                    <Link
                                        href={route("reports.master_ledger")}
                                        className={`flex items-center gap-3 px-10 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors ${route().current("reports.master_ledger") ? "bg-rose-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        Master Ledger
                                    </Link>
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
                    )}

                    <div className="h-px bg-slate-800 my-4 mx-2"></div>

                    {/* Map */}
                    {hasPermission("manage facilities") && (
                        <Link
                            href={route("layouts.mapper")}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("layouts.mapper") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon
                                icon="solar:map-bold-duotone"
                                className={`w-6 h-6 ${route().current("layouts.mapper") ? "text-white" : "text-amber-500"}`}
                            />
                            Stall Layout Map
                        </Link>
                    )}

                    {/* Tenants */}
                    {hasPermission("manage tenants") && (
                        <Link
                            href={route("tenants.index")}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("tenants.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon
                                icon="solar:users-group-rounded-bold-duotone"
                                className="w-6 h-6"
                            />
                            Manage Tenants
                        </Link>
                    )}

                    {/* Contracts */}
                    {hasPermission("view contracts") && (
                        <Link
                            href={route("contracts.index")}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("contracts.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon
                                icon="solar:document-text-bold-duotone"
                                className="w-6 h-6 text-blue-400"
                            />
                            Lease Contracts
                        </Link>
                    )}

                    {/* Treasury */}
                    {hasPermission("manage payments") && (
                        <Link
                            href={route("payments.index")}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("payments.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon
                                icon="solar:wallet-bold-duotone"
                                className="w-6 h-6 text-emerald-500"
                            />
                            Treasury & Payments
                        </Link>
                    )}

                    {/* Users */}
                    {hasPermission("manage users") && (
                        <Link
                            href={route("users.index")}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase border-2 transition-colors ${route().current("users.*") ? "bg-blue-700 text-white border-blue-900 shadow-sm" : "border-transparent hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon
                                icon="solar:shield-user-bold-duotone"
                                className="w-6 h-6"
                            />
                            Manage Personnel
                        </Link>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t-2 border-slate-800 bg-slate-950 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center text-white font-black rounded-lg">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white font-black text-sm truncate">
                                {user.name}
                            </div>
                            <div className="text-xs text-slate-400 font-bold truncate">
                                @{user.username || "admin"}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 rounded-xl font-black uppercase text-sm tracking-wide hover:bg-rose-600 hover:border-rose-800 hover:text-white transition-all"
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

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* 🔥 DEVELOPER EASTER EGG MODAL (SOLE CREATOR & GOLD STANDARD DESIGN) 🔥 */}
            <Modal
                show={showEasterEgg}
                onClose={() => setShowEasterEgg(false)}
                maxWidth="sm"
            >
                <div className="relative p-8 text-center bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    {/* Gold Standard Gradients */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"></div>

                    <div className="relative">
                        <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200 animate-pulse">
                            <Icon
                                icon="solar:crown-star-bold-duotone"
                                width="40"
                                className="text-white"
                            />
                        </div>
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-gray-900 uppercase tracking-tight">
                        <span className="text-amber-500">System</span>{" "}
                        <span className="text-orange-500">Developer</span>
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        "Shoutout to My Dearest Beloved Miss"
                    </p>

                    <div className="mt-4 space-y-2">
                        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-black text-slate-800 hover:text-amber-600 text-lg uppercase tracking-wide">
                            Allen Icee A. Dequiros
                        </div>
                    </div>

                    <button
                        onClick={() => setShowEasterEgg(false)}
                        className="mt-6 w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-[1.02] text-lg tracking-widest"
                    >
                        ⊂⁠(⁠≽^•⩊•^≼⁠)⁠つ
                    </button>
                </div>
            </Modal>
        </div>
    );
}
