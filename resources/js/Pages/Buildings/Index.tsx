import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateBuildingModal from './Partials/CreateBuildingModal';
import EditBuildingModal from './Partials/EditBuildingModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import CustomSelect from '@/Components/CustomSelect';

export default function BuildingsIndex({ buildings, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const [sortFilter, setSortFilter] = useState(filters?.sort ? `${filters.sort}_${filters.direction}` : 'name_asc');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Advanced Sorting Options
    const sortOptions = [
        { value: 'name_asc', label: 'Building Name (A-Z)' },
        { value: 'name_desc', label: 'Building Name (Z-A)' },
        { value: 'created_at_desc', label: 'Recently Added' },
        { value: 'created_at_asc', label: 'Oldest Added' },
    ];

    // Trigger backend filter when search or sort changes
    useEffect(() => {
        const delay = setTimeout(() => {
            const [sort, direction] = sortFilter.split('_');
            router.get(route('buildings.index'), { search, sort, direction }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search, sortFilter]);

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route('buildings.destroy', deletingId), { preserveScroll: true, onFinish: () => setDeletingId(null) });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(route('buildings.import'), { file: e.target.files[0] }, {
                preserveScroll: true, forceFormData: true,
                onSuccess: () => { if (fileInputRef.current) fileInputRef.current.value = ""; }
            });
        }
    };

    // Filtered Export Action
    const handleExport = () => {
        const [sort, direction] = sortFilter.split('_');
        window.location.href = route('buildings.export', { search, sort, direction });
    };

    const totalBuildings = buildings.total || buildings.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="Manage Buildings" />
            <ConfirmDeleteModal show={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Delete Building" message="Are you sure you want to delete this building?" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon icon="solar:city-bold-duotone" className="w-7 h-7 text-blue-700" />
                                Manage Buildings
                            </h3>
                            {/* Phase 1: Replaced "Records" text with Icon Badge */}
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200 flex items-center gap-1.5" title="Total Buildings">
                                <Icon icon="solar:database-bold-duotone" className="w-4 h-4" />
                                {totalBuildings}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">Configure physical structures before adding floors and stalls.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">

                        {/* Phase 1: Advanced Filtering Custom Select */}
                        <div className="w-48 z-20">
                            <CustomSelect
                                value={sortFilter}
                                onChange={setSortFilter}
                                options={sortOptions}
                                theme="blue"
                            />
                        </div>

                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="solar:magnifer-bold" className="h-5 w-5 text-slate-400" />
                            </div>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-0" placeholder="Search structures..." />
                        </div>

                        {/* Phase 1: Filtered Export */}
                        <button onClick={handleExport} className="flex items-center justify-center p-2.5 text-emerald-700 bg-emerald-100 rounded-lg border-2 border-emerald-300 hover:bg-emerald-200" title="Export Filtered List">
                            <Icon icon="solar:export-bold-duotone" className="w-5 h-5" />
                        </button>

                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center p-2.5 text-amber-700 bg-amber-100 rounded-lg border-2 border-amber-300 hover:bg-amber-200" title="Import via Excel">
                            <Icon icon="solar:import-bold-duotone" className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm">
                            <Icon icon="solar:add-square-bold-duotone" className="w-5 h-5" />
                            <span className="hidden sm:inline">Add Building</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    {/* Phase 1: Centered Headers */}
                                    <th className="px-6 py-4 border-r border-slate-300 text-center w-16">#</th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">Building Designation</th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">Active Floors</th>
                                    <th className="px-6 py-4 text-center">System Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {buildings.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            <Icon icon="solar:buildings-broken" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            No structures established.
                                        </td>
                                    </tr>
                                ) : (
                                    buildings.data.map((building: any, index: number) => (
                                        <tr key={building.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-500 text-center border-r border-slate-200">{(buildings.from || 1) + index}</td>
                                            <td className="px-6 py-4 font-black text-slate-900 border-r border-slate-200 text-center text-base">{building.name}</td>
                                            <td className="px-6 py-4 text-center border-r border-slate-200">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-xs border border-slate-300">{building.floors_count || 0} Levels</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => setEditingBuilding(building)} className="p-1.5 bg-blue-100 border-2 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-400 rounded transition-colors" title="Edit Structure">
                                                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeletingId(building.id)} className="p-1.5 bg-rose-100 border-2 border-rose-200 text-rose-700 hover:bg-rose-200 hover:border-rose-400 rounded transition-colors" title="Demolish Structure">
                                                        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination component goes here if built */}
            </div>

            <CreateBuildingModal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <EditBuildingModal show={editingBuilding !== null} onClose={() => setEditingBuilding(null)} building={editingBuilding} />
        </AuthenticatedLayout>
    );
}