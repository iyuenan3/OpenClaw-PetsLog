/**
 * 网络状态检测工具
 * 支持微信小程序和 H5 端
 */

// 网络状态
let isConnected = true
let networkType = 'wifi'

/**
 * 初始化网络状态监听
 */
export function initNetworkMonitor() {
  // 微信小程序
  // #ifdef MP-WEIXIN
  wx.onNetworkStatusChange((res) => {
    isConnected = res.isConnected
    networkType = res.networkType
    console.log('[Network] 网络状态变化:', res)
  })
  
  // 获取初始网络状态
  wx.getNetworkType({
    success: (res) => {
      isConnected = res.networkType !== 'none'
      networkType = res.networkType
    }
  })
  // #endif
  
  // H5 端
  // #ifdef H5
  const updateNetworkStatus = () => {
    isConnected = navigator.onLine
    networkType = navigator.connection?.effectiveType || 'unknown'
    console.log('[Network] 网络状态变化:', { isConnected, networkType })
  }
  
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  updateNetworkStatus()
  // #endif
}

/**
 * 检查当前是否联网
 */
export function isNetworkConnected() {
  return isConnected
}

/**
 * 获取网络类型
 */
export function getNetworkType() {
  return networkType
}

/**
 * 等待网络恢复
 * @param {number} timeout - 超时时间（毫秒），默认 30 秒
 */
export function waitForNetwork(timeout = 30000) {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      resolve(true)
      return
    }
    
    const startTime = Date.now()
    
    const checkInterval = setInterval(() => {
      if (isConnected) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        reject(new Error('等待网络恢复超时'))
      }
    }, 1000)
  })
}

/**
 * 获取网络状态提示文本
 */
export function getNetworkStatusText() {
  if (!isConnected) {
    return '📴 离线模式'
  }
  
  const typeMap = {
    'wifi': '📶 WiFi',
    '4g': '📶 4G',
    '5g': '📶 5G',
    '3g': '📶 3G',
    '2g': '📶 2G',
    'ethernet': '🔌 有线网络',
    'none': '📴 无网络',
    'unknown': '📶 未知网络'
  }
  
  return typeMap[networkType] || '📶 在线'
}

export default {
  initNetworkMonitor,
  isNetworkConnected,
  getNetworkType,
  waitForNetwork,
  getNetworkStatusText
}
