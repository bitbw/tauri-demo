# Tauri 自动更新完整指南

## 🚀 更新策略概览

Tauri 提供了多种自动更新的实现方式：

### 1. **内置 Updater 插件** (推荐)
- ✅ 官方支持，稳定可靠
- ✅ 支持签名验证
- ✅ 增量更新
- ❌ 需要服务器支持

### 2. **GitHub Releases** (简单易用)
- ✅ 免费，无需自建服务器
- ✅ 自动签名
- ❌ 依赖 GitHub

### 3. **自建更新服务器** (完全控制)
- ✅ 完全自主控制
- ✅ 支持企业内网
- ❌ 需要维护服务器

## 📦 方案一：使用 Tauri 内置 Updater 插件

### 步骤 1: 安装 Updater 插件

```bash
# 添加 updater 插件
pnpm tauri add updater

# 或者手动添加依赖
cargo add tauri-plugin-updater --features native-tls
```

### 步骤 2: 配置 Cargo.toml

```toml
[dependencies]
tauri = { version = "2", features = ["updater"] }
tauri-plugin-updater = "2"
```

### 步骤 3: 配置 tauri.conf.json

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://your-update-server.com/updates/{{target}}/{{current_version}}",
        "https://github.com/your-username/your-repo/releases/download/{{current_version}}/update.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-update-server.com/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 步骤 4: 生成密钥对

```bash
# 生成密钥对用于签名
pnpm tauri signer generate -w ~/.tauri/myapp.key

# 获取公钥
pnpm tauri signer sign -k ~/.tauri/myapp.key --password YOUR_PASSWORD
```

### 步骤 5: 后端 Rust 代码

```rust
// src-tauri/src/lib.rs
use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<String, String> {
    match app.updater() {
        Some(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if update.is_update_available() {
                        Ok(format!("发现新版本: {}", update.version))
                    } else {
                        Ok("当前已是最新版本".to_string())
                    }
                }
                Err(e) => Err(format!("检查更新失败: {}", e)),
            }
        }
        None => Err("更新器未初始化".to_string()),
    }
}

#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<String, String> {
    match app.updater() {
        Some(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if update.is_update_available() {
                        // 下载并安装更新
                        match update.download_and_install().await {
                            Ok(_) => Ok("更新已安装，请重启应用".to_string()),
                            Err(e) => Err(format!("安装更新失败: {}", e)),
                        }
                    } else {
                        Ok("没有可用更新".to_string())
                    }
                }
                Err(e) => Err(format!("检查更新失败: {}", e)),
            }
        }
        None => Err("更新器未初始化".to_string()),
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            check_for_updates,
            download_and_install_update,
            // ... 其他命令
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 步骤 6: 前端 React 代码

```tsx
// src/components/UpdateManager.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, Typography, Space, Alert } from 'antd';
import { DownloadOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { relaunch } from '@tauri-apps/plugin-process';

const { Title, Text } = Typography;

interface UpdateManagerProps {
  autoCheck?: boolean;
  checkInterval?: number; // 分钟
}

const UpdateManager: React.FC<UpdateManagerProps> = ({ 
  autoCheck = true, 
  checkInterval = 60 
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  // 检查更新
  const checkForUpdates = async (showResult = false) => {
    if (checking) return;
    
    setChecking(true);
    setError('');
    
    try {
      const result = await invoke<string>('check_for_updates');
      setUpdateInfo(result);
      
      if (result.includes('发现新版本')) {
        setUpdateAvailable(true);
        setModalVisible(true);
      } else if (showResult) {
        Modal.success({
          title: '检查更新',
          content: result,
        });
      }
    } catch (err) {
      const errorMsg = err as string;
      setError(errorMsg);
      if (showResult) {
        Modal.error({
          title: '检查更新失败',
          content: errorMsg,
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
    
    try {
      const result = await invoke<string>('download_and_install_update');
      
      if (result.includes('更新已安装')) {
        Modal.success({
          title: '更新完成',
          content: '应用将重启以应用更新',
          onOk: () => {
            relaunch();
          },
        });
      } else {
        setUpdateInfo(result);
      }
    } catch (err) {
      const errorMsg = err as string;
      setError(errorMsg);
      Modal.error({
        title: '更新失败',
        content: errorMsg,
      });
    } finally {
      setDownloading(false);
    }
  };

  // 自动检查更新
  useEffect(() => {
    if (autoCheck) {
      // 启动时检查
      checkForUpdates();
      
      // 定时检查
      const interval = setInterval(() => {
        checkForUpdates();
      }, checkInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval]);

  return (
    <>
      {/* 手动检查更新按钮 */}
      <Button
        icon={checking ? <SyncOutlined spin /> : <CheckCircleOutlined />}
        onClick={() => checkForUpdates(true)}
        loading={checking}
        type="primary"
        ghost
      >
        检查更新
      </Button>

      {/* 更新对话框 */}
      <Modal
        title="发现新版本"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            稍后更新
          </Button>,
          <Button 
            key="update" 
            type="primary" 
            loading={downloading}
            onClick={downloadAndInstall}
            icon={<DownloadOutlined />}
          >
            立即更新
          </Button>,
        ]}
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
          
          <Text>{updateInfo}</Text>
          
          {downloading && (
            <div>
              <Text>正在下载更新...</Text>
              <Progress percent={0} status="active" />
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default UpdateManager;
```

### 步骤 7: 在主应用中使用

```tsx
// src/App.tsx
import UpdateManager from './components/UpdateManager';

function App() {
  return (
    <div className="App">
      {/* 其他组件 */}
      
      {/* 更新管理器 */}
      <UpdateManager autoCheck={true} checkInterval={60} />
    </div>
  );
}
```

## 🌟 方案二：使用 GitHub Releases (推荐新手)

### 步骤 1: 配置 GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build app
      run: pnpm tauri build
      
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.os }}-app
        path: src-tauri/target/release/bundle/
```

### 步骤 2: 配置 tauri.conf.json

```json
{
  "bundle": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/your-username/your-repo/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 步骤 3: 创建更新信息文件

```json
// latest.json
{
  "version": "1.0.1",
  "notes": "Bug fixes and improvements",
  "pub_date": "2023-12-01T00:00:00Z",
  "platforms": {
    "win64": {
      "signature": "SIGNATURE_HERE",
      "url": "https://github.com/your-username/your-repo/releases/download/v1.0.1/app-setup.exe"
    },
    "linux": {
      "signature": "SIGNATURE_HERE", 
      "url": "https://github.com/your-username/your-repo/releases/download/v1.0.1/app.AppImage"
    },
    "darwin": {
      "signature": "SIGNATURE_HERE",
      "url": "https://github.com/your-username/your-repo/releases/download/v1.0.1/app.dmg"
    }
  }
}
```

## 🏗️ 方案三：自建更新服务器

### 简单的 Node.js 更新服务器

```javascript
// update-server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 更新信息存储
const updates = {
  "1.0.1": {
    version: "1.0.1",
    notes: "Bug fixes and improvements",
    pub_date: new Date().toISOString(),
    platforms: {
      win64: {
        signature: "SIGNATURE_HERE",
        url: "https://your-server.com/downloads/app-1.0.1-setup.exe"
      },
      linux: {
        signature: "SIGNATURE_HERE",
        url: "https://your-server.com/downloads/app-1.0.1.AppImage"
      },
      darwin: {
        signature: "SIGNATURE_HERE", 
        url: "https://your-server.com/downloads/app-1.0.1.dmg"
      }
    }
  }
};

// 检查更新端点
app.get('/updates/:target/:version', (req, res) => {
  const { target, version } = req.params;
  
  // 获取最新版本
  const latestVersion = Object.keys(updates).sort().pop();
  const updateInfo = updates[latestVersion];
  
  if (!updateInfo) {
    return res.status(404).json({ error: '未找到更新信息' });
  }
  
  // 检查是否有新版本
  if (version === latestVersion) {
    return res.json({ version: latestVersion, available: false });
  }
  
  // 返回更新信息
  const platformInfo = updateInfo.platforms[target];
  if (!platformInfo) {
    return res.status(404).json({ error: '不支持的平台' });
  }
  
  res.json({
    version: updateInfo.version,
    notes: updateInfo.notes,
    pub_date: updateInfo.pub_date,
    url: platformInfo.url,
    signature: platformInfo.signature,
    available: true
  });
});

// 下载文件端点
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'releases', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('文件不存在');
  }
});

app.listen(3000, () => {
  console.log('更新服务器运行在端口 3000');
});
```

### 使用 Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "update-server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  update-server:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./releases:/app/releases
    restart: unless-stopped
```

## 🔧 高级配置

### 1. 自定义更新 UI

```tsx
// src/components/CustomUpdateDialog.tsx
import React, { useState } from 'react';
import { Modal, Button, Progress, Typography, Space, Timeline } from 'antd';

const CustomUpdateDialog: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  
  return (
    <Modal
      title="应用更新"
      open={visible}
      footer={null}
      closable={false}
      centered
    >
      <Timeline>
        <Timeline.Item color="green">检查更新</Timeline.Item>
        <Timeline.Item color={progress > 0 ? 'green' : 'gray'}>
          下载更新包
        </Timeline.Item>
        <Timeline.Item color={progress === 100 ? 'green' : 'gray'}>
          安装更新
        </Timeline.Item>
        <Timeline.Item color={progress === 100 ? 'green' : 'gray'}>
          重启应用
        </Timeline.Item>
      </Timeline>
      
      <Progress percent={progress} />
      
      <Space style={{ marginTop: 16 }}>
        <Button onClick={() => setVisible(false)}>稍后更新</Button>
        <Button type="primary">立即更新</Button>
      </Space>
    </Modal>
  );
};
```

### 2. 更新策略配置

```rust
// src-tauri/src/update_config.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateConfig {
    pub auto_check: bool,
    pub check_interval: u64, // 分钟
    pub auto_download: bool,
    pub auto_install: bool,
    pub update_channel: String, // stable, beta, dev
}

impl Default for UpdateConfig {
    fn default() -> Self {
        Self {
            auto_check: true,
            check_interval: 60,
            auto_download: false,
            auto_install: false,
            update_channel: "stable".to_string(),
        }
    }
}
```

### 3. 增量更新支持

```rust
// src-tauri/src/incremental_update.rs
use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn apply_incremental_update(patch_path: String) -> Result<String, String> {
    let patch_file = Path::new(&patch_path);
    
    if !patch_file.exists() {
        return Err("补丁文件不存在".to_string());
    }
    
    // 应用增量更新逻辑
    // 这里可以使用 bsdiff 或类似的差分算法
    
    Ok("增量更新应用成功".to_string())
}
```

## 🔒 安全考虑

### 1. 签名验证

```bash
# 生成密钥对
tauri signer generate -w ~/.tauri/myapp.key

# 签名文件
tauri signer sign -k ~/.tauri/myapp.key -p PASSWORD file.exe
```

### 2. HTTPS 强制

```json
{
  "bundle": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://secure-update-server.com/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 3. 版本验证

```rust
#[tauri::command]
fn verify_update_version(new_version: String, current_version: String) -> Result<bool, String> {
    // 实现版本比较逻辑
    let new_parts: Vec<u32> = new_version.split('.').map(|s| s.parse().unwrap_or(0)).collect();
    let current_parts: Vec<u32> = current_version.split('.').map(|s| s.parse().unwrap_or(0)).collect();
    
    for i in 0..std::cmp::max(new_parts.len(), current_parts.len()) {
        let new_part = new_parts.get(i).unwrap_or(&0);
        let current_part = current_parts.get(i).unwrap_or(&0);
        
        if new_part > current_part {
            return Ok(true);
        } else if new_part < current_part {
            return Ok(false);
        }
    }
    
    Ok(false)
}
```

## 📝 最佳实践

1. **渐进式更新**：优先检查小更新，降低用户感知
2. **断点续传**：支持大文件的断点续传下载
3. **回滚机制**：更新失败时自动回滚到previous版本
4. **用户控制**：让用户选择更新时间和方式
5. **监控统计**：记录更新成功率和失败原因

## 🎯 服务器要求总结

- **最低要求**：静态文件服务器 (如 GitHub Pages, CDN)
- **推荐配置**：支持 HTTPS 的 Web 服务器
- **企业级**：专用更新服务器，支持增量更新、A/B 测试等

选择适合你的方案，开始实现自动更新吧！ 