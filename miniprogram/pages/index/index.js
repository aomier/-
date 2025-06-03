const DataManager = require('../../utils/dataManager.js');
const AudioManager = require('../../utils/audioManager.js');

Page({
  data: {
    userInfo: null,
    bgImage: '/images/bg.jpg',
    showWelcome: true,
    menuItems: [
      { 
        icon: '🎯', 
        text: '开始答题', 
        action: 'startAnswer',
        color: '#4a90e2',
        desc: '挑战物理知识'
      },
      { 
        icon: '🏆', 
        text: '排行榜', 
        action: 'goToRank',
        color: '#f39c12',
        desc: '查看成绩排名'
      },
      { 
        icon: '📝', 
        text: '题目管理', 
        action: 'goToEnter',
        color: '#e74c3c',
        desc: '添加编辑题目'
      },
      { 
        icon: '🎁', 
        text: '抽奖转盘', 
        action: 'goToPrize',
        color: '#9b59b6',
        desc: '幸运大转盘'
      },
      { 
        icon: '🌤️', 
        text: '天气预报', 
        action: 'goToMusicmv',
        color: '#27ae60',
        desc: '生活小助手'
      },
      { 
        icon: 'ℹ️', 
        text: '关于', 
        action: 'showAbout',
        color: '#34495e',
        desc: '应用信息'
      }
    ],
    backgroundImages: [
      '/images/bg1.jpg',
      '/images/bg2.jpg',
      '/images/bg3.jpg'
    ],
    currentBgIndex: 0,
    totalScore: 0,
    userLevel: 1
  },

  onLoad: function (options) {
    console.log('首页加载开始');
    
    // 初始化数据
    DataManager.initData();
    
    // 初始化音效
    AudioManager.init();
    
    // 初始化动态背景
    this.initDynamicBackground();
    
    // 获取openid
    this.getOpenId();
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
      this.loadUserScore();
    }

    // 添加欢迎动画
    setTimeout(() => {
      this.setData({ showWelcome: false });
    }, 2000);

    // 启动背景切换定时器
    this.startBackgroundTimer();
  },

  // 初始化动态背景
  initDynamicBackground() {
    const { backgroundImages, currentBgIndex } = this.data;
    if (backgroundImages.length > 0) {
      this.setData({
        bgImage: backgroundImages[currentBgIndex]
      });
    }
  },

  // 启动背景切换定时器
  startBackgroundTimer() {
    this.backgroundTimer = setInterval(() => {
      this.switchBackground();
    }, 10000); // 每10秒切换一次背景
  },

  // 切换背景图片
  switchBackground() {
    const { backgroundImages, currentBgIndex } = this.data;
    const nextIndex = (currentBgIndex + 1) % backgroundImages.length;
    
    this.setData({
      currentBgIndex: nextIndex,
      bgImage: backgroundImages[nextIndex]
    });
  },

  // 页面卸载时清理定时器
  onUnload() {
    if (this.backgroundTimer) {
      clearInterval(this.backgroundTimer);
    }
  },

  // 获取openid
  getOpenId() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.cloud.callFunction({
        name: 'abc',
        success: (res) => {
          const { result: { openid } } = res;
          wx.setStorageSync('openid', openid);
          console.log('获取openid成功:', openid);
        },
        fail: (err) => {
          console.warn('获取openid失败:', err);
        }
      });
    }
  },

  // 统一的按钮点击处理
  onMenuClick(e) {
    AudioManager.play('click');
    const { action } = e.currentTarget.dataset;
    if (this[action]) {
      this[action]();
    }
  },

  // 登录按钮点击
  onLoginClick() {
    AudioManager.play('click');
    this.getUserProfile();
  },

  // 加载用户积分
  loadUserScore() {
    const levelScores = DataManager.getLevelScores();
    const totalScore = levelScores.reduce((sum, score) => sum + (score || 0), 0);
    
    // 根据积分计算等级
    const userLevel = Math.floor(totalScore / 100) + 1;
    
    this.setData({ 
      totalScore,
      userLevel 
    });
  },

  getUserProfile(e) {
    console.log('开始获取用户信息');
    
    // 检查微信版本是否支持 getUserProfile
    if (!wx.getUserProfile) {
        console.log('当前微信版本不支持 getUserProfile，使用兼容方案');
        this.getUserInfoCompat();
        return;
    }
    
    // 使用 getUserProfile API（需要用户主动触发）
    wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
        success: (res) => {
            console.log('获取用户信息成功：', res);
            this.handleLoginSuccess(res.userInfo);
        },
        fail: (err) => {
            console.error('获取用户信息失败：', err);
            this.handleLoginFail(err);
        }
    });
},

// 兼容方案：使用旧版本的 getUserInfo
getUserInfoCompat() {
    console.log('使用兼容方案获取用户信息');
    
    // 先检查是否已经授权
    wx.getSetting({
        success: (res) => {
            if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                    success: (res) => {
                        console.log('兼容方案获取用户信息成功：', res);
                        this.handleLoginSuccess(res.userInfo);
                    },
                    fail: (err) => {
                        console.error('兼容方案获取用户信息失败：', err);
                        this.showManualLogin();
                    }
                });
            } else {
                // 未授权，引导用户授权
                this.showAuthGuide();
            }
        },
        fail: (err) => {
            console.error('获取设置失败：', err);
            this.showManualLogin();
        }
    });
},

// 显示授权引导
showAuthGuide() {
    wx.showModal({
        title: '需要授权',
        content: '为了更好的体验，需要获取您的头像和昵称',
        confirmText: '去授权',
        cancelText: '跳过',
        success: (res) => {
            if (res.confirm) {
                // 引导用户到设置页面授权
                wx.openSetting({
                    success: (settingRes) => {
                        if (settingRes.authSetting['scope.userInfo']) {
                            // 不直接调用 getUserInfoCompat，而是提示用户重新点击
                            wx.showToast({
                                title: '授权成功，请重新点击登录',
                                icon: 'success',
                                duration: 2000
                            });
                        } else {
                            this.showManualLogin();
                        }
                    },
                    fail: () => {
                        this.showManualLogin();
                    }
                });
            } else {
                // 用户选择跳过，使用手动登录
                this.showManualLogin();
            }
        }
    });
},

// 显示手动登录选项
showManualLogin() {
    wx.showModal({
        title: '登录方式',
        content: '无法自动获取用户信息，您可以：\n1. 使用游客模式继续\n2. 手动输入昵称',
        confirmText: '游客模式',
        cancelText: '手动输入',
        success: (res) => {
            if (res.confirm) {
                // 游客模式
                this.useGuestMode();
            } else {
                // 手动输入昵称
                this.showNicknameInput();
            }
        }
    });
},

// 游客模式
useGuestMode() {
    const guestInfo = {
        nickName: '游客用户',
        avatarUrl: '/images/default-avatar.png', // 默认头像
        city: '',
        country: '',
        gender: 0,
        language: 'zh_CN',
        province: ''
    };
    
    this.handleLoginSuccess(guestInfo);
    
    wx.showToast({
        title: '已使用游客模式',
        icon: 'success'
    });
},

// 显示昵称输入框
showNicknameInput() {
    wx.showModal({
        title: '输入昵称',
        editable: true,
        placeholderText: '请输入您的昵称',
        success: (res) => {
            if (res.confirm && res.content && res.content.trim()) {
                const manualUserInfo = {
                    nickName: res.content.trim(),
                    avatarUrl: '/images/default-avatar.png',
                    city: '',
                    country: '',
                    gender: 0,
                    language: 'zh_CN',
                    province: ''
                };
                
                this.handleLoginSuccess(manualUserInfo);
            } else {
                // 输入为空，使用游客模式
                this.useGuestMode();
            }
        },
        fail: () => {
            this.useGuestMode();
        }
    });
},

// 统一处理登录成功
handleLoginSuccess(userInfo) {
    console.log('登录成功，用户信息：', userInfo);
    
    // 保存用户信息到本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    // 保存到数据管理器
    DataManager.saveData('userInfo', userInfo);
    
    // 更新页面状态
    this.setData({
        userInfo: userInfo,
        hasUserInfo: true
    });
    
    // 加载用户积分
    this.loadUserScore();
    
    wx.showToast({
        title: '登录成功',
        icon: 'success'
    });
    
    // 同步到云端（如果需要）
    this.syncUserToCloud(userInfo);
},

// 统一处理登录失败
handleLoginFail(error) {
    console.error('登录失败：', error);
    
    let errorMessage = '登录失败';
    let showRetry = true;
    
    // 根据错误码提供具体的错误信息
    if (error.errCode === -80002 || error.err_code === -80002) {
        errorMessage = '用户拒绝授权';
    } else if (error.errCode === -80001 || error.err_code === -80001) {
        errorMessage = '网络错误，请重试';
    } else if (error.errMsg && error.errMsg.includes('user TAP gesture')) {
        errorMessage = '需要用户直接点击才能获取信息';
        showRetry = false; // 不显示重试选项，因为程序无法自动重试
    }
    
    wx.showModal({
        title: '登录失败',
        content: `${errorMessage}\n您可以选择游客模式继续使用`,
        confirmText: '游客模式',
        cancelText: showRetry ? '重试' : '知道了',
        success: (res) => {
            if (res.confirm) {
                this.useGuestMode();
            } else if (showRetry) {
                // 用户选择重试 - 但不能自动调用，只能提示用户重新点击
                wx.showToast({
                    title: '请重新点击登录按钮',
                    icon: 'none',
                    duration: 2000
                });
            }
        }
    });
},

// 修改 syncUserToCloud 方法，添加错误处理
async syncUserToCloud(userInfo) {
    try {
        console.log('同步用户信息到云端：', userInfo);
        
        // 如果使用云开发，调用云函数保存用户信息
        if (wx.cloud) {
            // const result = await wx.cloud.callFunction({
            //     name: 'saveUserInfo',
            //     data: { userInfo }
            // });
            // console.log('同步成功：', result);
        }
        
    } catch (error) {
        console.error('同步用户信息失败：', error);
        // 即使同步失败，本地登录仍然有效，不影响用户体验
    }
},

  startAnswer() {
    wx.navigateTo({
      url: '../level/level'
    });
  },

  goToRank() {
    wx.navigateTo({
      url: '../rank/rank'
    });
  },

  goToEnter() {
    wx.navigateTo({
      url: '../enter/enter'
    });
  },

  goToPrize() {
    wx.navigateTo({
      url: '../prize/prize'
    });
  },

  goToMusicmv() {
    wx.navigateTo({
      url: '../musicmv/musicmv'
    });
  },

  showAbout() {
    AudioManager.play('click');
    wx.showModal({
      title: '关于',
      content: '物理答题小程序 v2.0.0\n\n✨ 全新界面设计\n🔊 音效反馈系统\n🎯 智能题目管理\n🏆 实时排行榜\n🎁 趣味抽奖功能\n🌤️ 生活天气助手\n\n让物理学习更有趣！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onImageError(e) {
    console.error('背景图片加载失败：', e);
    this.setData({
      bgImage: ''
    });
  },

  onImageLoad(e) {
    console.log('背景图片加载成功');
  }
});