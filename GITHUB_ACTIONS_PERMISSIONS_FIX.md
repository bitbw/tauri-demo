# GitHub Actions 权限问题修复指南

## 问题描述

在运行 GitHub Actions release workflow 时，遇到以下错误：

```
Couldn't find release with tag v0.0.1. Creating one.
##[error]Resource not accessible by integration - https://docs.github.com/rest/releases/releases#create-a-release
```

## 原因分析

这个错误是因为默认的 `GITHUB_TOKEN` 没有足够的权限来创建 GitHub Releases。

从 GitHub 2021年开始，为了提高安全性，`GITHUB_TOKEN` 的默认权限被限制为只读。

## 解决方案

### 方案1：使用 Personal Access Token（GitHub 推荐 ⭐）

**这是 GitHub 官方推荐的解决方案。** 请参考详细指南：[GITHUB_PAT_SETUP_GUIDE.md](./GITHUB_PAT_SETUP_GUIDE.md)

### 方案2：在 Workflow 中添加权限配置

在 `.github/workflows/release.yml` 文件中添加 `permissions` 配置：

```yaml
name: Release Tauri App

on:
  push:
    tags:
      - 'v*'

# 添加权限配置
permissions:
  contents: write    # 允许创建 releases 和修改仓库内容
  packages: write    # 允许发布包（如果需要）

jobs:
  build-and-release:
    # ... 其他配置
```

### 方案3：检查仓库设置

确保仓库设置中允许 GitHub Actions：

1. 前往仓库 Settings > Actions > General
2. 在 "Workflow permissions" 部分，选择：
   - "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

## 验证修复

运行以下命令来测试修复：

```bash
# 创建一个新的 tag 来触发 release
git tag v0.0.2
git push origin v0.0.2
```

## 常见权限说明

| 权限 | 说明 |
|------|------|
| `contents: read` | 读取仓库内容（默认） |
| `contents: write` | 修改仓库内容，创建 releases |
| `packages: write` | 发布包到 GitHub Packages |
| `pull-requests: write` | 创建和修改 PR |
| `issues: write` | 创建和修改 issues |

## 安全注意事项

- 只添加必要的权限
- 避免使用 `contents: write` 如果不需要修改仓库
- 定期检查和更新权限配置
- 使用 PAT 时要设置合适的过期时间

## 相关链接

- [GitHub Token Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [Tauri Action Documentation](https://github.com/tauri-apps/tauri-action) 