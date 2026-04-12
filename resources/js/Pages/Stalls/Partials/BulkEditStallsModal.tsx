import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import CustomSelect from "@/Components/CustomSelect";

export default function BulkEditStallsModal({
    show,
    onClose,
    selectedStalls,
    onSuccess,
}: any) {
    const { data, setData, post, processing, reset } = useForm({
        ids: [] as number[],
        section: "",
        classification: "",
        stall_type: "",
        size_sqm: "",
        rate_per_sqm: "",
        fixed_rate: "",
    });

    useEffect(() => {
        if (show) {
            setData("ids", selectedStalls);
        }
    }, [show, selectedStalls]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("stalls.bulk_update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess();
            },
        });
    };

    const classOptions = [
        { value: "", label: "-- No Change --" },
        { value: "Class A", label: "Class A" },
        { value: "Class B", label: "Class B" },
        { value: "Class C", label: "Class C" },
    ];

    const stallTypeOptions = [
        { value: "", label: "-- Do Not Change --" },
        { value: "sqm_based", label: "SQM Based (Size x Rate)" },
        { value: "class_based", label: "Class Based (Fixed Rate)" },
        { value: "manual", label: "Manual / Custom" },
    ];

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            {/* --- MODAL HEADER --- */}
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:layers-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Bulk Edit Stalls
                </h2>
                <button
                    onClick={onClose}
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
                className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar"
            >
                {/* --- INFO BANNER --- */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <Icon
                        icon="solar:info-circle-bold-duotone"
                        className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
                    />
                    <div>
                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-wide">
                            Batch Processing Active
                        </h4>
                        <p className="text-xs font-bold text-blue-700 mt-1">
                            You are applying changes to{" "}
                            <span className="text-blue-900 font-black">
                                {selectedStalls.length}
                            </span>{" "}
                            selected stalls. Leave any field blank to keep the
                            existing data for those stalls.
                        </p>
                    </div>
                </div>

                {/* --- 1. CATEGORIZATION --- */}
                <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 relative z-20">
                    <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:tag-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Categorization (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Section
                            </label>
                            <input
                                type="text"
                                list="section-options-bulk"
                                value={data.section}
                                onChange={(e) =>
                                    setData("section", e.target.value)
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-[9px] text-sm font-bold focus:border-amber-600 focus:ring-0 transition-colors placeholder-amber-300/70"
                                placeholder="Leave blank to skip"
                            />
                            <datalist id="section-options-bulk">
                                <option value="Meat Section" />
                                <option value="Fish Section" />
                                <option value="Vegetable Section" />
                                <option value="Dry Goods" />
                                <option value="Food Bazaar" />
                            </datalist>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Classification
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
                    </div>
                </div>

                {/* --- 2. PRICING ENGINE --- */}
                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200 relative z-10">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calculator-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Pricing Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative md:col-span-2">
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Stall Type Override
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

                        <div className="animate-[fade-in_0.2s_ease-out]">
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Size (SQM)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.size_sqm}
                                onChange={(e) =>
                                    setData("size_sqm", e.target.value)
                                }
                                className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-emerald-600 focus:ring-0 transition-colors placeholder-emerald-300/70"
                                placeholder="Leave blank to skip"
                            />
                        </div>

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
                                className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-emerald-600 focus:ring-0 transition-colors placeholder-emerald-300/70"
                                placeholder="Leave blank to skip"
                            />
                        </div>

                        <div className="animate-[fade-in_0.2s_ease-out] md:col-span-2">
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
                                className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-[9px] text-sm font-black focus:border-emerald-600 focus:ring-0 transition-colors placeholder-emerald-300/70"
                                placeholder="Leave blank to skip"
                            />
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                    >
                        {processing ? (
                            <Icon
                                icon="eos-icons:loading"
                                className="w-4 h-4"
                            />
                        ) : (
                            <Icon
                                icon="solar:check-circle-bold"
                                className="w-4 h-4"
                            />
                        )}
                        Apply to {selectedStalls.length} Stalls
                    </button>
                </div>
            </form>
        </Modal>
    );
}
