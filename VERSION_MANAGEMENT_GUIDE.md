# 版本管理指南

## 🚀 自动化版本更新

现在您可以使用自动化脚本来同步更新所有文件的版本号，无需手动修改！

## 📋 使用方法

### 1. 基本版本更新

```bash
# 更新补丁版本 (0.0.1 -> 0.0.2)
npm run version:patch

# 更新次版本 (0.0.2 -> 0.1.0)
npm run version:minor

# 更新主版本 (0.1.0 -> 1.0.0)
npm run version:major

# 设置特定版本号
npm run version:set 2.1.3
```

### 2. Git 标签管理

```bash
# 为当前版本创建 Git 标签
npm run tag:create

# 创建标签并自动提交未提交的更改
npm run tag:push

# 强制覆盖已存在的标签
npm run tag:create --force
```

### 3. 完整发布流程 🚀

```bash
# 完整发布流程：更新版本 → 构建验证 → 创建标签 → 推送
npm run release:patch   # 补丁版本发布
npm run release:minor   # 次版本发布 
npm run release:major   # 主版本发布

# 快速发布（跳过构建验证）
npm run release:quick
```

### 4. 自动更新的文件

脚本会自动同步更新以下文件：
- ✅ `package.json`
- ✅ `src-tauri/Cargo.toml`
- ✅ `src-tauri/tauri.conf.json`

### 5. 完整工作流程示例

#### 方式一：一键发布（推荐） 🎯

```bash
# 一条命令完成所有步骤
npm run release:patch

# 发布流程包含：
# 1. 更新版本号 (0.2.0 -> 0.2.1)
# 2. 构建应用验证
# 3. 自动提交更改
# 4. 创建 Git 标签 (v0.2.1)
# 5. 推送到远程仓库
```

#### 方式二：分步骤发布 🔧

```bash
# 1. 更新版本号
npm run version:patch

# 2. 手动测试和验证
npm run tauri:dev

# 3. 构建应用
npm run tauri:build

# 4. 提交更改并创建标签
npm run tag:push
```

#### 方式三：自定义发布 ⚙️

```bash
# 更新到指定版本
npm run version:set 2.1.0

# 创建标签（处理冲突）
npm run tag:create --force

# 或者跳过构建的快速发布
npm run release:quick
```

## 🔧 高级用法

### 自定义版本号规则

如果需要预发布版本（如 `1.0.0-beta.1`），可以直接使用：

```bash
npm run version:set 1.0.0-beta.1
```

### 与 CI/CD 集成

在 GitHub Actions 中使用：

```yaml
- name: Update version
  run: npm run version:patch

- name: Build app
  run: npm run tauri:build
```

## 📁 文件结构

```
project/
├── package.json              # 前端项目版本
├── src-tauri/
│   ├── Cargo.toml            # Rust 项目版本
│   └── tauri.conf.json       # Tauri 配置版本
└── scripts/
    └── update-version.js     # 自动化脚本
```

## 🎯 版本语义

遵循 [Semantic Versioning](https://semver.org/) 规范：

- **major**: 破坏性更改 (1.0.0 -> 2.0.0)
- **minor**: 新功能添加 (1.0.0 -> 1.1.0)
- **patch**: 错误修复 (1.0.0 -> 1.0.1)

## ⚠️ 注意事项

1. 在更新版本前，确保所有更改都已提交
2. 构建测试通过后再发布新版本
3. 重要更新建议创建 Git tag 标记
4. 版本号更新后会自动清理构建缓存

## 🔄 回滚版本

如果需要回滚到之前的版本：

```bash
# 回滚到指定版本
npm run version:set 0.0.1

# 清理构建缓存
cd src-tauri && cargo clean && cd ..
```

## 📋 脚本命令总览

### 版本管理命令
| 命令 | 功能 | 示例 |
|------|------|------|
| `npm run version:patch` | 更新补丁版本 | 0.1.0 → 0.1.1 |
| `npm run version:minor` | 更新次版本 | 0.1.0 → 0.2.0 |
| `npm run version:major` | 更新主版本 | 0.1.0 → 1.0.0 |
| `npm run version:set X.Y.Z` | 设置指定版本 | 设置为 2.1.3 |

### 标签管理命令
| 命令 | 功能 | 说明 |
|------|------|------|
| `npm run tag:create` | 创建标签 | 需要手动提交更改 |
| `npm run tag:push` | 创建标签并推送 | 自动提交未提交的更改 |
| `npm run tag:create --force` | 强制创建标签 | 覆盖已存在的标签 |

### 完整发布命令
| 命令 | 功能 | 包含步骤 |
|------|------|----------|
| `npm run release:patch` | 补丁版本发布 | 版本更新 + 构建 + 标签 + 推送 |
| `npm run release:minor` | 次版本发布 | 版本更新 + 构建 + 标签 + 推送 |
| `npm run release:major` | 主版本发布 | 版本更新 + 构建 + 标签 + 推送 |
| `npm run release:quick` | 快速发布 | 跳过构建验证 |

## 🎯 最佳实践

1. **日常开发**：使用 `npm run release:patch` 进行小版本发布
2. **新功能**：使用 `npm run release:minor` 发布新功能
3. **重大更新**：使用 `npm run release:major` 发布重大版本
4. **测试环境**：使用 `npm run release:quick` 快速发布测试版本

## 🔧 创建的文件

- `scripts/update-version.js` - 版本更新脚本
- `scripts/create-tag.js` - Git 标签管理脚本
- `scripts/release.js` - 完整发布流程脚本

现在您再也不需要手动修改多个文件了！🎉 