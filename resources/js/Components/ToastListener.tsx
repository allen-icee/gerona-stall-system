import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";

// 🎵 Built-in Browser Synthesizer
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
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(
                100,
                ctx.currentTime + 0.2,
            );
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
};

export default function ToastListener() {
    const { flash } = usePage().props as any;
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: "success", message: flash.success });
            setIsVisible(true);
            playSound("success");
        } else if (flash?.error) {
            setToast({ type: "error", message: flash.error });
            setIsVisible(true);
            playSound("error");
        }

        if (flash?.success || flash?.error) {
            const hideTimer = setTimeout(() => setIsVisible(false), 3700);
            const removeTimer = setTimeout(() => setToast(null), 4000);

            return () => {
                clearTimeout(hideTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [flash]);

    if (!toast) return null;

    const isSuccess = toast.type === "success";

    return (
        // Positioned Bottom-Center with a sliding up animation
        <div
            className={`fixed bottom-8 left-1/2 z-[9999] w-full max-w-md transition-all duration-300 ease-out transform ${
                isVisible
                    ? "-translate-x-1/2 translate-y-0 opacity-100 scale-100"
                    : "-translate-x-1/2 translate-y-8 opacity-0 scale-95"
            }`}
        >
            {/* Matches the Index.tsx table card design perfectly */}
            <div className="flex items-center w-full gap-4 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl shadow-xl">
                {/* Colored Icon Wrapper matching the table rows */}
                <div
                    className={`flex items-center justify-center p-2.5 rounded-lg shrink-0 ${
                        isSuccess
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                    }`}
                >
                    <Icon
                        icon={
                            isSuccess
                                ? "solar:check-circle-bold-duotone"
                                : "solar:danger-triangle-bold-duotone"
                        }
                        className="w-6 h-6"
                    />
                </div>

                <div className="flex-1">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                        {isSuccess ? "System Success" : "System Error"}
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
