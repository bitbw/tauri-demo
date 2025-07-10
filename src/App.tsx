import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>应用已成功启动！</Title>
      <Paragraph>
        如果您看到这个页面，说明路由配置可能有问题。请检查路由配置。
      </Paragraph>
    </div>
  );
};

export default App;
