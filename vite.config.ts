import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            laravel({
                input: ["resources/css/app.css", "resources/js/app.tsx"],
                refresh: true,
            }),
            react(),
            tailwindcss(), // ✅ Tailwind v4 plugin
        ],
        server: {
            host: "0.0.0.0",
            cors: true,
            hmr: {
                // Use the IP from .env, or fallback to localhost if it's not set
                host: env.VITE_HMR_HOST || "localhost",
            },
        },
    };
});
