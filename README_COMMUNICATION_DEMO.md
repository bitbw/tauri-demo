# 🚀 Tauri 通信演示使用指南

## 概述

本项目演示了 Tauri 应用中 **Core（后端）** 和 **Frontend（前端）** 之间的完整通信机制。

## 🎯 专业术语说明

### Tauri 架构组件
- **Core (核心层)**: Rust 后端，负责系统调用和业务逻辑
- **Frontend (前端层)**: Web 界面，基于 React + TypeScript
- **WebView**: 嵌入式浏览器，运行前端代码
- **IPC (进程间通信)**: Core 和 Frontend 之间的数据传输

### 通信方式
- **Command (命令)**: 前端调用后端函数
- **Event (事件)**: 后端向前端发送消息
- **Invoke (调用)**: 执行 Command 的动作
- **Emit (发射)**: 发送 Event 的动作

## 🛠️ 使用方法

### 1. 启动应用
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 2. 访问通信演示
启动后，在应用左侧导航栏中点击 **"通信演示"**，或直接访问 `/communication` 路径。

### 3. 功能演示

#### 🔹 基本命令调用
- **功能**: 演示简单的字符串处理
- **操作**: 输入名字，点击"发送问候"
- **技术**: `invoke()` 调用 Rust 函数

#### 🔹 异步任务
- **功能**: 演示长时间运行的任务
- **操作**: 点击"启动3秒异步任务"
- **技术**: `async/await` 异步处理

#### 🔹 系统信息
- **功能**: 获取操作系统信息
- **操作**: 点击"获取系统信息"
- **技术**: Rust 系统调用

#### 🔹 进度任务（事件通信）
- **功能**: 演示后端向前端发送实时进度
- **操作**: 点击"启动进度任务"
- **技术**: `emit()` 发送事件，`listen()` 监听事件

#### 🔹 数字计算（错误处理）
- **功能**: 演示错误处理机制
- **操作**: 输入数字进行除法运算（试试除以0）
- **技术**: `Result<T, E>` 错误处理

#### 🔹 用户数据处理
- **功能**: 演示复杂数据结构传输
- **操作**: 填写用户信息，点击"处理用户数据"
- **技术**: 序列化/反序列化

#### 🔹 用户列表
- **功能**: 演示数组数据传输
- **操作**: 点击"获取用户列表"
- **技术**: 批量数据处理

#### 🔹 窗口操作
- **功能**: 演示窗口控制
- **操作**: 点击窗口操作按钮
- **技术**: 窗口 API 调用

## 📁 代码结构

```
src/
├── pages/
│   └── CommunicationDemo.tsx    # 前端演示页面
├── components/
│   └── Layout.tsx               # 布局组件
└── router/
    └── index.tsx                # 路由配置

src-tauri/
├── src/
│   ├── lib.rs                   # 后端命令定义
│   └── main.rs                  # 应用入口
└── Cargo.toml                   # Rust 依赖配置
```

## 🔍 技术要点

### 前端调用后端
```typescript
import { invoke } from '@tauri-apps/api/core';

// 调用后端命令
const result = await invoke<string>('greet', { name: 'World' });
```

### 后端处理命令
```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

### 事件通信
```typescript
// 前端监听事件
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('progress-update', (event) => {
    console.log('Progress:', event.payload);
});
```

```rust
// 后端发送事件
window.emit("progress-update", json!({
    "progress": 50,
    "message": "Processing..."
})).unwrap();
```

## 📚 学习资源

- [完整通信指南](./TAURI_COMMUNICATION_GUIDE.md)
- [Tauri 官方文档](https://tauri.app/develop/)
- [Tauri API 参考](https://tauri.app/develop/api/)

## 🎉 总结

通过这个演示，您可以了解到：

1. **8种不同的通信模式**
2. **完整的错误处理机制**
3. **类型安全的数据传输**
4. **异步操作的最佳实践**
5. **实时事件通信**

每个功能都有详细的代码注释和技术说明，帮助您快速理解 Tauri 的通信机制。

---

*启动应用后，通过实际操作来体验 Tauri 的强大通信能力！* 