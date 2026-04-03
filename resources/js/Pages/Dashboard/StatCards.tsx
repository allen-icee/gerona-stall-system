import { Icon } from "@iconify/react";

export default function StatCards({ stats }: { stats: any }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-4 cursor-default">
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                    <Icon
                        icon="solar:shop-bold-duotone"
                        className="w-7 h-7 text-blue-600"
                    />
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Total Stalls
                    </div>
                    <div className="text-3xl font-black text-slate-800 tracking-tight">
                        {stats?.total_stalls || 0}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-4 cursor-default">
                <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <Icon
                        icon="solar:check-circle-bold-duotone"
                        className="w-7 h-7 text-emerald-600"
                    />
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Occupied
                    </div>
                    <div className="text-3xl font-black text-emerald-600 tracking-tight">
                        {stats?.occupied || 0}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-4 cursor-default">
                <div className="bg-rose-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                    <Icon
                        icon="solar:close-circle-bold-duotone"
                        className="w-7 h-7 text-rose-500"
                    />
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Vacant
                    </div>
                    <div className="text-3xl font-black text-rose-600 tracking-tight">
                        {stats?.vacant || 0}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-4 cursor-default">
                <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                    <Icon
                        icon="solar:danger-triangle-bold-duotone"
                        className="w-7 h-7 text-amber-500"
                    />
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Maintenance
                    </div>
                    <div className="text-3xl font-black text-amber-600 tracking-tight">
                        {stats?.maintenance || 0}
                    </div>
                </div>
            </div>
        </div>
    );
}
