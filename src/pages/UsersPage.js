// src/pages/UsersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, Space, message } from 'antd';
import { fetchUsers, createUser, updateUser, deleteUser, fetchRoles } from '../api/users';
import { UserAddOutlined } from '@ant-design/icons';
import { fetchZones } from '../api/data';
import { useAuth } from '../contexts/AuthContext';
import UsersTable from '../components/UsersTable';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [zones, setZones] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const { user: currentUser } = useAuth();

    // Check if the current user has permissions to manage users
    const userZone = currentUser?.id_zone ? parseInt(currentUser.id_zone) : 0;
    const isAdmin = userZone === 1; // User is in admin zone (zone 1)
    const userRole = currentUser?.id_role ? parseInt(currentUser.id_role) : 0;
    const isAdminRole = userRole === 1; // User has admin role
    
    // Only allow zone 1 users (admins) to manage users
    const canManageUsers = isAdmin;

    // Use useCallback to memoize the loadUsers function
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Pass the user's zone to filter users if not admin
            const data = await fetchUsers(currentUser?.id_zone);
            setUsers(data);
        } catch (error) {
            message.error('Error loading users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id_zone]); // Add currentUser.id_zone as a dependency

    const loadZones = async () => {
        try {
            const data = await fetchZones();
            setZones(data);
        } catch (error) {
            message.error('Error loading zones');
            console.error(error);
        }
    };

    const loadRoles = async () => {
        try {
            const data = await fetchRoles();
            setRoles(data);
        } catch (error) {
            message.error('Error loading roles');
            console.error(error);
        }
    };

    useEffect(() => {
        loadUsers();
        loadZones();
        loadRoles();
    }, [loadUsers]); // Now we can safely add loadUsers as a dependency

    // Handler for adding a new user
    const handleAddUser = () => {
        setEditingUser(null);
        // Set default values for a new user
        form.setFieldsValue({
            username: '',
            password: '',
            role: '', // Default role will come from dropdown
            zone: isAdmin ? '' : zones.find(z => z.id === userZone)?.area // Set to user's zone name if not admin
        });
        setIsModalVisible(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        // Find role name and zone name based on IDs
        const roleName = roles.find(r => r.id === parseInt(user.id_role))?.name;
        const zoneName = zones.find(z => z.id === parseInt(user.id_zone))?.area;
        
        form.setFieldsValue({
            username: user.username,
            role: roleName,
            zone: zoneName,
            // We don't include the password for editing
        });
        setIsModalVisible(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId, currentUser?.id_zone);
            message.success('User deleted successfully');
            loadUsers();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                message.error(error.response.data.message);
            } else {
                message.error('Error deleting user');
            }
            console.error(error);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                // If we're editing an existing user
                await updateUser(editingUser.id, values, currentUser?.id_zone);
                message.success('User updated successfully');
            } else {
                // If we're creating a new user
                await createUser(values, currentUser?.id_zone);
                message.success('User created successfully');
            }
            setIsModalVisible(false);
            loadUsers();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                message.error(error.response.data.message);
            } else {
                message.error('Error saving user');
            }
            console.error(error);
        }
    };

    return (
        <div className="users-page">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h1>User Management</h1>
            </div>
    
            <UsersTable
                users={users}
                zones={zones}
                roles={roles}
                loading={loading}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onAdd={handleAddUser}
                canManageUsers={isAdmin} // Only zone 1 users can manage users
            />

            <Modal
                title={editingUser ? "Edit User" : "Create User"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please enter a username' }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please enter a password' }]}
                        >
                            <Input.Password placeholder="Password" />
                        </Form.Item>
                    )}

                    {editingUser && (
                        <Form.Item
                            name="password"
                            label="Password (Leave blank to keep current)"
                        >
                            <Input.Password placeholder="New Password (optional)" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select
                            options={roles.map(role => ({
                                value: role.name,
                                label: role.name
                            }))}
                            placeholder="Select a role"
                        />
                    </Form.Item>

                    <Form.Item
                        name="zone"
                        label="Zone"
                        rules={[{ required: true, message: 'Please select a zone' }]}
                    >
                        <Select
                            options={zones.map(zone => ({
                                value: zone.area,
                                label: zone.area
                            }))}
                            placeholder="Select a zone"
                            disabled={!isAdmin}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UsersPage;