/**
 * 统计页面 E2E 测试
 */
const { test, expect } = require('@playwright/test');

test.describe('Statistics Page', () => {
  test('should load statistics page', async ({ page }) => {
    await page.goto('/pages/statistics/statistics');
    
    // 检查统计卡片
    await expect(page.locator('.stats-cards')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(3);
    
    // 检查图表区域
    await expect(page.locator('.chart-section')).toHaveCount(3);
  });
  
  test('should display pet count', async ({ page }) => {
    await page.goto('/pages/statistics/statistics');
    
    const petCountCard = page.locator('.stat-card').first();
    await expect(petCountCard).toBeVisible();
  });
  
  test('should render health chart', async ({ page }) => {
    await page.goto('/pages/statistics/statistics');
    
    const healthChart = page.locator('#healthChart');
    await expect(healthChart).toBeVisible();
  });
});
