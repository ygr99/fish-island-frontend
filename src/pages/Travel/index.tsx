import { ClockCircleOutlined, CompassOutlined, EnvironmentOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Card,
  Divider,
  message,
  Progress,
  Select,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { AMapComponent } from './components/AMapComponent';
import styles from './index.less';
import { geocodeAddress, getCityWeather, getTravelRoute } from './services/travelService';

const { Title, Text } = Typography;
const { Option } = Select;

// 默认起点和终点城市
const DEFAULT_ORIGIN = '';
const DEFAULT_DESTINATION = '';

// 默认坐标
const DEFAULT_COORDS: { [key: string]: { lon: string; lat: string } } = {
  // 默认坐标已移除
};

// 天地图API配置
const TIANDITU_KEY = 'a44fddbccbd491736dfa2969d818c07f';
const TIANDITU_SEARCH_API = 'https://api.tianditu.gov.cn/v2/search';

// 天地图搜索接口
const searchLocation = async (
  keyword: string,
): Promise<{ value: string; coords?: { lon: string; lat: string } }[]> => {
  if (!keyword) return [];

  try {
    const postStr = JSON.stringify({
      keyWord: keyword,
      level: 12,
      mapBound: '-180,-90,180,90',
      queryType: 1,
      start: 0,
      count: 10,
    });

    const url = `${TIANDITU_SEARCH_API}?postStr=${encodeURIComponent(
      postStr,
    )}&type=query&tk=${TIANDITU_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status?.infocode === 1000) {
      // 处理搜索结果
      if (data.prompt && data.prompt.length > 0) {
        // 处理提示结果
        return data.prompt.map((item: any) => ({
          value: item.keyword,
          coords: data.area
            ? { lon: data.area.lonlat.split(',')[0], lat: data.area.lonlat.split(',')[1] }
            : undefined,
        }));
      } else if (data.area) {
        // 直接返回区域结果
        return [
          {
            value: data.area.name,
            coords: { lon: data.area.lonlat.split(',')[0], lat: data.area.lonlat.split(',')[1] },
          },
        ];
      }
    }
    return [];
  } catch (error) {
    console.error('搜索位置出错:', error);
    return [{ value: keyword }];
  }
};

const Travel: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [vehicle, setVehicle] = useState<string>('自行车');
  const [isTravel, setIsTravel] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [travelTime, setTravelTime] = useState<number>(0);
  const [distanceTotal, setDistanceTotal] = useState<number>(0);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [travelStartTime, setTravelStartTime] = useState<number>(0);
  const [originSuggestions, setOriginSuggestions] = useState<
    { value: string; coords?: { lon: string; lat: string } }[]
  >([]);
  const [destSuggestions, setDestSuggestions] = useState<
    { value: string; coords?: { lon: string; lat: string } }[]
  >([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [selectedOriginCoords, setSelectedOriginCoords] = useState<{
    lon: string;
    lat: string;
  } | null>(null);
  const [selectedDestCoords, setSelectedDestCoords] = useState<{ lon: string; lat: string } | null>(
    null,
  );

  const vehicleSpeedMap = {
    自行车: 15, // 时速15公里
    摩托车: 60, // 时速60公里
    房车: 80, // 时速80公里
  };

  // 通知地图已加载
  const handleMapLoaded = () => {
    setMapLoading(false);
  };

  // 搜索出发地
  const handleOriginSearch = async (value: string) => {
    if (!value) {
      setOriginSuggestions([]);
      return;
    }

    const suggestions = await searchLocation(value);
    setOriginSuggestions(suggestions);
  };

  // 搜索目的地
  const handleDestinationSearch = async (value: string) => {
    if (!value) {
      setDestSuggestions([]);
      return;
    }

    const suggestions = await searchLocation(value);
    setDestSuggestions(suggestions);
  };

  // 开始旅行
  const startTravel = async () => {
    if (!origin) {
      message.error('请选择出发地');
      return;
    }

    if (!destination) {
      message.error('请选择目的地');
      return;
    }

    setLoading(true);
    setMapLoading(true);

    try {
      // 验证坐标是否可用
      let originCoords, destCoords;

      if (selectedOriginCoords) {
        // 使用已选择的坐标
        originCoords = selectedOriginCoords;
        console.log('使用已选择的起点坐标:', originCoords);
      } else {
        try {
          // 尝试获取起点坐标
          originCoords = await geocodeAddress(origin);
          console.log('起点坐标:', originCoords);
        } catch (error) {
          console.error('获取起点坐标失败:', error);
          message.error('获取起点坐标失败，请重新选择出发地');
          setLoading(false);
          setMapLoading(false);
          return;
        }
      }

      if (selectedDestCoords) {
        // 使用已选择的坐标
        destCoords = selectedDestCoords;
        console.log('使用已选择的终点坐标:', destCoords);
      } else {
        try {
          // 尝试获取终点坐标
          destCoords = await geocodeAddress(destination);
          console.log('终点坐标:', destCoords);
        } catch (error) {
          console.error('获取终点坐标失败:', error);
          message.error('获取终点坐标失败，请重新选择目的地');
          setLoading(false);
          setMapLoading(false);
          return;
        }
      }

      // 获取路线规划数据 - 只规划一次路线，避免重复规划
      const userSelectedDestination = destination; // 保存用户选择的目的地
      const routeResult = await getTravelRoute(origin, userSelectedDestination, vehicle);
      setRouteData(routeResult);

      // 设置旅行参数
      setDistanceTotal(routeResult.distance);
      setDistanceTraveled(0);
      setTravelTime(routeResult.duration);

      // 获取目的地天气
      const weatherResult = await getCityWeather(userSelectedDestination);
      setWeatherData(weatherResult);

      // 开始旅行倒计时
      message.success('旅途规划完成，准备出发！');
      setTravelStartTime(Date.now());
      setProgress(0);
      setIsTravel(true);
    } catch (error) {
      console.error('旅途规划失败:', error);
      message.error('旅途规划失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 模拟旅行进度
  useEffect(() => {
    if (!isTravel) return;

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          message.success('恭喜你到达目的地！');
          setIsTravel(false);
          return 100;
        }

        // 计算已经过去的时间（小时）
        const elapsedHours = (Date.now() - travelStartTime) / 1000 / 60 / 60;
        // 根据速度计算应该走过的距离
        const speed = vehicleSpeedMap[vehicle as keyof typeof vehicleSpeedMap];
        const shouldTravelDistance = speed * elapsedHours;

        // 为了演示效果，这里加快模拟速度
        const simulationSpeedFactor = 100;
        const newDistance = Math.min(shouldTravelDistance * simulationSpeedFactor, distanceTotal);
        setDistanceTraveled(newDistance);

        return (newDistance / distanceTotal) * 100;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTravel, travelStartTime, distanceTotal, vehicle]);

  // 重置旅行
  const resetTravel = () => {
    setIsTravel(false);
    setProgress(0);
    setDistanceTraveled(0);
    setRouteData(null);
    setWeatherData(null);
  };

  // 显示已经行驶的时间
  const getFormattedElapsedTime = () => {
    if (!isTravel) return '0小时0分钟';
    const elapsedMs = Date.now() - travelStartTime;
    const minutes = Math.floor((elapsedMs / 1000 / 60) % 60);
    const hours = Math.floor(elapsedMs / 1000 / 60 / 60);
    return `${hours}小时${minutes}分钟`;
  };

  // 显示估计总时间
  const getFormattedTotalTime = () => {
    const hours = Math.floor(travelTime);
    const minutes = Math.floor((travelTime - hours) * 60);
    return `${hours}小时${minutes}分钟`;
  };

  // 获取交通工具图标
  const getVehicleIcon = () => {
    switch (vehicle) {
      case '自行车':
        return '🚲';
      case '摩托车':
        return '🏍️';
      case '房车':
        return '🚐';
      default:
        return '🚶';
    }
  };

  // 生成旅行状态描述
  const getTravelStatus = () => {
    if (!isTravel) return '';

    const vehicleIcon = getVehicleIcon();

    if (progress < 5) {
      return `旅程开始，我们准备${vehicleIcon}出发前往${destination}。`;
    } else if (progress < 30) {
      return `已经${vehicleIcon}出发了一段时间，沿途风景不错${
        weatherData ? '，天气' + weatherData.weather : ''
      }。`;
    } else if (progress < 60) {
      return `已经${vehicleIcon}行驶了一半路程，继续前进！${
        weatherData ? '当前温度' + weatherData.temperature + '°C' : ''
      }`;
    } else if (progress < 90) {
      return `即将${vehicleIcon}抵达${destination}，请做好准备。`;
    } else {
      return `已${vehicleIcon}到达${destination}，希望你喜欢这次旅行！`;
    }
  };

  // 处理出发地选择
  const handleOriginSelect = (value: string, option: any) => {
    setOrigin(value);
    const selectedOption = originSuggestions.find((item) => item.value === value);
    if (selectedOption && selectedOption.coords) {
      setSelectedOriginCoords(selectedOption.coords);
    } else {
      setSelectedOriginCoords(null);
    }
  };

  // 处理目的地选择
  const handleDestinationSelect = (value: string, option: any) => {
    setDestination(value);
    const selectedOption = destSuggestions.find((item) => item.value === value);
    if (selectedOption && selectedOption.coords) {
      setSelectedDestCoords(selectedOption.coords);
    } else {
      setSelectedDestCoords(null);
    }
  };

  return (
    <div className={styles.travelContainer}>
      <Card
        title={
          <div className={styles.cardTitle}>
            <CompassOutlined /> AI云游
            <div className={styles.subtitle}>让灵魂去旅行，带来身临其境的体验</div>
          </div>
        }
        bordered={false}
        className={styles.travelCard}
      >
        {!isTravel ? (
          <div className={styles.travelForm}>
            <div className={styles.formItem}>
              <label>出发地</label>
              <AutoComplete
                value={origin}
                options={originSuggestions}
                onSearch={handleOriginSearch}
                onChange={setOrigin}
                onSelect={handleOriginSelect}
                placeholder="请输入出发地"
                style={{ width: '100%' }}
              />
            </div>

            <div className={styles.formItem}>
              <label>目的地</label>
              <AutoComplete
                value={destination}
                options={destSuggestions}
                onSearch={handleDestinationSearch}
                onChange={setDestination}
                onSelect={handleDestinationSelect}
                placeholder="请输入目的地"
                style={{ width: '100%' }}
              />
            </div>

            <div className={styles.formItem}>
              <label>选择载具</label>
              <Select value={vehicle} onChange={setVehicle} style={{ width: '100%' }}>
                <Option value="自行车">
                  <div className={styles.vehicleOption}>
                    <span>{getVehicleIcon()} 自行车</span>
                    <span className={styles.speedInfo}>时速 15km/h</span>
                  </div>
                </Option>
                <Option value="摩托车">
                  <div className={styles.vehicleOption}>
                    <span>{getVehicleIcon()} 摩托车</span>
                    <span className={styles.speedInfo}>时速 60km/h</span>
                  </div>
                </Option>
                <Option value="房车">
                  <div className={styles.vehicleOption}>
                    <span>{getVehicleIcon()} 房车</span>
                    <span className={styles.speedInfo}>时速 80km/h</span>
                  </div>
                </Option>
              </Select>
            </div>

            <div className={styles.mapFeatureInfo}>
              <EnvironmentOutlined /> 使用高德地图API提供真实导航体验
            </div>

            <Button
              type="primary"
              block
              onClick={startTravel}
              loading={loading}
              className={styles.startButton}
            >
              开始云游
            </Button>
          </div>
        ) : (
          <div className={styles.travelProgress}>
            <div className={styles.travelHeader}>
              <Button onClick={resetTravel} className={styles.backButton}>
                返回
              </Button>
              <Title level={4}>{destination}</Title>
              <div className={styles.vehicleInfo}>
                {getVehicleIcon()} {vehicle} · 已行驶 {getFormattedElapsedTime()}
              </div>

              {weatherData && (
                <div className={styles.weatherInfo}>
                  {weatherData.weather} {weatherData.temperature}°C
                </div>
              )}
            </div>

            <div className={styles.progressInfo}>
              <div className={styles.progressItem}>
                <Text>旅程进度: {progress.toFixed(0)}%</Text>
                <Progress percent={progress} status="active" />
              </div>

              <div className={styles.travelStats}>
                <Tooltip title="已行驶距离">
                  <div className={styles.statItem}>
                    <EnvironmentOutlined />
                    <span>
                      {distanceTraveled.toFixed(1)}/{distanceTotal.toFixed(1)}km
                    </span>
                  </div>
                </Tooltip>

                <Tooltip title="预计总时间">
                  <div className={styles.statItem}>
                    <ClockCircleOutlined />
                    <span>{getFormattedTotalTime()}</span>
                  </div>
                </Tooltip>
              </div>
            </div>

            <Divider>旅途的声音</Divider>

            <div className={styles.travelVoice}>{getTravelStatus()}</div>

            <div className={styles.mapContainer}>
              {mapLoading && (
                <div className={styles.mapLoadingOverlay}>
                  <Spin tip="加载高德地图中..." />
                </div>
              )}
              <AMapComponent
                origin={origin}
                destination={destination}
                progress={progress}
                onMapLoaded={handleMapLoaded}
                vehicleType={vehicle}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Travel;
