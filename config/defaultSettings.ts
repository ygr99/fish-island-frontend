import { ProLayoutProps } from '@ant-design/pro-components';

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
  title: '摸鱼岛🎣',
  logo: 'https://pic.rmb.bdstatic.com/bjh/news/c0afb3b38710698974ac970434e8eb71.png',
  pwa: true,
  // iconfontUrl: 'https://pic.rmb.bdstatic.com/bjh/news/c0afb3b38710698974ac970434e8eb71.png',
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
