import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateStallModal from "./Partials/CreateStallModal";
import EditStallModal from "./Partials/EditStallModal";
import Modal from "@/Components/Modal";

export default function StallsIndex({
    stalls,
    floors,
    statuses,
    filters,
}: any) {
    const [search, setSearch] = useState(filters?.search || "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStall, setEditingStall] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Confirmation State
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Gold Standard: Debounced Search Logic
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route("stalls.index"),
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("stalls.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    // Gold Standard: Direct router.post for File Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(
                route("stalls.import"),
                {
                    file: e.target.files[0],
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        if (fileInputRef.current)
                            fileInputRef.current.value = "";
                    },
                    onError: (errors) => {
                        alert(
                            errors.file ||
                                "Failed to upload file. Make sure it's a valid Excel/CSV.",
                        );
                        if (fileInputRef.current)
                            fileInputRef.current.value = "";
                    },
                },
            );
        }
    };

    const totalStalls = stalls.total || stalls.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="Manage Stalls" />

            {/* Custom High-Contrast Delete Confirmation Modal */}
            <Modal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                maxWidth="sm"
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon
                            icon="solar:danger-triangle-bold"
                            className="h-8 w-8 text-rose-600"
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        Delete Stall?
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove this stall?
                        Any active contracts linked to it might be affected.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setDeletingId(null)}
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                        >
                            Yes, Delete Stall
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:shop-bold-duotone"
                                    className="w-7 h-7 text-blue-700"
                                />
                                Manage Stalls
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200">
                                {totalStalls}{" "}
                                {totalStalls === 1 ? "Record" : "Records"}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Manage stall inventory, codes, and physical
                            locations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon
                                    icon="solar:magnifer-bold"
                                    className="h-5 w-5 text-slate-400"
                                />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-700 transition-colors"
                                placeholder="Search stalls..."
                            />
                        </div>

                        <a
                            href={route("stalls.export")}
                            className="flex items-center justify-center p-2.5 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200 transition-colors shrink-0"
                            title="Export to Excel"
                        >
                            <Icon
                                icon="solar:export-bold-duotone"
                                className="w-5 h-5"
                            />
                        </a>

                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center p-2.5 text-amber-700 bg-amber-100 rounded-lg border-2 border-amber-300 hover:bg-amber-200 transition-colors shrink-0"
                            title="Import from Excel"
                        >
                            <Icon
                                icon="solar:import-bold-duotone"
                                className="w-5 h-5"
                            />
                        </button>

                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap"
                        >
                            <Icon
                                icon="solar:shop-bold-duotone"
                                className="w-5 h-5"
                            />
                            <span className="hidden sm:inline">Add Stall</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center w-16">
                                        #
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Stall Code
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Current Status
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {stalls.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:ghost-broken"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300"
                                            />
                                            No stalls found in the registry.
                                        </td>
                                    </tr>
                                ) : (
                                    stalls.data.map(
                                        (stall: any, index: number) => (
                                            <tr
                                                key={stall.id}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                {/* Gold Standard Dynamic Row Numbers */}
                                                <td className="px-6 py-4 font-bold text-slate-500 text-center border-r border-slate-200">
                                                    {(stalls.from || 1) + index}
                                                </td>
                                                <td className="px-6 py-4 font-black text-slate-900 border-r border-slate-200 text-center text-base">
                                                    {stall.stall_code}
                                                </td>
                                                <td className="px-6 py-4 text-center border-r border-slate-200">
                                                    <span className="inline-block px-3 py-1 rounded border-2 font-black text-[10px] uppercase tracking-wider bg-slate-100 border-slate-300 text-slate-700">
                                                        {stall.status?.name ||
                                                            "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center border-r border-slate-200">
                                                    <div className="font-bold text-slate-800">
                                                        {stall.floor?.name || (
                                                            <span className="text-rose-500">
                                                                No Floor
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {stall.floor?.building
                                                            ?.name ||
                                                            "No Building"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setEditingStall(
                                                                    stall,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:pen-bold"
                                                                className="w-4 h-4"
                                                            />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    stall.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border-2 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:trash-bin-trash-bold"
                                                                className="w-4 h-4"
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateStallModal
                show={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                floors={floors}
                statuses={statuses}
            />
            <EditStallModal
                show={editingStall !== null}
                onClose={() => setEditingStall(null)}
                stall={editingStall}
                floors={floors}
                statuses={statuses}
            />
        </AuthenticatedLayout>
    );
}
