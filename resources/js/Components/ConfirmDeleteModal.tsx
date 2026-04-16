//resources\js\Components\ConfirmDeleteModal.tsx
import Modal from "@/Components/Modal";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    processing?: boolean;
}

export default function ConfirmDeleteModal({
    show,
    onClose,
    onConfirm,
    title = "Delete Record?",
    message = "Are you sure you want to delete this record? This action cannot be undone.",
    processing = false,
}: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 text-center bg-white rounded-xl">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-5 border-2 border-rose-300 shadow-inner">
                    <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-rose-600"
                        width="32"
                    />
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">
                    {title}
                </h3>

                <p className="text-sm text-slate-600 font-bold mb-8 px-2">
                    {message}
                </p>

                <div className="flex justify-center gap-3 pt-4 border-t-2 border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2.5 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black uppercase text-xs tracking-wide rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 border-2 border-rose-800 text-white font-black uppercase text-xs tracking-wide rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <Icon
                                    icon="solar:spinner-bold-duotone"
                                    className="animate-spin w-4 h-4"
                                />
                                Deleting...
                            </>
                        ) : (
                            "Yes, Delete"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
