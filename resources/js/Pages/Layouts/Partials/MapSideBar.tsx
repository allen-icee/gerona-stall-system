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
            label: `${b.name} - ${f.name}`
        })) || []
    ) || [];

    const stallOptions = stalls?.map((stall: any) => ({
        value: stall.id,
        label: `${stall.stall_code}${stall.computed_status ? ` (${stall.computed_status})` : ''}`
    })) || [];

    return (
        <div className="w-80 bg-white border-r-2 border-slate-200 p-5 flex flex-col h-full overflow-y-auto shadow-xl z-10 shrink-0 custom-scrollbar">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                <Icon icon="solar:map-bold-duotone" className="w-6 h-6 text-amber-500" />
                Map Controls
            </h2>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block cursor-pointer">
                    Select Facility Level
                </label>
                <SearchableSelect value={selectedFloor} onChange={onFloorChange} options={floorOptions} placeholder="Search facility level..." theme="blue" />
            </div>

            {layout && (
                <div className="flex-1">
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

            {layout && (
                <button onClick={onSave} className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide text-sm py-3.5 rounded-xl border-b-4 border-emerald-800 transition-all flex justify-center items-center gap-2 shrink-0">
                    <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                    Update Map Layout
                </button>
            )}
        </div>
    );
}