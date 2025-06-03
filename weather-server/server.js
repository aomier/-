const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域请求
app.use(cors());
app.use(express.json());

// 内存中存储的城市天气数据缓存
const weatherCache = {};

// 模拟天气数据生成器
function generateWeatherData(city) {
  const now = new Date();
  const formattedTime = now.toISOString().replace('T', ' ').substr(0, 19);
  
  // 为每个城市生成固定的伪随机天气
  const cityCode = getSimpleHash(city);
  
  // 使用城市哈希码作为随机种子生成天气数据
  const temperature = 10 + (cityCode % 25); // 10-35度的温度
  const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪', '雾', '霾'];
  const weatherIndex = cityCode % weatherTypes.length;
  const weatherDesc = weatherTypes[weatherIndex];
  
  const humidity = 40 + (cityCode % 30); // 40-70%的湿度
  const windDirections = ['东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风', '北风'];
  const windDirection = windDirections[cityCode % windDirections.length];
  const windPower = (cityCode % 5) + 1 + '级'; // 1-5级风力
  const pressure = 1000 + (cityCode % 20); // 1000-1020hPa

  // 生成未来5天天气预报
  const forecast = [];
  for (let i = 1; i <= 5; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(now.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];
    
    // 每天温度有一些变化，但基于城市固定值
    const tempVariation = ((cityCode + i) % 10) - 5; // -5到4的变化
    const tempMin = temperature - 5 + tempVariation;
    const tempMax = temperature + 5 + tempVariation;
    
    // 天气类型也有变化
    const weatherIndexForecast = (weatherIndex + i) % weatherTypes.length;
    const weatherDescForecast = weatherTypes[weatherIndexForecast];
    
    forecast.push({
      date: dateStr,
      weatherDesc: weatherDescForecast,
      tempMin: tempMin,
      tempMax: tempMax
    });
  }

  // 生成生活指数
  const indices = [
    {
      type: 'comfort',
      name: '舒适度',
      level: ['舒适', '较舒适', '一般', '较不舒适', '不舒适'][cityCode % 5],
      desc: '根据天气情况，建议适当调整室内温度。'
    },
    {
      type: 'dressing',
      name: '穿衣',
      level: ['短袖', '长袖', '夹克', '外套', '棉衣'][(cityCode + temperature) % 5],
      desc: '根据气温情况，合理选择衣物。'
    },
    {
      type: 'uv',
      name: '紫外线',
      level: ['弱', '中等', '强', '很强', '极强'][cityCode % 5],
      desc: '外出时请做好防晒措施。'
    },
    {
      type: 'carWash',
      name: '洗车',
      level: ['适宜', '较适宜', '一般', '较不宜', '不宜'][(cityCode + weatherIndex) % 5],
      desc: '根据天气情况，合理安排洗车时间。'
    }
  ];

  return {
    city: city,
    updateTime: formattedTime,
    temperature: temperature,
    weatherDesc: weatherDesc,
    humidity: humidity,
    windDirection: windDirection,
    windPower: windPower,
    pressure: pressure,
    forecast: forecast,
    indices: indices
  };
}

// 简单的哈希函数，用于基于城市名生成伪随机数
function getSimpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // 确保结果为正数
  return Math.abs(hash);
}

// 天气API接口
app.get('/api/weather', (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少城市参数',
        success: false 
      });
    }
    
    // 检查缓存中是否有这个城市的天气数据
    // 如果有且更新时间在30分钟内，则返回缓存数据
    const now = new Date().getTime();
    if (weatherCache[city] && (now - weatherCache[city].cacheTime < 30 * 60 * 1000)) {
      return res.json({
        code: 200,
        message: 'success',
        success: true,
        data: weatherCache[city].data
      });
    }
    
    // 生成新的天气数据
    const weatherData = generateWeatherData(city);
    
    // 更新缓存
    weatherCache[city] = {
      data: weatherData,
      cacheTime: now
    };
    
    // 返回天气数据
    res.json({
      code: 200,
      message: 'success',
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('获取天气数据出错:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      success: false
    });
  }
});

// 城市搜索建议API接口
app.get('/api/city/suggest', (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({
      code: 400,
      message: '缺少关键词参数',
      success: false
    });
  }
  
  // 常用城市列表
  const cities = [
    '北京', '上海', '广州', '深圳', '杭州', 
    '南京', '武汉', '成都', '重庆', '西安',
    '天津', '苏州', '长沙', '郑州', '青岛',
    '沈阳', '大连', '厦门', '福州', '济南',
    '合肥', '昆明', '南昌', '贵阳', '哈尔滨'
  ];
  
  // 过滤出匹配的城市
  const suggestions = cities.filter(city => 
    city.includes(keyword)
  ).map(city => ({
    name: city
  }));
  
  res.json({
    code: 200,
    message: 'success',
    success: true,
    data: suggestions
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`天气API服务器运行在: http://localhost:${PORT}`);
}); 