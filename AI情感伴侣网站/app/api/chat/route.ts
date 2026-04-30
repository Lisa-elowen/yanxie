import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // 这里可以集成真实的AI服务，比如OpenAI
    // 暂时返回一个简单的回复
    const responses = [
      '我理解你的感受。继续说说看？',
      '谢谢你分享这个。有什么我可以帮助你的吗？',
      '听起来你需要一些支持。我在这里陪着你。',
      '你的感受是正常的。让我们一起面对它。',
      '我很高兴你愿意和我聊这些。继续吧。'
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return NextResponse.json({ response: randomResponse })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}