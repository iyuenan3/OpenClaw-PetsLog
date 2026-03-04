// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('添加宠物页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/');
    await page.locator('input[placeholder="请输入用户名"]').fill('admin');
    await page.locator('input[type="password"]').fill('PetsLog2024');
    await page.locator('button:has-text("登录")').click();
    await page.waitForURL(/\/pages\/index\/index/);
  });

  test('点击添加按钮应该跳转', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    await expect(page).toHaveURL(/\/pages\/add-pet\/add-pet/);
  });

  test('名字输入框应该可输入', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const input = page.locator('input[placeholder="请输入宠物名字"]');
    await expect(input).toBeVisible();
    await input.fill('测试宠物');
    await expect(input).toHaveValue('测试宠物');
  });

  test('品种输入框应该可输入', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const input = page.locator('input[placeholder="例如：英短、美短、金毛"]');
    await expect(input).toBeVisible();
    await input.fill('英短');
    await expect(input).toHaveValue('英短');
  });

  test('物种选择应该正常工作', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const catBtn = page.locator('text=🐱 猫咪');
    await expect(catBtn).toBeVisible();
    await catBtn.click();
    // 验证选中状态
    await expect(catBtn).toHaveClass(/active/);
  });

  test('性别选择应该正常工作', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const maleBtn = page.locator('text=♂ 公');
    await expect(maleBtn).toBeVisible();
    await maleBtn.click();
    await expect(maleBtn).toHaveClass(/active/);
  });

  test('毛色输入框应该可输入', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const input = page.locator('input[placeholder="例如：金色、黑色、白色"]');
    await expect(input).toBeVisible();
    await input.fill('金色');
    await expect(input).toHaveValue('金色');
  });

  test('备注输入框应该可输入', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('这是一段测试备注');
    await expect(textarea).toHaveValue('这是一段测试备注');
  });

  test('空名字提交应该提示错误', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    await page.locator('button:has-text("创建宠物档案")').click();
    await expect(page.locator('.uni-toast')).toBeVisible();
  });

  test('取消按钮应该返回列表', async ({ page }) => {
    await page.locator('button:has-text("+ 添加")').click();
    await page.locator('button:has-text("取消")').click();
    await expect(page).toHaveURL(/\/pages\/index\/index/);
  });
});
