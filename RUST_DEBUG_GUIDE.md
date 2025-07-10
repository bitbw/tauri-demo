# Rust 调试指南 - VS Code 调试配置

## 🚀 快速开始

### 1. 安装必要的 VS Code 扩展

首先安装这些扩展：

```bash
# 必装扩展
- rust-analyzer (官方 Rust 语言服务器)
- CodeLLDB (LLDB 调试器)

# 可选扩展
- Error Lens (显示错误信息)
- Better TOML (Cargo.toml 语法高亮)
- Tauri (Tauri 项目支持)
```

### 2. 验证调试环境

打开终端，检查调试工具是否可用：

```bash
# 检查 Rust 工具链
rustc --version
cargo --version

# 检查调试符号是否启用
cargo build
```

## 🔧 调试方法

### 方法 1: 使用 println! 宏调试 (最简单)

```rust
#[command]
fn greet(name: &str) -> String {
    println!("🐛 调试信息: 收到参数 name = {}", name);
    
    let result = format!("Hello, {}! You've been greeted from Rust!", name);
    
    println!("🐛 调试信息: 返回结果 = {}", result);
    
    result
}

#[command]
fn process_user(user: User) -> ApiResponse<User> {
    println!("🐛 调试信息: 处理用户数据");
    println!("🐛 用户信息: {:#?}", user);  // 美化输出
    
    let processed_user = User {
        id: user.id,
        name: user.name.to_uppercase(),
        email: user.email.to_lowercase(),
        age: user.age,
    };
    
    println!("🐛 处理后的用户: {:#?}", processed_user);
    
    ApiResponse {
        success: true,
        data: Some(processed_user),
        message: "User processed successfully".to_string(),
    }
}
```

**查看输出：**
- 在 VS Code 终端中运行 `npm run tauri dev`
- 调试信息会显示在终端中
- 前端调用命令时，后端会输出调试信息

### 方法 2: 使用 dbg! 宏 (更方便)

```rust
#[command]
fn divide_numbers(a: f64, b: f64) -> Result<f64, String> {
    dbg!(a, b);  // 自动输出变量名和值
    
    if b == 0.0 {
        dbg!("除数为零错误");
        Err("Division by zero is not allowed".to_string())
    } else {
        let result = a / b;
        dbg!(result);  // 输出计算结果
        Ok(result)
    }
}
```

### 方法 3: VS Code 断点调试 (最强大)

#### 步骤 1: 设置断点
1. 在 VS Code 中打开 `src-tauri/src/lib.rs`
2. 点击行号左侧设置断点（红色圆点）
3. 在想要调试的函数中设置断点

#### 步骤 2: 启动调试
1. 按 `F5` 或点击 "Run and Debug"
2. 选择 "Debug Tauri App"
3. 等待编译完成

#### 步骤 3: 触发断点
- 从前端调用相应的 Tauri 命令
- 代码会在断点处暂停
- 可以查看变量值、调用堆栈等

### 方法 4: 日志调试 (推荐用于生产环境)

首先在 `Cargo.toml` 中添加日志依赖：

```toml
[dependencies]
log = "0.4"
env_logger = "0.10"
```

然后在代码中使用：

```rust
// 在 main.rs 或 lib.rs 开头初始化日志
fn main() {
    env_logger::init();
    tauri_test1_lib::run()
}

// 在函数中使用日志
use log::{debug, info, warn, error};

#[command]
fn greet(name: &str) -> String {
    info!("Greet 函数被调用，参数: {}", name);
    
    if name.is_empty() {
        warn!("收到空的 name 参数");
    }
    
    let result = format!("Hello, {}! You've been greeted from Rust!", name);
    
    debug!("生成的问候语: {}", result);
    
    result
}
```

设置日志级别：
```bash
# 在终端中设置环境变量
export RUST_LOG=debug

# 或者在 Windows 中
set RUST_LOG=debug

# 然后运行
npm run tauri dev
```

## 🎯 调试特定场景

### 调试异步函数

```rust
#[command]
async fn async_task(duration: u64) -> ApiResponse<String> {
    println!("🐛 异步任务开始，持续时间: {} 秒", duration);
    
    let start = std::time::Instant::now();
    
    tokio::time::sleep(Duration::from_secs(duration)).await;
    
    let elapsed = start.elapsed();
    println!("🐛 异步任务实际耗时: {:?}", elapsed);
    
    ApiResponse {
        success: true,
        data: Some(format!("Task completed after {} seconds", duration)),
        message: "Async task finished".to_string(),
    }
}
```

### 调试错误处理

```rust
#[command]
fn divide_numbers(a: f64, b: f64) -> Result<f64, String> {
    println!("🐛 开始除法运算: {} / {}", a, b);
    
    if b == 0.0 {
        let error_msg = "Division by zero is not allowed";
        println!("🐛 错误: {}", error_msg);
        return Err(error_msg.to_string());
    }
    
    let result = a / b;
    println!("🐛 计算结果: {}", result);
    
    Ok(result)
}
```

### 调试窗口操作

```rust
#[command]
async fn manage_window(window: Window, action: String) -> ApiResponse<String> {
    println!("🐛 窗口操作请求: {}", action);
    
    let result = match action.as_str() {
        "minimize" => {
            println!("🐛 执行最小化窗口");
            match window.minimize() {
                Ok(_) => {
                    println!("🐛 窗口最小化成功");
                    "Window minimized"
                }
                Err(e) => {
                    println!("🐛 窗口最小化失败: {:?}", e);
                    "Failed to minimize window"
                }
            }
        },
        "maximize" => {
            println!("🐛 执行最大化窗口");
            match window.maximize() {
                Ok(_) => {
                    println!("🐛 窗口最大化成功");
                    "Window maximized"
                }
                Err(e) => {
                    println!("🐛 窗口最大化失败: {:?}", e);
                    "Failed to maximize window"
                }
            }
        },
        _ => {
            println!("🐛 未知的窗口操作: {}", action);
            "Unknown action"
        }
    };
    
    ApiResponse {
        success: true,
        data: Some(result.to_string()),
        message: "Window action executed".to_string(),
    }
}
```

## 🔍 调试技巧

### 1. 条件断点
在 VS Code 中右键断点，选择 "Edit Breakpoint"，可以设置条件：
```rust
// 只在 age > 18 时触发断点
user.age > 18
```

### 2. 监视变量
在调试面板中添加监视表达式：
```rust
user.name.len()
result.is_ok()
```

### 3. 调试宏
创建自定义调试宏：
```rust
macro_rules! debug_print {
    ($($arg:tt)*) => {
        #[cfg(debug_assertions)]
        println!("[DEBUG] {}", format!($($arg)*));
    };
}

// 使用
debug_print!("用户 ID: {}, 名称: {}", user.id, user.name);
```

### 4. 性能调试
```rust
use std::time::Instant;

#[command]
fn performance_test() -> String {
    let start = Instant::now();
    
    // 你的代码...
    
    let duration = start.elapsed();
    println!("🐛 执行时间: {:?}", duration);
    
    "完成".to_string()
}
```

## 🚨 常见问题解决

### 问题 1: 调试器无法启动

**解决方案：**
1. 确保安装了 CodeLLDB 扩展
2. 检查 `launch.json` 中的路径是否正确
3. 先运行 `cargo build` 确保项目可以编译

### 问题 2: 断点不会触发

**解决方案：**
1. 确保在 Debug 模式下编译：`cargo build`
2. 检查断点是否设置在正确的位置
3. 确保代码路径会被执行

### 问题 3: 无法查看变量值

**解决方案：**
1. 确保变量在当前作用域内
2. 检查变量是否被优化掉了
3. 在 `Cargo.toml` 中添加调试信息：

```toml
[profile.dev]
debug = true
opt-level = 0
```

### 问题 4: Windows 调试问题

**解决方案：**
1. 确保安装了 Visual Studio Build Tools
2. 可能需要使用 MSVC 工具链：
```bash
rustup default stable-msvc
```

## 📝 实际调试示例

让我们调试一个实际的函数：

```rust
#[command]
fn calculate_fibonacci(n: u32) -> Result<u64, String> {
    println!("🐛 计算斐波那契数列第 {} 项", n);
    
    if n > 93 {
        let error = format!("输入值太大: {}, 最大支持 93", n);
        println!("🐛 错误: {}", error);
        return Err(error);
    }
    
    let mut a = 0u64;
    let mut b = 1u64;
    
    println!("🐛 初始值: a = {}, b = {}", a, b);
    
    for i in 0..n {
        let temp = a + b;
        a = b;
        b = temp;
        
        println!("🐛 第 {} 次迭代: a = {}, b = {}", i + 1, a, b);
    }
    
    println!("🐛 最终结果: {}", a);
    Ok(a)
}
```

**调试步骤：**
1. 在函数开头设置断点
2. 从前端调用 `invoke('calculate_fibonacci', { n: 10 })`
3. 逐步执行，观察变量变化
4. 查看循环中的值变化

## 📚 推荐的调试工作流

1. **开发阶段**：使用 `println!` 和 `dbg!` 快速调试
2. **复杂问题**：使用 VS Code 断点调试
3. **性能问题**：使用性能分析工具
4. **生产环境**：使用结构化日志

这样你就可以高效地调试 Rust 代码了！有什么具体的调试问题吗？ 