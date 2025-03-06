import {
  updateMyUserUsingPost,
  userLoginUsingPost,
  userLogoutUsingPost,
  userRegisterUsingPost
} from '@/services/backend/userController';
import {LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined, EditOutlined} from '@ant-design/icons';
import {history, useModel} from '@umijs/max';
import {Avatar, Button, Form, FormProps, Input, message, Modal, Space, Tabs, TimePicker, Tooltip} from 'antd';
import type {MenuInfo} from 'rc-menu/lib/interface';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import {useEmotionCss} from "@ant-design/use-emotion-css";
import {Helmet} from "@@/exports";
import Settings from "../../../config/defaultSettings";
import {LoginForm, ProFormText} from "@ant-design/pro-components";
import Footer from "@/components/Footer";
import moment, {Moment} from "moment";
import './app.css';
import styles from "@/pages/User/Register/index.less";
import {Captcha} from "aj-captcha-react";
import {BACKEND_HOST_CODE} from "@/constants";

export type GlobalHeaderRightProps = {
  menu?: boolean;
};
type MoYuTimeType = {
  lunchTime?: Moment;
  goal?: string;
  startTime?: Moment;
  endTime?: Moment;
};


export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu}) => {
  const [moYuData, setMoYuData] = useState<MoYuTimeType>({
    goal: "365",
    startTime: moment('08:30', 'HH:mm'),
    endTime: moment('17:30', 'HH:mm'),
    lunchTime: moment('11:30', 'HH:mm'),
  });

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
  const onFinishMoYu: FormProps<MoYuTimeType>['onFinish'] = (values) => {
    setMoYuData(values);
  };

  const onFinishFailedMoYu: FormProps<MoYuTimeType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 登录
      const res = await userLoginUsingPost({
        ...values,
      });
      if (res.code === 0) {
        const defaultLoginSuccessMessage = '登录成功！';
        const result = res.data as any
        localStorage.setItem('tokenName', result.saTokenInfo?.tokenName as string);
        localStorage.setItem('tokenValue', result.saTokenInfo?.tokenValue as string);
        message.success(defaultLoginSuccessMessage);
        // 保存已登录用户信息
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        setInitialState({
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');
  const [earnedAmount, setEarnedAmount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoneyOpen, setIsMoneyOpen] = useState(false);
  const [valueData, setValueData] = useState<API.UserRegisterRequest>();
  const ref = useRef();

  const {initialState, setInitialState} = useModel('@@initialState');
  const click = () => {
    const current = ref.current as any;
    current.verify();
    console.log(current.verify());
  };
  const handleRegisterSubmit = async (values: API.UserRegisterRequest) => {
    const {userPassword, checkPassword} = values;
    // 校验
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      // 注册
      const data = await userRegisterUsingPost(values);
      if (data.code === 0) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);

        setType('account');
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm] = Form.useForm();

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
      key: 'edit',
      icon: <EditOutlined />,
      label: '修改信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

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
      if (key === 'edit') {
        setIsEditProfileOpen(true);
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const {currentUser} = initialState || {};

  // 计算倒计时和已赚取金额
  useEffect(() => {
    if (moYuData?.endTime && moYuData?.startTime) {
      const interval = setInterval(() => {
        // 计算倒计时
        const now = moment();
        const endTime = moment(moYuData.endTime);
        const duration = moment.duration(endTime.diff(now));
        setTimeRemaining(duration.hours() + ':' + String(duration.minutes()).padStart(2, '0') + ':' + String(duration.seconds()).padStart(2, '0'));

        // 计算每天工作时长
        const startTime = moment(moYuData.startTime);
        const endTimeForWork = moment(moYuData.endTime);
        const workDuration = moment.duration(endTimeForWork.diff(startTime));
        const workHoursPerDay = workDuration.asHours();  // 每天的工作时长

        // 计算已赚取金额
        const goalAmount = parseFloat(moYuData.goal ? moYuData.goal : '0'); // 每天的总目标工资
        const workedDuration = moment.duration(now.diff(startTime));
        const workedHours = workedDuration.asHours(); // 已经工作的小时数
        const earned = (goalAmount / workHoursPerDay) * workedHours; // 已赚取的金额
        setEarnedAmount(earned);
      }, 100); // 每秒更新一次d

      return () => clearInterval(interval);
    }
  }, [moYuData]);

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckinAnimating, setIsCheckinAnimating] = useState(false);

  // 签到动画的样式
  const checkinButtonStyle = useEmotionCss(() => ({
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '16px',
    background: hasCheckedIn 
      ? 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
      : 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
    boxShadow: hasCheckedIn 
      ? '0 2px 4px rgba(24, 144, 255, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: `1px solid ${hasCheckedIn ? '#1890ff' : '#e8e8e8'}`,
    '&:hover': {
      transform: 'scale(1.03)',
      background: hasCheckedIn 
        ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
        : 'linear-gradient(135deg, #f0f0f0 0%, #f5f5f5 100%)',
      boxShadow: hasCheckedIn 
        ? '0 3px 6px rgba(24, 144, 255, 0.3)'
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    '.checkin-emoji': {
      fontSize: '16px',
      marginRight: '4px',
      transition: 'all 0.5s ease',
      transform: isCheckinAnimating ? 'scale(1.2) rotate(360deg)' : 'scale(1)',
      display: 'inline-flex',
      alignItems: 'center',
      filter: hasCheckedIn ? 'brightness(1.1)' : 'none',
    },
    '.checkin-text': {
      fontSize: '13px',
      fontWeight: 500,
      color: hasCheckedIn ? '#ffffff' : '#595959',
      textShadow: hasCheckedIn ? '0 1px 1px rgba(0, 0, 0, 0.1)' : 'none',
    },
  }));

  // 处理签到
  const handleCheckin = () => {
    if (hasCheckedIn) {
      message.info('今天已经摸鱼打卡啦！明天继续加油 🐟');
      return;
    }
    
    setIsCheckinAnimating(true);
    setTimeout(() => {
      setHasCheckedIn(true);
      setIsCheckinAnimating(false);
      message.success('摸鱼打卡成功！获得 10 积分 🎣');
    }, 500);
  };

  // VIP 标识动画样式
  const vipBadgeStyle = useEmotionCss(() => ({
    position: 'absolute',
    top: -6,
    right: -8,
    fontSize: '12px',
    padding: '1px 4px',
    borderRadius: '4px',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)',
    color: '#873800',
    fontWeight: 'bold',
    lineHeight: 1,
    animation: 'vipFloat 3s ease-in-out infinite',
    zIndex: 1,
    transformOrigin: 'center bottom',
    boxShadow: '0 1px 2px rgba(255, 215, 0, 0.3)',
    '@keyframes vipFloat': {
      '0%, 100%': {
        transform: 'translateY(0)',
        filter: 'drop-shadow(0 1px 2px rgba(255, 215, 0, 0.4))',
      },
      '50%': {
        transform: 'translateY(-2px)',
        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6))',
      }
    },
    '&:hover': {
      animation: 'vipPop 0.3s ease-in-out forwards',
    },
    '@keyframes vipPop': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.1)',
      },
      '100%': {
        transform: 'scale(1.05)',
      }
    }
  }));

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
                  if (type === 'account') {
                    await handleSubmit(values as API.UserLoginRequest);
                  } else if (type === 'register') {
                    click();
                    setValueData(values);
                  }
                }}
              >
                <Tabs
                  activeKey={type}
                  onChange={setType}
                  centered
                  items={[
                    {
                      key: 'account',
                      label: '登录',
                    },
                    {
                      key: 'register',
                      label: '注册',
                    }
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
                {type === 'register' && (
                  <>
                    <ProFormText
                      name="userAccount"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined className={styles.prefixIcon}/>,
                      }}
                      placeholder="请输入账号"
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
                        prefix: <LockOutlined className={styles.prefixIcon}/>,
                      }}
                      placeholder="请输入密码"
                      rules={[
                        {
                          required: true,
                          message: '密码是必填项！',
                        },
                        {
                          min: 8,
                          type: 'string',
                          message: '长度不能小于 8',
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="checkPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined className={styles.prefixIcon}/>,
                      }}
                      placeholder="请再次输入密码"
                      rules={[
                        {
                          required: true,
                          message: '确认密码是必填项！',
                        },
                        {
                          min: 8,
                          type: 'string',
                          message: '长度不能小于 8',
                        },
                      ]}
                    />
                    <Captcha
                      onSuccess={async (data) => {
                        const value = valueData as any;
                        if (value) {
                          value.captchaVerification = data.captchaVerification;
                          await handleRegisterSubmit(value);
                        }
                      }}
                      path={BACKEND_HOST_CODE}
                      type="auto"
                      ref={ref}
                    ></Captcha>
                  </>
                )}
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
          <Modal title="下班倒计时设定" footer={null} open={isMoneyOpen} onCancel={() => {
            setIsMoneyOpen(false);
          }}>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
              <Form
                name="basic"
                initialValues={{remember: true}}
                onFinish={onFinishMoYu}
                onFinishFailed={onFinishFailedMoYu}
                autoComplete="off"
              >
                <Form.Item label="上班时间" name="startTime" initialValue={moment('08:30', 'HH:mm')}>
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="下班时间" name="endTime" initialValue={moment('17:30', 'HH:mm')}>
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="午饭时间" name="lunchTime" initialValue={moment('11:30', 'HH:mm')}>
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="你的目标" name="goal" initialValue={365}>
                  <Input placeholder="（设置0则不显示）"/>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={() => {
                    setIsMoneyOpen(false)
                  }}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            </div>


          </Modal>
          <Button
            type="primary"
            shape="circle"
            onClick={() => {
              setIsMoneyOpen(true);
            }}
            className="money-button"
          >
            <div className="money-button-content">
              <div>🧑‍💻💭</div>
              <div>⏱️️：{timeRemaining}</div>
              <div>💰：{earnedAmount.toFixed(3)}</div>
            </div>
          </Button>
        </div>
      </>

    )
      ;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        <Space>
          <div style={{ position: 'relative' }}>
            <span className={vipBadgeStyle}>VIP</span>
            {currentUser?.userAvatar ? (
              <Avatar size="default" src={currentUser?.userAvatar}/>
            ) : (
              <Avatar size="default" icon={<UserOutlined/>}/>
            )}
          </div>
          <span className="anticon">{currentUser?.userName ?? '无名'}</span>
        </Space>
      </HeaderDropdown>
      <Tooltip title={hasCheckedIn ? '今日已完成摸鱼打卡' : '点击摸鱼打卡'}>
        <div 
          className={checkinButtonStyle} 
          onClick={(e) => {
            e.stopPropagation();
            handleCheckin();
          }}
          style={{ marginLeft: 24 }}
        >
          <span className="checkin-emoji">
            {hasCheckedIn ? '🐟' : '🎣'}
          </span>
          <span className="checkin-text">
            {hasCheckedIn ? '已打卡' : '摸鱼'}
          </span>
        </div>
      </Tooltip>
      <div className="App" style={{ marginLeft: 'auto' }}>
        {/* 其他内容 */}
        <Modal title="下班倒计时设定" footer={null} open={isMoneyOpen} onCancel={() => {
          setIsMoneyOpen(false);
        }}>
          <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <Form
              name="basic"
              initialValues={{remember: true}}
              onFinish={onFinishMoYu}
              onFinishFailed={onFinishFailedMoYu}
              autoComplete="off"
            >
              <Form.Item label="上班时间" name="startTime" initialValue={moment('08:30', 'HH:mm')}>
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="下班时间" name="endTime" initialValue={moment('17:30', 'HH:mm')}>
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="午饭时间" name="lunchTime" initialValue={moment('11:30', 'HH:mm')}>
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="你的目标" name="goal" initialValue={365}>
                <Input placeholder="（设置0则不显示）"/>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" onClick={() => {
                  setIsMoneyOpen(false)
                }}>
                  保存
                </Button>
              </Form.Item>
            </Form>
          </div>


        </Modal>
        <Button
          type="primary"
          shape="circle"
          onClick={() => {
            setIsMoneyOpen(true);
          }}
          className="money-button"
        >
          <div className="money-button-content">
            <div>🧑‍💻💭</div>
            <div>⏱️️：{timeRemaining}</div>
            <div>💰：{earnedAmount.toFixed(3)}</div>
          </div>
        </Button>
      </div>
    </div>
  )
};

export const AvatarName = () => {
};
