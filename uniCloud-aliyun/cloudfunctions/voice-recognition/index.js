/**
 * 语音识别云函数
 * 支持微信小程序语音识别
 * 
 * @param {string} params.audioPath - 音频文件路径（云文件 ID 或临时路径）
 * @param {string} params.token - 用户 token
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petslog-secret-key-change-in-production';

exports.main = async (event, context) => {
  const { audioPath, token } = event;
  
  if (!audioPath) {
    return {
      code: 400,
      message: '音频路径不能为空'
    };
  }
  
  const db = uniCloud.database();
  
  // 验证用户身份
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userResult = await db.collection('users').doc(decoded.userId).get();
      
      if (userResult.data.length === 0) {
        return { code: 401, message: '用户不存在' };
      }
    } catch (error) {
      return { code: 401, message: 'Token 无效或已过期' };
    }
  }
  
  try {
    // 使用 uniCloud 的语音识别能力
    // 注意：需要在 uniCloud 控制台开通语音识别服务
    const result = await uniCloud.ai.audioToText(audioPath);
    
    return {
      code: 200,
      message: '识别成功',
      data: {
        text: result.text,
        confidence: result.confidence
      }
    };
  } catch (error) {
    console.error('语音识别失败:', error);
    
    // 如果 uniCloud 语音识别不可用，返回错误提示
    return {
      code: 500,
      message: '语音识别服务暂时不可用，请稍后重试',
      error: error.message
    };
  }
};
