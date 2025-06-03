# 天气预报API服务器

这是一个简单的天气预报API服务器，为微信小程序提供天气数据接口。

## 功能

- 根据城市名称查询天气信息
- 提供城市搜索建议
- 数据缓存机制，减少重复请求

## 安装和运行

1. 确保已安装Node.js和npm
2. 安装依赖：
```bash
cd weather-server
npm install
```
3. 启动服务器：
```bash
npm start
```

服务器默认运行在http://localhost:3000

## API接口

### 1. 获取城市天气数据

**请求**：
```
GET /api/weather?city=城市名
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": {
    "city": "北京",
    "updateTime": "2023-05-15 10:30:00",
    "temperature": 25,
    "weatherDesc": "晴",
    "humidity": 45,
    "windDirection": "东北风",
    "windPower": "3级",
    "pressure": 1010,
    "forecast": [
      {
        "date": "2023-05-16",
        "weatherDesc": "多云",
        "tempMin": 20,
        "tempMax": 30
      },
      ...
    ],
    "indices": [
      {
        "type": "comfort",
        "name": "舒适度",
        "level": "舒适",
        "desc": "..."
      },
      ...
    ]
  }
}
```

### 2. 获取城市搜索建议

**请求**：
```
GET /api/city/suggest?keyword=关键词
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": [
    {
      "name": "北京"
    },
    {
      "name": "南京"
    }
  ]
}
```

## 注意事项

1. 这是一个模拟服务器，数据为随机生成，不代表真实天气情况
2. 在实际项目中，应替换为真实的天气API接口
3. 为了简化示例，未实现用户认证和请求限制功能 