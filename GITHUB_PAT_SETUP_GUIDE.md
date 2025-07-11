# GitHub Personal Access Token (PAT) 设置指南

## 为什么需要 PAT？

根据 GitHub 的说明，默认的 `GITHUB_TOKEN` 在某些情况下没有足够的权限创建 releases，特别是：
- 当 workflow 由 fork 的 pull request 触发时
- 使用细粒度 PAT 但权限不正确时
- 当 workflow 作为 GitHub App 运行时

## 步骤1: 创建 Personal Access Token

### 1.1 访问 GitHub 设置
1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 在左侧菜单中找到 **Developer settings**
4. 点击 **Personal access tokens** → **Tokens (classic)**

### 1.2 生成新的 Token
1. 点击 **Generate new token** → **Generate new token (classic)**
2. 填写以下信息：
   - **Note**: `Tauri Release Token` (或其他描述性名称)
   - **Expiration**: 建议选择 `90 days` 或 `1 year`
   - **Scopes**: 勾选以下权限：
     - ✅ **repo** (完整的仓库权限)
       - ✅ repo:status
       - ✅ repo_deployment
       - ✅ public_repo
       - ✅ repo:invite
       - ✅ security_events

### 1.3 生成并复制 Token
1. 点击 **Generate token**
2. **重要**: 立即复制生成的 token，离开页面后将无法再次查看
3. Token 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 步骤2: 添加 Token 到仓库 Secrets

### 2.1 访问仓库设置
1. 打开您的仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Secrets and variables** → **Actions**

### 2.2 添加新的 Secret
1. 点击 **New repository secret**
2. 填写信息：
   - **Name**: `GH_PAT`
   - **Secret**: 粘贴刚才复制的 token
3. 点击 **Add secret**

## 步骤3: 验证配置

### 3.1 检查 Workflow 文件
确认 `.github/workflows/release.yml` 中使用了正确的 secret：

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GH_PAT }}  # ✅ 使用 PAT
  # GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # ❌ 旧的配置
```

### 3.2 测试 Release
```bash
# 创建新的 tag 来触发 release
git tag v0.0.3
git push origin v0.0.3
```

## 安全最佳实践

### Token 安全
- ✅ **永远不要**将 PAT 直接写在代码中
- ✅ **定期更新** token（设置合理的过期时间）
- ✅ **最小权限原则**：只授予必要的权限
- ✅ **监控使用情况**：定期检查 token 的使用日志

### 权限管理
- 只在需要的仓库中使用 PAT
- 如果不再需要，及时删除或禁用 token
- 为不同用途创建不同的 token

## 故障排除

### 常见错误和解决方案

#### 1. "Bad credentials" 错误
- 检查 PAT 是否正确复制
- 确认 PAT 没有过期
- 验证 secret 名称是否为 `GH_PAT`

#### 2. "Resource not accessible" 错误
- 确认 PAT 具有 `repo` 权限
- 检查仓库是否为私有（可能需要额外权限）

#### 3. Token 过期
- 在 GitHub Settings 中更新 token
- 在仓库 Secrets 中更新 `GH_PAT`

## 现有 Secrets 检查清单

确保您的仓库有以下 secrets：

- ✅ `GH_PAT` - GitHub Personal Access Token
- ✅ `TAURI_SIGNING_PRIVATE_KEY` - Tauri 签名私钥
- ✅ `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - 签名私钥密码

## 参考链接

- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Tauri Action Documentation](https://github.com/tauri-apps/tauri-action)

---

💡 **提示**: 完成设置后，下次推送 tag 时应该能够成功创建 GitHub Release！ 