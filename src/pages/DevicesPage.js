// src/pages/DevicesPage.js
import React, { useState, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { devicesApi } from '../api/devices';
import { useAuth } from '../contexts/AuthContext';
import DevicesTable from '../components/DevicesTable';
import DeviceForm from '../components/DeviceForm';

const DevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { user } = useAuth();

    // Fetch devices without zone filtering
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

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <Card
            title="Network Devices"
            extra={
                <Button
                    type="primary"
                    onClick={() => setIsModalVisible(true)}
                >
                    Add Device
                </Button>
            }
        >
            <DevicesTable
                devices={devices}
                loading={loading}
                onFetchDevices={fetchDevices}
            />

            <DeviceForm
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleAddDevice}
            />
        </Card>
    );
};

export default DevicesPage;