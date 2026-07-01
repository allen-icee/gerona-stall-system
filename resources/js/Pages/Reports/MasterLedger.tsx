//resources\js\Pages\Reports\MasterLedger.tsx
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function MasterLedger({ ledger, ledgerData }: any) {
    // For local dev, fallback to empty array if props aren't passed yet
    const reportData = ledgerData || ledger;
    const data = Array.isArray(reportData) ? reportData : reportData?.data || [];

    const handleExport = () => {
        window.location.href = route("reports.master_ledger.export");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Ledger" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:book-bookmark-bold-duotone"
                                    className="w-7 h-7 text-rose-700"
                                />
                                Master Ledger Report
                            </h3>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Comprehensive overview of all rental payments,
                            penalties, and ORs.
                        </p>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-200 font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                    >
                        <Icon
                            icon="solar:export-bold-duotone"
                            className="w-5 h-5"
                        />
                        Export Ledger
                    </button>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Month Paid
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-rose-700">
                                        O.R. Number
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300">
                                        Market Stall
                                    </th>
                                    <th className="px-6 py-4">Penalty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-12 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:ghost-broken"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300"
                                            />
                                            No ledger records found for this
                                            period.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((record: any, index: number) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-rose-50 transition-colors font-bold text-slate-700"
                                        >
                                            <td className="px-6 py-4 border-r border-slate-200">
                                                {record.month_paid}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200 text-emerald-600 font-black">
                                                ₱{record.price}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200">
                                                {record.date}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200 font-black text-rose-600">
                                                {record.or_number}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200 text-slate-900">
                                                {record.name}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200">
                                                {record.location}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-200 text-blue-700 font-black">
                                                {record.stall}
                                            </td>
                                            <td className="px-6 py-4 text-rose-500 font-black">
                                                ₱{record.penalty}
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
