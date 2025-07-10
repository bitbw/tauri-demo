// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{command, Window, Emitter, Manager};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;

// 数据结构定义
#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    id: u32,
    name: String,
    email: String,
    age: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    message: String,
}

// 1. 基本命令 - 简单的字符串处理 (添加调试输出)
#[command]
fn greet(name: &str) -> String {
    // 🐛 调试输出 - 使用 println!
    println!("🐛 [DEBUG] greet 函数被调用");
    println!("🐛 [DEBUG] 接收到的参数: name = '{}'", name);
    println!("🐛 [DEBUG] 参数长度: {}", name.len());
    
    // 🐛 调试输出 - 使用 dbg! 宏
    dbg!(name);
    
    // 检查输入
    if name.is_empty() {
        println!("🐛 [WARNING] 收到空的 name 参数");
    }
    
    if name.len() > 50 {
        println!("🐛 [WARNING] name 参数过长: {} 字符", name.len());
    }
    
    let result = format!("Hello, {}! You've been greeted from Rust!", name);
    
    // 🐛 调试输出 - 显示返回值
    println!("🐛 [DEBUG] 生成的返回值: '{}'", result);
    println!("🐛 [DEBUG] greet 函数执行完成");
    
    result
}

// 2. 数据处理命令 - 处理复杂数据结构 (添加调试输出)
#[command]
fn process_user(user: User) -> ApiResponse<User> {
    println!("🐛 [DEBUG] process_user 函数被调用");
    println!("🐛 [DEBUG] 接收到的用户数据:");
    println!("🐛   - ID: {}", user.id);
    println!("🐛   - Name: '{}'", user.name);
    println!("🐛   - Email: '{}'", user.email);
    println!("🐛   - Age: {}", user.age);
    
    // 使用 {:#?} 进行美化输出
    println!("🐛 [DEBUG] 用户对象详情: {:#?}", user);
    
    // 模拟数据处理
    println!("🐛 [DEBUG] 开始处理用户数据...");
    
    let processed_user = User {
        id: user.id,
        name: user.name.to_uppercase(),
        email: user.email.to_lowercase(),
        age: user.age,
    };
    
    println!("🐛 [DEBUG] 处理后的用户数据:");
    println!("🐛   - Name (大写): '{}'", processed_user.name);
    println!("🐛   - Email (小写): '{}'", processed_user.email);
    println!("🐛 [DEBUG] 数据处理完成");
    
    ApiResponse {
        success: true,
        data: Some(processed_user),
        message: "User processed successfully".to_string(),
    }
}

// 3. 异步命令 - 模拟长时间运行的任务
#[command]
async fn async_task(duration: u64) -> ApiResponse<String> {
    println!("🐛 [DEBUG] async_task 开始执行，持续时间: {} 秒", duration);
    
    let start = std::time::Instant::now();
    
    sleep(Duration::from_secs(duration)).await;
    
    let elapsed = start.elapsed();
    println!("🐛 [DEBUG] async_task 实际耗时: {:?}", elapsed);
    
    ApiResponse {
        success: true,
        data: Some(format!("Task completed after {} seconds", duration)),
        message: "Async task finished".to_string(),
    }
}

// 4. 文件系统操作命令
#[command]
fn get_system_info() -> ApiResponse<serde_json::Value> {
    println!("🐛 [DEBUG] get_system_info 函数被调用");
    
    let info = serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "family": std::env::consts::FAMILY,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });
    
    println!("🐛 [DEBUG] 系统信息: {:#?}", info);
    
    ApiResponse {
        success: true,
        data: Some(info),
        message: "System info retrieved".to_string(),
    }
}

// 5. 错误处理命令 (添加调试输出)
#[command]
fn divide_numbers(a: f64, b: f64) -> Result<f64, String> {
    println!("🐛 [DEBUG] divide_numbers 函数被调用");
    println!("🐛 [DEBUG] 参数: a = {}, b = {}", a, b);
    
    // 使用 dbg! 宏
    dbg!(a, b);
    
    if b == 0.0 {
        let error_msg = "Division by zero is not allowed";
        println!("🐛 [ERROR] 除数为零: {}", error_msg);
        return Err(error_msg.to_string());
    }
    
    let result = a / b;
    println!("🐛 [DEBUG] 计算结果: {}", result);
    
    Ok(result)
}

// 6. 事件发送命令 - 从后端向前端发送事件
#[command]
async fn start_progress_task(window: Window) -> ApiResponse<String> {
    let window_clone = window.clone();
    
    // 在后台线程中发送进度事件
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
        
        // 任务完成事件
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

// 7. 数据库模拟操作
#[command]
fn get_users() -> ApiResponse<Vec<User>> {
    let users = vec![
        User { id: 1, name: "Alice".to_string(), email: "alice@example.com".to_string(), age: 25 },
        User { id: 2, name: "Bob".to_string(), email: "bob@example.com".to_string(), age: 30 },
        User { id: 3, name: "Charlie".to_string(), email: "charlie@example.com".to_string(), age: 35 },
    ];
    
    ApiResponse {
        success: true,
        data: Some(users),
        message: "Users retrieved successfully".to_string(),
    }
}

// 8. 窗口操作命令
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

// 9. GitHub Releases 自动更新命令

// 真实的检查更新函数 - 连接到 GitHub Releases
#[command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<String, String> {
    println!("🐛 [DEBUG] 开始检查 GitHub Releases 更新");
    
    // 使用 Tauri 内置的 updater
    match app.updater() {
        Some(updater) => {
            println!("🐛 [DEBUG] 更新器已初始化，开始检查更新...");
            
            match updater.check().await {
                Ok(update) => {
                    if update.is_update_available() {
                        let version = update.version();
                        let current_version = update.current_version();
                        println!("🐛 [DEBUG] 发现新版本: {} (当前版本: {})", version, current_version);
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
            println!("🐛 [ERROR] 更新器未初始化 - 可能未正确配置");
            Err("更新器未初始化，请检查配置".to_string())
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
                        println!("🐛 [DEBUG] 没有可用更新");
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
    let version = env!("CARGO_PKG_VERSION");
    println!("🐛 [DEBUG] 当前应用版本: {}", version);
    version.to_string()
}

// 获取更新信息
#[command]
async fn get_update_info(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    println!("🐛 [DEBUG] 获取详细更新信息");
    
    let current_version = env!("CARGO_PKG_VERSION");
    
    match app.updater() {
        Some(updater) => {
            match updater.check().await {
                Ok(update) => {
                    let update_info = serde_json::json!({
                        "current_version": current_version,
                        "latest_version": update.version(),
                        "has_update": update.is_update_available(),
                        "update_notes": "从 GitHub Releases 获取的最新版本",
                        "download_url": "GitHub Releases",
                        "release_date": chrono::Utc::now().format("%Y-%m-%d").to_string()
                    });
                    
                    println!("🐛 [DEBUG] 更新信息: {:#?}", update_info);
                    Ok(update_info)
                }
                Err(e) => {
                    println!("🐛 [ERROR] 获取更新信息失败: {}", e);
                    Err(format!("获取更新信息失败: {}", e))
                }
            }
        }
        None => Err("更新器未初始化".to_string())
    }
}

// 重启应用命令（模拟）
#[command]
async fn restart_app() -> Result<String, String> {
    println!("🐛 [DEBUG] restart_app 函数被调用");
    
    // 延迟重启，让前端有时间处理
    sleep(Duration::from_millis(1000)).await;
    
    // 在实际应用中，Tauri updater 会自动处理重启
    println!("🐛 [DEBUG] 应用重启中...");
    
    Ok("应用已重启".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            process_user,
            async_task,
            get_system_info,
            divide_numbers,
            start_progress_task,
            get_users,
            manage_window,
            // GitHub Releases 更新相关命令
            check_for_updates,
            download_and_install_update,
            get_app_version,
            get_update_info,
            restart_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
