import CustomSites from '@/components/CustomSites';
import Shortcut from '@/components/Shortcut';
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
import './components/index.js';
// 导入组件桥接系统
// @ts-ignore
import './components/bridge.js';

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
      register: (componentClass: any) => void;
    };
    openComponent: (componentName: string) => boolean;
    [key: string]: any; // 允许使用索引访问其他属性
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
  if (typeof window !== 'undefined' && window.componentSystem) {
    const componentMapping = window.componentSystem.componentNameMapping || {};
    const components = window.componentSystem.components || [];

    console.log('组件系统数据:', {
      componentMappingSize: Object.keys(componentMapping).length,
      componentsSize: components.length,
      components: components.map((c) => ({ name: c.name, icon: c.icon, bgColor: c.bgColor })),
    });

    return Object.entries(componentMapping).map(([name, info]: [string, any]) => {
      // 查找对应的组件实例，获取它的icon和bgColor
      const componentInstance = components.find((comp) => comp.name === name);

      console.log(
        `组件 [${name}] 实例:`,
        componentInstance?.name,
        '图标:',
        componentInstance?.icon,
        '背景色:',
        componentInstance?.bgColor,
      );

      return {
        icon: componentInstance?.icon || `fa-puzzle-piece`,
        title: name,
        url: '#',
        type: 'component' as const,
        component: info.directory,
        bgColor: componentInstance?.bgColor || 'bg-blue-500',
      };
    });
  }
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
      console.log('加载系统组件数据');

      // 需要先主动加载和注册组件
      if (typeof window !== 'undefined' && window.componentSystem) {
        // 获取所有组件名称
        const componentMapping = window.componentSystem.componentNameMapping || {};
        const componentNames = Object.keys(componentMapping);

        // 先检查components数组是否为空
        if (window.componentSystem.components.length === 0) {
          console.log('组件数组为空，尝试主动注册组件...');

          // 主动加载组件脚本
          const loadComponentScript = (name: string) => {
            return new Promise<boolean>((resolve) => {
              const info = componentMapping[name];
              if (!info) {
                console.log(`组件 ${name} 没有映射信息`);
                resolve(false);
                return;
              }

              // 如果全局变量已存在，直接注册
              if (info.globalVar && typeof window[info.globalVar] === 'function') {
                console.log(`组件 ${name} 已加载，直接注册`);
                window.componentSystem.register(window[info.globalVar]);
                resolve(true);
                return;
              }

              // 否则加载脚本
              const script = document.createElement('script');
              script.src = `/components/${info.directory}/index.js`;
              script.onload = () => {
                console.log(`组件 ${name} 脚本加载成功`);
                if (info.globalVar && typeof window[info.globalVar] === 'function') {
                  console.log(`注册组件 ${name}`);
                  window.componentSystem.register(window[info.globalVar]);
                  resolve(true);
                } else {
                  console.log(`组件 ${name} 全局变量未找到`);
                  resolve(false);
                }
              };
              script.onerror = () => {
                console.error(`加载组件 ${name} 脚本失败`);
                resolve(false);
              };
              document.head.appendChild(script);
            });
          };

          // 串行加载组件以确保稳定性
          const loadAllComponents = async () => {
            console.log('开始加载所有组件...');
            for (const name of componentNames) {
              await loadComponentScript(name);
            }
            console.log('所有组件加载完成，更新组件列表');
            setSystemComponents(getSystemComponents());
          };

          loadAllComponents();
          return; // 避免重复调用 setSystemComponents
        }
      }

      // 如果组件已加载，直接获取组件数据
      setSystemComponents(getSystemComponents());
    };

    // 如果已经在浏览器环境中且组件系统已加载，立即获取组件
    if (typeof window !== 'undefined' && window.componentSystem) {
      loadSystemComponents();

      // 监听组件渲染完成事件
      const handleComponentsRendered = () => {
        console.log('组件渲染完成，重新获取组件数据');
        setTimeout(loadSystemComponents, 100); // 延迟100ms确保组件完全加载
      };

      document.addEventListener('componentsRendered', handleComponentsRendered);

      return () => {
        document.removeEventListener('componentsRendered', handleComponentsRendered);
      };
    } else {
      // 否则等待组件系统加载完成
      window.addEventListener('DOMContentLoaded', loadSystemComponents);
      return () => {
        window.removeEventListener('DOMContentLoaded', loadSystemComponents);
      };
    }
  }, []);

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
    if (!shortcuts.some((s) => s.title === component.title)) {
      setShortcuts([...shortcuts, component]);
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
    return (
      <Modal
        title="组件库"
        open={componentLibraryVisible}
        onCancel={() => setComponentLibraryVisible(false)}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setComponentLibraryVisible(false)}>关闭</Button>
          </div>
        }
        width={800}
      >
        <div className={styles.componentGrid}>
          {systemComponents.length > 0 ? (
            systemComponents.map((component, index) => {
              // 判断是否为URL图标
              const isUrlIcon = component.icon.startsWith('http') || component.icon.startsWith('/');

              return (
                <div
                  key={index}
                  className={styles.componentItem}
                  onClick={() => handleAddSystemComponent(component)}
                >
                  {isUrlIcon ? (
                    <img src={component.icon} alt={component.title} />
                  ) : (
                    <div
                      className={`flex items-center justify-center ${component.bgColor} rounded-md w-12 h-12`}
                    >
                      <i className={`${component.icon} text-white text-xl`}></i>
                    </div>
                  )}
                  <div>{component.title}</div>
                </div>
              );
            })
          ) : (
            <div className="w-full py-8 text-center text-gray-500">
              暂无组件数据，请点击"刷新组件库"按钮重试
            </div>
          )}
        </div>
      </Modal>
    );
  };

  // 快捷方式点击处理
  const handleShortcutClick = (shortcut: ShortcutItem) => {
    console.log('Clicked shortcut data:', shortcut);

    if (shortcut.type === 'website') {
      window.open(shortcut.url, '_blank');
    } else if (shortcut.type === 'component') {
      // 在这里调用组件桥接系统打开组件
      if (shortcut.component && typeof window !== 'undefined' && window.openComponent) {
        const success = window.openComponent(shortcut.component);
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
