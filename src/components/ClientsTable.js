// src/components/ClientsTable.js
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Spin, Tag, Modal, Form, Select, Popconfirm } from 'antd';
import {ReloadOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchClients, updateClientStatus, deleteClient, fetchZones, createClient, updateClient } from '../api/data';

const { confirm } = Modal;

const ClientsTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({});
    const [sorter, setSorter] = useState({});
    const [zones, setZones] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        loadData();
        loadZones();
    }, [pagination.current, pagination.pageSize, filters, sorter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                searchTerm: filters.searchTerm,
                sortField: sorter.field,
                sortOrder: sorter.order,
            };

            const response = await fetchClients(params);

            setData(response.data);
            setPagination({
                ...pagination,
                total: response.total,
            });
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadZones = async () => {
        try {
            const zonesData = await fetchZones();
            setZones(zonesData); // This should contain both zone id and zone name/area
        } catch (error) {
            console.error('Failed to fetch zones:', error);
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
        setSorter(sorter);
    };

    const handleSearch = (value) => {
        setFilters({
            ...filters,
            searchTerm: value,
        });
        setPagination({
            ...pagination,
            current: 1, // Reset to first page on new search
        });
    };

    const showDeleteConfirm = (idNumber) => {
        confirm({
            title: 'Are you sure you want to delete this client?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    setLoading(true); // Show loading state
                    await deleteClient(idNumber);
                    await loadData(); // Reload data after successful delete
                } catch (error) {
                    console.error('Failed to delete client:', error);
                } finally {
                    setLoading(false); // Hide loading state
                }
            },
        });
    };

    const handleStatusChange = async (idNumber, newStatus) => {
        try {
            setLoading(true);
            await updateClientStatus(idNumber, newStatus);
            await loadData(); // Make sure to await this
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };
    const showEditModal = (client) => {
        setEditingClient(client);
        form.setFieldsValue({
            name: client.name,
            last_name: client.last_name,
            id_number: client.id_number,
            status: client.status,
            zone_name: client.zone_name,
            username: client.username,
            password: '', // For security, don't show existing password
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            console.log("Form values:", values);
            
            // Find the zone object by name to get its ID
            const selectedZone = zones.find(zone => zone.area === values.zone_name);
            console.log("Selected zone:", selectedZone);
            
            if (!selectedZone) {
                throw new Error('Invalid zone selected');
            }
    
            // Create a new object with id_zone instead of zone_name
            const clientData = {
                ...values,
                id_zone: selectedZone.id, // Changed from zone_id to id_zone
            };
            
            console.log("Client data to be sent:", clientData);
    
            if (editingClient) {
                console.log("Updating client...");
                await updateClient(editingClient.id_number, clientData);
            } else {
                console.log("Creating new client...");
                const result = await createClient(clientData);
                console.log("Create client result:", result);
            }
    
            setIsModalVisible(false);
            form.resetFields();
            loadData();
        } catch (error) {
            console.error('Form submission failed:', error);
            // Log more detailed error information
            console.error('Error details:', error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'ID Number',
            dataIndex: 'id_number',
            key: 'id_number',
            sorter: true,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text, record) => `${record.name} ${record.last_name}`,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Zone',
            dataIndex: 'zone_name',
            key: 'zone_name',
            filters: zones.map(zone => ({ text: zone.area, value: zone.area })),
            onFilter: (value, record) => record.zone_name === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <span style={{ position: 'center' }}>
                    <Button
                        style={{}}
                        onClick={() => {
                            const newStatus = record.status === "Active" ? "Inactive" : "Active";
                            setLoading(true);
                            updateClientStatus(record.id_number, newStatus)
                                .then(() => {
                                    // Optimistically update UI
                                    setData(prev => prev.map(client =>
                                        client.id_number === record.id_number
                                            ? { ...client, status: newStatus }
                                            : client
                                    ));
                                })
                                .catch(error => {
                                    console.error('Failed to update status:', error);
                                    loadData();
                                })
                                .finally(() => {
                                    setLoading(false);
                                });
                        }}
                    >
                        {record.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                        style={{ marginLeft: 16 }}
                        onClick={() => showEditModal(record)}
                    >
                        <EditOutlined />
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this client?"
                        onConfirm={() => {
                            setLoading(true);
                            deleteClient(record.id_number)
                                .then(() => {
                                    // Optimistically update UI
                                    setData(prev => prev.filter(client => client.id_number !== record.id_number));
                                })
                                .catch(error => {
                                    console.error('Failed to delete client:', error);
                                    // If error, reload data to ensure consistency
                                    loadData();
                                })
                                .finally(() => {
                                    setLoading(false);
                                });
                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button style={{ color: 'red', marginLeft: 16 }}>
                            <DeleteOutlined />
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                    placeholder="Search clients..."
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingClient(null);
                            setIsModalVisible(true);
                        }}
                    >
                        Add Client
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id_number"
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Spin>

            <Modal
                title={editingClient ? "Edit Client" : "Add New Client"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter client first name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter client last name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="id_number"
                        label="ID Number"
                        rules={[{ required: true, message: 'Please enter client ID number' }]}
                    >
                        <Input disabled={!!editingClient} />
                    </Form.Item>

                    <Form.Item
                        name="zone_name"
                        label="Zone"
                        rules={[{ required: true, message: 'Please select a zone' }]}
                    >
                        <Select>
                            {zones.map(zone => (
                                <Select.Option key={zone.id} value={zone.area}>
                                    {zone.area}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please enter a username' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: !editingClient, message: 'Please enter a password' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="Active"
                    >
                        <Select>
                            <Select.Option value="Active">Active</Select.Option>
                            <Select.Option value="Inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientsTable;