import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, Typography, Space, Alert, notification } from 'antd';
import { DownloadOutlined, SyncOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';

const { Title, Text } = Typography;

interface UpdateManagerProps {
  autoCheck?: boolean;
  checkInterval?: number; // 分钟
  showButton?: boolean;
}

interface UpdateInfo {
  version: string;
  notes: string;
  available: boolean;
}

const UpdateManager: React.FC<UpdateManagerProps> = ({ 
  autoCheck = true, 
  checkInterval = 60,
  showButton = true 
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  // 检查更新
  const checkForUpdates = async (showResult = false) => {
    if (checking) return;
    
    setChecking(true);
    setError('');
    
    try {
      const result = await invoke<string>('check_for_updates');
      
      if (result.includes('发现新版本')) {
        const versionMatch = result.match(/发现新版本: ([\d.]+)/);
        const version = versionMatch ? versionMatch[1] : '未知版本';
        
        setUpdateInfo({
          version,
          notes: '发现新版本，包含 bug 修复和性能改进',
          available: true
        });
        setUpdateAvailable(true);
        setModalVisible(true);
        
        notification.info({
          message: '发现新版本',
          description: `发现新版本 ${version}，点击立即更新`,
          placement: 'bottomRight',
          duration: 6,
          onClick: () => setModalVisible(true)
        });
      } else if (showResult) {
        notification.success({
          message: '检查更新',
          description: result,
          placement: 'bottomRight',
        });
      }
    } catch (err) {
      const errorMsg = err as string;
      setError(errorMsg);
      if (showResult) {
        notification.error({
          message: '检查更新失败',
          description: errorMsg,
          placement: 'bottomRight',
        });
      }
    } finally {
      setChecking(false);
    }
  };

  // 下载并安装更新
  const downloadAndInstall = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setError('');
    setDownloadProgress(0);
    
    try {
      // 模拟下载进度
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const result = await invoke<string>('download_and_install_update');
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      if (result.includes('更新已安装')) {
        setTimeout(() => {
          Modal.success({
            title: '更新完成',
            content: '更新已成功安装，应用将重启以应用更新',
            onOk: () => {
              // 重启应用
              invoke('restart_app').catch(console.error);
            },
          });
        }, 1000);
      } else {
        setUpdateInfo(prev => prev ? { ...prev, notes: result } : null);
      }
    } catch (err) {
      const errorMsg = err as string;
      setError(errorMsg);
      notification.error({
        message: '更新失败',
        description: errorMsg,
        placement: 'bottomRight',
      });
    } finally {
      setDownloading(false);
    }
  };

  // 跳过此次更新
  const skipUpdate = () => {
    setModalVisible(false);
    setUpdateAvailable(false);
    setUpdateInfo(null);
    notification.info({
      message: '已跳过更新',
      description: '您可以稍后手动检查更新',
      placement: 'bottomRight',
    });
  };

  // 自动检查更新
  useEffect(() => {
    if (autoCheck) {
      // 启动时延迟检查（避免启动时卡顿）
      const startupTimeout = setTimeout(() => {
        checkForUpdates();
      }, 5000);
      
      // 定时检查
      const interval = setInterval(() => {
        checkForUpdates();
      }, checkInterval * 60 * 1000);
      
      return () => {
        clearTimeout(startupTimeout);
        clearInterval(interval);
      };
    }
  }, [autoCheck, checkInterval]);

  if (!showButton) {
    return (
      <Modal
        title={
          <Space>
            <RocketOutlined />
            发现新版本
          </Space>
        }
        open={modalVisible}
        onCancel={skipUpdate}
        footer={[
          <Button key="skip" onClick={skipUpdate}>
            稍后更新
          </Button>,
          <Button 
            key="update" 
            type="primary" 
            loading={downloading}
            onClick={downloadAndInstall}
            icon={<DownloadOutlined />}
          >
            {downloading ? '正在更新...' : '立即更新'}
          </Button>,
        ]}
        closable={!downloading}
        maskClosable={!downloading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {error && (
            <Alert
              message="更新出错"
              description={error}
              type="error"
              showIcon
            />
          )}
          
          {updateInfo && (
            <div>
              <Title level={4}>版本 {updateInfo.version}</Title>
              <Text type="secondary">{updateInfo.notes}</Text>
            </div>
          )}
          
          {downloading && (
            <div>
              <Text>正在下载更新包...</Text>
              <Progress 
                percent={Math.round(downloadProgress)} 
                status={downloadProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Text type="secondary">
                {downloadProgress === 100 ? '准备安装...' : `下载进度: ${Math.round(downloadProgress)}%`}
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    );
  }

  return (
    <>
      {/* 手动检查更新按钮 */}
      <Button
        icon={checking ? <SyncOutlined spin /> : <CheckCircleOutlined />}
        onClick={() => checkForUpdates(true)}
        loading={checking}
        type="primary"
        ghost
        size="small"
      >
        {checking ? '检查中...' : '检查更新'}
      </Button>

      {/* 更新对话框 */}
      <Modal
        title={
          <Space>
            <RocketOutlined />
            发现新版本
          </Space>
        }
        open={modalVisible}
        onCancel={skipUpdate}
        footer={[
          <Button key="skip" onClick={skipUpdate} disabled={downloading}>
            稍后更新
          </Button>,
          <Button 
            key="update" 
            type="primary" 
            loading={downloading}
            onClick={downloadAndInstall}
            icon={<DownloadOutlined />}
          >
            {downloading ? '正在更新...' : '立即更新'}
          </Button>,
        ]}
        closable={!downloading}
        maskClosable={!downloading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {error && (
            <Alert
              message="更新出错"
              description={error}
              type="error"
              showIcon
            />
          )}
          
          {updateInfo && (
            <div>
              <Title level={4}>版本 {updateInfo.version}</Title>
              <Text type="secondary">{updateInfo.notes}</Text>
            </div>
          )}
          
          {downloading && (
            <div>
              <Text>正在下载更新包...</Text>
              <Progress 
                percent={Math.round(downloadProgress)} 
                status={downloadProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Text type="secondary">
                {downloadProgress === 100 ? '准备安装...' : `下载进度: ${Math.round(downloadProgress)}%`}
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default UpdateManager; 