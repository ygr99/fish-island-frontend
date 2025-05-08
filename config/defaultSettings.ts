import { ProLayoutProps } from '@ant-design/pro-components';

// 从 localStorage 获取用户设置的标题
const savedSiteConfig = typeof window !== 'undefined' ? localStorage.getItem('siteConfig') : null;
const userSiteName = savedSiteConfig ? JSON.parse(savedSiteConfig).siteName : null;

/**
 * 默认设置
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#FFA768',
  layout: 'side',
  // splitMenus: true, // 将一级菜单拆分到顶部
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: userSiteName || '摸鱼岛🎣',
  logo: 'https://api.oss.cqbo.com/moyu/ChatGPT%20Image%202025%E5%B9%B45%E6%9C%888%E6%97%A5%2015_09_08%20(1).png',
  pwa: true,
  // iconfontUrl: 'https://api.oss.cqbo.com/moyu/ChatGPT%20Image%202025%E5%B9%B45%E6%9C%888%E6%97%A5%2015_09_08%20(1).png',
  token: {
    header: {
      heightLayoutHeader: 78,
      colorTextMenuSelected: '#FFA768',

    },
    sider: {
      colorTextMenuSelected: '#FFA768',
    },
  },
};

export default Settings;
