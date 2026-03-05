// @ts-check
const { test: setup, expect } = require('@playwright/test');

// 全局认证设置 - 创建一个测试用户并保存登录状态
setup('authenticate as test user', async ({ page }) => {
  console.log('🔐 开始认证流程...');
  
  // 访问登录页面
  await page.goto('/');
  
  // 等待页面加载完成，使用更可靠的等待方式
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 截图调试
  await page.screenshot({ path: 'test-results/debug-login-page.png' });
  console.log('📸 已截图：test-results/debug-login-page.png');
  
  // 尝试直接登录（如果用户已存在）
  // 使用更稳定的选择器：通过 id 或 label 定位
  const usernameInput = page.locator('#username-input').or(page.locator('input[type="text"]')).first();
  const passwordInput = page.locator('#password-input').or(page.locator('input[type="password"]')).first();
  const loginBtn = page.locator('button:has-text("登录")').or(page.locator('button').nth(0));
  
  console.log('⏳ 尝试填写用户名...');
  await usernameInput.fill('testuser');
  await passwordInput.fill('Test123456');
  await loginBtn.click();
  
  // 等待登录结果
  await page.waitForTimeout(3000);
  
  // 检查是否登录成功
  const currentUrl = page.url();
  console.log('📍 当前 URL:', currentUrl);
  
  if (currentUrl.includes('/pages/index/index')) {
    console.log('✅ 用户已存在，直接登录成功');
    await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
    return;
  }
  
  // 登录失败，尝试注册
  console.log('⏳ 登录失败，尝试注册新用户...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // 点击注册按钮
  const registerBtn = page.locator('button:has-text("注册")').or(page.locator('button').nth(1));
  await registerBtn.click();
  await page.waitForTimeout(1000);
  
  // 填写注册信息
  await usernameInput.fill('testuser');
  await passwordInput.fill('Test123456');
  
  // 注册只需要用户名和密码
  await registerBtn.click();
  
  // 等待注册完成
  await page.waitForTimeout(3000);
  
  // 检查注册后是否自动登录
  const afterRegisterUrl = page.url();
  console.log('📍 注册后 URL:', afterRegisterUrl);
  
  if (afterRegisterUrl.includes('/pages/index/index')) {
    console.log('✅ 注册成功并已自动登录');
  } else {
    // 需要手动登录
    console.log('⏳ 注册完成，手动登录...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('Test123456');
    await loginBtn.click();
    await page.waitForTimeout(3000);
  }
  
  // 保存登录状态
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  console.log('✅ 认证状态已保存到 tests/e2e/.auth/user.json');
});
