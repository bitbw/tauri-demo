#!/bin/bash

# GitHub Releases 自动发布脚本
# 使用方法: ./scripts/release.sh [patch|minor|major]

set -e

# 获取版本类型参数，默认为 patch
VERSION_TYPE=${1:-patch}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色消息
print_message() {
    echo -e "${2}${1}${NC}"
}

# 检查是否有未提交的更改
check_git_status() {
    if [[ -n $(git status --porcelain) ]]; then
        print_message "❌ 有未提交的更改，请先提交或暂存更改" $RED
        git status --short
        exit 1
    fi
}

# 检查是否在主分支
check_main_branch() {
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
        print_message "❌ 请在主分支 (main/master) 上执行发布" $RED
        print_message "当前分支: $CURRENT_BRANCH" $YELLOW
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    if ! command -v npm &> /dev/null; then
        print_message "❌ npm 未安装" $RED
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_message "❌ git 未安装" $RED
        exit 1
    fi
}

# 验证版本类型
validate_version_type() {
    if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
        print_message "❌ 无效的版本类型: $VERSION_TYPE" $RED
        print_message "支持的类型: patch, minor, major" $YELLOW
        exit 1
    fi
}

# 显示当前版本信息
show_current_version() {
    CURRENT_VERSION=$(node -pe "require('./package.json').version")
    print_message "📦 当前版本: v$CURRENT_VERSION" $BLUE
}

# 更新版本
update_version() {
    print_message "🔄 更新版本类型: $VERSION_TYPE" $YELLOW
    
    # 更新 package.json 版本
    npm version $VERSION_TYPE --no-git-tag-version
    
    # 获取新版本号
    NEW_VERSION=$(node -pe "require('./package.json').version")
    
    # 同步到 Cargo.toml
    if [[ -f "src-tauri/Cargo.toml" ]]; then
        # 使用 sed 更新 Cargo.toml 中的版本号
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^version = \".*\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
        else
            # Linux
            sed -i "s/^version = \".*\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
        fi
        print_message "✅ 已同步 Cargo.toml 版本到 v$NEW_VERSION" $GREEN
    fi
    
    print_message "📦 新版本: v$NEW_VERSION" $GREEN
    echo $NEW_VERSION
}

# 创建提交和标签
create_release() {
    NEW_VERSION=$1
    
    print_message "📝 创建发布提交..." $YELLOW
    
    # 添加所有更改
    git add .
    
    # 创建提交
    git commit -m "chore: release v$NEW_VERSION"
    
    # 创建标签
    git tag "v$NEW_VERSION"
    
    print_message "🏷️  已创建标签: v$NEW_VERSION" $GREEN
}

# 推送到远程
push_to_remote() {
    NEW_VERSION=$1
    
    print_message "🚀 推送到远程仓库..." $YELLOW
    
    # 推送主分支
    git push origin HEAD
    
    # 推送标签
    git push origin "v$NEW_VERSION"
    
    print_message "✅ 已推送到远程仓库" $GREEN
}

# 显示发布信息
show_release_info() {
    NEW_VERSION=$1
    
    # 获取 Git 远程仓库信息
    REMOTE_URL=$(git config --get remote.origin.url)
    
    # 转换为 GitHub URL
    if [[ $REMOTE_URL == git@github.com:* ]]; then
        GITHUB_URL="https://github.com/${REMOTE_URL#git@github.com:}"
        GITHUB_URL="${GITHUB_URL%.git}"
    elif [[ $REMOTE_URL == https://github.com/* ]]; then
        GITHUB_URL="${REMOTE_URL%.git}"
    else
        GITHUB_URL="你的 GitHub 仓库"
    fi
    
    print_message "🎉 发布流程完成！" $GREEN
    echo ""
    print_message "📋 发布信息:" $BLUE
    print_message "  版本: v$NEW_VERSION" $NC
    print_message "  标签: v$NEW_VERSION" $NC
    print_message "  分支: $(git rev-parse --abbrev-ref HEAD)" $NC
    echo ""
    print_message "🔗 相关链接:" $BLUE
    print_message "  GitHub Actions: $GITHUB_URL/actions" $NC
    print_message "  Releases: $GITHUB_URL/releases" $NC
    print_message "  最新发布: $GITHUB_URL/releases/tag/v$NEW_VERSION" $NC
    echo ""
    print_message "⏳ GitHub Actions 正在构建中..." $YELLOW
    print_message "📦 构建完成后，用户就能够自动更新到 v$NEW_VERSION" $GREEN
}

# 主函数
main() {
    print_message "🚀 开始 GitHub Releases 自动发布流程..." $BLUE
    echo ""
    
    # 验证环境
    check_dependencies
    validate_version_type
    check_git_status
    check_main_branch
    
    # 显示当前版本
    show_current_version
    
    # 确认发布
    print_message "❓ 确认发布 $VERSION_TYPE 版本? (y/N)" $YELLOW
    read -r CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
        print_message "❌ 发布已取消" $RED
        exit 0
    fi
    
    # 执行发布流程
    NEW_VERSION=$(update_version)
    create_release $NEW_VERSION
    push_to_remote $NEW_VERSION
    show_release_info $NEW_VERSION
}

# 帮助信息
show_help() {
    echo "GitHub Releases 自动发布脚本"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/release.sh [VERSION_TYPE]"
    echo ""
    echo "参数:"
    echo "  VERSION_TYPE    版本类型 (patch|minor|major)，默认为 patch"
    echo ""
    echo "示例:"
    echo "  ./scripts/release.sh patch   # 补丁版本 (0.1.0 -> 0.1.1)"
    echo "  ./scripts/release.sh minor   # 小版本 (0.1.0 -> 0.2.0)"
    echo "  ./scripts/release.sh major   # 大版本 (0.1.0 -> 1.0.0)"
    echo ""
    echo "环境要求:"
    echo "  - npm"
    echo "  - git"
    echo "  - 在主分支 (main/master) 上"
    echo "  - 没有未提交的更改"
}

# 解析参数
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# 执行主函数
main 