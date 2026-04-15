import { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function EditFloorModal({
    show,
    onClose,
    floor,
    buildings,
}: {
    show: boolean;
    onClose: () => void;
    floor: any;
    buildings: any[];
}) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            building_id: "",
            name: "",
            description: "",
        });

    // 🔥 Added the smart Enter-to-Tab hook
    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    useEffect(() => {
        if (floor) {
            setData({
                building_id: floor.building_id || "",
                name: floor.name || "",
                description: floor.description || "",
            });
        }
    }, [floor]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("floors.update", floor?.id), {
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
                    Edit Floor/Section
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
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                        Building Designation
                    </label>
                    <SearchableSelect
                        value={data.building_id}
                        onChange={(val: any) => setData("building_id", val)}
                        options={buildings.map((b: any) => ({
                            value: b.id,
                            label: b.name,
                        }))}
                        placeholder="Search and select a building..."
                        theme="amber"
                        error={errors.building_id}
                    />
                    {errors.building_id && (
                        <p className="text-rose-600 text-xs font-bold mt-1.5">
                            {errors.building_id}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block cursor-pointer">
                            Floor/Section Name
                        </label>
                        <span className={`text-[10px] font-bold ${data.name.length >= 50 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {data.name.length}/50
                        </span>
                    </div>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        maxLength={50}
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
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block cursor-pointer">
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
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Update Floor/Section
                    </button>
                </div>
            </form>
        </Modal>
    );
}