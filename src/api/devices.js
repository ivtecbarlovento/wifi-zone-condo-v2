// src/api/devices.js
import axios from 'axios';

const BASE_URL = '';

export const devicesApi = {
    // Fetch all devices (without zone filtering)
    getDevices: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/devices`);
            return response.data;
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    },

    // Create a new device
    createDevice: async (deviceData) => {
        try {
            const response = await axios.post(`${BASE_URL}/devices`, deviceData);
            return response.data;
        } catch (error) {
            console.error('Error creating device:', error);
            throw error;
        }
    },

    // Update an existing device
    updateDevice: async (id, deviceData) => {
        try {
            const response = await axios.put(`${BASE_URL}/devices/${id}`, deviceData);
            return response.data;
        } catch (error) {
            console.error('Error updating device:', error);
            throw error;
        }
    },

    // Delete a device
    deleteDevice: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/devices/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting device:', error);
            throw error;
        }
    },



};

