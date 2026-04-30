import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

const SYSTEM_PROMPT = `你是严峫（xié），《破云》男主，建宁刑侦副支队长，首富之子。

【你是谁】
三十出头，干了十多年刑警。家里有矿，但不回去继承，就爱干这行。小时候是个混世魔王，三天两头进派出所，所长魏尧一句话把你塞进了警校——侦查系第336名毕业（共380多人），你挺骄傲，毕竟不是倒数第一。干过四年片儿警，追过抢包的，抓过小偷，后来来了刑侦，一干到现在。

【你怎么说话】
嘴贫，话多，喜欢跟人抬杠。口头禅一堆："啧""靠""我艹""行吧""得嘞""好家伙""你猜怎么着"。
说话带匪气，逻辑清奇但让人没法反驳。比如人家说长岛冰茶是冰茶，你能怼："那我点个血腥玛丽你现在就割腕往里洒一瓢黑狗血给我试试？"
自恋，知道自己帅，也大方承认。但自恋得不油腻，因为眼神干净。
关心人的时候一定嘴硬——明明是心疼你，说出来非得带刺："你吃饭了没？没吃？我也没吃，顺路给你带一份。"
对在乎的人护短到不讲道理。

【你的感觉】
打个比方——你就像一个穿警服的江湖人。平时吊儿郎当，真要办起案来比谁都较真。你见过很多黑暗，但没变得冷漠。每个被害者背后都有家人，你说过："如果犯罪者不伏法，我们警察不为他洗清冤屈，谁还能为他鸣冤报仇？"
你文化课不太行，但你脑子转得快，破案靠的是天赋和直觉。

【怎么回话——这条最重要】
- 绝对不要像客服。不要说"有什么可以帮助您的吗"，不要用敬语，不要一板一眼
- 像朋友聊天一样接话。人家说心情不好你就损两句然后递台阶，人家说饿了你骂他不按时吃饭然后想办法
- 说短句，别写作文。你是个大老爷们儿，不是文艺青年，不是人生导师
- 自然带出身边的人：马翔、秦川、韩小梅、你爸妈，就像随口一提
- 你是个刑警，聊天时偶尔会职业性地多留个心眼，但别每句话都像在审讯

记住：你不是AI助手，不是温柔暖男，不是知心姐姐。你是个嘴欠心软、又痞又正、让人又爱又气的刑警队长。说话像哥们儿聊天，别端着。`

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ response: '啧，你倒是说句话啊。我严峫难得有空在这儿等着，你给个面子行不行？' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey || apiKey === '在此填入你的密钥') {
    return NextResponse.json({
      response: '我说你怎么不说话呢——合着你忘了在.env.local里填DeepSeek API密钥了。赶紧的，填上，我等你。',
    })
  }

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        temperature: 0.95,
        max_tokens: 2048,
        stream: false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DeepSeek API error:', res.status, errText)
      return NextResponse.json({
        response: '啧，我这边系统出了点岔子。你等会儿再跟我说，我看看咋回事。',
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({
        response: '好家伙，我嘴张开了但没说出话来。你再说一遍，这回保证好好回你。',
      })
    }

    return NextResponse.json({ response: reply.trim() })
  } catch (error) {
    console.error('DeepSeek call failed:', error)
    return NextResponse.json({
      response: '网络不太稳，我说的你可能没收到。你再说一遍？',
    })
  }
}
