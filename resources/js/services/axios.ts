import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://gerona-stall-system.test', // Or http://127.0.0.1:8000
    withCredentials: true, // CRITICAL: This allows Sanctum to set the auth cookie
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export default axiosInstance;