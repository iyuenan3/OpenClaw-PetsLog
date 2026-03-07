// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('提醒功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test_user');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
  });

  test('提醒中心页面应该正常加载', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    await expect(page).toHaveTitle(/提醒中心/);
    await expect(page.locator('text=提醒中心')).toBeVisible();
  });

  test('提醒分类 Tab 应该显示', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    
    const tabs = [
      '全部',
      '驱虫',
      '疫苗',
      '生日',
      '称重'
    ];
    
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
  });

  test('切换提醒分类 Tab', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    
    // 点击不同 Tab
    await page.click('text=驱虫');
    await page.waitForTimeout(500);
    
    await page.click('text=疫苗');
    await page.waitForTimeout(500);
    
    // 验证 Tab 激活状态
    const activeTab = page.locator('.tab.active');
    await expect(activeTab).toBeVisible();
  });

  test('提醒列表空状态', async ({ page }) => {
    await page.goto('/pages/reminders/reminders');
    await page.waitForTimeout(2000);
    
    // 验证空状态或列表显示
    const emptyState = page.locator('.empty-state:has-text("暂无提醒")');
    const reminderList = page.locator('.reminder-list');
    
    const isEmpty = await emptyState.isVisible();
    const hasList = await reminderList.isVisible();
    
    expect(isEmpty || hasList).toBeTruthy();
  });

  test('提醒设置页面应该正常加载', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await expect(page).toHaveTitle(/提醒设置/);
    await expect(page.locator('text=提醒设置')).toBeVisible();
  });

  test('提醒设置 - 开关提醒类型', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    
    // 验证提醒类型开关存在
    const reminderTypes = [
      '驱虫提醒',
      '疫苗提醒',
      '用药提醒',
      '生日提醒',
      '称重提醒'
    ];
    
    for (const type of reminderTypes) {
      await expect(page.locator(`text=${type}`)).toBeVisible();
    }
  });

  test('提醒设置 - 提前提醒天数选择', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    
    // 点击提前天数选择器
    await page.click('.picker-value:has-text("天")');
    await page.waitForTimeout(500);
    
    // 验证选项
    const options = ['3 天', '7 天', '14 天', '30 天'];
    for (const option of options) {
      await expect(page.locator(`text=${option}`)).toBeVisible();
    }
  });

  test('提醒设置 - 通知时间选择', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    
    // 点击时间选择器
    await page.click('.picker-value:has-text(":")');
    await page.waitForTimeout(500);
    
    // 验证时间选择器显示
    const timePicker = page.locator('[mode="time"]');
    await expect(timePicker).toBeVisible();
  });

  test('提醒设置 - 免打扰时段', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    
    // 验证免打扰设置存在
    await expect(page.locator('text=免打扰时段')).toBeVisible();
    await expect(page.locator('text=开启免打扰')).toBeVisible();
  });

  test('提醒设置 - 保存功能', async ({ page }) => {
    await page.goto('/pages/reminder-settings/reminder-settings');
    await page.waitForTimeout(2000);
    
    // 点击保存按钮
    await page.click('.save-btn');
    await page.waitForTimeout(2000);
    
    // 验证保存成功
    const successToast = page.locator('.uni-toast:has-text("保存成功")');
    await expect(successToast).toBeVisible();
  });
});
