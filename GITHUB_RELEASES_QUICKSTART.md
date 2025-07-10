# GitHub Releases 自动更新快速开始指南

## 📋 检查清单

在开始之前，确保你已经完成以下步骤：

### 1. 生成签名密钥

```bash
# 生成密钥对
npx tauri signer generate -w ~/.tauri/tauri-test1.key

# 输入密码（记住这个密码）
```

### 2. 获取公钥

```bash
# 查看生成的公钥文件
cat ~/.tauri/tauri-test1.key.pub

# 复制输出的公钥字符串（整个内容）
```

### 3. 配置 GitHub Secrets

在你的 GitHub 仓库中添加以下 Secrets：

1. 访问 `Settings` > `Secrets and variables` > `Actions`
2. 添加以下内容：

| Secret Name | Value |
|-------------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | 你的私钥文件内容 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 你设置的密码 |

### 4. 更新配置文件

编辑 `src-tauri/tauri.conf.json` 并替换：

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

**替换内容：**
- `YOUR_USERNAME`: 你的 GitHub 用户名
- `YOUR_REPO`: 你的仓库名
- `YOUR_PUBLIC_KEY_HERE`: 步骤 2 中获取的公钥

## 🚀 第一次发布

### 1. 确保版本同步

检查 `package.json` 和 `src-tauri/Cargo.toml` 中的版本号是否一致：

```json
// package.json
{
  "version": "0.1.0"
}
```

```toml
# src-tauri/Cargo.toml
[package]
version = "0.1.0"
```

### 2. 创建发布

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: 添加自动更新功能"

# 2. 创建标签
git tag v0.1.0

# 3. 推送到 GitHub
git push origin main
git push origin v0.1.0
```

### 3. 验证发布

1. 访问 GitHub 仓库的 `Actions` 页面
2. 确认工作流正在运行
3. 等待构建完成
4. 检查 `Releases` 页面是否有新发布

## 📦 后续发布

### 自动版本更新

```bash
# 补丁版本 (0.1.0 -> 0.1.1)
npm version patch

# 小版本 (0.1.0 -> 0.2.0)
npm version minor

# 大版本 (0.1.0 -> 1.0.0)
npm version major
```

### 手动发布

```bash
# 1. 更新版本号
npm version patch

# 2. 提交更改
git add .
git commit -m "chore: bump version to v0.1.1"

# 3. 推送标签
git push origin main
git push origin --tags
```

## 🔧 测试更新

### 1. 构建开发版本

```bash
npm run build:tauri
```

### 2. 测试更新功能

在应用中点击"检查更新"按钮，应该会看到当前版本信息。

### 3. 模拟更新测试

1. 发布一个新版本到 GitHub
2. 安装旧版本的应用
3. 在应用中点击"检查更新"
4. 应该会提示有新版本可用

## 🐛 常见问题

### 问题 1: 签名验证失败

```bash
# 重新生成密钥
npx tauri signer generate -w ~/.tauri/tauri-test1.key

# 更新 GitHub Secrets
# 更新 tauri.conf.json 中的公钥
```

### 问题 2: 找不到更新

检查端点 URL 是否正确：
```bash
# 测试端点
curl https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json
```

### 问题 3: GitHub Actions 失败

1. 检查 GitHub Secrets 是否正确设置
2. 查看 Actions 日志中的错误信息
3. 确保仓库有写入权限

## 📱 使用自动更新

### 前端代码示例

```typescript
import { invoke } from '@tauri-apps/api/core';

// 检查更新
const checkUpdates = async () => {
  try {
    const result = await invoke('check_for_updates');
    console.log(result);
  } catch (error) {
    console.error('检查更新失败:', error);
  }
};

// 下载并安装更新
const installUpdate = async () => {
  try {
    const result = await invoke('download_and_install_update');
    console.log(result);
  } catch (error) {
    console.error('安装更新失败:', error);
  }
};
```

### 获取版本信息

```typescript
// 获取当前版本
const getCurrentVersion = async () => {
  const version = await invoke('get_app_version');
  return version;
};

// 获取详细更新信息
const getUpdateInfo = async () => {
  try {
    const info = await invoke('get_update_info');
    return info;
  } catch (error) {
    console.error('获取更新信息失败:', error);
  }
};
```

## 🎯 最佳实践

### 1. 版本管理

- 使用语义版本控制 (SemVer)
- 保持 `package.json` 和 `Cargo.toml` 版本同步
- 为每个版本编写清晰的变更日志

### 2. 发布流程

- 在发布前进行充分测试
- 使用 draft releases 进行预发布测试
- 设置自动化的 CI/CD 流程

### 3. 用户体验

- 提供清晰的更新说明
- 支持静默更新和手动更新
- 在更新前备份用户数据

## 🔄 自动化脚本

创建 `scripts/release.sh` 来自动化发布流程：

```bash
#!/bin/bash

# 获取版本类型参数
VERSION_TYPE=${1:-patch}

echo "🚀 开始发布流程..."

# 更新版本
npm version $VERSION_TYPE

# 获取新版本号
NEW_VERSION=$(node -pe "require('./package.json').version")
echo "📦 新版本: v$NEW_VERSION"

# 提交更改
git add .
git commit -m "chore: release v$NEW_VERSION"

# 推送到远程
git push origin main
git push origin v$NEW_VERSION

echo "✅ 发布流程完成！"
echo "🔗 查看发布状态: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
```

使用方法：
```bash
# 补丁版本
./scripts/release.sh patch

# 小版本
./scripts/release.sh minor

# 大版本
./scripts/release.sh major
```

## 🎉 完成！

现在你的 Tauri 应用已经配置好了 GitHub Releases 自动更新！

每次推送新标签时，GitHub Actions 会自动：
1. 构建多平台应用
2. 生成签名文件
3. 创建 GitHub Release
4. 上传所有安装包

用户在应用中就能够自动检查和安装更新了。🚀 