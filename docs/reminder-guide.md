# 提醒功能开发指南

## 📋 功能概述

PetsLog 提醒系统支持四种类型的提醒：
- 💊 **驱虫提醒**：体内/体外驱虫到期提醒
- 💉 **疫苗提醒**：疫苗接种/加强针提醒
- 🎂 **生日提醒**：宠物生日自动提醒
- ⚖️ **称重提醒**：每月 1 号自动提醒称重

---

## 🏗️ 系统架构

### 云函数

#### 1. `reminder-manage` - 提醒管理
**位置**: `uniCloud-aliyun/cloudfunctions/reminder-manage/index.js`

**功能**:
- 获取提醒列表（支持分类筛选）
- 标记提醒为已完成
- 启用/禁用提醒
- 删除提醒
- 更新提醒设置

**调用示例**:
```javascript
// 获取提醒列表
const res = await uniCloud.callFunction({
  name: 'reminder-manage',
  data: {
    action: 'list',
    familyId: 'xxx'
  }
})

// 标记完成
await uniCloud.callFunction({
  name: 'reminder-manage',
  data: {
    action: 'done',
    reminderId: 'xxx',
    data: {
      nextReminder: Date.now() + 90 * 24 * 60 * 60 * 1000,
      remindInterval: true
    }
  }
})

// 启用/禁用提醒
await uniCloud.callFunction({
  name: 'reminder-manage',
  data: {
    action: 'toggle',
    reminderId: 'xxx',
    data: { enabled: false }
  }
})
```

**返回数据结构**:
```javascript
{
  code: 200,
  message: '获取成功',
  data: {
    reminders: [
      {
        _id: 'xxx',
        type: 'deworming', // deworming|vaccine|birthday|weight
        icon: '💊',
        title: '小葵 - 体内驱虫',
        desc: '福来恩 体外驱虫',
        petId: 'xxx',
        petName: '小葵',
        time: '03-15 09:00',
        daysLeft: 3,
        urgency: 'soon', // urgent|soon|normal
        timestamp: 1234567890
      }
    ],
    total: 5,
    byType: {
      deworming: 2,
      vaccine: 1,
      birthday: 1,
      weight: 1
    }
  }
}
```

---

#### 2. `daily-reminder` - 定时任务
**位置**: `uniCloud-aliyun/cloudfunctions/daily-reminder/index.js`

**触发器**: 每天上午 9:00 执行 (`0 0 9 * * *`)

**功能**:
- 检查当天到期的驱虫提醒
- 检查当天到期的疫苗提醒
- 检查当天生日的宠物
- 每月 1 号检查称重提醒
- 生成推送通知（需配置推送服务）

**触发器配置**:
```json
{
  "triggers": [
    {
      "name": "dailyReminderTrigger",
      "type": "timer",
      "config": "0 0 9 * * *"
    }
  ]
}
```

---

#### 3. `check-reminders` - 提醒检查（兼容旧版）
**位置**: `uniCloud-aliyun/cloudfunctions/check-reminders/index.js`

**功能**: 检查未来 N 天内的提醒（用于手动刷新）

---

### 前端页面

#### 提醒中心页面
**位置**: `src/pages/reminders/reminders.vue`

**功能**:
- 分类 Tab（全部/驱虫/疫苗/生日/称重）
- 提醒列表展示（按紧急程度排序）
- 标记完成操作
- 跳转到提醒设置

**UI 特性**:
- 紧急程度标识（红色/橙色/绿色）
- 剩余天数显示
- 宠物信息展示
- 空状态提示

---

## 📱 使用流程

### 1. 查看提醒
1. 打开应用 → 点击"提醒中心"
2. 查看所有待处理提醒
3. 可通过 Tab 筛选特定类型

### 2. 标记完成
1. 点击提醒右侧的"✓"按钮
2. 确认完成操作
3. 系统自动计算下一次提醒时间
   - 驱虫：+90 天
   - 疫苗：+365 天
   - 生日：明年今日
   - 称重：下月 1 号

### 3. 设置提醒
1. 进入提醒设置页面
2. 启用/禁用各类提醒
3. 设置提醒提前时间（默认 7 天）
4. 设置通知时间（默认 9:00 AM）

---

## 🔧 部署步骤

### 1. 上传云函数
```bash
# 在 HBuilderX 中操作
# 右键 uniCloud-aliyun/cloudfunctions 目录
# 选择"上传所有云函数"
```

或单独上传：
```bash
# 右键 reminder-manage 目录 → 上传并部署：云端安装依赖
# 右键 daily-reminder 目录 → 上传并部署：云端安装依赖
```

### 2. 配置定时任务
1. 上传 `daily-reminder` 云函数
2. 系统自动读取 `triggers.json`
3. 在 uniCloud 控制台验证触发器配置

### 3. 配置推送服务（可选）

#### 方案 A: uniPush
```javascript
// 在 daily-reminder 中添加
await uniPush.send({
  userid: userId,
  title: '驱虫提醒',
  content: message,
  payload: JSON.stringify(data)
})
```

#### 方案 B: 微信小程序订阅消息
```javascript
// 需要用户订阅
await uni.requestSubscribeMessage({
  tmplIds: ['xxx'],
  success: (res) => {
    if (res[tmplIds[0]] === 'accept') {
      // 保存订阅状态，后续可发送模板消息
    }
  }
})
```

### 4. 数据库 Schema 更新

确保以下集合包含提醒相关字段：

#### `deworming_records`
```json
{
  "remindEnabled": { "type": "boolean", "required": false },
  "nextReminder": { "type": "timestamp", "required": false }
}
```

#### `vaccine_records`
```json
{
  "remindEnabled": { "type": "boolean", "required": false },
  "nextReminder": { "type": "timestamp", "required": false }
}
```

#### `families`
```json
{
  "reminderSettings": {
    "type": "object",
    "required": false,
    "properties": {
      "dewormingEnabled": "boolean",
      "vaccineEnabled": "boolean",
      "birthdayEnabled": "boolean",
      "weightEnabled": "boolean",
      "notifyTime": "string"
    }
  }
}
```

---

## 🎯 提醒规则

### 驱虫提醒
- **触发条件**: `nextReminder` 在未来 30 天内
- **紧急程度**:
  - 🔴 紧急：≤ 1 天
  - 🟠 即将到期：2-3 天
  - 🟢 正常：4-30 天
- **下次提醒**: 完成后 +90 天（3 个月）

### 疫苗提醒
- **触发条件**: `nextReminder` 在未来 30 天内
- **紧急程度**: 同驱虫
- **下次提醒**: 完成后 +365 天（1 年）

### 生日提醒
- **触发条件**: 未来 30 天内生日
- **当天提醒**: 生日当天发送祝福
- **下次提醒**: 自动计算明年生日

### 称重提醒
- **触发条件**: 每月 1 号
- **提醒对象**: 所有宠物
- **下次提醒**: 下月 1 号

---

## 🐛 常见问题

### Q: 定时任务不执行？
- 检查云函数是否上传成功
- 验证 `triggers.json` 配置
- 在 uniCloud 控制台查看定时任务状态
- 检查云函数日志

### Q: 提醒不显示？
- 确认 `familyId` 正确
- 检查数据库中是否有相关记录
- 验证 `remindEnabled` 字段为 `true`
- 确认 `nextReminder` 时间范围

### Q: 如何测试定时任务？
```javascript
// 手动触发云函数
const res = await uniCloud.callFunction({
  name: 'daily-reminder',
  data: {}
})
console.log(res)
```

### Q: 推送通知如何配置？
- 参考 uniCloud 官方文档配置 uniPush
- 微信小程序需配置订阅消息模板
- H5 端可使用浏览器 Notification API

---

## 🚀 优化建议

### 性能优化
- [ ] 添加缓存机制（Redis）
- [ ] 批量查询优化（减少数据库请求）
- [ ] 分页加载提醒列表

### 功能增强
- [ ] 自定义提醒间隔
- [ ] 提醒分组（按宠物）
- [ ] 提醒历史记录
- [ ] 提醒统计报表

### 用户体验
- [ ] 推送通知点击跳转
- [ ] 提醒详情弹窗
- [ ] 批量标记完成
- [ ] 提醒免打扰时段

---

## 📝 更新日志

### 2026-03-07
- ✅ 创建 `reminder-manage` 云函数
- ✅ 创建 `daily-reminder` 定时任务
- ✅ 更新提醒中心页面
- ✅ 添加提醒管理功能（完成/启用/禁用）
- ✅ 添加紧急程度标识
- ✅ 添加定时任务触发器配置

---

## 🔗 相关链接
- [uniCloud 定时任务文档](https://uniapp.dcloud.net.cn/uniCloud/schedule.html)
- [uniPush 推送服务](https://uniapp.dcloud.net.cn/uniCloud/uni-push.html)
- [微信小程序订阅消息](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)
