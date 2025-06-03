const AudioManager = require('../../utils/audioManager.js');

Page({
    data: {
      animationData: null,
      tipText: '',
      isDrawing: false,
      showResult: false,
      bannerImages: [
        { src: '/images/prize1.jpeg', title: '一等奖：红米智能手表' },
        { src: '/images/prize2.png', title: '二等奖：两桶羽毛球' },
        { src: '/images/prize3.jpg', title: '三等奖：笔记本' },
        { src: '/images/prize4.jpeg', title: '四等奖：一盒中性笔' }
      ]
    },    startLottery() {
      // 避免重复抽奖
      if (this.data.isDrawing) return;
      
      AudioManager.play('click');
      
      // 设置抽奖状态
      this.setData({
        isDrawing: true,
        showResult: false
      });
      
      const animation = wx.createAnimation({
        duration: 3000,
        timingFunction: 'ease-out'
      });
      
      const prizes = ['一等奖', '二等奖', '三等奖', '四等奖'];
      const randomIndex = Math.floor(Math.random() * 4); 
      const prize = prizes[randomIndex];
      const totalAngle = 360 * 5 + randomIndex * 90; // 增加旋转圈数，让效果更明显
      
      // 播放抽奖音效 - 使用AudioManager
      AudioManager.play('success');
      
      animation.rotate(totalAngle).step();
      
      this.setData({
        animationData: animation.export()
      });
      
      // 延迟显示结果
      setTimeout(() => {
        AudioManager.play('success');
        this.setData({
          tipText: `恭喜抽中${prize}！`,
          isDrawing: false,
          showResult: true
        });
        
        // 显示奖品弹窗
        wx.showToast({
          title: `恭喜获得${prize}`,
          icon: 'success',
          duration: 2000
        });
      }, 3200);
    }
  });