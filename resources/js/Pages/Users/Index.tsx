import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import CreateUserModal from "./Partials/CreateUserModal";
import EditUserModal from "./Partials/EditUserModal";
import Modal from "@/Components/Modal";

interface Role {
    id: number;
    name: string;
}
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    roles: Role[];
}
interface Props {
    users: { data: User[]; links: any[]; total?: number };
    roles: Role[];
    filters: { search?: string };
}

export default function Index({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    // Modal States
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Debounced Search Logic
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route("users.index"),
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setShowEdit(true);
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("users.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    // Calculate total records for the tracker
    const totalUsers = users.total || users.data.length;

    return (
        <AuthenticatedLayout>
            <Head title="System Users" />

            {/* Modals */}
            <CreateUserModal
                show={showCreate}
                onClose={() => setShowCreate(false)}
                roles={roles}
            />
            <EditUserModal
                show={showEdit}
                onClose={() => {
                    setShowEdit(false);
                    setEditingUser(null);
                }}
                roles={roles}
                user={editingUser}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                maxWidth="sm"
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon
                            icon="solar:danger-triangle-bold"
                            className="h-8 w-8 text-rose-600"
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        Delete User?
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to completely remove this user
                        from the system? They will no longer be able to log in.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setDeletingId(null)}
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                        >
                            Yes, Delete User
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Header & Tools Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Title & Count Tracker */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                            <Icon
                                icon="solar:users-group-rounded-bold-duotone"
                                className="w-7 h-7 text-blue-700"
                            />
                            System Users
                        </h1>
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200">
                            {totalUsers}{" "}
                            {totalUsers === 1 ? "Record" : "Records"}
                        </span>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon
                                    icon="solar:magnifer-bold"
                                    className="h-5 w-5 text-slate-400"
                                />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-700 transition-colors"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0"
                        >
                            <Icon
                                icon="solar:user-plus-bold"
                                className="w-5 h-5"
                            />
                            <span className="hidden sm:inline">
                                Register User
                            </span>
                        </button>
                    </div>
                </div>

                {/* Unified Table Card */}
                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    {/* Centered Column Headers */}
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        Username
                                    </th>
                                    <th className="px-6 py-4 border-r border-slate-300 text-center">
                                        System Role
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center font-bold text-slate-600"
                                        >
                                            <Icon
                                                icon="solar:ghost-broken"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300"
                                            />
                                            No users found in the system.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 border-r border-slate-200">
                                                <div className="font-extrabold text-slate-900 text-base">
                                                    {user.name}
                                                </div>
                                                {user.email && (
                                                    <div className="text-xs font-bold text-slate-500">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-200 text-center">
                                                @{user.username}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-200">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className={`inline-block px-3 py-1 rounded border-2 font-black text-xs uppercase tracking-wider ${
                                                            role.name ===
                                                            "admin"
                                                                ? "bg-purple-600 border-purple-800 text-white"
                                                                : role.name ===
                                                                    "treasury"
                                                                  ? "bg-amber-500 border-amber-700 text-slate-900"
                                                                  : "bg-blue-600 border-blue-800 text-white"
                                                        }`}
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(user)
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200 hover:border-blue-600 rounded font-black text-xs uppercase tracking-wide transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-bold"
                                                            className="w-4 h-4"
                                                        />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(
                                                                user.id,
                                                            )
                                                        }
                                                        disabled={user.id === 1}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 border-2 rounded font-black text-xs uppercase tracking-wide transition-colors ${
                                                            user.id === 1
                                                                ? "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed"
                                                                : "bg-rose-100 border-rose-400 text-rose-800 hover:bg-rose-200 hover:border-rose-600"
                                                        }`}
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            className="w-4 h-4"
                                                        />
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
