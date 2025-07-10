# Rust + Tauri 实用示例

## 1. 基本数据传递

### 后端 Rust 代码
```rust
// src-tauri/src/lib.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    id: u32,
    name: String,
    email: String,
    age: u32,
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
fn process_user(user: User) -> ApiResponse<User> {
    println!("Processing user: {:?}", user);
    
    let processed_user = User {
        id: user.id,
        name: user.name.to_uppercase(),  // 转大写
        email: user.email.to_lowercase(), // 转小写
        age: user.age,
    };
    
    ApiResponse {
        success: true,
        data: Some(processed_user),
        message: "User processed successfully".to_string(),
    }
}
```

### 前端 TypeScript 代码
```typescript
// src/pages/UserManagement.tsx
import { invoke } from '@tauri-apps/api/tauri';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

// 调用简单命令
const handleGreet = async () => {
  const result = await invoke<string>('greet', { name: 'Alice' });
  console.log(result); // "Hello, Alice! You've been greeted from Rust!"
};

// 调用复杂数据处理命令
const handleProcessUser = async () => {
  const user: User = {
    id: 1,
    name: 'john doe',
    email: 'JOHN@EXAMPLE.COM',
    age: 25
  };
  
  const result = await invoke<ApiResponse<User>>('process_user', { user });
  console.log(result);
  // 返回: { success: true, data: { id: 1, name: "JOHN DOE", email: "john@example.com", age: 25 }, message: "..." }
};
```

## 2. 异步操作和进度追踪

### 后端 Rust 代码
```rust
use tokio::time::{sleep, Duration};
use tauri::{Window, Emitter};

#[command]
async fn async_task(duration: u64) -> ApiResponse<String> {
    println!("Starting async task for {} seconds", duration);
    sleep(Duration::from_secs(duration)).await;
    
    ApiResponse {
        success: true,
        data: Some(format!("Task completed after {} seconds", duration)),
        message: "Async task finished".to_string(),
    }
}

#[command]
async fn start_progress_task(window: Window) -> ApiResponse<String> {
    let window_clone = window.clone();
    
    tokio::spawn(async move {
        for i in 0..=100 {
            let progress = serde_json::json!({
                "progress": i,
                "message": format!("Processing step {}/100", i)
            });
            
            // 发送事件到前端
            window_clone.emit("progress-update", progress).ok();
            sleep(Duration::from_millis(50)).await;
        }
        
        window_clone.emit("task-completed", serde_json::json!({
            "message": "Task completed successfully!"
        })).ok();
    });
    
    ApiResponse {
        success: true,
        data: Some("Progress task started".to_string()),
        message: "Background task initiated".to_string(),
    }
}
```

### 前端 TypeScript 代码
```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

// 异步任务
const handleAsyncTask = async () => {
  try {
    const result = await invoke<ApiResponse<string>>('async_task', { duration: 3 });
    console.log(result.data); // "Task completed after 3 seconds"
  } catch (error) {
    console.error('Error:', error);
  }
};

// 监听进度事件
const handleProgressTask = async () => {
  // 监听进度更新
  const unlisten1 = await listen<{progress: number, message: string}>('progress-update', (event) => {
    console.log(`Progress: ${event.payload.progress}% - ${event.payload.message}`);
    // 更新 UI 进度条
  });
  
  // 监听任务完成
  const unlisten2 = await listen<{message: string}>('task-completed', (event) => {
    console.log(event.payload.message);
    // 清理监听器
    unlisten1();
    unlisten2();
  });
  
  // 启动任务
  await invoke('start_progress_task');
};
```

## 3. 错误处理

### 后端 Rust 代码
```rust
#[command]
fn divide_numbers(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero is not allowed".to_string())
    } else {
        Ok(a / b)
    }
}

// 更复杂的错误处理
#[derive(Debug, Serialize)]
struct CustomError {
    code: u32,
    message: String,
}

#[command]
fn validate_user(user: User) -> Result<User, CustomError> {
    if user.name.is_empty() {
        return Err(CustomError {
            code: 400,
            message: "Name cannot be empty".to_string(),
        });
    }
    
    if user.age < 18 {
        return Err(CustomError {
            code: 403,
            message: "User must be at least 18 years old".to_string(),
        });
    }
    
    Ok(user)
}
```

### 前端 TypeScript 代码
```typescript
// 简单错误处理
const handleDivision = async () => {
  try {
    const result = await invoke<number>('divide_numbers', { a: 10, b: 0 });
    console.log(result);
  } catch (error) {
    console.error('Division error:', error); // "Division by zero is not allowed"
  }
};

// 复杂错误处理
interface CustomError {
  code: number;
  message: string;
}

const handleValidation = async () => {
  try {
    const user = { id: 1, name: "", email: "test@example.com", age: 16 };
    const result = await invoke<User>('validate_user', { user });
    console.log('Valid user:', result);
  } catch (error) {
    const customError = error as CustomError;
    console.error(`Error ${customError.code}: ${customError.message}`);
    // 根据错误码做不同处理
    switch (customError.code) {
      case 400:
        // 处理输入错误
        break;
      case 403:
        // 处理权限错误
        break;
    }
  }
};
```

## 4. 窗口操作

### 后端 Rust 代码
```rust
#[command]
async fn manage_window(window: Window, action: String) -> ApiResponse<String> {
    let result = match action.as_str() {
        "minimize" => {
            window.minimize().unwrap();
            "Window minimized"
        },
        "maximize" => {
            window.maximize().unwrap();
            "Window maximized"
        },
        "close" => {
            window.close().unwrap();
            "Window closed"
        },
        _ => "Unknown action"
    };
    
    ApiResponse {
        success: true,
        data: Some(result.to_string()),
        message: "Window action executed".to_string(),
    }
}
```

### 前端 TypeScript 代码
```typescript
const handleWindowAction = async (action: 'minimize' | 'maximize' | 'close') => {
  try {
    const result = await invoke<ApiResponse<string>>('manage_window', { action });
    console.log(result.data);
  } catch (error) {
    console.error('Window action failed:', error);
  }
};

// 使用示例
<button onClick={() => handleWindowAction('minimize')}>最小化</button>
<button onClick={() => handleWindowAction('maximize')}>最大化</button>
<button onClick={() => handleWindowAction('close')}>关闭</button>
```

## 5. 系统信息获取

### 后端 Rust 代码
```rust
#[command]
fn get_system_info() -> ApiResponse<serde_json::Value> {
    let info = serde_json::json!({
        "platform": std::env::consts::OS,        // "windows", "macos", "linux"
        "arch": std::env::consts::ARCH,          // "x86_64", "aarch64"
        "family": std::env::consts::FAMILY,      // "windows", "unix"
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });
    
    ApiResponse {
        success: true,
        data: Some(info),
        message: "System info retrieved".to_string(),
    }
}
```

### 前端 TypeScript 代码
```typescript
interface SystemInfo {
  platform: string;
  arch: string;
  family: string;
  timestamp: string;
}

const getSystemInfo = async () => {
  try {
    const result = await invoke<ApiResponse<SystemInfo>>('get_system_info');
    if (result.success && result.data) {
      console.log('Platform:', result.data.platform);
      console.log('Architecture:', result.data.arch);
      console.log('Family:', result.data.family);
      console.log('Timestamp:', result.data.timestamp);
    }
  } catch (error) {
    console.error('Failed to get system info:', error);
  }
};
```

## 6. 常用 Rust 模式在 Tauri 中的应用

### Option 类型处理
```rust
#[command]
fn find_user(id: u32) -> ApiResponse<Option<User>> {
    let users = get_users_from_db(); // 假设从数据库获取
    
    let user = users.into_iter().find(|u| u.id == id);
    
    ApiResponse {
        success: true,
        data: Some(user), // user 可能是 Some(User) 或 None
        message: match user {
            Some(_) => "User found".to_string(),
            None => "User not found".to_string(),
        },
    }
}
```

### 集合操作
```rust
#[command]
fn filter_users(min_age: u32) -> ApiResponse<Vec<User>> {
    let users = get_users_from_db();
    
    let filtered_users: Vec<User> = users
        .into_iter()
        .filter(|user| user.age >= min_age)
        .collect();
    
    ApiResponse {
        success: true,
        data: Some(filtered_users),
        message: format!("Found {} users", filtered_users.len()),
    }
}
```

### 字符串处理
```rust
#[command]
fn format_name(first_name: &str, last_name: &str) -> String {
    format!("{} {}", 
        first_name.trim().to_uppercase(),
        last_name.trim().to_uppercase()
    )
}
```

## 7. 重要提示

### Rust 和 TypeScript 类型对应
```rust
// Rust          -> TypeScript
i32, u32         -> number
f64, f32         -> number
String, &str     -> string
bool             -> boolean
Vec<T>           -> T[]
Option<T>        -> T | null
Result<T, E>     -> T (成功) 或 throw E (失败)
```

### 常见错误和解决方案
```rust
// 错误: 所有权问题
let s = String::from("hello");
some_function(s);
println!("{}", s); // 错误: s 已被移动

// 解决: 使用引用
let s = String::from("hello");
some_function(&s);
println!("{}", s); // 正确

// 错误: 可变性问题
let x = 5;
x = 6; // 错误: x 不可变

// 解决: 声明为可变
let mut x = 5;
x = 6; // 正确
```

这些示例展示了如何在 Tauri 项目中使用 Rust 语法与前端进行交互。建议你先从简单的命令开始，逐步理解 Rust 的语法特性！ 