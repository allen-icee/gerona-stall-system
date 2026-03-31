import { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import ToastListener from '@/Components/ToastListener';

interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
}

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const user = (usePage().props as any).auth.user as User;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <ToastListener />
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Brand / Logo Area */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800 shrink-0">
                    <div className="bg-yellow-500 text-slate-900 p-2 rounded-xl shadow-inner">
                        <Icon icon="solar:shop-2-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white uppercase tracking-wide leading-tight">
                            Gerona Stall
                        </span>
                        <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
                            Management System
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${route().current('dashboard')
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Icon icon="solar:pie-chart-2-bold-duotone" className="w-6 h-6" />
                        Dashboard
                    </Link>

                    {/* Future Routes Placed Here */}
                    <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold hover:bg-slate-800 hover:text-white">
                        <Icon icon="solar:map-bold-duotone" className="w-6 h-6" />
                        Stall Layout Map
                    </Link>

                    <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold hover:bg-slate-800 hover:text-white">
                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-6 h-6" />
                        Manage Tenants
                    </Link>

                    <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold hover:bg-slate-800 hover:text-white">
                        <Icon icon="solar:wallet-bold-duotone" className="w-6 h-6" />
                        Treasury & Payments
                    </Link>
                    <Link
                        href={route('users.index')}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${route().current('users.*')
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-6 h-6" />
                        Manage Personnel
                    </Link>
                </nav>

                {/* Sidebar Footer (User Info & Logout) */}
                <div className="p-4 border-t border-slate-800 shrink-0 flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase shrink-0 border border-slate-600">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">{user.name}</span>
                            <span className="text-xs text-slate-400 truncate">@{user.username || 'admin'}</span>
                        </div>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 hover:border-transparent"
                    >
                        <Icon icon="solar:logout-2-bold-duotone" className="w-5 h-5" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">

                {/* Mobile-Only Top Bar (For Hamburger Menu) */}
                <div className="lg:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-500 hover:text-slate-800 focus:outline-none bg-slate-100 p-2 rounded-lg transition-colors"
                        >
                            <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6" />
                        </button>
                        <span className="font-extrabold text-slate-800 tracking-tight">Gerona Stall</span>
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