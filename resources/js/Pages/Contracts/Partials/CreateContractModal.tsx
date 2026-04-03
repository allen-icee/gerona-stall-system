import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function CreateContractModal({
    show,
    onClose,
    tenants,
    availableStalls,
}: {
    show: boolean;
    onClose: () => void;
    tenants: any[];
    availableStalls: any[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            tenant_id: "",
            stall_id: "",
            start_date: "",
            end_date: "",
            monthly_rent: "",
            security_deposit: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("contracts.store"), {
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
                        icon="solar:document-add-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Draft Lease Contract
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Assign to Tenant
                        </label>
                        <select
                            value={data.tenant_id}
                            onChange={(e) =>
                                setData("tenant_id", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors cursor-pointer"
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
                        {errors.tenant_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.tenant_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Available Stall
                        </label>
                        <select
                            value={data.stall_id}
                            onChange={(e) =>
                                setData("stall_id", e.target.value)
                            }
                            className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-lg px-4 py-2.5 text-sm font-bold text-emerald-900 focus:border-emerald-600 focus:ring-0 transition-colors cursor-pointer"
                            required
                        >
                            <option value="">-- Select Vacant Stall --</option>
                            {availableStalls.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.stall_code} - {s.building?.name}
                                </option>
                            ))}
                        </select>
                        {errors.stall_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.stall_id}
                            </p>
                        )}
                        {availableStalls.length === 0 && (
                            <p className="text-[10px] text-rose-500 font-bold mt-1">
                                No vacant stalls available.
                            </p>
                        )}
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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors"
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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors"
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
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors"
                            placeholder="0.00"
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
                            Security Deposit (₱){" "}
                            <span className="font-normal text-slate-500">
                                (Optional)
                            </span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.security_deposit}
                            onChange={(e) =>
                                setData("security_deposit", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors"
                            placeholder="0.00"
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
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Finalize Contract
                    </button>
                </div>
            </form>
        </Modal>
    );
}
