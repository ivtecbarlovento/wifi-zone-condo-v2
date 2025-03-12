// src/components/Header.js
import React from 'react';
import { Layout, Button, Avatar, Dropdown, Menu, Space } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Header } = Layout;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();

    const userMenu = (
        <Menu items={[
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Profile',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: logout,
            },
        ]} />
    );

    return (
        <Header className="app-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: darkMode ? '#141414' : '#fff'
        }}>
            <div className="header-left">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapsed}
                />
            </div>

            <div className="header-right">
                <Space size="large">
                    <Button
                        type="text"
                        icon={<BulbOutlined />}
                        onClick={toggleTheme}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    />
                    <Space className="user-info" style={{ cursor: 'pointer' }}>
                        <Avatar icon={<UserOutlined />} />
                        <span>{user?.username || 'User'}</span>
                    </Space>
                </Space>
            </div>
        </Header>
    );
};

export default AppHeader;

