/**
 * 用户注册云函数
 * @param {Object} params
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 * @param {string} params.familyId - 家庭 ID（可选，不传则创建新家庭）
 */
const bcrypt = require('bcryptjs');

exports.main = async (event, context) => {
  const { username, password, familyId } = event;
  
  if (!username || !password) {
    return {
      code: 400,
      message: '用户名和密码不能为空'
    };
  }
  
  // 密码强度校验
  if (password.length < 6) {
    return {
      code: 400,
      message: '密码长度至少 6 位'
    };
  }
  
  const db = uniCloud.database();
  const usersCollection = db.collection('users');
  const familiesCollection = db.collection('families');
  
  // 检查用户名是否已存在
  const existingUser = await usersCollection.where({
    username: username
  }).get();
  
  if (existingUser.data.length > 0) {
    return {
      code: 409,
      message: '用户名已存在'
    };
  }
  
  // 如果没有传入 familyId，创建新家庭
  let targetFamilyId = familyId;
  if (!targetFamilyId) {
    const familyResult = await familiesCollection.add({
      name: username + '的家庭',
      createdAt: Date.now()
    });
    targetFamilyId = familyResult.id;
  }
  
  // 使用 bcrypt 加密密码
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  // 创建用户
  const userResult = await usersCollection.add({
    username: username,
    passwordHash: passwordHash,
    familyId: targetFamilyId,
    createdAt: Date.now()
  });
  
  return {
    code: 201,
    message: '注册成功',
    data: {
      userId: userResult.id,
      familyId: targetFamilyId
    }
  };
};
