import React from 'react';
import { Typography, Card, Button, Space, InputNumber, Statistic } from 'antd';
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from '../store/slices/counterSlice';

const { Title, Paragraph } = Typography;

const Counter: React.FC = () => {
  const count = useAppSelector(state => state.counter.value);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = React.useState(5);

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  const handleIncrementByAmount = () => {
    dispatch(incrementByAmount(incrementAmount));
  };

  const handleReset = () => {
    dispatch(reset());
  };

  return (
    <div>
      <Title level={2}>计数器演示</Title>
      <Paragraph>这是一个使用 Redux Toolkit 管理状态的计数器示例。</Paragraph>

      <Card title='计数器' style={{ marginTop: 24, textAlign: 'center' }}>
        <Statistic
          title='当前值'
          value={count}
          valueStyle={{ color: '#1890ff', fontSize: '48px' }}
        />

        <Space size='large' style={{ marginTop: 24 }}>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            size='large'
            onClick={handleIncrement}
          >
            增加
          </Button>
          <Button
            type='primary'
            danger
            icon={<MinusOutlined />}
            size='large'
            onClick={handleDecrement}
          >
            减少
          </Button>
          <Button
            type='default'
            icon={<ReloadOutlined />}
            size='large'
            onClick={handleReset}
          >
            重置
          </Button>
        </Space>
      </Card>

      <Card title='自定义增量' style={{ marginTop: 24 }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div>
            <Paragraph>设置增量值：</Paragraph>
            <InputNumber
              value={incrementAmount}
              onChange={value => setIncrementAmount(value || 0)}
              min={1}
              max={100}
              style={{ width: '200px' }}
            />
          </div>
          <Button type='primary' onClick={handleIncrementByAmount} size='large'>
            增加 {incrementAmount}
          </Button>
        </Space>
      </Card>

      <Card title='操作说明' style={{ marginTop: 24 }}>
        <Space direction='vertical' size='middle'>
          <Paragraph>
            <strong>基本操作：</strong>
          </Paragraph>
          <ul>
            <li>点击「增加」按钮，计数器 +1</li>
            <li>点击「减少」按钮，计数器 -1</li>
            <li>点击「重置」按钮，计数器归零</li>
          </ul>
          <Paragraph>
            <strong>自定义增量：</strong>
          </Paragraph>
          <ul>
            <li>设置一个自定义的增量值</li>
            <li>点击「增加 X」按钮，计数器增加指定数量</li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};

export default Counter;
