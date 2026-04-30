import { NextRequest, NextResponse } from 'next/server'

/**
 * 支付回调通知（Webhook）
 *
 * 支付平台在用户支付成功后，会向此地址发POST通知。
 */
export async function POST(request: NextRequest) {
  const body = await request.text()

  console.log('支付回调收到:', body)

  // 这里根据实际支付网关解析回调数据
  // PayJS: return_code=1 & out_trade_no=xxx & sign=xxx
  // XorPay: status=1 & order_id=xxx & sign=xxx

  // 验证签名（略）
  // 更新数据库（略）

  // 返回 success 告诉支付平台已收到通知
  return new Response('success')
}
