//resources\js\Pages\DashboardChart.tsx
import { Icon } from "@iconify/react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DashboardChart() {
    const data = [
        { month: "Oct", revenue: 210000, target: 250000 },
        { month: "Nov", revenue: 235000, target: 250000 },
        { month: "Dec", revenue: 242000, target: 250000 },
        { month: "Jan", revenue: 238000, target: 250000 },
        { month: "Feb", revenue: 255000, target: 250000 },
        { month: "Mar", revenue: 282000, target: 250000 },
    ];

    return (
        <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg uppercase tracking-tight">
                        <Icon
                            icon="solar:chart-square-bold-duotone"
                            className="w-6 h-6 text-emerald-600"
                        />
                        Revenue Analytics
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                        Monthly collection vs Expected target
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                        Collected
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>{" "}
                        Target
                    </div>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: "#64748b",
                                fontWeight: 700,
                            }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: "#64748b",
                                fontWeight: 700,
                            }}
                            tickFormatter={(value) => `₱${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "2px solid #e2e8f0",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                            formatter={(value: any) => [
                                `₱ ${Number(value).toLocaleString()}`,
                                "Amount",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="target"
                            stroke="#cbd5e1"
                            strokeWidth={2}
                            fill="none"
                            strokeDasharray="5 5"
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
