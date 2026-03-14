/**
 * 获取备份历史列表云函数
 * @param {Object} event
 * @param {number} event.page - 页码（从 1 开始）
 * @param {number} event.page_size - 每页数量
 * @param {string} event.type - 备份类型筛选：export, auto_backup（可选）
 */
exports.main = async (event, context) => {
  const { page = 1, page_size = 20, type } = event;
  
  // 获取当前登录用户信息
  const uid = context.auth?.uid;
  
  if (!uid) {
    return {
      code: 401,
      message: '未登录'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 构建查询条件
    let query = db.collection('backups').where({
      user_id: uid
    });
    
    // 类型筛选
    if (type) {
      query = query.eq('type', type);
    }
    
    // 总数
    const countResult = await query.count();
    const total = countResult.total || 0;
    
    // 分页查询
    const result = await query
      .orderBy('created_at', 'desc')
      .skip((page - 1) * page_size)
      .limit(page_size)
      .get();
    
    const backups = result.data || [];
    
    // 格式化返回
    const formattedBackups = backups.map(item => ({
      _id: item._id,
      file_name: item.file_name,
      file_url: item.file_url,
      file_size: item.file_size,
      file_size_text: formatFileSize(item.file_size),
      type: item.type,
      type_text: item.type === 'export' ? '手动导出' : '自动备份',
      data_type: item.data_type,
      format: item.format,
      status: item.status,
      status_text: getStatusText(item.status),
      created_at: item.created_at,
      created_at_text: formatDate(item.created_at),
      expires_at: item.expires_at,
      is_expired: item.expires_at && item.expires_at < Date.now()
    }));
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        backups: formattedBackups,
        total: total,
        page: page,
        page_size: page_size,
        total_pages: Math.ceil(total / page_size)
      }
    };
    
  } catch (error) {
    console.error('get-backup-list error:', error);
    return {
      code: 500,
      message: '服务器错误：' + error.message
    };
  }
};

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  
  return size.toFixed(1) + ' ' + units[i];
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
  const map = {
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  };
  return map[status] || status;
}
