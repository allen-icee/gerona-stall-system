import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Header from "./Dashboard/Header";
import QuickActions from "./Dashboard/QuickActions";
import StatCards from "./Dashboard/StatCards";
import DashboardChart from "./DashboardChart";

export default function Dashboard({
    stats,
    recentActivity,
    expiringContracts,
    buildingSummary, // Injecting our new backend data
}: any) {
    const user = (usePage().props as any).auth.user;

    const total = stats?.total_stalls || 1;
    const occupiedPercent = ((stats?.occupied || 0) / total) * 100;
    const maintenancePercent = ((stats?.maintenance || 0) / total) * 100;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Overview" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Header user={user} />
                <QuickActions />
                <StatCards stats={stats} />
                <DashboardChart />

                {/* 🔥 NEW: THE EXECUTIVE DASHBOARD (EXCEL SUMMARY REPLACEMENT) 🔥 */}
                <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-800">
                        <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-tight">
                            <Icon icon="solar:buildings-bold-duotone" className="w-5 h-5 text-amber-400" />
                            Executive Summary (Status per Building)
                        </h3>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-center text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left border-r-2 border-slate-200 sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Building Name</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-slate-800">Total</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-emerald-600 bg-emerald-50/50">Vacant</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-amber-600">For Contract</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-cyan-600">For Signing</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-fuchsia-600 bg-fuchsia-50/50">Wait Permit</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-slate-500">On Process</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-purple-600">Confirm Permit</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-rose-600 bg-rose-50/50">Unpaid</th>
                                    <th className="px-3 py-3 border-r border-slate-200 text-blue-600">Valid/Signed</th>
                                    <th className="px-3 py-3 text-slate-400">Closed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {buildingSummary && buildingSummary.length > 0 ? (
                                    buildingSummary.map((bldg: any, index: number) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-left font-black text-slate-800 border-r-2 border-slate-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                {bldg.name}
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-100 font-bold">{bldg.total}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 bg-emerald-50/30 text-emerald-700 font-bold">{bldg.vacant}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-amber-700">{bldg.for_contract}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-cyan-700">{bldg.for_signing}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 bg-fuchsia-50/30 text-fuchsia-700 font-bold">{bldg.waiting_permit}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-slate-600">{bldg.on_process}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-purple-700">{bldg.for_confirmation}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 bg-rose-50/30 text-rose-700 font-bold">{bldg.unpaid}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-blue-700 font-bold">{bldg.signed_valid}</td>
                                            <td className="px-3 py-3 text-slate-400">{bldg.closed}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-8 text-center text-slate-400 font-bold">
                                            No building data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Bottom Grids (Recent Activity & Alerts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Recent Activity */}
                    <div className="lg:col-span-2 bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <Icon icon="solar:clipboard-list-bold-duotone" className="w-5 h-5 text-blue-600" />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Stall #</th>
                                        <th className="px-6 py-3">Tenant Name</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {recentActivity && recentActivity.length > 0 ? (
                                        recentActivity.map((activity: any, index: number) => (
                                            <tr key={index} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-800">{activity.stall_code}</td>
                                                <td className="px-6 py-4 text-slate-700">{activity.tenant_name}</td>
                                                <td className="px-6 py-4 text-slate-500">{activity.action}</td>
                                                <td className="px-6 py-4 font-bold text-slate-600">{activity.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-bold">
                                                No recent activity found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Occupancy & Alerts */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-tight">
                                <Icon icon="solar:chart-pie-bold-duotone" className="w-5 h-5 text-blue-600" />
                                Occupancy Rate
                            </h3>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">
                                    {occupiedPercent.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden flex border border-slate-200">
                                <div className="bg-emerald-500 h-3" style={{ width: `${occupiedPercent}%` }}></div>
                                <div className="bg-amber-400 h-3" style={{ width: `${maintenancePercent}%` }}></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Occupied
                                    </div>
                                    <span className="font-black text-slate-900">{stats?.occupied || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div> Vacant
                                    </div>
                                    <span className="font-black text-slate-900">{stats?.vacant || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-rose-900 to-slate-900 border-2 border-slate-800 shadow-lg rounded-2xl p-6 text-white relative overflow-hidden flex-1">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <Icon icon="solar:bell-bing-bold-duotone" className="w-32 h-32" />
                            </div>
                            <h3 className="font-black text-rose-100 flex items-center gap-2 mb-5 relative z-10 uppercase tracking-tight">
                                <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5 text-rose-400" />
                                Action Required
                            </h3>
                            <ul className="space-y-5 relative z-10">
                                {expiringContracts && expiringContracts.length > 0 ? (
                                    expiringContracts.map((contract: any, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="bg-rose-400 w-2.5 h-2.5 rounded-full mt-1 shrink-0 border border-rose-200"></div>
                                            <p className="text-sm font-medium text-rose-50 leading-snug">
                                                Stall <span className="font-black text-white bg-rose-500/30 px-1.5 rounded mx-1 text-rose-100">{contract.stall}</span> expires in <span className="font-black text-white">{contract.days_left} days</span>.
                                            </p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm font-bold text-slate-400 italic">
                                        No contracts expiring within 30 days.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}