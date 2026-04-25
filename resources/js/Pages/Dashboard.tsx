import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

export default function Dashboard({
    stats,
    recentActivity,
    expiringContracts,
    buildingSummary,
    userRole,
    serverIp,
}: any) {
    const user = (usePage().props as any).auth.user;
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = currentTime.getHours();
    let greeting = "Good Evening";
    let greetingIcon = "solar:moon-stars-bold-duotone";
    let iconColor = "text-indigo-500 bg-indigo-50";

    if (hour < 12) {
        greeting = "Good Morning";
        greetingIcon = "solar:sunrise-bold-duotone";
        iconColor = "text-yellow-500 bg-yellow-50";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
        greetingIcon = "solar:sun-bold-duotone";
        iconColor = "text-orange-500 bg-orange-50";
    }

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Overview" />

            <div className="py-6 sm:py-12 max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 1. LAN SERVER STATUS HEADER (Admins Only) */}
                {userRole === "admin" && (
                    <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto text-center sm:text-left">
                                <div className="p-3 bg-white/10 rounded-full shrink-0 hidden sm:block">
                                    <Icon
                                        icon="solar:server-square-bold"
                                        width="32"
                                    />
                                </div>
                                <div className="w-full">
                                    <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                                        Stall System Server Online
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                    </h3>
                                    <p className="text-emerald-100 text-sm mt-1">
                                        Tell network devices to connect to:{" "}
                                        <span className="font-mono bg-black/30 px-2 py-1 rounded select-all font-bold text-yellow-300">
                                            http://{serverIp}:8000
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-center sm:text-right mt-2 sm:mt-0">
                                <div className="text-xs sm:text-sm font-medium text-emerald-200 uppercase tracking-widest mb-0.5">
                                    {currentTime.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                                <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-wide text-white">
                                    {currentTime.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. GREETING BANNER */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-blue-900">
                    <div className="p-6 text-gray-900 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-blue-900">
                                {greeting}, {user.name}!
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Welcome to the Gerona Stall Management System.
                            </p>
                        </div>
                        <div
                            className={`hidden sm:flex items-center justify-center p-4 rounded-full ${iconColor}`}
                        >
                            <Icon icon={greetingIcon} width="42" />
                        </div>
                    </div>
                </div>

                {/* 3. QUICK ACTIONS */}
                <h3 className="text-lg font-bold text-gray-700 px-1 pt-2">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link
                        href={route("payments.index")}
                        className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all"
                    >
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Icon
                                icon="solar:ticket-sale-bold-duotone"
                                width="28"
                            />
                        </div>
                        <span className="font-bold text-sm text-gray-700 group-hover:text-emerald-900">
                            Issue Receipt
                        </span>
                    </Link>

                    <Link
                        href={route("contracts.index")}
                        className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all"
                    >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Icon
                                icon="solar:document-add-bold-duotone"
                                width="28"
                            />
                        </div>
                        <span className="font-bold text-sm text-gray-700 group-hover:text-blue-900">
                            Draft Contract
                        </span>
                    </Link>

                    <Link
                        href={route("tenants.index")}
                        className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all"
                    >
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Icon
                                icon="solar:user-plus-bold-duotone"
                                width="28"
                            />
                        </div>
                        <span className="font-bold text-sm text-gray-700 group-hover:text-orange-900">
                            Register Tenant
                        </span>
                    </Link>

                    <Link
                        href={route("layouts.mapper")}
                        className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all"
                    >
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Icon
                                icon="solar:map-point-bold-duotone"
                                width="28"
                            />
                        </div>
                        <span className="font-bold text-sm text-gray-700 group-hover:text-purple-900">
                            Map Layout
                        </span>
                    </Link>
                </div>

                {/* 4. EXECUTIVE SUMMARY (BUILDING TABLE) */}
                <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
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

                {/* 5. RECENT ACTIVITY & EXPIRING CONTRACTS */}
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
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {recentActivity?.map(
                                        (activity: any, index: number) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-black text-slate-800 border-r border-slate-100">
                                                    {activity.stall_code}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 border-r border-slate-100">
                                                    {activity.tenant_name}
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
                                                    {contract.days_left} days
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
        </AuthenticatedLayout>
    );
}
