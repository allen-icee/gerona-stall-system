import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";

export default function TenantsIndex({ tenants, filters }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            first_name: "",
            last_name: "",
            company_name: "",
            contact_number: "",
            address: "",
        });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("tenants.store"), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const deleteTenant = (id: number) => {
        if (
            confirm(
                "Are you sure you want to delete this tenant? This may affect their contracts.",
            )
        ) {
            router.delete(route("tenants.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Tenants" />
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Tenant Registry
                    </h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        <Icon
                            icon="solar:users-group-rounded-bold-duotone"
                            className="w-5 h-5"
                        />
                        Register New Tenant
                    </button>
                </div>

                {/* Tenants Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-800 tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Tenant Name</th>
                                <th className="px-6 py-4">
                                    Business / Company
                                </th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.data.length > 0 ? (
                                tenants.data.map((tenant: any) => (
                                    <tr
                                        key={tenant.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-700 shrink-0">
                                                <Icon
                                                    icon="solar:user-id-bold-duotone"
                                                    className="w-5 h-5"
                                                />
                                            </div>
                                            {tenant.first_name}{" "}
                                            {tenant.last_name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {tenant.company_name || (
                                                <span className="text-slate-400 italic font-normal">
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">
                                                    {tenant.contact_number ||
                                                        "No Number"}
                                                </span>
                                                <span
                                                    className="text-[10px] text-slate-500 uppercase tracking-wide truncate max-w-[200px]"
                                                    title={tenant.address}
                                                >
                                                    {tenant.address ||
                                                        "No Address"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold uppercase text-xs tracking-wider">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteTenant(tenant.id)
                                                }
                                                className="text-rose-600 hover:text-rose-800 font-bold uppercase text-xs tracking-wider"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400 font-bold"
                                    >
                                        <Icon
                                            icon="solar:ghost-broken"
                                            className="w-12 h-12 mx-auto mb-2 opacity-50"
                                        />
                                        No tenants registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Create Tenant Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={closeCreateModal}
                maxWidth="2xl"
            >
                <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Icon
                            icon="solar:user-plus-bold-duotone"
                            className="w-6 h-6 text-blue-700"
                        />
                        Tenant Registration Form
                    </h2>
                </div>

                <form
                    onSubmit={submitCreate}
                    className="p-6 space-y-5 bg-white"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* First Name */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={data.first_name}
                                onChange={(e) =>
                                    setData("first_name", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                                required
                            />
                            {errors.first_name && (
                                <p className="text-rose-600 text-xs font-bold mt-1.5">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData("last_name", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                                required
                            />
                            {errors.last_name && (
                                <p className="text-rose-600 text-xs font-bold mt-1.5">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Company Name */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Business / Company Name{" "}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={data.company_name}
                                onChange={(e) =>
                                    setData("company_name", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Contact Number{" "}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={data.contact_number}
                                onChange={(e) =>
                                    setData("contact_number", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Full Address{" "}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                                (Optional)
                            </span>
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            rows={3}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Save Tenant
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
