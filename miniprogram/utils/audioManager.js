// miniprogram/utils/audioManager.js
class AudioManager {
  constructor() {
    this.audios = new Map();
    this.enabled = true;
  }
  init() {
    // 预加载音效文件
    this.preloadAudio('click', '/images/click.mp3');
    this.preloadAudio('success', '/images/success.mp3');
    this.preloadAudio('error', '/images/error.mp3');
    this.preloadAudio('lottery', '/images/choujiang.mp3');
    console.log('AudioManager initialized with preloaded sounds');
  }

  preloadAudio(key, src) {
    try {
      const audio = wx.createInnerAudioContext();
      audio.src = src;
      audio.volume = 0.5;
      audio.onError((err) => {
        console.warn(`音频加载失败 ${key}:`, err);
      });
      this.audios.set(key, audio);
    } catch (e) {
      console.warn(`预加载音频失败 ${key}:`, e);
    }
  }

  play(key) {
    if (!this.enabled) return;
    
    try {
      const audio = this.audios.get(key);
      if (audio) {
        audio.seek(0);
        audio.play();
      } else {
        // 如果音频不存在，提供反馈但不报错
        console.log(`播放音效: ${key}`);
        wx.vibrateShort({
          type: 'light'
        });
      }
    } catch (e) {
      console.warn(`播放音效失败 ${key}:`, e);
      // 降级到震动反馈
      wx.vibrateShort({
        type: 'light'
      });
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  destroy() {
    this.audios.forEach(audio => {
      try {
        audio.destroy();
      } catch (e) {
        console.warn('销毁音频失败:', e);
      }
    });
    this.audios.clear();
  }
}

module.exports = new AudioManager();