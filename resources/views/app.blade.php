<!DOCTYPE html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Gerona Stall System') }}</title>

    <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='1' y='1' width='30' height='30' rx='6' fill='%23f59e0b' stroke='%23d97706' stroke-width='2' /%3E%3Crect x='2' y='2' width='28' height='28' rx='5' fill='none' stroke='%23000000' stroke-opacity='0.15' stroke-width='1' /%3E%3Cg transform='translate(4, 4)' fill='%230f172a'%3E%3Cpath d='M22 21H2v-1h20zM22 17H2v-1h20z' opacity='0.5' /%3E%3Cpath d='M2.08 6.046a1.5 1.5 0 0 1 1.488-1.296h16.864a1.5 1.5 0 0 1 1.488 1.296l.872 7.848a2 2 0 0 1-1.988 2.221h-.105a2.5 2.5 0 0 1-2.316-1.554A2.5 2.5 0 0 1 15.9 16.5h-.068a2.5 2.5 0 0 1-2.315-1.554a2.5 2.5 0 0 1-2.484 0A2.5 2.5 0 0 1 8.718 16.5H8.65a2.5 2.5 0 0 1-2.316-1.554A2.5 2.5 0 0 1 3.85 16.115h-.105a2 2 0 0 1-1.988-2.221zM7 7a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1' /%3E%3C/g%3E%3C/svg%3E">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,900&display=swap" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-slate-100">
    @inertia
</body>

</html>
