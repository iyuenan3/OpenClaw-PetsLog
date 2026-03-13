/**
 * 健康状况统计云函数测试
 */

const assert = require('node:assert');
const { describe, it, beforeEach } = require('node:test');

// Mock uniCloud
global.uniCloud = {
  database: () => ({
    collection: (name) => {
      return {
        where: (condition) => ({
          field: (fields) => ({
            get: async () => {
              if (name === 'pets') {
                return {
                  data: [
                    { _id: '1', healthStatus: 'healthy' },
                    { _id: '2', healthStatus: 'healthy' },
                    { _id: '3', healthStatus: 'sick' },
                    { _id: '4', healthStatus: 'recovering' }
                  ]
                };
              }
              return { data: [] };
            }
          }),
          count: async () => {
            if (name === 'vaccine_records') {
              return { total: 2 };
            }
            if (name === 'deworming_records') {
              return { total: 1 };
            }
            return { total: 0 };
          }
        })
      };
    },
    command: {
      lt: (value) => ({ $lt: value })
    }
  })
};

describe('health-stats cloud function', () => {
  let cloudFunction;
  
  beforeEach(async () => {
    // 重新加载模块以获取最新的 mock
    delete require.cache[require.resolve('../../uniCloud-aliyun/cloudfunctions/health-stats/index.js')];
    cloudFunction = require('../../uniCloud-aliyun/cloudfunctions/health-stats/index.js');
  });
  
  it('should return 400 when familyId is missing', async () => {
    const result = await cloudFunction.main({}, {});
    
    assert.strictEqual(result.code, 400);
    assert.strictEqual(result.message, 'familyId is required');
    assert.strictEqual(result.data, null);
  });
  
  it('should return health statistics when familyId is provided', async () => {
    const result = await cloudFunction.main({ familyId: 'family123' }, {});
    
    assert.strictEqual(result.code, 200);
    assert.strictEqual(result.message, 'success');
    assert.ok(result.data);
    assert.strictEqual(typeof result.data.totalPets, 'number');
    assert.ok(Array.isArray(result.data.healthDistribution));
    assert.ok(typeof result.data.vaccineDueCount === 'number');
    assert.ok(typeof result.data.dewormingDueCount === 'number');
  });
  
  it('should calculate correct percentages', async () => {
    const result = await cloudFunction.main({ familyId: 'family123' }, {});
    
    const distribution = result.data.healthDistribution;
    const totalPercentage = distribution.reduce((sum, item) => sum + item.percentage, 0);
    
    // 百分比总和应该接近 100（可能有舍入误差）
    assert.ok(totalPercentage >= 99 && totalPercentage <= 101);
  });
  
  it('should include all required fields in distribution', async () => {
    const result = await cloudFunction.main({ familyId: 'family123' }, {});
    
    const distribution = result.data.healthDistribution;
    
    distribution.forEach(item => {
      assert.ok(item.status);
      assert.ok(typeof item.count === 'number');
      assert.ok(typeof item.percentage === 'number');
    });
  });
});

console.log('Running health-stats tests...');
