import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import CustomSelect from "@/Components/CustomSelect";
import SearchableSelect from "@/Components/SearchableSelect"; // Imported Searchable Select

export default function EditStallModal({
    show,
    onClose,
    stall,
    floors,
    statuses,
}: any) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            floor_id: "",
            stall_code: "",
            status_id: "",
        });

    useEffect(() => {
        if (stall) {
            setData({
                floor_id: stall.floor_id || "",
                stall_code: stall.stall_code || "",
                status_id: stall.status_id || "",
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

    return (
        <Modal show={show} onClose={closeModal} maxWidth="md">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:pen-bold-duotone"
                        className="w-6 h-6 text-amber-500"
                    />
                    Edit Stall
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
                className="p-6 space-y-4 bg-white rounded-b-2xl"
            >
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                        Location (Floor/Section)
                    </label>
                    <SearchableSelect
                        value={data.floor_id}
                        onChange={(val: any) => setData("floor_id", val)}
                        options={floors.map((f: any) => ({
                            value: f.id,
                            label: `${f.name} (${f.building?.name || "No Building"})`,
                        }))}
                        placeholder="Search locations..."
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
                            setData("stall_code", e.target.value.toUpperCase())
                        }
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 outline-none transition-colors cursor-text"
                        required
                    />
                    {errors.stall_code && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.stall_code}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                        Status
                    </label>
                    <CustomSelect
                        value={data.status_id}
                        onChange={(val: any) => setData("status_id", val)}
                        options={statuses.map((s: any) => ({
                            value: s.id,
                            label: s.name,
                        }))}
                        placeholder="Select a status..."
                        theme="amber"
                        error={errors.status_id}
                    />
                    {errors.status_id && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.status_id}
                        </p>
                    )}
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
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Update Stall
                    </button>
                </div>
            </form>
        </Modal>
    );
}
