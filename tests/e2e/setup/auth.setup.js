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
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 截图调试
  await page.screenshot({ path: 'test-results/debug-login-page.png' });
  console.log('📸 已截图：test-results/debug-login-page.png');
  
  // 使用更可靠的选择器策略
  const usernameInput = page.getByPlaceholder(/用户名|账号|手机号|请输入用户名/).or(
    page.locator('input[type="text"]').first()
  );
  const passwordInput = page.getByPlaceholder(/密码|请输入密码/).or(
    page.locator('input[type="password"]').first()
  );
  
  // 登录按钮
  const loginBtn = page.getByRole('button', { name: /登录|登录/ }).or(
    page.locator('button:has-text("登录")').or(page.locator('.btn-primary')).first()
  );
  const registerBtn = page.getByRole('button', { name: /注册|注册账号/ }).or(
    page.locator('button:has-text("注册")').or(page.locator('.btn-info')).first()
  );
  
  console.log('⏳ 尝试填写用户名...');
  
  // 使用 fill 而不是 type（更可靠）
  await usernameInput.fill('testuser');
  await passwordInput.fill('Test123456');
  
  console.log('⏳ 点击登录按钮...');
  await loginBtn.click();
  
  // 等待登录结果 - 使用 URL 变化或页面元素判断
  try {
    await page.waitForURL(/\/pages\/index\/index/, { timeout: 10000 });
    console.log('✅ 用户已存在，直接登录成功');
    await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
    return;
  } catch (e) {
    console.log('⏳ 登录超时，可能用户不存在，尝试注册...');
  }
  
  // 登录失败，尝试注册
  console.log('⏳ 开始注册流程...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // 点击注册按钮
  await registerBtn.click();
  await page.waitForTimeout(1000);
  
  // 填写注册信息
  await usernameInput.fill('testuser');
  await passwordInput.fill('Test123456');
  
  console.log('⏳ 点击注册按钮...');
  await registerBtn.click();
  
  // 等待注册完成
  try {
    await page.waitForURL(/\/pages\/index\/index/, { timeout: 10000 });
    console.log('✅ 注册成功并已自动登录');
  } catch (e) {
    // 注册后可能需要手动登录
    console.log('⏳ 注册完成，手动登录...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('Test123456');
    
    console.log('⏳ 点击登录按钮...');
    await loginBtn.click();
    await page.waitForTimeout(5000);
  }
  
  // 保存登录状态
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  console.log('✅ 认证状态已保存到 tests/e2e/.auth/user.json');
});
