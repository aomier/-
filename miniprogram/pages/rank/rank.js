// pages/rank/rank.js
const DataManager = require('../../utils/dataManager.js');
const AudioManager = require('../../utils/audioManager.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        myScore: null,
        myRank: 0,
        showAll: false
    },

    timestampToTime(cjsj){
        //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var date = new Date(cjsj);
        var Y = date.getFullYear() + '/';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth() + 1) + '/';
        var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
        var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes())+ ':';
        var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
        return  Y + M + D + h + m + s;
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadRankings();
    },

    loadRankings() {
        const rankings = DataManager.getData('rankings') || [];
        const userInfo = DataManager.getData('userInfo');
        
        // 查找当前用户的最高分和排名
        let myScore = null;
        let myRank = 0;
        
        if (userInfo) {
            myScore = DataManager.getUserBestScore(userInfo.nickName);
            if (myScore) {
                myRank = rankings.findIndex(r => r.id === myScore.id) + 1;
            }
        }

        // 格式化数据以适应现有页面
        const formattedRankings = rankings.map(item => ({
            avatarUrl: item.userInfo.avatarUrl,
            nickName: item.userInfo.nickName,
            num: item.successNum,
            failNum: item.failNum || 0,
            score: item.score,
            time: item.time,
            date: item.date
        }));

        this.setData({
            list: this.data.showAll ? formattedRankings : formattedRankings.slice(0, 10),
            myScore,
            myRank
        });
    },

    // 显示更多记录
    showMore() {
        AudioManager.play('click');
        this.setData({
            showAll: true
        }, () => {
            this.loadRankings();
        });
    },

    // 重新答题
    goAnswer() {
        AudioManager.play('click');
        wx.redirectTo({
            url: '../answer/answer'
        });
    },

    // 返回首页
    goIndex() {
        AudioManager.play('click');
        wx.navigateBack({
            delta: 1
        });
    },

    // 清除排行榜
    clearRankings() {
        AudioManager.play('click');
        wx.showModal({
            title: '确认清除',
            content: '确定要清除所有排行榜记录吗？',
            success: (res) => {
                if (res.confirm) {
                    AudioManager.play('success');
                    DataManager.clearRankings();
                    this.loadRankings();
                    wx.showToast({
                        title: '清除成功',
                        icon: 'success'
                    });
                } else {
                    AudioManager.play('error');
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.loadRankings();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})