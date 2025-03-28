// src/pages/DevicesPage.js
import React, { useState, useEffect } from 'react';
import { Card, Button, message, Modal } from 'antd';
import { devicesApi } from '../api/devices';
import { useAuth } from '../contexts/AuthContext';
import DevicesTable from '../components/DevicesTable';
import DeviceForm from '../components/DeviceForm';

const DevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDevice, setCurrentDevice] = useState(null);
    const { user } = useAuth();

    // Fetch devices
    const fetchDevices = async () => {
        setLoading(true);
        try {
            const fetchedDevices = await devicesApi.getDevices();
            setDevices(fetchedDevices);
        } catch (error) {
            message.error('Failed to fetch devices');
        }
        setLoading(false);
    };

    // Add new device
    const handleAddDevice = async (values) => {
        try {
            await devicesApi.createDevice(values);
            message.success('Device added successfully');
            fetchDevices();
            setIsModalVisible(false);
        } catch (error) {
            message.error('Failed to add device');
        }
    };

    // Edit device
    const handleEditDevice = async (values) => {
        try {
            await devicesApi.updateDevice(currentDevice.id, values);
            message.success('Device updated successfully');
            fetchDevices();
            setIsModalVisible(false);
            setCurrentDevice(null);
            setIsEditMode(false);
        } catch (error) {
            message.error('Failed to update device');
        }
    };

    // Delete device
    const handleDeleteDevice = async (id) => {
        try {
            await devicesApi.deleteDevice(id);
            message.success('Device deleted successfully');
            fetchDevices();
        } catch (error) {
            message.error('Failed to delete device');
        }
    };

    // View device details
    const handleViewDevice = (device) => {
        Modal.info({
            title: 'Device Details',
            content: (
                <div>
                    <p><strong>NAS Name:</strong> {device.nasname}</p>
                    <p><strong>Short Name:</strong> {device.shortname}</p>
                    <p><strong>Type:</strong> {device.type}</p>
                    <p><strong>IP Address:</strong> {device.nasipaddress}</p>
                    <p><strong>Server:</strong> {device.server}</p>
                </div>
            ),
            okText: 'Close'
        });
    };

    // Edit device - open modal with current device data
    const handleEditClick = (device) => {
        setCurrentDevice(device);
        setIsEditMode(true);
        setIsModalVisible(true);
    };

    useEffect(() => {
        fetchDevices();
    }, []);




    return (
        <Card
            title="Network Devices"
            extra={
                <Button
                    type="primary"
                    onClick={() => {
                        setIsEditMode(false);
                        setCurrentDevice(null);
                        setIsModalVisible(true);
                    }}
                >
                    Add Device
                </Button>
            }
        >
            <DevicesTable
                devices={devices}
                loading={loading}
                onFetchDevices={fetchDevices}
                onDelete={handleDeleteDevice}
                onEdit={handleEditClick}
                onView={handleViewDevice}
            />

            <DeviceForm
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setCurrentDevice(null);
                    setIsEditMode(false);
                }}
                onSubmit={isEditMode ? handleEditDevice : handleAddDevice}
                initialValues={currentDevice}
                title={isEditMode ? 'Edit Device' : 'Add New Device'}
            />
        </Card>
    );
};

export default DevicesPage;