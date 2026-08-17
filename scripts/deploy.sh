#!/usr/bin/env bash
#
# 本地构建 → scp 上传 → 服务器重启 的零服务器构建部署脚本。
#
# 背景：服务器仅 1.6G 内存，在服务器执行 next build（尤其 Turbopack 多 worker）
# 会耗尽内存导致整机失联。因此必须在本地构建，只把产物 .next 传到服务器。
# 注意：必须用 webpack 构建（--webpack）。Turbopack 会把 serverExternalPackages
# （better-sqlite3）处理成带 hash 的虚拟模块，该虚拟模块跨平台无法解析，导致 Linux
# 运行时 Cannot find module。webpack 生成普通 require("better-sqlite3")，运行时
# 从服务器已有的 Linux 版 node_modules 加载原生 .node，JS 产物本身跨平台。
#
# 用法（在项目根目录，Git Bash）：
#   DEPLOY_HOST=47.120.37.126 \
#   DEPLOY_KEY=/d/cong/guan.pem \
#   bash scripts/deploy.sh
#
# 可选变量（带默认值）：
#   DEPLOY_USER=root
#   DEPLOY_DIR=/opt/ai-profile        # 服务器项目目录
#   DEPLOY_APP=ai-profile             # pm2 进程名
#   DEPLOY_PORT=3001
#   SKIP_BUILD=1                      # 跳过本地构建，直接上传现有 .next
#
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:?请设置 DEPLOY_HOST}"
DEPLOY_KEY="${DEPLOY_KEY:?请设置 DEPLOY_KEY}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/ai-profile}"
DEPLOY_APP="${DEPLOY_APP:-ai-profile}"
DEPLOY_PORT="${DEPLOY_PORT:-3001}"

SSH_OPTS=(-i "$DEPLOY_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=20)
SCP_OPTS=(-i "$DEPLOY_KEY" -o StrictHostKeyChecking=no)

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
echo "==> 项目根目录: $ROOT"

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "==> [1/5] 本地 webpack 生产构建 (PUPPETEER_SKIP_DOWNLOAD)…"
  PUPPETEER_SKIP_DOWNLOAD=true npx next build --webpack
else
  echo "==> [1/5] SKIP_BUILD=1，跳过本地构建"
fi

echo "==> [2/5] 打包 .next（排除 cache/dev）…"
PKG="/tmp/ai-profile-next.tar.gz"
rm -f "$PKG"
tar -czf "$PKG" --exclude='.next/cache' --exclude='.next/dev' .next
echo "    包大小: $(du -h "$PKG" | cut -f1)"

echo "==> [3/5] 上传到 $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR…"
scp "${SCP_OPTS[@]}" "$PKG" "$DEPLOY_USER@$DEPLOY_HOST:/tmp/" >/dev/null
rm -f "$PKG"
PKG_NAME="$(basename "$PKG")"

echo "==> [4/5] 服务器替换 .next 并重启 $DEPLOY_APP…"
# 用 Heredoc 把脚本送到远端 bash 执行；set -e 保证任一步失败即中止。
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  DEPLOY_DIR="$DEPLOY_DIR" DEPLOY_APP="$DEPLOY_APP" DEPLOY_PORT="$DEPLOY_PORT" PKG_NAME="$PKG_NAME" \
  'bash -s' <<'REMOTE'
set -euo pipefail
cd "$DEPLOY_DIR"
pm2 stop "$DEPLOY_APP" >/dev/null 2>&1 || true
rm -rf .next
tar -xzf "/tmp/$PKG_NAME"
rm -f "/tmp/$PKG_NAME"
echo "    新 BUILD_ID: $(cat .next/BUILD_ID)"
pm2 restart "$DEPLOY_APP" --update-env >/dev/null
# 等待端口就绪
for i in $(seq 1 15); do
  if curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${DEPLOY_PORT:-3001}/ai-profile" 2>/dev/null | grep -q '200\|308'; then
    break
  fi
  sleep 1
done
REMOTE

echo "==> [5/5] 验证…"
sleep 2
CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://$DEPLOY_HOST:$DEPLOY_PORT/ai-profile/api/settings" || echo "000")
echo "    /ai-profile/api/settings -> HTTP $CODE"
if [ "$CODE" = "200" ]; then
  echo "✅ 部署完成: http://$DEPLOY_HOST/ai-profile"
else
  echo "⚠️  健康检查返回 $CODE，请查看日志：ssh -i $DEPLOY_KEY $DEPLOY_USER@$DEPLOY_HOST 'pm2 logs $DEPLOY_APP --lines 30 --nostream'"
  exit 1
fi
