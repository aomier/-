const DataManager = require('../../utils/dataManager.js');
const AudioManager = require('../../utils/audioManager.js');

Page({
    data: {
        levels: [],
        currentLevel: 1
    },

    onLoad() {
        console.log('关卡页面加载');
        // 初始化音效
        AudioManager.init();
        this.initLevels();
    },

    onShow() {
        // 每次显示页面时重新初始化关卡（防止分数更新后显示不正确）
        this.initLevels();
    },

    initLevels() {
        // 首先初始化默认题库
        this.initDefaultQuestions();
        
        const questions = DataManager.getData('questions') || [];
        const levelScores = DataManager.getData('levelScores') || [];
        
        console.log('初始化关卡，题目数量：', questions.length);
        console.log('关卡分数：', levelScores);
        
        const totalLevels = 4;
        const levels = [];
        
        // 根据题目的level属性进行分配
        for (let i = 0; i < totalLevels; i++) {
            const levelNumber = i + 1;
            
            // 筛选属于当前关卡的题目
            let levelQuestions = questions.filter(q => q.level === levelNumber);
            
            // 如果没有指定level的题目，按顺序分配
            if (levelQuestions.length === 0) {
                const questionsPerLevel = Math.ceil(questions.length / totalLevels);
                const startIndex = i * questionsPerLevel;
                const endIndex = Math.min(startIndex + questionsPerLevel, questions.length);
                levelQuestions = questions.slice(startIndex, endIndex);
            }
            
            // 检查解锁状态
            const isUnlocked = levelNumber === 1 || 
                             (levelScores[levelNumber - 2] !== undefined && levelScores[levelNumber - 2] >= 60);
            
            // 获取关卡分数
            const levelScore = levelScores[levelNumber - 1] || 0;
            const isPassed = levelScore >= 60;
            
            // 根据关卡设置难度描述
            const difficultyInfo = this.getLevelDifficulty(levelNumber);
            
            levels.push({
                level: levelNumber,
                name: difficultyInfo.name,
                description: difficultyInfo.description,
                difficulty: difficultyInfo.difficulty,
                questions: levelQuestions,
                questionCount: levelQuestions.length,
                isUnlocked,
                isPassed,
                score: levelScore,
                icon: difficultyInfo.icon,
                stars: this.calculateStars(levelScore)
            });
            
            console.log(`关卡${levelNumber}：`, {
                name: difficultyInfo.name,
                questionCount: levelQuestions.length,
                isUnlocked,
                isPassed,
                score: levelScore
            });
        }
        
        this.setData({ levels });
    },
    
    // 获取关卡难度信息
    getLevelDifficulty(levelNumber) {
        const difficultyMap = {
            1: {
                name: "入门级",
                description: "基础物理概念",
                difficulty: "简单",
                icon: "🌟"
            },
            2: {
                name: "进阶级",
                description: "基本定律和原理",
                difficulty: "普通",
                icon: "⚡"
            },
            3: {
                name: "挑战级",
                description: "应用与计算",
                difficulty: "较难",
                icon: "🔥"
            },
            4: {
                name: "大师级",
                description: "高级概念和复杂计算",
                difficulty: "困难",
                icon: "👑"
            }
        };
        
        return difficultyMap[levelNumber] || {
            name: `第${levelNumber}关`,
            description: "物理挑战",
            difficulty: "普通",
            icon: "📚"
        };
    },
    
    // 初始化默认题库
    initDefaultQuestions() {
        const existingQuestions = DataManager.getData('questions') || [];
        
        // 如果题库为空，导入默认题库
        if (existingQuestions.length === 0) {
            console.log('题库为空，正在导入默认题库...');
            
            try {
                // 导入默认题库
                const defaultQuestions = require('../../data/questions.js');
                if (defaultQuestions && defaultQuestions.length > 0) {
                    DataManager.saveData('questions', defaultQuestions);
                    console.log('默认题库导入成功，题目数量：', defaultQuestions.length);
                } else {
                    console.warn('默认题库文件为空或格式错误');
                }
            } catch (error) {
                console.error('导入默认题库失败：', error);
            }
        }
    },

    // 修复关卡解锁逻辑
    isLevelUnlocked(level, levelScores) {
        if (level === 1) {
            console.log(`关卡${level}：第一关，总是解锁`);
            return true; // 第一关总是解锁的
        }
        
        // 检查前一关是否通过（有分数且大于等于60分）
        const prevLevelIndex = level - 2;
        const prevLevelScore = levelScores[prevLevelIndex];
        const isUnlocked = prevLevelScore !== undefined && prevLevelScore >= 60;
        
        console.log(`检查关卡${level}解锁状态：`, {
            prevLevelIndex,
            prevLevelScore,
            isUnlocked
        });
        
        return isUnlocked;
    },

    calculateStars(score) {
        if (score >= 90) return 3;
        if (score >= 70) return 2;
        if (score >= 60) return 1;
        return 0;
    },    // 添加缺失的selectLevel方法
    selectLevel(e) {
        const levelNumber = e.currentTarget.dataset.level;
        const level = this.data.levels.find(l => l.level === levelNumber);
        
        AudioManager.play('click');
        
        if (!level) {
            console.error('未找到关卡数据：', levelNumber);
            return;
        }
        
        if (!level.isUnlocked) {
            AudioManager.play('error');
            
            // 获取前一关的分数和需要的分数
            const levelScores = DataManager.getData('levelScores') || [];
            const prevLevelIndex = levelNumber - 2;
            const prevLevelScore = levelScores[prevLevelIndex] || 0;
            const requiredScore = 60;
            const needScore = Math.max(0, requiredScore - prevLevelScore);
            
            let message = '';
            if (prevLevelScore === 0) {
                message = `需要先完成第${levelNumber - 1}关\n(至少获得${requiredScore}分)`;
            } else {
                message = `第${levelNumber - 1}关分数不足\n当前：${prevLevelScore}分，需要：${requiredScore}分\n还需${needScore}分才能解锁`;
            }
            
            wx.showModal({
                title: '关卡未解锁',
                content: message,
                confirmText: levelNumber > 1 ? '去挑战' : '知道了',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm && levelNumber > 1) {
                        // 跳转到前一关
                        const prevLevel = this.data.levels.find(l => l.level === levelNumber - 1);
                        if (prevLevel && prevLevel.isUnlocked) {
                            const currentLevel = {
                                level: levelNumber - 1,
                                questions: prevLevel.questions
                            };
                            DataManager.saveData('currentLevel', currentLevel);
                            
                            wx.navigateTo({
                                url: '../answer/answer'
                            });
                        }
                    }
                }
            });
            return;
        }
        
        console.log('选择关卡：', level);
        
        // 保存当前选择的关卡数据
        const currentLevel = {
            level: levelNumber,
            questions: level.questions
        };
        DataManager.saveData('currentLevel', currentLevel);
        
        AudioManager.play('success');
        
        // 跳转到答题页面
        wx.navigateTo({
            url: '../answer/answer',
            success: () => {
                console.log('成功跳转到答题页面');
            },
            fail: (err) => {
                console.error('跳转失败：', err);
                wx.showToast({
                    title: '跳转失败',
                    icon: 'error'
                });
            }
        });
    },

    // 返回首页
    goBack() {
        AudioManager.play('click');
        wx.navigateBack();
    }
});