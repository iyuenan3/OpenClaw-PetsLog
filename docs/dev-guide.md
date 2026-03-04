# PetsLog 开发文档

## 📁 项目结构

```
OpenClaw-PetsLog/
├── uniCloud-aliyun/
│   ├── cloudfunctions/      # 云函数
│   │   ├── login/           # 用户登录
│   │   ├── register/        # 用户注册
│   │   ├── pet-list/        # 获取宠物列表
│   │   ├── pet-create/      # 创建宠物
│   │   ├── pet-update/      # 更新宠物
│   │   ├── pet-delete/      # 删除宠物
│   │   ├── weight-record/   # 体重记录
│   │   ├── deworming-record/# 驱虫记录
│   │   ├── vaccine-record/  # 疫苗记录
│   │   ├── health-record/   # 健康记录
│   │   └── food-record/     # 粮食记录
│   ├── database/            # 数据库 Schema
│   └── config.json          # 空间配置
├── src/
│   ├── pages/               # 页面
│   ├── App.vue              # 应用配置
│   ├── main.js              # 入口文件
│   └── manifest.json        # 应用配置
├── docs/
│   ├── conversations/       # 交流记录
│   └── dev-guide.md         # 本文档
└── package.json
```

## 🔧 开发环境

### 前置要求

- Node.js >= 16
- npm >= 8
- HBuilderX（可选，用于小程序调试）
- 微信开发者工具

### 安装依赖

```bash
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

## ☁️ uniCloud 配置

### 空间信息

- **服务商**: 阿里云
- **空间 ID**: `mp-a387d411-c277-422a-a633-61aedbac1f45`
- **空间名称**: `openclaw-petslog-ns`

### 配置步骤

1. 在 HBuilderX 中打开项目
2. 右键 `uniCloud-aliyun` 目录
3. 选择 "关联云服务空间或项目"
4. 选择已有空间或创建新空间

### 上传云函数

1. 在 HBuilderX 中右键 `uniCloud-aliyun/cloudfunctions/xxx`
2. 选择 "上传并部署：云端安装依赖"

### 创建数据库集合

1. 在 HBuilderX 中右键 `uniCloud-aliyun/database`
2. 选择 "上传 DB Schema"
3. 在 uniCloud 控制台验证集合创建

## 📡 API 文档

### 用户相关

#### 登录 (`login`)

```javascript
const res = await uniCloud.callFunction({
  name: 'login',
  data: {
    username: 'test',
    password: '123456'
  }
});
// 返回：{ code: 200, message: '登录成功', data: { token, user } }
```

#### 注册 (`register`)

```javascript
const res = await uniCloud.callFunction({
  name: 'register',
  data: {
    username: 'test',
    password: '123456',
    familyId: 'xxx' // 可选
  }
});
// 返回：{ code: 201, message: '注册成功', data: { userId, familyId } }
```

### 宠物相关

#### 获取宠物列表 (`pet-list`)

```javascript
const res = await uniCloud.callFunction({
  name: 'pet-list',
  data: { familyId: 'xxx' }
});
// 返回：{ code: 200, data: { pets: [...] } }
```

#### 创建宠物 (`pet-create`)

```javascript
const res = await uniCloud.callFunction({
  name: 'pet-create',
  data: {
    familyId: 'xxx',
    name: '小葵',
    species: 'cat',
    breed: '西伯利亚猫',
    gender: 'female',
    birthday: Date.now()
  }
});
```

### 记录相关

所有记录类云函数使用统一的 action 参数：

```javascript
// 创建记录
await uniCloud.callFunction({
  name: 'weight-record',
  data: {
    action: 'create',
    petId: 'xxx',
    weight: 5.2
  }
});

// 获取记录列表
await uniCloud.callFunction({
  name: 'weight-record',
  data: {
    action: 'list',
    petId: 'xxx'
  }
});

// 更新记录
await uniCloud.callFunction({
  name: 'weight-record',
  data: {
    action: 'update',
    recordId: 'xxx',
    weight: 5.3
  }
});

// 删除记录
await uniCloud.callFunction({
  name: 'weight-record',
  data: {
    action: 'delete',
    recordId: 'xxx'
  }
});
```

可用记录类型：
- `weight-record`: 体重记录
- `deworming-record`: 驱虫记录
- `vaccine-record`: 疫苗记录
- `health-record`: 健康记录
- `food-record`: 粮食记录

## 🎨 UI 组件

### uview-plus

已安装并配置 uview-plus UI 组件库。

```vue
<template>
  <u-button type="primary" text="按钮" />
  <u-input v-model="value" placeholder="输入框" />
  <u-form-item label="标签" prop="value">
    <u-input v-model="form.value" />
  </u-form-item>
</template>

<script>
export default {
  data() {
    return {
      value: '',
      form: { value: '' }
    }
  }
}
</script>
```

### echarts

用于体重曲线图等图表展示。

```vue
<template>
  <view style="width: 100%; height: 300px;">
    <echarts :option="option" />
  </view>
</template>
```

## 📝 开发规范

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响代码运行）
refactor: 重构（既不是新增功能，也不是修改 bug）
chore: 构建过程或辅助工具变动
```

### 代码风格

- 使用 2 空格缩进
- 字符串使用单引号
- 行末不加分号
- 使用 ES6+ 语法

## 🔐 敏感信息

以下信息**禁止**提交到 GitHub：

- uniCloud clientSecret
- Notion API Key
- 任何密码
- 个人账号信息

使用环境变量或本地配置文件管理敏感信息。

## 📄 版本发布

### 发布流程

1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 版本号
3. 提交代码
4. 打 Git 标签：`git tag v1.0.0`
5. 推送标签：`git push origin v1.0.0`
6. 在 GitHub 创建 Release

## 🐛 常见问题

### Q: 云函数调用失败

检查：
1. 云函数是否已上传并部署
2. 权限配置是否正确
3. 网络请求域名是否已配置

### Q: 小程序预览失败

检查：
1. AppID 是否配置正确
2. uniCloud 空间是否已关联
3. 域名是否在白名单中

## 📞 联系方式

项目维护者：Maxwell Li
Email: limaxwell93@gmail.com
