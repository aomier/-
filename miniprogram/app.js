// app.js
const DataManager = require('./utils/dataManager.js');
const AudioManager = require('./utils/audioManager.js');

App({
  onLaunch: function () {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'your-env-id',
        traceUser: true,
      });
    }

    this.globalData = {};

    // 全局初始化AudioManager
    AudioManager.init();

    // 初始化本地存储
    if (!DataManager.getData('questions')) {
      DataManager.saveData('questions', []);
    }
    if (!DataManager.getData('levelScores')) {
      DataManager.saveData('levelScores', []);
    }
  },

  onError(err) {
    console.error('应用错误：', err);
  }
});
