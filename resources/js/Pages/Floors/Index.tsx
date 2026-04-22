//resources\js\Pages\Floors\Index.tsx
import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateFloorModal from "./Partials/CreateFloorModal";
import EditFloorModal from "./Partials/EditFloorModal";
import Modal from "@/Components/Modal";
import CustomSelect from "@/Components/CustomSelect";
import Pagination from "@/Components/Pagination";

export default function FloorsIndex({ buildings, floors, filters }: any) {
    const [search, setSearch] = useState(
        filters?.search && typeof filters.search === "string" ? filters.search : ""
    );

    // Protected against the native JS sort() function bug
    const [sortFilter, setSortFilter] = useState(
        filters?.sort && typeof filters.sort === "string"
            ? `${filters.sort}_${filters.direction}`
            : "building_asc",
    );

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const sortOptions = [
        { value: "building_asc", label: "Building Name (A-Z)" },
        { value: "name_asc", label: "Floor/Section Name (A-Z)" },
        { value: "created_at_desc", label: "Recently Added" },
        { value: "created_at_asc", label: "Oldest Added" },
    ];

    useEffect(() => {
        const delay = setTimeout(() => {
            const [sortBy, filterDirection] = sortFilter.split("_");

            router.get(
                route("floors.index"),
                { search, sort: sortBy, direction: filterDirection },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search, sortFilter]);

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("floors.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleExport = (e: React.MouseEvent) => {
        e.preventDefault();
        const [sortBy, filterDirection] = sortFilter.split("_");
        window.location.href = route("floors.export", {
            search,
            sort: sortBy,
            direction: filterDirection,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(
                route("floors.import"),
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

    const totalFloors = floors.total || floors.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="Floors & Sections" />

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
                        Delete Floor/Section?
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove this
                        floor/section? All associated stalls and contracts will
                        be permanently deleted.
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
                            Yes, Delete Floor/Section
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
                                    icon="solar:layers-minimalistic-bold-duotone"
                                    className="w-7 h-7 text-blue-700"
                                />
                                Floors & Sections
                            </h3>
                            <span
                                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200 flex items-center gap-1.5"
                                title="Total Floors/Sections"
                            >
                                <Icon
                                    icon="solar:database-bold-duotone"
                                    className="w-4 h-4"
                                />
                                {totalFloors}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                            Organize floors and sections within the existing
                            buildings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-56 z-20">
                            <CustomSelect
                                value={sortFilter}
                                onChange={setSortFilter}
                                options={sortOptions}
                                theme="blue"
                            />
                        </div>

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
                                placeholder="Search floors/sections..."
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center p-2.5 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200 transition-colors shrink-0"
                            title="Export Filtered List"
                        >
                            <Icon
                                icon="solar:export-bold-duotone"
                                className="w-5 h-5"
                            />
                        </button>

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
                                icon="solar:add-square-bold-duotone"
                                className="w-5 h-5"
                            />
                            <span className="hidden sm:inline">
                                Add Floor/Section
                            </span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center w-12">
                                        #
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center w-1/3">
                                        Floor / Section
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Building Designation
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Stall Count
                                    </th>
                                    <th className="px-4 py-2 text-center w-32">
                                        System Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {floors.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-8 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:layers-minimalistic-broken"
                                                className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-300"
                                            />
                                            No floors/sections found.
                                        </td>
                                    </tr>
                                ) : (
                                    floors.data.map(
                                        (floor: any, index: number) => (
                                            <tr
                                                key={floor.id}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="px-4 py-2 font-bold text-slate-500 text-center border-r border-slate-200">
                                                    {(floors.from || 1) + index}
                                                </td>
                                                <td className="px-4 py-2 font-black text-slate-900 border-r border-slate-200 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-base">
                                                            {floor.name}
                                                        </span>
                                                        {floor.description && (
                                                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                                {
                                                                    floor.description
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 font-black text-blue-700 text-center border-r border-slate-200">
                                                    {floor.building?.name || (
                                                        <span className="text-rose-500">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-center border-r border-slate-200">
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-xs border border-slate-300">
                                                        {floor.stalls_count ||
                                                            0}{" "}
                                                        Stalls
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            onClick={() =>
                                                                setEditingFloor(
                                                                    floor,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded transition-colors text-xs font-black uppercase tracking-wide"
                                                            title="Edit Floor/Section"
                                                        >
                                                            <Icon
                                                                icon="solar:pen-bold"
                                                                className="w-3.5 h-3.5"
                                                            />{" "}
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    floor.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 border-2 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600 rounded transition-colors text-xs font-black uppercase tracking-wide"
                                                            title="Delete Floor/Section"
                                                        >
                                                            <Icon
                                                                icon="solar:trash-bin-trash-bold"
                                                                className="w-3.5 h-3.5"
                                                            />{" "}
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
                    {/* Pagination */}
                    {floors.links && floors.links.length > 3 && (
                        <div className="px-4 py-3 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                            <Pagination links={floors.links} />
                        </div>
                    )}
                </div>
            </div>

            <CreateFloorModal
                show={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                buildings={buildings}
            />
            <EditFloorModal
                show={editingFloor !== null}
                onClose={() => setEditingFloor(null)}
                floor={editingFloor}
                buildings={buildings}
            />
        </AuthenticatedLayout>
    );
}