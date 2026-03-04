# 更新日志 (CHANGELOG)

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### Added
- 无

### Changed
- 无

### Deprecated
- 无

### Removed
- 无

### Fixed
- 无

### Security
- 无

---

## [1.0.0-alpha.2] - 2026-03-04

### Added - 前后端联调完成

#### 前端页面
- `pages/login/login.vue`: 登录/注册页面，对接云函数
- `pages/index/index.vue`: 首页宠物列表，支持退出登录
- `pages/pet-detail/pet-detail.vue`: 宠物详情页（6 个 Tab）
- `pages/records/records.vue`: 记录管理入口

#### 功能实现
- 用户登录/注册（token 认证，本地存储）
- 宠物列表加载（自动计算年龄）
- 宠物详情多 Tab 切换
- tabBar 导航（宠物/记录）

#### 双端适配
- 微信小程序 ✅
- H5 网页端 ✅
- 同一套代码，多端编译

---

---

## [1.0.0-alpha.1] - 2026-03-04

### Added - 基础架构完成

#### 项目初始化
- 初始化 uni-app Vue3 + Vite 项目
- 配置微信小程序 AppID: `wx0fff6b192bed48d0`
- 配置 uniCloud 阿里云空间：`openclaw-petslog-ns`

#### 数据库设计 (8 个集合)
- `users`: 用户表
- `families`: 家庭表
- `pets`: 宠物档案
- `weight_records`: 体重记录
- `deworming_records`: 驱虫记录
- `vaccine_records`: 疫苗记录
- `health_records`: 健康记录
- `food_records`: 粮食记录

#### 云函数 (11 个)
**用户相关:**
- `login`: 用户登录
- `register`: 用户注册

**宠物相关:**
- `pet-list`: 获取宠物列表
- `pet-create`: 创建宠物
- `pet-update`: 更新宠物
- `pet-delete`: 删除宠物

**记录相关:**
- `weight-record`: 体重记录 CRUD
- `deworming-record`: 驱虫记录 CRUD
- `vaccine-record`: 疫苗记录 CRUD
- `health-record`: 健康记录 CRUD
- `food-record`: 粮食记录 CRUD

#### 前端页面
- `pages/login/login.vue`: 登录/注册页面
- `pages/index/index.vue`: 首页（宠物列表）
- `pages/pet-detail/pet-detail.vue`: 宠物详情页
- `pages/records/records.vue`: 记录管理页

#### 文档
- `README.md`: 项目说明
- `docs/dev-guide.md`: 开发文档
- `CHANGELOG.md`: 更新日志

### Security
- 配置 .gitignore 排除敏感信息
- uniCloud clientSecret 禁止提交

---

## 版本说明

### 1.0.0-alpha.1 (2026-03-04)
- 首个内部测试版本
- 完成基础架构和云函数开发
- 前端页面框架搭建完成
- 待完成：前后端联调、UI 美化、提醒功能、图表展示
