import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

export default function InteractiveGrid({
    layout, gridCells, onCellClick, onClearAll, onRevert,
    onExpandRow, onExpandCol, onShrinkRow, onShrinkCol
}: any) {
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // New State for Floating UI
    const [searchQuery, setSearchQuery] = useState("");
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null as any });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoom(z => Math.min(3, z + 0.1));
                } else {
                    setZoom(z => Math.max(0.2, z - 0.1));
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    setZoom(z => Math.min(3, z + 0.1));
                } else if (e.key === '-') {
                    e.preventDefault();
                    setZoom(z => Math.max(0.2, z - 0.1));
                } else if (e.key === '0') {
                    e.preventDefault();
                    setZoom(1);
                }
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            container.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden flex flex-col bg-slate-100">

            {/* 1. FLOATING SEARCH BAR */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-96 max-w-[90%]">
                <div className="relative shadow-2xl rounded-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon icon="solar:magnifer-linear" className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search occupant, company, or stall..."
                        className="w-full bg-white border-2 border-slate-300 rounded-full pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* 2. FLOATING QUICK ACTIONS */}
            <div className="absolute bottom-6 left-6 z-50 flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-slate-200/80">
                <div className="flex gap-1.5 border-r-2 border-slate-200 pr-1.5">
                    <button onClick={onExpandRow} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 transition-all" title="Add Row to Bottom">
                        <Icon icon="solar:row-bottom-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Add<br />Row</span>
                    </button>
                    <button onClick={onShrinkRow} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all" title="Remove Bottom Row">
                        <Icon icon="solar:trash-bin-minimalistic-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Del<br />Row</span>
                    </button>
                </div>

                <div className="flex gap-1.5 border-r-2 border-slate-200 pr-1.5">
                    <button onClick={onExpandCol} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 transition-all" title="Add Column to Right">
                        <Icon icon="solar:sidebar-right-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Add<br />Col</span>
                    </button>
                    <button onClick={onShrinkCol} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all" title="Remove Rightmost Column">
                        <Icon icon="solar:trash-bin-minimalistic-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Del<br />Col</span>
                    </button>
                </div>

                <div className="flex gap-1.5 pl-0.5">
                    <button onClick={onRevert} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 transition-all">
                        <Icon icon="solar:history-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Revert</span>
                    </button>
                    <button onClick={onClearAll} className="flex flex-col items-center justify-center p-2 w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 transition-all">
                        <Icon icon="solar:eraser-bold-duotone" className="w-5 h-5" />
                        <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">Clear</span>
                    </button>
                </div>
            </div>

            {/* 3. UPDATED EXCEL-ALIGNED LEGEND */}
            <div className="absolute bottom-24 right-6 z-50 flex flex-col items-end">
                {isLegendOpen && (
                    <div className="bg-white p-5 rounded-2xl shadow-2xl border-2 border-slate-300 mb-3 w-80 animate-fade-in-up origin-bottom-right">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-100 pb-2">Color Legend</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] uppercase font-bold text-slate-600 tracking-tight">
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#00ff00]"></div> Vacant</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#ffffff] border-2 border-slate-300"></div> Signed</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#ffff00]"></div> For Contract</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#00ffff]"></div> For Signing</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#ff00ff]"></div> Waiting Permit</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#999999]"></div> On Process</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#9900ff]"></div> Confirm Permit</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#ff0000]"></div> Unpaid</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-[#f4cccc]"></div> Closed</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm bg-slate-300"></div> Walkway</div>
                        </div>
                    </div>
                )}
                <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl shadow-xl hover:bg-slate-700 transition-colors border-2 border-slate-900">
                    <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Legend</span>
                    <Icon icon={isLegendOpen ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-up-bold"} className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* 4. ZOOM CONTROLS */}
            <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-xl border-2 border-slate-300">
                <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors">
                    <Icon icon="solar:minus-circle-bold-duotone" className="w-6 h-6" />
                </button>
                <span className="w-16 text-center font-black text-slate-800 text-xs uppercase tracking-wider">
                    {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors">
                    <Icon icon="solar:add-circle-bold-duotone" className="w-6 h-6" />
                </button>
                <button onClick={() => setZoom(1)} className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors border-2 border-blue-200">
                    Reset
                </button>
            </div>

            {/* 5. INTERACTIVE SCROLLABLE GRID */}
            <div className="overflow-auto w-full h-full p-24 custom-scrollbar flex items-start justify-center">
                <div
                    className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-slate-300 inline-block origin-center transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${layout.total_cols}, 56px)`,
                            gridAutoRows: '56px'
                        }}
                    >
                        {gridCells.map((cell: any, index: number) => {
                            let cellStyle = "bg-slate-50 border-slate-200 border-dashed hover:border-slate-400";
                            let content: any = "";
                            let dbColor = "";

                            let isHighlighted = false;
                            let isDimmed = false;

                            if (searchQuery.trim() !== '') {
                                const searchLower = searchQuery.toLowerCase();
                                if (cell.type === 'stall' && cell.stall) {
                                    const tenantName = `${cell.stall.active_contract?.tenant?.first_name || ''} ${cell.stall.active_contract?.tenant?.last_name || ''}`.toLowerCase();
                                    const companyName = (cell.stall.active_contract?.tenant?.company_name || '').toLowerCase();
                                    const stallCode = (cell.stall.stall_code || '').toLowerCase();

                                    if (tenantName.includes(searchLower) || companyName.includes(searchLower) || stallCode.includes(searchLower)) {
                                        isHighlighted = true;
                                    } else {
                                        isDimmed = true;
                                    }
                                } else {
                                    isDimmed = true;
                                }
                            }

                            if (cell.type === 'walkway') {
                                cellStyle = "bg-slate-300 border-slate-400 border-solid text-slate-600";
                            } else if (cell.type === 'restroom') {
                                cellStyle = "bg-cyan-100 border-cyan-300 border-solid text-cyan-700";
                                content = "CR";
                            } else if (cell.type === 'stairs') {
                                cellStyle = "bg-purple-100 border-purple-300 border-solid text-purple-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjNmNGY2Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTllY2Y1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]";
                                content = <Icon icon="solar:double-alt-arrow-up-bold-duotone" className="w-6 h-6 opacity-70" />;
                            } else if (cell.type === 'wall') {
                                cellStyle = "bg-slate-800 border-slate-900 border-solid text-slate-500 shadow-inner";
                            } else if (cell.type === 'stall' && cell.stall) {
                                cellStyle = "border-solid border-slate-800 shadow-sm text-slate-800 font-black";
                                const tenant = cell.stall.active_contract?.tenant;

                                content = (
                                    <div className="flex flex-col items-center justify-center leading-none text-center w-full px-1">
                                        <span className="text-[10px] opacity-80">{cell.stall.stall_code}</span>
                                        {tenant && <span className="text-[9px] truncate w-full mt-1 tracking-tight">{tenant.last_name}</span>}
                                    </div>
                                );

                                // THE FIX: Pulls the color straight from the backend model!
                                dbColor = cell.stall.computed_status?.color || '#ffffff';
                            }

                            if (isHighlighted) {
                                cellStyle += " ring-4 ring-amber-400 scale-110 z-10 shadow-2xl";
                            } else if (isDimmed) {
                                cellStyle += " opacity-25 grayscale";
                            }

                            return (
                                <div
                                    key={cell.id}
                                    onClick={() => onCellClick(index)}
                                    onMouseEnter={(e) => {
                                        if (cell.type === 'stall' && cell.stall) {
                                            setTooltip({ show: true, x: e.clientX, y: e.clientY, data: cell.stall });
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (tooltip.show) {
                                            setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
                                        }
                                    }}
                                    onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, data: null })}
                                    className={`w-14 h-14 border-2 rounded-md flex items-center justify-center text-xs cursor-pointer transition-all active:scale-95 select-none overflow-hidden ${cellStyle}`}
                                    style={dbColor ? { backgroundColor: dbColor } : {}}
                                >
                                    {content && (
                                        typeof content === 'string' ? (
                                            <span className="drop-shadow-md bg-white/50 px-1 rounded truncate max-w-full">
                                                {content}
                                            </span>
                                        ) : content
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 6. DYNAMIC PORTAL TOOLTIP */}
            {tooltip.show && tooltip.data && createPortal(
                <div
                    className="fixed z-[99999] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl pointer-events-none border border-slate-700 animate-fade-in-up"
                    style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                >
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                        <Icon icon="solar:shop-bold-duotone" className="text-amber-400 w-5 h-5" />
                        <span className="font-black text-amber-400 text-sm tracking-widest">{tooltip.data.stall_code}</span>
                    </div>

                    {tooltip.data.active_contract?.tenant ? (
                        <>
                            <p className="text-sm font-bold leading-tight">
                                {tooltip.data.active_contract.tenant.first_name} {tooltip.data.active_contract.tenant.last_name}
                            </p>
                            {tooltip.data.active_contract.tenant.company_name && (
                                <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">
                                    <Icon icon="solar:buildings-2-bold" className="inline mr-1" />
                                    {tooltip.data.active_contract.tenant.company_name}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No current occupant.</p>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between items-center gap-4">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Status</span>

                        {/* THE FIX: Dynamic tooltip colors based on backend status object! */}
                        <span
                            className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded border border-slate-700"
                            style={{
                                backgroundColor: tooltip.data.computed_status?.color ? `${tooltip.data.computed_status.color}33` : '#000000',
                                color: tooltip.data.computed_status?.color || '#ffffff'
                            }}
                        >
                            {tooltip.data.computed_status?.label || 'UNKNOWN'}
                        </span>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}