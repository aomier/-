// miniprogram/utils/dataManager.js
class DataManager {
  // 默认数据
  static defaultData = {
    questions: [
      {
        level: 1,
        title: "物理入门",
        description: "基础物理概念",
        questions: [
          {
            title: "光在真空中的传播速度是多少？",
            option: ["A. 3×10⁸ m/s", "B. 3×10⁶ m/s", "C. 3×10¹⁰ m/s", "D. 3×10⁴ m/s"],
            answer: "A. 3×10⁸ m/s",
            type: "choice"
          },
          {
            title: "牛顿第一定律又称为什么定律？",
            option: ["A. 惯性定律", "B. 加速度定律", "C. 作用力定律", "D. 万有引力定律"],
            answer: "A. 惯性定律",
            type: "choice"
          },
          {
            title: "声音在空气中的传播速度大约是多少？",
            answer: "340",
            type: "blank"
          }
        ]
      },
      {
        level: 2,
        title: "力学基础",
        description: "经典力学概念",
        questions: [
          {
            title: "质量为2kg的物体，受到10N的力，其加速度是多少？",
            option: ["A. 5 m/s²", "B. 20 m/s²", "C. 2 m/s²", "D. 12 m/s²"],
            answer: "A. 5 m/s²",
            type: "choice"
          },
          {
            title: "自由落体运动的加速度是多少？",
            answer: "9.8",
            type: "blank"
          }
        ]
      }
    ],
    levelScores: [],
    rankings: [],
    userInfo: null
  };

  // 保存数据到本地存储
  static saveData(key, data) {
    try {
      console.log(`保存${key}数据:`, data);
      wx.setStorageSync(key, data);
      return true;
    } catch (e) {
      console.error(`保存${key}数据失败:`, e);
      return false;
    }
  }

  // 从本地存储获取数据
  static getData(key, defaultValue = null) {
    try {
      console.log(`获取${key}数据`);
      const data = wx.getStorageSync(key);
      console.log(`${key}原始数据:`, data);
      
      if (data === '' || data === null || data === undefined) {
        console.log(`${key}数据为空，返回默认值`);
        const fallback = defaultValue || this.defaultData[key] || null;
        if (fallback !== null) {
          this.saveData(key, fallback);
        }
        return fallback;
      }
      
      console.log(`${key}数据获取成功:`, data);
      return data;
    } catch (e) {
      console.error(`获取${key}数据失败:`, e);
      const fallback = defaultValue || this.defaultData[key] || null;
      if (fallback !== null) {
        this.saveData(key, fallback);
      }
      return fallback;
    }
  }

  // 初始化数据
  static initData() {
    console.log('开始初始化数据...');
    
    // 初始化题目数据
    const questions = this.getData('questions');
    if (!questions || questions.length === 0) {
      console.log('初始化默认题目数据');
      this.saveData('questions', this.defaultData.questions);
    }

    // 初始化其他数据
    if (!this.getData('levelScores')) {
      this.saveData('levelScores', []);
    }
    
    if (!this.getData('rankings')) {
      this.saveData('rankings', []);
    }

    console.log('数据初始化完成');
  }

  // 获取题目数据
  static getQuestions() {
    return this.getData('questions', this.defaultData.questions);
  }

  // 保存题目数据
  static saveQuestions(questions) {
    return this.saveData('questions', questions);
  }

  // 添加新题目到指定关卡
  static addQuestion(level, question) {
    const questions = this.getQuestions();
    const levelIndex = questions.findIndex(q => q.level === level);
    
    if (levelIndex !== -1) {
      questions[levelIndex].questions.push(question);
      return this.saveQuestions(questions);
    }
    return false;
  }

  // 获取当前关卡数据
  static getCurrentLevel() {
    const data = this.getData('currentLevel');
    if (!data) {
        // 如果没有选择关卡，默认返回第一关
        const questions = this.getData('questions') || [];
        const questionsPerLevel = Math.max(1, Math.floor(questions.length / 3)); // 假设分3关
        return {
            level: 1,
            questions: questions.slice(0, questionsPerLevel)
        };
    }
    return data;
  }

  // 检查关卡是否解锁
  static isLevelUnlocked(level) {
    if (level === 1) return true; // 第一关永远解锁
    
    const levelScores = this.getData('levelScores') || [];
    // 检查前一关是否有分数（即是否通过）
    return levelScores[level - 1] && levelScores[level - 1] > 0;
  }

  // 解锁下一关
  static unlockNextLevel(currentLevel) {
    const levelScores = this.getData('levelScores') || [];
    // 这里可能需要检查解锁逻辑
    console.log('尝试解锁关卡，当前关卡：', currentLevel);
    console.log('当前关卡分数：', levelScores);
  }

  // 获取关卡分数
  static getLevelScores() {
    return this.getData('levelScores', []);
  }

  // 保存关卡分数
  static saveLevelScore(level, score) {
    const scores = this.getLevelScores();
    scores[level] = Math.max(scores[level] || 0, score);
    return this.saveData('levelScores', scores);
  }

  // 获取排行榜数据
  static getRankings() {
    return this.getData('rankings', []);
  }

  // 添加排行榜记录
  static addRanking(scoreData) {
    const rankings = this.getRankings();
    rankings.push(scoreData);
    
    // 按分数排序，保留前50名
    rankings.sort((a, b) => b.score - a.score);
    const topRankings = rankings.slice(0, 50);
    
    return this.saveData('rankings', topRankings);
  }

  // 清除所有数据
  static clearAllData() {
    try {
      wx.clearStorageSync();
      this.initData();
      return true;
    } catch (e) {
      console.error('清除数据失败:', e);
      return false;
    }
  }

  // 导出数据
  static exportData() {
    return {
      questions: this.getQuestions(),
      levelScores: this.getLevelScores(),
      rankings: this.getRankings(),
      userInfo: this.getData('userInfo'),
      exportTime: new Date().toISOString()
    };
  }

  // 导入数据
  static importData(data) {
    try {
      if (data.questions) this.saveQuestions(data.questions);
      if (data.levelScores) this.saveData('levelScores', data.levelScores);
      if (data.rankings) this.saveData('rankings', data.rankings);
      if (data.userInfo) this.saveData('userInfo', data.userInfo);
      return true;
    } catch (e) {
      console.error('导入数据失败:', e);
      return false;
    }
  }
}

module.exports = DataManager;