import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

const appName = import.meta.env.VITE_APP_NAME || "Gerona Stall System";

let root: any = null;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    // We are back to using the official Laravel helper which handles the module objects perfectly!
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        if (!root) {
            root = createRoot(el);
        }
        root.render(<App {...props} />);
    },
    progress: {
        color: "#1D4ED8",
    },
});
