import { create } from 'zustand';
import axios from '../services/axios';

// 1. Define the shape of your User and the Auth State
interface User {
    id: number;
    name: string;
    email: string;
    roles?: { name: string }[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;// ADDED TYPES HERE
    logout: () => Promise<void>;
}

// 2. Pass the interface into the create function
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
            await axios.get('/sanctum/csrf-cookie');
            // Send username to the backend
            const response = await axios.post('/api/login', { username, password });

            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });

            localStorage.setItem('auth_token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            return true;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
    }
}));