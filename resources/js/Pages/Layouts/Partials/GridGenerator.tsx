import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";

export default function GridGenerator({
    genData,
    setGenData,
    onSubmit,
    processing,
}: any) {
    const { url } = usePage();

    // 🔥 BUG FIX: Automatically sync the form's floor_id whenever the URL changes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const activeFloorId = urlParams.get("floor_id");

        if (activeFloorId && genData.floor_id !== activeFloorId) {
            setGenData("floor_id", activeFloorId);
        }
    }, [url]);

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden">
            {/* Decorative background blurs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 rotate-3 hover:rotate-0 transition-transform">
                        <Icon
                            icon="solar:ruler-pen-bold-duotone"
                            className="w-10 h-10 text-white"
                        />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Configure Map Grid
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                        Define the physical dimensions (Rows x Columns) to
                        generate a blank canvas for this floor.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-amber-400 focus-within:bg-amber-50/30 transition-colors">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Rows (Height)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={genData.total_rows}
                                onChange={(e) =>
                                    setGenData(
                                        "total_rows",
                                        e.target.value === ""
                                            ? ""
                                            : parseInt(e.target.value),
                                    )
                                }
                                className="w-full bg-transparent border-none text-2xl font-black text-slate-800 p-0 text-center focus:ring-0 outline-none"
                                required
                            />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-amber-400 focus-within:bg-amber-50/30 transition-colors">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Columns (Width)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={genData.total_cols}
                                onChange={(e) =>
                                    setGenData(
                                        "total_cols",
                                        e.target.value === ""
                                            ? ""
                                            : parseInt(e.target.value),
                                    )
                                }
                                className="w-full bg-transparent border-none text-2xl font-black text-slate-800 p-0 text-center focus:ring-0 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-sm py-4 rounded-xl shadow-lg border-b-4 border-slate-950 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon
                            icon="solar:magic-stick-3-bold"
                            className="w-5 h-5 text-amber-400"
                        />
                        {processing ? "Generating..." : "Generate Blank Grid"}
                    </button>
                </form>
            </div>
        </div>
    );
}
