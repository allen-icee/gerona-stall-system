import { Icon } from '@iconify/react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function MapSidebar({
    buildings, selectedFloor, onFloorChange, layout,
    activeTool, setActiveTool, selectedStallId, setSelectedStallId, stalls,
    onSave
}: any) {

    const floorOptions = buildings?.flatMap((b: any) =>
        b.floors?.map((f: any) => ({
            value: f.id,
            searchString: `${b.name} - ${f.name}`,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 truncate">
                        {b.name}
                    </span>
                    <span className="text-sm font-black text-blue-700 uppercase leading-none truncate">
                        {f.name}
                    </span>
                </div>
            )
        })) || []
    ) || [];

    const stallOptions = stalls?.map((stall: any) => {
        let dbColor = stall.computed_status?.color || '#94a3b8';

        // 🔥 THE FIX: Color Inverter for White Statuses
        let textColor = dbColor;
        let bgColor = `${dbColor}22`;
        let borderColor = `${dbColor}55`;

        if (dbColor.toLowerCase() === '#ffffff' || dbColor.toLowerCase() === '#fff') {
            textColor = '#475569'; // Slate-600
            bgColor = '#f1f5f9';   // Slate-100
            borderColor = '#cbd5e1'; // Slate-300
        }

        return {
            value: stall.id,
            searchString: stall.stall_code,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden py-0.5">
                    <span className="text-sm font-black text-slate-800 leading-none mb-1.5 truncate">
                        {stall.stall_code}
                    </span>
                    <div className="flex">
                        <span
                            className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border leading-none shadow-sm whitespace-nowrap"
                            style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                borderColor: borderColor
                            }}
                        >
                            {stall.computed_status?.label || 'UNKNOWN'}
                        </span>
                    </div>
                </div>
            )
        };
    }) || [];

    return (
        <div className="w-80 bg-white border-r-2 border-slate-200 flex flex-col h-full shadow-xl z-[100] shrink-0">

            <div className="p-5 pb-2 z-50">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                    <Icon icon="solar:map-bold-duotone" className="w-6 h-6 text-amber-500" />
                    Map Controls
                </h2>

                <div className="mb-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block cursor-pointer">
                        Select Facility Level
                    </label>
                    <SearchableSelect
                        value={selectedFloor}
                        onChange={onFloorChange}
                        options={floorOptions}
                        placeholder="Search facility level..."
                        theme="blue"
                    />
                </div>
            </div>

            <div className="p-5 pt-0 flex-1 overflow-y-auto custom-scrollbar">
                {layout && (
                    <div className="flex-1 mt-4">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block">Drawing Tools</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={() => setActiveTool('stall')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'stall' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:shop-bold-duotone" className="w-6 h-6" /> Stall
                            </button>
                            <button onClick={() => setActiveTool('walkway')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'walkway' ? 'border-slate-800 bg-slate-200 text-slate-800 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:signpost-2-bold-duotone" className="w-6 h-6" /> Walkway
                            </button>
                            <button onClick={() => setActiveTool('restroom')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'restroom' ? 'border-cyan-600 bg-cyan-50 text-cyan-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:users-group-two-rounded-bold-duotone" className="w-6 h-6" /> CR / Restroom
                            </button>
                            <button onClick={() => setActiveTool('stairs')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'stairs' ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:double-alt-arrow-up-bold-duotone" className="w-6 h-6" /> Stairs
                            </button>
                            <button onClick={() => setActiveTool('wall')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'wall' ? 'border-slate-900 bg-slate-800 text-white shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:minus-square-bold" className="w-6 h-6" /> Wall / Block
                            </button>
                            <button onClick={() => setActiveTool('vacant')} className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'vacant' ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon icon="solar:eraser-bold-duotone" className="w-6 h-6" /> Eraser
                            </button>
                        </div>

                        {activeTool === 'stall' && (
                            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl animate-fade-in">
                                <label className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2 block cursor-pointer">Which Stall?</label>
                                <SearchableSelect value={selectedStallId} onChange={(val: any) => setSelectedStallId(val)} options={stallOptions} placeholder="Search stall code..." theme="blue" />
                                <p className="text-[10px] text-blue-600 font-bold mt-2 leading-tight">Select a stall, then click on the grid to place it.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {layout && (
                <div className="p-5 border-t-2 border-slate-200 bg-slate-50 shrink-0">
                    <button onClick={onSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide text-sm py-3.5 rounded-xl border-b-4 border-emerald-800 transition-all flex justify-center items-center gap-2">
                        <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                        Update Map
                    </button>
                </div>
            )}
        </div>
    );
}