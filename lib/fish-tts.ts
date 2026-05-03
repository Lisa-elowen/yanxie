/**
 * Fish Audio TTS 服务
 * 需要：
 * 1. 去 https://fish.audio 注册账号
 * 2. 创建 API Key
 * 3. 上传一段音频克隆声音，获得 voice ID
 * 4. 在 .env.local 设置 NEXT_PUBLIC_FISH_AUDIO_KEY
 */

export async function speakWithFishAudio(
  text: string,
  voiceId: string,
  onStart?: () => void,
  onEnd?: () => void,
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_FISH_AUDIO_KEY
  if (!apiKey) {
    throw new Error('请先在 .env.local 中设置 NEXT_PUBLIC_FISH_AUDIO_KEY')
  }

  try {
    const response = await fetch(
      `https://api.fish.audio/v1/tts?text=${encodeURIComponent(text)}&voice=${voiceId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    )

    if (!response.ok) throw new Error('Fish Audio API 请求失败')

    const audioBlob = await response.blob()
    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)

    onStart?.()
    audio.onended = () => {
      URL.revokeObjectURL(url)
      onEnd?.()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      onEnd?.()
    }
    audio.play()
  } catch (e) {
    console.error('Fish Audio TTS 失败:', e)
    onEnd?.()
  }
}
