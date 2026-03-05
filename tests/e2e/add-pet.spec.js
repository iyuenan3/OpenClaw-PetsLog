// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('添加宠物页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    // 等待标题出现
    await page.locator('text=我的宠物').waitFor({ state: 'visible', timeout: 15000 });
    // 等待添加按钮出现（使用多个选择器）
    const addBtn = page.locator('.btn-add, button:has-text("+ 添加"), button:has-text("添加")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  const clickAddButton = async (page) => {
    // 使用多个选择器确保能找到按钮
    const addBtn = page.locator('.btn-add, button:has-text("+ 添加"), button:has-text("添加")').first();
    await addBtn.click();
    await page.waitForTimeout(1500);
  };

  test('点击添加按钮应该跳转', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('add-pet');
  });

  test('名字输入框应该可输入', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const input = page.locator('input[placeholder="请输入宠物名字"]');
    await expect(input).toBeVisible();
    await input.fill('测试宠物');
    await expect(input).toHaveValue('测试宠物');
  });

  test('品种输入框应该可输入', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const input = page.locator('input[placeholder="例如：英短、美短、金毛"]');
    await expect(input).toBeVisible();
    await input.fill('英短');
    await expect(input).toHaveValue('英短');
  });

  test('物种选择应该正常工作', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const catBtn = page.locator('text=🐱 猫咪');
    await expect(catBtn).toBeVisible();
    await catBtn.click();
    await page.waitForTimeout(1000);
  });

  test('性别选择应该正常工作', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const maleBtn = page.locator('text=♂ 公');
    await expect(maleBtn).toBeVisible();
    await maleBtn.click();
    await page.waitForTimeout(1000);
  });

  test('毛色输入框应该可输入', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const input = page.locator('input[placeholder="例如：金色、黑色、白色"]');
    await expect(input).toBeVisible();
    await input.fill('金色');
    await expect(input).toHaveValue('金色');
  });

  test('备注输入框应该可输入', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('这是一段测试备注');
    await expect(textarea).toHaveValue('这是一段测试备注');
  });

  test('空名字提交应该提示错误', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const submitBtn = page.locator('button:has-text("创建宠物档案"), button:has-text("创建")').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);
    // 检查是否有 toast 或错误提示
    const toast = page.locator('.uni-toast, .toast, toast, text:has-text("请输入")');
    await expect(toast.first()).toBeVisible({ timeout: 5000 });
  });

  test('取消按钮应该返回列表', async ({ page }) => {
    await clickAddButton(page);
    await page.waitForURL(/\/pages\/add-pet\/add-pet/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    const cancelBtn = page.locator('button:has-text("取消")').first();
    await cancelBtn.click();
    await page.waitForURL(/\/pages\/index\/index/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('text=我的宠物')).toBeVisible();
  });
});
