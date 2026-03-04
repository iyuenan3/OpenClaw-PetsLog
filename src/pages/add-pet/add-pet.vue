<template>
  <view class="container">
    <view class="header">
      <text class="title">🐾 添加宠物</text>
    </view>

    <view class="form">
      <view class="form-group">
        <text class="label">名字 *</text>
        <input 
          class="input" 
          type="text"
          v-model="form.name" 
          placeholder="请输入宠物名字"
          :adjust-position="false"
          :hold-keyboard="false"
        />
      </view>

      <view class="form-group">
        <text class="label">物种 *</text>
        <view class="radio-group">
          <view class="radio-item" :class="{ active: form.species === 'cat' }" @click="form.species = 'cat'">
            <text>🐱 猫咪</text>
          </view>
          <view class="radio-item" :class="{ active: form.species === 'dog' }" @click="form.species = 'dog'">
            <text>🐶 狗狗</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">品种</text>
        <input 
          class="input" 
          type="text"
          v-model="form.breed" 
          placeholder="例如：英短、美短、金毛"
          :adjust-position="false"
          :hold-keyboard="false"
        />
      </view>

      <view class="form-group">
        <text class="label">性别</text>
        <view class="radio-group">
          <view class="radio-item" :class="{ active: form.gender === 'male' }" @click="form.gender = 'male'">
            <text>♂ 公</text>
          </view>
          <view class="radio-item" :class="{ active: form.gender === 'female' }" @click="form.gender = 'female'">
            <text>♀ 母</text>
          </view>
          <view class="radio-item" :class="{ active: form.gender === 'unknown' }" @click="form.gender = 'unknown'">
            <text>未知</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">出生日期</text>
        <picker 
          mode="date" 
          :value="form.birthdayStr" 
          @change="onBirthdayChange"
          start="2010-01-01"
          :end="new Date().toISOString().split('T')[0]"
        >
          <view class="picker-input">
            <text>{{ form.birthdayStr || '请选择日期' }}</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">毛色</text>
        <input 
          class="input" 
          type="text"
          v-model="form.color" 
          placeholder="例如：金色、黑色、白色"
          :adjust-position="false"
          :hold-keyboard="false"
        />
      </view>

      <view class="form-group">
        <text class="label">备注</text>
        <textarea 
          class="textarea" 
          v-model="form.notes" 
          placeholder="性格、习惯、疾病史等"
          :adjust-position="false"
          :disable-default-padding="true"
        />
      </view>
    </view>

    <view class="buttons">
      <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
        {{ submitting ? '提交中...' : '创建宠物档案' }}
      </button>
      <button class="btn-cancel" @click="handleCancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        species: 'cat',
        breed: '',
        gender: 'unknown',
        birthday: 0,
        birthdayStr: '',
        color: '',
        notes: ''
      },
      submitting: false
    }
  },
  methods: {
    onBirthdayChange(e) {
      this.form.birthdayStr = e.detail.value;
      this.form.birthday = new Date(e.detail.value).getTime();
    },
    async handleSubmit() {
      if (!this.form.name) {
        uni.showToast({ title: '请输入宠物名字', icon: 'none' });
        return;
      }

      this.submitting = true;
      try {
        const userStr = uni.getStorageSync('user');
        const user = JSON.parse(userStr);
        
        const res = await uniCloud.callFunction({
          name: 'pet-create',
          data: {
            familyId: user.familyId,
            name: this.form.name,
            species: this.form.species,
            breed: this.form.breed,
            gender: this.form.gender,
            birthday: this.form.birthday,
            color: this.form.color,
            notes: this.form.notes
          }
        });
        
        this.submitting = false;
        
        if (res.result.code === 201) {
          uni.showToast({ title: '创建成功', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        this.submitting = false;
        console.error('创建宠物失败:', e);
        uni.showToast({ title: '创建失败，请稍后重试', icon: 'none' });
      }
    },
    handleCancel() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  margin-bottom: 20px;
  padding-top: 20px;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
}

.form {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  
  .label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    font-weight: bold;
  }
  
  .input, .textarea, .picker {
    width: 100%;
    height: 44px;
    padding: 0 15px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
    color: #333;
    position: relative;
    z-index: 10;
    
    &:focus {
      border-color: #667eea;
      outline: none;
    }
  }
  
  .textarea {
    height: 100px;
    padding: 12px 15px;
    resize: none;
  }
  
  .picker {
    color: #333;
    display: flex;
    align-items: center;
    height: 44px;
  }
}

.radio-group {
  display: flex;
  gap: 10px;
  
  .radio-item {
    flex: 1;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
    border: 2px solid transparent;
    
    &.active {
      background: rgba(102, 126, 234, 0.1);
      border-color: #667eea;
      color: #667eea;
    }
  }
}

.buttons {
  .btn-submit {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 14px;
    font-size: 16px;
    margin-bottom: 15px;
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  .btn-cancel {
    width: 100%;
    background: #fff;
    color: #666;
    border: 2px solid #ddd;
    border-radius: 10px;
    padding: 14px;
    font-size: 16px;
  }
}
</style>
