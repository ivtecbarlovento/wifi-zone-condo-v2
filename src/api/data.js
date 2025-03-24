// src/api/data.js
import apiClient from './auth';

export const fetchClients = async (params = {}) => {
  try {
    // Get id_zone from user info in local storage or cookies
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const id_zone = userInfo.id_zone || 1;
    
    // Pass id_zone as a query parameter
    const response = await apiClient.get('/clients', {
      params: { id_zone }
    });
    
    // Rest of the function remains the same
    let data = [...response.data];
    
    // Simple filtering if search term is provided
    if (params.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      data = data.filter(client => 
        client.name.toLowerCase().includes(term) || 
        client.last_name.toLowerCase().includes(term) ||
        client.id_number.toLowerCase().includes(term)
      );
    }
    
    // Simple sorting
    if (params.sortField) {
      data.sort((a, b) => {
        const aValue = a[params.sortField];
        const bValue = b[params.sortField];
        
        if (params.sortOrder === 'descend') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // Simple pagination
    const start = (params.page - 1) * params.pageSize || 0;
    const paginatedData = data.slice(start, start + (params.pageSize || data.length));
    
    return {
      data: paginatedData,
      total: data.length
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const fetchZones = async () => {
  const response = await apiClient.get('/zones');
  return response.data;
};

export const getClient = async (idNumber) => {
  const response = await apiClient.get(`/clients/${idNumber}`);
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await apiClient.post('/clients', clientData);
  return response.data;
};

export const updateClient = async (idNumber, clientData) => {
  const response = await apiClient.put(`/clients/${idNumber}`, clientData);
  return response.data;
};

export const updateClientStatus = async (idNumber, status) => {
  const response = await apiClient.put(`/clients/${idNumber}/status`, { status });
  return response.data;
};

export const deleteClient = async (idNumber) => {
  const response = await apiClient.delete(`/clients/${idNumber}`);
  return response.data;
};