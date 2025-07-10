import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { 
  Card, 
  Button, 
  Input, 
  Space, 
  Typography, 
  message, 
  Progress, 
  Spin, 
  Table, 
  Alert,
  Row,
  Col,
  Divider,
  Form,
  InputNumber,
  Select
} from 'antd';
import { 
  SendOutlined, 
  LoadingOutlined, 
  UserOutlined, 
  InfoCircleOutlined,
  CalculatorOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// TypeScript 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

interface ProgressData {
  progress: number;
  message: string;
}

const CommunicationDemo: React.FC = () => {
  // 状态管理
  const [greetName, setGreetName] = useState('');
  const [greetResult, setGreetResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 异步任务状态
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [asyncResult, setAsyncResult] = useState('');
  
  // 进度任务状态
  const [progressValue, setProgressValue] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);
  
  // 系统信息状态
  const [systemInfo, setSystemInfo] = useState<any>(null);
  
  // 用户数据状态
  const [users, setUsers] = useState<User[]>([]);
  
  // 计算器状态
  const [divideA, setDivideA] = useState<number>(10);
  const [divideB, setDivideB] = useState<number>(2);
  const [divideResult, setDivideResult] = useState<number | null>(null);
  
  // 用户处理状态
  const [userForm] = Form.useForm();
  const [processedUser, setProcessedUser] = useState<User | null>(null);

  // 监听事件
  useEffect(() => {
    let unlistenProgress: UnlistenFn | undefined;
    let unlistenTaskComplete: UnlistenFn | undefined;

    const setupListeners = async () => {
      // 监听进度更新事件
      unlistenProgress = await listen<ProgressData>('progress-update', (event) => {
        setProgressValue(event.payload.progress);
        setProgressMessage(event.payload.message);
      });

      // 监听任务完成事件
      unlistenTaskComplete = await listen<{message: string}>('task-completed', (event) => {
        setProgressLoading(false);
        message.success(event.payload.message);
      });
    };

    setupListeners();

    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenTaskComplete) unlistenTaskComplete();
    };
  }, []);

  // 1. 基本命令调用
  const handleGreet = async () => {
    if (!greetName.trim()) {
      message.warning('请输入名字');
      return;
    }
    
    setLoading(true);
    try {
      const result = await invoke<string>('greet', { name: greetName });
      setGreetResult(result);
      message.success('问候成功！');
    } catch (error) {
      message.error('问候失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 异步任务调用
  const handleAsyncTask = async () => {
    setAsyncLoading(true);
    setAsyncResult('');
    try {
      const result = await invoke<ApiResponse<string>>('async_task', { duration: 3 });
      setAsyncResult(result.data || '');
      message.success(result.message);
    } catch (error) {
      message.error('异步任务失败: ' + error);
    } finally {
      setAsyncLoading(false);
    }
  };

  // 3. 获取系统信息
  const handleGetSystemInfo = async () => {
    try {
      const result = await invoke<ApiResponse<any>>('get_system_info');
      setSystemInfo(result.data);
      message.success('系统信息获取成功');
    } catch (error) {
      message.error('获取系统信息失败: ' + error);
    }
  };

  // 4. 进度任务（事件通信）
  const handleStartProgressTask = async () => {
    setProgressLoading(true);
    setProgressValue(0);
    setProgressMessage('准备开始...');
    
    try {
      const result = await invoke<ApiResponse<string>>('start_progress_task');
      message.info(result.message);
    } catch (error) {
      message.error('启动进度任务失败: ' + error);
      setProgressLoading(false);
    }
  };

  // 5. 获取用户列表
  const handleGetUsers = async () => {
    try {
      const result = await invoke<ApiResponse<User[]>>('get_users');
      setUsers(result.data || []);
      message.success('用户列表获取成功');
    } catch (error) {
      message.error('获取用户列表失败: ' + error);
    }
  };

  // 6. 数字计算（错误处理）
  const handleDivide = async () => {
    try {
      const result = await invoke<number>('divide_numbers', { 
        a: divideA, 
        b: divideB 
      });
      setDivideResult(result);
      message.success('计算成功');
    } catch (error) {
      message.error('计算失败: ' + error);
      setDivideResult(null);
    }
  };

  // 7. 处理用户数据
  const handleProcessUser = async (values: any) => {
    try {
      const result = await invoke<ApiResponse<User>>('process_user', { 
        user: values 
      });
      setProcessedUser(result.data || null);
      message.success(result.message);
    } catch (error) {
      message.error('处理用户数据失败: ' + error);
    }
  };

  // 8. 窗口操作
  const handleWindowAction = async (action: string) => {
    try {
      const result = await invoke<ApiResponse<string>>('manage_window', { action });
      message.success(result.message);
    } catch (error) {
      message.error('窗口操作失败: ' + error);
    }
  };

  // 表格列定义
  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>🔄 Tauri 通信演示</Title>
      <Paragraph>
        这个页面展示了 Tauri 应用中 <strong>Core（后端）</strong> 和 <strong>Frontend（前端）</strong> 之间的各种通信方式。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* 1. 基本命令调用 */}
        <Col span={12}>
          <Card title="1. 基本命令调用" extra={<SendOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="输入你的名字"
                value={greetName}
                onChange={(e) => setGreetName(e.target.value)}
                onPressEnter={handleGreet}
              />
              <Button 
                type="primary" 
                loading={loading}
                onClick={handleGreet}
                style={{ width: '100%' }}
              >
                发送问候
              </Button>
              {greetResult && (
                <Alert message={greetResult} type="success" showIcon />
              )}
            </Space>
          </Card>
        </Col>

        {/* 2. 异步任务 */}
        <Col span={12}>
          <Card title="2. 异步任务" extra={<LoadingOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                loading={asyncLoading}
                onClick={handleAsyncTask}
                style={{ width: '100%' }}
              >
                {asyncLoading ? '执行中...' : '启动3秒异步任务'}
              </Button>
              {asyncResult && (
                <Alert message={asyncResult} type="info" showIcon />
              )}
            </Space>
          </Card>
        </Col>

        {/* 3. 系统信息 */}
        <Col span={12}>
          <Card title="3. 系统信息" extra={<InfoCircleOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                onClick={handleGetSystemInfo}
                style={{ width: '100%' }}
              >
                获取系统信息
              </Button>
              {systemInfo && (
                <div>
                  <Text strong>平台:</Text> {systemInfo.platform}<br />
                  <Text strong>架构:</Text> {systemInfo.arch}<br />
                  <Text strong>系统族:</Text> {systemInfo.family}<br />
                  <Text strong>时间:</Text> {systemInfo.timestamp}
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 4. 进度任务（事件通信） */}
        <Col span={12}>
          <Card title="4. 进度任务（事件通信）" extra={<PlayCircleOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                loading={progressLoading}
                onClick={handleStartProgressTask}
                style={{ width: '100%' }}
              >
                启动进度任务
              </Button>
              {progressLoading && (
                <div>
                  <Progress percent={progressValue} />
                  <Text type="secondary">{progressMessage}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 5. 数字计算（错误处理） */}
        <Col span={12}>
          <Card title="5. 数字计算（错误处理）" extra={<CalculatorOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={8}>
                <Col span={10}>
                  <InputNumber
                    value={divideA}
                    onChange={(value) => setDivideA(value || 0)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={4} style={{ textAlign: 'center', paddingTop: '6px' }}>
                  ÷
                </Col>
                <Col span={10}>
                  <InputNumber
                    value={divideB}
                    onChange={(value) => setDivideB(value || 0)}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
              <Button 
                type="primary" 
                onClick={handleDivide}
                style={{ width: '100%' }}
              >
                计算
              </Button>
              {divideResult !== null && (
                <Alert 
                  message={`结果: ${divideResult}`} 
                  type="success" 
                  showIcon 
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* 6. 用户数据处理 */}
        <Col span={12}>
          <Card title="6. 用户数据处理" extra={<UserOutlined />}>
            <Form form={userForm} onFinish={handleProcessUser}>
              <Form.Item name="id" label="ID" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="age" label="年龄" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                  处理用户数据
                </Button>
              </Form.Item>
            </Form>
            {processedUser && (
              <Alert 
                message={`处理后: ${processedUser.name} (${processedUser.email})`} 
                type="success" 
                showIcon 
              />
            )}
          </Card>
        </Col>

        {/* 7. 用户列表 */}
        <Col span={24}>
          <Card title="7. 用户列表" extra={<TeamOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                onClick={handleGetUsers}
                style={{ marginBottom: '16px' }}
              >
                获取用户列表
              </Button>
              <Table 
                columns={userColumns} 
                dataSource={users} 
                rowKey="id"
                size="small"
              />
            </Space>
          </Card>
        </Col>

        {/* 8. 窗口操作 */}
        <Col span={24}>
          <Card title="8. 窗口操作" extra={<SettingOutlined />}>
            <Space>
              <Button onClick={() => handleWindowAction('minimize')}>
                最小化窗口
              </Button>
              <Button onClick={() => handleWindowAction('maximize')}>
                最大化窗口
              </Button>
              <Button danger onClick={() => handleWindowAction('close')}>
                关闭窗口
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CommunicationDemo; 