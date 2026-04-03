import { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";

export default function PaymentsIndex({ payments, activeContracts }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            contract_id: "",
            amount: "",
            payment_date: new Date().toISOString().split("T")[0], // Defaults to today
            month: "",
            year: new Date().getFullYear(),
            or_number: "",
        });

    // Auto-fill the amount when a contract is selected
    useEffect(() => {
        if (data.contract_id) {
            const selectedContract = activeContracts.find(
                (c: any) => c.id == data.contract_id,
            );
            if (selectedContract) {
                setData("amount", selectedContract.monthly_rent);
            }
        }
    }, [data.contract_id]);

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("payments.store"), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const months = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Treasury & Payments" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            Treasury Ledger
                        </h3>
                        <p className="text-sm font-bold text-slate-500">
                            Record and monitor Official Receipts (OR)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        <Icon
                            icon="solar:wallet-money-bold-duotone"
                            className="w-5 h-5"
                        />
                        Record Payment
                    </button>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">OR Number</th>
                                <th className="px-6 py-4">Payer / Stall</th>
                                <th className="px-6 py-4">Coverage</th>
                                <th className="px-6 py-4">Date Paid</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">
                                    Cashier
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length > 0 ? (
                                payments.data.map((payment: any) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-black text-emerald-700">
                                            #{payment.or_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">
                                                {payment.tenant?.first_name}{" "}
                                                {payment.tenant?.last_name}
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wide">
                                                {payment.stall?.stall_code} -{" "}
                                                {payment.stall?.building?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-black text-[10px] tracking-wider">
                                                {payment.month} {payment.year}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {payment.payment_date}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900 text-right">
                                            ₱{" "}
                                            {Number(
                                                payment.amount,
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                <Icon
                                                    icon="solar:user-id-bold-duotone"
                                                    className="w-3.5 h-3.5 text-slate-400"
                                                />
                                                {
                                                    payment.encoder?.name.split(
                                                        " ",
                                                    )[0]
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-slate-400 font-bold"
                                    >
                                        <Icon
                                            icon="solar:wallet-broken"
                                            className="w-12 h-12 mx-auto mb-2 opacity-50"
                                        />
                                        No payments recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Payment Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={closeCreateModal}
                maxWidth="2xl"
            >
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon
                            icon="solar:wallet-money-bold-duotone"
                            className="w-6 h-6 text-emerald-600"
                        />
                        Issue Official Receipt
                    </h2>
                </div>

                <form
                    onSubmit={submitCreate}
                    className="p-6 space-y-5 bg-white"
                >
                    {/* Select Contract/Payer */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Find Active Contract / Tenant
                        </label>
                        <select
                            value={data.contract_id}
                            onChange={(e) =>
                                setData("contract_id", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0"
                            required
                        >
                            <option value="">-- Select Payer --</option>
                            {activeContracts.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.tenant?.first_name} {c.tenant?.last_name}{" "}
                                    | {c.stall?.stall_code} -{" "}
                                    {c.stall?.building?.name}
                                </option>
                            ))}
                        </select>
                        {errors.contract_id && (
                            <p className="text-rose-500 text-xs font-bold mt-1">
                                {errors.contract_id}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* OR Number */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                OR Number
                            </label>
                            <input
                                type="text"
                                value={data.or_number}
                                onChange={(e) =>
                                    setData("or_number", e.target.value)
                                }
                                className="w-full bg-amber-50 border-2 border-amber-300 rounded-lg px-4 py-2.5 text-sm font-black text-amber-900 focus:border-amber-600 focus:ring-0 placeholder:font-normal placeholder:text-amber-300"
                                placeholder="Enter Receipt Number"
                                required
                            />
                            {errors.or_number && (
                                <p className="text-rose-500 text-xs font-bold mt-1">
                                    {errors.or_number}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Amount Paid (₱)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) =>
                                    setData("amount", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-emerald-600 focus:ring-0"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Payment Date */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Date of Payment
                            </label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) =>
                                    setData("payment_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0"
                                required
                            />
                        </div>

                        {/* Coverage Month */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                For Month
                            </label>
                            <select
                                value={data.month}
                                onChange={(e) =>
                                    setData("month", e.target.value)
                                }
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0"
                                required
                            >
                                <option value="">-- Month --</option>
                                {months.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Coverage Year */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                For Year
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={(e) =>
                                    setData("year", parseInt(e.target.value))
                                }
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Save Official Receipt
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
