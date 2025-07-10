# GitHub Releases 自动更新完整实现指南

## 🎯 概述

通过 GitHub Releases 实现 Tauri 应用自动更新是最简单且免费的方案：
- ✅ 完全免费
- ✅ 自动化构建和发布
- ✅ 内置签名验证
- ✅ 支持多平台
- ✅ 无需维护服务器

## 🚀 第一步：配置 GitHub Actions

### 1.1 创建 GitHub Actions 工作流

创建 `.github/workflows/release.yml` 文件：

```yaml
name: Release App

on:
  push:
    tags:
      - 'v*' # 触发条件：推送 v 开头的标签

jobs:
  create-release:
    permissions:
      contents: write
    runs-on: ubuntu-20.04
    outputs:
      release_id: ${{ steps.create-release.outputs.result }}

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Get version
        run: echo "PACKAGE_VERSION=$(node -pe "require('./package.json').version")" >> $GITHUB_ENV
      - name: Create release
        id: create-release
        uses: actions/github-script@v7
        with:
          script: |
            const { data } = await github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: `v${process.env.PACKAGE_VERSION}`,
              name: `v${process.env.PACKAGE_VERSION}`,
              body: 'Take a look at the assets to download and install this app.',
              draft: true,
              prerelease: false
            })
            return data.id

  build-tauri:
    needs: create-release
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'macos-latest' # for Arm based macs (M1 and above).
            args: '--target aarch64-apple-darwin'
          - platform: 'macos-latest' # for Intel based macs.
            args: '--target x86_64-apple-darwin'
          - platform: 'ubuntu-22.04' # for Tauri v1 you could also use ubuntu-20.04.
            args: ''
          - platform: 'windows-latest'
            args: ''

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable
        with:
          # Those targets are only used on macos runners so it's in an `if` to slightly speed up the linux/windows builds.
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - name: Install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-22.04' # This must match the platform value defined above.
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
        # webkitgtk 4.0 is for Tauri v1 - webkitgtk 4.1 is for Tauri v2.
        # You can remove the one that doesn't apply to your app to speed up the workflow a bit.

      - name: Install frontend dependencies
        run: npm install # change this to npm, pnpm, yarn or bun depending on which one you use.

      - name: Build the app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          releaseId: ${{ needs.create-release.outputs.release_id }}
          args: ${{ matrix.args }}

  publish-release:
    permissions:
      contents: write
    runs-on: ubuntu-20.04
    needs: [create-release, build-tauri]

    steps:
      - name: Publish release
        id: publish-release
        uses: actions/github-script@v7
        env:
          release_id: ${{ needs.create-release.outputs.release_id }}
        with:
          script: |
            github.rest.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: process.env.release_id,
              draft: false,
              prerelease: false
            })
```

### 1.2 简化版工作流（适合快速测试）

如果上面的配置太复杂，可以先使用简化版 `.github/workflows/simple-release.yml`：

```yaml
name: Simple Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest, macos-latest]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Setup Rust
      uses: dtolnay/rust-toolchain@stable

    - name: Install system dependencies (Ubuntu)
      if: matrix.os == 'ubuntu-latest'
      run: |
        sudo apt-get update
        sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

    - name: Install dependencies
      run: npm install

    - name: Build and release
      uses: tauri-apps/tauri-action@v0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
        TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
      with:
        tagName: ${{ github.ref_name }}
        releaseName: 'App v__VERSION__'
        releaseBody: 'See the assets to download this version and install.'
        releaseDraft: false
        prerelease: false
```

## 🔐 第二步：配置签名密钥

### 2.1 生成签名密钥

在本地运行以下命令：

```bash
# 生成密钥对
npx tauri signer generate -w ~/.tauri/tauri-test1.key

# 输入密码（记住这个密码）
```

### 2.2 获取私钥内容

```bash
# 查看私钥内容
cat ~/.tauri/tauri-test1.key

# 复制整个文件内容，包括 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY-----
```

### 2.3 配置 GitHub Secrets

在你的 GitHub 仓库中：

1. 进入 `Settings` > `Secrets and variables` > `Actions`
2. 添加以下 secrets：

| Name | Value |
|------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | 你的私钥内容（完整的 .key 文件内容） |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 你设置的密码 |

### 2.4 获取公钥

```bash
# 查看生成的公钥文件
cat ~/.tauri/tauri-test1.key.pub

# 输出类似：dW50cnVzdGVkIGNvbW1lbnQ6...
# 复制这个公钥字符串（整个内容）
```

## ⚙️ 第三步：配置 Tauri

### 3.1 安装 Updater 插件

```bash
# 添加 updater 插件
npm run tauri add updater
```

### 3.2 更新 Cargo.toml

确保 `src-tauri/Cargo.toml` 包含：

```toml
[dependencies]
tauri = { version = "2", features = ["updater"] }
tauri-plugin-updater = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### 3.3 配置 tauri.conf.json

更新 `src-tauri/tauri.conf.json`：

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "tauri-test1",
  "version": "0.1.0",
  "identifier": "com.tauri-test1.app",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "tauri-test1",
        "width": 800,
        "height": 600
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
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

**重要**：替换以下内容：
- `YOUR_USERNAME`: 你的 GitHub 用户名
- `YOUR_REPO`: 你的仓库名
- `YOUR_PUBLIC_KEY_HERE`: 第 2.4 步获取的公钥

## 💻 第四步：更新 Rust 代码

### 4.1 更新 lib.rs

替换 `src-tauri/src/lib.rs` 中的模拟更新函数：

```rust
use tauri::{command, Window, Emitter, Manager};
use tauri_plugin_updater::UpdaterExt;

// 真实的检查更新函数
#[command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<String, String> {
    println!("🐛 [DEBUG] 开始检查 GitHub Releases 更新");
    
    match app.updater() {
        Some(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if update.is_update_available() {
                        let version = update.version();
                        println!("🐛 [DEBUG] 发现新版本: {}", version);
                        Ok(format!("发现新版本: {}", version))
                    } else {
                        println!("🐛 [DEBUG] 当前已是最新版本");
                        Ok("当前已是最新版本".to_string())
                    }
                }
                Err(e) => {
                    println!("🐛 [ERROR] 检查更新失败: {}", e);
                    Err(format!("检查更新失败: {}", e))
                }
            }
        }
        None => {
            println!("🐛 [ERROR] 更新器未初始化");
            Err("更新器未初始化".to_string())
        }
    }
}

// 真实的下载和安装更新函数
#[command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<String, String> {
    println!("🐛 [DEBUG] 开始下载和安装更新");
    
    match app.updater() {
        Some(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if update.is_update_available() {
                        println!("🐛 [DEBUG] 开始下载更新包...");
                        
                        // 下载并安装更新
                        match update.download_and_install().await {
                            Ok(_) => {
                                println!("🐛 [DEBUG] 更新下载并安装成功");
                                Ok("更新已安装，应用将重启".to_string())
                            }
                            Err(e) => {
                                println!("🐛 [ERROR] 安装更新失败: {}", e);
                                Err(format!("安装更新失败: {}", e))
                            }
                        }
                    } else {
                        Ok("没有可用更新".to_string())
                    }
                }
                Err(e) => {
                    println!("🐛 [ERROR] 检查更新失败: {}", e);
                    Err(format!("检查更新失败: {}", e))
                }
            }
        }
        None => {
            println!("🐛 [ERROR] 更新器未初始化");
            Err("更新器未初始化".to_string())
        }
    }
}

// 获取当前版本信息
#[command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // ... 你的其他命令
            check_for_updates,
            download_and_install_update,
            get_app_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 4.2 更新 main.rs

确保 `src-tauri/src/main.rs` 中包含：

```rust
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri_test1_lib::run()
}
```

## 📦 第五步：发布流程

### 5.1 版本管理

在 `package.json` 和 `src-tauri/Cargo.toml` 中保持版本同步：

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

### 5.2 创建发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 提交更改
git add .
git commit -m "chore: bump version to v0.1.1"

# 3. 创建并推送标签
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

### 5.3 GitHub Actions 自动构建

推送标签后，GitHub Actions 会自动：
1. 构建多平台应用
2. 生成签名文件
3. 创建 GitHub Release
4. 上传安装包

## 🔍 第六步：验证和测试

### 6.1 检查 Release

在 GitHub 仓库的 `Releases` 页面确认：
- ✅ Release 已创建
- ✅ 包含所有平台的安装包
- ✅ 包含 `latest.json` 文件
- ✅ 包含 `.sig` 签名文件

### 6.2 测试更新

1. 安装当前版本的应用
2. 发布新版本
3. 在应用中点击"检查更新"
4. 验证更新流程

### 6.3 调试常见问题

**问题 1: 找不到更新**
```bash
# 检查端点 URL 是否正确
curl https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json
```

**问题 2: 签名验证失败**
```bash
# 检查公钥是否正确配置
# 重新生成密钥对
```

**问题 3: GitHub Actions 失败**
```bash
# 检查 secrets 是否正确设置
# 查看 Actions 日志排查问题
```

## 🎨 第七步：自定义配置

### 7.1 自定义更新对话框

```rust
// 禁用默认对话框，使用自定义 UI
"dialog": false
```

### 7.2 设置更新频率

```rust
// 设置检查更新间隔
#[command]
fn set_update_check_interval(hours: u64) -> Result<String, String> {
    // 实现自定义检查间隔逻辑
    Ok(format!("更新检查间隔设置为 {} 小时", hours))
}
```

### 7.3 版本策略

```json
// 只更新主要版本
"strategy": "major"

// 包含预发布版本
"prerelease": true
```

## 📋 完整检查清单

发布前确认：

- [ ] GitHub Actions 工作流已配置
- [ ] 签名密钥已设置在 GitHub Secrets
- [ ] `tauri.conf.json` 中的端点 URL 正确
- [ ] 公钥已配置在 `tauri.conf.json`
- [ ] 版本号在 `package.json` 和 `Cargo.toml` 中同步
- [ ] Updater 插件已安装和配置
- [ ] 更新相关的 Rust 命令已实现
- [ ] 前端 UpdateManager 组件已集成

## 🚀 开始发布

现在你可以开始使用 GitHub Releases 进行自动更新了！

```bash
# 创建第一个发布
npm version patch
git add .
git commit -m "feat: 添加自动更新功能"
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

几分钟后，GitHub Actions 会自动构建并发布你的应用！🎉 