import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Pulling from our Zustand store
    const { login, isLoading } = useAuthStore();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            await login(username, password);
            window.location.href = "/dashboard"; // Redirect on success
        } catch (err) {
            setErrorMsg("Invalid username or password.");
            setPassword(""); // Clear password field on error
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-stone-200">

                <div className="mb-8 text-center">
                    {/* Changed to Government Blue & Stall Icon */}
                    <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                        <Icon icon="solar:shop-bold-duotone" className="w-9 h-9" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Gerona Stall System
                    </h2>
                    <p className="text-sm font-medium text-stone-500 mt-1">
                        Authorized Personnel Only
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 text-sm font-bold text-rose-600 bg-rose-50 p-4 rounded-2xl text-center border border-rose-100 flex items-center justify-center gap-2">
                        <Icon icon="solar:danger-triangle-bold-duotone" className="w-5 h-5" />
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="username"
                            className="text-xs font-bold text-stone-600 uppercase mb-1.5 block"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Icon
                                    icon="solar:user-bold-duotone"
                                    className="h-5 w-5 text-stone-400"
                                />
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                className="pl-11 w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 transition-all font-medium text-slate-800 outline-none"
                                autoFocus
                                placeholder="Enter your username"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-xs font-bold text-stone-600 uppercase mb-1.5 block"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Icon
                                    icon="solar:lock-password-bold-duotone"
                                    className="h-5 w-5 text-stone-400"
                                />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                className="pl-11 pr-11 w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 transition-all font-medium text-slate-800 outline-none"
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-blue-600 transition-colors focus:outline-none"
                            >
                                <Icon
                                    icon={showPassword ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"}
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-700 text-white font-black tracking-wide text-sm py-4 rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(29,78,216,0.3)] hover:shadow-[0_8px_20px_rgba(29,78,216,0.4)] hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
                    >
                        {isLoading ? (
                            <Icon icon="solar:spinner-bold-duotone" className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Secure Login
                                <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}