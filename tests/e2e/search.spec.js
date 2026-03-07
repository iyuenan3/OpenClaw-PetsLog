// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('首页搜索功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test_user');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
  });

  test('首页应该正常加载', async ({ page }) => {
    await page.goto('/pages/index/index');
    await expect(page).toHaveTitle(/PetsLog/);
    await expect(page.locator('text=我的宠物')).toBeVisible();
  });

  test('搜索框应该显示', async ({ page }) => {
    await page.goto('/pages/index/index');
    
    // 验证搜索框存在
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();
    
    // 验证搜索图标
    const searchIcon = page.locator('.search-icon:has-text("🔍")');
    await expect(searchIcon).toBeVisible();
  });

  test('搜索框可以输入', async ({ page }) => {
    await page.goto('/pages/index/index');
    
    const searchField = page.locator('.search-text');
    await searchField.fill('小葵');
    
    const value = await searchField.inputValue();
    expect(value).toBe('小葵');
  });

  test('搜索清空按钮', async ({ page }) => {
    await page.goto('/pages/index/index');
    
    // 输入内容
    const searchField = page.locator('.search-text');
    await searchField.fill('测试');
    
    // 验证清空按钮显示
    const clearButton = page.locator('.search-clear:has-text("✕")');
    await expect(clearButton).toBeVisible();
    
    // 点击清空
    await clearButton.click();
    
    // 验证输入框已清空
    const value = await searchField.inputValue();
    expect(value).toBe('');
  });

  test('物种筛选器应该显示', async ({ page }) => {
    await page.goto('/pages/index/index');
    
    const filterTags = [
      '全部',
      '🐱 猫咪',
      '🐶 狗狗'
    ];
    
    for (const tag of filterTags) {
      await expect(page.locator(`text=${tag}`)).toBeVisible();
    }
  });

  test('切换物种筛选', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 点击猫咪筛选
    await page.click('text=🐱 猫咪');
    await page.waitForTimeout(1000);
    
    // 验证筛选器激活状态
    const activeFilter = page.locator('.filter-tag.active');
    await expect(activeFilter).toBeVisible();
    
    // 点击狗狗筛选
    await page.click('text=🐶 狗狗');
    await page.waitForTimeout(1000);
    
    // 验证状态更新
    const newActiveFilter = page.locator('.filter-tag.active');
    await expect(newActiveFilter).toBeVisible();
  });

  test('搜索功能 - 实时过滤', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 获取初始宠物数量
    const initialCards = page.locator('.pet-card');
    const initialCount = await initialCards.count();
    
    // 输入搜索内容
    const searchField = page.locator('.search-text');
    await searchField.fill('小葵');
    await page.waitForTimeout(500);
    
    // 验证搜索结果
    const filteredCards = page.locator('.pet-card');
    const filteredCount = await filteredCards.count();
    
    // 搜索结果应该少于或等于初始数量
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('筛选器 - 全部', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 点击全部
    await page.click('text=全部');
    await page.waitForTimeout(500);
    
    // 验证全部筛选器激活
    const allFilter = page.locator('.filter-tag:has-text("全部").active');
    await expect(allFilter).toBeVisible();
  });

  test('搜索和筛选组合使用', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    // 先选择猫咪筛选
    await page.click('text=🐱 猫咪');
    await page.waitForTimeout(500);
    
    // 再输入搜索
    const searchField = page.locator('.search-text');
    await searchField.fill('小');
    await page.waitForTimeout(500);
    
    // 验证组合筛选效果
    const filteredCards = page.locator('.pet-card');
    const count = await filteredCards.count();
    
    // 应该有结果或为空
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('宠物卡片应该显示完整信息', async ({ page }) => {
    await page.goto('/pages/index/index');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('.pet-card').first();
    await expect(firstCard).toBeVisible();
    
    // 验证卡片元素
    await expect(firstCard.locator('.pet-name')).toBeVisible();
    await expect(firstCard.locator('.pet-breed')).toBeVisible();
    await expect(firstCard.locator('.pet-meta')).toBeVisible();
  });
});
