# AI Profile 部署指南

## 配置说明

### 已更新的配置

1. **Next.js 端口**: 已改为 `3001`
   - 开发环境: `npm run dev` → http://localhost:3001
   - 生产环境: `npm run start` → http://localhost:3001

2. **URL 基础路径**: 已设置为 `/ai-profile`
   - next.config.ts 中配置: `basePath: "/ai-profile"`
   - 访问路径: `http://localhost:3001/ai-profile` 或通过 nginx 代理

3. **Nginx 配置**: 已创建完整的代理配置
   - 文件位置: `nginx.conf`

## Nginx 部署步骤

### Linux/Mac 部署

#### 1. 复制配置文件

```bash
# 备份原有配置
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# 或者使用项目的 nginx.conf 替换 /etc/nginx/conf.d/ 目录中的配置
sudo cp nginx.conf /etc/nginx/conf.d/ai-profile.conf
```

#### 2. 测试 Nginx 配置

```bash
sudo nginx -t
```

#### 3. 重启 Nginx

```bash
# Linux
sudo systemctl restart nginx

# Mac
sudo nginx -s reload
```

### Windows 部署

#### 1. 下载并安装 Nginx

从 [http://nginx.org/download/](http://nginx.org/download/) 下载 Windows 版本

#### 2. 配置 Nginx

将 `nginx.conf` 文件内容复制到 `nginx/conf/nginx.conf`

或者在 `nginx/conf.d/` 目录下创建 `ai-profile.conf`

#### 3. 启动 Nginx

```bash
cd nginx
start nginx.exe
```

## 生产环境构建

### 1. 构建项目

```bash
npm run build
```

### 2. 启动生产服务器

```bash
npm run start
```

### 3. 配置反向代理

通过 Nginx 反向代理到 `http://localhost:3001`

## Nginx 配置详解

### 主要特性

| 功能 | 说明 |
|------|------|
| **Upstream** | 配置后端服务器地址 (localhost:3001) |
| **反向代理** | 将请求转发到 Next.js 应用 |
| **Gzip 压缩** | 启用 Gzip 压缩，减小传输体积 |
| **WebSocket 支持** | Upgrade 和 Connection 头用于 WebSocket 连接 |
| **API 速率限制** | 防止 API 被过度调用 |
| **静态资源缓存** | Next.js 静态文件使用长期缓存 |
| **安全配置** | 拒绝访问敏感文件（.env, .git）|

### 核心配置说明

```nginx
# 后端应用地址
upstream next_app {
    server localhost:3001;
}

# 主应用路由
location /ai-profile/ {
    proxy_pass http://next_app;
    # 保持长连接
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    # 转发真实客户端信息
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## HTTPS 配置

### 启用 SSL

编辑 `nginx.conf`，取消注释 HTTPS 部分并填写证书路径：

```nginx
ssl_certificate /path/to/your-cert.crt;
ssl_certificate_key /path/to/your-key.key;
```

### 自签名证书（测试用）

```bash
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes
```

## 测试访问

### 直接访问 Next.js 应用

```bash
http://localhost:3001/ai-profile
```

### 通过 Nginx 代理访问

```bash
http://localhost/ai-profile
```

### 健康检查

```bash
curl http://localhost/ai-profile/health
```

## 故障排除

### 1. 404 错误

确保 basePath 配置正确，所有路由都需要以 `/ai-profile` 开头

### 2. 连接被拒绝

检查：
- Next.js 应用是否运行在 3001 端口
- Nginx 是否成功启动
- 防火墙是否开放必要端口

### 3. WebSocket 连接失败

确保 Nginx 配置中包含：
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

### 4. 日志查看

```bash
# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Next.js 应用日志
npm run dev  # 开发环境直接显示
```

## 性能优化建议

### 1. 启用 HTTP/2

```nginx
listen 443 ssl http2;
```

### 2. 调整缓冲区

```nginx
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

### 3. 连接超时

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### 4. 启用缓存

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m;

location /ai-profile/_next/static/ {
    proxy_cache app_cache;
    proxy_cache_valid 200 30d;
}
```

## Docker 部署（可选）

### Dockerfile 示例

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
```

### 构建和运行

```bash
docker build -t ai-profile .
docker run -p 3001:3001 ai-profile
```

## 反向代理配置变量

| 变量 | 含义 |
|------|------|
| `$host` | 请求的主机名 |
| `$remote_addr` | 客户端真实 IP |
| `$proxy_add_x_forwarded_for` | 包含客户端 IP 的列表 |
| `$scheme` | 请求协议 (http/https) |
| `$http_upgrade` | Upgrade 请求头 |

## 常用命令

```bash
# 开发环境启动
npm run dev

# 生产环境构建
npm run build

# 生产环境启动
npm start

# Nginx 相关
nginx -t              # 测试配置
nginx -s reload       # 重新加载配置
nginx -s stop         # 停止 Nginx
nginx -s quit         # 关闭 Nginx
```

---

**配置时间**: 2026-08-16
**Next.js 版本**: 16.3.0
**项目**: AI Profile
