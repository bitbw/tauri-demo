import React from 'react';
import { Typography, Card, Descriptions, Tag, Space } from 'antd';
import { GithubOutlined, ApiOutlined, CodeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  return (
    <div>
      <Title level={2}>关于本项目</Title>
      <Paragraph>
        这是一个基于 Tauri 和 React
        的桌面应用演示项目，集成了现代化的前端技术栈。
      </Paragraph>

      <Card title='技术栈' style={{ marginTop: 24 }}>
        <Space direction='vertical' size='middle' style={{ width: '100%' }}>
          <div>
            <Title level={4}>前端技术</Title>
            <Space wrap>
              <Tag color='blue'>React 18</Tag>
              <Tag color='green'>TypeScript</Tag>
              <Tag color='orange'>Vite</Tag>
              <Tag color='purple'>Ant Design</Tag>
            </Space>
          </div>

          <div>
            <Title level={4}>状态管理</Title>
            <Space wrap>
              <Tag color='red'>Redux Toolkit</Tag>
              <Tag color='cyan'>React Redux</Tag>
            </Space>
          </div>

          <div>
            <Title level={4}>路由</Title>
            <Space wrap>
              <Tag color='magenta'>React Router</Tag>
            </Space>
          </div>

          <div>
            <Title level={4}>代码质量</Title>
            <Space wrap>
              <Tag color='gold'>ESLint</Tag>
              <Tag color='lime'>Prettier</Tag>
            </Space>
          </div>

          <div>
            <Title level={4}>桌面框架</Title>
            <Space wrap>
              <Tag color='volcano'>Tauri</Tag>
              <Tag color='geekblue'>Rust</Tag>
            </Space>
          </div>
        </Space>
      </Card>

      <Card title='项目信息' style={{ marginTop: 24 }}>
        <Descriptions column={1}>
          <Descriptions.Item label='项目名称'>tauri-test1</Descriptions.Item>
          <Descriptions.Item label='版本'>0.1.0</Descriptions.Item>
          <Descriptions.Item label='开发语言'>
            TypeScript, Rust
          </Descriptions.Item>
          <Descriptions.Item label='构建工具'>Vite, Tauri</Descriptions.Item>
          <Descriptions.Item label='UI框架'>Ant Design 5.x</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title='功能特性' style={{ marginTop: 24 }}>
        <Space direction='vertical' size='middle'>
          <div>
            <CodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>现代化的 React 开发体验</span>
          </div>
          <div>
            <ApiOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            <span>Redux 状态管理</span>
          </div>
          <div>
            <GithubOutlined style={{ marginRight: 8, color: '#722ed1' }} />
            <span>类型安全的 TypeScript</span>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default About;
