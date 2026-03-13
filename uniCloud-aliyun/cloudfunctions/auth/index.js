/**
 * JWT 认证中间件云函数
 * 用于验证用户 token 并返回用户信息
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petslog-secret-key-change-in-production';

/**
 * 验证 token 并返回用户信息
 * @param {string} token - JWT token
 * @returns {Promise<{valid: boolean, user?: Object, message?: string}>}
 */
async function verifyToken(token) {
  if (!token) {
    return { valid: false, message: 'Token 不存在' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 验证用户是否存在
    const db = uniCloud.database();
    const userResult = await db.collection('users').doc(decoded.userId).get();
    
    if (userResult.data.length === 0) {
      return { valid: false, message: '用户不存在' };
    }
    
    const user = userResult.data[0];
    
    // 验证 token 是否已被撤销（检查数据库中的 token 是否匹配）
    if (user.token !== token) {
      return { valid: false, message: 'Token 已失效，请重新登录' };
    }
    
    return {
      valid: true,
      user: {
        _id: user._id,
        username: user.username,
        familyId: user.familyId
      }
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, message: 'Token 已过期，请重新登录' };
    }
    return { valid: false, message: 'Token 验证失败' };
  }
}

/**
 * 生成 JWT token
 * @param {Object} user - 用户对象
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      familyId: user.familyId
    },
    JWT_SECRET,
    { expiresIn: '7d' } // 7 天有效期
  );
}

/**
 * 云函数主入口
 * @param {Object} event - 事件对象
 * @param {string} event.token - 待验证的 token
 * @param {string} event.action - 动作：verify（验证）或 generate（生成）
 * @param {Object} event.user - 用户对象（生成 token 时使用）
 */
exports.main = async (event, context) => {
  const { action, token, user } = event;
  
  if (action === 'verify') {
    const result = await verifyToken(token);
    return {
      code: result.valid ? 200 : 401,
      ...result
    };
  } else if (action === 'generate') {
    if (!user) {
      return { code: 400, message: '用户对象不能为空' };
    }
    const newToken = generateToken(user);
    return {
      code: 200,
      token: newToken
    };
  } else {
    return { code: 400, message: '未知的操作类型' };
  }
};

// 导出供其他云函数直接调用
module.exports = {
  verifyToken,
  generateToken
};
