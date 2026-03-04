// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('登录/注册页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面应该正常加载', async ({ page }) => {
    await expect(page).toHaveTitle(/PetsLog/);
    await expect(page.locator('text=PetsLog')).toBeVisible();
    await expect(page.locator('text=宠物健康管理')).toBeVisible();
  });

  test('用户名输入框应该可输入', async ({ page }) => {
    const input = page.locator('input[placeholder="请输入用户名"]');
    await expect(input).toBeVisible();
    await input.fill('testuser');
    await expect(input).toHaveValue('testuser');
  });

  test('密码输入框应该可输入', async ({ page }) => {
    const input = page.locator('input[type="password"]');
    await expect(input).toBeVisible();
    await input.fill('password123');
    await expect(input).toHaveValue('password123');
  });

  test('空表单提交应该提示错误', async ({ page }) => {
    await page.locator('button:has-text("登录")').click();
    await expect(page.locator('.uni-toast')).toBeVisible();
    await expect(page.locator('text=请输入用户名和密码')).toBeVisible();
  });

  test('注册按钮应该可点击', async ({ page }) => {
    const registerBtn = page.locator('button:has-text("注册")');
    await expect(registerBtn).toBeVisible();
    await expect(registerBtn).toBeEnabled();
  });
});
