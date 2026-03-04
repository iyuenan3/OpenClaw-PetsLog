<template>
  <view class="container">
    <view class="logo">
      <text class="logo-text">🐾 PetsLog</text>
      <text class="logo-sub">宠物健康管理</text>
    </view>

    <view class="form">
      <u-form :model="form" ref="uForm">
        <u-form-item label="用户名" prop="username">
          <u-input v-model="form.username" placeholder="请输入用户名" />
        </u-form-item>
        
        <u-form-item label="密码" prop="password">
          <u-input v-model="form.password" type="password" placeholder="请输入密码" />
        </u-form-item>
      </u-form>

      <view class="buttons">
        <u-button type="primary" @click="handleLogin" text="登录" :loading="loading" />
        <u-button type="info" @click="handleRegister" text="注册" style="margin-top: 20px;" :loading="loading" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  onLoad() {
    // 检查是否已登录（从本地存储获取 token）
    const token = uni.getStorageSync('token');
    if (token) {
      console.log('已登录，token:', token);
      // TODO: 验证 token 有效性
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
        return;
      }

      this.loading = true;
      try {
        const res = await uniCloud.callFunction({
          name: 'login',
          data: this.form
        });

        this.loading = false;

        if (res.result.code === 200) {
          // 保存 token 和用户信息
          uni.setStorageSync('token', res.result.data.token);
          uni.setStorageSync('user', JSON.stringify(res.result.data.user));
          
          uni.showToast({ title: '登录成功', icon: 'success' });
          
          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' });
          }, 1000);
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        this.loading = false;
        console.error('登录失败:', e);
        uni.showToast({ title: '登录失败，请稍后重试', icon: 'none' });
      }
    },
    async handleRegister() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
        return;
      }

      this.loading = true;
      try {
        const res = await uniCloud.callFunction({
          name: 'register',
          data: this.form
        });

        this.loading = false;

        if (res.result.code === 201) {
          uni.showToast({ title: '注册成功', icon: 'success' });
          // 注册成功后自动登录
          this.handleLogin();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        this.loading = false;
        console.error('注册失败:', e);
        uni.showToast({ title: '注册失败，请稍后重试', icon: 'none' });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40px 30px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo {
  text-align: center;
  margin-bottom: 60px;
  margin-top: 80px;
  
  .logo-text {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    display: block;
  }
  
  .logo-sub {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10px;
    display: block;
  }
}

.form {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.buttons {
  margin-top: 30px;
}
</style>
