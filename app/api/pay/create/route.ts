import { NextRequest, NextResponse } from 'next/server'
import { PAY_CONFIG } from '../../../../lib/pay-config'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { type } = body // 'wechat' | 'alipay'

  const orderId = `YX${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  const amount = PAY_CONFIG.price

  // Mock 模式：模拟支付
  if (PAY_CONFIG.gateway === 'mock') {
    return NextResponse.json({
      success: true,
      orderId,
      amount,
      gateway: 'mock',
      mockPayUrl: '/api/pay/verify',
      qrcode: null,
      tip: '当前为模拟支付模式。支付网关配置后即可真实收款。',
    })
  }

  // PayJS（微信支付）
  if (PAY_CONFIG.gateway === 'payjs') {
    const payjsRes = await fetch('https://payjs.cn/api/native', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        mchid: PAY_CONFIG.payjs.mchid,
        total_fee: String(Math.round(amount * 100)),
        out_trade_no: orderId,
        notify_url: PAY_CONFIG.payjs.notifyUrl,
      }),
    })
    const payjsData = await payjsRes.json()

    if (payjsData.return_code === 1 && payjsData.code_url) {
      return NextResponse.json({
        success: true,
        orderId,
        amount,
        gateway: 'payjs',
        qrcode: payjsData.code_url,
        qrcodeImage: payjsData.qrcode,
      })
    }
    return NextResponse.json(
      { success: false, message: '支付创建失败，请稍后再试' },
      { status: 500 }
    )
  }

  // 未知网关
  return NextResponse.json(
    { success: false, message: '支付网关配置错误' },
    { status: 500 }
  )
}
