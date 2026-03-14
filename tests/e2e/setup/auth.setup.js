// @ts-check
const { test: setup, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 全局认证设置 - 创建一个测试用户并保存登录状态
setup('authenticate as test user', async ({ page }) => {
  console.log('🔐 开始认证流程...');
  
  // 确保认证目录存在
  const authDir = path.join(__dirname, '..', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`📁 创建认证目录：${authDir}`);
  }
  
  // 访问登录页面
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 截图调试
  await page.screenshot({ path: 'test-results/debug-login-page.png' });
  console.log('📸 已截图：test-results/debug-login-page.png');
  
  // uni-app 编译后 uni-input 内部有原生 input，使用 CSS 选择器找到它
  const usernameInput = page.locator('#username-input input');
  const passwordInput = page.locator('#password-input input');
  const loginBtn = page.locator('.btn-primary');
  const registerBtn = page.locator('.btn-info');
  
  console.log('📝 尝试直接登录...');
  
  // 使用 keyboard.type() 而不是 fill()，因为 uni-input 是自定义组件
  await usernameInput.click();
  await page.keyboard.type('testuser');
  
  await passwordInput.click();
  await page.keyboard.type('Test123456');
  
  await loginBtn.click();
  
  // 等待登录响应
  await page.waitForTimeout(5000);
  
  // 检查是否登录成功（URL 变化或出现首页元素）
  let currentUrl = page.url();
  console.log('📍 登录后 URL:', currentUrl);
  
  if (currentUrl.includes('/pages/index/index') || currentUrl.includes('/index')) {
    console.log('✅ 直接登录成功');
    await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
    return;
  }
  
  // 登录失败，尝试注册
  console.log('📝 登录失败，开始注册...');
  
  // 清空输入框并重新填写
  await usernameInput.click();
  await page.keyboard.down('Control');
  await page.keyboard.press('a');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('testuser');
  
  await passwordInput.click();
  await page.keyboard.down('Control');
  await page.keyboard.press('a');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('Test123456');
  
  await registerBtn.click();
  
  // 等待注册完成（注册成功后会自动调用登录）
  await page.waitForTimeout(8000);
  
  currentUrl = page.url();
  console.log('📍 注册后 URL:', currentUrl);
  
  // 如果还在登录页，尝试手动登录
  if (!currentUrl.includes('/pages/index/index') && !currentUrl.includes('/index')) {
    console.log('📝 注册后未自动登录，手动登录...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await usernameInput.click();
    await page.keyboard.type('testuser');
    
    await passwordInput.click();
    await page.keyboard.type('Test123456');
    
    await loginBtn.click();
    await page.waitForTimeout(5000);
  }
  
  // 保存登录状态
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  console.log('✅ 认证状态已保存到 tests/e2e/.auth/user.json');
});
