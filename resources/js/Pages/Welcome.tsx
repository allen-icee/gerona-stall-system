import { Head, Link } from '@inertiajs/react';

// 1. Define the props passed from Laravel's web.php
interface WelcomeProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            username?: string;
        } | null; // User might be null if not logged in
    };
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({ auth, laravelVersion, phpVersion }: WelcomeProps) {
    return (
        <>
            <Head title="Gerona Stall System" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50 min-h-screen">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-blue-600 selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">

                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                {/* Simplified Municipal-Style Logo/Text instead of Laravel Logo */}
                                <h1 className="text-3xl font-black text-blue-700 dark:text-blue-500 tracking-tight">
                                    GERONA STALL SYSTEM
                                </h1>
                            </div>

                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-blue-600 dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-blue-600 dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white font-semibold"
                                        >
                                            Staff Login
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6 flex flex-col items-center justify-center text-center py-20">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                Municipal Internal Portal
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                                Welcome to the centralized stall management system for the Gerona Food Bazaar and Public Market. This system is for authorized municipal personnel only.
                            </p>

                            {!auth.user && (
                                <Link
                                    href={route('login')}
                                    className="mt-8 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out"
                                >
                                    Proceed to Secure Login
                                </Link>
                            )}
                        </main>

                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Powered by Laravel v{laravelVersion} (PHP v{phpVersion}) | Gerona Municipal IT
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}