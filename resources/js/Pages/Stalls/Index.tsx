import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

export default function StallsIndex({ stalls, floors, statuses, filters }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        floor_id: '',
        stall_code: '',
        status_id: '', // Added status
    });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stalls.store'), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const deleteStall = (id: number) => {
        if (confirm('Are you sure you want to delete this stall?')) {
            router.delete(route('stalls.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Stalls" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Manage Stalls</h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors"
                    >
                        <Icon icon="solar:shop-bold-duotone" className="w-5 h-5" />
                        Register New Stall
                    </button>
                </div>

                {/* Stalls Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Stall Code</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stalls.data.length > 0 ? (
                                stalls.data.map((stall: any) => (
                                    <tr key={stall.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-3 text-lg">
                                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                                                <Icon icon="solar:tag-bold-duotone" className="w-5 h-5" />
                                            </div>
                                            {stall.stall_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                                {stall.status?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{stall.floor?.name || 'No Floor'}</span>
                                                <span className="text-xs text-slate-500">{stall.floor?.building?.name || 'No Building'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold uppercase text-xs tracking-wider">Edit</button>
                                            <button onClick={() => deleteStall(stall.id)} className="text-rose-600 hover:text-rose-800 font-bold uppercase text-xs tracking-wider">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-bold">
                                        <Icon icon="solar:ghost-broken" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        No stalls found. Add a stall to populate the layout.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Stall Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon icon="solar:shop-bold-duotone" className="w-6 h-6 text-blue-700" />
                        Register Stall
                    </h2>
                </div>

                <form onSubmit={submitCreate} className="p-6 space-y-5 bg-white">
                    {/* Floor Selection */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Location (Floor/Section)</label>
                        <select
                            value={data.floor_id}
                            onChange={e => setData('floor_id', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select a location...</option>
                            {floors.map((floor: any) => (
                                <option key={floor.id} value={floor.id}>
                                    {floor.name} ({floor.building?.name})
                                </option>
                            ))}
                        </select>
                        {errors.floor_id && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.floor_id}</p>}
                    </div>

                    {/* Stall Code */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Stall Code</label>
                        <input
                            type="text"
                            value={data.stall_code}
                            onChange={e => setData('stall_code', e.target.value.toUpperCase())}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none placeholder-slate-400"
                            placeholder="e.g. B1, ST-014"
                            required
                        />
                        {errors.stall_code && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.stall_code}</p>}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Initial Status</label>
                        <select
                            value={data.status_id}
                            onChange={e => setData('status_id', e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select a status...</option>
                            {statuses && statuses.length > 0 ? (
                                statuses.map((status: any) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No statuses found in database!</option>
                            )}
                        </select>
                        {errors.status_id && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.status_id}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                        <button type="button" onClick={closeCreateModal} className="px-5 py-2 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50">
                            Save Stall
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}