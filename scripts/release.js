#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    }).trim();
  } catch (error) {
    throw new Error(`命令执行失败: ${command}\n${error.message}`);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const versionType = args[0] || 'patch';
    
    if (!['patch', 'minor', 'major'].includes(versionType) && !versionType.match(/^\d+\.\d+\.\d+$/)) {
      log('❌ 无效的版本类型。请使用: patch, minor, major 或具体版本号 (如 1.2.3)', 'red');
      process.exit(1);
    }

    log('🚀 开始完整发布流程...', 'magenta');
    log(`📋 版本类型: ${versionType}`, 'blue');
    
    // 1. 检查 Git 状态
    log('\n📋 1. 检查 Git 状态...', 'cyan');
    try {
      const status = execCommand('git status --porcelain', { silent: true });
      const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD', { silent: true });
      
      if (status.trim()) {
        log('⚠️  检测到未提交的更改，将在发布时自动提交', 'yellow');
      }
      
      log(`📋 当前分支: ${currentBranch}`, 'blue');
    } catch (error) {
      log('❌ 无法检查 Git 状态', 'red');
      process.exit(1);
    }
    
    // 2. 更新版本号
    log('\n📋 2. 更新版本号...', 'cyan');
    const updateVersionCommand = versionType.match(/^\d+\.\d+\.\d+$/) 
      ? `node scripts/update-version.js ${versionType}`
      : `node scripts/update-version.js ${versionType}`;
    
    execCommand(updateVersionCommand);
    
    // 读取更新后的版本
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const newVersion = packageJson.version;
    
    log(`✅ 版本已更新为: ${newVersion}`, 'green');
    
    // 3. 运行构建验证
    log('\n📋 3. 构建验证...', 'cyan');
    const skipBuild = args.includes('--skip-build') || args.includes('-s');
    
    if (skipBuild) {
      log('⏭️  跳过构建验证', 'yellow');
    } else {
      log('🔨 开始构建应用...', 'blue');
      execCommand('npm run tauri:build');
      log('✅ 构建成功', 'green');
    }
    
    // 4. 创建和推送标签
    log('\n📋 4. 创建和推送标签...', 'cyan');
    execCommand('node scripts/create-tag.js --auto-commit');
    
    // 5. 显示发布总结
    log('\n🎉 发布完成！', 'green');
    log('═'.repeat(50), 'blue');
    log(`📦 版本: ${newVersion}`, 'blue');
    log(`🏷️  标签: v${newVersion}`, 'blue');
    log(`🌐 GitHub: https://github.com/bitbw/tauri-demo/releases/tag/v${newVersion}`, 'blue');
    log('═'.repeat(50), 'blue');
    
    log('\n📋 下一步建议：', 'cyan');
    log('1. 在 GitHub 上查看自动创建的 Release', 'blue');
    log('2. 编辑 Release 说明，添加更新日志', 'blue');
    log('3. 检查 GitHub Actions 是否自动构建并上传了应用包', 'blue');
    log('4. 测试自动更新功能', 'blue');
    
    if (!skipBuild) {
      log('\n📁 构建产物位置：', 'cyan');
      log('- Windows: src-tauri/target/release/bundle/msi/', 'blue');
      log('- Windows: src-tauri/target/release/bundle/nsis/', 'blue');
    }
    
  } catch (error) {
    log(`❌ 发布失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

main(); 