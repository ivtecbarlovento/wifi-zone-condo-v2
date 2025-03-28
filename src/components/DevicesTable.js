// src/components/DevicesTable.js
import React from 'react';
import { Table } from 'antd';

const DevicesTable = ({ devices, loading, onFetchDevices }) => {
    // Table columns
    const columns = [
        {
            title: 'NAS Name',
            dataIndex: 'nasname',
            key: 'nasname',
        },
        {
            title: 'Short Name',
            dataIndex: 'shortname',
            key: 'shortname',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'IP Address',
            dataIndex: 'nasipaddress',
            key: 'nasipaddress',
        },
        {
            title: 'Secret',
            dataIndex: 'secret',
            key: 'secret',
            render: () => '********', // Hide actual secret
        },
        {
            title: 'Server',
            dataIndex: 'server',
            key: 'server',
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={devices}
            loading={loading}
            rowKey="id"
        />
    );
};

export default DevicesTable;