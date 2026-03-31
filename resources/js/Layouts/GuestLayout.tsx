import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">

            {/* subtle texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">

                {/* LOGOS (Clickable link back to Welcome) */}
                <Link href="/" className="flex items-center justify-center gap-4 mb-8 transition-transform hover:scale-105 focus:outline-none">
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg border-2 border-yellow-400 p-1.5">
                        <img src="/images/PesoLogo.png" className="w-full h-full object-contain" alt="PESO" />
                    </div>
                    <div className="w-20 h-20 bg-white rounded-full shadow-xl border-4 border-yellow-500 p-1.5 -translate-y-2">
                        <img src="/images/TSULogo.png" className="w-full h-full object-contain" alt="TSU" />
                    </div>
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg border-2 border-yellow-400 p-1.5">
                        <img src="/images/TreasuryLogo.png" className="w-full h-full object-contain" alt="Treasury" />
                    </div>
                </Link>

                {/* WHITE CARD (Where Login/Register forms go) */}
                <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200">
                    {children}
                </div>
            </div>

            {/* FOOTER */}
            <footer className="relative z-10 text-center py-6 text-xs text-slate-300 tracking-wide">
                <div>© {new Date().getFullYear()} Municipal Government of Gerona</div>
                <div className="opacity-70 mt-1">All rights reserved</div>
            </footer>
        </div>
    );
}