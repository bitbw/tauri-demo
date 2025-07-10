import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Typography, theme, Space } from 'antd';
import {
  HomeOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  UserOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import UpdateManager from './UpdateManager';

const { Header, Content, Sider } = AntLayout;
const { Title } = Typography;

const Layout: React.FC = () => {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to='/'>首页</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to='/about'>关于</Link>,
    },
    {
      key: '/counter',
      icon: <CalculatorOutlined />,
      label: <Link to='/counter'>计数器</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to='/users'>用户管理</Link>,
    },
    {
      key: '/communication',
      icon: <ApiOutlined />,
      label: <Link to='/communication'>通信演示</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px' 
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Tauri + React Demo
        </Title>
        <Space>
          <UpdateManager autoCheck={true} checkInterval={30} />
        </Space>
      </Header>
      <AntLayout>
        <Sider
          width={200}
          style={{
            background: colorBgContainer,
          }}
        >
          <Menu
            mode='inline'
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <AntLayout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
