import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Mapper({ buildings, current_floor_id, layout, stalls }: any) {
    const [selectedFloor, setSelectedFloor] = useState(current_floor_id || '');

    // Tools: 'walkway', 'restroom', 'stall', 'vacant' (eraser)
    const [activeTool, setActiveTool] = useState('stall');
    const [selectedStallId, setSelectedStallId] = useState('');

    // Manage grid state locally before saving
    const [gridCells, setGridCells] = useState<any[]>([]);

    useEffect(() => {
        if (layout && layout.cells) {
            setGridCells(layout.cells);
        }
    }, [layout]);

    // Grid Generation Form
    const { data: genData, setData: setGenData, post: postGen, processing: genProcessing } = useForm({
        floor_id: current_floor_id,
        name: 'Main Layout',
        total_rows: 10,
        total_cols: 10,
    });

    const handleFloorChange = (e: any) => {
        const floorId = e.target.value;
        setSelectedFloor(floorId);
        router.get(route('layouts.mapper', { floor_id: floorId }), {}, { preserveState: true });
    };

    const handleCellClick = (cellIndex: number) => {
        if (activeTool === 'stall' && !selectedStallId) {
            alert('Please select a stall from the dropdown first!');
            return;
        }

        const newCells = [...gridCells];
        const cell = newCells[cellIndex];

        cell.type = activeTool;
        cell.stall_id = activeTool === 'stall' ? selectedStallId : null;

        // If we placed a stall, attach the full stall object so the color updates instantly
        if (activeTool === 'stall') {
            cell.stall = stalls.find((s: any) => s.id == selectedStallId);
        } else {
            cell.stall = null;
        }

        setGridCells(newCells);
    };

    const saveLayout = () => {
        router.post(route('layouts.save', layout.id), { cells: gridCells });
    };

    const generateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        postGen(route('layouts.generate'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Stall Layout Mapper" />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Sidebar - Controls */}
                <div className="w-80 bg-white border-r-2 border-slate-200 p-5 flex flex-col h-full overflow-y-auto shadow-xl z-10">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                        <Icon icon="solar:map-bold-duotone" className="w-6 h-6 text-amber-500" />
                        Map Controls
                    </h2>

                    {/* Step 1: Select Location */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block">Select Facility Level</label>
                        <select
                            value={selectedFloor}
                            onChange={handleFloorChange}
                            className="w-full border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:border-blue-600 focus:ring-0"
                        >
                            <option value="">-- Choose Floor --</option>
                            {buildings.map((b: any) => (
                                <optgroup key={b.id} label={b.name}>
                                    {b.floors.map((f: any) => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Tools (Only if Layout exists) */}
                    {layout && (
                        <div className="flex-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block">Drawing Tools</label>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button onClick={() => setActiveTool('stall')} className={`p-3 rounded-lg border-2 font-bold text-xs uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'stall' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Icon icon="solar:shop-bold-duotone" className="w-6 h-6" /> Stall
                                </button>
                                <button onClick={() => setActiveTool('walkway')} className={`p-3 rounded-lg border-2 font-bold text-xs uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'walkway' ? 'border-slate-800 bg-slate-200 text-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Icon icon="solar:signpost-2-bold-duotone" className="w-6 h-6" /> Walkway
                                </button>
                                <button onClick={() => setActiveTool('restroom')} className={`p-3 rounded-lg border-2 font-bold text-xs uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'restroom' ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Icon icon="solar:users-group-two-rounded-bold-duotone" className="w-6 h-6" /> Restroom
                                </button>
                                <button onClick={() => setActiveTool('vacant')} className={`p-3 rounded-lg border-2 font-bold text-xs uppercase flex flex-col items-center gap-1 transition-all ${activeTool === 'vacant' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Icon icon="solar:eraser-bold-duotone" className="w-6 h-6" /> Eraser
                                </button>
                            </div>

                            {/* Stall Selection Dropdown (Appears if Stall Tool is active) */}
                            {activeTool === 'stall' && (
                                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl animate-fade-in">
                                    <label className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2 block">Which Stall?</label>
                                    <select
                                        value={selectedStallId}
                                        onChange={e => setSelectedStallId(e.target.value)}
                                        className="w-full border-2 border-blue-300 rounded-lg text-sm font-bold focus:border-blue-600 focus:ring-0"
                                    >
                                        <option value="">-- Select Stall --</option>
                                        {stalls.map((stall: any) => (
                                            <option key={stall.id} value={stall.id}>{stall.stall_code} - {stall.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-blue-600 font-bold mt-2 leading-tight">Select a stall, then click on the grid to place it.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    {layout && (
                        <button onClick={saveLayout} className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-sm py-3.5 rounded-xl border-b-4 border-emerald-800 transition-all flex justify-center items-center gap-2">
                            <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                            Save Map Layout
                        </button>
                    )}
                </div>

                {/* Right Side - Interactive Grid Area */}
                <div className="flex-1 bg-slate-100 overflow-auto p-8 relative flex items-center justify-center">

                    {!selectedFloor ? (
                        <div className="text-center text-slate-400">
                            <Icon icon="solar:map-arrow-up-bold-duotone" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Select a Floor</h2>
                            <p className="text-sm font-bold">Please select a building and floor from the sidebar.</p>
                        </div>
                    ) : selectedFloor && !layout ? (
                        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-2 border-slate-200">
                            <div className="text-center mb-6">
                                <Icon icon="solar:magic-stick-3-bold-duotone" className="w-16 h-16 mx-auto mb-2 text-amber-500" />
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Generate Map Grid</h2>
                                <p className="text-sm text-slate-500 font-bold">Set the dimensions for this floor's physical layout.</p>
                            </div>
                            <form onSubmit={generateGrid} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Rows (Height)</label>
                                        <input type="number" min="1" max="50" value={genData.total_rows} onChange={e => setGenData('total_rows', parseInt(e.target.value))} className="w-full border-2 border-slate-300 rounded-lg font-bold text-center" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Columns (Width)</label>
                                        <input type="number" min="1" max="50" value={genData.total_cols} onChange={e => setGenData('total_cols', parseInt(e.target.value))} className="w-full border-2 border-slate-300 rounded-lg font-bold text-center" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={genProcessing} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase py-3 rounded-lg mt-4 shadow-sm border-b-4 border-amber-700">
                                    Create Blank Grid
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* THE INTERACTIVE GRID */
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-slate-300 inline-block">
                            <div
                                className="grid gap-1"
                                style={{ gridTemplateColumns: `repeat(${layout.total_cols}, minmax(0, 1fr))` }}
                            >
                                {gridCells.map((cell, index) => {
                                    // Determine Cell Color/Style
                                    let cellStyle = "bg-slate-50 border-slate-200 border-dashed hover:border-slate-400"; // Default Empty
                                    let content = "";
                                    let dbColor = "";

                                    if (cell.type === 'walkway') {
                                        cellStyle = "bg-slate-300 border-slate-400 border-solid text-slate-600";
                                    } else if (cell.type === 'restroom') {
                                        cellStyle = "bg-cyan-100 border-cyan-300 border-solid text-cyan-700";
                                        content = "CR";
                                    } else if (cell.type === 'stall' && cell.stall) {
                                        cellStyle = "border-solid border-slate-800 shadow-sm text-slate-900 font-black";
                                        content = cell.stall.stall_code;
                                        dbColor = cell.stall.status?.color || '#ffffff';
                                    }

                                    return (
                                        <div
                                            key={cell.id}
                                            onClick={() => handleCellClick(index)}
                                            className={`w-14 h-14 border-2 rounded-md flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 select-none ${cellStyle}`}
                                            style={dbColor ? { backgroundColor: dbColor } : {}}
                                            title={`Row: ${cell.row_number}, Col: ${cell.column_number}`}
                                        >
                                            {content && <span className="drop-shadow-md bg-white/70 px-1 rounded">{content}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}