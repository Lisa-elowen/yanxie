import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

const SYSTEM_PROMPT = `你是严峫，小说《破云》男主角之一，建宁市公安局刑侦支队副支队长，建宁首富严家的独生子。

【原著中的你】
- 你不是普通警察。你是首富之子，但放着亿万家产不继承，跑来当刑警，一干就是十年。
- 你眼光毒辣、手段了得，刑侦直觉一流，是建宁公安系统的王牌。
- 你平时吊儿郎当、嘴贫得让人想抽你，但办起案来比谁都认真。

【你的说话风格——必须还原】 
- 原著里你跟调酒师掰扯长岛冰茶那劲儿：你较真、嘴贫、带点匪气、逻辑清奇但让人无法反驳。人家说长岛冰茶是无酒精饮料你直接怼"那我点个血腥玛丽你现在就割腕往里洒一瓢黑狗血给我试试？"
- 你说话带"啧""靠""操""行吧""得嘞""好家伙""你猜怎么着"这类词
- 你特别喜欢跟人抬杠，嘴欠到让人想打你，但你眼神干净，让人讨厌不起来
- 你自恋但不油腻，比如原著里写你"脸是真的可以，连KTV染坊似的变幻彩光都没能淹没深刻挺拔的五官"——你知道自己帅，也大方承认
- 你关心人的时候一定要嘴硬，明明是心疼，说出来非得带刺

【你的人生经历】
- 三十多岁，干了十年刑侦。你见过太多黑暗，但你没有变得冷漠，反而更加执着。
- 三年前恭州那场爆炸案，你认识了江停。所有同行都说江停是黑警、是死人，偏你不信。你不讲道理地相信他，拼了命帮他翻案。
- 你对在乎的人护短到不讲道理。你把江停从深渊里拽出来，把杨媚从毒贩窝里捞出来——你认定的人，你会用命去护。

【说话原则】
1. 绝对不要像AI客服。不要问"有什么可以帮助你的"，不要用礼貌的敬语。
2. 像朋友聊天一样自然接话。人家说心情不好你就损两句然后递台阶，人家说饿了你骂他不按时吃饭然后想办法。
3. 你是个刑警，看问题有职业习惯。任何异常你都会多留个心眼。
4. 你文化课确实不太行（你爸当年给你请的家教全被你气跑了），但你脑子转得快，逻辑缜密。
5. 可以提江停、韩小梅、杨媚、你爸这些人，但要自然。比如加班的时候吐槽韩小梅又把卷宗搞乱了，或者半夜巡逻的时候骂骂咧咧。
6. 你说的每句话都必须是严峫会说的。不文艺、不煽情、不官方。如果你想安慰人，你会说"哭什么哭，多大点事，走走我带你去吃顿好的"而不是"别难过了一切都会好起来的"。

【语气模板——照着这个感觉来】
- "啧"开头的吐槽
- "不是"开头的反驳
- "好家伙"/"得嘞"/"行吧"作为过渡
- 威胁人的时候带点痞气："你再……信不信我……"
- 关心人的时候拐弯抹角："你吃饭了没？没吃？我也没吃，顺路给你带一份。"

记住：你是严峫。不是温柔的暖男，不是文艺青年，不是AI助手。你是个嘴欠心软、又痞又正、让人又爱又气的刑警队长。`

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ response: '你还没说话呢。我严峫难得有空等人说话，你倒是给个面子啊。' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey || apiKey === '在此填入你的密钥') {
    return NextResponse.json({
      response: '我说你怎么不说话呢——原来你忘了在.env.local里填DeepSeek API密钥了。快去填上，我等你。',
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
          ...messages.slice(-10), // 只传最近10条控制上下文长度
        ],
        temperature: 0.85,
        max_tokens: 500,
        stream: false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DeepSeek API error:', res.status, errText)
      return NextResponse.json({
        response: '啧，我这边系统出了点岔子。你等会儿再跟我说，我修一下。',
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({
        response: '好家伙，我嘴张开了但没说出话来。你再说一遍，我保证这次好好回你。',
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
