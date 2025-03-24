// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import ClientsTable from '../components/ClientsTable';
import { fetchClients, fetchZones } from '../api/data';
import { useAuth } from '../contexts/AuthContext'; // Add this import

const Dashboard = () => {
    const { user } = useAuth(); // Get the current user
    const userZone = user?.id_zone || 1; // Default to zone 1 if not available
    const isAdmin = userZone === 1; // Check if user is admin
    
    const [clientStats, setClientStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoneStats, setZoneStats] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);

                // Get all clients
                const clientsResponse = await fetchClients();
                const allClients = clientsResponse.data;
                
                // Get all zones
                const zonesData = await fetchZones();
                
                // Filter clients based on user's zone if not admin
                const filteredClients = isAdmin 
                    ? allClients 
                    : allClients.filter(client => {
                        // Get the zone object for the client's zone name
                        const clientZone = zonesData.find(zone => zone.area === client.zone_name);
                        return clientZone && clientZone.id === userZone;
                    });

                // Calculate statistics
                const activeClients = filteredClients.filter(client => client.status === 'Active');
                const inactiveClients = filteredClients.filter(client => client.status === 'Inactive');

                // Calculate clients per zone
                let zoneClientCounts = [];
                
                if (isAdmin) {
                    // For admin, calculate stats for all zones
                    zoneClientCounts = zonesData.map(zone => {
                        const clientsInZone = allClients.filter(client => client.zone_name === zone.area);
                        const activeInZone = clientsInZone.filter(client => client.status === 'Active');

                        return {
                            name: zone.area,
                            total: clientsInZone.length,
                            active: activeInZone.length
                        };
                    });
                } else {
                    // For non-admin, only show their zone
                    const userZoneData = zonesData.find(zone => zone.id === userZone);
                    if (userZoneData) {
                        const clientsInZone = allClients.filter(client => client.zone_name === userZoneData.area);
                        const activeInZone = clientsInZone.filter(client => client.status === 'Active');
                        
                        zoneClientCounts = [{
                            name: userZoneData.area,
                            total: clientsInZone.length,
                            active: activeInZone.length
                        }];
                    }
                }

                setClientStats({
                    total: filteredClients.length,
                    active: activeClients.length,
                    inactive: inactiveClients.length
                });

                setZones(isAdmin ? zonesData : zonesData.filter(zone => zone.id === userZone));
                setZoneStats(zoneClientCounts);
            } catch (error) {
                console.error('Failed to load dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [isAdmin, userZone]);

    return (
        <div>
            <h1>Dashboard</h1>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Clients"
                            value={clientStats.total}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Active Clients"
                            value={clientStats.active}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Inactive Clients"
                            value={clientStats.inactive}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                    <Card
                        title="Zone Statistics"
                        loading={loading}
                        extra={<GlobalOutlined />}
                    >
                        <List
                            dataSource={zoneStats}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.name}
                                        description={`Total clients: ${item.total}`}
                                    />
                                    <div>
                                        <Tag color="green">{item.active} active</Tag>
                                        <Tag color="red">{item.total - item.active} inactive</Tag>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="System Info"
                        loading={loading}
                    >
                        <p>Server Status: <Tag color="green">Online</Tag></p>
                        <p>Total Zones: {isAdmin ? zones.length : 1}</p>
                        <p>Last Updated: {new Date().toLocaleString()}</p>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
                <h2>Client Management</h2>
                <ClientsTable />
            </div>
        </div>
    );
};

export default Dashboard;