// 天地图和模拟高德地图API服务
const TIANTU_API_KEY = 'a44fddbccbd491736dfa2969d818c07f';

// 使用天地图API进行地理编码
export const geocodeAddress = async (address: string): Promise<{lon: string, lat: string}> => {
  try {
    // 正确格式化请求URL，使用encodeURIComponent处理整个ds参数
    const keyWord = encodeURIComponent(address);
    const dsParam = encodeURIComponent(`{"keyWord":"${address}"}`);
    const response = await fetch(
      `https://api.tianditu.gov.cn/geocoder?ds=${dsParam}&tk=${TIANTU_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === '0' && data.location) {
      return {
        lon: data.location.lon,
        lat: data.location.lat
      };
    } else {
      // 如果地理编码失败，返回默认坐标
      console.error('地理编码失败:', data);
      if (address.includes('深圳')) {
        return { lon: '114.05434', lat: '22.54647' };
      } else if (address.includes('香港')) {
        return { lon: '114.1544', lat: '22.280685' };
      } else {
        throw new Error('地理编码失败');
      }
    }
  } catch (error) {
    console.error('地理编码请求失败:', error);
    // 返回默认坐标
    if (address.includes('深圳')) {
      return { lon: '114.05434', lat: '22.54647' };
    } else if (address.includes('香港')) {
      return { lon: '114.1544', lat: '22.280685' };
    } else {
      throw new Error('地理编码失败');
    }
  }
};

// 使用两点经纬度计算距离（哈弗赛因公式，单位：公里）
const calculateDistance = (lon1: number, lat1: number, lon2: number, lat2: number): number => {
  const R = 6371; // 地球半径，单位：公里
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// 获取两地间的距离（公里）
export const getDistance = async (origin: string, destination: string): Promise<number> => {
  try {
    // 使用天地图API获取实际坐标
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    
    // 计算实际距离
    const distance = calculateDistance(
      parseFloat(originCoords.lon), 
      parseFloat(originCoords.lat), 
      parseFloat(destCoords.lon), 
      parseFloat(destCoords.lat)
    );
    
    return distance;
  } catch (error) {
    console.error('距离计算失败:', error);
    // 返回一个合理的默认值
    return 30; // 30公里作为默认值
  }
};

// 生成两点之间的路线点
const generateRoutePoints = (
  originLon: number, 
  originLat: number, 
  destLon: number, 
  destLat: number, 
  pointCount: number
): any[] => {
  const points = [];
  
  for (let i = 0; i < pointCount; i++) {
    const ratio = i / (pointCount - 1);
    const lon = originLon + (destLon - originLon) * ratio;
    const lat = originLat + (destLat - originLat) * ratio;
    
    points.push({
      lng: lon,
      lat: lat,
      distance: calculateDistance(originLon, originLat, lon, lat),
    });
  }
  
  return points;
};

// 获取旅行路线信息
export const getTravelRoute = async (origin: string, destination: string, vehicleType: string): Promise<any> => {
  try {
    // 获取实际坐标
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    
    const originLon = parseFloat(originCoords.lon);
    const originLat = parseFloat(originCoords.lat);
    const destLon = parseFloat(destCoords.lon);
    const destLat = parseFloat(destCoords.lat);
    
    // 计算实际距离（直线距离，作为估算）
    const distance = calculateDistance(originLon, originLat, destLon, destLat);
    
    const vehicleSpeedMap = {
      '自行车': 15,
      '摩托车': 60,
      '房车': 80
    };
    
    const speed = vehicleSpeedMap[vehicleType as keyof typeof vehicleSpeedMap] || 15;
    const duration = distance / speed; // 小时
    
    // AMapComponent将使用高德地图API获取实际路径，这里只提供基本信息
    return {
      distance,
      duration,
      speed,
      origin: {
        name: origin,
        lon: originCoords.lon,
        lat: originCoords.lat
      },
      destination: {
        name: destination,
        lon: destCoords.lon,
        lat: destCoords.lat
      }
    };
  } catch (error) {
    console.error('路线规划失败:', error);
    // 模拟一些数据作为回退
    return fallbackTravelRoute(origin, destination, vehicleType);
  }
};

// 备用的模拟路线生成函数
const fallbackTravelRoute = (origin: string, destination: string, vehicleType: string): any => {
  const vehicleSpeedMap = {
    '自行车': 15,
    '摩托车': 60,
    '房车': 80
  };
  
  // 深圳到香港大约30公里
  const distance = 30;
  const speed = vehicleSpeedMap[vehicleType as keyof typeof vehicleSpeedMap] || 15;
  const duration = distance / speed; // 小时
  
  // 深圳和香港的默认坐标
  const originCoords = { lon: '114.05434', lat: '22.54647' };
  const destCoords = { lon: '114.1544', lat: '22.280685' };
  
  return {
    distance,
    duration,
    speed,
    origin: {
      name: origin,
      lon: originCoords.lon,
      lat: originCoords.lat
    },
    destination: {
      name: destination,
      lon: destCoords.lon,
      lat: destCoords.lat
    }
  };
};

// 获取旅途中的兴趣点
export const getPOIsAlongRoute = async (routePoints: any[]): Promise<any[]> => {
  // 在实际项目中，这里应该调用高德地图API获取沿途的兴趣点
  // 例如：使用高德地图的周边搜索API
  // 这里使用模拟数据
  return new Promise<any[]>((resolve) => {
    const poiTypes = ['餐厅', '加油站', '景点', '休息区', '酒店'];
    const pois: Array<{
      name: string;
      type: string;
      lat: number;
      lng: number;
      distance: number;
    }> = [];
    
    // 为路线上的每个点随机生成一些兴趣点
    for (let i = 0; i < routePoints.length; i++) {
      // 每个点有50%的概率生成兴趣点
      if (Math.random() > 0.5) {
        const point = routePoints[i];
        const poiType = poiTypes[Math.floor(Math.random() * poiTypes.length)];
        
        pois.push({
          name: `${poiType}${Math.floor(Math.random() * 100)}`,
          type: poiType,
          lat: point.lat + (Math.random() - 0.5) * 0.01,
          lng: point.lng + (Math.random() - 0.5) * 0.01,
          distance: point.distance,
        });
      }
    }
    
    // 模拟网络延迟
    setTimeout(() => {
      resolve(pois);
    }, 600);
  });
};

// 获取城市天气信息
export const getCityWeather = async (city: string): Promise<any> => {
  // 在实际项目中，这里应该调用天气API
  // 这里使用模拟数据
  return new Promise((resolve) => {
    const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨'];
    const weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const temperature = Math.floor(Math.random() * 15) + 15; // 15-30度
    
    // 模拟网络延迟
    setTimeout(() => {
      resolve({
        city,
        weather: weatherType,
        temperature,
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%湿度
        windSpeed: Math.floor(Math.random() * 5) + 1, // 1-6级风速
      });
    }, 400);
  });
}; 