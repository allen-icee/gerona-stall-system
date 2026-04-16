//resources\js\Pages\Stalls\Partials\BulkEditStallsModal.tsx
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function BulkEditStallsModal({
    show,
    onClose,
    selectedStalls,
    onSuccess,
}: any) {
    const { data, setData, post, processing, reset } = useForm({
        ids: [] as number[],
        size_sqm: "",
        current_monthly_rental: "",
        current_rate_per_sqm: "",
        proposed_monthly_rental: "",
        proposed_rate_per_sqm: "",
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

    const handleRound = (field: keyof typeof data) => {
        if (data[field]) {
            setData(
                field,
                Math.round(parseFloat(data[field] as string)).toFixed(2),
            );
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:layers-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Bulk Edit Pricing & Sizes
                </h2>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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

                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Mass Apply Stall Size (SQM)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.size_sqm}
                        onChange={(e) => setData("size_sqm", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 transition-colors"
                        placeholder="Leave blank to skip"
                    />
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200 relative z-10">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calculator-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Ordinance Pricing (Auto-Rounds to Peso)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-emerald-100 shadow-sm">
                            <h4 className="text-xs font-black text-emerald-800 uppercase border-b-2 border-emerald-100 pb-2">
                                Current Rates
                            </h4>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Monthly Rental (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.current_monthly_rental}
                                    onChange={(e) =>
                                        setData(
                                            "current_monthly_rental",
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        handleRound("current_monthly_rental")
                                    }
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-emerald-500 focus:ring-0 transition-colors"
                                    placeholder="Skip"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Rate per SQM (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.current_rate_per_sqm}
                                    onChange={(e) =>
                                        setData(
                                            "current_rate_per_sqm",
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        handleRound("current_rate_per_sqm")
                                    }
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-emerald-500 focus:ring-0 transition-colors"
                                    placeholder="Skip"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-amber-100 shadow-sm">
                            <h4 className="text-xs font-black text-amber-800 uppercase border-b-2 border-amber-100 pb-2">
                                Proposed Rates
                            </h4>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Proposed Monthly (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.proposed_monthly_rental}
                                    onChange={(e) =>
                                        setData(
                                            "proposed_monthly_rental",
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        handleRound("proposed_monthly_rental")
                                    }
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-amber-500 focus:ring-0 transition-colors"
                                    placeholder="Skip"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Proposed per SQM (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.proposed_rate_per_sqm}
                                    onChange={(e) =>
                                        setData(
                                            "proposed_rate_per_sqm",
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        handleRound("proposed_rate_per_sqm")
                                    }
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-amber-500 focus:ring-0 transition-colors"
                                    placeholder="Skip"
                                />
                            </div>
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
