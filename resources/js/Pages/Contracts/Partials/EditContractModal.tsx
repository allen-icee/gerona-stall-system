import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function EditContractModal({
    show,
    onClose,
    contract,
}: {
    show: boolean;
    onClose: () => void;
    contract: any;
}) {
    // For security, Tenant and Stall cannot be changed in an active contract. Only dates and fees.
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            start_date: "",
            end_date: "",
            monthly_rent: "",
            security_deposit: "",
        });

    useEffect(() => {
        if (contract) {
            setData({
                start_date: contract.start_date || "",
                end_date: contract.end_date || "",
                monthly_rent: contract.monthly_rent || "",
                security_deposit: contract.security_deposit || "",
            });
        }
    }, [contract]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("contracts.update", contract?.id), {
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:pen-bold-duotone"
                        className="w-6 h-6 text-amber-500"
                    />
                    Edit Contract Details
                </h2>
                <button
                    onClick={closeModal}
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <Icon
                        icon="solar:close-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
            </div>

            <form
                onSubmit={submit}
                className="p-6 space-y-5 bg-white rounded-b-2xl"
            >
                {/* Read-Only Information */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-2">
                        Fixed Contract Entities
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-amber-600 uppercase font-bold">
                                Tenant
                            </p>
                            <p className="text-sm font-black text-amber-900">
                                {contract?.tenant?.first_name}{" "}
                                {contract?.tenant?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-amber-600 uppercase font-bold">
                                Stall Code
                            </p>
                            <p className="text-sm font-black text-amber-900">
                                {contract?.stall?.stall_code}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                            required
                        />
                        {errors.start_date && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.start_date}
                            </p>
                        )}
                    </div>

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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                            required
                        />
                        {errors.end_date && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.end_date}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                            required
                        />
                        {errors.monthly_rent && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.monthly_rent}
                            </p>
                        )}
                    </div>

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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Update Contract
                    </button>
                </div>
            </form>
        </Modal>
    );
}
