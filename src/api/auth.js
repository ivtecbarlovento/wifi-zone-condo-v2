// src/api/auth.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("API URL:", process.env.REACT_APP_API_URL); // Add this for debugging

// Add token to all requests if we have one
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);

        // Since your API returns just a success message and not a token,
        // we'll create a simple token for frontend authentication
        if (response.data.message === "Login successful") {
            const fakeToken = `user_${credentials.username}_${Date.now()}`;
            const userData = { username: credentials.username };

            return {
                token: fakeToken,
                user: userData
            };
        }

        throw new Error("Authentication failed");
    } catch (error) {
        console.error("Login error:", error);
        await apiClient.post('/auth/error', { message: error.message });
        throw error;
    }
};

export const logout = async () => {
    // Your API doesn't have a logout endpoint, so we'll just handle it client-side
    return { success: true };
};

export default apiClient;