import { useState, useEffect, useRef } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreatePaymentModal from "./Partials/CreatePaymentModal";
import EditPaymentModal from "./Partials/EditPaymentModal";
import Modal from "@/Components/Modal";
import ToastListener from "@/Components/ToastListener";

export default function PaymentsIndex({
    payments,
    activeContracts,
    filters,
}: any) {
    const [search, setSearch] = useState(filters?.search || "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Confirmation State
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Debounced Search Logic
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route("payments.index"),
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("payments.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    // Import Handling
    const { post: postImport, processing: importing } = useForm({
        file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            postImport(route("payments.import"), {
                preserveScroll: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                },
            });
        }
    };

    const totalPayments = payments.total || payments.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="Treasury & Payments" />
            <ToastListener />

            {/* High-Contrast Delete Confirmation Modal */}
            <Modal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                maxWidth="sm"
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon
                            icon="solar:danger-triangle-bold"
                            className="h-8 w-8 text-rose-600"
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        Delete Receipt?
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to permanently delete this
                        Official Receipt (OR) record from the ledger?
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setDeletingId(null)}
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                        >
                            Yes, Delete OR
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Header & Tools Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Title & Count Tracker */}
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:wallet-bold-duotone"
                                    className="w-7 h-7 text-emerald-600"
                                />
                                Treasury Ledger
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200">
                                {totalPayments}{" "}
                                {totalPayments === 1 ? "Record" : "Records"}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Record and monitor Official Receipts (OR) for tenant
                            rent.
                        </p>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
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
                                className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-emerald-600 transition-colors"
                                placeholder="Search OR, Month, Year..."
                            />
                        </div>

                        <a
                            href={route("payments.export")}
                            className="flex items-center justify-center p-2.5 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200 transition-colors shrink-0"
                            title="Export to Excel"
                        >
                            <Icon
                                icon="solar:export-bold-duotone"
                                className="w-5 h-5"
                            />
                        </a>

                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="flex items-center justify-center p-2.5 text-amber-700 bg-amber-100 rounded-lg border-2 border-amber-300 hover:bg-amber-200 transition-colors disabled:opacity-50 shrink-0"
                            title="Import from Excel"
                        >
                            <Icon
                                icon="solar:import-bold-duotone"
                                className="w-5 h-5"
                            />
                        </button>

                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap"
                        >
                            <Icon
                                icon="solar:wallet-money-bold-duotone"
                                className="w-5 h-5"
                            />
                            <span className="hidden sm:inline">
                                Record Payment
                            </span>
                        </button>
                    </div>
                </div>

                {/* Unified Table Card */}
                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        OR Number
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Payer / Stall
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Coverage
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Date Paid
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:wallet-broken"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300"
                                            />
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment: any) => (
                                        <tr
                                            key={payment.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-black text-emerald-700 border-r border-slate-200 text-center">
                                                #{payment.or_number}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-200">
                                                <div className="font-bold text-slate-900">
                                                    {payment.tenant?.first_name}{" "}
                                                    {payment.tenant?.last_name}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-wide">
                                                    {payment.stall?.stall_code}{" "}
                                                    -{" "}
                                                    {
                                                        payment.stall?.building
                                                            ?.name
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-200">
                                                <span className="bg-amber-100 border-2 border-amber-200 text-amber-800 px-2 py-1 rounded font-black text-[10px] tracking-wider">
                                                    {payment.month}{" "}
                                                    {payment.year}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 text-center border-r border-slate-200">
                                                {payment.payment_date}
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900 text-center border-r border-slate-200">
                                                ₱{" "}
                                                {Number(
                                                    payment.amount,
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setEditingPayment(
                                                                payment,
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-bold"
                                                            className="w-4 h-4"
                                                        />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(
                                                                payment.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border-2 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            className="w-4 h-4"
                                                        />
                                                        Delete
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

            {/* Render Modals */}
            <CreatePaymentModal
                show={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                activeContracts={activeContracts}
            />
            <EditPaymentModal
                show={editingPayment !== null}
                onClose={() => setEditingPayment(null)}
                payment={editingPayment}
            />
        </AuthenticatedLayout>
    );
}
