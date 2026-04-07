import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface WelcomeProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            username?: string;
        } | null;
    };
}

export default function Welcome({ auth }: WelcomeProps) {
    return (
        <>
            <Head title="Municipal Stall Management System" />

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">

                {/* subtle texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                {/* MAIN */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">

                    {/* LOGOS */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg border-4 border-yellow-400 p-2">
                            <img src="/images/PesoLogo.png" className="w-full h-full object-contain" />
                        </div>

                        <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full shadow-xl border-4 border-yellow-500 p-2 -translate-y-3">
                            <img src="/images/TSULogo.png" className="w-full h-full object-contain" />
                        </div>

                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg border-4 border-yellow-400 p-2">
                            <img src="/images/TreasuryLogo.png" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    {/* HEADER */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            Gerona Stall Management System
                        </h1>
                    </div>

                    {/* CARD */}
                    <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200">

                        <div className="text-center">
                            <div className="bg-yellow-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
                                <Icon icon="solar:shield-keyhole-bold-duotone" className="w-8 h-8 text-yellow-600" />
                            </div>

                            <h2 className="text-xl font-bold mb-2">
                                Welcome to the Gerona Stall Management System!
                            </h2>

                            <p className="text-sm text-slate-500 mb-6">
                                For authorized personnel of the Municipal Government of Gerona only.
                            </p>
                        </div>

                        {/* BUTTON */}
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-amber-50 font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Go to Dashboard
                                <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="w-full flex text-amber-50 font-bold items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600  py-3 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Access the System
                            </Link>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="relative z-10 text-center py-6 text-xs text-slate-300 tracking-wide">
                    <div>
                        © {new Date().getFullYear()} Municipal Government of Gerona
                    </div>
                    <div className="opacity-70 mt-1">
                        All rights reserved
                    </div>
                </footer>
            </div>
        </>
    );
}