import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";

export default function CreateFloorModal({
    show,
    onClose,
    buildings,
}: {
    show: boolean;
    onClose: () => void;
    buildings: any[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            building_id: "",
            name: "",
            description: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("floors.store"), {
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
                        icon="solar:layers-minimalistic-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Register Floor
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
                        Parent Building
                    </label>
                    <SearchableSelect
                        value={data.building_id}
                        onChange={(val: any) => setData("building_id", val)}
                        options={buildings.map((b: any) => ({
                            value: b.id,
                            label: b.name,
                        }))}
                        placeholder="Search and select a building..."
                        error={errors.building_id}
                    />
                    {errors.building_id && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.building_id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                        Floor Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors"
                        placeholder="e.g. Ground Floor, Phase 1"
                        required
                    />
                    {errors.name && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                        Description (Optional)
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:ring-0 outline-none transition-colors"
                        placeholder="Enter floor details..."
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
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Save Floor
                    </button>
                </div>
            </form>
        </Modal>
    );
}
