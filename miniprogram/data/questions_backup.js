const questions = [
  // 第一关：基础物理概念 (7道题) - 容易
  {
    id: 1,
    title: "力学是物理学的一个分支，主要研究什么?",
    type: "choice",
    option: ["物体的机械运动规律", "电磁学", "热力学", "量子力学"],
    answer: "物体的机械运动规律",
    explain: "力学是物理学的重要分支，专门研究物体的运动状态和受力情况，包括静力学、运动学和动力学。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 2,
    title: "电磁学的主要研究对象是什么?",
    type: "choice",
    option: ["电荷及其相互作用", "光", "热", "声音"],
    answer: "电荷及其相互作用",
    explain: "电磁学主要研究电荷、电场、磁场以及它们之间的相互作用，是现代电子技术的理论基础。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 3,
    title: "下列哪种粒子不带电?",
    type: "choice",
    option: ["电子", "质子", "中子", "氢原子核"],
    answer: "中子",
    explain: "中子是电中性粒子，不带电荷。电子带负电，质子带正电，氢原子核就是质子也带正电。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 4,
    title: "光的折射现象是由于光在不同介质中的________不同。",
    type: "blank",
    answer: "速度",
    explain: "光在不同介质中传播速度不同，当光从一种介质斜射入另一种介质时会发生折射现象。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 5,
    title: "下列两种量的比值叫做功率：________和时间。",
    type: "blank",
    answer: "功",
    explain: "功率定义为单位时间内所做的功，公式为P=W/t，单位是瓦特(W)。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 6,
    title: "下列哪种辐射属于电磁波?",
    type: "choice",
    option: ["红外线", "α射线", "β射线", "中子射线"],
    answer: "红外线",
    explain: "红外线是波长较长的电磁波，而α射线是氦原子核、β射线是电子流、中子射线是中子流，都属于粒子辐射。",
    level: 1,
    difficulty: "简单"
  },
  {
    id: 7,
    title: "物体在自由下落过程中，重力加速度为________ m/s²。",
    type: "blank",
    answer: "9.8",
    explain: "在地球表面附近，重力加速度约为9.8 m/s²，这是一个重要的物理常数。",
    level: 1,
    difficulty: "简单"
  },

  // 第二关：基本定律和原理 (8道题) - 普通
  {
    id: 8,
    title: "在电磁感应现象中，感应电动势的大小与什么因素成正比?",
    type: "choice",
    option: ["磁场强度", "导体运动速度", "磁通量变化率", "电阻"],
    answer: "磁通量变化率",
    explain: "根据法拉第电磁感应定律，感应电动势与磁通量变化率成正比，公式为ε=-dΦ/dt。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 9,
    title: "热力学第二定律的核心内容是什么?",
    type: "choice",
    option: ["能量守恒", "熵增原理", "质量守恒", "动量守恒"],
    answer: "熵增原理",
    explain: "热力学第二定律的核心是熵增原理，即孤立系统的总熵在任何过程中只能增加或保持不变。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 10,
    title: "气体的压强与温度成________关系。",
    type: "blank",
    answer: "正比",
    explain: "根据查理定律，在体积恒定的条件下，理想气体的压强与温度成正比。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 11,
    title: "光的波粒二象性是指什么?",
    type: "choice",
    option: ["光既具有波动性，又具有粒子性", "光只能表现出波动性", "光只能表现出粒子性", "光的速度是可变的"],
    answer: "光既具有波动性，又具有粒子性",
    explain: "光的波粒二象性指光在不同实验条件下可以表现出波动性（如干涉、衍射）和粒子性（如光电效应）。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 12,
    title: "在机械波中，波长与频率的乘积等于波速，这个关系叫做________公式。",
    type: "blank",
    answer: "波速公式",
    explain: "波速公式v=λf表明波速等于波长与频率的乘积，这是波动的基本关系。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 13,
    title: "下列哪种现象无法用光的波动性解释?",
    type: "choice",
    option: ["光的干涉", "光的衍射", "光的色散", "光电效应"],
    answer: "光电效应",
    explain: "光电效应需要用光的粒子性（光子）来解释，而干涉、衍射和色散都可以用波动性解释。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 14,
    title: "在狭义相对论中，物体的质量与速度之间的关系是什么?",
    type: "choice",
    option: ["质量与速度成正比", "质量与速度无关", "质量随着速度的增加而增加", "质量随着速度的增加而减少"],
    answer: "质量随着速度的增加而增加",
    explain: "根据相对论质量公式m=m₀/√(1-v²/c²)，物体的相对论质量随速度增加而增加。",
    level: 2,
    difficulty: "普通"
  },
  {
    id: 15,
    title: "根据热力学第二定律，孤立系统的总熵总是________。",
    type: "blank",
    answer: "增加",
    explain: "热力学第二定律指出，在孤立系统中，总熵总是趋向于增加，这表明自然过程的不可逆性。",
    level: 2,
    difficulty: "普通"
  },

  // 第三关：应用计算 (8道题) - 较难
  {
    id: 16,
    title: "一辆汽车以恒定速度行驶，速度为36km/h，行驶时间为2小时。求汽车行驶的路程。",
    type: "choice",
    option: ["72km", "36km", "18km", "144km"],
    answer: "72km",
    explain: "使用运动学公式s=vt，速度v=36km/h，时间t=2h，代入计算：s=36×2=72km。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 17,
    title: "电流为2安培的电路，电阻为10欧姆，求电压。",
    type: "choice",
    option: ["20V", "12V", "5V", "8V"],
    answer: "20V",
    explain: "使用欧姆定律U=IR，代入数据得：U=2×10=20伏特。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 18,
    title: "下列哪种粒子具有最大穿透能力?",
    type: "choice",
    option: ["α粒子", "β粒子", "γ射线", "中子"],
    answer: "γ射线",
    explain: "γ射线是电磁辐射，不带电荷，具有最强的穿透能力，可以穿透较厚的物质。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 19,
    title: "下列哪种现象是量子力学的直接体现?",
    type: "choice",
    option: ["黑体辐射", "光的折射", "光的反射", "物体的自由落体运动"],
    answer: "黑体辐射",
    explain: "黑体辐射的能量量子化现象直接导致了量子力学的诞生，是量子力学的重要实验基础。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 20,
    title: "下列哪种粒子不参与强相互作用?",
    type: "choice",
    option: ["质子", "中子", "电子", "夸克"],
    answer: "电子",
    explain: "电子是轻子，不参与强相互作用，只参与电磁相互作用和弱相互作用。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 21,
    title: "下列哪种力是引力的媒介粒子?",
    type: "choice",
    option: ["光子", "胶子", "引力子", "W和Z玻色子"],
    answer: "引力子",
    explain: "引力子是理论上传递引力相互作用的媒介粒子，但至今尚未被实验证实。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 22,
    title: "量子力学中，粒子的________可以用波函数来描述。",
    type: "blank",
    answer: "状态",
    explain: "在量子力学中，粒子的量子状态由波函数完全描述，波函数的模的平方给出粒子位置的概率密度。",
    level: 3,
    difficulty: "较难"
  },
  {
    id: 23,
    title: "一电容器的电容为10μF，电压为5V，求电容器储存的电荷量。",
    type: "choice",
    option: ["5×10⁻⁵C", "5×10⁻⁶C", "10⁻⁴C", "2.5×10⁻⁵C"],
    answer: "5×10⁻⁵C",
    explain: "使用电容公式Q=CU，代入数据得：Q=10×10⁻⁶×5=5×10⁻⁵库仑。",
    level: 3,
    difficulty: "较难"
  },

  // 第四关：高级概念和复杂计算 (7道题) - 困难
  {
    id: 24,
    title: "一物体的质量为5kg，从静止开始自由下落，忽略空气阻力。求该物体在5秒钟内的下落高度。(g=9.8m/s²)",
    type: "choice",
    option: ["122.5m", "100m", "150m", "98m"],
    answer: "122.5m",
    explain: "使用自由落体运动公式h=½gt²，代入数据得：h=½×9.8×5²=122.5米。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 25,
    title: "一个物体的动能为100J，质量为5kg，求物体的速度。",
    type: "choice",
    option: ["6.32m/s", "10m/s", "20m/s", "12.5m/s"],
    answer: "6.32m/s",
    explain: "使用动能公式Ek=½mv²，代入数据得：100=½×5×v²，解得v=√40≈6.32m/s。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 26,
    title: "下列哪种过程是不可逆的?",
    type: "choice",
    option: ["冰块融化", "水蒸发", "气体自由膨胀", "气体压缩"],
    answer: "气体自由膨胀",
    explain: "气体自由膨胀是典型的不可逆过程，因为熵增加，违反了热力学第二定律的逆过程要求。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 27,
    title: "在狭义相对论中，质量和能量的关系由________公式给出。",
    type: "blank",
    answer: "质能方程",
    explain: "爱因斯坦的质能方程E=mc²揭示了质量和能量的等价性，是相对论的重要结果。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 28,
    title: "在电场中，电场强度是单位________上所受的电力。",
    type: "blank",
    answer: "电荷",
    explain: "电场强度定义为单位正电荷在电场中所受的电力，单位是牛顿每库仑(N/C)。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 29,
    title: "下列哪一项不属于经典力学的研究范围?",
    type: "choice",
    option: ["牛顿运动定律", "流体力学", "量子力学", "固体力学"],
    answer: "量子力学",
    explain: "量子力学属于现代物理学，研究微观粒子的运动规律，不在经典力学研究范围内。",
    level: 4,
    difficulty: "困难"
  },
  {
    id: 30,
    title: "描述微观粒子运动状态的方程是________方程。",
    type: "blank",
    answer: "薛定谔",
    explain: "薛定谔方程是量子力学的基本方程，用于描述微观粒子的量子态随时间的演化。",
    level: 4,
    difficulty: "困难"
  }
];

module.exports = questions;
