# PetsLog - 宠物健康管理系统 🐾

一个基于 uni-app 的跨平台宠物健康管理系统，支持微信小程序和 H5 网页端。

![Version](https://img.shields.io/badge/version-1.0.0--alpha.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 技术栈

- **前端框架**: uni-app (Vue3 + Vite)
- **UI 组件**: uview-plus
- **图表**: echarts
- **后端**: uniCloud 阿里云
- **数据库**: MongoDB (uniCloud DB)

## 📱 支持平台

- 微信小程序
- H5 网页端

## 🎯 核心功能

### 用户系统
- ✅ 自定义账号密码登录
- ✅ 家庭数据共享，不同家庭数据隔离
- ✅ Web 端支持"记住登录状态"

### 宠物档案
- ✅ 基础信息管理（名字、品种、性别、出生日期、毛色等）
- ✅ 绝育状态记录
- ✅ 年龄自动计算

### 记录类型
1. **体重记录** ⚖️ - 手动输入，变化曲线图，每月提醒称重
2. **驱虫记录** 💊 - 体内/体外驱虫，品牌/型号/使用日期，到期提醒
3. **疫苗记录** 💉 - 疫苗类型/名称/品牌/接种日期，加强针提醒
4. **健康状况** 🏥 - 呕吐/拉稀等观察记录，支持图片/PDF/视频附件
5. **粮食记录** 🍖 - 换粮时间、历史记录、品牌和型号

### 提醒功能
- 驱虫到期提醒
- 疫苗加强针提醒
- 每月称重提醒
- 宠物生日提醒

## 📁 项目结构

```
OpenClaw-PetsLog/
├── uniCloud-aliyun/          # uniCloud 阿里云配置
│   ├── cloudfunctions/       # 云函数 (11 个)
│   │   ├── login/            # 用户登录
│   │   ├── register/         # 用户注册
│   │   ├── pet-*/            # 宠物 CRUD
│   │   └── *-record/         # 5 类记录 CRUD
│   ├── database/             # 数据库 Schema (8 个集合)
│   └── config.json           # 空间配置
├── src/
│   ├── pages/                # 页面
│   ├── components/           # 组件
│   ├── App.vue               # 应用配置
│   └── main.js               # 入口文件
├── docs/
│   ├── conversations/        # 交流记录
│   └── dev-guide.md          # 开发文档
├── README.md
├── CHANGELOG.md
└── package.json
```

## 🛠️ 开发指南

### 环境准备

```bash
# 克隆项目
git clone git@github.com:iyuenan3/OpenClaw-PetsLog.git
cd OpenClaw-PetsLog

# 安装依赖
npm install
```

### 启动开发服务器

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin
```

### 构建生产版本

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin
```

### uniCloud 配置

1. 在 HBuilderX 中打开项目
2. 右键 `uniCloud-aliyun` 目录 → "关联云服务空间"
3. 选择空间：`openclaw-petslog-ns`
4. 上传云函数和数据库 Schema

详细配置见 [开发文档](docs/dev-guide.md)

## 📡 API 文档

### 云函数列表

| 云函数 | 功能 | 状态 |
|--------|------|------|
| login | 用户登录 | ✅ |
| register | 用户注册 | ✅ |
| pet-list | 获取宠物列表 | ✅ |
| pet-create | 创建宠物 | ✅ |
| pet-update | 更新宠物 | ✅ |
| pet-delete | 删除宠物 | ✅ |
| weight-record | 体重记录 CRUD | ✅ |
| deworming-record | 驱虫记录 CRUD | ✅ |
| vaccine-record | 疫苗记录 CRUD | ✅ |
| health-record | 健康记录 CRUD | ✅ |
| food-record | 粮食记录 CRUD | ✅ |

详细 API 文档见 [开发文档](docs/dev-guide.md#api-文档)

## 📝 开发进度

### 阶段 1：基础架构 ✅
- [x] 初始化 uni-app 项目（Vue3 + Vite）
- [x] 配置 uniCloud 连接
- [x] 安装 uview-plus、echarts
- [x] 配置多端编译（小程序 + H5）
- [x] 创建数据库 Schema（8 个集合）

### 阶段 2：后端云函数 ✅
- [x] 创建用户登录/注册云函数
- [x] 创建宠物 CRUD 云函数
- [x] 创建记录 CRUD 云函数（5 类）

### 阶段 3：前端 - 小程序 🔄
- [x] 登录/注册页面框架
- [x] 首页（宠物列表）
- [x] 宠物详情页
- [x] 记录页面
- [ ] 前后端联调
- [ ] UI 美化

### 阶段 4：前端 - Web 端
- [ ] H5 适配
- [ ] Web 端测试
- [ ] 部署配置

### 阶段 5：增强功能
- [ ] 体重曲线图（echarts）
- [ ] 提醒功能
- [ ] 媒体文件上传
- [ ] GitHub Actions 自动化

## 🔐 敏感信息

以下信息**禁止**提交到 GitHub：
- uniCloud clientSecret
- Notion API Key
- 任何密码

配置路径：
- `~/.openclaw/config/unicloud.json`
- `~/.config/notion/api_key`

## 🐾 关于

这是为 Maxwell 的 8 只宠物（7 猫 1 狗）设计的健康管理系统。

**猫咪**: 小葵、飞流、乔治、吉吉、五百、花轮、红豆  
**狗狗**: 小七

## 📄 License

MIT

## 🔗 链接

- GitHub: https://github.com/iyuenan3/OpenClaw-PetsLog
- 开发文档：[docs/dev-guide.md](docs/dev-guide.md)
- 更新日志：[CHANGELOG.md](CHANGELOG.md)
