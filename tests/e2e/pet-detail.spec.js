// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('宠物详情页测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
  });

  test('Tab 切换应该正常工作', async ({ page }) => {
    // 假设有宠物，点击第一个宠物卡片
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      // 测试 Tab 切换
      const weightTab = page.locator('text=⚖️ 体重');
      await expect(weightTab).toBeVisible();
      await weightTab.click();
      
      const healthTab = page.locator('text=🏥 健康');
      await expect(healthTab).toBeVisible();
      await healthTab.click();
    }
  });

  test('编辑按钮应该可点击', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const editBtn = page.locator('.edit-btn');
      await expect(editBtn).toBeVisible();
      await editBtn.click();
      await expect(page).toHaveURL(/\/pages\/edit-pet/);
    }
  });

  test('添加体重记录应该弹出输入框', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const weightTab = page.locator('text=⚖️ 体重');
      await weightTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加体重记录")');
      await expect(addBtn).toBeVisible();
      await addBtn.click();
      
      // 应该弹出输入框
      await expect(page.locator('.uni-modal')).toBeVisible();
    }
  });
});
