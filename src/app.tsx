import Footer from '@/components/Footer';
import type {RunTimeLayoutConfig} from '@umijs/max';
import {history} from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import {AvatarDropdown} from './components/RightContent/AvatarDropdown';
import {requestConfig} from './requestConfig';
import {getLoginUserUsingGet} from "@/services/backend/userController";
import {useEffect, useState} from "react";
import AnnouncementModal from '@/components/AnnouncementModal';
import BossKeySettings from '@/components/BossKeySettings';
import SideAnnouncement from '@/components/SideAnnouncement';
import routes from '../config/routes';

const loginPath = '/user/login';

/**
 * 监听老板键（Ctrl + Shift + B）切换工作模式
 */
const useBossKey = () => {
  const [isBossMode, setIsBossMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    image: 'https://www.baidu.com/img/flexible/logo/pc/result.png',
    title: '工作页面',
    placeholder: '百度一下，你就知道'
  });

  useEffect(() => {
    // 加载保存的配置
    const savedConfig = localStorage.getItem('bossKeyConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'B') {
        setIsBossMode(prev => !prev); // 切换老板模式
      } else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        setShowSettings(true); // 打开设置
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return { isBossMode, showSettings, setShowSettings, config, setConfig };
};

// 检查当前路由是否需要登录验证
const checkNeedAuth = (pathname: string) => {
  const findRoute = (routes: any[], path: string): boolean => {
    for (const route of routes) {
      if (route.path === path) {
        return route.requireAuth !== false;
      }
      if (route.routes) {
        const found = findRoute(route.routes, path);
        if (found !== undefined) {
          return found;
        }
      }
    }
    return true; // 默认需要登录
  };
  return findRoute(routes, pathname);
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  const initialState: InitialState = {
    currentUser: undefined,
  };
  const {location} = history;

  // 检查当前路由是否需要登录验证
  if (checkNeedAuth(location.pathname)) {
    try {
      const res = await getLoginUserUsingGet();
      initialState.currentUser = res.data;
    } catch (error: any) {
      // 如果未登录且需要登录验证，跳转到登录页
      if (location.pathname !== loginPath) {
        history.push(loginPath);
      }
    }
  }
  return initialState;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({initialState}) => {
  const { isBossMode, showSettings, setShowSettings, config, setConfig } = useBossKey();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  if (isBossMode) {
    // @ts-ignore
    return {
      waterMarkProps: {content: config.title},
      footerRender: () => null,
      menuRender: false,
      rightContentRender: false,
      childrenRender: () => (
        <>
          {config.image ? (
            // 如果有自定义图片，显示全屏图片
            <div style={{
              width: '100vw',
              height: '100vh',
              overflow: 'hidden',
              position: 'fixed',
              top: 0,
              left: 0,
            }}>
              <img
                src={config.image}
                alt="cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ) : (
            // 如果没有自定义图片，显示默认的百度搜索界面
            <div style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ffffff'
            }}>
              <img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="logo"
                   style={{width: '270px', marginBottom: '20px'}}/>
              <div style={{
                width: '500px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: '24px',
                padding: '5px 10px',
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)'
              }}>
                <input type="text" placeholder="百度一下，你就知道"
                       style={{
                         flex: 1,
                         height: '40px',
                         border: 'none',
                         outline: 'none',
                         fontSize: '16px',
                         paddingLeft: '10px'
                       }}
                />
                <button type="button" style={{
                  backgroundColor: '#3385ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  width: '100px',
                  height: '36px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>搜索
                </button>
              </div>
            </div>
          )}
          <BossKeySettings
            visible={showSettings}
            onClose={() => setShowSettings(false)}
            onConfigUpdate={setConfig}
          />
        </>
      ),
    };
  }

  return {
    avatarProps: {
      render: () => {
        return <AvatarDropdown/>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: () => <Footer/>,
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...defaultSettings,
    childrenRender: (children) => {
      return (
        <>
          {children}
          <SideAnnouncement />
          <AnnouncementModal
            visible={showAnnouncement}
            onClose={() => setShowAnnouncement(false)}
            title="系统公告"
          />
        </>
      );
    },
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = requestConfig;
