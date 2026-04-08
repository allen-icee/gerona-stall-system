import { useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function CreateBuildingModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            description: "",
        });

    // Phase 1: Smart Keyboard Navigation
    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("buildings.store"), {
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
                        icon="solar:buildings-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Register Building
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
                className="p-6 space-y-4 bg-white rounded-b-2xl"
            >
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                            Building Name
                        </label>
                        {/* Phase 2: Character Limit Indicator */}
                        <span className={`text-[10px] font-bold ${data.name.length >= 50 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {data.name.length}/50
                        </span>
                    </div>

                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        // Phase 2: Building Name Character Restriction
                        maxLength={50}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors"
                        placeholder="e.g. Public Market Bldg 1"
                        required
                    />
                    {errors.name && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                            Description (Optional)
                        </label>
                        <span className={`text-[10px] font-bold ${data.description.length >= 255 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {data.description.length}/255
                        </span>
                    </div>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        maxLength={255}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors"
                        placeholder="Enter building details..."
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
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Save Building
                    </button>
                </div>
            </form>
        </Modal>
    );
}