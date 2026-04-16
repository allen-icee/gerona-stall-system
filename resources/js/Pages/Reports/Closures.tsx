//resources\js\Pages\Reports\Closures.tsx
import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CustomSelect from "@/Components/CustomSelect";

export default function ClosuresReport({
    closures,
    buildings,
    stalls,
    filters,
}: any) {
    const [search, setSearch] = useState(filters?.search || "");
    const [sortFilter, setSortFilter] = useState(
        filters?.sort
            ? `${filters.sort}_${filters.direction}`
            : "total_outstanding_desc",
    );
    const [filterBuilding, setFilterBuilding] = useState(
        filters?.building_id || "",
    );
    const [filterStall, setFilterStall] = useState(filters?.stall_id || "");

    const sortOptions = [
        { value: "total_outstanding_desc", label: "Highest Debt First" },
        { value: "tenant_name_asc", label: "Tenant Name (A-Z)" },
        { value: "stall_code_asc", label: "Stall Code (A-Z)" },
    ];

    const buildingOptions = [
        { value: "", label: "All Buildings" },
        ...(buildings || []).map((b: any) => ({ value: b.id, label: b.name })),
    ];
    const stallOptions = [
        { value: "", label: "All Stalls" },
        ...(stalls || []).map((s: any) => ({
            value: s.id,
            label: s.stall_code,
        })),
    ];

    useEffect(() => {
        const delay = setTimeout(() => {
            const [sortBy, filterDirection] = sortFilter.split("_");
            router.get(
                route("reports.closures"),
                {
                    search,
                    sort: sortBy,
                    direction: filterDirection,
                    building_id: filterBuilding,
                    stall_id: filterStall,
                },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search, sortFilter, filterBuilding, filterStall]);

    return (
        <AuthenticatedLayout>
            <Head title="Action Required: Closures" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:danger-triangle-bold-duotone"
                                    className="w-7 h-7 text-red-600"
                                />
                                Action Required: Closures
                            </h3>
                            <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-black border-2 border-red-200">
                                {closures.length}{" "}
                                {closures.length === 1 ? "Alert" : "Alerts"}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Tenants flagged for severe delinquency (&gt;₱10k) or
                            closed business permits.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border-2 border-red-200 shadow-sm">
                    <div className="w-48 z-30">
                        <CustomSelect
                            value={sortFilter}
                            onChange={setSortFilter}
                            options={sortOptions}
                            theme="rose"
                        />
                    </div>
                    <div className="w-48 z-20">
                        <CustomSelect
                            value={filterBuilding}
                            onChange={setFilterBuilding}
                            options={buildingOptions}
                            placeholder="Filter Building"
                            theme="rose"
                        />
                    </div>
                    <div className="w-36 z-10">
                        <CustomSelect
                            value={filterStall}
                            onChange={setFilterStall}
                            options={stallOptions}
                            placeholder="Filter Stall"
                            theme="rose"
                        />
                    </div>

                    <div className="relative flex-1 min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon
                                icon="solar:magnifer-bold"
                                className="h-5 w-5 text-slate-400"
                            />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-red-600 transition-colors"
                            placeholder="Search Tenant..."
                        />
                    </div>
                </div>

                <div className="bg-white border-2 border-red-300 shadow-lg shadow-red-100 rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-red-900 text-red-100 font-black uppercase text-[10px] tracking-wider border-b-2 border-red-950">
                                <tr>
                                    <th className="px-4 py-3 border-r border-red-800 text-center w-16">
                                        Alert
                                    </th>
                                    <th className="px-4 py-3 border-r border-red-800 text-center">
                                        Tenant Name
                                    </th>
                                    <th className="px-4 py-3 border-r border-red-800 text-center">
                                        Stall Code
                                    </th>
                                    <th className="px-4 py-3 border-r border-red-800 text-center">
                                        Permit Status
                                    </th>
                                    <th className="px-4 py-3 border-r border-red-800 text-center">
                                        Total Debt
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Closure Reason / Trigger
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-red-100">
                                {closures.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-slate-400 font-bold bg-slate-50"
                                        >
                                            <Icon
                                                icon="solar:shield-check-bold-duotone"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-500"
                                            />
                                            <p className="text-emerald-700">
                                                No critical alerts. Operations
                                                are running smoothly.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    closures.map((record: any) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-red-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-center border-r border-red-100">
                                                {record.severity ===
                                                "critical" ? (
                                                    <span
                                                        title="Critical"
                                                        className="inline-flex justify-center w-full"
                                                    >
                                                        <Icon
                                                            icon="solar:shield-warning-bold"
                                                            className="w-6 h-6 text-red-700 animate-pulse"
                                                        />
                                                    </span>
                                                ) : (
                                                    <span
                                                        title="High Risk"
                                                        className="inline-flex justify-center w-full"
                                                    >
                                                        <Icon
                                                            icon="solar:danger-triangle-bold"
                                                            className="w-6 h-6 text-amber-500"
                                                        />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-black text-slate-900 border-r border-red-100 text-center">
                                                {record.tenant_name}
                                            </td>
                                            <td className="px-4 py-4 text-center border-r border-red-100 font-bold text-blue-700">
                                                {record.stall_code}
                                            </td>
                                            <td className="px-4 py-4 text-center border-r border-red-100">
                                                <span
                                                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border ${record.permit_status === "Closed" ? "bg-red-100 text-red-800 border-red-300" : "bg-slate-100 text-slate-600 border-slate-300"}`}
                                                >
                                                    {record.permit_status ||
                                                        "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center border-r border-red-100 font-black text-red-700 text-base">
                                                ₱{" "}
                                                {Number(
                                                    record.total_outstanding,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 font-bold text-slate-700 text-center">
                                                <div
                                                    className={`text-xs px-3 py-1.5 rounded inline-block ${record.severity === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
                                                >
                                                    {record.reason}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
