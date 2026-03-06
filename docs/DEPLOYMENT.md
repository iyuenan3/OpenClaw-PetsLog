# PetsLog 部署指南

**部署平台**: uniCloud 阿里云  
**部署日期**: 2026-03-06  
**版本**: v1.0.0-alpha.14

---

## 📋 部署前准备

### 1. 环境要求

- Node.js >= 20.x
- npm >= 8.x
- HBuilderX（推荐）
- uniCloud 服务空间

### 2. 配置信息

**服务空间**: `openclaw-petslog-ns`  
**空间 ID**: `mp-a387d411-c277-422a-a633-61aedbac1f45`  
**提供商**: 阿里云

配置文件位置：`~/.openclaw/config/unicloud.json`

---

## 🚀 部署步骤

### 方法一：使用 HBuilderX（推荐）

#### 步骤 1: 打开项目

1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 HBuilderX
3. 文件 → 打开目录 → 选择 `petslog-clean` 文件夹

#### 步骤 2: 关联云服务空间

1. 在 HBuilderX 中，右键 `uniCloud-aliyun` 目录
2. 选择 "关联云服务空间"
3. 选择已有的空间或创建新空间
4. 确认关联

#### 步骤 3: 上传数据库 Schema

1. 右键 `uniCloud-aliyun/database` 目录
2. 选择 "上传所有数据库 Schema"
3. 等待上传完成

**数据库集合**:
- `users` - 用户表
- `families` - 家庭表
- `pets` - 宠物表
- `weight_records` - 体重记录
- `deworming_records` - 驱虫记录
- `vaccine_records` - 疫苗记录
- `health_records` - 健康记录
- `food_records` - 粮食记录

#### 步骤 4: 上传云函数

1. 右键 `uniCloud-aliyun/cloudfunctions` 目录
2. 选择 "上传所有云函数"
3. 等待上传完成（约 2-3 分钟）

**云函数列表**:
- `login` - 用户登录
- `register` - 用户注册
- `pet-list` - 获取宠物列表
- `pet-create` - 创建宠物
- `pet-update` - 更新宠物
- `pet-delete` - 删除宠物
- `weight-record` - 体重记录 CRUD
- `deworming-record` - 驱虫记录 CRUD
- `vaccine-record` - 疫苗记录 CRUD
- `health-record` - 健康记录 CRUD
- `food-record` - 粮食记录 CRUD
- `check-reminders` - 检查提醒

#### 步骤 5: 构建 H5

1. 点击菜单栏 "运行" → "运行到浏览器" → "运行到 Chrome"
2. 或使用命令行：
   ```bash
   npm run dev:h5
   ```

#### 步骤 6: 部署到 Web 托管

1. 右键 `uniCloud-aliyun` 目录
2. 选择 "部署到 Web 托管"
3. 选择构建目录：`dist/build/h5`
4. 确认部署

#### 步骤 7: 配置域名

1. 登录 [uniCloud 控制台](https://uniapp.dcloud.io/uniCloud/)
2. 进入服务空间
3. 配置域名白名单：
   - request 合法域名
   - uploadFile 合法域名
   - downloadFile 合法域名

---

### 方法二：使用命令行

#### 步骤 1: 安装依赖

```bash
npm install
```

#### 步骤 2: 构建前端

```bash
# 构建 H5
npm run build:h5

# 或构建微信小程序
npm run build:mp-weixin
```

#### 步骤 3: 部署云函数

使用 uniCloud CLI（需要先安装）：

```bash
# 安装 uniCloud CLI
npm install -g @dcloudio/uni-cli

# 登录
unicloud login

# 部署云函数
unicloud deploy:functions

# 部署数据库
unicloud deploy:database
```

#### 步骤 4: 部署前端

将 `dist/build/h5` 目录上传到 Web 托管或 CDN。

---

## 🔧 配置小程序

### 微信小程序配置

#### 1. 配置 AppID

编辑 `src/manifest.json`：

```json
"mp-weixin" : {
    "appid" : "wx0fff6b192bed48d0",
    "setting" : {
        "urlCheck" : true
    }
}
```

#### 2. 配置合法域名

在微信小程序后台配置：

**request 合法域名**:
- https://api.next.bspapp.com

**uploadFile 合法域名**:
- https://file-univbxmwaz-mp-a387d411-c277-422a-a633-61aedbac1f45.oss-cn-zhangjiakou.aliyuncs.com

**downloadFile 合法域名**:
- https://file-univbxmwaz-mp-a387d411-c277-422a-a633-61aedbac1f45.oss-cn-zhangjiakou.aliyuncs.com

#### 3. 上传小程序

1. 在 HBuilderX 中，运行 → 运行到小程序模拟器 → 微信开发者工具
2. 在微信开发者工具中，点击 "上传"
3. 填写版本号和项目备注
4. 提交审核

---

## 📊 部署验证

### 1. 检查云函数

```bash
# 测试登录云函数
curl -X POST https://api.next.bspapp.com/client \
  -H "Content-Type: application/json" \
  -d '{
    "functionName": "login",
    "data": {
      "username": "test",
      "password": "test123"
    }
  }'
```

### 2. 检查数据库

登录 uniCloud 控制台，查看数据库集合是否存在。

### 3. 检查前端

访问部署的 H5 地址，测试登录和宠物管理功能。

---

## 🔍 故障排查

### 问题 1: 云函数上传失败

**原因**: 网络问题或依赖未安装

**解决**:
```bash
cd uniCloud-aliyun/cloudfunctions/云函数名
npm install
# 重新上传
```

### 问题 2: 数据库 Schema 上传失败

**原因**: 权限不足或 Schema 语法错误

**解决**:
1. 检查服务空间权限
2. 验证 Schema JSON 语法
3. 重新上传

### 问题 3: 小程序请求失败

**原因**: 域名未配置

**解决**:
1. 在小程序后台配置合法域名
2. 在 uniCloud 控制台配置 CORS

### 问题 4: 文件上传失败

**原因**: OSS 权限问题

**解决**:
1. 检查 OSS 配置
2. 验证上传权限
3. 检查文件大小限制

---

## 📈 性能优化

### 1. CDN 加速

- 启用 CDN 加速
- 配置缓存策略
- 压缩静态资源

### 2. 云函数优化

- 使用云函数缓存
- 减少数据库查询
- 批量操作代替循环

### 3. 数据库优化

- 添加索引
- 分页查询
- 合理使用聚合

---

## 🔐 安全建议

### 1. 权限控制

- 配置数据库权限
- 使用云函数鉴权
- 验证用户身份

### 2. 数据加密

- 密码加密存储
- 敏感数据加密传输
- 使用 HTTPS

### 3. 访问控制

- 配置 IP 白名单
- 限制请求频率
- 防止 SQL 注入

---

## 📞 技术支持

- uniCloud 文档：https://uniapp.dcloud.io/uniCloud/
- HBuilderX 下载：https://www.dcloud.io/hbuilderx.html
- 问题反馈：https://github.com/iyuenan3/OpenClaw-PetsLog/issues

---

## 📝 部署检查清单

- [ ] 安装 HBuilderX
- [ ] 关联云服务空间
- [ ] 上传数据库 Schema（8 个）
- [ ] 上传云函数（12 个）
- [ ] 构建 H5
- [ ] 部署到 Web 托管
- [ ] 配置域名白名单
- [ ] 配置小程序 AppID
- [ ] 配置小程序域名
- [ ] 测试登录功能
- [ ] 测试宠物管理
- [ ] 测试记录功能
- [ ] 测试文件上传
- [ ] 提交小程序审核

---

**部署完成时间**: 预计 30-60 分钟  
**最后更新**: 2026-03-06  
**版本**: v1.0.0-alpha.14
