# 🔍 签名调试指南

## 📋 新增的调试功能

我已经在 GitHub Actions 中添加了详细的调试步骤，帮助您诊断签名问题。

### 🔧 调试步骤说明

#### 1. 构建前调试：检查签名密钥配置
```yaml
- name: Debug - Check signing key
```

**查看内容**：
- 🔑 签名私钥长度（应该大于 100 字符）
- 🔑 密码长度（应该 > 0）
- 🔑 签名密钥前64个字符预览

**正常输出示例**：
```
🔍 检查签名密钥配置...
TAURI_SIGNING_PRIVATE_KEY 长度: 236
TAURI_SIGNING_PRIVATE_KEY_PASSWORD 长度: 6
签名密钥前64个字符: dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJX...
```

#### 2. 构建后调试：检查生成的文件
```yaml
- name: Debug - Check generated files
```

**查看内容**：
- 📁 所有 `.sig` 签名文件的位置
- 📁 `latest.json` 文件的位置
- 📄 签名文件的内容和大小
- 📄 `latest.json` 文件的完整内容

**正常输出示例**：
```
🔍 检查生成的文件...
=== 查找所有生成的文件 ===
./src-tauri/target/aarch64-apple-darwin/release/bundle/macos/tauri-test1.app.tar.gz.sig
./src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/tauri-test1_0.1.0_aarch64.dmg.sig

=== 显示签名文件内容 ===
📄 签名文件: ./src-tauri/target/.../app.tar.gz.sig
文件大小: 340 字节
内容预览:
dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXk...

=== 显示 latest.json 内容 ===
📄 JSON 文件: ./src-tauri/target/.../latest.json
内容:
{
  "version": "v0.0.2",
  "notes": "Release notes",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://github.com/bitbw/tauri-demo/releases/download/v0.0.2/..."
    }
  }
}
```

## 🚀 如何使用调试信息

### 步骤 1: 更新 GitHub Secrets
按照 `SIGNING_FIX_SUMMARY.md` 的说明更新签名密钥。

### 步骤 2: 触发构建
```bash
git add .
git commit -m "debug: 添加签名调试信息"
git tag v0.0.2
git push origin main
git push origin v0.0.2
```

### 步骤 3: 查看调试输出
在 GitHub Actions 的构建日志中查看：

1. **"Debug - Check signing key"** 步骤的输出
2. **"Debug - Check generated files"** 步骤的输出

### 步骤 4: 分析结果

#### ✅ 成功的标志：
- 签名密钥长度正常（> 100 字符）
- 找到 `.sig` 文件
- 找到 `latest.json` 文件
- JSON 文件包含 `signature` 和 `url` 字段

#### ❌ 失败的标志：
- 签名密钥长度为 0 或很短
- 找不到 `.sig` 文件
- 找不到 `latest.json` 文件
- 构建日志仍显示 "Signature not found"

## 🔍 常见问题诊断

### 问题 1: 签名密钥长度为 0
**原因**: GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` 未设置或为空
**解决**: 重新设置 GitHub Secret

### 问题 2: 找不到 .sig 文件
**原因**: 签名过程失败
**解决**: 检查密钥格式和密码是否正确

### 问题 3: 找到 .sig 文件但没有 latest.json
**原因**: Tauri Action 未正确处理签名文件
**解决**: 检查 Tauri 版本和配置

### 问题 4: latest.json 存在但 GitHub Release 中没有
**原因**: 上传过程失败
**解决**: 检查 GitHub PAT 权限

## 📞 下一步行动

1. **立即行动**: 更新 GitHub Secrets
2. **触发构建**: 推送新标签
3. **查看日志**: 分析调试输出
4. **报告结果**: 如果仍有问题，提供调试日志

## 🎯 预期结果

修复成功后，您应该在调试日志中看到：
- ✅ 签名密钥配置正确
- ✅ 签名文件正常生成
- ✅ `latest.json` 文件包含完整信息
- ✅ GitHub Release 包含所有必要文件

这个调试功能将帮助我们精确定位问题所在！ 