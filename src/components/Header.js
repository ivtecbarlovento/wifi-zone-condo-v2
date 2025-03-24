// src/components/Header.js
import React from 'react';
import { Layout, Button, Avatar, Dropdown, Menu, Space, Grid } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const screens = useBreakpoint();
    const isMobile = screens.xs || screens.sm;

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
            padding: isMobile ? '0 8px' : '0 16px',
            background: darkMode ? '#141414' : '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            height: isMobile ? 56 : 64,
            lineHeight: isMobile ? '56px' : '64px'
        }}>
            <div className="header-left">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapsed}
                />
            </div>

            <div className="header-right">
                <Space size={isMobile ? "small" : "large"}>
                    <Button
                        type="text"
                        icon={<BulbOutlined />}
                        onClick={toggleTheme}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    />
                    
                    <Space className="user-info" style={{ cursor: 'default' }}>
                        <Avatar icon={<UserOutlined />} size={isMobile ? "small" : "default"} />
                        <span>{user?.username || 'User'}</span>
                    </Space>
                </Space>
            </div>
        </Header>
    );
};

export default AppHeader;