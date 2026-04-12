import { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import CustomSelect from "@/Components/CustomSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function EditStallModal({ show, onClose, stall, floors }: any) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            floor_id: "",
            stall_code: "",
            section: "",
            classification: "",
            size_sqm: "",
            stall_type: "sqm_based",
            rate_per_sqm: "",
            fixed_rate: "",
        });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    useEffect(() => {
        if (stall) {
            setData({
                floor_id: stall.floor_id || "",
                stall_code: stall.stall_code || "",
                section: stall.section || "",
                classification: stall.classification || "",
                size_sqm: stall.size_sqm || "",
                stall_type: stall.stall_type || "sqm_based",
                rate_per_sqm: stall.rate_per_sqm || "",
                fixed_rate: stall.fixed_rate || "",
            });
        }
    }, [stall]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("stalls.update", stall?.id), {
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
    };

    const classOptions = [
        { value: "", label: "None" },
        { value: "Class A", label: "Class A" },
        { value: "Class B", label: "Class B" },
        { value: "Class C", label: "Class C" },
    ];

    const stallTypeOptions = [
        { value: "sqm_based", label: "SQM Based (Size x Rate)" },
        { value: "class_based", label: "Class Based (Fixed Rate)" },
        { value: "manual", label: "Manual / No Rate" },
    ];

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:pen-bold-duotone"
                        className="w-6 h-6 text-amber-500"
                    />
                    Edit Smart Stall
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
                ref={formRef}
                onSubmit={submit}
                className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar"
            >
                {/* --- 1. PHYSICAL LOCATION --- */}
                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:map-point-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Location & Identification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Location (Floor)
                            </label>
                            <SearchableSelect
                                value={data.floor_id}
                                onChange={(val: any) =>
                                    setData("floor_id", val)
                                }
                                options={floors.map((f: any) => ({
                                    value: f.id,
                                    label: `${f.name} (${f.building?.name || "No Building"})`,
                                }))}
                                placeholder="Search locations..."
                                theme="amber"
                                error={errors.floor_id}
                            />
                            {errors.floor_id && (
                                <p className="text-rose-600 text-xs font-bold mt-1.5">
                                    {errors.floor_id}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Stall Code
                            </label>
                            <input
                                type="text"
                                value={data.stall_code}
                                onChange={(e) =>
                                    setData(
                                        "stall_code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                maxLength={255}
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 outline-none transition-colors"
                                required
                            />
                            {errors.stall_code && (
                                <p className="text-rose-600 text-xs font-bold mt-1.5">
                                    {errors.stall_code}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 2. CATEGORIZATION & SIZE --- */}
                <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 relative z-20">
                    <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:tag-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Categorization (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Section
                            </label>
                            <input
                                type="text"
                                list="section-options-edit"
                                value={data.section}
                                onChange={(e) =>
                                    setData("section", e.target.value)
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-[9px] text-sm font-bold focus:border-amber-600 focus:ring-0 transition-colors"
                            />
                            <datalist id="section-options-edit">
                                <option value="Meat Section" />
                                <option value="Fish Section" />
                                <option value="Vegetable Section" />
                                <option value="Dry Goods" />
                                <option value="Food Bazaar" />
                            </datalist>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Class
                            </label>
                            <CustomSelect
                                value={data.classification}
                                onChange={(val: string) =>
                                    setData("classification", val)
                                }
                                options={classOptions}
                                theme="amber"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Size (SQM)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.size_sqm}
                                onChange={(e) =>
                                    setData("size_sqm", e.target.value)
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-amber-600 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* --- 3. PRICING ENGINE --- */}
                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200 relative z-10">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calculator-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Pricing Model
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Computation Type
                            </label>
                            <CustomSelect
                                value={data.stall_type}
                                onChange={(val: string) =>
                                    setData("stall_type", val)
                                }
                                options={stallTypeOptions}
                                theme="emerald"
                            />
                        </div>

                        {data.stall_type === "sqm_based" && (
                            <div className="animate-[fade-in_0.2s_ease-out]">
                                <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                    Rate per SQM (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.rate_per_sqm}
                                    onChange={(e) =>
                                        setData("rate_per_sqm", e.target.value)
                                    }
                                    className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-emerald-600 focus:ring-0 transition-colors"
                                />
                            </div>
                        )}

                        {data.stall_type === "class_based" && (
                            <div className="animate-[fade-in_0.2s_ease-out]">
                                <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                    Fixed Monthly Rate (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.fixed_rate}
                                    onChange={(e) =>
                                        setData("fixed_rate", e.target.value)
                                    }
                                    className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-emerald-600 focus:ring-0 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                    >
                        {processing && (
                            <Icon
                                icon="eos-icons:loading"
                                className="w-4 h-4"
                            />
                        )}{" "}
                        Update Stall
                    </button>
                </div>
            </form>
        </Modal>
    );
}
