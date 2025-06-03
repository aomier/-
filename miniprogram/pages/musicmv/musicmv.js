// pages/musicmv/musicmv.js
const app = getApp();

// 天气图标映射关系
const WEATHER_ICON_MAP = {
  '晴': '/images/weather/sunny.jpeg',
  '多云': '/images/weather/cloudy.jpeg',
  '阴': '/images/weather/overcast.jpeg',
  '小雨': '/images/weather/light-rain.jpeg',
  '中雨': '/images/weather/moderate-rain.jpeg',
  '大雨': '/images/weather/heavy-rain.jpeg',
  '暴雨': '/images/weather/storm.jpeg',
  '雷阵雨': '/images/weather/thunderstorm.jpeg',
  '小雪': '/images/weather/light-snow.jpeg',
  '中雪': '/images/weather/moderate-snow.jpeg',
  '大雪': '/images/weather/heavy-snow.jpeg',
  '雾': '/images/weather/fog.jpeg',
  '霾': '/images/weather/haze.jpeg'
};

// 获取默认图标
const getWeatherIcon = (weatherDesc) => {
  for (const key in WEATHER_ICON_MAP) {
    if (weatherDesc.includes(key)) {
      return WEATHER_ICON_MAP[key];
    }
  }
  return '/images/weather/unknown.png'; // 默认图标
};

// 格式化日期 (yyyy-MM-dd => MM月dd日)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取星期几
const getWeekDay = (dateStr) => {
  if (!dateStr) return '';
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return weekDays[date.getDay()];
};

// 格式化时间 (yyyy-MM-dd HH:mm:ss => HH:mm)
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// API服务器地址
const API_BASE_URL = 'http://localhost:3000';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    weatherData: {
      city: '正在定位...',
      updateTime: '--',
      temperature: '--',
      weatherDesc: '未知',
      humidity: '--',
      windDirection: '--',
      windPower: '--',
      pressure: '--',
      iconUrl: '/images/weather/unknown.png'
    },
    forecastList: [],
    lifeIndices: [],
    isLoading: false,
    searchCity: '',
    lastRefreshTime: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初次加载获取位置并查询天气
    this.getCurrentLocation();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // 页面卸载时清理资源
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 检查是否可以刷新（避免频繁刷新）
    const now = new Date().getTime();
    const lastRefresh = this.data.lastRefreshTime || 0;
    if (now - lastRefresh < 30000) { // 30秒内不重复刷新
      wx.showToast({
        title: '刷新太频繁，请稍后再试',
        icon: 'none'
      });
      wx.stopPullDownRefresh();
      return;
    }

    // 刷新当前城市天气
    const city = this.data.weatherData.city;
    if (city && city !== '正在定位...') {
      this.getWeatherData(city);
    } else {
      this.getCurrentLocation();
    }

    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: `${this.data.weatherData.city}天气：${this.data.weatherData.temperature}°C，${this.data.weatherData.weatherDesc}`,
      path: '/pages/musicmv/musicmv'
    };
  },

  /**
   * 获取当前位置
   */
  getCurrentLocation: function() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 获取到经纬度后，调用逆地理编码获取城市名
        this.getLocationName(res.latitude, res.longitude);
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        wx.showToast({
          title: '定位失败，请手动搜索城市',
          icon: 'none',
          duration: 2000
        });
        // 使用默认城市
        this.getWeatherData('北京');
      }
    });
  },

  /**
   * 根据经纬度获取城市名
   */
  getLocationName: function(latitude, longitude) {
    // 调用微信API获取位置名称
    wx.request({
      url: 'https://api.map.baidu.com/reverse_geocoding/v3',
      data: {
        ak: 'YOUR_BAIDU_MAP_AK', // 注意：实际应用中需要替换为有效的百度地图AK
        output: 'json',
        coordtype: 'wgs84ll',
        location: `${latitude},${longitude}`
      },
      success: (res) => {
        if (res.data && res.data.status === 0 && res.data.result) {
          const city = res.data.result.addressComponent.city.replace('市', '');
          this.setData({ 'weatherData.city': city });
          this.getWeatherData(city);
        } else {
          // 默认使用北京
          this.getWeatherData('北京');
        }
      },
      fail: (err) => {
        console.error('逆地理编码失败:', err);
        // 默认使用北京
        this.getWeatherData('北京');
      }
    });
  },

  /**
   * 根据城市名获取天气数据
   */
  getWeatherData: function(cityName) {
    // 显示加载提示
    this.setData({ isLoading: true });

    // API请求
    wx.request({
      url: `${API_BASE_URL}/api/weather`,
      data: {
        city: cityName
      },
      success: (res) => {
        if (res.data && res.data.success && res.data.data) {
          const apiData = res.data.data;
          
          // 构造天气数据对象
          const weatherData = {
            city: apiData.city,
            updateTime: apiData.updateTime,
            temperature: apiData.temperature,
            weatherDesc: apiData.weatherDesc,
            humidity: apiData.humidity,
            windDirection: apiData.windDirection,
            windPower: apiData.windPower,
            pressure: apiData.pressure,
            iconUrl: getWeatherIcon(apiData.weatherDesc)
          };
          
          // 处理天气预报数据
          const forecastList = apiData.forecast.map(item => ({
            date: formatDate(item.date),
            weekday: getWeekDay(item.date),
            weatherDesc: item.weatherDesc,
            tempMin: item.tempMin,
            tempMax: item.tempMax,
            iconUrl: getWeatherIcon(item.weatherDesc)
          }));
          
          // 更新页面数据
          this.setData({
            weatherData: weatherData,
            forecastList: forecastList,
            lifeIndices: apiData.indices || [],
            isLoading: false,
            lastRefreshTime: new Date().getTime()
          });
        } else {
          // API返回错误
          console.error('API返回错误:', res);
          this.setData({ isLoading: false });
          wx.showToast({
            title: '获取天气失败',
            icon: 'none'
          });
          
          // 如果API失败，使用模拟数据
          this.simulateWeatherAPI(cityName);
        }
      },
      fail: (err) => {
        console.error('请求天气API失败:', err);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '网络连接失败，使用模拟数据',
          icon: 'none'
        });
        
        // 如果API连接失败，使用模拟数据
        this.simulateWeatherAPI(cityName);
      }
    });
  },

  /**
   * 模拟天气API请求（备用方案）
   */
  simulateWeatherAPI: function(cityName) {
    // 模拟网络延迟
    setTimeout(() => {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const formattedTime = now.toISOString().replace('T', ' ').substr(0, 19);

      // 模拟天气数据
      const weatherData = {
        city: cityName,
        updateTime: formattedTime,
        temperature: Math.floor(Math.random() * 15 + 10), // 10-25度之间的随机温度
        weatherDesc: ['晴', '多云', '阴', '小雨', '中雨'][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 30 + 40), // 40%-70%之间的随机湿度
        windDirection: ['东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风', '北风'][Math.floor(Math.random() * 8)],
        windPower: Math.floor(Math.random() * 5 + 1) + '级', // 1-5级随机风力
        pressure: Math.floor(Math.random() * 20 + 1000) // 1000-1020hPa随机气压
      };
      
      // 设置天气图标
      weatherData.iconUrl = getWeatherIcon(weatherData.weatherDesc);

      // 模拟未来5天天气预报
      const forecastList = [];
      for (let i = 1; i <= 5; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(now.getDate() + i);
        const dateStr = forecastDate.toISOString().split('T')[0];
        
        const weatherDesc = ['晴', '多云', '阴', '小雨', '中雨'][Math.floor(Math.random() * 5)];
        const tempMin = Math.floor(Math.random() * 10 + 5); // 5-15度之间的随机最低温度
        const tempMax = tempMin + Math.floor(Math.random() * 10 + 5); // 比最低温度高5-15度的随机最高温度
        
        forecastList.push({
          date: formatDate(dateStr),
          weekday: getWeekDay(dateStr),
          weatherDesc: weatherDesc,
          tempMin: tempMin,
          tempMax: tempMax,
          iconUrl: getWeatherIcon(weatherDesc)
        });
      }

      // 模拟生活指数
      const lifeIndices = [
        {
          type: 'comfort',
          name: '舒适度',
          level: ['舒适', '较舒适', '一般', '较不舒适', '不舒适'][Math.floor(Math.random() * 5)],
          desc: '今天天气舒适度一般，注意适当增减衣物。'
        },
        {
          type: 'dressing',
          name: '穿衣',
          level: ['短袖', '长袖', '夹克', '外套', '棉衣'][Math.floor(Math.random() * 5)],
          desc: '建议穿着轻便舒适的衣物。'
        },
        {
          type: 'uv',
          name: '紫外线',
          level: ['弱', '中等', '强', '很强', '极强'][Math.floor(Math.random() * 5)],
          desc: '外出时建议涂抹SPF15以上防晒霜。'
        },
        {
          type: 'carWash',
          name: '洗车',
          level: ['适宜', '较适宜', '一般', '较不宜', '不宜'][Math.floor(Math.random() * 5)],
          desc: '天气较好，适合洗车。'
        }
      ];

      // 更新页面数据
      this.setData({
        weatherData: weatherData,
        forecastList: forecastList,
        lifeIndices: lifeIndices,
        isLoading: false,
        lastRefreshTime: now.getTime()
      });
    }, 1000); // 模拟1秒网络延迟
  },

  /**
   * 搜索输入变化处理
   */
  onSearchInput: function(e) {
    this.setData({
      searchCity: e.detail.value
    });
  },

  /**
   * 搜索天气
   */
  searchWeather: function() {
    const city = this.data.searchCity.trim();
    if (!city) {
      wx.showToast({
        title: '请输入城市名称',
        icon: 'none'
      });
      return;
    }

    // 获取城市天气数据
    this.getWeatherData(city);
  }
});