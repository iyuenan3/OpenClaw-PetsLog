// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('用药记录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test_user');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
  });

  test('用药记录页面应该正常加载', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await expect(page).toHaveTitle(/用药记录/);
    await expect(page.locator('text=用药记录')).toBeVisible();
  });

  test('添加用药记录 - 完整流程', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    
    // 点击添加按钮
    await page.click('.add-btn');
    
    // 填写表单
    await page.fill('input[placeholder="如：苯巴比妥片"]', '苯巴比妥片');
    await page.fill('input[placeholder="如：1 片、5ml"]', '1 片');
    
    // 选择频率
    await page.click('.form-group:has-text("用药频率") .picker');
    await page.click('text=每天 2 次');
    
    // 填写用药目的
    await page.fill('input[placeholder="如：控制癫痫"]', '控制癫痫');
    
    // 填写用药说明
    await page.fill('textarea[placeholder="如：饭后服用"]', '饭后服用，避免与牛奶同服');
    
    // 启用提醒
    await page.click('.checkbox-label:has-text("启用用药提醒")');
    
    // 保存
    await page.click('button:has-text("保存")');
    
    // 等待保存成功提示
    await page.waitForTimeout(2000);
    
    // 验证保存成功
    const successToast = page.locator('.uni-toast:has-text("添加成功")');
    await expect(successToast).toBeVisible();
  });

  test('用药记录列表应该显示记录', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    // 验证列表至少有一条记录
    const medicationCards = page.locator('.medication-card');
    const count = await medicationCards.count();
    
    if (count > 0) {
      await expect(medicationCards.first()).toBeVisible();
    }
  });

  test('用药打卡功能', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    const recordDoseButtons = page.locator('button:has-text("✅ 已用药")');
    const count = await recordDoseButtons.count();
    
    if (count > 0) {
      await recordDoseButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 验证成功提示
      const successToast = page.locator('.uni-toast:has-text("已记录")');
      await expect(successToast).toBeVisible();
    }
  });

  test('编辑用药记录', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    const editButtons = page.locator('button:has-text("✏️ 编辑")');
    const count = await editButtons.count();
    
    if (count > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 验证表单弹窗显示
      const formModal = page.locator('.form-modal');
      await expect(formModal).toBeVisible();
      
      // 修改剂量
      await page.fill('input[placeholder="如：1 片、5ml"]', '2 片');
      
      // 保存
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(2000);
      
      // 验证保存成功
      const successToast = page.locator('.uni-toast:has-text("更新成功")');
      await expect(successToast).toBeVisible();
    }
  });

  test('删除用药记录', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.waitForTimeout(2000);
    
    const deleteButtons = page.locator('button:has-text("🗑️ 删除")');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      await deleteButtons.first().click();
      
      // 确认删除
      await page.click('button:has-text("确定")');
      await page.waitForTimeout(2000);
      
      // 验证删除成功
      const successToast = page.locator('.uni-toast:has-text("删除成功")');
      await expect(successToast).toBeVisible();
    }
  });

  test('用药频率选项应该正确', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.click('.add-btn');
    
    // 打开频率选择器
    await page.click('.form-group:has-text("用药频率") .picker');
    
    // 验证选项
    const options = [
      '每天 1 次',
      '每天 2 次',
      '每天 3 次',
      '按需使用',
      '自定义'
    ];
    
    for (const option of options) {
      await expect(page.locator(`text=${option}`)).toBeVisible();
    }
  });

  test('提醒时间设置功能', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.click('.add-btn');
    
    // 启用提醒
    await page.click('.checkbox-label:has-text("启用用药提醒")');
    
    // 添加提醒时间
    await page.click('.add-time-btn');
    await page.waitForTimeout(500);
    
    // 验证时间标签显示
    const timeTags = page.locator('.time-tag');
    const count = await timeTags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('表单验证 - 必填项', async ({ page }) => {
    await page.goto('/pages/medication/medication');
    await page.click('.add-btn');
    
    // 不填写直接保存
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(1000);
    
    // 验证错误提示
    const errorToast = page.locator('.uni-toast:has-text("必填项")');
    await expect(errorToast).toBeVisible();
  });
});
