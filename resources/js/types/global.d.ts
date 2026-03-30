import { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    // Tells TypeScript that Laravel's global route() function exists
    var route: (name?: string, params?: any, absolute?: boolean) => any;
}

export { };