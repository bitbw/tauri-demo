# Tauri 自动更新快速开始指南

## 🎯 立即测试更新功能

我已经为你的项目添加了完整的自动更新功能！现在就可以测试：

### 1. 启动应用
```bash
npm run tauri dev
```

### 2. 查看更新按钮
在应用的右上角，你会看到一个 "检查更新" 按钮。

### 3. 测试更新功能
点击 "检查更新" 按钮，系统会：
- 模拟检查更新（30% 概率会发现更新）
- 如果有更新，会弹出更新对话框
- 可以模拟下载和安装过程

### 4. 查看调试信息
在终端中，你会看到详细的调试输出：
```
🐛 [DEBUG] check_for_updates 函数被调用
🐛 [DEBUG] 当前版本: 0.1.0
🐛 [DEBUG] 发现新版本: 0.1.1
```

## 📋 已实现的功能

### ✅ 后端 Rust 功能
- `check_for_updates()` - 检查更新
- `download_and_install_update()` - 下载和安装更新
- `restart_app()` - 重启应用
- `get_update_info()` - 获取更新详情
- `get_update_settings()` - 获取更新设置
- `set_update_settings()` - 保存更新设置

### ✅ 前端 React 功能
- `UpdateManager` 组件 - 完整的更新管理器
- 自动检查更新（每 30 分钟）
- 手动检查更新按钮
- 美观的更新对话框
- 下载进度显示
- 通知提醒

## 🔧 配置选项

### UpdateManager 组件配置
```tsx
<UpdateManager 
  autoCheck={true}        // 是否自动检查更新
  checkInterval={30}      // 检查间隔（分钟）
  showButton={true}       // 是否显示按钮
/>
```

### 当前配置位置
在 `src/components/Layout.tsx` 文件中：
```tsx
<UpdateManager autoCheck={true} checkInterval={30} />
```

## 🚀 从模拟到实际部署

### 第一步：准备服务器
选择以下任一方案：

#### 方案 A：使用 GitHub Releases（推荐新手）
1. 创建 GitHub 仓库
2. 配置 GitHub Actions 自动构建
3. 发布 Release 时自动更新

#### 方案 B：自建简单服务器
1. 搭建 HTTP 服务器
2. 提供更新检查接口
3. 存储应用安装包

### 第二步：添加 Tauri Updater 插件
```bash
# 安装 updater 插件
pnpm tauri add updater
```

### 第三步：修改 tauri.conf.json
```json
{
  "bundle": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-server.com/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 第四步：替换模拟代码
将 `src-tauri/src/lib.rs` 中的模拟函数替换为实际的更新检查逻辑。

## 🔍 调试技巧

### 查看更新日志
所有更新操作都会在终端输出详细日志：
```
🐛 [DEBUG] check_for_updates 函数被调用
🐛 [DEBUG] 当前版本: 0.1.0
🐛 [DEBUG] 开始下载更新包...
🐛 [DEBUG] 下载进度: 50%
🐛 [DEBUG] 更新安装完成
```

### 修改更新概率
在 `src-tauri/src/lib.rs` 中找到 `simulate_update_check()` 函数：
```rust
// 当前是 30% 概率，可以修改为 100% 用于测试
hash % 10 < 10  // 改为 100% 概率有更新
```

### 测试不同场景
1. **有更新**：修改概率为 100%
2. **无更新**：修改概率为 0%
3. **更新失败**：在下载函数中添加错误返回

## 📱 实际应用示例

### 企业内网部署
```rust
// 修改更新检查端点
let update_url = "http://internal-server.company.com/updates/check";
```

### 定制更新策略
```rust
// 只在工作时间检查更新
let now = chrono::Local::now();
let is_work_hours = now.hour() >= 9 && now.hour() <= 17;
if !is_work_hours {
    return Ok("非工作时间，跳过更新检查".to_string());
}
```

### 增量更新
```rust
// 检查是否需要增量更新
let current_size = get_app_size();
let update_size = get_update_size();
let use_incremental = update_size < current_size * 0.3;
```

## 🛠️ 常见问题解决

### Q: 更新按钮没有显示？
A: 检查 `Layout.tsx` 中是否正确导入了 `UpdateManager`

### Q: 点击更新按钮没有反应？
A: 查看浏览器控制台和终端输出，确认 Rust 命令是否正确注册

### Q: 如何修改更新检查间隔？
A: 在 `Layout.tsx` 中修改 `checkInterval` 参数

### Q: 如何禁用自动检查？
A: 设置 `autoCheck={false}`

### Q: 如何自定义更新对话框？
A: 修改 `UpdateManager.tsx` 中的 Modal 组件

## 🎨 界面定制

### 修改更新按钮样式
```tsx
<Button
  type="primary"      // 改为 primary 类型
  size="large"        // 改为大尺寸
  ghost={false}       // 取消幽灵效果
>
  检查更新
</Button>
```

### 修改通知位置
```tsx
notification.info({
  placement: 'topRight',  // 改为右上角
  duration: 10,           // 延长显示时间
});
```

### 添加更新图标
```tsx
<RocketOutlined style={{ color: '#1890ff' }} />
```

## 🔄 下一步计划

1. **配置实际的更新服务器**
2. **生成和配置签名密钥**
3. **设置 CI/CD 自动构建**
4. **测试完整更新流程**
5. **部署到生产环境**

现在就开始测试你的自动更新功能吧！🚀 