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
/* 每个页面公共 css */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 通用样式 */
.container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
}

.btn-secondary {
  background: #fff;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
}
</style>
