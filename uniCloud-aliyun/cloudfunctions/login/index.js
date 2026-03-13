/**
 * 用户登录云函数
 * @param {Object} params
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petslog-secret-key-change-in-production';

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
  
  // 验证密码（使用 bcrypt）
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!passwordValid) {
    return {
      code: 401,
      message: '密码错误'
    };
  }
  
  // 生成 JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      familyId: user.familyId
    },
    JWT_SECRET,
    { expiresIn: '7d' } // 7 天有效期
  );
  
  // 更新 token 到数据库（用于 token 撤销验证）
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
