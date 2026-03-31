import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
}

export default function Dashboard() {
    // Grab the logged-in user so we can greet them
    const user = (usePage().props as any).auth.user as User;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Overview" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>. Here is the current status of the market.
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm">
                            <Icon icon="solar:printer-bold-duotone" className="w-5 h-5 text-slate-400" />
                            Print Report
                        </button>
                        <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all text-sm">
                            <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
                            New Tenant
                        </button>
                    </div>
                </div>

                {/* KPI STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {/* Card 1: Total Stalls */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <Icon icon="solar:shop-bold-duotone" className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Stalls</div>
                            <div className="text-3xl font-black text-slate-800">150</div>
                        </div>
                    </div>

                    {/* Card 2: Occupied */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                            <Icon icon="solar:check-circle-bold-duotone" className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Occupied</div>
                            <div className="text-3xl font-black text-emerald-600">124</div>
                        </div>
                    </div>

                    {/* Card 3: Vacant */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-rose-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                            <Icon icon="solar:close-circle-bold-duotone" className="w-7 h-7 text-rose-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vacant</div>
                            <div className="text-3xl font-black text-rose-600">20</div>
                        </div>
                    </div>

                    {/* Card 4: Under Maintenance */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="w-7 h-7 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Maintenance</div>
                            <div className="text-3xl font-black text-amber-600">6</div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (Wider) - Recent Activity */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Icon icon="solar:clipboard-list-bold-duotone" className="w-5 h-5 text-blue-600" />
                                Recent Activity
                            </h3>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Stall #</th>
                                        <th className="px-6 py-3">Tenant Name</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {/* Mock Row 1 */}
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">A-12</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">Juan Dela Cruz</td>
                                        <td className="px-6 py-4 text-slate-500">Contract Renewed</td>
                                        <td className="px-6 py-4 text-slate-500">Oct 24, 2026</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">Active</span>
                                        </td>
                                    </tr>
                                    {/* Mock Row 2 */}
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">B-05</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">Maria Santos</td>
                                        <td className="px-6 py-4 text-slate-500">Payment Received</td>
                                        <td className="px-6 py-4 text-slate-500">Oct 23, 2026</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">Active</span>
                                        </td>
                                    </tr>
                                    {/* Mock Row 3 */}
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">C-18</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">--</td>
                                        <td className="px-6 py-4 text-slate-500">Scheduled for Repair</td>
                                        <td className="px-6 py-4 text-slate-500">Oct 22, 2026</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">Maint.</span>
                                        </td>
                                    </tr>
                                    {/* Mock Row 4 */}
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">D-01</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">Pedro Reyes</td>
                                        <td className="px-6 py-4 text-slate-500">Contract Expired</td>
                                        <td className="px-6 py-4 text-slate-500">Oct 20, 2026</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">Vacant</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Narrow) - Occupancy Chart/Info */}
                    <div className="space-y-6">
                        {/* Occupancy Progress */}
                        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <Icon icon="solar:chart-pie-bold-duotone" className="w-5 h-5 text-blue-600" />
                                Occupancy Rate
                            </h3>

                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-black text-slate-800">82.6%</span>
                                <span className="text-sm font-bold text-emerald-500 flex items-center">
                                    <Icon icon="solar:trend-up-bold" className="w-4 h-4 mr-1" />
                                    +2.1%
                                </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden flex">
                                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '82.6%' }}></div>
                                <div className="bg-amber-400 h-3" style={{ width: '4%' }}></div>
                                {/* Remaining is vacant (gray) */}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Occupied
                                    </div>
                                    <span className="font-bold text-slate-800">124</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div> Vacant
                                    </div>
                                    <span className="font-bold text-slate-800">20</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div> Maintenance
                                    </div>
                                    <span className="font-bold text-slate-800">6</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Alerts */}
                        <div className="bg-gradient-to-br from-blue-900 to-slate-900 border border-slate-800 shadow-lg rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <Icon icon="solar:bell-bing-bold-duotone" className="w-32 h-32" />
                            </div>
                            <h3 className="font-bold text-blue-100 flex items-center gap-2 mb-4 relative z-10">
                                <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5 text-yellow-400" />
                                Action Required
                            </h3>
                            <ul className="space-y-4 relative z-10">
                                <li className="flex items-start gap-3">
                                    <div className="bg-rose-500 w-2 h-2 rounded-full mt-1.5 shrink-0"></div>
                                    <p className="text-sm font-medium text-blue-50 leading-snug">
                                        <span className="font-bold text-white">3 contracts</span> are expiring in the next 30 days.
                                    </p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-yellow-400 w-2 h-2 rounded-full mt-1.5 shrink-0"></div>
                                    <p className="text-sm font-medium text-blue-50 leading-snug">
                                        Stall <span className="font-bold text-white">C-18</span> maintenance is scheduled to finish today.
                                    </p>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}