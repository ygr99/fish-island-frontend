import {userLoginUsingPost, userLogoutUsingPost} from '@/services/backend/userController';
import {LockOutlined, LogoutOutlined, PlusOutlined, SettingOutlined, UserOutlined} from '@ant-design/icons';
import {history, useModel} from '@umijs/max';
import {Avatar, Button, Card, message, Modal, Space, Tabs} from 'antd';
import type {MenuInfo} from 'rc-menu/lib/interface';
import React, {useCallback, useState} from 'react';
import {flushSync} from 'react-dom';
import {Link} from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import {useEmotionCss} from "@ant-design/use-emotion-css";
import {Helmet} from "@@/exports";
import Settings from "../../../config/defaultSettings";
import {LoginForm, ProFormText} from "@ant-design/pro-components";
import Footer from "@/components/Footer";

export type GlobalHeaderRightProps = {
  menu?: boolean;
};


export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu}) => {

  const [type, setType] = useState<string>('account');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 登录
      const res = await userLoginUsingPost({
        ...values,
      });
      if (res.code === 0) {
        const defaultLoginSuccessMessage = '登录成功！';
        localStorage.setItem('tokenName', res.data?.saTokenInfo?.tokenName as string);
        localStorage.setItem('tokenValue', res.data?.saTokenInfo?.tokenValue as string);
        message.success(defaultLoginSuccessMessage);
        // 保存已登录用户信息
        setInitialState({
          ...initialState,
          currentUser: res.data,
        });
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = `登录失败，${error.message}`;
      message.error(defaultLoginFailureMessage);
    }
  };
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await userLogoutUsingPost();
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {initialState, setInitialState} = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const {key} = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({...s, currentUser: undefined}));
        });
        loginOut();
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const {currentUser} = initialState || {};

  if (!currentUser) {
    return (
      <>
        <Modal footer={null} open={isModalOpen} onCancel={() => {
          setIsModalOpen(false);
        }}>
          <div className={containerClassName}>
            <Helmet>
              <title>
                {'登录'}- {Settings.title}
              </title>
            </Helmet>
            <div
              style={{
                flex: '1',
                padding: '32px 0',
              }}
            >
              <LoginForm
                contentStyle={{
                  minWidth: 280,
                  maxWidth: '75vw',
                }}
                logo={<img alt="logo" style={{height: '100%'}}
                           src="https://pic.rmb.bdstatic.com/bjh/news/c0afb3b38710698974ac970434e8eb71.png"/>}
                title="摸鱼岛🎣"
                subTitle={'加入摸鱼岛一起来摸吧'}
                initialValues={{
                  autoLogin: true,
                }}
                onFinish={async (values) => {
                  await handleSubmit(values as API.UserLoginRequest);
                }}
              >
                <Tabs
                  activeKey={type}
                  onChange={setType}
                  centered
                  items={[
                    {
                      key: 'account',
                      label: '账户密码登录',
                    },
                  ]}
                />
                {type === 'account' && (
                  <>
                    <ProFormText
                      name="userAccount"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined/>,
                      }}
                      placeholder={'请输入账号'}
                      rules={[
                        {
                          required: true,
                          message: '账号是必填项！',
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="userPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined/>,
                      }}
                      placeholder={'请输入密码'}
                      rules={[
                        {
                          required: true,
                          message: '密码是必填项！',
                        },
                      ]}
                    />
                  </>
                )}

                <div
                  style={{
                    marginBottom: 24,
                    textAlign: 'right',
                  }}
                >
                  <Link to="/user/register">新用户注册</Link>
                </div>
              </LoginForm>
            </div>
            <Footer/>
          </div>
        </Modal>
        <Button type="primary" shape="round" onClick={() => {
          setIsModalOpen(true);
        }}>
          登录
        </Button>
        <div className="App">
          {/* 其他内容 */}

          <Button
            type="primary"
            shape="circle"
            style={{
              width: "120px",
              height: "120px",
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 999,
              backgroundColor: "white",  // 设置背景色为白色
              color: "black",  // 设置文本颜色为黑色
              border: "1px solid #d9d9d9"  // 设置边框为浅灰色（可以根据需求调整）
            }}
          >赚到💰：xxxxx</Button>
        </div>
      </>

    )
      ;
  }

  const menuItems = [
    ...(menu
      ? [
        {
          key: 'center',
          icon: <UserOutlined/>,
          label: '个人中心',
        },
        {
          key: 'settings',
          icon: <SettingOutlined/>,
          label: '个人设置',
        },
        {
          type: 'divider' as const,
        },
      ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      <Space>
        {currentUser?.userAvatar ? (
          <Avatar size="default" src={currentUser?.userAvatar}/>
        ) : (
          <Avatar size="default" icon={<UserOutlined/>}/>
        )}
        <span className="anticon">{currentUser?.userName ?? '无名'}</span>
      </Space>
    </HeaderDropdown>
  );
};

export const AvatarName = () => {
};
