// src/components/ClientsTable.js
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Spin, Tag, Modal, Form, Select, Popconfirm, Grid } from 'antd';
import { ReloadOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchClients, updateClientStatus, deleteClient, fetchZones, createClient, updateClient } from '../api/data';
import { useAuth } from '../contexts/AuthContext';

const { confirm } = Modal;
const { useBreakpoint } = Grid;

const ClientsTable = () => {
    const { user } = useAuth(); // Get current user from auth context
    const userZone = user?.id_zone || 1; // Default to zone 1 if not available
    const isAdmin = userZone === 1; // Check if user is admin (zone 1)
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
    const screens = useBreakpoint();
    const isMobile = screens.xs || screens.sm;

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
            setZones(zonesData);
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
                    setLoading(true);
                    await deleteClient(idNumber);
                    await loadData();
                } catch (error) {
                    console.error('Failed to delete client:', error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleStatusChange = async (idNumber, newStatus) => {
        try {
            setLoading(true);
            await updateClientStatus(idNumber, newStatus);
            await loadData();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const showEditModal = (client) => {
        setEditingClient(client);

        // Prepare form values
        const formValues = {
            name: client ? client.name : '',
            last_name: client ? client.last_name : '',
            id_number: client ? client.id_number : '',
            status: client ? client.status : 'Active',
            apartment: client ? client.apartment : '',
            username: client ? client.username : '',
            password: '',
        };

        // Set zone_name based on user role
        if (isAdmin) {
            // For admin: use client's zone if editing, otherwise use first zone in the list
            formValues.zone_name = client ? client.zone_name : (zones.length > 0 ? zones[0].area : '');
        } else {
            // For non-admin: always use their assigned zone
            const userZoneName = zones.find(zone => zone.id === userZone)?.area || '';
            formValues.zone_name = userZoneName;
        }

        form.setFieldsValue(formValues);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let selectedZone;

            if (isAdmin) {
                // Admin can select any zone
                selectedZone = zones.find(zone => zone.area === values.zone_name);
                if (!selectedZone) {
                    throw new Error('Invalid zone selected');
                }
            } else {
                // Non-admin users can only create clients in their own zone
                selectedZone = zones.find(zone => zone.id === userZone);
                if (!selectedZone) {
                    throw new Error('User zone not found');
                }
            }

            const clientData = {
                ...values,
                id_zone: selectedZone.id,
            };

            if (editingClient) {
                await updateClient(editingClient.id_number, clientData);
            } else {
                await createClient(clientData);
            }

            setIsModalVisible(false);
            form.resetFields();
            loadData();
        } catch (error) {
            console.error('Form submission failed:', error);
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
            responsive: ['md'],
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => `${record.name} ${record.last_name}`,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
            responsive: ['md'],
        },
        {
            title: 'Zone',
            dataIndex: 'zone_name',
            key: 'zone_name',
            filters: zones.map(zone => ({ text: zone.area, value: zone.area })),
            onFilter: (value, record) => record.zone_name === value,
            responsive: ['sm'],
        },
        {
            title: 'Apartment',
            dataIndex: 'apartment',
            key: 'apartment',
            sorter: (a, b) => a.apartment.localeCompare(b.apartment),
            responsive: ['sm'],
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
                <Space size="small" wrap>
                    <Button
                        size={isMobile ? "small" : "middle"}
                        onClick={() => {
                            const newStatus = record.status === "Active" ? "Inactive" : "Active";
                            setLoading(true);
                            updateClientStatus(record.id_number, newStatus)
                                .then(() => {
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
                        size={isMobile ? "small" : "middle"}
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
                                    setData(prev => prev.filter(client => client.id_number !== record.id_number));
                                })
                                .catch(error => {
                                    console.error('Failed to delete client:', error);
                                    loadData();
                                })
                                .finally(() => {
                                    setLoading(false);
                                });
                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size={isMobile ? "small" : "middle"} danger>
                            <DeleteOutlined />
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobile ? '8px' : '16px' }}>
                <Input.Search
                    placeholder="Search clients..."
                    onSearch={handleSearch}
                    style={{ width: isMobile ? '100%' : 300 }}
                    allowClear
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingClient(null);

                            // Initialize form with defaults
                            const formValues = {
                                status: 'Active',
                            };

                            // Set zone_name based on user role
                            if (isAdmin) {
                                // For admin: use first zone in the list
                                formValues.zone_name = zones.length > 0 ? zones[0].area : '';
                            } else {
                                // For non-admin: use their assigned zone
                                const userZoneName = zones.find(zone => zone.id === userZone)?.area || '';
                                formValues.zone_name = userZoneName;
                            }

                            form.setFieldsValue(formValues);
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
                <div className="table-responsive">
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id_number"
                        pagination={pagination}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                        size={isMobile ? "small" : "middle"}
                    />
                </div>
            </Spin>

            <Modal
                title={editingClient ? "Edit Client" : "Add New Client"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                width={isMobile ? "95%" : 520}
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
                        name="apartment"
                        label="Apartment"
                        rules={[{ required: true, message: 'Please enter apartment number' }]}
                    >
                        <Input />
                    </Form.Item>

                    {/* Conditionally render zone selector based on user's zone */}
                    {isAdmin ? (
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
                    ) : (
                        // For non-admin users, show disabled selector with their zone pre-selected
                        <Form.Item
                            name="zone_name"
                            label="Zone"
                        >
                            <Select disabled>
                                {zones
                                    .filter(zone => zone.id === userZone)
                                    .map(zone => (
                                        <Select.Option key={zone.id} value={zone.area}>
                                            {zone.area}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    )}
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