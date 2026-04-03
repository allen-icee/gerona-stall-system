import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function CreateStallModal({
    show,
    onClose,
    floors,
    statuses,
}: {
    show: boolean;
    onClose: () => void;
    floors: any[];
    statuses: any[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            floor_id: "",
            stall_code: "",
            status_id: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("stalls.store"), {
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
                        icon="solar:shop-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Register Stall
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
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Location (Floor/Section)
                    </label>
                    <select
                        value={data.floor_id}
                        onChange={(e) => setData("floor_id", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors cursor-pointer"
                        required
                    >
                        <option value="" disabled>
                            Select a location...
                        </option>
                        {floors.map((floor: any) => (
                            <option key={floor.id} value={floor.id}>
                                {floor.name} ({floor.building?.name})
                            </option>
                        ))}
                    </select>
                    {errors.floor_id && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.floor_id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Stall Code
                    </label>
                    <input
                        type="text"
                        value={data.stall_code}
                        onChange={(e) =>
                            setData("stall_code", e.target.value.toUpperCase())
                        }
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors placeholder-slate-400"
                        placeholder="e.g. B1, ST-014"
                        required
                    />
                    {errors.stall_code && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.stall_code}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Initial Status
                    </label>
                    <select
                        value={data.status_id}
                        onChange={(e) => setData("status_id", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors cursor-pointer"
                        required
                    >
                        <option value="" disabled>
                            Select a status...
                        </option>
                        {statuses && statuses.length > 0 ? (
                            statuses.map((status: any) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No statuses found in database!
                            </option>
                        )}
                    </select>
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
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Save Stall
                    </button>
                </div>
            </form>
        </Modal>
    );
}
