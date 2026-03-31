import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

export default function FloorsIndex({ buildings, floors, filters }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        building_id: '',
        name: '',
        description: '',
    });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('floors.store'), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const deleteFloor = (id: number) => {
        if (confirm('Are you sure you want to delete this floor/section? All stalls inside it might be affected.')) {
            router.delete(route('floors.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Floors & Sections" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Floors & Sections</h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors"
                    >
                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-5 h-5" />
                        Add New Floor
                    </button>
                </div>

                {/* Floors Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Floor / Section</th>
                                <th className="px-6 py-4">Parent Building</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.data.length > 0 ? (
                                floors.data.map((floor: any) => (
                                    <tr key={floor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                                <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-5 h-5" />
                                            </div>
                                            {floor.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-blue-700">
                                            {floor.building?.name || 'Unknown Building'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold uppercase text-xs tracking-wider">Edit</button>
                                            <button onClick={() => deleteFloor(floor.id)} className="text-rose-600 hover:text-rose-800 font-bold uppercase text-xs tracking-wider">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 font-bold">
                                        <Icon icon="solar:ghost-broken" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        No floors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Floor Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-6 h-6 text-blue-700" />
                        Register Floor / Section
                    </h2>
                </div>

                <form onSubmit={submitCreate} className="p-6 space-y-5 bg-white">
                    {/* Building Selection */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Parent Building</label>
                        <select
                            value={data.building_id}
                            onChange={e => setData('building_id', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select a building...</option>
                            {buildings.map((building: any) => (
                                <option key={building.id} value={building.id}>{building.name}</option>
                            ))}
                        </select>
                        {errors.building_id && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.building_id}</p>}
                    </div>

                    {/* Floor Name */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Floor / Section Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            placeholder="e.g. Ground Floor, Phase 1"
                            required
                        />
                        {errors.name && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.name}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                        <button type="button" onClick={closeCreateModal} className="px-5 py-2 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50">
                            Save Floor
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}