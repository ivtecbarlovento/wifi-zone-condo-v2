// src/components/UsersTable.js
import React from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';

const UsersTable = ({ 
    users, 
    zones, 
    roles,
    loading, 
    onEdit, 
    onDelete, 
    onAdd,
    canManageUsers 
}) => {
    // Function to render the role tag color
    const getRoleColor = (roleId) => {
        switch (parseInt(roleId)) {
            case 1: return 'red';      // admin
            case 2: return 'green';    // manager
            case 3: return 'blue';     // operator
            case 4: return 'gray';     // viewer
            default: return 'default';
        }
    };

    // Function to get role name from id
    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === parseInt(roleId));
        return role ? role.name : 'Unknown';
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Role',
            dataIndex: 'id_role',
            key: 'id_role',
            render: roleId => <Tag color={getRoleColor(roleId)}>{getRoleName(roleId)}</Tag>,
            filters: roles.map(role => ({ text: role.name, value: role.id })),
            onFilter: (value, record) => parseInt(record.id_role) === parseInt(value),
        },
        {
            title: 'Zone',
            dataIndex: 'id_zone',
            key: 'id_zone',
            render: zoneId => {
                const zone = zones.find(z => z.id === parseInt(zoneId));
                return zone ? zone.area : 'Not assigned';
            },
            filters: zones.map(zone => ({ text: zone.area, value: zone.id })),
            onFilter: (value, record) => parseInt(record.id_zone) === parseInt(value),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    {canManageUsers && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => onEdit(record)}
                                type="primary"
                                ghost
                            />
                            <Popconfirm
                                title="Are you sure you want to delete this user?"
                                onConfirm={() => onDelete(record.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    type="primary"
                                    danger
                                    ghost
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Add User Button */}
            {canManageUsers && (
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        type="primary" 
                        icon={<UserAddOutlined />} 
                        onClick={onAdd}
                    >
                        Add User
                    </Button>
                </div>
            )}
            
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default UsersTable;