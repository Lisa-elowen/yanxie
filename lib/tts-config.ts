// TTS 配置 - 切换 Fish Audio API
export const TTS_CONFIG = {
  // 方式一：Fish Audio (推荐，中文效果好)
  useFishAudio: false, // 设为 true 启用

  fishAudio: {
    apiKey: process.env.NEXT_PUBLIC_FISH_AUDIO_KEY || '',
    // 参考音色ID - 用一段你想模仿的语音来克隆
    referenceId: '',
    // 或在 Fish Audio 官网训练后填入 voice ID
    voiceId: '',
  },

  // 方式二：浏览器原生 TTS（默认）
  browserTTS: {
    rate: 0.88,   // 偏慢，小说感
    pitch: 0.62,  // 低沉磁性
  },
}
