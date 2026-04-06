import { Head } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function BalancesReport({ balances }: any) {
    return (
        <AuthenticatedLayout>
            <Head title="Balances Report" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header & Export Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon icon="solar:wallet-money-bold-duotone" className="w-7 h-7 text-rose-600" />
                                Delinquent Accounts & Balances
                            </h3>
                            <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-black border-2 border-rose-200">
                                {balances.length} Active {balances.length === 1 ? "Record" : "Records"}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Tenants currently owing monthly rent or missing required security deposits.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={route('reports.balances.export')}
                            className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 text-emerald-800 font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap"
                        >
                            <Icon icon="solar:export-bold-duotone" className="w-5 h-5" />
                            Export to Excel (.CSV)
                        </a>
                    </div>
                </div>

                {/* The Data Table */}
                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-800 text-slate-300 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-900">
                                <tr>
                                    <th className="px-4 py-3 border-r border-slate-700">Tenant Name</th>
                                    <th className="px-4 py-3 border-r border-slate-700 text-center">Stall & Location</th>
                                    <th className="px-4 py-3 border-r border-slate-700 text-right">Missing Deposit</th>
                                    <th className="px-4 py-3 border-r border-slate-700 text-right">Outstanding Rent</th>
                                    <th className="px-4 py-3 border-r-2 border-slate-700 text-right text-rose-400 bg-rose-900/30">Total Debt</th>
                                    <th className="px-4 py-3 text-center">Last Payment Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {balances.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold bg-slate-50">
                                            <Icon icon="solar:check-circle-bold-duotone" className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-500" />
                                            <p className="text-emerald-700">All accounts are fully paid! No outstanding balances.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    balances.map((record: any) => (
                                        <tr key={record.id} className="hover:bg-rose-50/50 transition-colors">
                                            <td className="px-4 py-4 font-black text-slate-900 border-r border-slate-200">
                                                {record.tenant_name}
                                            </td>
                                            <td className="px-4 py-4 text-center border-r border-slate-200">
                                                <div className="font-bold text-blue-700">{record.stall_code}</div>
                                                <div className="text-[10px] text-slate-500">{record.location}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right border-r border-slate-200 font-bold text-slate-600">
                                                {record.deposit_variance > 0 ? (
                                                    <span className="text-amber-600">₱ {Number(record.deposit_variance).toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-emerald-500 text-[10px] uppercase">Cleared</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right border-r border-slate-200 font-bold text-slate-600">
                                                {record.outstanding_rent > 0 ? (
                                                    <span className="text-rose-600">₱ {Number(record.outstanding_rent).toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-emerald-500 text-[10px] uppercase">Cleared</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right border-r-2 border-slate-200 font-black text-rose-700 bg-rose-50/30 text-base">
                                                ₱ {Number(record.total_outstanding).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">
                                                {record.last_payment_date}
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