import React, { useEffect, useRef, useState } from 'react';
import { geocodeAddress } from '../services/travelService';
import styles from './AMapComponent.less';

// 添加高德地图安全密钥配置
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
    AMapLoader: any;
  }
}

// 配置高德地图安全密钥
if (typeof window !== 'undefined') {
  window._AMapSecurityConfig = {
    securityJsCode: '06f1763c98abc9c84d5f60fc112a4e04', // 安全密钥
  };
}

interface AMapComponentProps {
  origin: string;
  destination: string;
  progress: number;
  onMapLoaded?: () => void;
  vehicleType: string; // 添加交通工具类型
  onReadyToTravel?: () => void; // 添加准备好开始行程的回调
}

// 高德地图组件，使用真实的高德地图API
export const AMapComponent = ({
  origin,
  destination,
  progress,
  onMapLoaded,
  vehicleType,
  onReadyToTravel,
}: AMapComponentProps): React.ReactElement => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const positionMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const routePlanningInProgress = useRef(false);
  const [isReadyToTravel, setIsReadyToTravel] = useState(false); // 添加状态变量控制是否可以开始行程

  // 初始化地图
  useEffect(() => {
    // 动态加载高德地图脚本
    const loadAMap = () => {
      return new Promise<void>((resolve) => {
        if (window.AMap) {
          resolve();
          return;
        }

        // 先加载加载器
        const loaderScript = document.createElement('script');
        loaderScript.src = 'https://webapi.amap.com/loader.js';
        loaderScript.onload = () => {
          console.log('高德地图加载器加载成功');

          // 然后使用加载器加载地图及插件
          window.AMapLoader.load({
            key: '32eeca02233449a0362dfd27a13428aa', // 应用Key
            version: '1.4.15',
            plugins: [
              'AMap.Riding',
              'AMap.Walking',
              'AMap.Driving',
              'AMap.Geocoder',
              'AMap.Scale',
              'AMap.ToolBar',
            ],
          })
            .then(() => {
              console.log('高德地图API加载成功');
              resolve();
            })
            .catch((error: any) => {
              console.error('高德地图API加载失败:', error);
              resolve(); // 继续，以便应用不会完全崩溃
            });
        };
        loaderScript.onerror = (error) => {
          console.error('高德地图加载器加载失败:', error);
          resolve();
        };
        document.head.appendChild(loaderScript);
      });
    };

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        await loadAMap();

        // 创建地图实例 - 使用中国中心点作为初始位置
        const map = new window.AMap.Map(mapContainerRef.current, {
          zoom: 3, // 初始缩放级别较小，显示全国范围
          resizeEnable: true, // 启用自动调整大小
          scrollWheel: true, // 启用滚轮缩放
          animateEnable: true, // 启用地图动画效果
          jogEnable: true, // 启用地图缓动平移效果
        });

        mapRef.current = map;

        // 地图加载完成回调
        map.on('complete', () => {
          console.log('地图实例创建完成');
          setIsMapInitialized(true);

          if (onMapLoaded) {
            onMapLoaded();
          }
        });
      } catch (error) {
        console.error('初始化地图时出错:', error);
        // 通知用户
        if (onMapLoaded) {
          onMapLoaded();
        }
      }
    };

    initMap();

    return () => {
      // 清除地图以防内存泄漏
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, []);

  // 当出发地/目的地/地图初始化发生变化时，更新坐标
  useEffect(() => {
    const fetchCoordinates = async () => {
      // 避免重复请求
      if (routePlanningInProgress.current) return;

      // 确保有出发地和目的地
      if (!origin || !destination || origin.trim() === '' || destination.trim() === '') {
        return;
      }

      try {
        routePlanningInProgress.current = true;
        // 使用天地图API进行地理编码
        const originGeocode = await geocodeAddress(origin);
        const destGeocode = await geocodeAddress(destination);

        // 更新坐标状态
        setOriginCoords([parseFloat(originGeocode.lon), parseFloat(originGeocode.lat)]);
        setDestCoords([parseFloat(destGeocode.lon), parseFloat(destGeocode.lat)]);
      } catch (error) {
        console.error('获取坐标失败:', error);
        // 不再设置默认坐标，而是保持为null
        setOriginCoords(null);
        setDestCoords(null);
      } finally {
        routePlanningInProgress.current = false;
      }
    };

    // 只在有实际输入时才获取坐标
    if (origin && destination && origin.trim() !== '' && destination.trim() !== '') {
      fetchCoordinates();
    }
  }, [origin, destination]);

  // 保存最后一次规划的坐标，用于防止重复规划
  const lastPlanRef = useRef<{
    origin?: [number, number];
    destination?: [number, number];
    vehicleType?: string;
  }>({});

  // 当坐标或地图初始化变化时，规划路线
  useEffect(() => {
    // 确保地图已初始化且有有效坐标
    if (!isMapInitialized || !originCoords || !destCoords) {
      return;
    }

    // 检查是否与上次规划相同
    const lastPlan = lastPlanRef.current;
    if (
      lastPlan.origin &&
      lastPlan.destination &&
      lastPlan.vehicleType === vehicleType &&
      lastPlan.origin[0] === originCoords[0] &&
      lastPlan.origin[1] === originCoords[1] &&
      lastPlan.destination[0] === destCoords[0] &&
      lastPlan.destination[1] === destCoords[1]
    ) {
      console.log('跳过重复规划相同的路线');
      return;
    }

    // 记录本次规划信息
    lastPlanRef.current = {
      origin: [...originCoords],
      destination: [...destCoords],
      vehicleType,
    };

    console.log('规划新路线:', vehicleType, '从', originCoords, '到', destCoords);

    // 使用高德地图API进行路线规划
    const originLocation = new window.AMap.LngLat(originCoords[0], originCoords[1]);
    const destLocation = new window.AMap.LngLat(destCoords[0], destCoords[1]);

    // 执行路线规划前，先确保地图在全国视图
    mapRef.current.setZoom(3, false, 100);

    // 稍微延迟后规划路线并开始动画
    setTimeout(() => {
      planRoute(originLocation, destLocation);
    }, 1000);
  }, [isMapInitialized, originCoords, destCoords, vehicleType]);

  // 当进度变化时，更新当前位置
  useEffect(() => {
    // 如果还没准备好行程，则不更新位置
    if (!isReadyToTravel) return;

    if (!isMapInitialized || !routeInfo || !routeInfo.path || routeInfo.path.length < 2) return;

    // 计算当前位置索引
    const pathLength = routeInfo.path.length;
    const currentIndex = Math.min(Math.floor((progress / 100) * (pathLength - 1)), pathLength - 1);

    // 更新当前位置标记
    if (positionMarkerRef.current && mapRef.current) {
      positionMarkerRef.current.setPosition(routeInfo.path[currentIndex]);

      // 更新路线显示，将已经走过的部分用不同颜色显示
      updateRouteDisplay(currentIndex);
    }
  }, [progress, routeInfo, isReadyToTravel]);

  // 更新路线显示，将已走过和未走过的路段用不同颜色显示
  const updateRouteDisplay = (currentIndex: number) => {
    if (!mapRef.current || !routeInfo || !routeInfo.path || currentIndex < 0) return;

    const path = routeInfo.path;

    // 移除之前的路线
    if (routeLineRef.current) {
      if (routeLineRef.current.setMap) {
        routeLineRef.current.setMap(null);
      } else if (routeLineRef.current.completed && routeLineRef.current.remaining) {
        routeLineRef.current.completed.setMap(null);
        routeLineRef.current.remaining.setMap(null);
      }
    }

    // 创建已经走过的路线部分
    const completedPath = path.slice(0, currentIndex + 1);
    const completedLine = new window.AMap.Polyline({
      path: completedPath,
      isOutline: true,
      outlineColor: '#ffeeee',
      borderWeight: 2,
      strokeWeight: 5,
      strokeColor: '#ff4400', // 使用红色表示已走过的路线
      lineJoin: 'round',
      map: mapRef.current,
      zIndex: 100,
    });

    // 创建剩余的路线部分
    const remainingPath = path.slice(currentIndex);
    const remainingLine = new window.AMap.Polyline({
      path: remainingPath,
      isOutline: true,
      outlineColor: '#ffeeee',
      borderWeight: 2,
      strokeWeight: 5,
      strokeColor: '#0091ff', // 使用蓝色表示未走过的路线
      lineJoin: 'round',
      map: mapRef.current,
      zIndex: 90,
    });

    // 保存路线引用
    routeLineRef.current = {
      completed: completedLine,
      remaining: remainingLine,
    };

    // 使地图跟随移动
    if (currentIndex > 0) {
      // 每移动一步调整地图中心
      mapRef.current.setCenter(path[currentIndex]);
    }
  };

  // 规划路线
  const planRoute = (originLocation: any, destLocation: any) => {
    if (!mapRef.current || !window.AMap) return;

    // 清除之前的路线和标记
    clearMapObjects();

    // 根据交通工具类型选择不同的路线规划方式
    if (vehicleType === '自行车') {
      planRidingRoute(originLocation, destLocation);
    } else if (vehicleType === '摩托车' || vehicleType === '房车') {
      planDrivingRoute(originLocation, destLocation);
    } else {
      // 对于其他类型，显示路线规划失败
      showRouteFailedMessage();
    }
  };

  // 清除地图上的路线和标记
  const clearMapObjects = () => {
    if (routeLineRef.current) {
      if (routeLineRef.current.setMap) {
        routeLineRef.current.setMap(null);
      } else if (routeLineRef.current.completed && routeLineRef.current.remaining) {
        routeLineRef.current.completed.setMap(null);
        routeLineRef.current.remaining.setMap(null);
      }
      routeLineRef.current = null;
    }

    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }

    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }

    if (positionMarkerRef.current) {
      positionMarkerRef.current.setMap(null);
      positionMarkerRef.current = null;
    }
  };

  // 显示路线规划失败消息
  const showRouteFailedMessage = () => {
    if (!mapRef.current) return;

    // 在地图中心添加提示信息
    const infoWindow = new window.AMap.InfoWindow({
      content: '<div style="padding: 10px; font-size: 14px; color: red;">路线规划失败</div>',
      offset: new window.AMap.Pixel(0, 0),
      closeWhenClickMap: true,
    });

    infoWindow.open(mapRef.current, mapRef.current.getCenter());

    // 通知地图加载完成
    if (onMapLoaded) {
      onMapLoaded();
    }
  };

  // 简单的球面距离计算
  const calculateDistance = (lng1: number, lat1: number, lng2: number, lat2: number): number => {
    const R = 6371; // 地球半径，单位：公里
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 骑行路线规划
  const planRidingRoute = (originLocation: any, destLocation: any) => {
    if (!window.AMap || !window.AMap.Riding) {
      console.error('高德地图API未加载或Riding插件未加载');
      showRouteFailedMessage();
      return;
    }

    try {
      // 清除之前的路线和标记
      clearMapObjects();

      // 获取经纬度数值
      const originLng = originLocation.getLng();
      const originLat = originLocation.getLat();
      const destLng = destLocation.getLng();
      const destLat = destLocation.getLat();

      console.log('骑行规划起点经纬度：', originLng, originLat);
      console.log('骑行规划终点经纬度：', destLng, destLat);

      // 创建起点和终点点位
      const originPoint = new window.AMap.LngLat(originLng, originLat);
      const destPoint = new window.AMap.LngLat(destLng, destLat);

      // 先创建起点和终点标记
      startMarkerRef.current = new window.AMap.Marker({
        position: originPoint,
        map: mapRef.current,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
        offset: new window.AMap.Pixel(-13, -34),
        zIndex: 110,
        animation: 'AMAP_ANIMATION_DROP', // 添加点标记降落动画
      });

      endMarkerRef.current = new window.AMap.Marker({
        position: destPoint,
        map: mapRef.current,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
        offset: new window.AMap.Pixel(-13, -34),
        zIndex: 110,
        animation: 'AMAP_ANIMATION_DROP', // 添加点标记降落动画
      });

      // 创建当前位置标记
      positionMarkerRef.current = new window.AMap.Marker({
        map: mapRef.current,
        position: originPoint,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png',
        offset: new window.AMap.Pixel(-13, -25),
        zIndex: 120,
      });

      // 骑行路线规划
      const ridingOptions = {
        map: mapRef.current,
        hideMarkers: true, // 隐藏默认标记点，我们将使用自定义标记
      };

      // 实例化骑行导航服务
      const riding = new window.AMap.Riding(ridingOptions);

      // 注意：直接使用经纬度点，而不是字符串
      console.log('正在搜索骑行路线:', [originLng, originLat], [destLng, destLat]);

      riding.search([originLng, originLat], [destLng, destLat], (status: string, result: any) => {
        console.log('骑行路线规划状态:', status);
        console.log('骑行路线规划结果:', result);

        if (status === 'complete' && result) {
          console.log('骑行路线规划成功', result);

          // 从结果中提取路径数据
          const pathFromApi = parseRidingRouteToPath(result);

          if (pathFromApi && pathFromApi.length >= 2) {
            // 使用API返回的路径
            // 自定义路线样式
            routeLineRef.current = new window.AMap.Polyline({
              path: pathFromApi,
              isOutline: true,
              outlineColor: '#ffeeee',
              borderWeight: 2,
              strokeWeight: 5,
              strokeColor: '#0091ff',
              lineJoin: 'round',
              map: mapRef.current,
              zIndex: 100,
              showDir: true, // 显示方向箭头
            });

            // 存储路线信息
            setRouteInfo({
              path: pathFromApi,
              distance: result.routes ? result.routes[0].distance : 0,
            });

            // 平滑动画过渡到适合视野
            mapRef.current.setFitView(
              [startMarkerRef.current, endMarkerRef.current, routeLineRef.current],
              false, // 是否立即
              [60, 60, 60, 60], // 视野边距
              13, // 最大缩放级别
              1000, // 动画时间1秒
            );

            // 执行缩放以查看起点位置细节
            setTimeout(() => {
              // 确保地图视图中心是起点位置
              mapRef.current.setCenter(originPoint);

              // 开始从当前视图级别逐渐缩放到更细节的视图
              const currentZoom = mapRef.current.getZoom();
              const targetZoom = 15;

              if (currentZoom < targetZoom) {
                // 逐级放大到15级
                let zoom = currentZoom;
                const zoomInterval = setInterval(() => {
                  zoom += 0.5;
                  // 每次缩放时确保中心点是起点
                  mapRef.current.setCenter(originPoint);

                  if (zoom >= targetZoom) {
                    zoom = targetZoom;
                    clearInterval(zoomInterval);

                    // 当缩放完成后，设置状态为可以开始行程
                    setIsReadyToTravel(true);

                    // 通知外部组件可以开始行程了
                    if (onReadyToTravel) {
                      onReadyToTravel();
                    }
                  }
                  mapRef.current.setZoom(zoom, false, 500);
                }, 500); // 每0.5秒放大0.5级
              }
            }, 1200); // 等待setFitView完成后执行
          } else {
            console.error('无效的路径点');
            showRouteFailedMessage();
          }
        } else {
          console.error('骑行路线规划失败', status, result);
          showRouteFailedMessage();
        }

        // 通知地图加载完成
        if (onMapLoaded) {
          onMapLoaded();
        }
      });
    } catch (error) {
      console.error('执行骑行路线规划时出错:', error);
      showRouteFailedMessage();
      // 通知地图加载完成
      if (onMapLoaded) {
        onMapLoaded();
      }
    }
  };

  // 解析骑行路线路径
  const parseRidingRouteToPath = (result: any): any[] => {
    if (!result) {
      console.error('解析路径时路线数据为空');
      return [];
    }

    console.log('解析路径数据:', result);
    const path: any[] = [];

    try {
      // 根据官方示例提供的数据结构进行解析
      if (result.data && result.data.paths && result.data.paths.length > 0) {
        // 处理新版API返回的结构
        const pathData = result.data.paths[0];
        if (pathData.steps) {
          pathData.steps.forEach((step: any) => {
            if (step.polyline) {
              // 高德地图API返回的polyline是字符串，需要解析成坐标点
              const polyline = step.polyline.split(';');
              polyline.forEach((pos: string) => {
                const [lng, lat] = pos.split(',');
                if (lng && lat) {
                  path.push([parseFloat(lng), parseFloat(lat)]);
                }
              });
            }
          });
        }
      } else if (result.routes && result.routes.length > 0) {
        // 处理旧版API返回的结构
        const route = result.routes[0];
        if (route.rides) {
          route.rides.forEach((ride: any) => {
            if (ride.path) {
              ride.path.forEach((point: any) => {
                path.push(point);
              });
            }
          });
        } else if (route.steps) {
          route.steps.forEach((step: any) => {
            if (step.path) {
              step.path.forEach((point: any) => {
                path.push(point);
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('解析路径时出错:', error);
    }

    console.log(`解析后的路径点数量: ${path.length}`);
    return path;
  };

  // 驾车路线规划
  const planDrivingRoute = (originLocation: any, destLocation: any) => {
    if (!window.AMap || !window.AMap.Driving) {
      console.error('高德地图API未加载或Driving插件未加载');
      showRouteFailedMessage();
      return;
    }

    try {
      // 清除之前的路线和标记
      clearMapObjects();

      // 获取经纬度数值
      const originLng = originLocation.getLng();
      const originLat = originLocation.getLat();
      const destLng = destLocation.getLng();
      const destLat = destLocation.getLat();

      console.log('驾车规划起点经纬度：', originLng, originLat);
      console.log('驾车规划终点经纬度：', destLng, destLat);

      // 创建起点和终点点位
      const originPoint = new window.AMap.LngLat(originLng, originLat);
      const destPoint = new window.AMap.LngLat(destLng, destLat);

      // 先创建起点和终点标记
      startMarkerRef.current = new window.AMap.Marker({
        position: originPoint,
        map: mapRef.current,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
        offset: new window.AMap.Pixel(-13, -34),
        zIndex: 110,
        animation: 'AMAP_ANIMATION_DROP', // 添加点标记降落动画
      });

      endMarkerRef.current = new window.AMap.Marker({
        position: destPoint,
        map: mapRef.current,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
        offset: new window.AMap.Pixel(-13, -34),
        zIndex: 110,
        animation: 'AMAP_ANIMATION_DROP', // 添加点标记降落动画
      });

      // 创建当前位置标记
      positionMarkerRef.current = new window.AMap.Marker({
        map: mapRef.current,
        position: originPoint,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png',
        offset: new window.AMap.Pixel(-13, -25),
        zIndex: 120,
      });

      const drivingOptions = {
        policy:
          vehicleType === '摩托车'
            ? window.AMap.DrivingPolicy.LEAST_TIME // 摩托车优先最快速度
            : window.AMap.DrivingPolicy.LEAST_DISTANCE, // 房车优先最短路线
        map: mapRef.current,
        hideMarkers: true,
      };

      // 实例化驾车导航服务
      const driving = new window.AMap.Driving(drivingOptions);

      // 注意：经纬度需要用逗号分隔的数组格式
      console.log(
        '正在搜索驾车路线:',
        [originLng, originLat].toString(),
        [destLng, destLat].toString(),
      );

      driving.search([originLng, originLat], [destLng, destLat], (status: string, result: any) => {
        console.log('驾车路线规划状态:', status);
        console.log('驾车路线规划结果:', result);

        if (status === 'complete' && result && result.routes && result.routes.length) {
          console.log('驾车路线规划成功', result);

          // 获取路径数据
          const route = result.routes[0];
          const pathFromApi = parseDrivingRouteToPath(route);

          if (pathFromApi && pathFromApi.length >= 2) {
            // 使用API返回的路径
            // 自定义路线样式
            routeLineRef.current = new window.AMap.Polyline({
              path: pathFromApi,
              isOutline: true,
              outlineColor: '#ffeeee',
              borderWeight: 2,
              strokeWeight: 5,
              strokeColor: '#0091ff',
              lineJoin: 'round',
              map: mapRef.current,
              zIndex: 100,
              showDir: true, // 显示方向箭头
            });

            // 存储路线信息
            setRouteInfo({
              path: pathFromApi,
              distance: route.distance,
            });

            // 平滑动画过渡到适合视野
            mapRef.current.setFitView(
              [startMarkerRef.current, endMarkerRef.current, routeLineRef.current],
              false, // 是否立即
              [60, 60, 60, 60], // 视野边距
              13, // 最大缩放级别
              1000, // 动画时间1秒
            );

            // 执行缩放以查看起点位置细节
            setTimeout(() => {
              // 确保地图视图中心是起点位置
              mapRef.current.setCenter(originPoint);

              // 开始从当前视图级别逐渐缩放到更细节的视图
              const currentZoom = mapRef.current.getZoom();
              const targetZoom = 15;

              if (currentZoom < targetZoom) {
                // 逐级放大到15级
                let zoom = currentZoom;
                const zoomInterval = setInterval(() => {
                  zoom += 0.5;
                  // 每次缩放时确保中心点是起点
                  mapRef.current.setCenter(originPoint);

                  if (zoom >= targetZoom) {
                    zoom = targetZoom;
                    clearInterval(zoomInterval);

                    // 当缩放完成后，设置状态为可以开始行程
                    setIsReadyToTravel(true);

                    // 通知外部组件可以开始行程了
                    if (onReadyToTravel) {
                      onReadyToTravel();
                    }
                  }
                  mapRef.current.setZoom(zoom, false, 500);
                }, 1000); // 每1秒放大0.5级
              }
            }, 1200); // 等待setFitView完成后执行
          } else {
            console.error('无效的路径点');
            showRouteFailedMessage();
          }
        } else {
          console.error('驾车路线规划失败', status, result);
          showRouteFailedMessage();
        }

        // 通知地图加载完成
        if (onMapLoaded) {
          onMapLoaded();
        }
      });
    } catch (error) {
      console.error('执行驾车路线规划时出错:', error);
      showRouteFailedMessage();
      // 通知地图加载完成
      if (onMapLoaded) {
        onMapLoaded();
      }
    }
  };

  // 解析驾车路线路径
  const parseDrivingRouteToPath = (route: any): any[] => {
    if (!route) {
      console.error('解析路径时路线数据为空');
      return [];
    }

    console.log('解析驾车路径数据:', route);
    const path = [];

    try {
      // 尝试多种可能的数据结构
      if (route.steps && route.steps.length) {
        for (let i = 0; i < route.steps.length; i++) {
          const step = route.steps[i];
          if (step.path && step.path.length) {
            for (let j = 0; j < step.path.length; j++) {
              path.push(step.path[j]);
            }
          }
        }
      } else if (route.paths && route.paths.length) {
        // 处理另一种可能的路径格式
        for (let i = 0; i < route.paths.length; i++) {
          const pathItem = route.paths[i];
          if (pathItem.steps) {
            for (let j = 0; j < pathItem.steps.length; j++) {
              const step = pathItem.steps[j];
              if (step.path && step.path.length) {
                for (let k = 0; k < step.path.length; k++) {
                  path.push(step.path[k]);
                }
              }
            }
          } else if (pathItem.path && pathItem.path.length) {
            // 直接包含路径点的情况
            for (let j = 0; j < pathItem.path.length; j++) {
              path.push(pathItem.path[j]);
            }
          }
        }
      } else if (route.path && route.path.length) {
        // 可能直接包含路径点
        for (let i = 0; i < route.path.length; i++) {
          path.push(route.path[i]);
        }
      }
    } catch (error) {
      console.error('解析驾车路径时出错:', error);
    }

    console.log(`解析后的驾车路径点数量: ${path.length}`);
    return path;
  };

  return (
    <div className={styles.mapContainer} ref={mapContainerRef}>
      {!isMapInitialized && <div className={styles.loadingText}>加载地图中...</div>}
      {mapRef.current && (
        <div className={styles.mapControls}>
          <div className={styles.zoomControl}>
            <button onClick={() => mapRef.current.zoomIn()} className={styles.zoomButton}>
              +
            </button>
            <button onClick={() => mapRef.current.zoomOut()} className={styles.zoomButton}>
              -
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AMapComponent;
