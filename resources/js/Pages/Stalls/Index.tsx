import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateStallModal from "./Partials/CreateStallModal";
import EditStallModal from "./Partials/EditStallModal";
import BulkEditStallsModal from "./Partials/BulkEditStallsModal";
import Modal from "@/Components/Modal";
import CustomSelect from "@/Components/CustomSelect";
import Pagination from "@/Components/Pagination";

export default function StallsIndex({
    stalls,
    floors,
    buildings,
    filters,
    useProposedPricing,
}: any) {
    const [search, setSearch] = useState(
        filters?.search && typeof filters.search === "string"
            ? filters.search
            : "",
    );
    const [sortFilter, setSortFilter] = useState(
        filters?.sort && typeof filters.sort === "string"
            ? `${filters.sort}_${filters.direction}`
            : "stall_code_asc",
    );
    const [filterBuilding, setFilterBuilding] = useState(
        filters?.building_id || "",
    );

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStall, setEditingStall] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedStalls, setSelectedStalls] = useState<number[]>([]);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const sortOptions = [
        { value: "stall_code_asc", label: "Stall Code (A-Z)" },
        { value: "stall_code_desc", label: "Stall Code (Z-A)" },
        { value: "location_asc", label: "Location (Building/Floor)" },
        { value: "created_at_desc", label: "Recently Added" },
    ];

    const buildingOptions = [
        { value: "", label: "All Buildings" },
        ...buildings.map((b: any) => ({ value: b.id, label: b.name })),
    ];

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delay = setTimeout(() => {
            const [sortBy, filterDirection] = sortFilter.split("_");
            router.get(
                route("stalls.index"),
                {
                    search,
                    sort: sortBy,
                    direction: filterDirection,
                    building_id: filterBuilding,
                },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search, sortFilter, filterBuilding]);

    useEffect(() => {
        setSelectedStalls([]);
    }, [stalls.data]);

    const handleSelectAll = () => {
        if (
            selectedStalls.length === stalls.data.length &&
            stalls.data.length > 0
        )
            setSelectedStalls([]);
        else setSelectedStalls(stalls.data.map((stall: any) => stall.id));
    };

    const handleSelectStall = (id: number) => {
        setSelectedStalls((prev) =>
            prev.includes(id)
                ? prev.filter((stallId) => stallId !== id)
                : [...prev, id],
        );
    };

    const confirmBulkDelete = () => setIsBulkDeleteModalOpen(true);

    const executeBulkDelete = () => {
        router.post(
            route("stalls.bulk_destroy"),
            { ids: selectedStalls },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStalls([]);
                    setIsBulkDeleteModalOpen(false);
                },
            },
        );
    };

    const confirmDelete = (id: number) => setDeletingId(id);
    const handleDelete = () => {
        if (deletingId)
            router.delete(route("stalls.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
    };

    const handleExport = (e: React.MouseEvent) => {
        e.preventDefault();
        const [sortBy, filterDirection] = sortFilter.split("_");
        window.location.href = route("stalls.export", {
            search,
            sort: sortBy,
            direction: filterDirection,
            building_id: filterBuilding,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(
                route("stalls.import"),
                { file: e.target.files[0] },
                {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        if (fileInputRef.current)
                            fileInputRef.current.value = "";
                    },
                    onError: (errors) => {
                        alert(errors.file || "Failed to upload file.");
                        if (fileInputRef.current)
                            fileInputRef.current.value = "";
                    },
                },
            );
        }
    };

    const handleTogglePricing = () =>
        router.post(
            route("system.toggle_pricing"),
            {},
            { preserveScroll: true },
        );

    const totalStalls = stalls.total || stalls.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="Manage Stalls" />

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
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                            Yes, Delete Stall
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                show={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon
                            icon="solar:trash-bin-trash-bold"
                            className="h-8 w-8 text-rose-600"
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        Delete {selectedStalls.length} Stalls?
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove the{" "}
                        <span className="font-black text-rose-600">
                            {selectedStalls.length}
                        </span>{" "}
                        selected stalls? Any payments and active contracts
                        linked to them will also be deleted. This action cannot
                        be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setIsBulkDeleteModalOpen(false)}
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeBulkDelete}
                            className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                            Yes, Delete All
                        </button>
                    </div>
                </div>
            </Modal>

            {selectedStalls.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-[slide-up_0.3s_ease-out]">
                    <span className="font-black text-sm bg-blue-600 px-3 py-1 rounded-full border-2 border-blue-400">
                        {selectedStalls.length} Selected
                    </span>
                    <button
                        onClick={() => setIsBulkEditOpen(true)}
                        className="flex items-center gap-2 hover:text-blue-400 font-bold text-sm uppercase transition-colors cursor-pointer"
                    >
                        <Icon icon="solar:pen-bold" className="w-5 h-5" /> Bulk
                        Edit Pricing
                    </button>
                    <div className="w-px h-6 bg-slate-700"></div>
                    <button
                        onClick={confirmBulkDelete}
                        className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold text-sm uppercase transition-colors cursor-pointer"
                    >
                        <Icon
                            icon="solar:trash-bin-trash-bold"
                            className="w-5 h-5"
                        />{" "}
                        Delete All
                    </button>
                </div>
            )}

            <div className="py-12 max-w-[95%] mx-auto space-y-6 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:shop-bold-duotone"
                                    className="w-7 h-7 text-blue-700"
                                />{" "}
                                Manage Stalls
                            </h3>
                            <span
                                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200 flex items-center gap-1.5"
                                title="Total Stalls"
                            >
                                <Icon
                                    icon="solar:database-bold-duotone"
                                    className="w-4 h-4"
                                />{" "}
                                {totalStalls}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Manage stalls for each floors or sections
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-slate-200 p-1 rounded-lg border-2 border-slate-300 shrink-0">
                            <button
                                onClick={() => {
                                    if (useProposedPricing)
                                        handleTogglePricing();
                                }}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${!useProposedPricing ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:text-slate-700 cursor-pointer"}`}
                            >
                                <Icon
                                    icon="solar:wallet-money-bold-duotone"
                                    className="w-4 h-4 inline mr-1"
                                />{" "}
                                Current Rates
                            </button>
                            <button
                                onClick={() => {
                                    if (!useProposedPricing)
                                        handleTogglePricing();
                                }}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${useProposedPricing ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700 cursor-pointer"}`}
                            >
                                <Icon
                                    icon="solar:calculator-minimalistic-bold-duotone"
                                    className="w-4 h-4 inline mr-1"
                                />{" "}
                                Proposed Rates
                            </button>
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                        >
                            <Icon
                                icon="solar:shop-bold-duotone"
                                className="w-5 h-5"
                            />{" "}
                            <span className="hidden sm:inline">Add Stall</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border-2 border-slate-300 shadow-sm z-40">
                    <div className="w-48 z-40">
                        <CustomSelect
                            value={sortFilter}
                            onChange={setSortFilter}
                            options={sortOptions}
                            theme="blue"
                        />
                    </div>
                    <div className="w-48 z-30">
                        <CustomSelect
                            value={filterBuilding}
                            onChange={setFilterBuilding}
                            options={buildingOptions}
                            placeholder="Filter Building"
                            theme="blue"
                        />
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
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
                            className="block w-full pl-10 pr-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-700 transition-colors"
                            placeholder="Search stalls..."
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center p-2 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200 shrink-0 cursor-pointer"
                        title="Export Filtered Stalls"
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
                        className="flex items-center justify-center p-2 text-amber-700 bg-amber-100 rounded-lg border-2 border-amber-300 hover:bg-amber-200 shrink-0 cursor-pointer"
                        title="Import from Excel"
                    >
                        <Icon
                            icon="solar:import-bold-duotone"
                            className="w-5 h-5"
                        />
                    </button>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col mt-4 relative z-10">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center w-12">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            aria-label="Select all records"
                                            className={`w-4 h-4 mx-auto rounded flex items-center justify-center transition-all duration-200 border cursor-pointer ${stalls.data.length > 0 && selectedStalls.length === stalls.data.length ? "bg-blue-600 border-blue-600 text-white shadow-inner scale-110" : "bg-white border-slate-400 text-transparent hover:border-blue-400 hover:bg-blue-50"}`}
                                        >
                                            <Icon
                                                icon="solar:check-read-bold"
                                                width="12"
                                            />
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center w-12">
                                        #
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Stall Code
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Size (SQM)
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Active Pricing
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Current Status
                                    </th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-center">
                                        Location
                                    </th>
                                    <th className="px-4 py-2 text-center w-32">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {stalls.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:ghost-broken"
                                                className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-300"
                                            />{" "}
                                            No stalls found in the registry.
                                        </td>
                                    </tr>
                                ) : (
                                    stalls.data.map(
                                        (stall: any, index: number) => {
                                            const statusObj =
                                                stall.computed_status || {
                                                    label: "UNKNOWN",
                                                    color: "#999999",
                                                };
                                            const isSelected =
                                                selectedStalls.includes(
                                                    stall.id,
                                                );
                                            const activeMonthly =
                                                useProposedPricing
                                                    ? stall.proposed_monthly_rental
                                                    : stall.current_monthly_rental;
                                            const activePerSqm =
                                                useProposedPricing
                                                    ? stall.proposed_rate_per_sqm
                                                    : stall.current_rate_per_sqm;

                                            // Handle White Occupied styling for the table row
                                            const isWhite =
                                                statusObj.color.toLowerCase() ===
                                                    "#ffffff" ||
                                                statusObj.color.toLowerCase() ===
                                                    "#fff";

                                            return (
                                                <tr
                                                    key={stall.id}
                                                    className={`transition-colors ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"} cursor-pointer`}
                                                    onClick={() =>
                                                        handleSelectStall(
                                                            stall.id,
                                                        )
                                                    }
                                                >
                                                    <td
                                                        className="px-4 py-2 text-center border-r border-slate-200"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectStall(
                                                                    stall.id,
                                                                )
                                                            }
                                                            className={`w-4 h-4 mx-auto rounded flex items-center justify-center transition-all duration-200 border cursor-pointer ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-110" : "bg-white border-slate-300 text-transparent hover:border-blue-400 hover:bg-blue-50"}`}
                                                        >
                                                            <Icon
                                                                icon="solar:check-read-bold"
                                                                width="12"
                                                            />
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-2 font-bold text-slate-500 text-center border-r border-slate-200">
                                                        {(stalls.from || 1) +
                                                            index}
                                                    </td>
                                                    <td className="px-4 py-2 font-black text-slate-900 border-r border-slate-200 text-center text-base">
                                                        {stall.stall_code}
                                                    </td>
                                                    <td className="px-4 py-2 font-black text-slate-700 text-center border-r border-slate-200">
                                                        {stall.size_sqm ? (
                                                            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                                                                {stall.size_sqm}{" "}
                                                                sqm
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-center border-r border-slate-200">
                                                        <div
                                                            className={`text-sm font-black ${useProposedPricing ? "text-amber-600" : "text-emerald-700"}`}
                                                        >
                                                            ₱{" "}
                                                            {activeMonthly ||
                                                                "0.00"}{" "}
                                                            / mo
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                            ₱{" "}
                                                            {activePerSqm ||
                                                                "0.00"}{" "}
                                                            / sqm
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center border-r border-slate-200">
                                                        <span
                                                            className="inline-block px-2.5 py-0.5 rounded border-2 font-black text-[9px] uppercase tracking-wider shadow-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    isWhite
                                                                        ? "#f8fafc"
                                                                        : `${statusObj.color}20`,
                                                                borderColor:
                                                                    isWhite
                                                                        ? "#cbd5e1"
                                                                        : statusObj.color,
                                                                color: isWhite
                                                                    ? "#334155"
                                                                    : statusObj.color,
                                                            }}
                                                        >
                                                            {statusObj.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center border-r border-slate-200">
                                                        <div className="font-bold text-sm text-slate-800">
                                                            {stall.floor
                                                                ?.name || (
                                                                <span className="text-rose-500">
                                                                    No Floor
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] sm:text-xs text-slate-500">
                                                            {stall.floor
                                                                ?.building
                                                                ?.name ||
                                                                "No Building"}
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="px-4 py-2"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() =>
                                                                    setEditingStall(
                                                                        stall,
                                                                    )
                                                                }
                                                                className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded font-black text-[10px] sm:text-xs uppercase tracking-wide transition-colors cursor-pointer"
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
                                                                        stall.id,
                                                                    )
                                                                }
                                                                className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 border-2 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600 rounded font-black text-[10px] sm:text-xs uppercase tracking-wide transition-colors cursor-pointer"
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
                                            );
                                        },
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    {stalls.links && stalls.links.length > 3 && (
                        <div className="px-4 py-3 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                            <Pagination links={stalls.links} />
                        </div>
                    )}
                </div>
            </div>

            <CreateStallModal
                show={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                floors={floors}
            />
            <EditStallModal
                show={editingStall !== null}
                onClose={() => setEditingStall(null)}
                stall={editingStall}
                floors={floors}
            />
            <BulkEditStallsModal
                show={isBulkEditOpen}
                onClose={() => setIsBulkEditOpen(false)}
                selectedStalls={selectedStalls}
                onSuccess={() => setSelectedStalls([])}
            />
        </AuthenticatedLayout>
    );
}
