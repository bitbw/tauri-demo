import React from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addUser, removeUser, setUsers } from '../store/slices/userSlice';

const { Title, Paragraph } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
}

const UserManagement: React.FC = () => {
  const { users } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [form] = Form.useForm();

  // 初始化示例数据
  React.useEffect(() => {
    if (users.length === 0) {
      const initialUsers: User[] = [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
        { id: 3, name: '王五', email: 'wangwu@example.com' },
      ];
      dispatch(setUsers(initialUsers));
    }
  }, [users.length, dispatch]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
    form.setFieldsValue(user);
  };

  const handleDeleteUser = (id: number) => {
    dispatch(removeUser(id));
    message.success('用户删除成功');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // 编辑用户
        const updatedUsers = users.map((user: User) =>
          user.id === editingUser.id ? { ...user, ...values } : user
        );
        dispatch(setUsers(updatedUsers));
        message.success('用户更新成功');
      } else {
        // 添加新用户
        const newUser: User = {
          id: Date.now(),
          name: values.name,
          email: values.email,
        };
        dispatch(addUser(newUser));
        message.success('用户添加成功');
      }
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size='middle'>
          <Button
            type='primary'
            icon={<EditOutlined />}
            size='small'
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title='确定要删除这个用户吗？'
            onConfirm={() => handleDeleteUser(record.id)}
            okText='确定'
            cancelText='取消'
          >
            <Button
              type='primary'
              danger
              icon={<DeleteOutlined />}
              size='small'
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>用户管理</Title>
      <Paragraph>
        这是一个使用 Redux 管理用户数据的示例页面，包含增删改查功能。
      </Paragraph>

      <Card
        title='用户列表'
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        }
        style={{ marginTop: 24 }}
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey='id'
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText='确定'
        cancelText='取消'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            label='姓名'
            name='name'
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder='请输入姓名' />
          </Form.Item>
          <Form.Item
            label='邮箱'
            name='email'
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder='请输入邮箱' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
