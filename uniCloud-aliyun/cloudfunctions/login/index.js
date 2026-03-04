/**
 * 用户登录云函数
 * @param {Object} params
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 */
exports.main = async (event, context) => {
  const { username, password } = event;
  
  if (!username || !password) {
    return {
      code: 400,
      message: '用户名和密码不能为空'
    };
  }
  
  const db = uniCloud.database();
  const usersCollection = db.collection('users');
  
  // 查询用户
  const userResult = await usersCollection.where({
    username: username
  }).get();
  
  if (userResult.data.length === 0) {
    return {
      code: 404,
      message: '用户不存在'
    };
  }
  
  const user = userResult.data[0];
  
  // 验证密码（简单哈希对比，生产环境应用 bcrypt）
  const crypto = require('crypto');
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (user.passwordHash !== passwordHash) {
    return {
      code: 401,
      message: '密码错误'
    };
  }
  
  // 生成 token（简单实现，生产环境应用 JWT）
  const token = crypto.createHash('sha256')
    .update(user._id + Date.now())
    .digest('hex');
  
  // 更新 token 到数据库（实际应用中应该有过期时间）
  await usersCollection.doc(user._id).update({
    token: token,
    tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 天有效期
  });
  
  return {
    code: 200,
    message: '登录成功',
    data: {
      token: token,
      user: {
        _id: user._id,
        username: user.username,
        familyId: user.familyId
      }
    }
  };
};
