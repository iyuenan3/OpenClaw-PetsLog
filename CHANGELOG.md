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

## [1.0.0-alpha.12] - 2026-03-07

### Added - 离线模式与语音输入功能

#### 离线模式 📴
- `src/utils/network.js`: 网络状态检测工具
  - 支持微信小程序和 H5 端网络状态监听
  - 实时显示网络类型（WiFi/4G/5G）
  - 网络恢复自动检测
- `src/utils/offline-cache.js`: 离线缓存管理工具
  - 离线数据自动保存到本地存储
  - 网络恢复后一键同步
  - 最多缓存 100 条操作记录
- `src/App.vue`: 添加全局网络状态监听
  - 应用启动时初始化网络监听
  - 离线时显示提示

#### 语音输入 🎤
- `src/components/VoiceInput.vue`: 语音输入组件
  - H5 端：使用 Web Speech API 直接识别为文本
  - 微信小程序：支持录音功能
  - 按住说话，松开发送
  - 支持识别错误处理

#### 体重记录页面
- `src/pages/weight/add-weight.vue`: 全新的体重记录添加页面
  - 集成语音输入功能
  - 支持离线模式
  - 智能解析语音识别结果（支持"3.5 公斤"、"三点五 kg"等）
  - 显示网络状态和待同步数据
  - 语音输入技巧提示

#### 集成与优化
- `src/pages/pet-detail/pet-detail.vue`: 宠物详情页集成新体重记录页面
  - 体重 Tab 按钮更新为"⚖️ 添加体重记录 🎤"
  - 移除旧的弹窗输入方式
  - 跳转到新页面获得更好体验
- `src/pages.json`: 添加新页面路由

#### 文档
- `docs/offline-voice-guide.md`: 离线模式与语音输入使用指南
  - 功能概述和使用指南
  - 技术实现说明
  - 平台差异说明
  - 常见问题解答
  - 后续优化方向

#### 改进
- 离线体验提升：无网络时数据不丢失
- 输入效率提升：语音输入更快捷
- 用户体验优化：实时网络状态提示

---

---

## [1.0.0-alpha.4] - 2026-03-04

### Removed - 移除 uview-plus

#### 变更
- 移除 uview-plus 依赖（SCSS 变量/混合兼容性问题）
- 使用 uni-app 内置组件（view, text, input, button 等）
- 添加全局通用样式类

#### 改进
- H5 和小程序兼容性提升
- 减少依赖体积
- 避免 SCSS 编译错误

---

## [1.0.0-alpha.5] - 2026-03-04

### Changed - 所有页面原生组件化

#### 变更
- index 页面：移除 u-button/u-loading，使用原生 button 和 CSS 动画
- pet-detail 页面：移除 u-button，使用原生组件
- records 页面：移除所有 uview-plus 组件

#### 改进
- 统一使用 uni-app 内置组件
- 添加可爱的空状态 emoji（🐾、🚧）
- 添加 CSS 加载动画（⏳ 旋转）
- 全平台兼容性更好

---

## [1.0.0-alpha.6] - 2026-03-04

### Added - 宠物创建功能

#### 新功能
- `pages/add-pet/add-pet.vue`: 添加宠物表单页面
- 支持选择物种（🐱 猫咪/🐶 狗狗）
- 支持选择性别（公/母/未知）
- 支持输入品种、毛色、备注
- 支持选择出生日期（日期选择器）
- 对接 pet-create 云函数

#### 改进
- 首页添加按钮跳转到新页面
- 表单验证和错误提示
- 提交成功后自动返回列表

---

## [1.0.0-alpha.7] - 2026-03-04

### Added - 提醒功能 UI

#### 新功能
- `pages/reminders/reminders.vue`: 提醒设置页面
- 支持 4 类提醒：💊 驱虫、💉 疫苗、⚖️ 称重、🎂 生日
- 每类提醒可独立开关
- 可设置提醒周期/提前时间

#### 改进
- 宠物详情页添加提醒展示框
- 驱虫/疫苗 Tab 显示下次提醒日期
- 粮食 Tab 显示当前粮食信息
- 添加温馨提示说明

---

## [1.0.0-alpha.8] - 2026-03-04

### Added - 媒体文件上传功能

#### 新功能
- `components/MediaUploader.vue`: 通用媒体上传组件
- 支持图片上传（多图选择）
- 支持 PDF/Word/Excel 文件上传（H5 端）
- 支持视频上传
- 文件预览和删除功能

#### 改进
- 集成到健康记录表单
- 支持症状类型选择（呕吐/拉稀/食欲不振等）
- 适配 H5 和小程序端

---

## [1.0.0-alpha.9] - 2026-03-04

### Added - 健康记录功能完善

#### 新功能
- 健康记录症状选择（呕吐/拉稀/食欲不振/精神不佳/皮肤问题/其他）
- 支持添加照片附件（最多 3 张）
- 文件上传到 uniCloud 存储
- 对接 health-record 云函数

#### 改进
- 健康记录状态管理（观察中/治疗中/已恢复）
- 自动记录时间戳

---

## [1.0.0-alpha.10] - 2026-03-04

### Added - 宠物编辑功能

#### 新功能
- `pages/edit-pet/edit-pet.vue`: 宠物编辑页面
- 支持修改头像（点击上传）
- 支持修改名字、品种、性别、毛色
- 支持修改出生日期
- 支持绝育信息编辑（绝育日期、医院）
- 支持备注修改

#### 改进
- 宠物详情页添加编辑按钮（✏️）
- 对接 pet-update 云函数
- 头像自动上传到 uniCloud

---

## [1.0.0-alpha.11] - 2026-03-04

### Added - 自动化测试和 GitHub Actions

#### 新功能
- Jest 单元测试框架
- 5 个测试套件（宠物/体重/健康/提醒/媒体）
- GitHub Actions CI/CD 工作流
- 自动化构建和测试

#### 改进
- 多 Node 版本支持（18.x/20.x）
- 自动构建 H5 和小程序
- 构建产物自动上传
- 支持 Release 自动发布

#### 测试脚本
- `npm run test:unit` - 运行单元测试
- `npm run test:coverage` - 生成覆盖率报告

---

---

## [1.0.0-alpha.3] - 2026-03-04

### Added - 体重曲线图

#### 新功能
- `WeightChart` 组件：基于 echarts 的体重变化趋势图
- 支持手势缩放、左右滑动
- 自动渐变填充区域
- 数据点标记

#### 功能完善
- 体重记录添加（对接 weight-record 云函数）
- 体重记录删除
- 记录列表优化（显示备注、删除按钮）

#### UI 改进
- 体重 Tab 重构（图表 + 列表）
- 卡片式记录展示
- 更好的交互反馈

---

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
