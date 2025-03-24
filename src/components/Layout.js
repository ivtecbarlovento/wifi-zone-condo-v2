// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Grid } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

const { Content } = AntLayout;
const { useBreakpoint } = Grid;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme();
  const screens = useBreakpoint();
  const isMobile = screens.xs || screens.sm;
  
  // Auto-collapse sidebar on mobile screens
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <AntLayout className={isMobile && !collapsed ? 'mobile-sidebar-open' : ''} style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      
      <AntLayout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
        transition: 'all 0.2s',
        background: darkMode ? '#000' : '#f0f2f5'
      }}>
        <Header 
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
        
        <Content style={{ 
          margin: isMobile ? '8px 8px' : '24px 16px', 
          padding: isMobile ? 12 : 24, 
          background: darkMode ? '#141414' : '#fff',
          borderRadius: 4,
          minHeight: 280
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;