// miniprogram/pages/answer/answer.js
// 修复gameComplete方法中的分数保存逻辑

const DataManager = require('../../utils/dataManager.js');
const AudioManager = require('../../utils/audioManager.js');

Page({
    data: {
        list: [],
        answerNow: 0,
        select: "",
        inputAnswer: "",
        successNum: 0,
        failNum: 0,
        totalScore: 0,
        status: "",
        currentLevel: 1,
        currentType: 'choice', // 默认值，防止undefined
        scorePerQuestion: 10,
        timeLeft: 30,
        timer: null,
        autoNextTimer: null,
        showProgress: true,
        animationClass: '',
        showExplanation: false,
        currentExplanation: '',
        correctAnswer: '',
        isAnswered: false,
        showResult: false
    },

    onLoad(options) {
        console.log('答题页面加载，参数：', options);
        
        // 初始化音效
        AudioManager.init();
        
        // 加载关卡数据
        this.loadLevel();
    },

    loadLevel() {
        // 获取当前关卡数据
        const currentLevel = DataManager.getData('currentLevel');
        
        console.log('加载关卡数据：', currentLevel);
        
        if (!currentLevel || !currentLevel.questions || currentLevel.questions.length === 0) {
            console.error('没有找到关卡数据或题目为空');
            wx.showModal({
                title: '错误',
                content: '没有找到题目数据，请重新选择关卡',
                confirmText: '返回',
                success: () => {
                    wx.navigateBack();
                }
            });
            return;
        }

        // 检查并修复题目格式
        const questions = this.formatQuestions(currentLevel.questions);
        
        console.log('格式化后的题目：', questions);

        // 尝试恢复进度
        const progress = DataManager.getData(`level_${currentLevel.level}_progress`);
        
        if (progress && progress.answerNow < questions.length) {
            console.log('恢复答题进度：', progress);
            this.setData({
                list: questions,
                currentLevel: currentLevel.level,
                answerNow: progress.answerNow,
                successNum: progress.successNum,
                failNum: progress.failNum,
                totalScore: progress.totalScore,
                currentType: this.getQuestionType(questions[progress.answerNow])
            });
        } else {
            console.log('开始新的答题');
            this.setData({
                list: questions,
                currentLevel: currentLevel.level,
                answerNow: 0,
                successNum: 0,
                failNum: 0,
                totalScore: 0,
                currentType: this.getQuestionType(questions[0])
            });
        }

        // 开始答题
        this.startTimer();
    },

    // 格式化题目数据，确保格式正确
    formatQuestions(questions) {
        return questions.map((question, index) => {
            // 确保题目有必要的字段
            const formattedQuestion = {
                title: question.title || question.question || `题目 ${index + 1}`,
                type: question.type || 'choice',
                answer: question.answer || '',
                explanation: question.explain || question.explanation || '暂无解析',
                // 保留原始字段以备不时之需
                id: question.id,
                level: question.level,
                difficulty: question.difficulty
            };

            // 处理选择题选项
            if (formattedQuestion.type === 'choice') {
                if (question.option && Array.isArray(question.option)) {
                    formattedQuestion.option = question.option;
                } else if (question.options && Array.isArray(question.options)) {
                    formattedQuestion.option = question.options;
                } else {
                    // 如果没有选项，生成默认选项
                    formattedQuestion.option = ['选项A', '选项B', '选项C', '选项D'];
                    console.warn('题目缺少选项，使用默认选项：', formattedQuestion.title);
                }
                
                // 确保解析不为空
                if (!formattedQuestion.explanation || formattedQuestion.explanation === '暂无解析') {
                    formattedQuestion.explanation = `这道题的正确答案是：${formattedQuestion.answer}`;
                }
            }

            console.log(`格式化题目 ${index + 1}:`, {
                title: formattedQuestion.title,
                type: formattedQuestion.type,
                answer: formattedQuestion.answer,
                explanation: formattedQuestion.explanation,
                optionCount: formattedQuestion.option ? formattedQuestion.option.length : 0
            });
            return formattedQuestion;
        });
    },

    // 获取题目类型
    getQuestionType(question) {
        if (!question) return 'choice';
        return question.type === 'blank' ? 'blank' : 'choice';
    },

    // 开始计时器
    startTimer() {
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }

        this.setData({ timeLeft: 30 });

        this.data.timer = setInterval(() => {
            const timeLeft = this.data.timeLeft - 1;
            this.setData({ timeLeft });

            if (timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    },

    // 选择答案
    radioChange(e) {
        if (this.data.isAnswered) return;
        
        AudioManager.play('click');
        const value = e.detail.value;
        console.log('选择答案：', value);
        this.setData({ select: value });
    },

    // 输入答案
    inputChange(e) {
        if (this.data.isAnswered) return;
        
        const value = e.detail.value;
        console.log('输入答案：', value);
        this.setData({ inputAnswer: value });
    },

    // 提交答案
    submit() {
        if (this.data.isAnswered) return;
        
        AudioManager.play('click');
        clearInterval(this.data.timer);
        
        const currentQuestion = this.data.list[this.data.answerNow];
        let userAnswer = this.data.currentType === 'choice' ? this.data.select : this.data.inputAnswer;
        
        console.log('提交答案：', {
            currentQuestion,
            userAnswer,
            currentType: this.data.currentType
        });
        
        if (!userAnswer.trim()) {
            AudioManager.play('error');
            wx.showToast({
                title: '请选择或输入答案',
                icon: 'none'
            });
            this.startTimer();
            return;
        }

        const isCorrect = this.checkAnswer(userAnswer, currentQuestion);
        const explanation = this.getQuestionExplanation(currentQuestion);
        
        // 获取正确答案的显示内容（用于UI显示）
        const correctAnswerForDisplay = this.getCorrectAnswerForDisplay(currentQuestion);
        
        console.log('答题结果：', { 
            isCorrect, 
            userAnswer, 
            correctAnswer: currentQuestion.answer,
            correctAnswerForDisplay: correctAnswerForDisplay
        });

        if (isCorrect) {
            AudioManager.play('success');
            const score = this.data.scorePerQuestion + Math.floor(this.data.timeLeft / 6);
            
            this.setData({
                status: "回答正确！",
                successNum: this.data.successNum + 1,
                totalScore: this.data.totalScore + score,
                animationClass: 'bounce',
                isAnswered: true,
                showResult: true,
                showExplanation: true,
                correctAnswer: correctAnswerForDisplay,
                currentExplanation: explanation
            });
            
            console.log('答题正确，最终状态：', {
                status: this.data.status,
                showResult: this.data.showResult,
                isCorrect: this.data.status.includes('正确')
            });
            
            // 答对了，1.5秒后直接进入下一题
            setTimeout(() => {
                this.setData({ animationClass: '' });
                this.nextQuestion();
            }, 1500);
        } else {
            AudioManager.play('error');
            
            this.setData({
                status: "回答错误！",
                failNum: this.data.failNum + 1,
                animationClass: 'shake',
                isAnswered: true,
                showResult: true,
                showExplanation: true,
                correctAnswer: correctAnswerForDisplay,
                currentExplanation: explanation
            });
            
            console.log('答题错误，最终状态：', {
                status: this.data.status,
                showResult: this.data.showResult,
                isCorrect: this.data.status.includes('正确')
            });
            
            setTimeout(() => {
                this.setData({ animationClass: '' });
            }, 500);
            
            this.data.autoNextTimer = setTimeout(() => {
                this.nextQuestion();
            }, 4000);
        }
    },

    // 检查答案
    checkAnswer(userAnswer, question) {
        if (!userAnswer || !question || !question.answer) {
            console.log('答案检查失败：缺少必要参数');
            return false;
        }

        const userAnswerClean = userAnswer.toString().toLowerCase().trim();
        const correctAnswer = question.answer.toString().toLowerCase().trim();
        
        console.log('检查答案详情：', {
            原始用户答案: userAnswer,
            清理后用户答案: userAnswerClean,
            原始正确答案: question.answer,
            清理后正确答案: correctAnswer,
            题目类型: question.type,
            选项列表: question.option
        });
        
        if (question.type === 'choice') {
            // 选择题处理逻辑
            
            // 方法1：直接比较答案内容（最常见情况）
            if (userAnswerClean === correctAnswer) {
                console.log('✓ 直接匹配成功');
                return true;
            }
            
            // 方法2：如果有选项，在选项中查找匹配
            if (question.option && Array.isArray(question.option)) {
                // 查找用户答案在选项中的位置
                const userOptionIndex = question.option.findIndex(option => 
                    option.toString().toLowerCase().trim() === userAnswerClean
                );
                
                // 查找正确答案在选项中的位置
                const correctOptionIndex = question.option.findIndex(option => 
                    option.toString().toLowerCase().trim() === correctAnswer
                );
                
                console.log('选项匹配检查：', {
                    用户答案索引: userOptionIndex,
                    正确答案索引: correctOptionIndex
                });
                
                // 如果两者都找到了，比较索引
                if (userOptionIndex !== -1 && correctOptionIndex !== -1) {
                    const isCorrect = userOptionIndex === correctOptionIndex;
                    console.log(isCorrect ? '✓ 选项索引匹配成功' : '✗ 选项索引不匹配');
                    return isCorrect;
                }
                
                // 方法3：处理字母格式答案（A、B、C、D）
                if (/^[abcd]$/i.test(correctAnswer)) {
                    const letterIndex = correctAnswer.toLowerCase().charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
                    if (letterIndex >= 0 && letterIndex < question.option.length) {
                        const correctOptionContent = question.option[letterIndex].toString().toLowerCase().trim();
                        const isCorrect = userAnswerClean === correctOptionContent;
                        console.log(isCorrect ? '✓ 字母转选项匹配成功' : '✗ 字母转选项不匹配', {
                            字母: correctAnswer,
                            索引: letterIndex,
                            对应选项: correctOptionContent
                        });
                        return isCorrect;
                    }
                }
                
                // 方法4：处理用户输入字母格式
                if (/^[abcd]$/i.test(userAnswerClean)) {
                    const userLetterIndex = userAnswerClean.toLowerCase().charCodeAt(0) - 97;
                    if (userLetterIndex >= 0 && userLetterIndex < question.option.length) {
                        const userOptionContent = question.option[userLetterIndex].toString().toLowerCase().trim();
                        const isCorrect = userOptionContent === correctAnswer;
                        console.log(isCorrect ? '✓ 用户字母转选项匹配成功' : '✗ 用户字母转选项不匹配', {
                            用户字母: userAnswerClean,
                            索引: userLetterIndex,
                            对应选项: userOptionContent
                        });
                        return isCorrect;
                    }
                }
                
                // 方法5：如果用户选择了选项，而正确答案是字母，进行转换比较
                if (userOptionIndex !== -1 && /^[abcd]$/i.test(correctAnswer)) {
                    const correctLetterIndex = correctAnswer.toLowerCase().charCodeAt(0) - 97;
                    const isCorrect = userOptionIndex === correctLetterIndex;
                    console.log(isCorrect ? '✓ 用户选项与正确字母匹配成功' : '✗ 用户选项与正确字母不匹配', {
                        用户选项索引: userOptionIndex,
                        正确答案字母索引: correctLetterIndex
                    });
                    return isCorrect;
                }
            }
            
            console.log('✗ 所有匹配方法都失败');
            return false;
        } else {
            // 填空题处理逻辑
            // 支持多种答案格式，用|分隔
            const possibleAnswers = correctAnswer.split('|').map(ans => ans.trim().toLowerCase());
            const isCorrect = possibleAnswers.some(ans => userAnswerClean === ans);
            console.log(isCorrect ? '✓ 填空题匹配成功' : '✗ 填空题匹配失败', {
                可能答案: possibleAnswers
            });
            return isCorrect;
        }
    },

    // 获取题目解析
    getQuestionExplanation(question) {
        // 优先使用explanation字段，然后是explain，最后是parse字段
        let explanation = question.explanation || question.explain || question.parse;
        
        // 如果解析为空或者是默认值，生成一个基本解析
        if (!explanation || explanation === '暂无解析' || explanation === '暂无详细解析') {
            if (question.type === 'choice' && question.option && Array.isArray(question.option)) {
                // 对于选择题，说明正确答案
                const correctAnswer = question.answer;
                explanation = `正确答案是：${correctAnswer}`;
                
                // 如果正确答案是字母格式，添加对应的选项内容
                if (/^[abcd]$/i.test(correctAnswer)) {
                    const letterIndex = correctAnswer.toLowerCase().charCodeAt(0) - 97;
                    if (letterIndex >= 0 && letterIndex < question.option.length) {
                        const optionContent = question.option[letterIndex];
                        explanation += ` (${optionContent})`;
                    }
                }
            } else {
                // 对于填空题
                explanation = `正确答案是：${question.answer}`;
            }
        }
        
        console.log('获取题目解析：', {
            title: question.title,
            explanation: explanation,
            originalExplain: question.explain,
            originalExplanation: question.explanation
        });
        
        return explanation;
    },

    // 获取正确答案的显示内容（用于UI显示）
    getCorrectAnswerForDisplay(question) {
        if (!question || !question.answer) {
            return '';
        }
        
        const correctAnswer = question.answer.toString().trim();
        
        // 对于选择题，如果答案是字母格式，转换为对应的选项内容
        if (question.type === 'choice' && question.option && Array.isArray(question.option)) {
            if (/^[abcd]$/i.test(correctAnswer)) {
                const letterIndex = correctAnswer.toLowerCase().charCodeAt(0) - 97;
                if (letterIndex >= 0 && letterIndex < question.option.length) {
                    const optionContent = question.option[letterIndex];
                    console.log('字母答案转换为选项内容：', {
                        字母: correctAnswer,
                        索引: letterIndex,
                        选项内容: optionContent
                    });
                    return optionContent;
                }
            }
            
            // 如果答案不是字母格式，直接查找匹配的选项
            const matchingOption = question.option.find(option => 
                option.toString().toLowerCase().trim() === correctAnswer.toLowerCase()
            );
            
            if (matchingOption) {
                console.log('找到匹配的选项：', matchingOption);
                return matchingOption;
            }
        }
        
        // 对于填空题或找不到匹配选项的情况，直接返回原答案
        console.log('使用原始答案：', correctAnswer);
        return correctAnswer;
    },

    // 下一题
    nextQuestion() {
        // 清理计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        if (this.data.autoNextTimer) {
            clearTimeout(this.data.autoNextTimer);
            this.data.autoNextTimer = null;
        }

        // 保存进度
        this.saveProgress();

        const nextIndex = this.data.answerNow + 1;
        
        if (nextIndex >= this.data.list.length) {
            // 答题完成
            this.gameComplete();
        } else {
            // 进入下一题
            this.setData({
                answerNow: nextIndex,
                select: "",
                inputAnswer: "",
                status: "",
                currentType: this.getQuestionType(this.data.list[nextIndex]),
                isAnswered: false,
                showResult: false,
                showExplanation: false,
                animationClass: ''
            });
            
            this.startTimer();
        }
    },

    // 手动继续下一题（点击按钮）
    continueNext() {
        console.log('用户手动点击继续下一题');
        this.nextQuestion();
    },

    // 保存进度
    saveProgress() {
        const progress = {
            answerNow: this.data.answerNow,
            successNum: this.data.successNum,
            failNum: this.data.failNum,
            totalScore: this.data.totalScore,
            status: this.data.status,
            currentType: this.data.currentType
        };
        
        DataManager.saveData(`level_${this.data.currentLevel}_progress`, progress);
        console.log('保存进度：', progress);
    },

    // 游戏完成
    gameComplete() {
        // 清除进度
        DataManager.saveData(`level_${this.data.currentLevel}_progress`, null);
        
        // 保存关卡分数
        const levelScores = DataManager.getData('levelScores') || [];
        
        // 确保数组足够大
        while (levelScores.length < this.data.currentLevel) {
            levelScores.push(0);
        }
        
        // 保存当前关卡的最高分
        const currentLevelIndex = this.data.currentLevel - 1;
        const currentScore = Math.max(
            levelScores[currentLevelIndex] || 0,
            this.data.totalScore
        );
        levelScores[currentLevelIndex] = currentScore;
        
        console.log('游戏完成，保存分数：', {
            currentLevel: this.data.currentLevel,
            currentLevelIndex: currentLevelIndex,
            score: currentScore,
            allScores: levelScores
        });
        
        DataManager.saveData('levelScores', levelScores);

        // 分数验证和关卡解锁逻辑
        const nextLevel = this.data.currentLevel + 1;
        const maxLevel = 4;
        const passingScore = 60; // 通关分数
        const correctRate = Math.round((this.data.successNum / this.data.list.length) * 100);
        
        let unlockMessage = '';
        let canProceed = false;
        
        // 检查当前关卡是否通过
        if (this.data.totalScore >= passingScore) {
            // 通过当前关卡
            canProceed = true;
            if (nextLevel <= maxLevel) {
                unlockMessage = `\n🎉 关卡${nextLevel}已解锁！`;
                console.log(`关卡${this.data.currentLevel}完成，解锁关卡${nextLevel}`);
            } else if (this.data.currentLevel === maxLevel) {
                unlockMessage = '\n🏆 恭喜你完成了所有关卡！';
            }
        } else {
            // 未通过当前关卡
            canProceed = false;
            const needScore = passingScore - this.data.totalScore;
            unlockMessage = `\n💪 继续加油，还需${needScore}分解锁下一关！`;
            console.log(`关卡${this.data.currentLevel}未通过，分数不足：${this.data.totalScore}/${passingScore}`);
        }

        // 生成星级评价
        let starRating = '';
        if (this.data.totalScore >= 90) {
            starRating = '⭐⭐⭐ 完美！';
        } else if (this.data.totalScore >= 75) {
            starRating = '⭐⭐ 优秀！';
        } else if (this.data.totalScore >= 60) {
            starRating = '⭐ 通过！';
        } else {
            starRating = '继续努力！';
        }

        // 显示结果对话框
        wx.showModal({
            title: canProceed ? '🎉 关卡完成！' : '💪 继续加油！',
            content: `第${this.data.currentLevel}关挑战结果：\n\n📊 得分：${this.data.totalScore}分 ${starRating}\n✅ 正确：${this.data.successNum}题\n❌ 错误：${this.data.failNum}题\n📈 正确率：${correctRate}%${unlockMessage}`,
            confirmText: canProceed ? '选择关卡' : '重新挑战',
            cancelText: '返回首页',
            success: (res) => {
                if (res.confirm) {
                    if (canProceed) {
                        // 通过了，去关卡选择页面
                        wx.navigateTo({
                            url: '../level/level'
                        });
                    } else {
                        // 没通过，重新开始当前关卡
                        this.restartLevel();
                    }
                } else {
                    wx.navigateBack();
                }
            }
        });
    },

    // 重新开始当前关卡
    restartLevel() {
        console.log('重新开始关卡', this.data.currentLevel);
        
        // 重置答题数据
        this.setData({
            answerNow: 0,
            select: "",
            inputAnswer: "",
            successNum: 0,
            failNum: 0,
            totalScore: 0,
            status: "",
            timeLeft: 30,
            showExplanation: false,
            currentExplanation: '',
            correctAnswer: '',
            isAnswered: false,
            showResult: false,
            currentType: this.getQuestionType(this.data.list[0])
        });
        
        // 清除进度
        DataManager.saveData(`level_${this.data.currentLevel}_progress`, null);
        
        // 重新开始计时
        this.startTimer();
        
        wx.showToast({
            title: '重新开始挑战！',
            icon: 'success',
            duration: 1500
        });
    },

    // 时间到
    timeUp() {
        if (this.data.isAnswered) return;
        
        clearInterval(this.data.timer);
        AudioManager.play('error');
        
        const currentQuestion = this.data.list[this.data.answerNow];
        const explanation = this.getQuestionExplanation(currentQuestion);
        const correctAnswerForDisplay = this.getCorrectAnswerForDisplay(currentQuestion);
        
        this.setData({
            status: "时间到！",
            correctAnswer: correctAnswerForDisplay,
            currentExplanation: explanation,
            failNum: this.data.failNum + 1,
            animationClass: 'shake',
            isAnswered: true,
            showResult: true,
            showExplanation: true
        });
        
        setTimeout(() => {
            this.setData({ animationClass: '' });
        }, 500);
        
        this.data.autoNextTimer = setTimeout(() => {
            this.nextQuestion();
        }, 4000);
    },

    // 继续下一题
    continueNext() {
        AudioManager.play('click');
        if (this.data.autoNextTimer) {
            clearTimeout(this.data.autoNextTimer);
        }
        this.nextQuestion();
    },

    // 生成时间戳
    timestampToTime(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    onHide() {
        // 页面隐藏时清理计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        if (this.data.autoNextTimer) {
            clearTimeout(this.data.autoNextTimer);
        }
    },

    onUnload() {
        // 页面卸载时清理计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        if (this.data.autoNextTimer) {
            clearTimeout(this.data.autoNextTimer);
        }
    }
});