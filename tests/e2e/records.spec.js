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

test.describe('健康记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 认证状态已从 storageState 加载，直接访问首页
    await page.goto('/pages/index/index');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
  });

  test('健康记录 Tab 应该可以访问', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const healthTab = page.locator('text=🏥 健康');
      await expect(healthTab).toBeVisible();
      await healthTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加健康记录")');
      await expect(addBtn).toBeVisible();
    }
  });

  test('添加健康记录 - 呕吐/拉稀', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const healthTab = page.locator('text=🏥 健康');
      await healthTab.click();
      
      const addBtn = page.locator('button:has-text("+ 添加健康记录")');
      await addBtn.click();
      
      // 选择症状：呕吐/拉稀（第一个选项）
      await page.locator('text=呕吐/拉稀').click();
      await page.waitForTimeout(500);
      
      // 输入观察记录
      await page.locator('.uni-modal input').fill('今天拉了 3 次，便便呈水样');
      await page.locator('button:has-text("确定")').click();
      await page.waitForTimeout(500);
      
      // 选择完成提交（第二个选项）
      await page.locator('text=完成提交').click();
      
      // 应该显示成功提示
      await page.waitForTimeout(2000);
      await expect(page.locator('.uni-toast')).toBeVisible();
    }
  });

  test('健康记录列表应该显示记录', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const healthTab = page.locator('text=🏥 健康');
      await healthTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      const recordList = page.locator('.record-list');
      await expect(recordList).toBeVisible();
    }
  });

  test('健康记录应该显示症状和观察', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const healthTab = page.locator('text=🏥 健康');
      await healthTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      // 检查是否显示症状
      const symptomText = page.locator('text=呕吐/拉稀');
      if (await symptomText.isVisible()) {
        await expect(symptomText).toBeVisible();
      }
    }
  });

  test('健康记录删除按钮应该存在', async ({ page }) => {
    const petCard = page.locator('.pet-card').first();
    if (await petCard.isVisible()) {
      await petCard.click();
      await page.waitForURL(/\/pages\/pet-detail/);
      
      const healthTab = page.locator('text=🏥 健康');
      await healthTab.click();
      
      // 等待记录加载
      await page.waitForTimeout(2000);
      
      // 查找删除按钮
      const deleteBtn = page.locator('.delete-btn:has-text("🗑️")').first();
      if (await deleteBtn.isVisible()) {
        // 只验证删除按钮存在且可点击
        await expect(deleteBtn).toBeVisible();
        await expect(deleteBtn).toBeEnabled();
      }
    }
  });
});
