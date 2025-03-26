// src/api/auth.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

//console.log("API URL:", process.env.REACT_APP_API_URL); // Add this for debugging

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

        if (response.data.message === "Login successful") {
            // Store user data, ensuring role is properly handled as a number
            const userData = { 
                username: credentials.username,
                // Parse role as a number if it exists in the response, default to 3 (regular user)
                role: response.data.id_role !== undefined ? parseInt(response.data.id_role) : 3,
                // Store id_zone, default to 1
                id_zone: response.data.id_zone || 1,
                permissions: response.data.permissions || []
            };

            console.log("Processed user data:", userData); // Debugging line

            const token = response.data.token || `user_${credentials.username}_${Date.now()}`;
            
            return {
                token: token,
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
