import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function EditBuildingModal({
    show,
    onClose,
    building,
}: {
    show: boolean;
    onClose: () => void;
    building: any;
}) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            description: "",
        });

    // Populate the form when a building is selected
    useEffect(() => {
        if (building) {
            setData({
                name: building.name || "",
                description: building.description || "",
            });
        }
    }, [building]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("buildings.update", building?.id), {
            onSuccess: () => {
                closeModal();
            },
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
                    Edit Building
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
                        Building Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 outline-none transition-colors"
                        required
                    />
                    {errors.name && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Description (Optional)
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:ring-0 outline-none transition-colors"
                        rows={3}
                    />
                    {errors.description && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.description}
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
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Update Building
                    </button>
                </div>
            </form>
        </Modal>
    );
}
