import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal'; // Bringing in your custom Modal!

import MapSidebar from './Partials/MapSideBar';
import GridGenerator from './Partials/GridGenerator';
import InteractiveGrid from './Partials/InteractiveGrid';

export default function Mapper({ buildings, current_floor_id, layout, stalls }: any) {
    const [selectedFloor, setSelectedFloor] = useState(current_floor_id || '');
    const [activeTool, setActiveTool] = useState('stall');
    const [selectedStallId, setSelectedStallId] = useState('');
    const [gridCells, setGridCells] = useState<any[]>([]);

    // NEW: Unified Modal State Manager
    const [dialog, setDialog] = useState({
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
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

    // Close Modal Helper
    const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

    const handleCellClick = (cellIndex: number) => {
        if (activeTool === 'stall' && !selectedStallId) {
            // Replaced window.alert with Custom Modal
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

        const newCells = [...gridCells];
        const cell = newCells[cellIndex];

        cell.type = activeTool;
        cell.stall_id = activeTool === 'stall' ? selectedStallId : null;

        if (activeTool === 'stall') {
            cell.stall = stalls.find((s: any) => s.id == selectedStallId);
        } else {
            cell.stall = null;
        }

        setGridCells(newCells);
    };

    // Replaced window.confirm with Custom Modals
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
                setGridCells(prev => prev.map(c => ({ ...c, type: 'vacant', stall_id: null, stall: null })));
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

    const expandRow = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Expand Grid (Row)',
            message: "This will add a new blank row to the bottom. Your current map layout will be auto-saved. Proceed?",
            confirmText: 'Add Row',
            confirmColor: 'bg-blue-600 hover:bg-blue-700 text-white',
            icon: 'solar:add-square-bold-duotone',
            iconColor: 'text-blue-500',
            onConfirm: () => {
                // THE FIX: We now pass { cells: gridCells } in the payload!
                router.post(route('layouts.expand', layout.id), { direction: 'row', cells: gridCells }, { preserveScroll: true, preserveState: false });
                closeDialog();
            }
        });
    };

    const expandCol = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Expand Grid (Column)',
            message: "This will add a new blank column to the right. Your current map layout will be auto-saved. Proceed?",
            confirmText: 'Add Column',
            confirmColor: 'bg-blue-600 hover:bg-blue-700 text-white',
            icon: 'solar:add-square-bold-duotone',
            iconColor: 'text-blue-500',
            onConfirm: () => {
                // THE FIX: We now pass { cells: gridCells } in the payload!
                router.post(route('layouts.expand', layout.id), { direction: 'col', cells: gridCells }, { preserveScroll: true, preserveState: false });
                closeDialog();
            }
        });
    };
    const shrinkRow = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Remove Grid (Row)',
            message: "This will permanently delete the bottom row. Your current map layout will be auto-saved. Proceed?",
            confirmText: 'Remove Row',
            confirmColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            icon: 'solar:minus-square-bold-duotone',
            iconColor: 'text-rose-500',
            onConfirm: () => {
                router.post(route('layouts.shrink', layout.id), { direction: 'row', cells: gridCells }, { preserveScroll: true, preserveState: false });
                closeDialog();
            }
        });
    };

    const shrinkCol = () => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Remove Grid (Column)',
            message: "This will permanently delete the rightmost column. Your current map layout will be auto-saved. Proceed?",
            confirmText: 'Remove Column',
            confirmColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            icon: 'solar:minus-square-bold-duotone',
            iconColor: 'text-rose-500',
            onConfirm: () => {
                router.post(route('layouts.shrink', layout.id), { direction: 'col', cells: gridCells }, { preserveScroll: true, preserveState: false });
                closeDialog();
            }
        });
    };

    const saveLayout = () => {
        router.post(route('layouts.save', layout.id), { cells: gridCells }, { preserveScroll: true });
    };

    const generateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        postGen(route('layouts.generate'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Stall Layout Mapper" />

            {/* THE UNIFIED CUSTOM MODAL */}
            <Modal show={dialog.isOpen} onClose={closeDialog} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 border-2 bg-slate-50 ${dialog.iconColor.replace('text-', 'border-')}`}>
                        <Icon icon={dialog.icon} className={`h-8 w-8 ${dialog.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                        {dialog.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mb-6 px-2">
                        {dialog.message}
                    </p>
                    <div className="flex justify-center gap-3">
                        {dialog.type === 'confirm' && (
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
                // Removed the 4 quick action props from here!
                />

                <div className="flex-1 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                    {!selectedFloor ? (
                        <div className="text-center text-slate-400">
                            <Icon icon="solar:map-arrow-up-bold-duotone" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Select a Facility Level</h2>
                            <p className="text-sm font-bold">Please search and select a building/floor from the sidebar.</p>
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
                            onCellClick={handleCellClick}
                            onClearAll={handleClearAll}
                            onRevert={handleRevert}
                            onExpandRow={expandRow}
                            onExpandCol={expandCol}
                            // Add these two!
                            onShrinkRow={shrinkRow}
                            onShrinkCol={shrinkCol}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}