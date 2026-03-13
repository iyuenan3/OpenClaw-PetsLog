/**
 * 统计云函数测试
 */

const assert = require('node:assert');
const { describe, it } = require('node:test');

// Mock uniCloud
global.uniCloud = {
  database: () => ({
    collection: (name) => ({
      where: () => ({
        field: () => ({
          get: async () => {
            if (name === 'pets') {
              return { data: [{ _id: '1', healthStatus: 'healthy' }, { _id: '2', healthStatus: 'sick' }] };
            }
            if (name === 'food_records') {
              return { data: [{ amount: 100 }, { amount: 200 }] };
            }
            if (name === 'weight_records') {
              return { data: [{ petId: '1', weight: 5.5, recordDate: Date.now() }] };
            }
            return { data: [] };
          }
        }),
        count: async () => {
          if (name === 'reminders') return { total: 3 };
          if (name === 'vaccine_records') return { total: 2 };
          if (name === 'deworming_records') return { total: 1 };
          return { total: 0 };
        },
        orderBy: () => ({
          limit: () => ({
            field: () => ({
              get: async () => ({ data: [] })
            })
          })
        })
      })
    }),
    command: {
      gte: (v) => ({ $gte: v }),
      lte: (v) => ({ $lte: v }),
      lt: (v) => ({ $lt: v })
    }
  })
};

describe('statistics cloud function', () => {
  it('should return 400 when familyId is missing', async () => {
    const cloudFunction = require('../../uniCloud-aliyun/cloudfunctions/statistics/index.js');
    const result = await cloudFunction.main({}, {});
    
    assert.strictEqual(result.code, 400);
    assert.strictEqual(result.data, null);
  });
  
  it('should return statistics when familyId is provided', async () => {
    const cloudFunction = require('../../uniCloud-aliyun/cloudfunctions/statistics/index.js');
    const result = await cloudFunction.main({ familyId: 'family123' }, {});
    
    assert.strictEqual(result.code, 200);
    assert.ok(result.data);
    assert.strictEqual(typeof result.data.petCount, 'number');
    assert.strictEqual(typeof result.data.todayReminders, 'number');
    assert.strictEqual(typeof result.data.monthExpenses, 'number');
  });
});

console.log('Running statistics tests...');
