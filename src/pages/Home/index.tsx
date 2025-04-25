import CustomSites from '@/components/CustomSites';
import WallpaperMenu from '@/components/WallpaperMenu';
import { AppstoreOutlined, DownOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, Modal, Tooltip } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
// 导入Sortable库
// @ts-ignore
import Sortable from 'sortablejs';
// 导入组件系统
// @ts-ignore
import './components/index.ts';
// 导入组件桥接系统
// @ts-ignore
import './components/bridge.ts';

// 为window.componentSystem添加类型声明
declare global {
  interface Window {
    componentSystem: {
      componentNameMapping: Record<
        string,
        {
          directory: string;
          globalVar: string;
        }
      >;
      components: any[];
      libraryComponents: string[];
    };
    openComponent: (componentName: string) => boolean;
  }
}

moment.locale('zh-cn');

interface ShortcutItem {
  icon: string;
  title: string;
  url: string;
  type: 'website' | 'component';
  component?: string;
  bgColor?: string;
}

// 定义内联Shortcut组件
const Shortcut: React.FC<ShortcutItem> = ({ icon, title, url, bgColor }) => {
  // 对iconClass进行处理
  const isFontAwesome = typeof icon === 'string' && icon.includes('fa-');

  // Shortcut样式
  const shortcutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '12px',
    transition: 'all 0.3s ease',
  };

  const iconWrapperStyle: React.CSSProperties = {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#ffffff',
    textAlign: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div style={shortcutStyle}>
      <div style={iconWrapperStyle}>
        {isFontAwesome ? (
          <div
            className={`${
              bgColor || 'bg-blue-500'
            } w-full h-full rounded-full flex items-center justify-center`}
          >
            <i className={`${icon} text-white text-xl`}></i>
          </div>
        ) : (
          <img
            src={icon}
            alt={title}
            style={{ width: '26px', height: '26px', objectFit: 'contain' }}
          />
        )}
      </div>
      <div style={titleStyle}>{title}</div>
    </div>
  );
};

const searchEngines = [
  {
    name: '百度',
    icon: 'https://www.baidu.com/favicon.ico',
    url: 'https://www.baidu.com/s?wd=',
  },
  {
    name: '谷歌',
    icon: 'https://www.google.com/favicon.ico',
    url: 'https://www.google.com/search?q=',
  },
  {
    name: '必应',
    icon: 'https://www.bing.com/favicon.ico',
    url: 'https://www.bing.com/search?q=',
  },
];

const defaultShortcuts: ShortcutItem[] = [
  {
    icon: 'https://www.baidu.com/favicon.ico',
    title: '百度',
    url: 'https://www.baidu.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
  {
    icon: 'https://www.bilibili.com/favicon.ico',
    title: 'bilibili',
    url: 'https://www.bilibili.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
  {
    icon: 'https://www.zhihu.com/favicon.ico',
    title: '知乎',
    url: 'https://www.zhihu.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
  {
    icon: 'https://images.seeklogo.com/logo-png/30/2/github-logo-png_seeklogo-304612.png',
    title: 'GitHub',
    url: 'https://github.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
  {
    icon: 'https://www.taobao.com/favicon.ico',
    title: '淘宝',
    url: 'https://www.taobao.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
  {
    icon: 'https://www.jd.com/favicon.ico',
    title: '京东',
    url: 'https://www.jd.com',
    type: 'website',
    bgColor: 'bg-blue-500',
  },
];

// 从组件系统中获取组件映射数据
const getSystemComponents = (): ShortcutItem[] => {
  console.log('[getSystemComponents] 开始获取系统组件...');
  if (typeof window !== 'undefined' && window.componentSystem) {
    // 获取组件系统中的数据
    const libraryComponentNames = window.componentSystem.libraryComponents || [];
    const components = window.componentSystem.components || [];
    const componentMapping = window.componentSystem.componentNameMapping || {};

    console.log('[getSystemComponents] libraryComponentNames:', libraryComponentNames);
    console.log('[getSystemComponents] components:', components);
    console.log('[getSystemComponents] componentMapping:', componentMapping);

    // 检查库组件列表是否为空
    if (libraryComponentNames.length === 0) {
      console.warn('[getSystemComponents] 组件库列表为空，检查组件系统初始化');

      // 临时解决方案：如果libraryComponents为空，但components不为空，则直接使用components
      if (components.length > 0) {
        console.log(
          '[getSystemComponents] 找到已加载的组件，但libraryComponents为空，尝试直接使用components',
        );

        return components.map((comp: any) => {
          console.log('[getSystemComponents] 处理组件:', comp.name);

          return {
            icon: comp.icon || comp.iconClass || 'fa-solid fa-puzzle-piece',
            bgColor: comp.bgColor || comp.backgroundColor || 'bg-blue-500',
            title: comp.name,
            url: '#',
            type: 'component' as const,
            component: comp.name,
          };
        });
      }

      // 返回空数组，不强制添加任何组件
      return [];
    }

    // 正常处理libraryComponents
    return libraryComponentNames
      .map((name: string) => {
        const componentInstance = components.find((comp) => comp.name === name);
        const componentInfo = componentMapping[name];

        // 调试输出
        console.log(`[getSystemComponents] 处理组件: ${name}`);
        console.log('[getSystemComponents] 组件实例:', componentInstance);
        console.log('[getSystemComponents] 组件信息:', componentInfo);

        // 如果找不到组件实例或组件信息，记录警告
        if (!componentInstance) {
          console.warn(`[getSystemComponents] 找不到组件实例: ${name}`);
        }
        if (!componentInfo) {
          console.warn(`[getSystemComponents] 找不到组件映射信息: ${name}`);
        }

        const iconClass =
          componentInstance?.icon || componentInstance?.iconClass || 'fa-solid fa-puzzle-piece';
        const bgColor =
          componentInstance?.bgColor || componentInstance?.backgroundColor || 'bg-blue-500';

        const result = {
          icon: iconClass,
          bgColor: bgColor,
          title: name,
          url: '#',
          type: 'component' as const,
          component: componentInfo?.directory || name,
        };

        console.log('[getSystemComponents] 生成的组件项:', result);
        return result;
      })
      .filter(Boolean);
  }

  console.warn('[getSystemComponents] 组件系统未初始化');
  return [];
};

// 初始化空数组，稍后会通过useEffect填充
const initialSystemComponents: ShortcutItem[] = [];

const Home: React.FC = () => {
  const [time, setTime] = useState(moment());
  const [weather, setWeather] = useState({
    temperature: '',
    condition: '',
    city: '',
  });
  const [customSites, setCustomSites] = useState<
    Array<{ title: string; url: string; icon: string }>
  >(() => {
    const savedSites = localStorage.getItem('customSites');
    return savedSites ? JSON.parse(savedSites) : [];
  });
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    const savedShortcuts = localStorage.getItem('shortcuts');
    const userShortcuts = savedShortcuts ? JSON.parse(savedShortcuts) : [];

    // 如果本地没有保存的快捷方式，使用默认的
    if (userShortcuts.length === 0) {
      return [...defaultShortcuts];
    }
    return userShortcuts;
  });
  const [currentEngine, setCurrentEngine] = useState(searchEngines[0]);
  const [wallpaper, setWallpaper] = useState(() => {
    const savedWallpaper = localStorage.getItem('wallpaper');
    return savedWallpaper || '/img/defaultWallpaper.webp';
  });
  const [customSitesVisible, setCustomSitesVisible] = useState(false);
  const [componentLibraryVisible, setComponentLibraryVisible] = useState(false);
  const shortcutsRef = useRef<HTMLDivElement>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedShortcut, setSelectedShortcut] = useState<ShortcutItem | null>(null);
  const [systemComponents, setSystemComponents] = useState<ShortcutItem[]>(initialSystemComponents);

  // 从组件系统加载组件
  useEffect(() => {
    // 在浏览器环境中，等待组件系统加载完成后获取组件数据
    const loadSystemComponents = () => {
      // setSystemComponents(getSystemComponents()); // <--- 移除这一行过早的调用
    };

    // 如果已经在浏览器环境中且组件系统已加载，可以移除此处的调用
    // if (typeof window !== 'undefined' && window.componentSystem) {
    //   loadSystemComponents();
    // }

    // 否则等待组件系统加载完成 (通过 componentsRendered 事件处理)
    // window.addEventListener('DOMContentLoaded', loadSystemComponents); // <--- 这一行也可以移除，因为 DOMContentLoaded 不保证组件已注册
    // return () => {
    //   window.removeEventListener('DOMContentLoaded', loadSystemComponents);
    // };
  }, []);

  // 添加组件加载完成事件监听函数
  useEffect(() => {
    // 最多尝试加载5次，增加尝试次数
    let loadAttempts = 0;
    const maxAttempts = 5;

    // 处理组件渲染完成事件
    const handleComponentsRendered = () => {
      console.log('[handleComponentsRendered] 组件渲染完成事件触发!');

      // 确认 libraryComponents 的值
      if (window.componentSystem) {
        console.log(
          '[handleComponentsRendered] 读取到的 libraryComponents:',
          window.componentSystem.libraryComponents,
        );
      } else {
        console.warn('[handleComponentsRendered] 组件系统此时不可用');
      }

      // 打印已注册的组件实例列表
      if (window.componentSystem && window.componentSystem.components) {
        console.log(
          '[handleComponentsRendered] 已注册的组件实例:',
          window.componentSystem.components,
        );
      } else {
        console.warn('[handleComponentsRendered] 组件系统不可用或未完全初始化');
      }

      // 尝试获取系统组件
      const components = getSystemComponents();
      console.log('[handleComponentsRendered] 获取到的系统组件:', components);

      // 更新状态
      setSystemComponents(components);
    };

    // 监听组件渲染完成事件
    document.addEventListener('componentsRendered', handleComponentsRendered);

    // 备用方案：如果事件没有触发，尝试定期检查
    const backupTimer = setInterval(() => {
      loadAttempts++;
      console.log(`[Backup] 尝试加载组件 (尝试 ${loadAttempts}/${maxAttempts})`);

      if (window.componentSystem) {
        // 检查组件系统是否有已注册的组件
        if (window.componentSystem.components && window.componentSystem.components.length > 0) {
          console.log('[Backup] 检测到已加载组件:', window.componentSystem.components.length);

          // 直接从components获取组件列表
          const components = window.componentSystem.components.map((comp: any) => ({
            icon: comp.icon || comp.iconClass || 'fa-solid fa-puzzle-piece',
            bgColor: comp.bgColor || comp.backgroundColor || 'bg-blue-500',
            title: comp.name,
            url: '#',
            type: 'component' as const,
            component: comp.name,
          }));

          console.log('[Backup] 创建的组件列表:', components);

          // 只有当当前没有组件时才更新
          if (systemComponents.length === 0) {
            setSystemComponents(components);
            console.log('[Backup] 已更新组件状态');
          } else {
            console.log('[Backup] 已有组件数据，不需要更新');
          }
        } else {
          console.log('[Backup] 组件系统存在但未找到组件');
        }
      } else {
        console.log('[Backup] 组件系统未初始化');
      }

      // 达到最大尝试次数后清除定时器
      if (loadAttempts >= maxAttempts) {
        console.warn('[Backup] 达到最大尝试次数，停止尝试');
        clearInterval(backupTimer);
      }
    }, 3000); // 每3秒检查一次

    // 组件卸载时移除事件监听和定时器
    return () => {
      document.removeEventListener('componentsRendered', handleComponentsRendered);
      clearInterval(backupTimer);
      console.log('[Home] 清理组件加载相关资源');
    };
  }, [systemComponents.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(moment());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.kxzjoker.cn/api/Weather');
        const data = await response.json();
        if (data.code === 200) {
          const weatherData = data.data.tianqi;
          setWeather({
            temperature: `${weatherData.temperature}°`,
            condition: weatherData.weather,
            city: weatherData.city,
          });
        }
      } catch (error) {
        console.error('获取天气数据失败:', error);
      }
    };

    fetchWeather();
    // 每30分钟更新一次天气数据
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      clearInterval(weatherTimer);
    };
  }, []);

  // 添加键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Ctrl+Shift+B
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
        console.log('快捷键触发: Ctrl+Shift+B');
        e.preventDefault(); // 阻止默认行为
        handleSwitchToFishMode();
      }
    };

    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 初始化拖拽排序
  useEffect(() => {
    if (shortcutsRef.current) {
      const sortable = Sortable.create(shortcutsRef.current, {
        animation: 150,
        ghostClass: styles.sortableGhost,
        chosenClass: styles.sortableChosen,
        dragClass: styles.sortableDrag,
        onEnd: (evt: any) => {
          // 更新快捷方式顺序
          const items = [...shortcuts];
          const movedItem = items.splice(evt.oldIndex, 1)[0];
          items.splice(evt.newIndex, 0, movedItem);
          setShortcuts(items);
          // 保存到本地存储
          localStorage.setItem('shortcuts', JSON.stringify(items));
        },
      });

      return () => {
        sortable.destroy();
      };
    }
  }, [shortcuts]);

  // 每当快捷方式变化时，保存到本地存储
  useEffect(() => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    window.open(`${currentEngine.url}${encodeURIComponent(value)}`, '_blank');
  };

  const searchEngineItems = {
    items: searchEngines.map((engine) => ({
      key: engine.name,
      label: (
        <div className={styles.engineOption}>
          <img src={engine.icon} alt={engine.name} />
          <span>{engine.name}</span>
        </div>
      ),
      onClick: () => setCurrentEngine(engine),
    })),
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, shortcut: ShortcutItem | null = null) => {
    if (shortcut) {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuVisible(true);
      setSelectedShortcut(shortcut);
    }
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  // 删除快捷方式
  const handleDeleteShortcut = () => {
    if (selectedShortcut) {
      const newShortcuts = shortcuts.filter((item) => item !== selectedShortcut);
      setShortcuts(newShortcuts);
      closeContextMenu();
    }
  };

  // 编辑快捷方式
  const handleEditShortcut = () => {
    // 这里可以添加编辑逻辑
    closeContextMenu();
  };

  const handleSwitchToFishMode = () => {
    window.location.href = '/index';
  };

  const handleAddCustomSite = (site: { title: string; url: string; icon: string }) => {
    const newSite = { ...site, type: 'website' as const };
    setShortcuts([...shortcuts, newSite]);
  };

  // 添加系统组件到快捷方式
  const handleAddSystemComponent = (component: ShortcutItem) => {
    // 先检查该组件是否已存在于快捷方式列表中
    if (!shortcuts.some((s) => s.title === component.title)) {
      // 直接使用传入的 component 对象的属性，因为 getSystemComponents 已经获取了正确的 icon 和 bgColor
      const newComponent = { ...component };

      // 添加到快捷方式列表
      setShortcuts([...shortcuts, newComponent]);
    }
    setComponentLibraryVisible(false);
  };

  // 渲染右键菜单
  const renderContextMenu = () => {
    if (!contextMenuVisible || !selectedShortcut) return null;

    const isWebsite = selectedShortcut.type === 'website';
    const isComponent = selectedShortcut.type === 'component';

    return (
      <div
        className={`${styles.contextMenu} absolute bg-white rounded-lg shadow-lg py-2 w-32 z-50`}
        style={{
          top: contextMenuPosition.y,
          left: contextMenuPosition.x,
        }}
        onClick={(e) => e.stopPropagation()} // 防止点击菜单关闭自身
      >
        {isWebsite && (
          <>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={handleEditShortcut}
            >
              <i className="fa-solid fa-edit mr-2"></i>编辑
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
              onClick={handleDeleteShortcut}
            >
              <i className="fa-solid fa-trash-alt mr-2"></i>删除
            </div>
          </>
        )}
        {isComponent && (
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-orange-500"
            onClick={handleDeleteShortcut} // 组件的"移除"也调用删除逻辑
          >
            <i className="fa-solid fa-minus-circle mr-2"></i>移除
          </div>
        )}
      </div>
    );
  };

  // 渲染组件库面板
  const renderComponentLibrary = () => {
    // 检查是否有可用组件
    const hasComponents =
      systemComponents.length > 0 ||
      (window.componentSystem &&
        window.componentSystem.components &&
        window.componentSystem.components.length > 0);

    // 如果没有systemComponents但有componentSystem.components，则创建临时组件列表
    let componentsToShow = systemComponents;
    if (systemComponents.length === 0 && window.componentSystem?.components?.length > 0) {
      componentsToShow = window.componentSystem.components.map((comp: any) => ({
        icon: comp.icon || comp.iconClass || 'fa-solid fa-puzzle-piece',
        bgColor: comp.bgColor || comp.backgroundColor || 'bg-blue-500',
        title: comp.name,
        url: '#',
        type: 'component' as const,
        component: comp.name,
      }));
    }

    return (
      <Modal
        title="组件库"
        open={componentLibraryVisible}
        onCancel={() => setComponentLibraryVisible(false)}
        footer={null}
        width={800}
      >
        {hasComponents ? (
          <div className={styles.componentGrid}>
            {componentsToShow.map((component, index) => {
              console.log('[renderComponentLibrary] 渲染组件:', component.title);
              const iconClass = component.icon;
              const bgColor = component.bgColor;

              return (
                <div
                  key={index}
                  className={styles.componentItem}
                  onClick={() => handleAddSystemComponent(component)}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}
                  >
                    <i className={`${iconClass} text-white text-xl`}></i>
                  </div>
                  <div>{component.title}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <i className="fa-solid fa-info-circle text-3xl"></i>
            </div>
            <h3 className="text-xl font-medium mb-2">暂无可用组件</h3>
            <p className="text-gray-500">
              系统正在加载组件或组件库为空。请稍后再试或检查组件系统配置。
            </p>
          </div>
        )}
      </Modal>
    );
  };

  // 快捷方式点击处理
  const handleShortcutClick = (shortcut: ShortcutItem) => {
    console.log('Clicked shortcut data:', shortcut);
    // 添加调试信息，检查图标和背景色
    if (shortcut.type === 'component') {
      console.log(`Component icon: ${shortcut.icon}, bgColor: ${shortcut.bgColor}`);
    }

    if (shortcut.type === 'website') {
      window.open(shortcut.url, '_blank');
    } else if (shortcut.type === 'component') {
      // 在这里调用组件桥接系统打开组件
      if (typeof window !== 'undefined') {
        console.log('尝试打开组件:', shortcut.component);

        // 首先尝试使用组件名称直接获取组件实例
        const componentInstance = window.componentSystem?.components.find(
          (comp: any) => comp.name === shortcut.title || comp.name === shortcut.component,
        );

        if (componentInstance && typeof componentInstance.handleClick === 'function') {
          // 直接调用组件的handleClick方法
          console.log('找到组件实例，直接调用handleClick方法');
          componentInstance.handleClick();
          return;
        }

        // 如果未找到组件实例或没有handleClick方法，尝试使用openComponent
        if (window.openComponent) {
          console.log('尝试使用openComponent打开:', shortcut.component);
          const success = window.openComponent(shortcut.component || shortcut.title);
          if (!success) {
            // 如果组件桥接系统不支持该组件，显示提示
            Modal.info({
              title: `组件 - ${shortcut.title}`,
              content: (
                <div>
                  <p>该组件暂未实现，敬请期待！</p>
                  <p>组件名称: {shortcut.component}</p>
                </div>
              ),
              width: 400,
            });
          }
        } else {
          // 兜底方案：展示一个提示框
          Modal.info({
            title: `组件 - ${shortcut.title}`,
            content: (
              <div>
                <p>组件加载失败，请刷新页面重试。</p>
                <p>组件名称: {shortcut.component || '未知组件'}</p>
              </div>
            ),
            width: 400,
          });
        }
      }
    }
  };

  return (
    <div
      className={styles.container}
      onClick={closeContextMenu}
      style={{
        backgroundImage: `url(${wallpaper})`,
      }}
    >
      <Button
        type="text"
        icon={<SwapOutlined />}
        onClick={handleSwitchToFishMode}
        className={styles.themeSwitch}
        style={{ color: '#ffffff', fontSize: '16px' }}
      >
        摸鱼模式
      </Button>

      <Tooltip title="打开组件库">
        <Button
          type="text"
          icon={<AppstoreOutlined />}
          onClick={() => setComponentLibraryVisible(true)}
          className={styles.componentLibraryBtn}
          style={{ color: '#ffffff', fontSize: '16px' }}
        >
          组件库
        </Button>
      </Tooltip>

      {/* @ts-ignore 临时忽略overlay被弃用的警告 */}
      <Dropdown
        overlay={<WallpaperMenu onWallpaperChange={setWallpaper} />}
        trigger={['contextMenu']}
      >
        <div className={styles.wallpaperOverlay}></div>
      </Dropdown>

      <div className={styles.weatherSection}>
        <div className={styles.weatherInfo}>
          <div className={styles.temperature}>{weather.temperature}</div>
          <div className={styles.weatherDetails}>
            <div>{weather.city}</div>
            <div>{weather.condition}</div>
          </div>
        </div>
      </div>

      <div className={styles.timeSection}>
        <div className={styles.time}>{time.format('HH:mm')}</div>
        <div className={styles.date}>{time.format('M月D日 dddd')}</div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Dropdown menu={searchEngineItems} trigger={['click']}>
            <div className={styles.engineSelector}>
              <img src={currentEngine.icon} alt={currentEngine.name} />
              <DownOutlined />
            </div>
          </Dropdown>
          <Input
            size="large"
            placeholder={`在 ${currentEngine.name} 中搜索`}
            prefix={<SearchOutlined />}
            className={styles.searchInput}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div ref={shortcutsRef} className={styles.shortcutsSection}>
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className={styles.shortcutWrapper}
            onContextMenu={(e) => handleContextMenu(e, shortcut)}
            onClick={() => handleShortcutClick(shortcut)}
          >
            <Shortcut {...shortcut} />
          </div>
        ))}
      </div>

      <div className={styles.countdownSection}>
        <div className={styles.countdownItem}>
          <div className={styles.countdownTitle}>距离周末</div>
          <div className={styles.countdownTime}>{5 - time.day()}天</div>
        </div>
      </div>

      <CustomSites
        visible={customSitesVisible}
        onClose={() => setCustomSitesVisible(false)}
        onAddSite={handleAddCustomSite}
        sites={customSites}
      />

      {renderContextMenu()}
      {renderComponentLibrary()}
    </div>
  );
};

export default Home;
