import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/Components/Modal';

interface Role { id: number; name: string; }
interface Props { show: boolean; onClose: () => void; roles: Role[]; }

export default function CreateUserModal({ show, onClose, roles }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '', username: '', email: '', password: '', password_confirmation: '', role: 'staff',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [requirements, setRequirements] = useState({
        length: false, number: false, symbol: false, uppercase: false,
    });

    // Real-time Validations
    useEffect(() => {
        if (data.name.length > 0) {
            const isValid = /^[a-zA-Z\s.]+$/.test(data.name);
            setNameError(isValid ? "" : "Names can only contain letters, spaces, and dots.");
        } else setNameError("");
    }, [data.name]);

    useEffect(() => {
        if (data.username.length > 0) {
            const isFormatValid = /^[a-zA-Z0-9._-]+$/.test(data.username);
            if (!isFormatValid) setUsernameError("Username can only contain letters, numbers, and _ . -");
            else if (data.username.length < 5) setUsernameError("Username must be at least 5 characters long.");
            else setUsernameError("");
        } else setUsernameError("");
    }, [data.username]);

    useEffect(() => {
        if (data.email.length > 0) {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
            setEmailError(isValid ? "" : "Please enter a valid email address.");
        } else setEmailError("");
    }, [data.email]);

    useEffect(() => {
        setRequirements({
            length: data.password.length >= 8,
            number: /[0-9]/.test(data.password),
            symbol: /[!@#$%^&*(),.?":{}|<>_-]/.test(data.password),
            uppercase: /[A-Z]/.test(data.password),
        });
    }, [data.password]);

    const allRequirementsMet = requirements.length && requirements.number && requirements.symbol && requirements.uppercase;
    const passwordsMatch = data.password === data.password_confirmation && data.password_confirmation.length > 0;

    const isFormValid = data.name.trim() !== "" && nameError === "" &&
        data.username.trim() !== "" && usernameError === "" &&
        emailError === "" && allRequirementsMet && passwordsMatch;

    const closeAndReset = () => {
        reset(); clearErrors(); setShowPassword(false);
        setNameError(""); setUsernameError(""); setEmailError(""); onClose();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('users.store'), { onSuccess: () => closeAndReset() });
    };

    return (
        <Modal show={show} onClose={closeAndReset} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Icon icon="solar:user-plus-bold-duotone" className="w-6 h-6 text-blue-600" />
                    Register New Personnel
                </h2>
                <button onClick={closeAndReset} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-white border border-slate-200 hover:bg-rose-50 rounded-lg">
                    <Icon icon="solar:close-square-bold" className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Full Name</label>
                        <div className="relative">
                            <Icon icon="solar:user-id-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500" placeholder="e.g. Juan Cruz" required />
                        </div>
                        {(errors.name || nameError) && <p className="text-rose-500 text-xs font-bold mt-1">{errors.name || nameError}</p>}
                    </div>
                    {/* Username */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Username</label>
                        <div className="relative">
                            <Icon icon="solar:user-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500" placeholder="e.g. juanc" required />
                        </div>
                        {(errors.username || usernameError) && <p className="text-rose-500 text-xs font-bold mt-1">{errors.username || usernameError}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Email Address (Optional)</label>
                        <div className="relative">
                            <Icon icon="solar:letter-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500" placeholder="email@example.com" />
                        </div>
                        {(errors.email || emailError) && <p className="text-rose-500 text-xs font-bold mt-1">{errors.email || emailError}</p>}
                    </div>
                    {/* Role */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">System Role</label>
                        <div className="relative">
                            <Icon icon="solar:shield-user-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <select value={data.role} onChange={e => setData('role', e.target.value)} className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500 appearance-none" required>
                                {roles.map(role => <option key={role.id} value={role.name}>{role.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        {errors.role && <p className="text-rose-500 text-xs font-bold mt-1">{errors.role}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Password</label>
                        <div className="relative">
                            <Icon icon="solar:key-minimalistic-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type={showPassword ? "text" : "password"} value={data.password} onChange={e => setData('password', e.target.value)} className="pl-10 pr-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500" placeholder="••••••••" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 focus:outline-none">
                                <Icon icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} className="w-5 h-5" />
                            </button>
                        </div>
                        {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}

                        {/* Password Requirements */}
                        {data.password.length > 0 && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-xs">
                                <p className="font-bold text-slate-500 mb-2">Password must contain:</p>
                                <ul className="space-y-1.5">
                                    <RequirementItem met={requirements.length} label="At least 8 characters" />
                                    <RequirementItem met={requirements.uppercase} label="One uppercase letter (A-Z)" />
                                    <RequirementItem met={requirements.number} label="One number (0-9)" />
                                    <RequirementItem met={requirements.symbol} label="One symbol (!@#$)" />
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Confirm Password</label>
                        <div className="relative">
                            <Icon icon="solar:shield-check-bold-duotone" className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type={showPassword ? "text" : "password"} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="pl-10 pr-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-100 focus:border-blue-500" placeholder="••••••••" required />
                        </div>
                        {data.password_confirmation.length > 0 && (
                            <div className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-600" : "text-rose-500"}`}>
                                <Icon icon={passwordsMatch ? "solar:check-circle-bold" : "solar:close-circle-bold"} width="16" />
                                {passwordsMatch ? "Passwords match!" : "Passwords do not match."}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={closeAndReset} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={!isFormValid || processing} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        {processing ? <Icon icon="solar:spinner-bold-duotone" className="w-5 h-5 animate-spin" /> : <Icon icon="solar:diskette-bold" className="w-5 h-5" />}
                        Create User
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <li className={`flex items-center gap-2 ${met ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
            <Icon icon={met ? "solar:check-circle-bold" : "solar:close-circle-bold"} width="14" />
            <span>{label}</span>
        </li>
    );
}