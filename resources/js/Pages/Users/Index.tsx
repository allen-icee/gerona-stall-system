import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import CreateUserModal from './Partials/CreateUserModal';
import EditUserModal from './Partials/EditUserModal';
import Modal from '@/Components/Modal';

interface Role { id: number; name: string; }
interface User { id: number; name: string; username: string; email: string; roles: Role[]; }
interface Props {
    users: { data: User[]; links: any[]; };
    roles: Role[];
    filters: { search?: string; };
}

export default function Index({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Modal States
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Delete Confirmation State
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get(route('users.index'), { search }, { preserveState: true });
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setShowEdit(true);
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route('users.destroy', deletingId), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="System Users" />

            {/* Modals */}
            <CreateUserModal show={showCreate} onClose={() => setShowCreate(false)} roles={roles} />
            <EditUserModal show={showEdit} onClose={() => { setShowEdit(false); setEditingUser(null); }} roles={roles} user={editingUser} />

            {/* Simple High-Contrast Delete Confirmation Modal */}
            <Modal show={deletingId !== null} onClose={() => setDeletingId(null)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon icon="solar:danger-triangle-bold" className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Delete User?</h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove this user from the system? They will no longer be able to log in.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100">
                            Cancel
                        </button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700">
                            Yes, Delete User
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header & Actions (Compressed) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-7 h-7 text-blue-700" />
                            System Users
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-all text-sm shrink-0"
                    >
                        <Icon icon="solar:user-plus-bold" className="w-5 h-5" />
                        Register New User
                    </button>
                </div>

                {/* Table Card (High Contrast Borders) */}
                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">

                    {/* Search Bar Area */}
                    <div className="px-4 py-3 border-b-2 border-slate-300 bg-slate-100 flex justify-end">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="solar:magnifer-bold" className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-1.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 font-bold placeholder-slate-500"
                                placeholder="Search name or username... (Press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    {/* The Compressed Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-4 py-3 border-r border-slate-300">Name</th>
                                    <th className="px-4 py-3 border-r border-slate-300">Username</th>
                                    <th className="px-4 py-3 border-r border-slate-300 text-center">System Role</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center font-bold text-slate-600">
                                            No users found in the system.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50 transition-colors">

                                            {/* Name & Email */}
                                            <td className="px-4 py-2.5 border-r border-slate-200">
                                                <div className="font-extrabold text-slate-900 text-base">{user.name}</div>
                                                {user.email && <div className="text-xs font-bold text-slate-600">{user.email}</div>}
                                            </td>

                                            {/* Username */}
                                            <td className="px-4 py-2.5 font-bold text-slate-800 border-r border-slate-200">
                                                @{user.username}
                                            </td>

                                            {/* Role Badge (High Contrast Solid Colors) */}
                                            <td className="px-4 py-2.5 text-center border-r border-slate-200">
                                                {user.roles.map(role => (
                                                    <span key={role.id} className={`inline-block px-3 py-1 rounded border-2 font-black text-xs uppercase tracking-wider ${role.name === 'admin' ? 'bg-purple-600 border-purple-800 text-white' :
                                                        role.name === 'treasury' ? 'bg-amber-500 border-amber-700 text-slate-900' :
                                                            'bg-blue-600 border-blue-800 text-white'
                                                        }`}>
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </td>

                                            {/* Actions (Explicit Buttons) */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex justify-center gap-2">

                                                    {/* EDIT BUTTON */}
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                    >
                                                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                                                        Edit
                                                    </button>

                                                    {/* DELETE BUTTON */}
                                                    <button
                                                        onClick={() => confirmDelete(user.id)}
                                                        disabled={user.id === 1}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 border-2 rounded font-black text-xs uppercase tracking-wide transition-colors ${user.id === 1
                                                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                                            : 'bg-rose-100 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600'
                                                            }`}
                                                    >
                                                        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                        Delete
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
            </div>
        </AuthenticatedLayout>
    );
}