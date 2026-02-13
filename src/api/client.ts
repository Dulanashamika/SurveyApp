import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '../config';
import { navigate } from '../utils/navigationRef';

const client = axios.create({
    baseURL: `${API_URL}/api`, // Updated to point to /api if needed, or just remove /api if controllers are at root.
    // Wait, citizenRoutes are mounted at '/api' in routes/index.js (router.use('/api', citizenRoutes)).
    // But authRoutes are mounted at '/' (router.use('/', authRoutes)).
    // So baseURL logic is tricky if using same client for both.
    // citizen routes are at /api/plants etc.
    // auth routes are at /login etc.
    // Let's use `${API_URL}` as base and append /api where needed?
    // Or stick to `/api` for resource client and use separate or direct axios for auth.
    // API_URL is defined in config.
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
client.interceptors.request.use(
    async (config) => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
                // Keychain stores username/password. We stored token as password.
                config.headers.Authorization = `Bearer ${credentials.password}`;
            }
        } catch (error) {
            console.error('Error retrieving token', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await Keychain.resetGenericPassword();
            navigate('LoginWelcome'); // Or 'SigninForm' depending on flow
        }
        return Promise.reject(error);
    }
);

export default client;
