# Tauri 通信机制完整指南

## 📖 专业术语解释

### Tauri 架构中的角色

在 Tauri 应用中，有两个主要的执行环境：

1. **Core (核心层/后端)**
   - **中文术语**: 核心层、后端、Rust 层
   - **英文术语**: Core, Backend, Rust Side
   - **技术描述**: 基于 Rust 编写的应用核心，负责系统调用、文件操作、网络请求等
   - **运行环境**: 原生进程，直接与操作系统交互

2. **Frontend (前端层/Webview)**
   - **中文术语**: 前端层、Web 层、WebView
   - **英文术语**: Frontend, Webview, Web Layer
   - **技术描述**: 基于 Web 技术(HTML/CSS/JavaScript)构建的用户界面
   - **运行环境**: 嵌入式 Web 浏览器(WebView)

### 通信方式专业术语

| 术语 | 中文名称 | 英文名称 | 描述 |
|------|----------|----------|------|
| Command | 命令 | Command | 前端调用后端的函数 |
| Event | 事件 | Event | 后端向前端发送的消息 |
| Invoke | 调用 | Invoke | 前端执行后端命令的动作 |
| Emit | 发射 | Emit | 后端发送事件到前端 |
| Handler | 处理器 | Handler | 后端注册的命令处理函数 |
| Listener | 监听器 | Listener | 前端监听事件的函数 |

## 🔄 通信机制详解

### 1. 命令调用 (Command Invocation)

**方向**: Frontend → Core  
**用途**: 前端调用后端功能

#### 后端定义 (Rust)
```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// 注册命令
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

#### 前端调用 (JavaScript/TypeScript)
```typescript
import { invoke } from '@tauri-apps/api/core';

// 调用后端命令
const result = await invoke<string>('greet', { name: 'World' });
console.log(result); // "Hello, World!"
```

### 2. 事件通信 (Event Communication)

**方向**: Core → Frontend  
**用途**: 后端向前端发送实时消息

#### 后端发送事件 (Rust)
```rust
use tauri::{Emitter, Window};

#[tauri::command]
async fn start_task(window: Window) {
    // 发送事件到前端
    window.emit("task-progress", json!({
        "progress": 50,
        "message": "Processing..."
    })).unwrap();
}
```

#### 前端监听事件 (JavaScript/TypeScript)
```typescript
import { listen } from '@tauri-apps/api/event';

// 监听后端事件
const unlisten = await listen<{progress: number, message: string}>('task-progress', (event) => {
    console.log('Progress:', event.payload.progress);
    console.log('Message:', event.payload.message);
});

// 清理监听器
unlisten();
```

### 3. 异步操作 (Async Operations)

**特点**: 支持长时间运行的任务

#### 后端异步命令 (Rust)
```rust
#[tauri::command]
async fn long_running_task(duration: u64) -> Result<String, String> {
    tokio::time::sleep(Duration::from_secs(duration)).await;
    Ok("Task completed".to_string())
}
```

#### 前端异步调用 (JavaScript/TypeScript)
```typescript
// 异步调用，不阻塞UI
const result = await invoke<string>('long_running_task', { duration: 5 });
```

### 4. 错误处理 (Error Handling)

#### 后端错误处理 (Rust)
```rust
#[tauri::command]
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}
```

#### 前端错误处理 (JavaScript/TypeScript)
```typescript
try {
    const result = await invoke<number>('divide', { a: 10, b: 0 });
} catch (error) {
    console.error('Error:', error); // "Division by zero"
}
```

## 🏗️ 数据传输格式

### 1. 基本数据类型

| Rust 类型 | TypeScript 类型 | 示例 |
|-----------|-----------------|------|
| `String` | `string` | `"Hello"` |
| `i32`, `u32`, `f64` | `number` | `42`, `3.14` |
| `bool` | `boolean` | `true`, `false` |
| `Vec<T>` | `T[]` | `[1, 2, 3]` |
| `HashMap<K, V>` | `Record<K, V>` | `{"key": "value"}` |

### 2. 复杂数据结构

#### 后端结构体 (Rust)
```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    id: u32,
    name: String,
    email: String,
    active: bool,
}

#[tauri::command]
fn process_user(user: User) -> User {
    // 处理用户数据
    user
}
```

#### 前端类型定义 (TypeScript)
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
}

const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    active: true
};

const result = await invoke<User>('process_user', { user });
```

## 🛠️ 实用模式

### 1. 统一响应格式

#### 后端响应结构 (Rust)
```rust
#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    message: String,
}

#[tauri::command]
fn get_user(id: u32) -> ApiResponse<User> {
    // 模拟数据获取
    if id == 1 {
        ApiResponse {
            success: true,
            data: Some(User { /* ... */ }),
            message: "User found".to_string(),
        }
    } else {
        ApiResponse {
            success: false,
            data: None,
            message: "User not found".to_string(),
        }
    }
}
```

#### 前端类型定义 (TypeScript)
```typescript
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
}

const response = await invoke<ApiResponse<User>>('get_user', { id: 1 });
if (response.success && response.data) {
    console.log('User:', response.data);
} else {
    console.error('Error:', response.message);
}
```

### 2. 进度监控模式

#### 后端实现 (Rust)
```rust
#[tauri::command]
async fn batch_process(window: Window, items: Vec<String>) -> Result<String, String> {
    let total = items.len();
    
    for (index, item) in items.iter().enumerate() {
        // 处理单个项目
        process_item(item);
        
        // 发送进度事件
        let progress = ((index + 1) as f64 / total as f64 * 100.0) as u32;
        window.emit("batch-progress", json!({
            "progress": progress,
            "current": index + 1,
            "total": total,
            "item": item
        })).unwrap();
        
        // 模拟处理时间
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    
    Ok("Batch processing completed".to_string())
}
```

#### 前端实现 (TypeScript)
```typescript
interface BatchProgress {
    progress: number;
    current: number;
    total: number;
    item: string;
}

const [progress, setProgress] = useState(0);
const [currentItem, setCurrentItem] = useState('');

useEffect(() => {
    const setupListener = async () => {
        const unlisten = await listen<BatchProgress>('batch-progress', (event) => {
            setProgress(event.payload.progress);
            setCurrentItem(event.payload.item);
        });
        
        return unlisten;
    };
    
    setupListener();
}, []);

const handleBatchProcess = async () => {
    const items = ['item1', 'item2', 'item3'];
    await invoke('batch_process', { items });
};
```

## 📝 最佳实践

### 1. 命令命名规范

- 使用 `snake_case` 命名 (Rust 惯例)
- 动词开头，描述性强
- 示例: `get_user`, `create_file`, `update_settings`

### 2. 错误处理

- 始终使用 `Result<T, E>` 类型
- 提供有意义的错误消息
- 前端统一错误处理机制

### 3. 类型安全

- 使用 TypeScript 接口定义
- 保持 Rust 和 TypeScript 类型同步
- 使用泛型提高代码复用性

### 4. 性能优化

- 避免频繁的小数据传输
- 使用批量操作处理大量数据
- 合理使用异步操作

## 🔧 调试技巧

### 1. 后端调试

```rust
#[tauri::command]
fn debug_command(data: String) -> String {
    println!("Received data: {}", data);  // 控制台输出
    eprintln!("Debug info: Processing {}", data);  // 错误输出
    data
}
```

### 2. 前端调试

```typescript
// 在浏览器开发者工具中查看
console.log('Invoking command with:', data);

try {
    const result = await invoke('debug_command', { data });
    console.log('Result:', result);
} catch (error) {
    console.error('Command failed:', error);
}
```

## 📋 示例项目结构

```
tauri-project/
├── src/                          # 前端代码
│   ├── pages/
│   │   └── CommunicationDemo.tsx # 通信演示页面
│   └── types/
│       └── tauri.ts              # 类型定义
├── src-tauri/                    # 后端代码
│   ├── src/
│   │   ├── lib.rs               # 命令定义
│   │   ├── types.rs             # 类型定义
│   │   └── handlers/            # 命令处理器
│   └── Cargo.toml               # 依赖配置
└── TAURI_COMMUNICATION_GUIDE.md # 本文档
```

## 🎯 总结

Tauri 的通信机制基于以下核心概念：

1. **命令 (Commands)**: 前端调用后端功能的主要方式
2. **事件 (Events)**: 后端向前端发送消息的机制
3. **类型安全**: 通过 Rust 和 TypeScript 的类型系统确保数据传输的安全性
4. **异步支持**: 支持长时间运行的任务，不阻塞用户界面

通过合理使用这些机制，可以构建高性能、类型安全的桌面应用程序。

---

*这个文档涵盖了 Tauri 通信的核心概念和实际应用，为开发者提供了完整的参考指南。* 