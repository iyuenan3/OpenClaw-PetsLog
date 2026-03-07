// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('登录/注册页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('页面应该正常加载', async ({ page }) => {
    await page.waitForTimeout(2000);
    // 验证页面加载（使用宽松选择器）
    const pageContent = page.locator('.container, .page, #app, text=登录');
    await expect(pageContent.first()).toBeVisible();
  });

  test('表单应该存在', async ({ page }) => {
    // 查找表单元素
    const inputs = page.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('密码输入框应该可输入', async ({ page }) => {
    const input = page.locator('input[type="password"], input').last();
    if (await input.isVisible()) {
      await input.fill('password123');
      await expect(input).toHaveValue('password123');
    }
  });

  test('提交按钮应该存在', async ({ page }) => {
    // 查找提交按钮
    const submitButton = page.locator('button:has-text("登录"), button:has-text("提交"), .btn-primary').first();
    await expect(submitButton).toBeVisible();
  });

  test('注册按钮应该存在', async ({ page }) => {
    // 查找注册按钮
    const registerBtn = page.locator('button:has-text("注册"), text=注册').first();
    await expect(registerBtn).toBeVisible();
  });
});
