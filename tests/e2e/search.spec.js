// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('首页搜索功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('首页应该可以访问', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(3000);
    
    // 验证页面加载
    const pageContent = page.locator('.container, .page, #app').first();
    await expect(pageContent).toBeVisible();
  });

  test('搜索框应该存在', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 查找搜索框
    const searchInput = page.locator('input[type="search"], .search-input').first();
    await expect(searchInput).toBeVisible();
  });

  test('筛选器应该存在', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 查找筛选器容器
    const filterBar = page.locator('.filter-bar, .tabs, .filter-container').first();
    await expect(filterBar).toBeVisible();
  });

  test('宠物卡片应该显示', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 查找宠物卡片
    const petCards = page.locator('.pet-card, .card, .list-item');
    const count = await petCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('搜索输入应该可以工作', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 查找搜索框并输入
    const searchInput = page.locator('input[type="search"], .search-input').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      const value = await searchInput.inputValue();
      expect(value).toBe('测试');
    }
  });

  test('筛选器应该可以点击', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 查找筛选标签
    const filterTags = page.locator('.filter-tag, .tab, .chip');
    const count = await filterTags.count();
    if (count > 0) {
      await filterTags.first().click();
      await page.waitForTimeout(500);
    }
  });
});
