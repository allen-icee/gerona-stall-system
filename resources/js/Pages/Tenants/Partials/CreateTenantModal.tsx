import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function CreateTenantModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            first_name: "",
            last_name: "",
            company_name: "",
            contact_number: "",
            address: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("tenants.store"), {
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
                        icon="solar:user-plus-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Register Tenant
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
                            First Name
                        </label>
                        <input
                            type="text"
                            value={data.first_name}
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="e.g. Juan"
                            required
                        />
                        {errors.first_name && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.first_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={data.last_name}
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="e.g. Dela Cruz"
                            required
                        />
                        {errors.last_name && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.last_name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Business / Company{" "}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                                (Optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={(e) =>
                                setData("company_name", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="e.g. Sari-Sari Store"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Contact Number{" "}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                                (Optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={data.contact_number}
                            onChange={(e) =>
                                setData("contact_number", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="e.g. 0912 345 6789"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Full Address{" "}
                        <span className="text-[10px] text-slate-500 font-normal ml-1">
                            (Optional)
                        </span>
                    </label>
                    <textarea
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        rows={3}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors resize-none"
                        placeholder="e.g. Brgy. Poblacion 1, Gerona, Tarlac"
                    />
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
                        Save Tenant
                    </button>
                </div>
            </form>
        </Modal>
    );
}
