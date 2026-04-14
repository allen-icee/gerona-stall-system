import { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function EditStallModal({ show, onClose, stall, floors }: any) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        floor_id: "",
        stall_code: "",
        size_sqm: "",
        current_monthly_rental: "",
        current_rate_per_sqm: "",
        proposed_monthly_rental: "",
        proposed_rate_per_sqm: "",
    });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    useEffect(() => {
        if (stall) {
            setData({
                floor_id: stall.floor_id || "",
                stall_code: stall.stall_code || "",
                size_sqm: stall.size_sqm || "",
                current_monthly_rental: stall.current_monthly_rental || "",
                current_rate_per_sqm: stall.current_rate_per_sqm || "",
                proposed_monthly_rental: stall.proposed_monthly_rental || "",
                proposed_rate_per_sqm: stall.proposed_rate_per_sqm || "",
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

    const handleRound = (field: any) => {
        if (data[field as keyof typeof data]) {
            setData(field, Math.round(parseFloat(data[field as keyof typeof data] as string)).toFixed(2));
        }
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon icon="solar:pen-bold-duotone" className="w-6 h-6 text-amber-500" />
                    Edit Smart Stall
                </h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
                </button>
            </div>

            <form ref={formRef} onSubmit={submit} className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">

                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4" /> Location & Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">Location (Floor)</label>
                            <SearchableSelect
                                value={data.floor_id}
                                onChange={(val: any) => setData("floor_id", val)}
                                options={floors.map((f: any) => ({
                                    value: f.id,
                                    label: `${f.name} (${f.building?.name || "No Building"})`,
                                }))}
                                theme="amber"
                                error={errors.floor_id}
                            />
                            {errors.floor_id && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.floor_id}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">Stall Code</label>
                            <input
                                type="text"
                                value={data.stall_code}
                                onChange={(e) => setData("stall_code", e.target.value.toUpperCase())}
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                                required
                            />
                            {errors.stall_code && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.stall_code}</p>}
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">Stall Size (SQM)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.size_sqm}
                                onChange={(e) => setData("size_sqm", e.target.value)}
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon icon="solar:calculator-bold-duotone" className="w-4 h-4" /> Ordinance Pricing Metrics (Auto-Rounds to Peso)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-emerald-100 shadow-sm">
                            <h4 className="text-xs font-black text-emerald-800 uppercase border-b-2 border-emerald-100 pb-2">Current Approved Rates</h4>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Monthly Rental (₱)</label>
                                <input type="number" step="0.01" value={data.current_monthly_rental} onChange={(e) => setData("current_monthly_rental", e.target.value)} onBlur={() => handleRound('current_monthly_rental')} className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-emerald-500 focus:ring-0 transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rate per SQM (₱)</label>
                                <input type="number" step="0.01" value={data.current_rate_per_sqm} onChange={(e) => setData("current_rate_per_sqm", e.target.value)} onBlur={() => handleRound('current_rate_per_sqm')} className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-emerald-500 focus:ring-0 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-amber-100 shadow-sm">
                            <h4 className="text-xs font-black text-amber-800 uppercase border-b-2 border-amber-100 pb-2">Proposed / Future Rates</h4>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Proposed Monthly (₱)</label>
                                <input type="number" step="0.01" value={data.proposed_monthly_rental} onChange={(e) => setData("proposed_monthly_rental", e.target.value)} onBlur={() => handleRound('proposed_monthly_rental')} className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-amber-500 focus:ring-0 transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Proposed per SQM (₱)</label>
                                <input type="number" step="0.01" value={data.proposed_rate_per_sqm} onChange={(e) => setData("proposed_rate_per_sqm", e.target.value)} onBlur={() => handleRound('proposed_rate_per_sqm')} className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-black focus:border-amber-500 focus:ring-0 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                        {processing && <Icon icon="eos-icons:loading" className="w-4 h-4" />} Update Stall
                    </button>
                </div>
            </form>
        </Modal>
    );
}