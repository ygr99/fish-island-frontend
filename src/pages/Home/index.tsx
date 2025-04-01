import React, { useState, useEffect } from 'react';
import { Input, Dropdown, Button } from 'antd';
import { SearchOutlined, DownOutlined, SwapOutlined } from '@ant-design/icons';
import styles from './index.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Shortcut from '@/components/Shortcut';
import WallpaperMenu from '@/components/WallpaperMenu';

moment.locale('zh-cn');

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

const defaultShortcuts = [
  {
    icon: 'https://www.baidu.com/favicon.ico',
    title: '百度',
    url: 'https://www.baidu.com',
  },
  {
    icon: 'https://www.bilibili.com/favicon.ico',
    title: 'bilibili',
    url: 'https://www.bilibili.com',
  },
  {
    icon: 'https://www.zhihu.com/favicon.ico',
    title: '知乎',
    url: 'https://www.zhihu.com',
  },
  {
    icon: 'https://github.com/favicon.ico',
    title: 'GitHub',
    url: 'https://github.com',
  },
  {
    icon: 'https://www.taobao.com/favicon.ico',
    title: '淘宝',
    url: 'https://www.taobao.com',
  },
  {
    icon: 'https://www.jd.com/favicon.ico',
    title: '京东',
    url: 'https://www.jd.com',
  },
];

const Home: React.FC = () => {
  const [time, setTime] = useState(moment());
  const [weather, setWeather] = useState({
    temperature: '18°',
    condition: '晴',
    city: '香港',
  });
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [currentEngine, setCurrentEngine] = useState(searchEngines[0]);
  const [wallpaper, setWallpaper] = useState(() => {
    const savedWallpaper = localStorage.getItem('wallpaper');
    return savedWallpaper || '/img/defaultWallpaper.webp';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(moment());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleSwitchToFishMode = () => {
    window.location.href = '/index';
  };

  return (
    <div 
      className={styles.container} 
      onContextMenu={handleContextMenu}
      style={{ 
        backgroundImage: `url(${wallpaper})` 
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

      <div className={styles.shortcutsSection}>
        {shortcuts.map((shortcut, index) => (
          <Shortcut key={index} {...shortcut} />
        ))}
      </div>

      <div className={styles.countdownSection}>
        <div className={styles.countdownItem}>
          <div className={styles.countdownTitle}>距离周末</div>
          <div className={styles.countdownTime}>{5 - time.day()}天</div>
        </div>
      </div>
    </div>
  );
};

export default Home; 