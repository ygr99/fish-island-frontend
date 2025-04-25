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

moment.locale('zh-cn');

interface ShortcutItem {
  icon: string;
  title: string;
  url: string;
  type: 'website' | 'component';
  component?: string;
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
  },
  {
    icon: 'https://www.bilibili.com/favicon.ico',
    title: 'bilibili',
    url: 'https://www.bilibili.com',
    type: 'website',
  },
  {
    icon: 'https://www.zhihu.com/favicon.ico',
    title: '知乎',
    url: 'https://www.zhihu.com',
    type: 'website',
  },
  {
    icon: 'https://images.seeklogo.com/logo-png/30/2/github-logo-png_seeklogo-304612.png',
    title: 'GitHub',
    url: 'https://github.com',
    type: 'website',
  },
  {
    icon: 'https://www.taobao.com/favicon.ico',
    title: '淘宝',
    url: 'https://www.taobao.com',
    type: 'website',
  },
  {
    icon: 'https://www.jd.com/favicon.ico',
    title: '京东',
    url: 'https://www.jd.com',
    type: 'website',
  },
];

// 系统提供的组件
const systemComponents: ShortcutItem[] = [
  {
    icon: 'https://cdn.jsdelivr.net/gh/kxzbw/cdn/img/components/RandomGirl.png',
    title: '随机小姐姐',
    url: '#',
    type: 'component',
    component: 'RandomGirl',
  },
];

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
    if (!contextMenuVisible) return null;

    return (
      <div
        className={styles.contextMenu}
        style={{
          top: contextMenuPosition.y,
          left: contextMenuPosition.x,
        }}
      >
        <div className={styles.menuItem} onClick={handleEditShortcut}>
          编辑
        </div>
        <div className={styles.menuItem} onClick={handleDeleteShortcut}>
          删除
        </div>
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
        footer={null}
        width={800}
      >
        <div className={styles.componentGrid}>
          {systemComponents.map((component, index) => (
            <div
              key={index}
              className={styles.componentItem}
              onClick={() => handleAddSystemComponent(component)}
            >
              <img src={component.icon} alt={component.title} />
              <div>{component.title}</div>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  // 快捷方式点击处理
  const handleShortcutClick = (shortcut: ShortcutItem) => {
    if (shortcut.type === 'website') {
      window.open(shortcut.url, '_blank');
    } else if (shortcut.type === 'component') {
      // 在这里处理组件打开逻辑
      console.log(`打开组件: ${shortcut.component}`);
      // 这里可以实现组件的打开逻辑
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
