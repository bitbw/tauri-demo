# Tauri 应用开发指南

## 项目简介
这是一个使用 Tauri + React + TypeScript 构建的跨平台桌面应用。

## 技术栈
- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust + Tauri
- **包管理器**: pnpm
- **构建工具**: Vite

## 开发环境要求
- Node.js 18+
- Rust (通过 rustup 安装)
- pnpm

## 项目结构
```
tauri-test1/
├── src/                    # React 前端代码
├── src-tauri/              # Rust 后端代码
│   ├── src/
│   │   └── main.rs        # Rust 主文件
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 配置
├── public/                 # 静态资源
├── package.json           # Node.js 依赖配置
└── vite.config.ts         # Vite 构建配置
```

## 开发命令

### 启动开发服务器
```bash
# 确保 Rust 在 PATH 中
export PATH="$PATH:$HOME/.cargo/bin"

# 启动开发服务器（同时启动前端和后端）
pnpm tauri dev
```

### 构建应用
```bash
# 构建生产版本
pnpm tauri build
```

### 其他有用命令
```bash
# 仅启动前端开发服务器
pnpm dev

# 构建前端
pnpm build

# 预览构建结果
pnpm preview

# 添加 Tauri 插件
pnpm tauri add [plugin-name]
```

## 开发流程

1. **前端开发**: 在 `src/` 目录下编写 React 组件
2. **后端开发**: 在 `src-tauri/src/` 目录下编写 Rust 代码
3. **API 调用**: 使用 `@tauri-apps/api` 在前端调用后端功能
4. **配置修改**: 在 `tauri.conf.json` 中修改应用配置

## 常用 Tauri API 示例

### 调用后端命令
```typescript
import { invoke } from '@tauri-apps/api/core';

// 调用 Rust 后端定义的命令
const result = await invoke('my_command', { arg: 'value' });
```

### 文件系统操作
```typescript
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// 读取文件
const content = await readTextFile('path/to/file.txt');

// 写入文件
await writeTextFile('path/to/file.txt', 'Hello World!');
```

### 系统通知
```typescript
import { sendNotification } from '@tauri-apps/plugin-notification';

await sendNotification('Hello from Tauri!');
```

## 打包发布

### Windows
```bash
pnpm tauri build
```
生成的文件位于 `src-tauri/target/release/bundle/`

### 其他平台
Tauri 支持跨平台编译，但需要相应的编译环境。

## 调试技巧

1. **前端调试**: 在浏览器开发者工具中调试
2. **后端调试**: 使用 `println!` 或日志库输出到控制台
3. **构建问题**: 检查 Rust 编译错误信息

## 有用的资源

- [Tauri 官方文档](https://tauri.app/)
- [Tauri API 参考](https://tauri.app/api/js/)
- [Rust 学习资源](https://www.rust-lang.org/learn)
- [React 官方文档](https://react.dev/)

## 常见问题

**Q: 第一次运行 `pnpm tauri dev` 很慢？**
A: 这是正常的，Rust 需要编译所有依赖。后续运行会快很多。

**Q: 如何添加新的 Rust 依赖？**
A: 在 `src-tauri/Cargo.toml` 中添加依赖，然后重新运行 `pnpm tauri dev`。

**Q: 如何修改应用图标？**
A: 替换 `src-tauri/icons/` 目录下的图标文件。 