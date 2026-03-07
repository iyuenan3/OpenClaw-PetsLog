// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('提醒功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('提醒中心页面应该可以访问', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    await page.waitForTimeout(3000);
    
    // 验证页面加载
    const pageContent = page.locator('.container, .page, #app').first();
    await expect(pageContent).toBeVisible();
  });

  test('提醒分类 Tab 应该存在', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    await page.waitForTimeout(2000);
    
    // 查找 Tab 容器
    const tabs = page.locator('.tabs, .tab-bar, .filter-bar').first();
    await expect(tabs).toBeVisible();
  });

  test('提醒列表应该可以显示', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    await page.waitForTimeout(2000);
    
    // 查找列表容器
    const listContainer = page.locator('.reminder-list, .list, .scroll-view').first();
    await expect(listContainer).toBeVisible();
  });

  test('提醒设置页面应该可以访问', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await page.waitForTimeout(3000);
    
    // 验证页面加载
    const pageContent = page.locator('.container, .page, #app').first();
    await expect(pageContent).toBeVisible();
  });

  test('设置项应该存在', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await page.waitForTimeout(2000);
    
    // 查找设置项
    const settings = page.locator('.setting-item, .form-group, .list-item');
    const count = await settings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('开关组件应该存在', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await page.waitForTimeout(2000);
    
    // 查找开关
    const switches = page.locator('switch, .switch, input[type="checkbox"], [role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThan(0);
  });

  test('保存按钮应该存在', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await page.waitForTimeout(2000);
    
    // 查找保存按钮
    const saveButton = page.locator('button:has-text("保存"), .btn-primary, .save-btn').first();
    await expect(saveButton).toBeVisible();
  });
});
