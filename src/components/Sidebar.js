// src/components/Sidebar.js
import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, TableOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode } = useTheme();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        // {
        //     key: '/data',
        //     icon: <TableOutlined />,
        //     label: 'Data Table',
        // },
        // {
        //     key: '/settings',
        //     icon: <SettingOutlined />,
        //     label: 'Settings',
        // },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: logout,
        }
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme={darkMode ? 'dark' : 'light'}
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0
            }}
        >
            <div className="logo" style={{
                height: 64,
                margin: 16,
                // background: 'rgba(237, 34, 34, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: darkMode ? 'white' : 'black',
                fontWeight: 'bold',
                fontSize: collapsed ? 14 : 18,
            }}>
                {collapsed ? 'IVTEC' : 'IVTEC Barlovento C.A.'}
            </div>

            {!collapsed && (
                <div style={{
                    padding: '0 16px 16px',
                    textAlign: 'center',
                    color: darkMode ? 'white' : 'black',
                }}>
                    Welcome, {user?.username || 'User'}
                </div>
            )}

            <Menu
                theme={darkMode ? 'dark' : 'light'}
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};

export default Sidebar;

