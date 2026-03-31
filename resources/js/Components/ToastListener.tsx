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
                icon: <Icon icon="solar:check-circle-bold-duotone" className="text-emerald-500 w-6 h-6" />,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 4000,
                icon: <Icon icon="solar:danger-triangle-bold-duotone" className="text-rose-500 w-6 h-6" />,
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
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    color: "#1e293b", // slate-800
                    padding: "12px 24px",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #f1f5f9", // slate-100
                    fontSize: "14px",
                    fontWeight: "600",
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <div className="flex items-center gap-3">
                            <div className="shrink-0">{icon}</div>
                            <div className="text-slate-700 whitespace-nowrap">{message}</div>
                        </div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}