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
    log('🚀 开始创建和推送 Git Tag...', 'blue');
    
    // 1. 读取当前版本
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    const tagName = `v${currentVersion}`;
    
    log(`📋 当前版本: ${currentVersion}`, 'blue');
    log(`🏷️  标签名称: ${tagName}`, 'blue');
    
    // 2. 检查是否有未提交的更改
    try {
      const status = execCommand('git status --porcelain', { silent: true });
      if (status.trim()) {
        log('⚠️  检测到未提交的更改:', 'yellow');
        log(status, 'yellow');
        
        // 询问是否自动提交
        const args = process.argv.slice(2);
        const autoCommit = args.includes('--auto-commit') || args.includes('-a');
        
        if (autoCommit) {
          log('🔄 自动提交更改...', 'green');
          execCommand('git add .');
          execCommand(`git commit -m "chore: bump version to ${currentVersion}"`);
          log('✅ 更改已提交', 'green');
        } else {
          log('❌ 请先提交所有更改，或使用 --auto-commit 参数自动提交', 'red');
          process.exit(1);
        }
      }
    } catch (error) {
      log('❌ 无法检查 Git 状态，请确保在 Git 仓库中运行此脚本', 'red');
      process.exit(1);
    }
    
    // 3. 检查标签是否已存在
    try {
      const existingTags = execCommand('git tag -l', { silent: true });
      if (existingTags.split('\n').includes(tagName)) {
        log(`⚠️  标签 ${tagName} 已存在`, 'yellow');
        
        const args = process.argv.slice(2);
        const force = args.includes('--force') || args.includes('-f');
        
        if (force) {
          log('🔄 强制删除已存在的标签...', 'yellow');
          execCommand(`git tag -d ${tagName}`);
          try {
            execCommand(`git push origin --delete ${tagName}`);
          } catch (error) {
            log('⚠️  远程标签删除失败，可能标签不存在于远程仓库', 'yellow');
          }
        } else {
          log('❌ 标签已存在，使用 --force 参数强制覆盖', 'red');
          process.exit(1);
        }
      }
    } catch (error) {
      log('❌ 无法检查现有标签', 'red');
      process.exit(1);
    }
    
    // 4. 创建标签
    log(`🏷️  创建标签 ${tagName}...`, 'green');
    execCommand(`git tag -a ${tagName} -m "Release version ${currentVersion}"`);
    log('✅ 标签创建成功', 'green');
    
    // 5. 推送当前分支
    log('📤 推送当前分支...', 'green');
    const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD', { silent: true });
    execCommand(`git push origin ${currentBranch}`);
    log('✅ 分支推送成功', 'green');
    
    // 6. 推送标签
    log('📤 推送标签...', 'green');
    execCommand(`git push origin ${tagName}`);
    log('✅ 标签推送成功', 'green');
    
    // 7. 显示完成信息
    log('\n🎉 版本发布完成！', 'green');
    log(`📋 版本: ${currentVersion}`, 'blue');
    log(`🏷️  标签: ${tagName}`, 'blue');
    log(`🌐 GitHub Release: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\\([^/]*\\)\\/\\([^.]*\\).*/\\1\\/\\2/')/releases/tag/${tagName}`, 'blue');
    
    log('\n下一步可以：', 'blue');
    log('- 在 GitHub 上创建正式的 Release', 'blue');
    log('- 构建并发布应用包', 'blue');
    
  } catch (error) {
    log(`❌ 错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

main(); 