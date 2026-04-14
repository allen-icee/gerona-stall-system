import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

import MapSidebar from './Partials/MapSideBar';
import GridGenerator from './Partials/GridGenerator';
import InteractiveGrid from './Partials/InteractiveGrid';

export default function Mapper({ buildings, current_floor_id, layout, stalls }: any) {
    const [selectedFloor, setSelectedFloor] = useState(current_floor_id || '');
    const [activeTool, setActiveTool] = useState('stall');
    const [selectedStallId, setSelectedStallId] = useState('');

    // 🔥 NEW STATE FOR TEXT TOOL
    const [customText, setCustomText] = useState('');

    const [gridCells, setGridCells] = useState<any[]>([]);

    const [dialog, setDialog] = useState({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmColor: 'bg-blue-600 hover:bg-blue-700',
        icon: 'solar:info-circle-bold-duotone',
        iconColor: 'text-blue-500',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (layout && layout.cells) {
            setGridCells(layout.cells);
        }
    }, [layout]);

    const { data: genData, setData: setGenData, post: postGen, processing: genProcessing } = useForm({
        floor_id: current_floor_id,
        name: 'Main Layout',
        total_rows: 10,
        total_cols: 10,
    });

    const handleFloorChange = (floorId: any) => {
        setSelectedFloor(floorId);
        router.get(route('layouts.mapper', { floor_id: floorId }), {}, { preserveState: true });
    };

    const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

    const handleCellClick = (cellIndex: number) => {
        // Stall Validation
        if (activeTool === 'stall' && !selectedStallId) {
            setDialog({
                isOpen: true,
                type: 'alert',
                title: 'Selection Required',
                message: 'Please select a stall from the dropdown sidebar first before placing it on the map.',
                confirmText: 'Got it',
                confirmColor: 'bg-amber-500 hover:bg-amber-600 text-slate-900',
                icon: 'solar:danger-triangle-bold-duotone',
                iconColor: 'text-amber-500',
                onConfirm: closeDialog
            });
            return;
        }

        // 🔥 NEW TEXT TOOL VALIDATION
        if (activeTool === 'text' && !customText.trim()) {
            setDialog({
                isOpen: true,
                type: 'alert',
                title: 'Text Required',
                message: 'Please type the text you want to place on the map in the sidebar input box.',
                confirmText: 'Got it',
                confirmColor: 'bg-indigo-500 hover:bg-indigo-600 text-white',
                icon: 'solar:text-field-bold-duotone',
                iconColor: 'text-indigo-500',
                onConfirm: closeDialog
            });
            return;
        }

        const newCells = [...gridCells];
        const cell = newCells[cellIndex];

        cell.type = activeTool;
        cell.stall_id = activeTool === 'stall' ? selectedStallId : null;

        // 🔥 UPDATE CELL CONTENT BASED ON TOOL
        if (activeTool === 'stall') {
            cell.stall = stalls.find((s: any) => s.id == selectedStallId);
            cell.text = null;
        } else if (activeTool === 'text') {
            cell.stall = null;
            cell.text = customText; // Save the typed text into the cell
        } else {
            cell.stall = null;
            cell.text = null;
        }

        setGridCells(newCells);
    };

    const handleClearAll = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Clear Grid Layout',
            message: "Are you sure you want to erase the entire layout? This doesn't save to the database until you click 'Update Map Layout'.",
            confirmText: 'Yes, Erase Everything',
            confirmColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            icon: 'solar:eraser-bold-duotone',
            iconColor: 'text-rose-500',
            onConfirm: () => {
                setGridCells(prev => prev.map(c => ({ ...c, type: 'vacant', stall_id: null, stall: null, text: null })));
                closeDialog();
            }
        });
    };

    const handleRevert = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Revert Changes',
            message: "Revert to the last saved layout from the database? Any unsaved drawing progress will be lost.",
            confirmText: 'Yes, Revert',
            confirmColor: 'bg-amber-500 hover:bg-amber-600 text-slate-900',
            icon: 'solar:history-bold-duotone',
            iconColor: 'text-amber-500',
            onConfirm: () => {
                setGridCells([...layout.cells]);
                closeDialog();
            }
        });
    };

    // Quick Paint Handler Placeholder
    const handleQuickPaint = (stallId: string, statusId: string) => {
        // You can link this up to an Inertia router.post to update the stall status quickly!
        console.log(`Painting Stall ID: ${stallId} with Status: ${statusId}`);
    };

    // MASS EXPAND / SHRINK FUNCTIONS
    const expandRow = (amount: number) => {
        router.post(route('layouts.expand', layout.id), { direction: 'row', amount, cells: gridCells }, { preserveScroll: true, preserveState: false });
    };
    const expandCol = (amount: number) => {
        router.post(route('layouts.expand', layout.id), { direction: 'col', amount, cells: gridCells }, { preserveScroll: true, preserveState: false });
    };
    const shrinkRow = (amount: number) => {
        router.post(route('layouts.shrink', layout.id), { direction: 'row', amount, cells: gridCells }, { preserveScroll: true, preserveState: false });
    };
    const shrinkCol = (amount: number) => {
        router.post(route('layouts.shrink', layout.id), { direction: 'col', amount, cells: gridCells }, { preserveScroll: true, preserveState: false });
    };

    const saveLayout = () => {
        router.post(route('layouts.save', layout.id), { cells: gridCells }, { preserveScroll: true });
    };

    const generateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        postGen(route('layouts.generate'));
    };

    // Get active building & floor details for the Center Stage Header
    const activeFloorData = buildings?.flatMap((b: any) => b.floors.map((f: any) => ({ ...f, building_name: b.name }))).find((f: any) => f.id === parseInt(selectedFloor));

    return (
        <AuthenticatedLayout>
            <Head title="Stall Layout Mapper" />

            <Modal show={dialog.isOpen} onClose={closeDialog} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 border-2 bg-slate-50 ${dialog.iconColor.replace('text-', 'border-')}`}>
                        <Icon icon={dialog.icon} className={`h-8 w-8 ${dialog.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{dialog.title}</h3>
                    <p className="text-sm text-slate-600 font-medium mb-6 px-2">{dialog.message}</p>
                    <div className="flex justify-center gap-3">
                        {dialog.type === 'confirm' && (
                            <button onClick={closeDialog} className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors uppercase text-xs">
                                Cancel
                            </button>
                        )}
                        <button onClick={dialog.onConfirm} className={`px-5 py-2.5 font-black rounded-lg transition-colors shadow-sm uppercase text-xs ${dialog.confirmColor}`}>
                            {dialog.confirmText}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex h-[calc(100vh-4rem)]">
                <MapSidebar
                    buildings={buildings}
                    selectedFloor={selectedFloor}
                    onFloorChange={handleFloorChange}
                    layout={layout}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    selectedStallId={selectedStallId}
                    setSelectedStallId={setSelectedStallId}
                    stalls={stalls}
                    onSave={saveLayout}

                    // 🔥 Pass Text Tool State to Sidebar
                    customText={customText}
                    setCustomText={setCustomText}
                />

                <div className="flex-1 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                    {!selectedFloor ? (
                        <div className="text-center text-slate-400">
                            <Icon icon="solar:map-arrow-up-bold-duotone" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Select a Facility Level</h2>
                            <p className="text-sm font-bold">Please search and select a building/floor from the sidebar.</p>
                        </div>
                    ) : selectedFloor && !layout ? (
                        <GridGenerator genData={genData} setGenData={setGenData} onSubmit={generateGrid} processing={genProcessing} />
                    ) : (
                        <InteractiveGrid
                            layout={layout}
                            gridCells={gridCells}
                            activeFloorData={activeFloorData}
                            onCellClick={handleCellClick}
                            onClearAll={handleClearAll}
                            onRevert={handleRevert}
                            onExpandRow={expandRow}
                            onExpandCol={expandCol}
                            onShrinkRow={shrinkRow}
                            onShrinkCol={shrinkCol}
                            onQuickPaint={handleQuickPaint} // 🔥 Added the Quick Paint Hook
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}