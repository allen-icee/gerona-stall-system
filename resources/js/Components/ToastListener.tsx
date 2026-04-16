//resources\js\Components\ToastListener.tsx
import { useEffect, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";

type ToastType = "success" | "error" | "info";

type ToastState = {
    type: ToastType;
    message: string;
};

const playSound = (type: "success" | "error") => {
    try {
        const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === "success") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(
                1760,
                ctx.currentTime + 0.1,
            );
        } else {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(
                100,
                ctx.currentTime + 0.2,
            );
        }

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch {}
};

export default function ToastListener() {
    const { flash } = usePage().props as any;

    const [toast, setToast] = useState<ToastState | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let newToast: ToastState | null = null;

        if (flash?.success) {
            newToast = { type: "success", message: String(flash.success) };
            playSound("success");
        } else if (flash?.error) {
            newToast = { type: "error", message: String(flash.error) };
            playSound("error");
        } else if (flash?.message) {
            newToast = { type: "info", message: String(flash.message) };
        }

        if (newToast) {
            if (hideTimer.current) clearTimeout(hideTimer.current);
            if (removeTimer.current) clearTimeout(removeTimer.current);

            setToast(newToast);
            setIsVisible(true);

            hideTimer.current = setTimeout(() => {
                setIsVisible(false);
            }, 3500);

            removeTimer.current = setTimeout(() => {
                setToast(null);
            }, 4000);
        }
    }, [flash]);

    if (!toast) return null;

    const isSuccess = toast.type === "success";
    const isError = toast.type === "error";

    return (
        <div
            className={`fixed bottom-8 left-1/2 z-[9999] w-full max-w-md transition-all duration-300 ease-out transform ${
                isVisible
                    ? "-translate-x-1/2 translate-y-0 opacity-100 scale-100"
                    : "-translate-x-1/2 translate-y-8 opacity-0 scale-95"
            }`}
        >
            <div className="flex items-center w-full gap-4 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl shadow-xl">
                <div
                    className={`flex items-center justify-center p-2.5 rounded-lg shrink-0 ${
                        isSuccess
                            ? "bg-emerald-100 text-emerald-700"
                            : isError
                              ? "bg-rose-100 text-rose-700"
                              : "bg-blue-100 text-blue-700"
                    }`}
                >
                    <Icon
                        icon={
                            isSuccess
                                ? "solar:check-circle-bold-duotone"
                                : isError
                                  ? "solar:danger-triangle-bold-duotone"
                                  : "solar:info-circle-bold-duotone"
                        }
                        className="w-6 h-6"
                    />
                </div>

                <div className="flex-1">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                        {isSuccess
                            ? "System Success"
                            : isError
                              ? "System Error"
                              : "System Info"}
                    </h4>

                    <p className="text-sm font-bold text-slate-900 leading-snug">
                        {toast.message}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                >
                    <Icon
                        icon="solar:close-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
            </div>
        </div>
    );
}
