import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";

export default function ContractsIndex({
    contracts,
    tenants,
    availableStalls,
}: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            tenant_id: "",
            stall_id: "",
            start_date: "",
            end_date: "",
            monthly_rent: "",
            security_deposit: "",
        });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("contracts.store"), {
            onSuccess: () => closeCreateModal(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lease Contracts" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Active Contracts
                    </h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        <Icon
                            icon="solar:document-add-bold-duotone"
                            className="w-5 h-5"
                        />
                        Draft New Contract
                    </button>
                </div>

                {/* Contracts Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Tenant</th>
                                <th className="px-6 py-4">Assigned Stall</th>
                                <th className="px-6 py-4">Lease Period</th>
                                <th className="px-6 py-4">Monthly Rent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.data.length > 0 ? (
                                contracts.data.map((contract: any) => (
                                    <tr
                                        key={contract.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                                                <Icon
                                                    icon="solar:document-text-bold-duotone"
                                                    className="w-5 h-5"
                                                />
                                            </div>
                                            {contract.tenant?.first_name}{" "}
                                            {contract.tenant?.last_name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {contract.stall?.stall_code}
                                            <span className="text-[10px] block text-slate-400 font-normal">
                                                {contract.stall?.building?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">
                                                {contract.start_date}
                                            </span>
                                            <span className="text-slate-400 mx-2">
                                                to
                                            </span>
                                            <span className="font-bold text-slate-800">
                                                {contract.end_date}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">
                                            ₱{" "}
                                            {Number(
                                                contract.monthly_rent,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400 font-bold"
                                    >
                                        <Icon
                                            icon="solar:folder-error-bold-duotone"
                                            className="w-12 h-12 mx-auto mb-2 opacity-50"
                                        />
                                        No active contracts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Contract Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={closeCreateModal}
                maxWidth="2xl"
            >
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon
                            icon="solar:document-add-bold-duotone"
                            className="w-6 h-6 text-blue-700"
                        />
                        Draft Lease Contract
                    </h2>
                </div>

                <form
                    onSubmit={submitCreate}
                    className="p-6 space-y-5 bg-white"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Select Tenant */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Assign to Tenant
                            </label>
                            <select
                                value={data.tenant_id}
                                onChange={(e) =>
                                    setData("tenant_id", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0"
                                required
                            >
                                <option value="">
                                    -- Select Registered Tenant --
                                </option>
                                {tenants.map((t: any) => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name}{" "}
                                        {t.company_name
                                            ? `(${t.company_name})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select Stall (Filtered to VACANT only) */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Available Stall
                            </label>
                            <select
                                value={data.stall_id}
                                onChange={(e) =>
                                    setData("stall_id", e.target.value)
                                }
                                className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-lg px-4 py-2.5 text-sm font-bold text-emerald-900 focus:border-emerald-600 focus:ring-0"
                                required
                            >
                                <option value="">
                                    -- Select Vacant Stall --
                                </option>
                                {availableStalls.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.stall_code} - {s.building?.name}
                                    </option>
                                ))}
                            </select>
                            {availableStalls.length === 0 && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1">
                                    No vacant stalls available.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Start Date */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Contract Start Date
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Contract End Date
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Monthly Rent */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Monthly Rent (₱)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.monthly_rent}
                                onChange={(e) =>
                                    setData("monthly_rent", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-blue-600 focus:ring-0"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Security Deposit */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Security Deposit (₱)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.security_deposit}
                                onChange={(e) =>
                                    setData("security_deposit", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-blue-600 focus:ring-0"
                                placeholder="0.00"
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
                            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Finalize Contract
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
