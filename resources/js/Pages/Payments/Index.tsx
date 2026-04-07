import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreatePaymentModal from "./Partials/CreatePaymentModal";
import EditPaymentModal from "./Partials/EditPaymentModal";
import Modal from "@/Components/Modal";

export default function PaymentsIndex({
    payments,
    activeContracts,
    filters,
    stats // Our new KPIs!
}: any) {
    const [search, setSearch] = useState(filters?.search || "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(route("payments.index"), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const confirmDelete = (id: number) => setDeletingId(id);

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("payments.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(route("payments.import"), { file: e.target.files[0] }, {
                preserveScroll: true, forceFormData: true,
                onSuccess: () => { if (fileInputRef.current) fileInputRef.current.value = ""; },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Treasury & Receipts" />

            {/* High-Contrast Delete Confirmation Modal */}
            <Modal show={deletingId !== null} onClose={() => setDeletingId(null)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon icon="solar:danger-triangle-bold" className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Void Receipt?</h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove this Official Receipt? This will reverse the payment in the tenant's ledger.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors">Yes, Void Receipt</button>
                    </div>
                </div>
            </Modal>

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header & Tools Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon icon="solar:wallet-bold-duotone" className="w-7 h-7 text-emerald-600" />
                                Treasury Ledger
                            </h3>
                        </div>
                        <p className="text-sm font-bold text-slate-500">Record payments, issue official receipts, and audit collections.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <a href={route("payments.export")} className="flex items-center justify-center p-2.5 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200 transition-colors shrink-0" title="Export to Excel">
                            <Icon icon="solar:export-bold-duotone" className="w-5 h-5" />
                        </a>
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx, .xls" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center p-2.5 text-amber-700 bg-amber-100 rounded-lg border-2 border-amber-300 hover:bg-amber-200 transition-colors shrink-0" title="Import from Excel">
                            <Icon icon="solar:import-bold-duotone" className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap">
                            <Icon icon="solar:ticket-sale-bold-duotone" className="w-5 h-5" />
                            <span className="hidden sm:inline">Issue Receipt</span>
                        </button>
                    </div>
                </div>

                {/* 🔥 TREASURY KPIS 🔥 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-emerald-50 border-2 border-emerald-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-emerald-200 text-emerald-700 p-3 rounded-xl border border-emerald-300">
                            <Icon icon="solar:wad-of-money-bold-duotone" className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">Today's Collection</p>
                            <p className="text-2xl font-black text-slate-900">₱ {Number(stats.today_collection).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-blue-200 text-blue-700 p-3 rounded-xl border border-blue-300">
                            <Icon icon="solar:calendar-bold-duotone" className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-0.5">Monthly Collection</p>
                            <p className="text-2xl font-black text-slate-900">₱ {Number(stats.month_collection).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-amber-200 text-amber-700 p-3 rounded-xl border border-amber-300">
                            <Icon icon="solar:file-check-bold-duotone" className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Total Receipts Issued</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total_ors}</p>
                        </div>
                    </div>
                </div>

                {/* THE TRANSACTION LEDGER */}
                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b-2 border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h4 className="font-black text-slate-700 uppercase tracking-tight text-sm flex items-center gap-2">
                            <Icon icon="solar:history-bold-duotone" className="w-5 h-5 text-slate-500" />
                            Transaction History
                        </h4>
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="solar:magnifer-bold" className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 border-2 border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-emerald-600 transition-colors"
                                placeholder="Search OR Number, Payer..."
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 border-r border-slate-200 text-center">OR Number</th>
                                    <th className="px-6 py-4 border-r border-slate-200">Payer & Details</th>
                                    <th className="px-6 py-4 border-r border-slate-200 text-right">Amount</th>
                                    <th className="px-6 py-4 border-r border-slate-200 text-center">Period Covered</th>
                                    <th className="px-6 py-4 border-r border-slate-200 text-center">Payment Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            <Icon icon="solar:wallet-money-broken" className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300" />
                                            No payment records found.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment: any) => (
                                        <tr key={payment.id} className="hover:bg-emerald-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-amber-700 text-center border-r border-slate-100 bg-amber-50/30">
                                                {payment.or_number}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <div className="font-black text-slate-900">
                                                    {payment.contract?.tenant?.last_name}, {payment.contract?.tenant?.first_name}
                                                </div>
                                                <div className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <Icon icon="solar:shop-bold" className="text-blue-500" />
                                                    {payment.contract?.stall?.stall_code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-emerald-700 text-right border-r border-slate-100 text-base">
                                                ₱ {Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100">
                                                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold text-[10px] uppercase">
                                                    {payment.month} {payment.year}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100 text-slate-600 font-bold">
                                                {payment.payment_date}
                                                <div className="text-[9px] text-slate-400 mt-1 uppercase">By: {payment.encoder?.name || 'System'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {/* 🔥 NEW PRINT BUTTON 🔥 */}
                                                    <a href={route("payments.print", payment.id)} target="_blank" className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors" title="Print Official Receipt">
                                                        <Icon icon="solar:printer-bold-duotone" className="w-4 h-4" />
                                                    </a>

                                                    <button onClick={() => setEditingPayment(payment)} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" title="Edit">
                                                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => confirmDelete(payment.id)} className="p-1.5 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors" title="Void OR">
                                                        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                    </button>
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

            <CreatePaymentModal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} activeContracts={activeContracts} />
            <EditPaymentModal show={editingPayment !== null} onClose={() => setEditingPayment(null)} payment={editingPayment} />
        </AuthenticatedLayout>
    );
}