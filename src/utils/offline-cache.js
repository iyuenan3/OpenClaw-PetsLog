/**
 * 离线数据缓存工具
 * 支持在无网络时暂存数据，网络恢复后自动同步
 */

import { isNetworkConnected, waitForNetwork } from './network'

const CACHE_KEY = 'petslog_offline_cache'
const MAX_CACHE_SIZE = 100

/**
 * 缓存数据结构
 * {
 *   timestamp: number,
 *   actions: Array<{
 *     type: string,
 *     data: any,
 *     timestamp: number
 *   }>
 * }
 */

/**
 * 获取离线缓存
 */
export function getOfflineCache() {
  try {
    const cache = uni.getStorageSync(CACHE_KEY)
    return cache ? JSON.parse(cache) : { timestamp: Date.now(), actions: [] }
  } catch (error) {
    console.error('[OfflineCache] 读取缓存失败:', error)
    return { timestamp: Date.now(), actions: [] }
  }
}

/**
 * 保存离线缓存
 */
function saveOfflineCache(cache) {
  try {
    // 限制缓存大小
    if (cache.actions.length > MAX_CACHE_SIZE) {
      cache.actions = cache.actions.slice(-MAX_CACHE_SIZE)
    }
    cache.timestamp = Date.now()
    uni.setStorageSync(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('[OfflineCache] 保存缓存失败:', error)
  }
}

/**
 * 添加离线操作到缓存
 * @param {string} type - 操作类型（create/update/delete）
 * @param {object} data - 操作数据
 */
export function addToOfflineCache(type, data) {
  const cache = getOfflineCache()
  cache.actions.push({
    type,
    data,
    timestamp: Date.now()
  })
  saveOfflineCache(cache)
  
  console.log('[OfflineCache] 添加离线操作:', { type, actionCount: cache.actions.length })
  
  // 提示用户
  uni.showToast({
    title: '📴 已保存到离线缓存',
    icon: 'none',
    duration: 1500
  })
}

/**
 * 同步离线缓存到服务器
 * @param {Function} syncFn - 同步函数，接收 (type, data) 参数
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function syncOfflineCache(syncFn) {
  const cache = getOfflineCache()
  
  if (cache.actions.length === 0) {
    return { success: 0, failed: 0 }
  }
  
  // 等待网络恢复
  try {
    await waitForNetwork(30000)
  } catch (error) {
    console.error('[OfflineCache] 等待网络超时:', error)
    uni.showToast({
      title: '📴 网络未恢复，稍后同步',
      icon: 'none'
    })
    return { success: 0, failed: cache.actions.length }
  }
  
  let success = 0
  let failed = 0
  const failedActions = []
  
  // 逐个同步
  for (const action of cache.actions) {
    try {
      await syncFn(action.type, action.data)
      success++
    } catch (error) {
      console.error('[OfflineCache] 同步失败:', error)
      failed++
      failedActions.push(action)
    }
  }
  
  // 清除已同步的操作
  if (failedActions.length < cache.actions.length) {
    cache.actions = failedActions
    saveOfflineCache(cache)
  }
  
  console.log('[OfflineCache] 同步完成:', { success, failed })
  
  if (success > 0) {
    uni.showToast({
      title: `✅ 已同步 ${success} 条数据`,
      icon: 'success'
    })
  }
  
  return { success, failed }
}

/**
 * 清除离线缓存
 */
export function clearOfflineCache() {
  try {
    uni.removeStorageSync(CACHE_KEY)
    console.log('[OfflineCache] 缓存已清除')
  } catch (error) {
    console.error('[OfflineCache] 清除缓存失败:', error)
  }
}

/**
 * 获取缓存中的操作数量
 */
export function getCacheSize() {
  const cache = getOfflineCache()
  return cache.actions.length
}

/**
 * 检查是否有待同步的离线数据
 */
export function hasPendingSync() {
  const cache = getOfflineCache()
  return cache.actions.length > 0
}

export default {
  getOfflineCache,
  addToOfflineCache,
  syncOfflineCache,
  clearOfflineCache,
  getCacheSize,
  hasPendingSync
}
