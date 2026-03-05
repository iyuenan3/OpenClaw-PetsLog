// @ts-check
const { test: setup, expect } = require('@playwright/test');

// 全局认证设置 - 创建一个测试用户并保存登录状态
setup('authenticate as test user', async ({ page }) => {
  console.log('🔐 开始认证流程...');
  
  // 访问登录页面
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // 尝试直接登录（如果用户已存在）
  await page.locator('input[placeholder="请输入用户名"]').fill('testuser');
  await page.locator('input[type="password"]').fill('Test123456');
  await page.locator('button:has-text("登录")').click();
  
  // 等待 3 秒看是否登录成功
  await page.waitForTimeout(3000);
  
  // 检查是否登录成功
  const currentUrl = page.url();
  if (currentUrl.includes('/pages/index/index')) {
    console.log('✅ 用户已存在，直接登录成功');
    await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
    return;
  }
  
  // 登录失败，尝试注册
  console.log('⏳ 登录失败，尝试注册新用户...');
  await page.goto('/');
  await page.waitForTimeout(500);
  
  // 点击注册按钮
  const registerBtn = page.locator('button:has-text("注册")');
  await expect(registerBtn).toBeVisible();
  await registerBtn.click();
  await page.waitForTimeout(500);
  
  // 填写注册信息
  await page.locator('input[placeholder="请输入用户名"]').fill('testuser');
  await page.locator('input[placeholder="请输入密码"]').fill('Test123456');
  await page.locator('input[placeholder="请再次输入密码"]').fill('Test123456');
  
  // 提交注册
  await page.locator('button:has-text("注册")').click();
  
  // 等待注册完成
  await page.waitForTimeout(3000);
  
  // 检查注册后是否自动登录
  const afterRegisterUrl = page.url();
  if (afterRegisterUrl.includes('/pages/index/index')) {
    console.log('✅ 注册成功并已自动登录');
  } else {
    // 需要手动登录
    console.log('⏳ 注册完成，手动登录...');
    await page.goto('/');
    await page.locator('input[placeholder="请输入用户名"]').fill('testuser');
    await page.locator('input[type="password"]').fill('Test123456');
    await page.locator('button:has-text("登录")').click();
    await page.waitForTimeout(3000);
  }
  
  // 保存登录状态
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  console.log('✅ 认证状态已保存到 tests/e2e/.auth/user.json');
});
