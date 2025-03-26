// src/api/users.js
import axios from 'axios';

const API_URL = '';

// Function to fetch users
export const fetchUsers = async (id_zone) => {
    try {
        const response = await axios.get(`${API_URL}/users`, {
            params: { id_zone }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Function to fetch roles
export const fetchRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles`);
        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

// Function to create a user
export const createUser = async (userData, id_zone) => {
    try {
        const response = await axios.post(`${API_URL}/users`, userData, {
            params: { id_zone }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to update a user
export const updateUser = async (id, userData, id_zone) => {
    try {
        const response = await axios.put(`${API_URL}/users/${id}`, userData, {
            params: { id_zone }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Function to delete a user
export const deleteUser = async (id, id_zone) => {
    try {
        const response = await axios.delete(`${API_URL}/users/${id}`, {
            params: { id_zone }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
