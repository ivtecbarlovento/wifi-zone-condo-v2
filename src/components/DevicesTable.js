import React, { useState } from 'react';
import { Table, Space, Button, Popconfirm, Input, Tooltip, message } from 'antd';
import { 
    EditOutlined, 
    DeleteOutlined, 
    EyeOutlined, 
    EyeInvisibleOutlined
} from '@ant-design/icons';

const DevicesTable = ({ 
    devices, 
    loading, 
    onFetchDevices, 
    onDelete, 
    onEdit, 
    onView,
    onRevealSecret 
}) => {
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [revealedSecrets, setRevealedSecrets] = useState({});
    const [revealLoading, setRevealLoading] = useState({});

    // Handle secret reveal
    const handleSecretReveal = async (deviceId) => {
        // If secret is already revealed, hide it
        if (revealedSecrets[deviceId]) {
            setRevealedSecrets(prev => {
                const newSecrets = {...prev};
                delete newSecrets[deviceId];
                return newSecrets;
            });
            return;
        }

        // Start loading for this specific device
        setRevealLoading(prev => ({...prev, [deviceId]: true}));

        try {
            const secret = await onRevealSecret(deviceId);
            setRevealedSecrets(prev => ({
                ...prev,
                [deviceId]: secret
            }));
        } catch (error) {
            console.error('Failed to reveal secret', error);
            message.error('Failed to retrieve device secret');
        } finally {
            // Stop loading for this device
            setRevealLoading(prev => {
                const newLoading = {...prev};
                delete newLoading[deviceId];
                return newLoading;
            });
        }
    };

    // Filter and search logic
    const filteredDevices = devices.filter(device => 
        device.shortname.toLowerCase().includes(searchText.toLowerCase()) ||
        device.nasname.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'NAS IP Address',
            dataIndex: 'nasname',
            key: 'nasname',
            width: 150,
            sorter: (a, b) => a.nasname.localeCompare(b.nasname),
            filteredValue: [searchText],
            onFilter: (value, record) => 
                record.nasname.toLowerCase().includes(value.toLowerCase()) ||
                record.shortname.toLowerCase().includes(value.toLowerCase())
        },
        {
            title: 'Short Name',
            dataIndex: 'shortname',
            key: 'shortname',
            width: 120,
            sorter: (a, b) => a.shortname.localeCompare(b.shortname),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            filters: [
                { text: 'Cisco', value: 'cisco' },
                { text: 'Mikrotik', value: 'mikrotik' },
                { text: 'Other', value: 'other' }
            ],
            onFilter: (value, record) => record.type === value,
            sorter: (a, b) => a.type.localeCompare(b.type),
        },
        {
            title: 'Secret',
            dataIndex: 'secret',
            key: 'secret',
            width: 150,
            render: () => '********', // Hide actual secret
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (text, record) => (
                <Space size="small">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => onEdit(record)}
                        size="small"
                        type="primary"
                        ghost
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this device?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            icon={<DeleteOutlined />} 
                            size="small"
                            danger
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    // Rowselection object indicates checkable rows
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    return (
        <>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 16 
            }}>
                <Input.Search
                    placeholder="Search by Address or Short name"
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                {selectedRowKeys.length > 0 && (
                    <Popconfirm
                        title={`Are you sure you want to delete ${selectedRowKeys.length} devices?`}
                        onConfirm={() => {
                            // Implement bulk delete
                            selectedRowKeys.forEach(onDelete);
                            setSelectedRowKeys([]);
                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            type="danger" 
                            icon={<DeleteOutlined />}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    </Popconfirm>
                )}
            </div>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredDevices}
                loading={loading}
                rowKey="id"
                scroll={{ 
                    x: 800,  // Enable horizontal scrolling
                    y: 450   // Optional: vertical scrolling if needed
                }}
                style={{ 
                    width: '100%', 
                    overflowX: 'auto' 
                }}
                bordered
            />
        </>
    );
};

export default DevicesTable;