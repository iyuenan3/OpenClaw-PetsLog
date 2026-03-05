# PetsLog UI 重设计计划

**灵感来源**: CareerCompass (https://github.com/arsh342/careercompass)  
**设计风格**: 现代简约 + 渐变色彩 + 流畅动画  
**完成日期**: 2026-03-06

---

## 🎨 设计理念

### 核心原则
1. **简洁直观** - 减少视觉噪音，突出核心功能
2. **渐变色彩** - 使用现代渐变色提升视觉吸引力
3. **卡片布局** - 模块化设计，易于维护
4. **流畅动画** - 微交互提升用户体验
5. **数据可视化** - 图表展示宠物健康趋势

---

## 🎯 UI 改进清单

### 1. 配色方案优化

**当前配色**:
```scss
primary: #667eea → #764ba2 (紫色渐变)
background: #f5f5f5
card: #ffffff
```

**新配色方案** (参考 CareerCompass):
```scss
// 主色调 - 蓝绿渐变
primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

// 辅助色
secondary: #f093fb → #f5576c (粉红渐变)
accent: #4facfe → #00f2fe (蓝色渐变)
success: #43e97b → #38f9d7 (绿色渐变)
warning: #fa709a → #fee140 (橙色渐变)

// 中性色
background: #f8fafc
surface: #ffffff
text-primary: #1e293b
text-secondary: #64748b
border: #e2e8f0
```

---

### 2. 组件重新设计

#### 2.1 宠物卡片 (Pet Card)

**当前设计**:
```
┌─────────────────────────┐
│ [头像] 小葵             │
│         西伯利亚猫      │
│         6 岁 10 个月      │
│                      ›  │
└─────────────────────────┘
```

**新设计** (带渐变和阴影):
```
┌─────────────────────────────────┐
│  ┌─────────┐                    │
│  │ [头像]  │  小葵          ⋮   │
│  │ 渐变框  │  西伯利亚猫        │
│  └─────────┘  6 岁 10 个月 • 公   │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⚖️ 5.2kg  💊 已驱虫  💉 已疫苗  │
└─────────────────────────────────┘
```

**特性**:
- 头像带渐变边框
- 右上角更多操作按钮
- 底部状态标签
- 悬浮阴影效果
- 点击涟漪动画

---

#### 2.2 记录卡片 (Record Card)

**新设计**:
```
┌─────────────────────────────────┐
│  🏥 健康记录                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  症状：呕吐/拉稀                │
│  观察：今天拉了 3 次...          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📎 2 张照片              │   │
│  └─────────────────────────┘   │
│                                 │
│  2026-03-05 12:30    [🗑️]     │
└─────────────────────────────────┘
```

---

#### 2.3 数据仪表盘 (Dashboard)

**新增功能** - 宠物健康概览:
```
┌─────────────────────────────────┐
│  📊 健康概览                    │
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │   8   │ │   3   │ │   2   │ │
│  │ 宠物  │ │ 待驱虫│ │ 待疫苗│ │
│  └───────┘ └───────┘ └───────┘ │
│                                 │
│  ┌─────────────────────────┐   │
│  │  体重趋势图 (echarts)   │   │
│  │  📈                     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### 3. 页面布局优化

#### 3.1 首页 (宠物列表)

**新布局**:
```
┌─────────────────────────────────┐
│  🐾 PetsLog           [头像] 👤│
│  我的宠物             [+ 添加] │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │卡片 │ │卡片 │ │卡片 │      │
│  └─────┘ └─────┘ └─────┘      │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │卡片 │ │卡片 │ │卡片 │      │
│  └─────┘ └─────┘ └─────┘      │
└─────────────────────────────────┘
```

**改进点**:
- 顶部导航栏（渐变背景）
- 网格布局（2-3 列）
- 卡片悬浮效果
- 快速添加按钮

---

#### 3.2 宠物详情页

**新布局**:
```
┌─────────────────────────────────┐
│  ← 返回         小葵       [✏️] │
│                                 │
│  ┌───────────────────────────┐ │
│  │      [大头像]             │ │
│  │   小葵 • 西伯利亚猫       │ │
│  │   6 岁 10 个月 • 公         │ │
│  └───────────────────────────┘ │
│                                 │
│  [概览] [体重] [健康] [粮食]... │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  内容区域                       │
│                                 │
└─────────────────────────────────┘
```

**改进点**:
- 大头像卡片（渐变边框）
- 可滚动 Tab 栏
- Tab 切换动画
- 内容区域卡片化

---

### 4. 动画效果

#### 4.1 页面过渡动画
```scss
// 页面进入
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

// 页面离开
.page-exit {
  opacity: 1;
}
.page-exit-active {
  opacity: 0;
  transition: all 0.2s ease;
}
```

#### 4.2 卡片悬浮动画
```scss
.pet-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
  }
  
  &:active {
    transform: scale(0.98);
  }
}
```

#### 4.3 按钮点击涟漪
```scss
.btn-ripple {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
  }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

### 5. 图标系统

**使用 Lucide React 风格图标**:
- 线条简洁
- 统一风格
- 支持渐变填充

**图标映射**:
```
🐾 宠物 → Paw
⚖️ 体重 → Scale
💊 驱虫 → Pill
💉 疫苗 → Syringe
🏥 健康 → Heart
🍖 粮食 → Bone
📊 统计 → BarChart
⚙️ 设置 → Settings
```

---

## 📦 实施计划

### 阶段 1: 基础样式重构 (2-3 小时)
- [ ] 创建新的配色方案
- [ ] 更新全局样式变量
- [ ] 优化字体和排版

### 阶段 2: 组件重构 (4-6 小时)
- [ ] 重新设计宠物卡片
- [ ] 重新设计记录卡片
- [ ] 添加动画效果
- [ ] 优化按钮样式

### 阶段 3: 页面重构 (4-6 小时)
- [ ] 首页网格布局
- [ ] 详情页大头像
- [ ] Tab 切换动画
- [ ] 加载骨架屏

### 阶段 4: 数据可视化 (3-4 小时)
- [ ] 健康概览仪表盘
- [ ] 体重趋势图优化
- [ ] 统计卡片设计

### 阶段 5: 细节优化 (2-3 小时)
- [ ] 微交互动画
- [ ] 响应式适配
- [ ] 性能优化

**总预计工时**: 15-22 小时

---

## 🎯 预期效果

### 视觉提升
- ✅ 现代化渐变设计
- ✅ 流畅动画效果
- ✅ 统一视觉语言
- ✅ 专业数据展示

### 用户体验
- ✅ 更直观的导航
- ✅ 更快的加载感知
- ✅ 更好的反馈
- ✅ 更易用的操作

### 技术优势
- ✅ 可复用组件库
- ✅ 易于维护
- ✅ 性能优化
- ✅ 响应式支持

---

## 💡 快速开始

### 1. 创建新的样式变量
```scss
// src/styles/variables.scss
:root {
  // 渐变色
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  
  // 中性色
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  
  // 阴影
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

### 2. 更新宠物卡片
```vue
<template>
  <view class="pet-card" @click="goToDetail">
    <view class="avatar-wrapper">
      <image class="avatar" :src="pet.avatar" />
    </view>
    <view class="pet-info">
      <text class="pet-name">{{ pet.name }}</text>
      <text class="pet-breed">{{ pet.breed }}</text>
      <view class="pet-meta">
        <text>{{ pet.age }}</text>
        <text>•</text>
        <text>{{ pet.gender === 'male' ? '公' : '母' }}</text>
      </view>
    </view>
    <text class="more-btn">⋮</text>
  </view>
</template>

<style lang="scss" scoped>
.pet-card {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }
  
  .avatar-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    padding: 3px;
    background: var(--gradient-primary);
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #fff;
    }
  }
  
  .pet-info {
    flex: 1;
    margin-left: 12px;
    
    .pet-name {
      font-size: 18px;
      font-weight: bold;
      color: var(--text-primary);
    }
    
    .pet-breed {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    
    .pet-meta {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
  
  .more-btn {
    font-size: 20px;
    color: var(--text-secondary);
    padding: 8px;
  }
}
</style>
```

---

**状态**: ⏳ 等待用户确认开始  
**优先级**: 中（可选优化）  
**预计开始**: 用户确认后

---

*文档创建时间*: 2026-03-06  
*灵感来源*: CareerCompass UI  
*设计师*: AI Assistant
