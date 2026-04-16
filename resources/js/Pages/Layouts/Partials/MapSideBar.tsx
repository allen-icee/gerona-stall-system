// resources/js/Pages/Layouts/Partials/MapSideBar.tsx

import { Icon } from "@iconify/react";
import SearchableSelect from "@/Components/SearchableSelect";

type Props = {
    isOpen: boolean;
    buildings: any[];
    selectedFloor: any;
    onFloorChange: (val: any) => void;
    layout: any;
    gridCells: any[];
    activeTool: string;
    setActiveTool: (tool: string) => void;
    selectedStallId: any;
    setSelectedStallId: (id: any) => void;
    stalls: any[];
    onSave: () => void;
    customText: string;
    setCustomText: (val: string) => void;
};

export default function MapSidebar({
    isOpen,
    buildings,
    selectedFloor,
    onFloorChange,
    layout,
    gridCells,
    activeTool,
    setActiveTool,
    selectedStallId,
    setSelectedStallId,
    stalls,
    onSave,
    customText,
    setCustomText,
}: Props) {
    const floorOptions =
        buildings?.flatMap((b: any) =>
            (b.floors ?? []).map((f: any) => ({
                value: f.id,
                searchString: `${b.name} - ${f.name}`,
                label: (
                    <div className="flex flex-col justify-center w-full overflow-hidden">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 truncate">
                            {b.name}
                        </span>
                        <span className="text-sm font-black text-blue-700 uppercase leading-none truncate">
                            {f.name}
                        </span>
                    </div>
                ),
            })),
        ) || [];

    // 🔥 SMART FILTERING: Exclude placed stalls
    const placedStallIds =
        gridCells
            ?.filter((c: any) => c.type === "stall" && c.stall_id)
            .map((c: any) => Number(c.stall_id)) || [];

    const stallOptions =
        stalls
            ?.filter((stall: any) => !placedStallIds.includes(stall.id))
            .map((stall: any) => {
                let dbColor = stall.computed_status?.color || "#94a3b8";
                let textColor = dbColor;
                let bgColor = `${dbColor}22`;
                let borderColor = `${dbColor}55`;

                if (
                    dbColor.toLowerCase() === "#ffffff" ||
                    dbColor.toLowerCase() === "#fff"
                ) {
                    textColor = "#475569";
                    bgColor = "#f1f5f9";
                    borderColor = "#cbd5e1";
                }

                return {
                    value: stall.id,
                    searchString: stall.stall_code,
                    label: (
                        <div className="flex flex-col justify-center w-full overflow-hidden py-0.5">
                            <span className="text-sm font-black text-slate-800 leading-none mb-1.5 truncate">
                                {stall.stall_code}
                            </span>
                            <div className="flex">
                                <span
                                    className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border leading-none shadow-sm whitespace-nowrap"
                                    style={{
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        borderColor: borderColor,
                                    }}
                                >
                                    {stall.computed_status?.label || "UNKNOWN"}
                                </span>
                            </div>
                        </div>
                    ),
                };
            }) || [];

    return (
        <div
            className={`bg-white shadow-xl z-[100] shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "w-80 border-r-2 border-slate-200" : "w-0 border-r-0"
            }`}
        >
            <div className="w-80 flex flex-col h-full">
                <div className="p-5 pb-2 z-50">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6 ml-10">
                        <Icon
                            icon="solar:map-bold-duotone"
                            className="w-6 h-6 text-amber-500"
                        />
                        Map Controls
                    </h2>

                    <div className="mb-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block cursor-pointer">
                            Select Facility Level
                        </label>
                        <SearchableSelect
                            value={selectedFloor}
                            onChange={onFloorChange}
                            options={floorOptions}
                            placeholder="Search facility level..."
                            theme="blue"
                        />
                    </div>
                </div>

                <div className="p-5 pt-0 flex-1 overflow-y-auto custom-scrollbar">
                    {layout && (
                        <div className="flex-1 mt-4">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 block">
                                Drawing Tools
                            </label>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {[
                                    {
                                        key: "stall",
                                        label: "Stall",
                                        icon: "solar:shop-bold-duotone",
                                    },
                                    {
                                        key: "walkway",
                                        label: "Walkway",
                                        icon: "solar:signpost-2-bold-duotone",
                                    },
                                    {
                                        key: "restroom",
                                        label: "CR / Restroom",
                                        icon: "solar:users-group-two-rounded-bold-duotone",
                                    },
                                    {
                                        key: "stairs",
                                        label: "Stairs",
                                        icon: "solar:double-alt-arrow-up-bold-duotone",
                                    },
                                    {
                                        key: "wall",
                                        label: "Wall / Block",
                                        icon: "solar:minus-square-bold",
                                    },
                                    {
                                        key: "text",
                                        label: "Text / Label",
                                        icon: "solar:text-field-bold-duotone",
                                    },
                                ].map((tool) => (
                                    <button
                                        key={tool.key}
                                        onClick={() => setActiveTool(tool.key)}
                                        className={`p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${
                                            activeTool === tool.key
                                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Icon
                                            icon={tool.icon}
                                            className="w-6 h-6"
                                        />
                                        {tool.label}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setActiveTool("vacant")}
                                    className={`col-span-2 p-3 rounded-lg border-2 font-bold text-[10px] tracking-wide uppercase flex flex-col items-center gap-1 transition-all ${
                                        activeTool === "vacant"
                                            ? "border-rose-600 bg-rose-50 text-rose-700 shadow-sm"
                                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon
                                        icon="solar:eraser-bold-duotone"
                                        className="w-6 h-6"
                                    />
                                    Eraser
                                </button>
                            </div>

                            {activeTool === "stall" && (
                                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <label className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2 block">
                                        Which Stall?
                                    </label>

                                    {stallOptions.length > 0 ? (
                                        <SearchableSelect
                                            value={selectedStallId}
                                            onChange={setSelectedStallId}
                                            options={stallOptions}
                                            placeholder="Search stall code..."
                                            theme="blue"
                                        />
                                    ) : (
                                        <div className="text-xs font-bold text-slate-500 italic p-2 border border-blue-200 bg-white rounded-lg text-center">
                                            All stalls placed!
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTool === "text" && (
                                <div className="mb-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                                    <label className="text-xs font-black text-indigo-900 uppercase tracking-wide mb-2 block">
                                        What Text?
                                    </label>

                                    <input
                                        type="text"
                                        value={customText || ""}
                                        onChange={(e) =>
                                            setCustomText(e.target.value)
                                        }
                                        placeholder="e.g. Entrance, Gate 1..."
                                        className="w-full text-sm font-bold border-2 border-indigo-200 rounded-lg p-2 focus:ring-0 focus:border-indigo-500 outline-none text-indigo-900"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {layout && (
                    <div className="p-5 border-t-2 border-slate-200 bg-slate-50 shrink-0">
                        <button
                            onClick={onSave}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide text-sm py-3.5 rounded-xl border-b-4 border-emerald-800 transition-all flex justify-center items-center gap-2"
                        >
                            <Icon
                                icon="solar:diskette-bold"
                                className="w-5 h-5"
                            />
                            Update Map Layout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
