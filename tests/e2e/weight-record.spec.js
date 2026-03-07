// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('体重记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test_user');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
  });

  test('体重记录页面应该正常加载', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    await expect(page).toHaveTitle(/添加体重记录/);
    await expect(page.locator('text=添加体重记录')).toBeVisible();
  });

  test('手动输入体重', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    
    // 选择宠物
    await page.click('.picker:has-text("请选择宠物")');
    await page.waitForTimeout(500);
    
    // 输入体重
    await page.fill('input[placeholder="请输入体重"]', '3.5');
    
    // 选择日期
    const today = new Date().toISOString().split('T')[0];
    await expect(page.locator('input[type="date"]')).toHaveValue(today);
    
    // 填写备注
    await page.fill('textarea[placeholder="例如：刚吃完早饭"]', '测试备注');
    
    // 保存
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(2000);
    
    // 验证保存成功
    const successToast = page.locator('.uni-toast:has-text("保存成功")');
    await expect(successToast).toBeVisible();
  });

  test('语音输入体重 - H5 端', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    
    // 检查语音按钮是否存在
    const voiceButton = page.locator('.voice-btn');
    await expect(voiceButton).toBeVisible();
    
    // 验证语音按钮有提示文本
    const hintText = page.locator('.hint:has-text("按住说话")');
    await expect(hintText).toBeVisible();
  });

  test('离线模式提示', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    
    // 验证网络状态显示
    const networkStatus = page.locator('.network-status');
    await expect(networkStatus).toBeVisible();
  });

  test('表单验证 - 必填项', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    
    // 不填写直接保存
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(1000);
    
    // 验证错误提示
    const errorToast = page.locator('.uni-toast:has-text("请填写完整")');
    await expect(errorToast).toBeVisible();
  });

  test('语音输入技巧提示', async ({ page }) => {
    await page.goto('/pages/weight/add-weight');
    
    // 验证技巧提示卡片存在
    const tipsCard = page.locator('.tips-card');
    await expect(tipsCard).toBeVisible();
    
    // 验证提示内容
    await expect(page.locator('text=语音输入技巧')).toBeVisible();
  });
});
