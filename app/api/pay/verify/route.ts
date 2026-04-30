import { NextRequest, NextResponse } from 'next/server'

/**
 * 验证支付状态 / 标记为已支付（Mock模式）
 *
 * 前端轮询此接口确认支付结果。
 * Mock 模式下直接返回成功。
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ paid: false, message: '缺少订单号' })
  }

  // Mock 模式：直接返回支付成功
  return NextResponse.json({
    paid: true,
    orderId,
    message: '支付成功！感谢你的支持，现在开始畅聊吧。',
  })
}

// POST 也支持
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { orderId } = body

  if (!orderId) {
    return NextResponse.json({ paid: false, message: '缺少订单号' })
  }

  return NextResponse.json({
    paid: true,
    orderId,
    message: '支付成功！',
  })
}
