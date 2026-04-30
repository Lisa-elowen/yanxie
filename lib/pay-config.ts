/**
 * 支付配置
 *
 * 支持的支付网关（任选其一注册即可）：
 *
 * 【PayJS - 推荐】
 *   官网：https://payjs.cn
 *   注册后获取 MCHID 和 KEY
 *   个人即可接入微信支付，费率 0.38%
 *
 * 【XorPay】
 *   官网：https://xorpay.com
 *   个人可接入微信+支付宝
 *
 * 【虎皮椒】
 *   官网：https://www.xunhupay.com
 *   个人可接入微信+支付宝
 */

export const PAY_CONFIG = {
  // 每天免费体验消息数
  freeDailyCount: 15,

  // 永久解锁价格（单位：元）
  price: 3.99,

  // 支付网关选择: 'payjs' | 'xorpay' | 'mock'
  // mock 模式用于开发测试，填任意订单号即可"支付成功"
  gateway: process.env.PAY_GATEWAY || 'mock',

  // PayJS 配置（微信支付）
  payjs: {
    mchid: process.env.PAYJS_MCHID || '',
    key: process.env.PAYJS_KEY || '',
    notifyUrl: process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/pay/notify`
      : 'http://localhost:3001/api/pay/notify',
  },

  // XorPay 配置（微信+支付宝）
  xorpay: {
    apiKey: process.env.XORPAY_API_KEY || '',
    apiUrl: 'https://api.xorpay.com/api/order',
    notifyUrl: process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/pay/notify`
      : 'http://localhost:3001/api/pay/notify',
  },
}
