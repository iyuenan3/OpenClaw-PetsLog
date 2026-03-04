<template>
  <view class="container">
    <view class="logo">
      <text class="logo-text">🐾 PetsLog</text>
      <text class="logo-sub">宠物健康管理</text>
    </view>

    <view class="form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          type="text"
          v-model="form.username" 
          placeholder="请输入用户名"
          id="username-input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          type="password"
          v-model="form.password" 
          placeholder="请输入密码"
          id="password-input"
        />
      </view>

      <view class="buttons">
        <button class="btn-primary" @click="handleLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button class="btn-info" @click="handleRegister" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
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
    const token = uni.getStorageSync('token');
    if (token) {
      console.log('已登录，token:', token);
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
          uni.setStorageSync('token', res.result.data.token);
          uni.setStorageSync('user', JSON.stringify(res.result.data.user));
          
          uni.showToast({ title: '登录成功', icon: 'success' });
          
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
  display: flex;
  flex-direction: column;
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
  flex: 1;
}

.form-item {
  margin-bottom: 20px;
  position: relative;
  
  .label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  .input {
    width: 100%;
    height: 44px;
    padding: 0 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    background-color: #fff;
    color: #333;
    
    &:focus {
      border-color: #667eea;
      outline: none;
    }
  }
}

.buttons {
  margin-top: 30px;
  
  button {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    margin-bottom: 15px;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  .btn-info {
    background: #fff;
    color: #667eea;
    border: 2px solid #667eea !important;
  }
}
</style>
