//resources\js\Pages\Tenants\Partials\CreateTenantModal.tsx
import { useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SuffixSelect from "@/Components/SuffixSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function CreateTenantModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        company_name: "",
        contact_number: "",
        address: "",
    });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((currentData: any) => {
            let mName = (currentData.middle_name || "").trim();
            if (mName.length === 1 && /^[A-ZÑ]$/i.test(mName)) {
                mName += ".";
            }

            return {
                ...currentData,
                middle_name: mName,
            };
        });

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
                    type="button"
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
                ref={formRef}
                onSubmit={submit}
                className="p-6 space-y-5 bg-white rounded-b-2xl overflow-visible"
            >
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-4">
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                                First Name
                            </label>
                            <span
                                className={`text-[10px] font-bold ${(data.first_name || "").length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {(data.first_name || "").length}/255
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={255}
                            value={data.first_name || ""}
                            onChange={(e) =>
                                setData(
                                    "first_name",
                                    e.target.value.replace(
                                        /[^a-zA-ZñÑ\s\-,\.]/g,
                                        "",
                                    ).toUpperCase()
                                )
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 uppercase focus:border-blue-600 focus:ring-0 transition-colors"
                            placeholder="E.G. MARIA THERESA"
                            required
                        />
                        {errors.first_name && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.first_name}
                            </p>
                        )}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                                M.I. / Middle
                            </label>
                            <span
                                className={`text-[10px] font-bold ${(data.middle_name || "").length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {(data.middle_name || "").length}/255
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={255}
                            value={data.middle_name || ""}
                            onChange={(e) =>
                                setData(
                                    "middle_name",
                                    e.target.value
                                        .replace(/[^a-zA-ZñÑ\s\.]/g, "")
                                        .toUpperCase(),
                                )
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 uppercase focus:border-blue-600 focus:ring-0 transition-colors"
                            placeholder="E.G. C OR CAPITULO"
                        />
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                                Last Name
                            </label>
                            <span
                                className={`text-[10px] font-bold ${(data.last_name || "").length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {(data.last_name || "").length}/255
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={255}
                            value={data.last_name || ""}
                            onChange={(e) =>
                                setData(
                                    "last_name",
                                    e.target.value.replace(
                                        /[^a-zA-ZñÑ\s\-,\.]/g,
                                        "",
                                    ).toUpperCase()
                                )
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 uppercase focus:border-blue-600 focus:ring-0 transition-colors"
                            placeholder="E.G. YU"
                            required
                        />
                        {errors.last_name && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.last_name}
                            </p>
                        )}
                    </div>
                    <div className="col-span-6 sm:col-span-2 flex flex-col justify-end pb-0.5">
                        <SuffixSelect
                            value={data.suffix || ""}
                            onChange={(val: any) => setData("suffix", val)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                                Business / Company{" "}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    (Optional)
                                </span>
                            </label>
                            <span
                                className={`text-[10px] font-bold ${(data.company_name || "").length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {(data.company_name || "").length}/255
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={255}
                            value={data.company_name || ""}
                            onChange={(e) =>
                                setData("company_name", e.target.value.toUpperCase())
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 uppercase focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="E.G. SARI-SARI STORE"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                                Contact Number{" "}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    (Optional)
                                </span>
                            </label>
                            <span
                                className={`text-[10px] font-bold ${(data.contact_number || "").length >= 11 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {(data.contact_number || "").length}/11
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={11}
                            value={data.contact_number || ""}
                            onChange={(e) =>
                                setData(
                                    "contact_number",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                            placeholder="e.g. 09123456789"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                            Address{" "}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                                (Optional)
                            </span>
                        </label>
                    </div>
                    <textarea
                        rows={3}
                        value={data.address || ""}
                        onChange={(e) => setData("address", e.target.value.toUpperCase())}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 uppercase focus:border-blue-600 focus:ring-0 outline-none transition-colors resize-none"
                        placeholder="COMPLETE ADDRESS (E.G. 123 MAIN ST., BRGY. SAN JUAN, GERONA, TARLAC)"
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