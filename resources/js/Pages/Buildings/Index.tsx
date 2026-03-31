import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

export default function BuildingsIndex({ auth, buildings, filters }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Inertia form helper for creating a building
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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
        post(route('buildings.store'), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const deleteBuilding = (id: number) => {
        if (confirm('Are you sure you want to delete this building?')) {
            router.delete(route('buildings.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>

            <Head title="Buildings" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Facility Buildings</h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors"
                    >
                        <Icon icon="solar:buildings-bold-duotone" className="w-5 h-5" />
                        Add New Building
                    </button>
                </div>

                {/* Buildings Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Building Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buildings.data.length > 0 ? (
                                buildings.data.map((building: any) => (
                                    <tr key={building.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                                <Icon icon="solar:buildings-2-bold-duotone" className="w-5 h-5" />
                                            </div>
                                            {building.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{building.description || <span className="italic opacity-50">No description</span>}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold uppercase text-xs tracking-wider">Edit</button>
                                            <button onClick={() => deleteBuilding(building.id)} className="text-rose-600 hover:text-rose-800 font-bold uppercase text-xs tracking-wider">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 font-bold">
                                        <Icon icon="solar:ghost-broken" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        No buildings found. Add your first building to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Building Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon icon="solar:buildings-bold-duotone" className="w-6 h-6 text-blue-700" />
                        Register Building
                    </h2>
                </div>

                <form onSubmit={submitCreate} className="p-6 space-y-4 bg-white">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Building Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            placeholder="e.g. Public Market Bldg 1"
                            required
                        />
                        {errors.name && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Description (Optional)</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            placeholder="Enter building details..."
                            rows={3}
                        />
                        {errors.description && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                        <button type="button" onClick={closeCreateModal} className="px-5 py-2 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs">
                            Save Building
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}