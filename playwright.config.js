// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: false,  // 允许 test.only 用于调试
  retries: process.env.CI ? 2 : 0,  // CI 中重试 2 次提高稳定性
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,  // 全局超时 30 秒，适应 uni-app 加载速度
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    // 认证 setup 项目
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.js/,
      timeout: 60000, // 认证流程 60 秒，包含注册 + 登录
    },
    // 登录测试 - 不需要认证（独立运行）
    {
      name: 'chromium-auth',
      use: { 
        ...devices['Desktop Chrome'],
      },
      testMatch: /login\.spec\.js/,
    },
    // 需要认证的测试项目
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      testIgnore: /login\.spec\.js/,
      dependencies: ['setup'],
    },
  ],
  outputDir: 'test-results/',
});
