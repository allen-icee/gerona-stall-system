import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Header from "./Dashboard/Header";
import QuickActions from "./Dashboard/QuickActions";
import StatCards from "./Dashboard/StatCards";
import DashboardChart from "./DashboardChart"; // Using your existing working chart file!

export default function Dashboard({
    stats,
    recentActivity,
    expiringContracts,
    revenueData,
}: any) {
    const user = (usePage().props as any).auth.user;

    // Calculate dynamic occupancy percentage
    const total = stats?.total_stalls || 1; // prevent divide by zero
    const occupiedPercent = ((stats?.occupied || 0) / total) * 100;
    const maintenancePercent = ((stats?.maintenance || 0) / total) * 100;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Overview" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* 1. Header with Philippine Time */}
                <Header user={user} />

                {/* 2. DEDICATED QUICK ACTIONS (New!) */}
                <QuickActions />

                {/* 3. Top Statistics Cards (Dynamic Data) */}
                <StatCards stats={stats} />

                {/* 4. Recharts Analytics (Pass dynamic revenueData here if your chart supports it, or let it use its internal mock for now) */}
                <DashboardChart />

                {/* 5. Bottom Grids (Dynamic Tables & Alerts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Recent Activity */}
                    <div className="lg:col-span-2 bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <Icon
                                    icon="solar:clipboard-list-bold-duotone"
                                    className="w-5 h-5 text-blue-600"
                                />
                                Recent Activity
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-xs tracking-wider border-b-2 border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Stall #</th>
                                        <th className="px-6 py-3">
                                            Tenant Name
                                        </th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {recentActivity &&
                                    recentActivity.length > 0 ? (
                                        recentActivity.map(
                                            (activity: any, index: number) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-blue-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-black text-slate-800">
                                                        {activity.stall_code}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-700">
                                                        {activity.tenant_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {activity.action}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-600">
                                                        {activity.date}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-slate-400 font-bold"
                                            >
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
                        {/* Occupancy Progress */}
                        <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-tight">
                                <Icon
                                    icon="solar:chart-pie-bold-duotone"
                                    className="w-5 h-5 text-blue-600"
                                />
                                Occupancy Rate
                            </h3>

                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">
                                    {occupiedPercent.toFixed(1)}%
                                </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden flex border border-slate-200">
                                <div
                                    className="bg-emerald-500 h-3"
                                    style={{ width: `${occupiedPercent}%` }}
                                ></div>
                                <div
                                    className="bg-amber-400 h-3"
                                    style={{ width: `${maintenancePercent}%` }}
                                ></div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                                        Occupied
                                    </div>
                                    <span className="font-black text-slate-900">
                                        {stats?.occupied || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>{" "}
                                        Vacant
                                    </div>
                                    <span className="font-black text-slate-900">
                                        {stats?.vacant || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>{" "}
                                        Maintenance
                                    </div>
                                    <span className="font-black text-slate-900">
                                        {stats?.maintenance || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Alerts (Dynamic) */}
                        <div className="bg-gradient-to-br from-rose-900 to-slate-900 border-2 border-slate-800 shadow-lg rounded-2xl p-6 text-white relative overflow-hidden flex-1">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <Icon
                                    icon="solar:bell-bing-bold-duotone"
                                    className="w-32 h-32"
                                />
                            </div>
                            <h3 className="font-black text-rose-100 flex items-center gap-2 mb-5 relative z-10 uppercase tracking-tight">
                                <Icon
                                    icon="solar:bell-bing-bold-duotone"
                                    className="w-5 h-5 text-rose-400"
                                />
                                Action Required
                            </h3>
                            <ul className="space-y-5 relative z-10">
                                {expiringContracts &&
                                expiringContracts.length > 0 ? (
                                    expiringContracts.map(
                                        (contract: any, index: number) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="bg-rose-400 w-2.5 h-2.5 rounded-full mt-1 shrink-0 border border-rose-200"></div>
                                                <p className="text-sm font-medium text-rose-50 leading-snug">
                                                    Stall{" "}
                                                    <span className="font-black text-white bg-rose-500/30 px-1.5 rounded mx-1 text-rose-100">
                                                        {contract.stall}
                                                    </span>
                                                    expires in{" "}
                                                    <span className="font-black text-white">
                                                        {contract.days_left}{" "}
                                                        days
                                                    </span>
                                                    .
                                                </p>
                                            </li>
                                        ),
                                    )
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
