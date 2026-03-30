import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Gerona Stall System';

// 1. Create a variable to hold our React Root so Vite HMR remembers it
let root: any = null;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {

        // 2. Check if the root already exists. If not, create it.
        if (!root) {
            root = createRoot(el);
        }

        // 3. Render the app
        root.render(<App {...props} />);
    },
    progress: {
        // Changed to Government Blue to match your theme!
        color: '#1D4ED8',
    },
});