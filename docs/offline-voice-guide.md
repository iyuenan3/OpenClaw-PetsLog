# 离线模式与语音输入功能

## 📋 功能概述

### 离线模式 📴
- **自动检测网络状态**：实时监听 WiFi/4G/5G 网络变化
- **离线数据缓存**：无网络时数据自动保存到本地
- **自动同步**：网络恢复后一键同步所有离线数据
- **状态提示**：页面顶部显示当前网络状态

### 语音输入 🎤
- **跨平台支持**：
  - H5 端：使用 Web Speech API
  - 微信小程序：使用微信录音功能
- **智能识别**：自动提取体重数字（支持"3.5 公斤"、"三点五 kg"等）
- **便捷操作**：按住说话，松开发送

---

## 🚀 使用指南

### 1. 添加体重记录（带语音输入）

#### 入口
- 宠物详情页 → 体重 Tab → 点击"⚖️ 添加体重记录 🎤"按钮

#### 操作步骤
1. **选择宠物**：从下拉列表选择要记录的宠物
2. **输入体重**：
   - **手动输入**：直接在输入框填写数字
   - **语音输入**：按住"🎤 按住说体重"按钮，说"3.5 公斤"或"3.5kg"
3. **选择日期**：默认为今天
4. **添加备注**（可选）：例如"刚吃完早饭"、"运动后"等
5. **保存**：
   - 在线时：直接保存到云端
   - 离线时：保存到本地缓存，显示"📴 保存到离线缓存"

#### 语音输入技巧
- ✅ 说数字即可："3.5"、"三点五"
- ✅ 带单位："3.5 公斤"、"3.5kg"、"三点五千克"
- ✅ 自然语言："体重三点五公斤"
- ❌ 避免过长句子，保持简洁

---

### 2. 离线数据同步

#### 自动检测
- 系统每 5 秒自动检测网络状态
- 页面顶部显示当前网络状态（📶 WiFi / 📴 离线模式）

#### 手动同步
1. 进入"添加体重记录"页面
2. 如果有待同步数据，会显示"🔄 同步离线数据 (N 条)"按钮
3. 点击按钮，等待同步完成

#### 同步策略
- 离线数据按时间顺序保存
- 网络恢复后批量同步
- 同步失败的数据会保留在缓存中

---

## 🛠️ 技术实现

### 文件结构

```
src/
├── utils/
│   ├── network.js           # 网络状态检测工具
│   └── offline-cache.js     # 离线缓存管理工具
├── components/
│   └── VoiceInput.vue       # 语音输入组件
└── pages/
    └── weight/
        └── add-weight.vue   # 体重记录页面（带语音输入）
```

### 核心 API

#### 网络状态检测 (`utils/network.js`)

```javascript
import { isNetworkConnected, getNetworkStatusText } from '@/utils/network'

// 检查是否联网
const isOnline = isNetworkConnected()

// 获取网络状态文本（用于显示）
const statusText = getNetworkStatusText() // "📶 WiFi" / "📴 离线模式"
```

#### 离线缓存 (`utils/offline-cache.js`)

```javascript
import { 
  addToOfflineCache, 
  syncOfflineCache,
  hasPendingSync,
  getCacheSize 
} from '@/utils/offline-cache'

// 添加数据到离线缓存
addToOfflineCache('weight-create', { petId, weight, date, note })

// 检查是否有待同步数据
const hasPending = hasPendingSync()
const count = getCacheSize()

// 同步离线数据到服务器
const result = await syncOfflineCache(async (type, data) => {
  if (type === 'weight-create') {
    await uniCloud.callFunction({
      name: 'weight-record',
      data: { action: 'create', ...data }
    })
  }
})
```

#### 语音输入组件 (`components/VoiceInput.vue`)

```vue
<voice-input
  :disabled="isRecording"
  hint="按住说体重"
  @result="onVoiceResult"
  @start="isRecording = true"
  @end="isRecording = false"
  @error="onVoiceError"
/>
```

事件说明：
- `@result`: 语音识别结果（H5 端返回文本，小程序端返回音频文件）
- `@start`: 开始录音
- `@end`: 结束录音
- `@error`: 识别错误

---

## 📱 平台差异

### H5 端
- ✅ Web Speech API 直接识别语音为文本
- ✅ 实时显示识别结果
- ⚠️ 需要浏览器支持（Chrome/Edge 支持较好）

### 微信小程序
- ✅ 支持录音功能
- ⚠️ 语音识别需要后端支持（当前版本返回音频文件）
- 📝 建议：录音后手动输入体重

---

## 🔧 配置说明

### 浏览器权限（H5 端）
使用语音输入需要麦克风权限：
- Chrome/Edge：首次使用会提示授权
- 如被拒绝，需在浏览器设置中重新开启

### 微信小程序配置
如需完整的语音识别功能，需要：
1. 在 `manifest.json` 中添加录音权限
2. 配置微信语音识别 API
3. 或使用第三方语音识别服务

---

## 🐛 常见问题

### Q: 语音输入没反应？
- 检查浏览器是否支持 Web Speech API
- 确认麦克风权限已开启
- 尝试使用 Chrome/Edge 浏览器

### Q: 离线数据会丢失吗？
- 不会，数据保存在本地存储（localStorage）
- 即使关闭浏览器/小程序，数据也会保留
- 建议尽快在网络恢复后同步

### Q: 最多能缓存多少条数据？
- 默认限制 100 条
- 超过后会自动删除最早的记录
- 建议及时同步

### Q: 语音识别不准确？
- 说话时保持环境安静
- 语速适中，吐字清晰
- 尽量使用简洁的表达（"3.5 公斤"）
- 识别错误可手动修改

---

## 🚧 后续优化方向

### 语音输入增强
- [ ] 支持更多记录类型的语音输入（健康记录、粮食记录等）
- [ ] 支持连续语音输入（多条记录）
- [ ] 集成讯飞/百度语音识别 API（小程序端）

### 离线模式增强
- [ ] 支持更多操作的离线缓存（编辑、删除等）
- [ ] 冲突检测与解决（本地与云端数据冲突）
- [ ] 离线数据导出/备份

### 用户体验
- [ ] 语音输入进度动画
- [ ] 离线数据同步进度条
- [ ] 网络状态变化实时提示

---

## 📝 更新日志

### 2026-03-07
- ✅ 添加网络状态检测工具
- ✅ 添加离线缓存管理工具
- ✅ 创建语音输入组件
- ✅ 创建体重记录页面（支持语音输入）
- ✅ 集成到宠物详情页

---

## 🔗 相关文档
- [开发指南](./dev-guide.md)
- [API 文档](./dev-guide.md#api-文档)
- [项目 README](../README.md)
