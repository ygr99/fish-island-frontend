import Footer from '@/components/Footer';
import type {RunTimeLayoutConfig} from '@umijs/max';
import {history} from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import {AvatarDropdown} from './components/RightContent/AvatarDropdown';
import {requestConfig} from './requestConfig';
import {getLoginUserUsingGet} from "@/services/backend/userController";
import {useEffect, useState} from "react";
import AnnouncementModal from '@/components/AnnouncementModal';
import routes from '../config/routes';

const loginPath = '/user/login';

/**
 * 监听老板键（Ctrl + Shift + B）切换工作模式
 */
const useBossKey = () => {
  const [isBossMode, setIsBossMode] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'B') {
        setIsBossMode(prev => !prev); // 切换老板模式
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return isBossMode;
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

  const isBossMode = useBossKey(); // 监听老板键
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  if (isBossMode) {
    // @ts-ignore
    return {
      waterMarkProps: {content: '工作页面'},
      footerRender: () => <Footer/>,
      menuRender: false, // 隐藏左侧菜单
      rightContentRender: false, // 隐藏右上角菜单
      childrenRender: () => (
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          {/* 百度 Logo */}
          <img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="百度"
               style={{width: '270px', marginBottom: '20px'}}/>

          {/* 搜索框 */}
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
            }}>百度一下
            </button>
          </div>

        </div>
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
