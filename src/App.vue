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

<style lang="scss">
@import './styles/variables.scss';

/* 每个页面公共 css */
page {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-md);
  line-height: 1.5;
}

/* 通用样式 */
.container {
  padding: var(--spacing-xl);
  min-height: 100vh;
  box-sizing: border-box;
}

/* 卡片样式 */
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-slow);
  
  &:active {
    box-shadow: var(--shadow-lg);
  }
}

/* 主按钮 */
.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-primary);
  transition: all var(--transition-base);
  
  &:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* 次按钮 */
.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 2px solid #667eea;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
  
  &:active {
    background: var(--bg-secondary);
    transform: scale(0.98);
  }
}

/* 文本按钮 */
.btn-text {
  background: transparent;
  color: #667eea;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
  
  &:active {
    background: rgba(102, 126, 234, 0.1);
  }
}
</style>
