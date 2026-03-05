// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('添加宠物页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    // 确保添加按钮可见
    await page.locator('.btn-add').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('点击添加按钮应该跳转', async ({ page }) => {
    // 使用 CSS class 选择器
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    await expect(page.locator('text=添加宠物')).toBeVisible();
  });

  test('名字输入框应该可输入', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const input = page.locator('input[placeholder="请输入宠物名字"]');
    await expect(input).toBeVisible();
    await input.fill('测试宠物');
    await expect(input).toHaveValue('测试宠物');
  });

  test('品种输入框应该可输入', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const input = page.locator('input[placeholder="例如：英短、美短、金毛"]');
    await expect(input).toBeVisible();
    await input.fill('英短');
    await expect(input).toHaveValue('英短');
  });

  test('物种选择应该正常工作', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const catBtn = page.locator('text=🐱 猫咪');
    await expect(catBtn).toBeVisible();
    await catBtn.click();
    // 验证选中状态
    await expect(catBtn).toHaveClass(/active/);
  });

  test('性别选择应该正常工作', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const maleBtn = page.locator('text=♂ 公');
    await expect(maleBtn).toBeVisible();
    await maleBtn.click();
    await expect(maleBtn).toHaveClass(/active/);
  });

  test('毛色输入框应该可输入', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const input = page.locator('input[placeholder="例如：金色、黑色、白色"]');
    await expect(input).toBeVisible();
    await input.fill('金色');
    await expect(input).toHaveValue('金色');
  });

  test('备注输入框应该可输入', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('这是一段测试备注');
    await expect(textarea).toHaveValue('这是一段测试备注');
  });

  test('空名字提交应该提示错误', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    await page.locator('button:has-text("创建宠物档案")').click();
    await expect(page.locator('.uni-toast')).toBeVisible();
  });

  test('取消按钮应该返回列表', async ({ page }) => {
    await page.locator('.btn-add').click();
    await page.waitForURL(/\/pages\/add-pet\/add-pet/);
    await page.locator('button:has-text("取消")').click();
    await page.waitForURL(/\/pages\/index\/index/);
    await expect(page.locator('.title:has-text("我的宠物")')).toBeVisible();
  });
});
