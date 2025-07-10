import React from 'react';
import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'React + Redux',
      description: '使用现代化的状态管理工具',
    },
    {
      icon: (
        <ThunderboltOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
      ),
      title: 'Ant Design',
      description: '企业级UI设计语言',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: 'TypeScript',
      description: '类型安全的开发体验',
    },
    {
      icon: <ApiOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      title: 'Tauri',
      description: '轻量级桌面应用框架',
    },
  ];

  return (
    <div>
      <Title level={2}>欢迎来到 Tauri + React 演示应用</Title>
      <Paragraph>
        这是一个集成了 React、Redux、React Router、Ant Design 和 Tauri
        的基础演示应用。
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '24px 16px' }}
            >
              {feature.icon}
              <Title level={4} style={{ margin: '16px 0 8px' }}>
                {feature.title}
              </Title>
              <Paragraph type='secondary' style={{ fontSize: '14px' }}>
                {feature.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>快速开始</Title>
        <Space direction='vertical' size='large'>
          <Paragraph>探索不同的功能模块：</Paragraph>
          <Space wrap>
            <Button type='primary' size='large'>
              <Link to='/counter'>计数器演示</Link>
            </Button>
            <Button type='default' size='large'>
              <Link to='/users'>用户管理</Link>
            </Button>
            <Button type='default' size='large'>
              <Link to='/about'>关于页面</Link>
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
