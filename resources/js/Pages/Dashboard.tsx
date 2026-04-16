//resources\js\Pages\Dashboard.tsx
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
    buildingSummary,
    userRole,
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

                {userRole === "admin" && (
                    <>
                        <QuickActions />
                        <StatCards stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2">
                                <DashboardChart />
                            </div>
                            <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-tight">
                                    <Icon
                                        icon="solar:chart-pie-bold-duotone"
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    Global Occupancy
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
                                        style={{
                                            width: `${maintenancePercent}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="space-y-3 mt-auto">
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
                                            Maint/Wait
                                        </div>
                                        <span className="font-black text-slate-900">
                                            {stats?.maintenance || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
                            <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-800">
                                <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-tight">
                                    <Icon
                                        icon="solar:buildings-bold-duotone"
                                        className="w-5 h-5 text-amber-400"
                                    />
                                    Executive Summary (Status per Building)
                                </h3>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-center text-sm whitespace-nowrap">
                                    <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left border-r-2 border-slate-200 sticky left-0 bg-slate-100 z-10">
                                                Building Name
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-slate-800">
                                                Total
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-emerald-600 bg-emerald-50/50">
                                                Vacant
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-amber-600">
                                                For Contract
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-cyan-600">
                                                For Signing
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-fuchsia-600 bg-fuchsia-50/50">
                                                Wait Permit
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-slate-500">
                                                On Process
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-purple-600">
                                                Confirm Permit
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-rose-600 bg-rose-50/50">
                                                Unpaid
                                            </th>
                                            <th className="px-3 py-3 border-r border-slate-200 text-blue-600">
                                                Valid/Signed
                                            </th>
                                            <th className="px-3 py-3 text-slate-400">
                                                Closed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {buildingSummary?.map(
                                            (bldg: any, index: number) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-slate-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-left font-black text-slate-800 border-r-2 border-slate-200 sticky left-0 bg-white z-10">
                                                        {bldg.name}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 font-bold">
                                                        {bldg.total}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 bg-emerald-50/30 text-emerald-700 font-bold">
                                                        {bldg.vacant}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 text-amber-700">
                                                        {bldg.for_contract}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 text-cyan-700">
                                                        {bldg.for_signing}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 bg-fuchsia-50/30 text-fuchsia-700 font-bold">
                                                        {bldg.waiting_permit}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 text-slate-600">
                                                        {bldg.on_process}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 text-purple-700">
                                                        {bldg.for_confirmation}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 bg-rose-50/30 text-rose-700 font-bold">
                                                        {bldg.unpaid}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-100 text-blue-700 font-bold">
                                                        {bldg.signed_valid}
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-400">
                                                        {bldg.closed}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {userRole === "treasury" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="bg-emerald-200 text-emerald-700 p-4 rounded-xl border border-emerald-300">
                                    <Icon
                                        icon="solar:wad-of-money-bold-duotone"
                                        className="w-8 h-8"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">
                                        Today's Collection
                                    </p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ₱{" "}
                                        {Number(
                                            stats.today_collection,
                                        ).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="bg-blue-200 text-blue-700 p-4 rounded-xl border border-blue-300">
                                    <Icon
                                        icon="solar:calendar-bold-duotone"
                                        className="w-8 h-8"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-0.5">
                                        Monthly Collection
                                    </p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ₱{" "}
                                        {Number(
                                            stats.month_collection,
                                        ).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="bg-amber-200 text-amber-700 p-4 rounded-xl border border-amber-300">
                                    <Icon
                                        icon="solar:file-check-bold-duotone"
                                        className="w-8 h-8"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                                        Total Receipts Issued
                                    </p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {stats.total_ors.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2">
                                <DashboardChart />
                            </div>
                            <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <Icon
                                    icon="solar:ticket-sale-bold-duotone"
                                    className="w-20 h-20 text-emerald-500 mb-4 opacity-50"
                                />
                                <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight mb-2">
                                    Quick Actions
                                </h3>
                                <p className="text-sm font-bold text-slate-500 mb-6">
                                    Need to issue an official receipt or view
                                    the Master Ledger?
                                </p>
                                <a
                                    href={route("payments.index")}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-sm px-5 py-3 rounded-lg shadow-sm transition-colors border-b-4 border-emerald-800 flex justify-center items-center gap-2 mb-3"
                                >
                                    <Icon
                                        icon="solar:add-square-bold"
                                        className="w-5 h-5"
                                    />{" "}
                                    Issue New O.R.
                                </a>
                                <a
                                    href={route("reports.master_ledger")}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-sm px-5 py-3 rounded-lg shadow-sm transition-colors border-b-4 border-slate-900 flex justify-center items-center gap-2"
                                >
                                    <Icon
                                        icon="solar:database-bold-duotone"
                                        className="w-5 h-5"
                                    />{" "}
                                    Master Ledger
                                </a>
                            </div>
                        </div>
                    </>
                )}

                {userRole === "staff" && (
                    <>
                        <StatCards stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                                <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                        <Icon
                                            icon="solar:clipboard-list-bold-duotone"
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        Recent Administrative Activity
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 border-r border-slate-200">
                                                    Stall #
                                                </th>
                                                <th className="px-6 py-3 border-r border-slate-200">
                                                    Tenant Name
                                                </th>
                                                <th className="px-6 py-3 border-r border-slate-200">
                                                    Action
                                                </th>
                                                <th className="px-6 py-3">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {recentActivity?.map(
                                                (
                                                    activity: any,
                                                    index: number,
                                                ) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-blue-50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 font-black text-slate-800 border-r border-slate-100">
                                                            {
                                                                activity.stall_code
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 border-r border-slate-100">
                                                            {
                                                                activity.tenant_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 border-r border-slate-100">
                                                            {activity.action}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-slate-600">
                                                            {activity.date}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

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
                                    Expiring Contracts Alert
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
                                                        </span>{" "}
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
                                            No contracts expiring within 30
                                            days.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
