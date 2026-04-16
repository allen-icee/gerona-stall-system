//resources\js\Pages\Auth\Login.tsx
import { Head, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title="Secure Login" />

            <div className="text-center mb-8">
                <div className="bg-yellow-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
                    <Icon
                        icon="solar:lock-keyhole-bold-duotone"
                        className="w-8 h-8 text-yellow-600"
                    />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-1">
                    Welcome to the Login!
                </h2>
                <p className="text-sm text-slate-500">
                    Authorized Personnel Only
                </p>
            </div>

            {errors.username && (
                <div className="mb-6 text-sm font-bold text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center justify-center gap-2">
                    <Icon
                        icon="solar:danger-triangle-bold-duotone"
                        className="w-5 h-5 shrink-0"
                    />
                    <span>{errors.username}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label
                        htmlFor="username"
                        className="text-xs font-bold text-slate-600 uppercase mb-1.5 block tracking-wide"
                    >
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icon
                                icon="solar:user-bold-duotone"
                                className="h-5 w-5 text-slate-400"
                            />
                        </div>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            className="pl-11 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-all font-medium text-slate-800 outline-none"
                            autoFocus
                            placeholder="Enter your username"
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="text-xs font-bold text-slate-600 uppercase mb-1.5 block tracking-wide"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icon
                                icon="solar:lock-password-bold-duotone"
                                className="h-5 w-5 text-slate-400"
                            />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            className="pl-11 pr-11 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-all font-medium text-slate-800 outline-none"
                            placeholder="••••••••"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-yellow-600 transition-colors focus:outline-none"
                        >
                            <Icon
                                icon={
                                    showPassword
                                        ? "solar:eye-bold-duotone"
                                        : "solar:eye-closed-bold-duotone"
                                }
                                className="h-5 w-5"
                            />
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-amber-50 font-bold tracking-wide py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-6 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
                >
                    {processing ? (
                        <Icon
                            icon="solar:spinner-bold-duotone"
                            className="w-5 h-5 animate-spin"
                        />
                    ) : (
                        <>
                            Login
                            <Icon
                                icon="solar:alt-arrow-right-bold-duotone"
                                className="w-5 h-5"
                            />
                        </>
                    )}
                </button>
            </form>
        </GuestLayout>
    );
}
