<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/* 每个页面公共 css - 使用 CSS 变量 */
page {
  background-color: #f8fafc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

/* 通用样式 */
.container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 卡片样式 */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 主按钮 */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 10px 15px rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 次按钮 */
.btn-secondary {
  background: #ffffff;
  color: #1e293b;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:active {
  background: #f1f5f9;
  transform: scale(0.98);
}

/* 文本按钮 */
.btn-text {
  background: transparent;
  color: #667eea;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-text:active {
  background: rgba(102, 126, 234, 0.1);
}
</style>
