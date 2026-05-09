import { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function CreateContractModal({
    show,
    onClose,
    tenants,
    availableStalls,
}: any) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            tenant_id: "",
            stall_id: "",
            start_date: "",
            end_date: "",
            due_day: 31,
            monthly_rent: "",
        });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    const [isRentLocked, setIsRentLocked] = useState(true);
    const [selectedFloorId, setSelectedFloorId] = useState("");

    const tenantOptions =
        tenants?.map((t: any) => ({
            value: t.id,
            searchString: `${t.first_name} ${t.last_name} ${t.company_name || ""}`,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden text-left py-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 truncate">
                        {t.company_name || "Individual/Personal"}
                    </span>
                    <span className="text-sm font-black text-blue-700 uppercase leading-none truncate">
                        {t.first_name} {t.last_name}
                    </span>
                </div>
            ),
        })) || [];

    const floorOptions = Array.from(
        new Map(
            availableStalls
                ?.filter((s: any) => s.floor)
                .map((s: any) => [
                    s.floor.id,
                    {
                        value: s.floor.id,
                        searchString: `${s.floor.building?.name || ""} - ${s.floor.name}`,
                        label: (
                            <div className="flex flex-col justify-center w-full overflow-hidden text-left py-0.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 truncate">
                                    {s.floor.building?.name || "No Building"}
                                </span>
                                <span className="text-sm font-black text-blue-700 uppercase leading-none truncate">
                                    {s.floor.name}
                                </span>
                            </div>
                        ),
                    },
                ]),
        ).values(),
    );

    const filteredStalls = availableStalls?.filter((s: any) => {
        if (selectedFloorId && s.floor?.id !== selectedFloorId) return false;
        return true;
    });

    const stallOptions =
        filteredStalls?.map((s: any) => ({
            value: s.id,
            searchString: `${s.stall_code} ${s.floor?.building?.name || ""}`,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden text-left py-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 truncate">
                        {s.floor?.building?.name || "No Building"} -{" "}
                        {s.floor?.name || "No Floor"}
                    </span>
                    <span className="text-sm font-black text-amber-600 uppercase leading-none truncate">
                        {String(s.stall_code || "").toUpperCase()}
                    </span>
                </div>
            ),
        })) || [];

    useEffect(() => {
        if (data.stall_id) {
            const selectedStall = availableStalls.find(
                (s: any) => s.id === data.stall_id,
            );
            if (
                selectedStall &&
                selectedStall.computed_monthly_rent !== undefined
            ) {
                const rent = parseFloat(
                    selectedStall.computed_monthly_rent,
                ).toFixed(2);
                setData((prev) => ({ ...prev, monthly_rent: rent }));
                setIsRentLocked(true);
            }
        }
    }, [data.stall_id, availableStalls]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("contracts.store"), { onSuccess: () => closeModal() });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
        setIsRentLocked(true);
        setSelectedFloorId("");
    };

    const preventNegativeInput = (e: any) => {
        if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:document-add-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Assign Tenant to Stall
                </h2>
                <button
                    onClick={closeModal}
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <Icon
                        icon="solar:close-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
            </div>

            <form
                ref={formRef}
                onSubmit={submit}
                className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Assign to Tenant
                        </label>
                        <SearchableSelect
                            id="tenant_id"
                            value={data.tenant_id}
                            onChange={(val: any) => setData("tenant_id", val)}
                            options={tenantOptions}
                            placeholder="Search registered tenants..."
                            error={errors.tenant_id}
                        />
                        {errors.tenant_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.tenant_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Select Facility Level
                        </label>
                        <div className="mb-2">
                            <SearchableSelect
                                id="floor_id"
                                value={selectedFloorId}
                                onChange={(val: any) => {
                                    setSelectedFloorId(val);
                                    setData("stall_id", "");
                                }}
                                options={floorOptions as any}
                                placeholder="Search facility level..."
                                theme="blue"
                            />
                        </div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Target Stall
                        </label>
                        <SearchableSelect
                            id="stall_id"
                            value={data.stall_id}
                            onChange={(val: any) => setData("stall_id", val)}
                            options={stallOptions}
                            placeholder={
                                selectedFloorId
                                    ? "Search stalls in area..."
                                    : "Search vacant stalls..."
                            }
                            error={errors.stall_id}
                            theme="amber"
                        />
                        {errors.stall_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.stall_id}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calendar-date-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Assignment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-0"
                                required
                            />
                            {errors.start_date && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-0"
                            />
                            {errors.end_date && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wide cursor-pointer">
                                    Monthly Rent (₱)
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsRentLocked(!isRentLocked)
                                    }
                                    className={`focus:outline-none transition-colors px-2 py-0.5 rounded flex items-center gap-1 ${isRentLocked ? "text-slate-400 hover:text-blue-600 bg-transparent" : "text-white bg-rose-500 hover:bg-rose-600 shadow-sm"}`}
                                    title={
                                        isRentLocked
                                            ? "Unlock to edit manually"
                                            : "Lock price"
                                    }
                                >
                                    <Icon
                                        icon={
                                            isRentLocked
                                                ? "solar:lock-password-bold-duotone"
                                                : "solar:unlock-bold-duotone"
                                        }
                                        className="w-4 h-4"
                                    />
                                    {!isRentLocked && (
                                        <span className="text-[9px] font-black uppercase">
                                            Unlocked
                                        </span>
                                    )}
                                </button>
                            </div>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                onKeyDown={preventNegativeInput}
                                value={data.monthly_rent}
                                onChange={(e) =>
                                    setData("monthly_rent", e.target.value)
                                }
                                readOnly={isRentLocked}
                                className={`w-full border-2 rounded-lg px-4 py-2 text-sm font-black transition-colors focus:ring-0 ${isRentLocked ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : "bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-600"}`}
                                required
                            />
                            {errors.monthly_rent && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.monthly_rent}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Billing Due Day
                            </label>
                            <select
                                value={data.due_day}
                                onChange={(e) =>
                                    setData("due_day", parseInt(e.target.value))
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-0 cursor-pointer"
                                required
                            >
                                <option value={15}>15th of the Month</option>
                                <option value={31}>
                                    End of the Month (Last Day)
                                </option>
                            </select>
                            {errors.due_day && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.due_day}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Save Assignment
                    </button>
                </div>
            </form>
        </Modal>
    );
}
