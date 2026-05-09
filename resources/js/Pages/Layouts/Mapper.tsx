import { useState, useEffect } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";

import MapSidebar from "./Partials/MapSideBar";
import GridGenerator from "./Partials/GridGenerator";
import InteractiveGrid from "./Partials/InteractiveGrid";

export default function Mapper({
    buildings,
    current_floor_id,
    layout,
    stalls,
}: any) {
    const [selectedFloor, setSelectedFloor] = useState(current_floor_id || "");
    const [activeTool, setActiveTool] = useState("stall");
    const [selectedStallId, setSelectedStallId] = useState("");
    const [customText, setCustomText] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [gridCells, setGridCells] = useState<any[]>([]);
    const [gridDims, setGridDims] = useState({ rows: 0, cols: 0 });

    const [dialog, setDialog] = useState({
        isOpen: false,
        type: "alert",
        title: "",
        message: "",
        confirmText: "Confirm",
        confirmColor: "bg-blue-600 hover:bg-blue-700",
        icon: "solar:info-circle-bold-duotone",
        iconColor: "text-blue-500",
        onConfirm: () => {},
    });

    useEffect(() => {
        if (layout && layout.cells) {
            const hydratedCells = layout.cells.map((c: any) => ({
                ...c,
                colSpan: c.col_span || 1,
                rowSpan: c.row_span || 1,
            }));
            setGridCells(hydratedCells);
            setGridDims({ rows: layout.total_rows, cols: layout.total_cols });
        } else {
            setGridCells([]);
            setGridDims({ rows: 0, cols: 0 });
        }
    }, [layout?.id]);

    useEffect(() => {
        setGridCells((prev) =>
            prev.map((cell) => {
                if (cell.type === "stall" && cell.stall_id) {
                    const updatedStall = stalls?.find(
                        (s: any) => s.id == cell.stall_id,
                    );
                    return { ...cell, stall: updatedStall || cell.stall };
                }
                return cell;
            }),
        );
    }, [stalls]);

    const {
        data: genData,
        setData: setGenData,
        post: postGen,
        processing: genProcessing,
    } = useForm({
        floor_id: current_floor_id,
        name: "Main Layout",
        total_rows: 10,
        total_cols: 10,
    });

    const handleFloorChange = (floorId: any) => {
        setSelectedFloor(floorId);
        router.get(
            route("layouts.mapper", { floor_id: floorId }),
            {},
            { preserveState: true },
        );
    };

    const closeDialog = () => setDialog((prev) => ({ ...prev, isOpen: false }));

    const handleCellClick = (cellIndex: number) => {
        if (activeTool === "stall" && !selectedStallId) {
            setDialog({
                isOpen: true,
                type: "alert",
                title: "Selection Required",
                message:
                    "Please select a stall from the dropdown sidebar first before placing it on the map.",
                confirmText: "Got it",
                confirmColor: "bg-amber-500 hover:bg-amber-600 text-slate-900",
                icon: "solar:danger-triangle-bold-duotone",
                iconColor: "text-amber-500",
                onConfirm: closeDialog,
            });
            return;
        }

        if (activeTool === "text" && !customText.trim()) {
            setDialog({
                isOpen: true,
                type: "alert",
                title: "Text Required",
                message:
                    "Please type the text you want to place on the map in the sidebar input box.",
                confirmText: "Got it",
                confirmColor: "bg-indigo-500 hover:bg-indigo-600 text-white",
                icon: "solar:text-field-bold-duotone",
                iconColor: "text-indigo-500",
                onConfirm: closeDialog,
            });
            return;
        }

        const newCells = [...gridCells];
        const cell = newCells[cellIndex];
        cell.type = activeTool;
        cell.stall_id = activeTool === "stall" ? selectedStallId : null;

        if (activeTool === "stall") {
            cell.stall = stalls.find((s: any) => s.id == selectedStallId);
            cell.text = null;
            setSelectedStallId("");
        } else if (activeTool === "text") {
            cell.stall = null;
            cell.text = customText;
        } else {
            cell.stall = null;
            cell.text = null;
        }
        setGridCells(newCells);
    };

    const handleClearAll = () => {
        setDialog({
            isOpen: true,
            type: "confirm",
            title: "Clear Grid Layout",
            message:
                "Are you sure you want to erase the entire layout? This doesn't save to the database until you click 'Update Map Layout'.",
            confirmText: "Yes, Erase Everything",
            confirmColor: "bg-rose-600 hover:bg-rose-700 text-white",
            icon: "solar:eraser-bold-duotone",
            iconColor: "text-rose-500",
            onConfirm: () => {
                setGridCells((prev) =>
                    prev.map((c) => ({
                        ...c,
                        type: "vacant",
                        stall_id: null,
                        stall: null,
                        text: null,
                    })),
                );
                closeDialog();
            },
        });
    };

    const handleRevert = () => {
        setDialog({
            isOpen: true,
            type: "confirm",
            title: "Revert Changes",
            message:
                "Revert to the last saved layout from the database? Any unsaved drawing progress will be lost.",
            confirmText: "Yes, Revert",
            confirmColor: "bg-amber-500 hover:bg-amber-600 text-slate-900",
            icon: "solar:history-bold-duotone",
            iconColor: "text-amber-500",
            onConfirm: () => {
                const hydratedCells = layout.cells.map((c: any) => ({
                    ...c,
                    colSpan: c.col_span || 1,
                    rowSpan: c.row_span || 1,
                }));
                setGridCells(hydratedCells);
                setGridDims({
                    rows: layout.total_rows,
                    cols: layout.total_cols,
                });
                closeDialog();
            },
        });
    };

    const insertRow = (rowIndex: number) => {
        const newCells = [...gridCells];
        const blankRow = Array.from({ length: gridDims.cols }, () => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            type: "vacant",
            text: null,
            stall_id: null,
            stall: null,
        }));
        newCells.splice(rowIndex * gridDims.cols, 0, ...blankRow);
        setGridCells(newCells);
        setGridDims((prev) => ({ ...prev, rows: prev.rows + 1 }));
    };

    const deleteRow = (rowIndex: number) => {
        if (gridDims.rows <= 1) return;
        const newCells = [...gridCells];
        newCells.splice(rowIndex * gridDims.cols, gridDims.cols);
        setGridCells(newCells);
        setGridDims((prev) => ({ ...prev, rows: prev.rows - 1 }));
    };

    const insertCol = (colIndex: number) => {
        const newCells = [...gridCells];
        for (let r = gridDims.rows - 1; r >= 0; r--) {
            newCells.splice(r * gridDims.cols + colIndex, 0, {
                id: `temp-${Date.now()}-${Math.random()}`,
                type: "vacant",
                text: null,
                stall_id: null,
                stall: null,
            });
        }
        setGridCells(newCells);
        setGridDims((prev) => ({ ...prev, cols: prev.cols + 1 }));
    };

    const deleteCol = (colIndex: number) => {
        if (gridDims.cols <= 1) return;
        const newCells = [...gridCells];
        for (let r = gridDims.rows - 1; r >= 0; r--) {
            newCells.splice(r * gridDims.cols + colIndex, 1);
        }
        setGridCells(newCells);
        setGridDims((prev) => ({ ...prev, cols: prev.cols - 1 }));
    };

    const saveLayout = () => {
        router.post(
            route("layouts.save", layout.id),
            {
                cells: gridCells,
                total_rows: gridDims.rows,
                total_cols: gridDims.cols,
            },
            { preserveScroll: true },
        );
    };

    // 🔥 WIPE-PROOF EXPORT: Now exports the Stall Code alongside the ID
    const handleExport = () => {
        const data = {
            total_rows: gridDims.rows,
            total_cols: gridDims.cols,
            cells: gridCells.map((c) => ({
                type: c.type,
                stall_id: c.stall_id,
                stall_code: c.stall?.stall_code || null, // Magic fix
                text: c.text,
                colSpan: c.colSpan || 1,
                rowSpan: c.rowSpan || 1,
            })),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Map_Layout_Export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 🔥 SMART IMPORT: Searches by Stall Code first to survive DB resets
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (
                    json.total_rows &&
                    json.total_cols &&
                    Array.isArray(json.cells)
                ) {
                    const hydratedCells = json.cells.map((cell: any) => {
                        let stallObj = null;

                        if (cell.type === "stall") {
                            // 1. Try to find by Stall Code first (survives database wipes)
                            if (cell.stall_code) {
                                stallObj =
                                    stalls.find(
                                        (s: any) =>
                                            s.stall_code === cell.stall_code,
                                    ) || null;
                            }
                            // 2. Fallback to old ID method if code isn't there
                            if (!stallObj && cell.stall_id) {
                                stallObj =
                                    stalls.find(
                                        (s: any) => s.id == cell.stall_id,
                                    ) || null;
                            }

                            // 3. Update the cell with the correct LOCAL database ID, or turn it vacant if deleted
                            if (stallObj) {
                                cell.stall_id = stallObj.id;
                            } else {
                                cell.type = "vacant";
                                cell.stall_id = null;
                            }
                        }

                        return {
                            ...cell,
                            id: `imported-${Math.random()}`,
                            stall: stallObj,
                        };
                    });

                    setGridDims({
                        rows: json.total_rows,
                        cols: json.total_cols,
                    });
                    setGridCells(hydratedCells);

                    setDialog({
                        isOpen: true,
                        type: "alert",
                        title: "Import Successful",
                        message:
                            "Layout loaded! Click 'Update Map Layout' to save it to the database.",
                        confirmText: "Awesome!",
                        confirmColor:
                            "bg-emerald-600 hover:bg-emerald-700 text-white",
                        icon: "solar:check-circle-bold-duotone",
                        iconColor: "text-emerald-500",
                        onConfirm: closeDialog,
                    });
                } else {
                    throw new Error("Invalid format");
                }
            } catch (err) {
                alert(
                    "Failed to parse JSON file. Ensure it is a valid map layout export.",
                );
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const generateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        postGen(route("layouts.generate"));
    };

    const activeFloorData = buildings
        ?.flatMap((b: any) =>
            b.floors.map((f: any) => ({ ...f, building_name: b.name })),
        )
        .find((f: any) => f.id === parseInt(selectedFloor));

    return (
        <AuthenticatedLayout>
            <Head title="Stall Layout Mapper" />

            <Modal show={dialog.isOpen} onClose={closeDialog} maxWidth="sm">
                <div className="p-6 text-center">
                    <div
                        className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 border-2 bg-slate-50 ${dialog.iconColor.replace("text-", "border-")}`}
                    >
                        <Icon
                            icon={dialog.icon}
                            className={`h-8 w-8 ${dialog.iconColor}`}
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                        {dialog.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mb-6 px-2">
                        {dialog.message}
                    </p>
                    <div className="flex justify-center gap-3">
                        {dialog.type === "confirm" && (
                            <button
                                onClick={closeDialog}
                                className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors uppercase text-xs"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={dialog.onConfirm}
                            className={`px-5 py-2.5 font-black rounded-lg transition-colors shadow-sm uppercase text-xs ${dialog.confirmColor}`}
                        >
                            {dialog.confirmText}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
                <MapSidebar
                    isOpen={isSidebarOpen}
                    buildings={buildings}
                    selectedFloor={selectedFloor}
                    onFloorChange={handleFloorChange}
                    layout={layout}
                    gridCells={gridCells}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    selectedStallId={selectedStallId}
                    setSelectedStallId={setSelectedStallId}
                    stalls={stalls}
                    onSave={saveLayout}
                    customText={customText}
                    setCustomText={setCustomText}
                    onExport={handleExport}
                    onImport={handleImport}
                />

                <div className="flex-1 bg-slate-200 overflow-hidden relative flex items-center justify-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute top-4 left-4 z-[90] bg-white p-2.5 rounded-xl shadow-lg border-2 border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-colors cursor-pointer"
                    >
                        <Icon
                            icon={
                                isSidebarOpen
                                    ? "solar:sidebar-minimalistic-bold-duotone"
                                    : "solar:sidebar-minimalistic-outline"
                            }
                            className="w-6 h-6"
                        />
                    </button>

                    {!selectedFloor ? (
                        <div className="text-center text-slate-400">
                            <Icon
                                icon="solar:map-arrow-up-bold-duotone"
                                className="w-24 h-24 mx-auto mb-4 opacity-50"
                            />
                            <h2 className="text-xl font-black uppercase tracking-widest">
                                Select a Facility Level
                            </h2>
                            <p className="text-sm font-bold">
                                Please search and select a building/floor from
                                the sidebar.
                            </p>
                        </div>
                    ) : selectedFloor && !layout ? (
                        <GridGenerator
                            genData={genData}
                            setGenData={setGenData}
                            onSubmit={generateGrid}
                            processing={genProcessing}
                        />
                    ) : (
                        <InteractiveGrid
                            layout={layout}
                            gridCells={gridCells}
                            setGridCells={setGridCells}
                            gridDims={gridDims}
                            activeFloorData={activeFloorData}
                            activeTool={activeTool}
                            onCellClick={handleCellClick}
                            onClearAll={handleClearAll}
                            onRevert={handleRevert}
                            onInsertRow={insertRow}
                            onDeleteRow={deleteRow}
                            onInsertCol={insertCol}
                            onDeleteCol={deleteCol}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
