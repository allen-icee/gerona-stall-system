//resources\js\Pages\Dashboard\Header.tsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Header({ user }: { user: any }) {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time
        ? new Intl.DateTimeFormat("en-US", {
              timeZone: "Asia/Manila",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          }).format(time)
        : "Loading time...";

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
                Welcome back,{" "}
                <span className="font-bold text-blue-700">{user.name}</span>.
                Here is the current status of the market.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs font-bold text-slate-500 bg-slate-200/50 w-fit px-3 py-1.5 rounded-full border-2 border-slate-200">
                <Icon
                    icon="solar:clock-circle-bold-duotone"
                    className="w-4 h-4 text-blue-600"
                />
                {formattedTime} (PHT)
            </div>
        </div>
    );
}
