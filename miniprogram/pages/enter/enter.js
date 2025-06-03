// pages/enter/enter.js
const db = wx.cloud.database();
const DataManager = require('../../utils/dataManager.js');
const AudioManager = require('../../utils/audioManager.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        result: '',
        questions: [] // 存储所有题目
    },

    getTitle(e) {
        const { value } = e.detail;
        this.setData({
            title: value
        })
    },

    getOption(e) {
        const { option } = e.currentTarget.dataset;
        const { value } = e.detail;
        const obj = {
            "A": "optionA",
            "B": "optionB",
            "C": "optionC",
            "D": "optionD"
        };
        const optionItem = obj[option];
        this.setData({
            [optionItem]: value
        })
    },

    getResult(e) {
        const { value } = e.detail;
        this.setData({
            result: value
        })
    },

    submit() {
        AudioManager.play('click');
        const { title, optionA, optionB, optionC, optionD, result, questions } = this.data;
        
        // 表单验证
        if (!title || !optionA || !optionB || !optionC || !optionD || !result) {
            AudioManager.play('error');
            wx.showToast({
                icon: 'none',
                title: '请填写完整信息',
            });
            return;
        }

        // 创建新题目
        const newQuestion = {
            id: Date.now(), // 使用时间戳作为唯一ID
            type: 'choice', // 添加类型字段
            title,
            option: [optionA, optionB, optionC, optionD],
            answer: result,
            explain: '这是一道选择题。' // 添加默认解释
        };

        // 添加到题库
        const updatedQuestions = [...questions, newQuestion];
        
        // 保存到本地存储
        DataManager.saveData('questions', updatedQuestions);

        // 更新页面数据
        this.setData({
            questions: updatedQuestions,
            // 清空表单
            title: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            result: '',
        });

        AudioManager.play('success');
        wx.showToast({
            icon: 'success',
            title: '题目添加成功',
        });
    },

    batchImportQuestions() {
        const questionsToImport = [
            {
                id: Date.now(),
                type: 'choice',
                title: "力学是物理学的一个分支，主要研究什么?",
                option: ["力学", "电磁学", "热力学", "量子力学"],
                answer: "A",
                explain: "力学是研究物体机械运动规律的物理学分支。"
            },
            {
                id: Date.now() + 1,
                type: 'choice',
                title: "电磁学的主要研究对象是什么?",
                option: ["电荷", "光", "热", "声音"],
                answer: "A",
                explain: "电磁学主要研究电荷及其相互作用。"
            },
            {
                id: Date.now() + 2,
                type: 'choice',
                title: "下列哪一项不属于经典力学的研究范围?",
                option: ["牛顿运动定律", "流体力学", "量子力学", "固体力学"],
                answer: "C"
            },
            {
                id: Date.now() + 3,
                type: 'choice',
                title: "下列哪种粒子不带电?",
                option: ["电子", "质子", "中子", "氢原子核"],
                answer: "C"
            },
            {
                id: Date.now() + 4,
                type: 'choice',
                title: "在电磁感应现象中，感应电动势的大小与什么因素成正比?",
                option: ["磁场强度", "导体运动速度", "磁通量变化率", "电阻"],
                answer: "C"
            },
            {
                id: Date.now() + 5,
                type: 'choice',
                title: "下列哪种辐射属于电磁波?",
                option: ["红外线", "α射线", "β射线", "中子射线"],
                answer: "A"
            },
            {
                id: Date.now() + 6,
                type: 'choice',
                title: "热力学第二定律的核心内容是什么?",
                option: ["能量守恒", "熵增原理", "质量守恒", "动量守恒"],
                answer: "B"
            },
            {
                id: Date.now() + 7,
                type: 'choice',
                title: "下列哪种过程是不可逆的?",
                option: ["冰块融化", "水蒸发", "气体膨胀做功", "气体压缩"],
                answer: "C"
            },
            {
                id: Date.now() + 8,
                type: 'choice',
                title: "光的波粒二象性是指什么?",
                option: ["光既具有波动性，又具有粒子性", "光只能表现出波动性", "光只能表现出粒子性", "光的速度是可变的"],
                answer: "A"
            },
            {
                id: Date.now() + 9,
                type: 'choice',
                title: "下列哪种现象无法用光的波动性解释?",
                option: ["光的干涉", "光的衍射", "光的色散", "光电效应"],
                answer: "D"
            },
            {
                id: Date.now() + 10,
                type: 'choice',
                title: "在狭义相对论中，物体的质量与速度之间的关系是什么?",
                option: ["质量与速度成正比", "质量与速度无关", "质量随着速度的增加而增加", "质量随着速度的增加而减少"],
                answer: "C"
            },
            {
                id: Date.now() + 11,
                type: 'choice',
                title: "下列哪种粒子具有最大穿透能力?",
                option: ["α粒子", "β粒子", "γ射线", "中子"],
                answer: "C"
            },
            {
                id: Date.now() + 12,
                type: 'choice',
                title: "下列哪种现象是量子力学的直接体现?",
                option: ["黑体辐射", "光的折射", "光的反射", "物体的自由落体运动"],
                answer: "A"
            },
            {
                id: Date.now() + 13,
                type: 'choice',
                title: "下列哪种粒子不参与强相互作用?",
                option: ["质子", "中子", "电子", "夸克"],
                answer: "C"
            },
            {
                id: Date.now() + 14,
                type: 'choice',
                title: "下列哪种力是引力的媒介粒子?",
                option: ["光子", "胶子", "引力子", "W和Z玻色子"],
                answer: "C"
            },
            {
                id: Date.now() + 15,
                type: 'blank',
                title: "气体的压强与温度成________关系。",
                answer: "正比",
                explain: "根据查理定律，气体的压强与温度成正比，假设体积不变。"
            },
            {
                id: Date.now() + 16,
                type: 'blank',
                title: "光的折射现象是由于光在不同介质中的________不同。",
                answer: "速度",
                explain: "光在不同介质中的传播速度不同，导致了折射现象。"
            },
            {
                id: Date.now() + 1,
                type: 'blank',
                title: "物体的重力与其质量的乘积叫做________。",
                answer: "重力",
                explain: "重力是物体所受的地球引力，与物体的质量成正比。"
            },
            {
                id: Date.now() + 2,
                type: 'blank',
                title: "电压是单位电荷所具有的________。",
                answer: "电势能",
                explain: "电压是单位电荷的电势能与电荷量的比值。"
            },
            {
                id: Date.now() + 3,
                type: 'blank',
                title: "在狭义相对论中，质量和速度的关系由________公式给出。",
                answer: "质能方程",
                explain: "爱因斯坦的质能方程E=mc²表明物体的能量与其质量和速度的平方成正比。"
            },
            {
                id: Date.now() + 4,
                type: 'blank',
                title: "在电场中，电场强度是单位________上所受的电力。",
                answer: "电荷",
                explain: "电场强度是电场中单位电荷所受到的力，单位是伏特每米(V/m)。"
            },
            {
                id: Date.now() + 5,
                type: 'blank',
                title: "根据欧姆定律，电流与电压成正比，与电阻成________关系。",
                answer: "反比",
                explain: "根据欧姆定律，电流与电压成正比，与电阻成反比。"
            },
            {
                id: Date.now() + 6,
                type: 'blank',
                title: "气体的压强与温度成________关系。",
                answer: "正比",
                explain: "根据查理定律，气体的压强与温度成正比，假设体积不变。"
            },
            {
                id: Date.now() + 7,
                type: 'blank',
                title: "光的折射现象是由于光在不同介质中的________不同。",
                answer: "速度",
                explain: "光在不同介质中的传播速度不同，导致了折射现象。"
            },
            {
                id: Date.now() + 8,
                type: 'blank',
                title: "在机械波中，波长与频率的乘积等于波速，这个关系叫做________公式。",
                answer: "波动方程",
                explain: "波动方程表明，波速等于波长与频率的乘积。"
            },
            {
                id: Date.now() + 9,
                type: 'blank',
                title: "下列两种量的比值叫做功率：________和时间。",
                answer: "功",
                explain: "功率是单位时间内所做的功，单位是瓦特(W)。"
            },
            {
                id: Date.now() + 10,
                type: 'blank',
                title: "根据热力学第二定律，孤立系统的总熵总是________。",
                answer: "增加",
                explain: "热力学第二定律指出，孤立系统中的总熵是不断增加的。"
            },
            {
                id: Date.now() + 11,
                type: 'blank',
                title: "光的粒子性可以通过________效应来证明。",
                answer: "光电",
                explain: "光电效应是光的粒子性表现之一，即光能以粒子形式与物质发生相互作用。"
            },
            {
                id: Date.now() + 12,
                type: 'blank',
                title: "量子力学中，粒子的________可以用波函数来描述。",
                answer: "状态",
                explain: "量子力学中，粒子的状态由波函数描述，波函数的平方给出了粒子的位置概率。"
            },
            {
                id: Date.now() + 13,
                type: 'blank',
                title: "物体在自由下落过程中，重力加速度为________ m/s²。",
                answer: "9.8",
                explain: "地球表面的重力加速度约为9.8 m/s²。"
            }
        ];

        // 获取现有题库
        let existingQuestions = DataManager.getData('questions') || [];
        console.log('Existing questions:', existingQuestions); // 添加日志
        
        // 合并新题目
        const updatedQuestions = [...existingQuestions, ...questionsToImport];
        
        // 保存到本地存储
        DataManager.saveData('questions', updatedQuestions);
        console.log('Updated questions:', updatedQuestions); // 添加日志
        
        // 更新页面数据
        this.setData({
            questions: updatedQuestions
        });

        // 只显示导入成功提示
        wx.showToast({
            icon: 'success',
            title: `成功导入${questionsToImport.length}题`,
            duration: 2000
        });
    },

    saveUserInfo: function(userInfo) {
        DataManager.saveData('userInfo', userInfo);
    },

    getUserInfo: function() {
        return DataManager.getData('userInfo');
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 加载已有的题库
        const questions = DataManager.getData('questions') || [];
        this.setData({
            questions
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

    },

    // 删除题目
    deleteQuestion(e) {
        AudioManager.play('click');
        const { id } = e.currentTarget.dataset;
        const { questions } = this.data;
        
        const updatedQuestions = questions.filter(q => q.id !== id);
        
        // 保存到本地存储
        DataManager.saveData('questions', updatedQuestions);
        
        this.setData({
            questions: updatedQuestions
        });

        AudioManager.play('success');
        wx.showToast({
            icon: 'success',
            title: '删除成功',
        });
    },

    deleteAllQuestions() {
        AudioManager.play('click');
        wx.showModal({
            title: '警告',
            content: '确定要删除所有题目吗？此操作不可恢复！',
            confirmText: '确定删除',
            confirmColor: '#ff4444',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    AudioManager.play('success');
                    // 清空题库
                    DataManager.saveData('questions', []);
                    
                    // 更新页面数据
                    this.setData({
                        questions: []
                    });

                    wx.showToast({
                        title: '已清空题库',
                        icon: 'success'
                    });
                } else {
                    AudioManager.play('error');
                }
            }
        });
    }
})