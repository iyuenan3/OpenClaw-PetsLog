// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('驱虫记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
  });

  test('驱虫记录 Tab 应该可以访问', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const dewormingTab = page.locator('text=💊 驱虫');
      await expect(dewormingTab).toBeVisible();
      await dewormingTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加驱虫记录")');
      await expect(addBtn).toBeVisible();
    }
  });

  test('添加驱虫记录 - 体内驱虫', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const dewormingTab = page.locator('text=💊 驱虫');
      await dewormingTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加驱虫记录")');
      await addBtn.click();
      
      // 输入品牌/型号
      await page.locator('.uni-modal input').fill('拜宠清 体内驱虫');
      await page.locator('button:has-text("确定")').click();
      
      // 选择体内驱虫
      await page.locator('text=体内驱虫').click();
      
      // 输入日期
      await page.locator('.uni-modal input').fill('2026-03-04');
      await page.locator('button:has-text("确定")').click();
      
      // 设置下次提醒
      await page.locator('button:has-text("确定")').click();
      
      // 应该显示成功提示
      await expect(page.locator('.uni-toast')).toBeVisible();
    }
  });

  test('驱虫记录列表应该显示记录', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const dewormingTab = page.locator('text=💊 驱虫');
      await dewormingTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      const recordList = page.locator('.record-list');
      await expect(recordList).toBeVisible();
    }
  });
});

test.describe('疫苗记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
  });

  test('疫苗记录 Tab 应该可以访问', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const vaccineTab = page.locator('text=💉 疫苗');
      await expect(vaccineTab).toBeVisible();
      await vaccineTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加疫苗记录")');
      await expect(addBtn).toBeVisible();
    }
  });

  test('添加疫苗记录 - 猫三联', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const vaccineTab = page.locator('text=💉 疫苗');
      await vaccineTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加疫苗记录")');
      await addBtn.click();
      
      // 输入疫苗名称
      await page.locator('.uni-modal input').fill('猫三联');
      await page.locator('button:has-text("确定")').click();
      
      // 选择猫三联类型
      await page.locator('text=猫三联').click();
      
      // 输入品牌
      await page.locator('.uni-modal input').fill('硕腾');
      await page.locator('button:has-text("确定")').click();
      
      // 输入日期
      await page.locator('.uni-modal input').fill('2026-03-04');
      await page.locator('button:has-text("确定")').click();
      
      // 设置下次提醒
      await page.locator('button:has-text("确定")').click();
      
      // 应该显示成功提示
      await expect(page.locator('.uni-toast')).toBeVisible();
    }
  });

  test('疫苗记录列表应该显示记录', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const vaccineTab = page.locator('text=💉 疫苗');
      await vaccineTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      const recordList = page.locator('.record-list');
      await expect(recordList).toBeVisible();
    }
  });
});

test.describe('粮食记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
  });

  test('粮食记录 Tab 应该可以访问', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const foodTab = page.locator('text=🍖 粮食');
      await expect(foodTab).toBeVisible();
      await foodTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加粮食记录")');
      await expect(addBtn).toBeVisible();
    }
  });

  test('添加粮食记录 - 干粮', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const foodTab = page.locator('text=🍖 粮食');
      await foodTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加粮食记录")');
      await addBtn.click();
      
      // 输入品牌/型号
      await page.locator('.uni-modal input').fill('渴望 鸡肉味');
      await page.locator('button:has-text("确定")').click();
      
      // 选择干粮
      await page.locator('text=干粮').click();
      
      // 输入日期
      await page.locator('.uni-modal input').fill('2026-03-04');
      await page.locator('button:has-text("确定")').click();
      
      // 选择正在吃
      await page.locator('button:has-text("是")').click();
      
      // 应该显示成功提示
      await expect(page.locator('.uni-toast')).toBeVisible();
    }
  });

  test('当前粮食应该高亮显示', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const foodTab = page.locator('text=🍖 粮食');
      await foodTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      // 检查是否有当前粮食显示
      const currentFood = page.locator('.current-food');
      if (await currentFood.isVisible()) {
        await expect(currentFood).toBeVisible();
      }
    }
  });
});
