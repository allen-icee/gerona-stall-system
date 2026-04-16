//resources\js\Pages\Penalties\Index.tsx
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";

export default function PenaltiesIndex({ penalties, filters }: any) {
    const [search, setSearch] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(
        filters?.status || "pending",
    );

    const [processingPenalty, setProcessingPenalty] = useState<any>(null);
    const [actionType, setActionType] = useState<"approve" | "waive">(
        "approve",
    );
    const [adjustedAmount, setAdjustedAmount] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        router.get(
            route("penalties.index"),
            { status: newStatus, search },
            { preserveState: true },
        );
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            router.get(
                route("penalties.index"),
                { status: statusFilter, search },
                { preserveState: true },
            );
        }
    };

    const openProcessModal = (penalty: any, type: "approve" | "waive") => {
        setProcessingPenalty(penalty);
        setActionType(type);
        setAdjustedAmount(penalty.original_amount);
        setAdminNotes("");
    };

    const submitProcess = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route("penalties.process", processingPenalty.id),
            {
                status: actionType === "approve" ? "approved" : "waived",
                adjusted_amount: actionType === "approve" ? adjustedAmount : 0,
                admin_notes: adminNotes,
            },
            {
                onSuccess: () => {
                    setProcessingPenalty(null);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penalty Review Board" />

            <Modal
                show={processingPenalty !== null}
                onClose={() => setProcessingPenalty(null)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div
                        className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 border-2 ${actionType === "approve" ? "bg-amber-100 border-amber-300 text-amber-600" : "bg-rose-100 border-rose-300 text-rose-600"}`}
                    >
                        <Icon
                            icon={
                                actionType === "approve"
                                    ? "solar:check-circle-bold-duotone"
                                    : "solar:trash-bin-trash-bold-duotone"
                            }
                            className="h-8 w-8"
                        />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-1">
                        {actionType === "approve"
                            ? "Approve & Finalize Penalty"
                            : "Waive Penalty"}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 text-center mb-6">
                        For Tenant:{" "}
                        {processingPenalty?.contract?.tenant?.first_name}{" "}
                        {processingPenalty?.contract?.tenant?.last_name}
                    </p>

                    <form onSubmit={submitProcess} className="space-y-4">
                        {actionType === "approve" && (
                            <div>
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                    Final Penalty Amount (₱)
                                </label>
                                <p className="text-[10px] text-slate-500 mb-2">
                                    System suggested: ₱
                                    {processingPenalty?.original_amount}. You
                                    may adjust this if needed.
                                </p>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={adjustedAmount}
                                    onChange={(e) =>
                                        setAdjustedAmount(e.target.value)
                                    }
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 font-black text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                                Admin Notes / Reason
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 custom-scrollbar"
                                placeholder={
                                    actionType === "waive"
                                        ? "Why is this being waived?"
                                        : "Optional notes regarding this approval..."
                                }
                                required={actionType === "waive"}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                            <button
                                type="button"
                                onClick={() => setProcessingPenalty(null)}
                                className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-2.5 text-white rounded-lg font-black uppercase text-xs shadow-sm ${actionType === "approve" ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-600 hover:bg-rose-700"}`}
                            >
                                {isSubmitting
                                    ? "Processing..."
                                    : actionType === "approve"
                                      ? "Confirm Approval"
                                      : "Confirm Waiver"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="py-12 max-w-[95%] mx-auto space-y-6 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:danger-triangle-bold-duotone"
                                    className="w-7 h-7 text-amber-500"
                                />
                                Penalty Review Board
                            </h3>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Review auto-generated late fees before they affect
                            tenant ledgers.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-slate-200 p-1 rounded-lg border-2 border-slate-300 shrink-0">
                            <button
                                onClick={() => handleFilterChange("pending")}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${statusFilter === "pending" ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Pending Review
                            </button>
                            <button
                                onClick={() => handleFilterChange("approved")}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${statusFilter === "approved" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => handleFilterChange("waived")}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${statusFilter === "waived" ? "bg-white shadow-sm text-rose-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Waived
                            </button>
                        </div>

                        <div className="relative flex-1 min-w-[200px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon
                                    icon="solar:magnifer-bold"
                                    className="h-5 w-5 text-slate-400"
                                />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="block w-full pl-10 pr-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-700 transition-colors"
                                placeholder="Search by Tenant or Stall (Press Enter)..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col relative z-10">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-6 py-4 text-center border-r border-slate-200">
                                        Issue Date
                                    </th>
                                    <th className="px-6 py-4 text-center border-r border-slate-200">
                                        Tenant / Stall
                                    </th>
                                    <th className="px-6 py-4 text-center border-r border-slate-200">
                                        Missed Month
                                    </th>
                                    <th className="px-6 py-4 text-center border-r border-slate-200">
                                        System Calculation
                                    </th>
                                    <th className="px-6 py-4 text-center border-r border-slate-200">
                                        Final Amount
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100">
                                {penalties.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-slate-400 font-bold"
                                        >
                                            <Icon
                                                icon="solar:check-read-bold-duotone"
                                                className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-400"
                                            />
                                            All caught up! No {statusFilter}{" "}
                                            penalties found.
                                        </td>
                                    </tr>
                                ) : (
                                    penalties.data.map((penalty: any) => (
                                        <tr
                                            key={penalty.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-center border-r border-slate-100 text-xs font-bold text-slate-500">
                                                {new Date(
                                                    penalty.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <div className="font-black text-slate-900">
                                                    {
                                                        penalty.contract?.tenant
                                                            ?.first_name
                                                    }{" "}
                                                    {
                                                        penalty.contract?.tenant
                                                            ?.last_name
                                                    }
                                                </div>
                                                <div className="text-xs font-bold text-blue-600 mt-0.5">
                                                    Stall{" "}
                                                    {
                                                        penalty.contract?.stall
                                                            ?.stall_code
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100 font-black text-slate-700">
                                                {penalty.month_covered}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100 font-black text-slate-500">
                                                ₱{" "}
                                                {parseFloat(
                                                    penalty.original_amount,
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100">
                                                {penalty.status ===
                                                "pending" ? (
                                                    <span className="text-xs font-bold italic text-slate-400">
                                                        Waiting Approval
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`font-black ${penalty.status === "waived" ? "text-slate-400 line-through" : "text-rose-600"}`}
                                                    >
                                                        ₱{" "}
                                                        {parseFloat(
                                                            penalty.adjusted_amount,
                                                        ).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {penalty.status ===
                                                "pending" ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                openProcessModal(
                                                                    penalty,
                                                                    "approve",
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-200 rounded font-black text-[10px] uppercase tracking-wide transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:check-circle-bold"
                                                                className="w-4 h-4"
                                                            />{" "}
                                                            Review
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openProcessModal(
                                                                    penalty,
                                                                    "waive",
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border-2 border-slate-300 text-slate-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-400 rounded font-black text-[10px] uppercase tracking-wide transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:close-circle-bold"
                                                                className="w-4 h-4"
                                                            />{" "}
                                                            Waive
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full border-2 font-black text-[10px] uppercase tracking-wider shadow-sm ${penalty.status === "waived" ? "bg-slate-100 text-slate-600 border-slate-300" : "bg-emerald-100 text-emerald-700 border-emerald-300"}`}
                                                    >
                                                        {penalty.status}
                                                    </span>
                                                )}
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
