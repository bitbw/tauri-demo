# Rust 语法指南 - 给 JS/TS 开发者

## 1. 基本语法对比

### 变量声明
```rust
// JavaScript/TypeScript
let name = "Alice";
const age = 25;
var score = 100;

// Rust
let name = "Alice";        // 不可变变量（类似 const）
let mut age = 25;          // 可变变量（类似 let）
const SCORE: i32 = 100;    // 编译时常量
```

### 数据类型
```rust
// JavaScript/TypeScript
let num: number = 42;
let text: string = "hello";
let flag: boolean = true;
let arr: number[] = [1, 2, 3];

// Rust
let num: i32 = 42;           // 32位整数
let text: &str = "hello";    // 字符串切片
let flag: bool = true;       // 布尔值
let arr: [i32; 3] = [1, 2, 3]; // 固定大小数组
let vec: Vec<i32> = vec![1, 2, 3]; // 动态数组
```

## 2. 结构体 (Struct) - 类似 JS 对象/TS 接口

```rust
// TypeScript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Rust
#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    id: u32,
    name: String,
    email: String,
    age: u32,
}

// 创建实例
let user = User {
    id: 1,
    name: "Alice".to_string(),
    email: "alice@example.com".to_string(),
    age: 25,
};
```

## 3. 函数定义

```rust
// JavaScript/TypeScript
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Rust
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// Tauri 命令函数
#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

## 4. 错误处理

```rust
// JavaScript/TypeScript
function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

// Rust - 使用 Result 类型
fn divide_numbers(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero is not allowed".to_string())
    } else {
        Ok(a / b)
    }
}

// 使用时
match divide_numbers(10.0, 2.0) {
    Ok(result) => println!("Result: {}", result),
    Err(error) => println!("Error: {}", error),
}
```

## 5. 异步编程

```rust
// JavaScript/TypeScript
async function fetchData(duration: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    return `Data fetched after ${duration} seconds`;
}

// Rust
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
```

## 6. 所有权系统 (Ownership) - Rust 独有

```rust
// 这是 Rust 最重要的概念，JS/TS 没有对应概念

// 移动所有权
let s1 = String::from("hello");
let s2 = s1;  // s1 的所有权转移到 s2，s1 不再有效

// 借用 (Borrowing)
let s = String::from("hello");
let len = calculate_length(&s);  // &s 表示借用，不转移所有权

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 在这里超出作用域，但因为是借用，不会释放内存

// 可变借用
let mut s = String::from("hello");
change(&mut s);

fn change(s: &mut String) {
    s.push_str(", world");
}
```

## 7. 模式匹配

```rust
// JavaScript/TypeScript
function handleResponse(response: any) {
    switch (response.status) {
        case 200:
            return response.data;
        case 404:
            return "Not found";
        default:
            return "Unknown error";
    }
}

// Rust - match 表达式
fn handle_response(status: u16) -> String {
    match status {
        200 => "Success".to_string(),
        404 => "Not found".to_string(),
        500..=599 => "Server error".to_string(),  // 范围匹配
        _ => "Unknown error".to_string(),          // 默认情况
    }
}

// 匹配 Option 和 Result
match some_option {
    Some(value) => println!("Got value: {}", value),
    None => println!("No value"),
}
```

## 8. 枚举 (Enum) - 比 TS 更强大

```rust
// TypeScript
enum Status {
    Loading,
    Success,
    Error
}

// Rust - 可以携带数据
#[derive(Debug)]
enum ApiResult<T> {
    Loading,
    Success(T),
    Error(String),
}

// 使用
let result = ApiResult::Success(user);
match result {
    ApiResult::Loading => println!("Loading..."),
    ApiResult::Success(data) => println!("Success: {:?}", data),
    ApiResult::Error(msg) => println!("Error: {}", msg),
}
```

## 9. 特征 (Traits) - 类似 TS 接口

```rust
// TypeScript
interface Drawable {
    draw(): void;
}

// Rust
trait Drawable {
    fn draw(&self);
}

// 实现特征
impl Drawable for User {
    fn draw(&self) {
        println!("Drawing user: {}", self.name);
    }
}
```

## 10. 常用宏

```rust
// 打印宏
println!("Hello, world!");
println!("User: {:?}", user);  // Debug 格式
println!("User: {:#?}", user); // 美化 Debug 格式

// 向量宏
let numbers = vec![1, 2, 3, 4, 5];

// 格式化宏
let greeting = format!("Hello, {}!", name);

// JSON 宏 (需要 serde_json)
let json = serde_json::json!({
    "name": "Alice",
    "age": 25
});
```

## 11. 导入和使用

```rust
// 导入
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use tauri::{command, Window, Emitter};

// 重命名导入
use std::io::Result as IoResult;

// 导入所有
use std::prelude::*;
```

## 12. 在 Tauri 中的具体应用

### 定义命令
```rust
// 1. 简单命令
#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// 2. 处理复杂数据
#[command]
fn process_user(user: User) -> ApiResponse<User> {
    // 处理逻辑
    ApiResponse {
        success: true,
        data: Some(user),
        message: "Success".to_string(),
    }
}

// 3. 异步命令
#[command]
async fn async_operation() -> Result<String, String> {
    // 异步操作
    Ok("Done".to_string())
}

// 4. 窗口操作
#[command]
async fn manage_window(window: Window, action: String) -> String {
    match action.as_str() {
        "minimize" => window.minimize().unwrap(),
        "maximize" => window.maximize().unwrap(),
        _ => {}
    }
    "Window action executed".to_string()
}
```

### 注册命令
```rust
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            process_user,
            async_operation,
            manage_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 13. 常见类型转换

```rust
// String 和 &str 之间转换
let s: String = "hello".to_string();
let s_ref: &str = &s;

// 数字转换
let num: i32 = 42;
let num_f64: f64 = num as f64;

// 字符串转数字
let num_str = "42";
let num: i32 = num_str.parse().unwrap();
```

## 14. 内存管理提示

```rust
// 在 Rust 中，内存管理是自动的
// 变量在超出作用域时自动释放
{
    let s = String::from("hello");
    // s 在这里有效
} // s 在这里超出作用域，内存自动释放

// 使用 Rc 和 Arc 进行引用计数
use std::rc::Rc;
use std::sync::Arc;

let shared_data = Rc::new(data);        // 单线程引用计数
let thread_safe_data = Arc::new(data);  // 多线程引用计数
```

## 关键差异总结

1. **所有权系统**: Rust 有独特的所有权系统，需要理解借用和生命周期
2. **静态类型**: 比 TS 更严格的类型系统
3. **错误处理**: 使用 `Result<T, E>` 和 `Option<T>` 而不是异常
4. **不可变性**: 默认不可变，需要显式声明 `mut`
5. **模式匹配**: 比 JS/TS 的 switch 更强大
6. **宏系统**: 代码生成，类似模板但更强大

这个指南应该能帮助你理解 Rust 的基本语法。建议从你的 `lib.rs` 文件开始，逐步理解每个函数的语法结构！ 