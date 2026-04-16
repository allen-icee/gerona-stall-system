//resources\js\Pages\Layouts\Partials\InteractiveGrid.tsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

export default function InteractiveGrid({
    layout,
    gridCells,
    activeFloorData,
    onCellClick,
    onClearAll,
    onRevert,
    onExpandRow,
    onExpandCol,
    onShrinkRow,
    onShrinkCol,
    onQuickPaint,
}: any) {
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [tooltip, setTooltip] = useState({
        show: false,
        x: 0,
        y: 0,
        data: null as any,
    });

    const [expandAmount, setExpandAmount] = useState(1);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const [paintMode, setPaintMode] = useState<{
        id: string;
        color: string;
        label: string;
    } | null>(null);

    const paintStatuses = [
        {
            id: "vacant",
            color: "#00ff00",
            label: "Vacant",
            icon: "solar:check-circle-bold",
        },
        {
            id: "signed",
            color: "#ffffff",
            label: "Signed",
            icon: "solar:pen-new-square-bold",
        },
        {
            id: "for_contract",
            color: "#ffff00",
            label: "For Contract",
            icon: "solar:document-text-bold",
        },
        {
            id: "for_signing",
            color: "#00ffff",
            label: "For Signing",
            icon: "solar:pen-bold",
        },
        {
            id: "waiting_permit",
            color: "#ff00ff",
            label: "Waiting Permit",
            icon: "solar:clock-circle-bold",
        },
        {
            id: "on_process",
            color: "#999999",
            label: "On Process",
            icon: "solar:settings-bold",
        },
        {
            id: "confirm_permit",
            color: "#9900ff",
            label: "Confirm Permit",
            icon: "solar:verified-check-bold",
        },
        {
            id: "unpaid",
            color: "#ff0000",
            label: "Unpaid",
            icon: "solar:danger-triangle-bold",
        },
        {
            id: "closed",
            color: "#f4cccc",
            label: "Closed / Locked",
            icon: "solar:lock-bold",
        },
    ];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoom((z) => Math.min(3, z + 0.1));
                } else {
                    setZoom((z) => Math.max(0.2, z - 0.1));
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                if (e.key === "=" || e.key === "+") {
                    e.preventDefault();
                    setZoom((z) => Math.min(3, z + 0.1));
                } else if (e.key === "-") {
                    e.preventDefault();
                    setZoom((z) => Math.max(0.2, z - 0.1));
                } else if (e.key === "0") {
                    e.preventDefault();
                    setZoom(1);
                }
            }
            if (e.key === "Escape") {
                setPaintMode(null);
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            container.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const formatPrice = (stall: any) => {
        if (stall.stall_type === "sqm_based")
            return `₱${(Number(stall.size_sqm || 0) * Number(stall.rate_per_sqm || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (stall.stall_type === "class_based")
            return `₱${Number(stall.fixed_rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        return "Manual Setup";
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden flex flex-col bg-slate-100"
        >
            {paintMode && (
                <div
                    className="absolute top-0 left-0 w-full bg-slate-900 text-white py-2 z-[60] flex items-center justify-center gap-4 animate-fade-in-down shadow-lg border-b-4"
                    style={{ borderColor: paintMode.color }}
                >
                    <Icon
                        icon="solar:format-painter-bold-duotone"
                        className="w-5 h-5 animate-pulse"
                        style={{ color: paintMode.color }}
                    />
                    <span className="text-sm font-black tracking-widest uppercase">
                        Paint Mode Active:{" "}
                        <span style={{ color: paintMode.color }}>
                            {paintMode.label}
                        </span>
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        Click a stall to apply. Press ESC to cancel.
                    </span>
                    <button
                        onClick={() => setPaintMode(null)}
                        className="ml-4 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                        [ Cancel ]
                    </button>
                </div>
            )}

            <div
                className={`absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-96 max-w-[90%] pointer-events-none transition-all duration-300 ${paintMode ? "top-14" : "top-6"}`}
            >
                <div className="relative shadow-2xl rounded-full w-full mb-4 pointer-events-auto border-2 border-slate-300">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon
                            icon="solar:magnifer-linear"
                            className="h-5 w-5 text-slate-400"
                        />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search occupant, company, or stall..."
                        className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border-2 border-slate-200 flex flex-col gap-2 items-center pointer-events-auto max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 border-b-2 border-slate-200 pb-1 w-full text-center">
                    Paint
                </div>
                {paintStatuses.map((status) => (
                    <button
                        key={status.id}
                        onClick={() =>
                            setPaintMode(
                                paintMode?.id === status.id ? null : status,
                            )
                        }
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 shrink-0 ${paintMode?.id === status.id ? "scale-110 shadow-lg ring-4 ring-offset-2" : "hover:scale-105 border-transparent shadow-sm"}`}
                        style={{
                            backgroundColor: status.color,
                            ["--tw-ring-color" as any]: status.color,
                        }}
                        title={`Paint as ${status.label}`}
                    >
                        <Icon
                            icon={status.icon}
                            className={`w-6 h-6 ${paintMode?.id === status.id ? "text-slate-900" : "text-slate-800/70"}`}
                        />
                    </button>
                ))}
            </div>

            <div className="absolute bottom-6 left-6 z-50 flex flex-col items-start gap-2 pointer-events-auto">
                {isControlsOpen && (
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-slate-200/80 animate-fade-in-up origin-bottom-left">
                        <div className="flex flex-col items-center justify-center border-r-2 border-slate-200 pr-2">
                            <label className="text-[7px] font-black uppercase text-slate-500 mb-1">
                                Add/Del Qty
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={expandAmount}
                                onChange={(e) =>
                                    setExpandAmount(
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                className="w-12 h-10 text-center text-sm font-black border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-0 cursor-pointer"
                            />
                        </div>

                        <div className="flex gap-1.5 border-r-2 border-slate-200 pr-2">
                            <button
                                onClick={() => onExpandRow(expandAmount)}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:row-bottom-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    + Row
                                </span>
                            </button>
                            <button
                                onClick={() => onShrinkRow(expandAmount)}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:trash-bin-minimalistic-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    - Row
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-1.5 border-r-2 border-slate-200 pr-2">
                            <button
                                onClick={() => onExpandCol(expandAmount)}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:sidebar-right-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    + Col
                                </span>
                            </button>
                            <button
                                onClick={() => onShrinkCol(expandAmount)}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:trash-bin-minimalistic-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    - Col
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-1.5">
                            <button
                                onClick={onRevert}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:history-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    Revert
                                </span>
                            </button>
                            <button
                                onClick={onClearAll}
                                className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:eraser-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                                    Clear
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsControlsOpen(!isControlsOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl transition-colors border-2 pointer-events-auto cursor-pointer ${isControlsOpen ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-800" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-900"}`}
                    >
                        <Icon
                            icon={
                                isControlsOpen
                                    ? "solar:close-circle-bold"
                                    : "solar:settings-minimalistic-bold-duotone"
                            }
                            className="w-5 h-5"
                        />
                        <span className="text-[11px] font-black uppercase tracking-wider">
                            {isControlsOpen ? "Close Tools" : "Grid Tools"}
                        </span>
                    </button>

                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2 rounded-xl shadow-2xl flex flex-col justify-center border border-slate-700">
                        <h1 className="text-[11px] font-black uppercase tracking-widest leading-none mb-0.5">
                            {activeFloorData?.building_name || "Unknown"}
                        </h1>
                        <h2 className="text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                            {activeFloorData?.name || "Unknown"}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
                {isLegendOpen && (
                    <div className="bg-white p-5 rounded-2xl shadow-2xl border-2 border-slate-300 mb-3 w-80 animate-fade-in-up origin-bottom-right pointer-events-auto">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-100 pb-2">
                            Color Legend
                        </h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] uppercase font-bold text-slate-600 tracking-tight">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#00ff00]"></div>{" "}
                                Vacant
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#ffffff] border-2 border-slate-300"></div>{" "}
                                Signed
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#ffff00]"></div>{" "}
                                For Contract
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#00ffff]"></div>{" "}
                                For Signing
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#ff00ff]"></div>{" "}
                                Waiting Permit
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#999999]"></div>{" "}
                                On Process
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#9900ff]"></div>{" "}
                                Confirm Permit
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#ff0000]"></div>{" "}
                                Unpaid
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-[#f4cccc]"></div>{" "}
                                Closed
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md shadow-sm bg-slate-300"></div>{" "}
                                Walkway
                            </div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsLegendOpen(!isLegendOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl shadow-xl hover:bg-slate-700 transition-colors border-2 border-slate-900 pointer-events-auto cursor-pointer"
                >
                    <Icon
                        icon="solar:map-point-bold-duotone"
                        className="w-5 h-5"
                    />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                        Legend
                    </span>
                    <Icon
                        icon={
                            isLegendOpen
                                ? "solar:alt-arrow-down-bold"
                                : "solar:alt-arrow-up-bold"
                        }
                        className="w-4 h-4 ml-1"
                    />
                </button>
            </div>

            <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-xl border-2 border-slate-300 pointer-events-auto">
                <button
                    onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                    <Icon
                        icon="solar:minus-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
                <span className="w-16 text-center font-black text-slate-800 text-xs uppercase tracking-wider">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                    <Icon
                        icon="solar:add-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
                <button
                    onClick={() => setZoom(1)}
                    className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors border-2 border-blue-200 cursor-pointer"
                >
                    Reset
                </button>
            </div>

            <div
                className={`overflow-auto w-full h-full p-32 custom-scrollbar flex items-start justify-center transition-all ${paintMode ? "cursor-crosshair" : "cursor-default"}`}
            >
                <div
                    className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-slate-300 inline-block origin-center transition-transform duration-200 ease-out pointer-events-auto"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${layout.total_cols}, 56px)`,
                            gridAutoRows: "56px",
                        }}
                    >
                        {gridCells.map((cell: any, index: number) => {
                            let cellStyle =
                                "bg-slate-50 border-slate-200 border-dashed hover:border-slate-400";
                            let content: any = "";
                            let dbColor = "";

                            let isHighlighted = false;
                            let isDimmed = false;

                            if (searchQuery.trim() !== "") {
                                const searchLower = searchQuery.toLowerCase();
                                if (cell.type === "stall" && cell.stall) {
                                    const tenantName =
                                        `${cell.stall.active_contract?.tenant?.first_name || ""} ${cell.stall.active_contract?.tenant?.last_name || ""}`.toLowerCase();
                                    const companyName = (
                                        cell.stall.active_contract?.tenant
                                            ?.company_name || ""
                                    ).toLowerCase();
                                    const stallCode = (
                                        cell.stall.stall_code || ""
                                    ).toLowerCase();

                                    if (
                                        tenantName.includes(searchLower) ||
                                        companyName.includes(searchLower) ||
                                        stallCode.includes(searchLower)
                                    ) {
                                        isHighlighted = true;
                                    } else {
                                        isDimmed = true;
                                    }
                                } else {
                                    isDimmed = true;
                                }
                            }

                            if (cell.type === "walkway") {
                                cellStyle =
                                    "bg-slate-300 border-slate-400 border-solid text-slate-600";
                            } else if (cell.type === "restroom") {
                                cellStyle =
                                    "bg-cyan-100 border-cyan-300 border-solid text-cyan-700";
                                content = "CR";
                            } else if (cell.type === "stairs") {
                                cellStyle =
                                    "bg-purple-100 border-purple-300 border-solid text-purple-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjNmNGY2Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTllY2Y1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]";
                                content = (
                                    <Icon
                                        icon="solar:double-alt-arrow-up-bold-duotone"
                                        className="w-6 h-6 opacity-70"
                                    />
                                );
                            } else if (cell.type === "wall") {
                                cellStyle =
                                    "bg-slate-800 border-slate-900 border-solid text-slate-500 shadow-inner";
                            } else if (cell.type === "text") {
                                cellStyle =
                                    "bg-transparent border-transparent text-indigo-900 font-black flex items-center justify-center overflow-visible z-10 whitespace-nowrap";
                                content = (
                                    <span className="text-sm drop-shadow-md">
                                        {cell.text || "Text"}
                                    </span>
                                );
                            } else if (cell.type === "stall" && cell.stall) {
                                cellStyle =
                                    "border-solid border-slate-800 shadow-sm text-slate-800 font-black";
                                const tenant =
                                    cell.stall.active_contract?.tenant;

                                content = (
                                    <div className="flex flex-col items-center justify-center leading-none text-center w-full px-1">
                                        <span className="text-[10px] opacity-80">
                                            {cell.stall.stall_code}
                                        </span>
                                        {tenant && (
                                            <span className="text-[9px] truncate w-full mt-1 tracking-tight">
                                                {tenant.last_name}
                                            </span>
                                        )}
                                    </div>
                                );
                                dbColor =
                                    cell.stall.computed_status?.color ||
                                    "#ffffff";
                            }

                            if (isHighlighted) {
                                cellStyle +=
                                    " ring-4 ring-amber-400 scale-110 z-10 shadow-2xl";
                            } else if (isDimmed) {
                                cellStyle += " opacity-25 grayscale";
                            }

                            return (
                                <div
                                    key={cell.id}
                                    onClick={() => {
                                        if (paintMode) {
                                            if (
                                                cell.type === "stall" &&
                                                cell.stall
                                            ) {
                                                onQuickPaint(
                                                    cell.stall.id,
                                                    paintMode.id,
                                                );
                                            }
                                        } else {
                                            onCellClick(index);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            !paintMode &&
                                            cell.type === "stall" &&
                                            cell.stall
                                        ) {
                                            setTooltip({
                                                show: true,
                                                x: e.clientX,
                                                y: e.clientY,
                                                data: cell.stall,
                                            });
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (!paintMode && tooltip.show) {
                                            setTooltip((prev) => ({
                                                ...prev,
                                                x: e.clientX,
                                                y: e.clientY,
                                            }));
                                        }
                                    }}
                                    onMouseLeave={() =>
                                        setTooltip({
                                            show: false,
                                            x: 0,
                                            y: 0,
                                            data: null,
                                        })
                                    }
                                    className={`w-14 h-14 border-2 rounded-md flex items-center justify-center text-xs transition-all select-none ${paintMode ? "hover:ring-4 hover:ring-opacity-50 cursor-crosshair" : "cursor-pointer active:scale-95 hover:scale-105"} ${cellStyle}`}
                                    style={{
                                        backgroundColor: dbColor || undefined,
                                        ["--tw-ring-color" as any]: paintMode
                                            ? paintMode.color
                                            : undefined,
                                    }}
                                >
                                    {content &&
                                        (typeof content === "string" ? (
                                            <span className="drop-shadow-md bg-white/50 px-1 rounded truncate max-w-full">
                                                {content}
                                            </span>
                                        ) : (
                                            content
                                        ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {!paintMode &&
                tooltip.show &&
                tooltip.data &&
                createPortal(
                    <div
                        className="fixed z-[99999] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl pointer-events-auto border border-slate-700 animate-fade-in-up w-56"
                        style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                        onMouseEnter={() =>
                            setTooltip((prev) => ({ ...prev, show: true }))
                        }
                        onMouseLeave={() =>
                            setTooltip({ show: false, x: 0, y: 0, data: null })
                        }
                    >
                        <div className="flex items-center justify-between mb-2 border-b border-slate-700 pb-2">
                            <div className="flex items-center gap-2">
                                <Icon
                                    icon="solar:shop-bold-duotone"
                                    className="text-amber-400 w-5 h-5"
                                />
                                <span className="font-black text-amber-400 text-sm tracking-widest">
                                    {tooltip.data.stall_code}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-800">
                                {formatPrice(tooltip.data)}
                            </span>
                        </div>

                        {tooltip.data.active_contract?.tenant ? (
                            <div className="mb-3">
                                <p className="text-sm font-bold leading-tight text-white">
                                    {
                                        tooltip.data.active_contract.tenant
                                            .first_name
                                    }{" "}
                                    {
                                        tooltip.data.active_contract.tenant
                                            .last_name
                                    }
                                </p>
                                {tooltip.data.active_contract.tenant
                                    .company_name && (
                                    <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">
                                        <Icon
                                            icon="solar:buildings-2-bold"
                                            className="inline mr-1"
                                        />
                                        {
                                            tooltip.data.active_contract.tenant
                                                .company_name
                                        }
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic mb-3">
                                No current occupant.
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <a
                                href={route("contracts.index", {
                                    search: tooltip.data.stall_code,
                                })}
                                className="flex justify-center items-center gap-1 bg-blue-600 text-white text-center py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold hover:bg-blue-500 transition-colors"
                            >
                                <Icon
                                    icon="solar:document-text-bold"
                                    className="w-3 h-3"
                                />{" "}
                                Contracts
                            </a>
                            <a
                                href={route("payments.index", {
                                    search: tooltip.data.stall_code,
                                })}
                                className="flex justify-center items-center gap-1 bg-emerald-600 text-white text-center py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold hover:bg-emerald-500 transition-colors"
                            >
                                <Icon
                                    icon="solar:wallet-bold"
                                    className="w-3 h-3"
                                />{" "}
                                Ledger
                            </a>
                            {tooltip.data.active_contract && (
                                <a
                                    href={route("contracts.index", {
                                        search: tooltip.data.stall_code,
                                    })}
                                    className="col-span-2 flex justify-center items-center gap-1 bg-rose-600 text-white text-center py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold hover:bg-rose-500 transition-colors"
                                >
                                    <Icon
                                        icon="solar:close-circle-bold"
                                        className="w-3 h-3"
                                    />{" "}
                                    Manage Vacancy
                                </a>
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
