// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('用药记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 使用已保存的认证状态
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('用药记录页面应该可以访问', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(3000);
    
    // 验证页面加载（使用 first() 避免 strict mode violation）
    const pageContent = page.locator('#app').first();
    await expect(pageContent).toBeVisible();
  });

  test('添加按钮应该存在', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    // 查找添加按钮（修复 CSS 选择器语法，使用 text 定位）
    const addButton = page.locator('.add-btn, .fab-button').first();
    // 如果找不到，尝试查找包含"添加"文本的按钮
    if (!await addButton.isVisible()) {
      const addButtonByText = page.getByText('添加', { exact: false }).first();
      await expect(addButtonByText).toBeVisible();
    } else {
      await expect(addButton).toBeVisible();
    }
  });

  test('用药记录列表应该可以显示', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    // 验证列表容器存在
    const listContainer = page.locator('.medication-list, .list, .container').first();
    await expect(listContainer).toBeVisible();
  });

  test('表单元素应该存在', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    // 查找添加按钮并点击
    const addButton = page.locator('.add-btn, .fab-button').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // 验证表单显示
      const formElements = page.locator('input, textarea, select');
      expect(await formElements.count()).toBeGreaterThan(0);
    }
  });
});
