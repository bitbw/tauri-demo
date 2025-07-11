#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major, 或者具体版本号

// 读取当前版本
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`当前版本: ${currentVersion}`);

// 计算新版本
function getNewVersion(current, type) {
  // 如果是具体版本号，直接使用
  if (type.match(/^\d+\.\d+\.\d+$/)) {
    return type;
  }
  
  const [major, minor, patch] = current.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`未知的版本类型: ${type}`);
  }
}

const newVersion = getNewVersion(currentVersion, versionType);
console.log(`新版本: ${newVersion}`);

// 更新 package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ 已更新 package.json');

// 更新 src-tauri/Cargo.toml
const cargoTomlPath = path.join(__dirname, '../src-tauri/Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log('✅ 已更新 src-tauri/Cargo.toml');

// 更新 src-tauri/tauri.conf.json
const tauriConfPath = path.join(__dirname, '../src-tauri/tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✅ 已更新 src-tauri/tauri.conf.json');

console.log(`\n🎉 版本已成功更新为 ${newVersion}`);
console.log('\n下一步可以运行：');
console.log('- npm run tauri:build   # 构建应用');
console.log('- git add . && git commit -m "chore: bump version to ' + newVersion + '"  # 提交更改'); 