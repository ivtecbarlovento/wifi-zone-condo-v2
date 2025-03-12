// src/components/Layout.js
import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

const { Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme();
  
  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      
      <AntLayout style={{ 
        marginLeft: collapsed ? 80 : 200,
        transition: 'all 0.2s',
        background: darkMode ? '#000' : '#f0f2f5'
      }}>
        <Header 
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
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
