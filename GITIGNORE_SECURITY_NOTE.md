# .gitignore 安全更新说明

## 🔒 重要的安全更新

我已经更新了 `.gitignore` 文件，添加了与 GitHub Releases 自动更新相关的重要忽略规则。

### 🚨 关键安全规则

#### 1. 签名密钥文件（绝对不能提交！）
```gitignore
# Auto-update and signing keys - CRITICAL: Never commit these!
*.key
*.key.pub
.tauri/
~/.tauri/
**/*.key
**/*.key.pub
```

**为什么重要：**
- 私钥 (`.key`) 泄露会让攻击者能够签名恶意更新包
- 即使是公钥也不应该在多个地方存储
- 签名密钥应该只存在于本地和 GitHub Secrets 中

#### 2. 环境变量和配置文件
```gitignore
# Environment variables and secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env
```

**为什么重要：**
- 可能包含 API 密钥、数据库连接信息等敏感数据
- 本地开发配置不应该影响其他开发者

#### 3. 构建产物和安装包
```gitignore
# Release and build artifacts
*.dmg
*.app
*.msi
*.exe
*.deb
*.rpm
*.appimage
*.AppImage
```

**为什么重要：**
- 这些文件通常很大，不适合存储在 Git 中
- 应该通过 GitHub Releases 分发，而不是代码库
- 避免仓库体积过大

#### 4. Tauri 构建目录
```gitignore
# Tauri related
src-tauri/target
src-tauri/gen
```

**为什么重要：**
- `target` 目录包含 Rust 编译缓存，可能非常大
- `gen` 目录包含生成的代码，会自动重新生成

### ✅ 验证安全性

检查你的项目是否安全：

```bash
# 检查是否意外提交了敏感文件
git log --all --full-history -- "*.key"
git log --all --full-history -- "*.env"

# 检查当前状态
git status --ignored
```

### 🔧 如果已经意外提交了敏感文件

如果你之前意外提交了签名密钥或其他敏感文件：

```bash
# 从历史记录中完全删除文件（危险操作！）
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch *.key' --prune-empty --tag-name-filter cat -- --all

# 或者使用 BFG Repo-Cleaner（推荐）
# 安装：https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files *.key
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

**重要提醒：** 如果密钥已经被提交到公共仓库，你应该：
1. 立即重新生成新的密钥对
2. 更新 GitHub Secrets
3. 更新 `tauri.conf.json` 中的公钥
4. 考虑将仓库设为私有，直到清理完成

### 🎯 最佳实践

1. **永远不要提交密钥文件**
2. **使用环境变量存储敏感信息**
3. **定期检查 `.gitignore` 是否工作正常**
4. **在设置 CI/CD 时使用 GitHub Secrets**
5. **保持构建产物在 .gitignore 中**

### 📋 检查清单

- [ ] 密钥文件已添加到 `.gitignore`
- [ ] 环境变量文件已忽略
- [ ] 构建产物已忽略
- [ ] 没有敏感文件在 Git 历史中
- [ ] GitHub Secrets 已正确设置
- [ ] 公钥已更新到 `tauri.conf.json`

遵循这些规则可以确保你的自动更新系统既安全又可靠！🛡️ 