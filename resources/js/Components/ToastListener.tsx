import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { Icon } from "@iconify/react";

export default function ToastListener() {
    const { props } = usePage();
    const flash = props.flash as any;

    useEffect(() => {
        // Listening for 'success' because that's what we send from UserController
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 3000,
                icon: <Icon icon="solar:check-circle-bold-duotone" className="text-emerald-600 w-7 h-7" />,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 4000,
                icon: <Icon icon="solar:danger-triangle-bold-duotone" className="text-rose-600 w-7 h-7" />,
            });
        }
    }, [flash]);

    return (
        <Toaster
            position="bottom-right"
            gutter={8}
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
                style: {
                    background: "#ffffff",
                    color: "#0f172a", // slate-900
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "2px solid #cbd5e1", // slate-300
                    fontSize: "13px",
                    fontWeight: "900", // Black font weight
                    textTransform: "uppercase",
                    letterSpacing: "0.05em", // tracking-wide
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t} style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
                    {({ icon, message }) => (
                        <div className="flex items-center gap-3">
                            <div className="shrink-0">{icon}</div>
                            <div className="text-slate-800 whitespace-nowrap pt-0.5">{message}</div>
                        </div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}