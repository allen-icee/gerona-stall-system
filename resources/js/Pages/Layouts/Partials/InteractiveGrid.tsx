import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

export default function InteractiveGrid({
    gridCells,
    setGridCells,
    gridDims,
    activeFloorData,
    activeTool,
    onCellClick,
    onClearAll,
    onRevert,
    onInsertRow,
    onDeleteRow,
    onInsertCol,
    onDeleteCol,
}: any) {
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tooltip, setTooltip] = useState({
        show: false,
        x: 0,
        y: 0,
        data: null as any,
    });
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const [selectedMapStallId, setSelectedMapStallId] = useState<number | null>(
        null,
    );
    const [selectedSpanIndex, setSelectedSpanIndex] = useState<number | null>(
        null,
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                setZoom((z) =>
                    e.deltaY < 0
                        ? Math.min(3, z + 0.1)
                        : Math.max(0.4, z - 0.1),
                );
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                if (e.key === "=" || e.key === "+") {
                    e.preventDefault();
                    setZoom((z) => Math.min(3, z + 0.1));
                } else if (e.key === "-") {
                    e.preventDefault();
                    setZoom((z) => Math.max(0.4, z - 0.1));
                } else if (e.key === "0") {
                    e.preventDefault();
                    setZoom(1);
                }
            }
            if (e.key === "Escape") {
                setSelectedMapStallId(null);
                setSelectedSpanIndex(null);
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

    const cellSize = 56 * zoom;
    const headerSize = 30;

    const { hiddenCells, cellSpans } = useMemo(() => {
        const hidden = new Set<number>();
        const spans = new Map<number, { colSpan: number; rowSpan: number }>();

        gridCells.forEach((cell: any, i: number) => {
            if (hidden.has(i)) return;
            const isSpannable = [
                "text",
                "wall",
                "walkway",
                "restroom",
                "stairs",
            ].includes(cell.type);
            const colSpan = isSpannable ? cell.colSpan || 1 : 1;
            const rowSpan = isSpannable ? cell.rowSpan || 1 : 1;

            if (colSpan > 1 || rowSpan > 1) {
                spans.set(i, { colSpan, rowSpan });
                const r = Math.floor(i / gridDims.cols);
                const c = i % gridDims.cols;
                for (let dr = 0; dr < rowSpan; dr++) {
                    for (let dc = 0; dc < colSpan; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const hiddenR = r + dr;
                        const hiddenC = c + dc;
                        if (
                            hiddenR < gridDims.rows &&
                            hiddenC < gridDims.cols
                        ) {
                            hidden.add(hiddenR * gridDims.cols + hiddenC);
                        }
                    }
                }
            }
        });
        return { hiddenCells: hidden, cellSpans: spans };
    }, [gridCells, gridDims]);

    const isRangeVacant = (
        rStart: number,
        rEnd: number,
        cStart: number,
        cEnd: number,
    ) => {
        for (let r = rStart; r <= rEnd; r++) {
            for (let c = cStart; c <= cEnd; c++) {
                const idx = r * gridDims.cols + c;
                if (idx >= gridCells.length || idx < 0) return false;
                if (gridCells[idx].type !== "vacant") return false;
                if (hiddenCells.has(idx)) return false;
            }
        }
        return true;
    };

    const handleExpandSpanRight = (index: number) => {
        const newCells = [...gridCells];
        const cell = { ...newCells[index] };
        const r = Math.floor(index / gridDims.cols);
        const c = index % gridDims.cols;
        const colSpan = cell.colSpan || 1;
        const rowSpan = cell.rowSpan || 1;

        if (c + colSpan >= gridDims.cols) return;
        if (!isRangeVacant(r, r + rowSpan - 1, c + colSpan, c + colSpan))
            return alert("Cannot expand: Space is occupied.");

        cell.colSpan = colSpan + 1;
        newCells[index] = cell;
        setGridCells(newCells);
    };

    const handleShrinkSpanRight = (index: number) => {
        const newCells = [...gridCells];
        const cell = { ...newCells[index] };
        if ((cell.colSpan || 1) <= 1) return;
        cell.colSpan = (cell.colSpan || 1) - 1;
        newCells[index] = cell;
        setGridCells(newCells);
    };

    const handleExpandSpanDown = (index: number) => {
        const newCells = [...gridCells];
        const cell = { ...newCells[index] };
        const r = Math.floor(index / gridDims.cols);
        const c = index % gridDims.cols;
        const colSpan = cell.colSpan || 1;
        const rowSpan = cell.rowSpan || 1;

        if (r + rowSpan >= gridDims.rows) return;
        if (!isRangeVacant(r + rowSpan, r + rowSpan, c, c + colSpan - 1))
            return alert("Cannot expand: Space is occupied.");

        cell.rowSpan = rowSpan + 1;
        newCells[index] = cell;
        setGridCells(newCells);
    };

    const handleShrinkSpanDown = (index: number) => {
        const newCells = [...gridCells];
        const cell = { ...newCells[index] };
        if ((cell.rowSpan || 1) <= 1) return;
        cell.rowSpan = (cell.rowSpan || 1) - 1;
        newCells[index] = cell;
        setGridCells(newCells);
    };

    const placedStalls = useMemo(() => {
        const map = new Map();
        gridCells.forEach((cell: any, index: number) => {
            if (cell.type === "stall" && cell.stall) {
                const r = Math.floor(index / gridDims.cols);
                const c = index % gridDims.cols;
                if (!map.has(cell.stall.id)) {
                    map.set(cell.stall.id, {
                        stall: cell.stall,
                        minR: r,
                        maxR: r,
                        minC: c,
                        maxC: c,
                    });
                } else {
                    const s = map.get(cell.stall.id);
                    s.minR = Math.min(s.minR, r);
                    s.maxR = Math.max(s.maxR, r);
                    s.minC = Math.min(s.minC, c);
                    s.maxC = Math.max(s.maxC, c);
                }
            }
        });
        return Array.from(map.values());
    }, [gridCells, gridDims]);

    const setRange = (
        rStart: number,
        rEnd: number,
        cStart: number,
        cEnd: number,
        stall: any,
    ) => {
        const newCells = [...gridCells];
        for (let r = rStart; r <= rEnd; r++) {
            for (let c = cStart; c <= cEnd; c++) {
                const idx = r * gridDims.cols + c;
                newCells[idx] = {
                    ...newCells[idx],
                    type: stall ? "stall" : "vacant",
                    stall_id: stall ? stall.id : null,
                    stall,
                };
            }
        }
        setGridCells(newCells);
    };

    const handleExpandRight = (stallId: number) => {
        const s = placedStalls.find((p) => p.stall.id === stallId);
        if (!s || s.maxC + 1 >= gridDims.cols) return;
        if (!isRangeVacant(s.minR, s.maxR, s.maxC + 1, s.maxC + 1))
            return alert("Cannot expand: Space is occupied.");
        setRange(s.minR, s.maxR, s.maxC + 1, s.maxC + 1, s.stall);
    };
    const handleShrinkRight = (stallId: number) => {
        const s = placedStalls.find((p) => p.stall.id === stallId);
        if (!s || s.maxC === s.minC) return;
        setRange(s.minR, s.maxR, s.maxC, s.maxC, null);
    };
    const handleExpandDown = (stallId: number) => {
        const s = placedStalls.find((p) => p.stall.id === stallId);
        if (!s || s.maxR + 1 >= gridDims.rows) return;
        if (!isRangeVacant(s.maxR + 1, s.maxR + 1, s.minC, s.maxC))
            return alert("Cannot expand: Space is occupied.");
        setRange(s.maxR + 1, s.maxR + 1, s.minC, s.maxC, s.stall);
    };
    const handleShrinkDown = (stallId: number) => {
        const s = placedStalls.find((p) => p.stall.id === stallId);
        if (!s || s.maxR === s.minR) return;
        setRange(s.maxR, s.maxR, s.minC, s.maxC, null);
    };
    const handleRemoveStall = (stallId: number) => {
        const s = placedStalls.find((p) => p.stall.id === stallId);
        if (!s) return;
        setRange(s.minR, s.maxR, s.minC, s.maxC, null);
        setSelectedMapStallId(null);
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden flex flex-col bg-slate-200/50"
            onClick={() => {
                setSelectedMapStallId(null);
                setSelectedSpanIndex(null);
            }}
        >
            <div
                className={`absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-96 max-w-[90%] pointer-events-none transition-all duration-300 top-6`}
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

            <div className="absolute bottom-6 left-6 z-50 flex flex-col items-start gap-2 pointer-events-auto">
                {isControlsOpen && (
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-slate-200/80 animate-fade-in-up origin-bottom-left">
                        <div className="flex gap-1.5">
                            <button
                                onClick={onRevert}
                                className="flex flex-col items-center justify-center p-2 w-16 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:history-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[8px] font-black uppercase mt-1 text-center leading-tight">
                                    Revert
                                </span>
                            </button>
                            <button
                                onClick={onClearAll}
                                className="flex flex-col items-center justify-center p-2 w-16 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                            >
                                <Icon
                                    icon="solar:eraser-bold-duotone"
                                    className="w-5 h-5"
                                />
                                <span className="text-[8px] font-black uppercase mt-1 text-center leading-tight">
                                    Clear All
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
                            {isControlsOpen ? "Close Tools" : "Map Options"}
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

            <div className="absolute right-6 bottom-6 z-40 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-xl border-2 border-slate-300 pointer-events-auto">
                <button
                    onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
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
                ref={containerRef}
                className="w-full h-full p-12 overflow-auto flex transition-all cursor-default"
            >
                <div className="m-auto bg-white p-6 rounded-2xl shadow-2xl border-4 border-slate-300 inline-block transition-all duration-300 ease-out">
                    <div className="relative">
                        <div
                            className="grid gap-0"
                            style={{
                                gridTemplateColumns: `${headerSize}px repeat(${gridDims.cols}, ${cellSize}px) ${headerSize}px`,
                                gridTemplateRows: `${headerSize}px repeat(${gridDims.rows}, ${cellSize}px) auto`,
                            }}
                        >
                            <div style={{ gridColumn: 1, gridRow: 1 }}></div>

                            {Array.from({ length: gridDims.cols }).map(
                                (_, c) => (
                                    <div
                                        key={`col-ctrl-${c}`}
                                        className="group relative flex justify-center items-end pb-1"
                                        style={{
                                            gridColumn: c + 2,
                                            gridRow: 1,
                                        }}
                                    >
                                        <div className="hidden group-hover:flex items-center justify-center gap-1 bg-white rounded-t-lg shadow-md border border-b-0 border-slate-300 px-1 py-1 absolute bottom-0 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onInsertCol(c);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 p-0.5 rounded transition-colors cursor-pointer"
                                            >
                                                <Icon
                                                    icon="solar:add-square-bold"
                                                    className="w-4 h-4"
                                                />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteCol(c);
                                                }}
                                                className="text-rose-500 hover:text-rose-700 bg-rose-50 p-0.5 rounded transition-colors cursor-pointer"
                                            >
                                                <Icon
                                                    icon="solar:trash-bin-trash-bold"
                                                    className="w-4 h-4"
                                                />
                                            </button>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ),
                            )}

                            <div
                                className="flex items-end justify-start pl-1 pb-1"
                                style={{
                                    gridColumn: gridDims.cols + 2,
                                    gridRow: 1,
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onInsertCol(gridDims.cols);
                                    }}
                                    className="text-slate-400 hover:text-white hover:bg-blue-500 bg-slate-50 border border-slate-200 shadow-sm rounded p-1 transition-all cursor-pointer"
                                >
                                    <Icon
                                        icon="solar:add-square-bold"
                                        className="w-4 h-4"
                                    />
                                </button>
                            </div>

                            {Array.from({ length: gridDims.rows }).map(
                                (_, r) => (
                                    <React.Fragment key={`row-${r}`}>
                                        <div
                                            className="group relative flex items-center justify-end pr-1"
                                            style={{
                                                gridColumn: 1,
                                                gridRow: r + 2,
                                            }}
                                        >
                                            <div className="hidden group-hover:flex flex-col items-center justify-center gap-1 bg-white rounded-l-lg shadow-md border border-r-0 border-slate-300 px-1 py-1 absolute right-0 z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onInsertRow(r);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-0.5 rounded transition-colors cursor-pointer"
                                                >
                                                    <Icon
                                                        icon="solar:add-square-bold"
                                                        className="w-4 h-4"
                                                    />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteRow(r);
                                                    }}
                                                    className="text-rose-500 hover:text-rose-700 bg-rose-50 p-0.5 rounded transition-colors cursor-pointer"
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        className="w-4 h-4"
                                                    />
                                                </button>
                                            </div>
                                            <div className="h-full w-2 bg-slate-200 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>

                                        {gridCells
                                            .slice(
                                                r * gridDims.cols,
                                                (r + 1) * gridDims.cols,
                                            )
                                            .map((cell: any, c: number) => {
                                                const globalIndex =
                                                    r * gridDims.cols + c;
                                                if (
                                                    hiddenCells.has(globalIndex)
                                                )
                                                    return null;

                                                const spans = cellSpans.get(
                                                    globalIndex,
                                                ) || { colSpan: 1, rowSpan: 1 };
                                                let cellStyle =
                                                    "bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 border-b border-r relative group";
                                                let content: any = "";
                                                const isSelectedSpan =
                                                    selectedSpanIndex ===
                                                    globalIndex;

                                                if (cell.type === "walkway") {
                                                    cellStyle =
                                                        "bg-slate-300 border-slate-400 border-solid text-slate-600 border-b border-r relative flex items-center justify-center";
                                                } else if (
                                                    cell.type === "restroom"
                                                ) {
                                                    cellStyle =
                                                        "bg-cyan-100 border-cyan-300 border-solid text-cyan-700 border-b border-r relative flex items-center justify-center font-black";
                                                    content = "CR";
                                                } else if (
                                                    cell.type === "stairs"
                                                ) {
                                                    cellStyle =
                                                        "bg-purple-100 border-purple-300 border-solid text-purple-700 border-b border-r relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjNmNGY2Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTllY2Y1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] flex items-center justify-center";
                                                    content = (
                                                        <Icon
                                                            icon="solar:double-alt-arrow-up-bold-duotone"
                                                            className="w-1/2 h-1/2 opacity-40"
                                                        />
                                                    );
                                                } else if (
                                                    cell.type === "wall"
                                                ) {
                                                    cellStyle =
                                                        "bg-slate-800 border-slate-900 border-solid text-slate-500 shadow-inner border-b border-r relative";
                                                } else if (
                                                    cell.type === "stall"
                                                ) {
                                                    cellStyle =
                                                        "bg-transparent border-none relative";
                                                    content = null;
                                                } else if (
                                                    cell.type === "text"
                                                ) {
                                                    const minSpan = Math.min(
                                                        spans.colSpan,
                                                        spans.rowSpan,
                                                    );
                                                    const dynamicFontSize =
                                                        Math.max(
                                                            10,
                                                            14 *
                                                                zoom *
                                                                Math.min(
                                                                    2,
                                                                    minSpan,
                                                                ),
                                                        );
                                                    cellStyle =
                                                        "bg-white/40 backdrop-blur-[2px] border-2 border-indigo-200 border-dashed hover:border-indigo-400 text-indigo-900 font-black flex items-center justify-center z-20 p-2 relative transition-all";
                                                    content = (
                                                        <span
                                                            className="drop-shadow-sm text-center break-words w-full leading-tight"
                                                            style={{
                                                                fontSize: `${dynamicFontSize}px`,
                                                            }}
                                                        >
                                                            {cell.text ||
                                                                "Text"}
                                                        </span>
                                                    );
                                                }

                                                if (isSelectedSpan) {
                                                    cellStyle +=
                                                        " ring-4 ring-blue-500 ring-offset-1 shadow-xl z-[50] scale-[1.02] border-blue-600 border-solid border-2";
                                                }

                                                return (
                                                    <div
                                                        key={
                                                            cell.id ||
                                                            `${r}-${c}`
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMapStallId(
                                                                null,
                                                            );
                                                            onCellClick(
                                                                globalIndex,
                                                            );
                                                            if (
                                                                [
                                                                    "text",
                                                                    "wall",
                                                                    "walkway",
                                                                    "restroom",
                                                                    "stairs",
                                                                ].includes(
                                                                    activeTool,
                                                                ) ||
                                                                [
                                                                    "text",
                                                                    "wall",
                                                                    "walkway",
                                                                    "restroom",
                                                                    "stairs",
                                                                ].includes(
                                                                    cell.type,
                                                                )
                                                            ) {
                                                                setSelectedSpanIndex(
                                                                    globalIndex,
                                                                );
                                                            } else {
                                                                setSelectedSpanIndex(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                        className={`transition-all select-none cursor-pointer ${cellStyle}`}
                                                        style={{
                                                            gridColumn: `${c + 2} / span ${spans.colSpan}`,
                                                            gridRow: `${r + 2} / span ${spans.rowSpan}`,
                                                        }}
                                                    >
                                                        {content &&
                                                            (typeof content ===
                                                            "string" ? (
                                                                <span className="drop-shadow-md bg-white/50 px-1 rounded truncate max-w-full text-center">
                                                                    {content}
                                                                </span>
                                                            ) : (
                                                                content
                                                            ))}

                                                        {isSelectedSpan && (
                                                            <>
                                                                <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-slate-800 p-1 rounded-lg shadow-xl z-[60] pointer-events-auto border border-slate-600">
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleExpandSpanRight(
                                                                                globalIndex,
                                                                            );
                                                                        }}
                                                                        title="Expand Width"
                                                                        className="bg-slate-700 hover:bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                                    >
                                                                        <Icon icon="solar:add-square-bold" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleShrinkSpanRight(
                                                                                globalIndex,
                                                                            );
                                                                        }}
                                                                        title="Shrink Width"
                                                                        className="bg-slate-700 hover:bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                                    >
                                                                        <Icon icon="solar:minus-square-bold" />
                                                                    </button>
                                                                </div>
                                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800 p-1 rounded-lg shadow-xl z-[60] pointer-events-auto border border-slate-600">
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleExpandSpanDown(
                                                                                globalIndex,
                                                                            );
                                                                        }}
                                                                        title="Expand Height"
                                                                        className="bg-slate-700 hover:bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                                    >
                                                                        <Icon icon="solar:add-square-bold" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleShrinkSpanDown(
                                                                                globalIndex,
                                                                            );
                                                                        }}
                                                                        title="Shrink Height"
                                                                        className="bg-slate-700 hover:bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                                    >
                                                                        <Icon icon="solar:minus-square-bold" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        <div
                                            style={{
                                                gridColumn: gridDims.cols + 2,
                                                gridRow: r + 2,
                                            }}
                                        ></div>
                                    </React.Fragment>
                                ),
                            )}

                            <div
                                className="col-span-full pt-1 flex justify-center pb-2"
                                style={{
                                    gridColumn: `2 / span ${gridDims.cols}`,
                                    gridRow: gridDims.rows + 2,
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onInsertRow(gridDims.rows);
                                    }}
                                    className="flex items-center gap-1 text-[10px] uppercase font-black text-slate-500 bg-white px-4 py-1.5 border border-slate-200 shadow-sm hover:bg-blue-500 hover:border-blue-600 hover:text-white rounded-full transition-colors cursor-pointer"
                                >
                                    <Icon
                                        icon="solar:add-square-bold"
                                        className="w-4 h-4"
                                    />{" "}
                                    Add Row
                                </button>
                            </div>
                        </div>

                        {placedStalls.map((s) => {
                            const top = headerSize + s.minR * cellSize;
                            const left = headerSize + s.minC * cellSize;
                            const width = (s.maxC - s.minC + 1) * cellSize;
                            const height = (s.maxR - s.minR + 1) * cellSize;

                            let dbColor =
                                s.stall.computed_status?.color || "#10B981";
                            let textColor = dbColor;
                            let bgColor = `${dbColor}20`;
                            let borderColor = dbColor;

                            // Handle Occupied (White) so it isn't invisible
                            if (
                                dbColor.toLowerCase() === "#ffffff" ||
                                dbColor.toLowerCase() === "#fff"
                            ) {
                                textColor = "#334155";
                                bgColor = "#f8fafc";
                                borderColor = "#cbd5e1";
                            }

                            const isSelected =
                                selectedMapStallId === s.stall.id;

                            let isHighlighted = false;
                            let isDimmed = false;

                            if (searchQuery.trim() !== "") {
                                const searchLower = searchQuery.toLowerCase();
                                const tenantName =
                                    `${s.stall.active_contract?.tenant?.first_name || ""} ${s.stall.active_contract?.tenant?.last_name || ""}`.toLowerCase();
                                const companyName = (
                                    s.stall.active_contract?.tenant
                                        ?.company_name || ""
                                ).toLowerCase();
                                const stallCode = (
                                    s.stall.stall_code || ""
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
                            }

                            const overlayStyle = `absolute rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border-2 ${isSelected ? "ring-4 ring-blue-500 border-blue-600 z-[55] shadow-2xl scale-[1.02]" : "shadow-sm hover:scale-[1.01] z-30 hover:shadow-lg"} ${isHighlighted ? "ring-4 ring-amber-400 scale-110 z-[60] shadow-2xl" : ""} ${isDimmed ? "opacity-25 grayscale" : ""}`;

                            return (
                                <div
                                    key={`overlay-${s.stall.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeTool === "vacant") {
                                            handleRemoveStall(s.stall.id);
                                        } else {
                                            setSelectedSpanIndex(null);
                                            setSelectedMapStallId(s.stall.id);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected)
                                            setTooltip({
                                                show: true,
                                                x: e.clientX,
                                                y: e.clientY,
                                                data: s.stall,
                                            });
                                    }}
                                    onMouseMove={(e) => {
                                        if (tooltip.show)
                                            setTooltip((prev) => ({
                                                ...prev,
                                                x: e.clientX,
                                                y: e.clientY,
                                            }));
                                    }}
                                    onMouseLeave={() =>
                                        setTooltip({
                                            show: false,
                                            x: 0,
                                            y: 0,
                                            data: null,
                                        })
                                    }
                                    className={overlayStyle}
                                    style={{
                                        top,
                                        left,
                                        width,
                                        height,
                                        backgroundColor: bgColor,
                                        borderColor: borderColor,
                                    }}
                                >
                                    <span
                                        className="font-black drop-shadow-md truncate px-1"
                                        style={{
                                            fontSize: `${Math.max(10, 12 * zoom)}px`,
                                            color: textColor,
                                        }}
                                    >
                                        {s.stall.stall_code}
                                    </span>
                                    {s.stall.active_contract?.tenant && (
                                        <span
                                            className="font-bold drop-shadow-md truncate w-full text-center px-1 tracking-tight"
                                            style={{
                                                fontSize: `${Math.max(8, 10 * zoom)}px`,
                                                color: textColor,
                                            }}
                                        >
                                            {
                                                s.stall.active_contract.tenant
                                                    .last_name
                                            }
                                        </span>
                                    )}

                                    {isSelected && (
                                        <>
                                            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-slate-800 p-1 rounded-lg shadow-xl pointer-events-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExpandRight(
                                                            s.stall.id,
                                                        );
                                                    }}
                                                    title="Expand Right"
                                                    className="bg-slate-700 hover:bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                >
                                                    <Icon icon="solar:add-square-bold" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShrinkRight(
                                                            s.stall.id,
                                                        );
                                                    }}
                                                    title="Shrink Right"
                                                    className="bg-slate-700 hover:bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                >
                                                    <Icon icon="solar:minus-square-bold" />
                                                </button>
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800 p-1 rounded-lg shadow-xl pointer-events-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExpandDown(
                                                            s.stall.id,
                                                        );
                                                    }}
                                                    title="Expand Down"
                                                    className="bg-slate-700 hover:bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                >
                                                    <Icon icon="solar:add-square-bold" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShrinkDown(
                                                            s.stall.id,
                                                        );
                                                    }}
                                                    title="Shrink Up"
                                                    className="bg-slate-700 hover:bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                                                >
                                                    <Icon icon="solar:minus-square-bold" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveStall(
                                                        s.stall.id,
                                                    );
                                                }}
                                                title="Delete from Map"
                                                className="absolute -top-3 -right-3 bg-rose-600 hover:bg-rose-500 text-white w-6 h-6 rounded-full shadow-xl flex items-center justify-center border-2 border-white cursor-pointer"
                                            >
                                                <Icon
                                                    icon="solar:trash-bin-trash-bold"
                                                    className="w-3 h-3"
                                                />
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {tooltip.show &&
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
                    </div>,
                    document.body,
                )}
        </div>
    );
}
