// src/components/Sidebar.js
import React from 'react';
import { Layout, Menu, Grid } from 'antd';
import { DashboardOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Import the logo assets
import LogoLargeWhite from '../assets/LogoLargeWhite.png';
import LogoWhite from '../assets/LogoWhite.png';
import LogoLargeBlack from '../assets/LogoLargeBlack.png';
import LogoBlack from '../assets/LogoBlack.png';

const { Sider } = Layout;
const { useBreakpoint } = Grid;

const Sidebar = ({ collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode } = useTheme();
    const screens = useBreakpoint();
    const isMobile = screens.xs || screens.sm;

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/users',	
            icon: <TeamOutlined />,
            label: 'Users',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: logout,
        }
    ];

    // Handle menu item clicks
    const handleMenuClick = (item) => {
        if (item.key === 'logout') {
            logout();
        } else {
            navigate(item.key);
        }
        
        // On mobile, auto-collapse the sidebar after navigation
        if (isMobile && !collapsed) {
            toggleCollapsed(); // Now using the passed prop
        }
    };

    return (
        <>
            {/* Overlay for mobile - only shown when sidebar is expanded on mobile */}
            {isMobile && !collapsed && (
                <div 
                    className="mobile-sidebar-overlay"
                    onClick={toggleCollapsed} // Now using the passed prop
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.45)',
                        zIndex: 998,
                    }}
                />
            )}
            
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                collapsedWidth={isMobile ? 0 : 80}
                width={200}
                theme={darkMode ? 'dark' : 'light'}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: isMobile ? 999 : 1,
                    transition: 'all 0.2s'
                }}
            >
                <div className="logo" style={{
                    height: isMobile ? 56 : 64,
                    margin: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <img 
                        src={
                            collapsed 
                                ? (darkMode ? LogoWhite : LogoBlack) 
                                : (darkMode ? LogoLargeWhite : LogoLargeBlack)
                        } 
                        alt="IVTEC Logo"
                        style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain'
                        }}
                    />
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
                    onClick={handleMenuClick}
                />
            </Sider>
        </>
    );
};

export default Sidebar;