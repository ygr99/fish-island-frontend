import {
  updateMyUserUsingPost,
  userLoginUsingPost,
  userLogoutUsingPost,
  userRegisterUsingPost
} from '@/services/backend/userController';
import {LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined, EditOutlined} from '@ant-design/icons';
import {history, useModel} from '@umijs/max';
import {Avatar, Button, Form, FormProps, Input, message, Modal, Space, Tabs, TimePicker, Tooltip, Select} from 'antd';
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
  startTime?: Moment;
  endTime?: Moment;
  lunchTime?: Moment;
  monthlySalary?: number;
};

type Holiday = {
  name: string;
  date: Moment;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu}) => {
  const [moYuData, setMoYuData] = useState<MoYuTimeType>({
    startTime: moment('08:30', 'HH:mm'),
    endTime: moment('17:30', 'HH:mm'),
    lunchTime: moment('12:00', 'HH:mm'),
  });

  // 从 localStorage 读取数据
  useEffect(() => {
    const savedData = localStorage.getItem('moYuData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setMoYuData({
        startTime: moment(parsedData.startTime),
        endTime: moment(parsedData.endTime),
        lunchTime: moment(parsedData.lunchTime),
        monthlySalary: parsedData.monthlySalary,
      });
    }
  }, []);

  const [timeInfo, setTimeInfo] = useState<{
    type: 'work' | 'lunch' | 'holiday';
    name?: string;
    timeRemaining: string;
    earnedAmount?: number;
  }>({ type: 'work', timeRemaining: '00:00:00' });

  const holidays: Holiday[] = [
    { name: '端午节', date: moment('2024-06-10') },
    { name: '中秋节', date: moment('2024-09-17') },
    { name: '国庆节', date: moment('2024-10-01') },
  ];

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
    // 将 Moment 对象转换为 ISO 字符串格式后存储
    const dataToSave = {
      startTime: values.startTime?.format(),
      endTime: values.endTime?.format(),
      lunchTime: values.lunchTime?.format(),
      monthlySalary: values.monthlySalary,
    };
    localStorage.setItem('moYuData', JSON.stringify(dataToSave));
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
  const {currentUser}: any = initialState || {};

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
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [previewAvatar, setPreviewAvatar] = useState<string>('');

  // 默认头像列表
  const defaultAvatars = [
    'https://img2.baidu.com/it/u=3757990320,1019789652&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800',
    'https://img0.baidu.com/it/u=2218138162,227420128&fm=253&fmt=auto&app=138&f=JPEG?w=607&h=607',
    'https://img2.baidu.com/it/u=2695396371,803611298&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800',
    'https://img1.baidu.com/it/u=648366534,1664954226&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800',
    'https://img0.baidu.com/it/u=925856458,2747676088&fm=253&fmt=auto?w=800&h=800',
  ];

  const handleEditProfile = async (values: any) => {
    try {
      // 如果选择了默认头像，使用选中的头像
      const userAvatar = selectedAvatar || values.userAvatar;
      const res = await updateMyUserUsingPost({
        ...values,
        userAvatar,
      });
      if (res.code === 0) {
        message.success('修改信息成功！');
        setIsEditProfileOpen(false);
        // 更新当前用户信息
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        setInitialState((s) => ({...s, currentUser: {...currentUser, ...values, userAvatar}}));
      }
    } catch (error: any) {
      message.error(`修改失败，${error.message}`);
    }
  };

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
      icon: <EditOutlined/>,
      label: '修改信息',
    },
    {
      key: 'bossKey',
      icon: <LockOutlined/>,
      label: '老板键设置',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

  // @ts-ignore
  // @ts-ignore
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
        // 设置初始头像预览
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (currentUser?.userAvatar && !defaultAvatars.includes(currentUser.userAvatar)) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          setPreviewAvatar(currentUser.userAvatar);
        }
        return;
      }
      if (key === 'bossKey') {
        setIsBossKeyOpen(true);
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState, currentUser?.userAvatar],
  );


  // 计算倒计时和已赚取金额
  useEffect(() => {
    if (moYuData?.endTime && moYuData?.startTime) {
      const interval = setInterval(() => {
        const now = moment();

        // 查找最近的节假日
        const upcomingHoliday = holidays
          .filter(h => h.date.isAfter(now))
          .sort((a, b) => a.date.diff(now) - b.date.diff(now))[0];

        // 检查是否接近午餐时间（前后120分钟内）
        const lunchTime = moment(moYuData.lunchTime);
        const isNearLunch = Math.abs(now.diff(lunchTime, 'minutes')) <= 120;

        // 计算工作日每小时收入
        const workdaysInMonth = 22; // 假设每月22个工作日
        const workHoursPerDay = moment(moYuData.endTime).diff(moment(moYuData.startTime), 'hours');
        const hourlyRate = moYuData.monthlySalary ? (moYuData.monthlySalary / (workdaysInMonth * workHoursPerDay)) : 0;

        // 计算已工作时长和收入
        const startTime = moment(moYuData.startTime);
        const workedDuration = moment.duration(now.diff(startTime));
        const earnedAmount = hourlyRate * workedDuration.asHours();

        if (isNearLunch) {
          // 午餐倒计时
          const duration = moment.duration(lunchTime.diff(now));
          const hours = Math.max(0, duration.hours());
          const minutes = Math.max(0, duration.minutes());
          const seconds = Math.max(0, duration.seconds());

          // 如果所有时间都是0或负数，显示"已到午餐时间"
          if (hours <= 0 && minutes <= 0 && seconds <= 0) {
            setTimeInfo({
              type: 'lunch',
              timeRemaining: '已到午餐时间',
              earnedAmount: moYuData.monthlySalary ? earnedAmount : undefined
            });
          } else {
            setTimeInfo({
              type: 'lunch',
              timeRemaining: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
              earnedAmount: moYuData.monthlySalary ? earnedAmount : undefined
            });
          }
        } else if (upcomingHoliday) {
          // 节假日倒计时
          const duration = moment.duration(upcomingHoliday.date.diff(now));
          setTimeInfo({
            type: 'holiday',
            name: upcomingHoliday.name,
            timeRemaining: `${duration.days()}天${duration.hours()}时${duration.minutes()}分`,
            earnedAmount: moYuData.monthlySalary ? earnedAmount : undefined
          });
        } else {
          // 下班倒计时
          const endTime = moment(moYuData.endTime);
          const duration = moment.duration(endTime.diff(now));
          const hours = Math.max(0, duration.hours());
          const minutes = Math.max(0, duration.minutes());
          const seconds = Math.max(0, duration.seconds());

          // 如果所有时间都是0或负数，显示"已到下班时间"
          if (hours <= 0 && minutes <= 0 && seconds <= 0) {
            setTimeInfo({
              type: 'work',
              timeRemaining: '已到下班时间',
              earnedAmount: moYuData.monthlySalary ? earnedAmount : undefined
            });
          } else {
            setTimeInfo({
              type: 'work',
              timeRemaining: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
              earnedAmount: moYuData.monthlySalary ? earnedAmount : undefined
            });
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [moYuData, holidays]);

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

  const [isBossKeyOpen, setIsBossKeyOpen] = useState(false);
  const [bossKeyConfig, setBossKeyConfig] = useState(() => {
    const savedConfig = localStorage.getItem('bossKeyConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      key: 'Escape',
      redirectUrl: 'https://www.deepseek.com/'
    };
  });

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === bossKeyConfig.key) {
        window.location.href = bossKeyConfig.redirectUrl;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [bossKeyConfig]);

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
          <Modal title="工作时间设定" footer={null} open={isMoneyOpen} onCancel={() => {
            setIsMoneyOpen(false);
          }}>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
              <Form
                name="basic"
                initialValues={{
                  startTime: moYuData.startTime,
                  endTime: moYuData.endTime,
                  lunchTime: moYuData.lunchTime,
                  monthlySalary: moYuData.monthlySalary,
                }}
                onFinish={onFinishMoYu}
                onFinishFailed={onFinishFailedMoYu}
                autoComplete="off"
              >
                <Form.Item label="上班时间" name="startTime">
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="下班时间" name="endTime">
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="午饭时间" name="lunchTime">
                  <TimePicker format="HH:mm"/>
                </Form.Item>

                <Form.Item label="月薪" name="monthlySalary">
                  <Input placeholder="选填，不填则不显示收入" type="number"/>
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
              <div>
                {timeInfo.type === 'lunch' ? '🍱' : timeInfo.type === 'holiday' ? '🎉' : '🧑‍💻'}
              </div>
              <div>
                {timeInfo.type === 'holiday' ?
                  `${timeInfo.name}: ${timeInfo.timeRemaining}` :
                  timeInfo.type === 'lunch' ?
                    `午餐: ${timeInfo.timeRemaining}` :
                    `下班: ${timeInfo.timeRemaining}`
                }
              </div>
              {timeInfo.earnedAmount !== undefined && (
                <div>💰：{timeInfo.earnedAmount.toFixed(2)}</div>
              )}
            </div>
          </Button>
        </div>
      </>

    )
      ;
  }

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        <Space>
          <div style={{position: 'relative'}}>
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

      {/* 添加修改信息的 Modal */}
      <Modal
        title="修改个人信息"
        open={isEditProfileOpen}
        onCancel={() => {
          setIsEditProfileOpen(false);
          setPreviewAvatar('');
          setSelectedAvatar('');
          // 重置表单
          editProfileForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editProfileForm}
          onFinish={handleEditProfile}
          initialValues={{
            userName: currentUser?.userName,
            userProfile: currentUser?.userProfile,
            userAvatar: !defaultAvatars.includes(currentUser?.userAvatar || '') ? currentUser?.userAvatar : '',
          }}
        >
          <Form.Item
            name="userName"
            label="用户名"
            rules={[{required: true, message: '请输入用户名！'}]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="头像选择"
            name="userAvatar"
            help="可以输入在线图片地址，或者选择下方默认头像"
          >
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
              <Input
                placeholder="请输入头像地址（选填）"
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedAvatar('');
                  setPreviewAvatar(value);
                  editProfileForm.setFieldValue('userAvatar', value);
                }}
                value={editProfileForm.getFieldValue('userAvatar')}
                style={{flex: 1}}
              />
              {(previewAvatar || editProfileForm.getFieldValue('userAvatar')) && (
                <div style={{
                  marginLeft: '8px',
                  padding: '4px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}>
                  <Avatar
                    src={previewAvatar || editProfileForm.getFieldValue('userAvatar')}
                    size={64}
                    onError={() => {
                      message.error('图片加载失败，请检查地址是否正确');
                      return false;
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item label="默认头像">
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              {defaultAvatars.map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setPreviewAvatar('');
                    editProfileForm.setFieldValue('userAvatar', '');
                  }}
                  style={{
                    cursor: 'pointer',
                    border: (selectedAvatar === avatar || currentUser?.userAvatar === avatar) ? '2px solid #1890ff' : '2px solid transparent',
                    borderRadius: '4px',
                    padding: '4px',
                  }}
                >
                  <Avatar src={avatar} size={64}/>
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="userProfile"
            label="个人简介"
          >
            <Input.TextArea rows={4}/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Tooltip title={hasCheckedIn ? '今日已完成摸鱼打卡' : '点击摸鱼打卡'}>
        <div
          className={checkinButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            handleCheckin();
          }}
          style={{marginLeft: 24}}
        >
          <span className="checkin-emoji">
            {hasCheckedIn ? '🐟' : '🎣'}
          </span>
          <span className="checkin-text">
            {hasCheckedIn ? '已打卡' : '摸鱼'}
          </span>
        </div>
      </Tooltip>
      <div className="App" style={{marginLeft: 'auto'}}>
        {/* 其他内容 */}
        <Modal title="工作时间设定" footer={null} open={isMoneyOpen} onCancel={() => {
          setIsMoneyOpen(false);
        }}>
          <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <Form
              name="basic"
              initialValues={{
                startTime: moYuData.startTime,
                endTime: moYuData.endTime,
                lunchTime: moYuData.lunchTime,
                monthlySalary: moYuData.monthlySalary,
              }}
              onFinish={onFinishMoYu}
              onFinishFailed={onFinishFailedMoYu}
              autoComplete="off"
            >
              <Form.Item label="上班时间" name="startTime">
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="下班时间" name="endTime">
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="午饭时间" name="lunchTime">
                <TimePicker format="HH:mm"/>
              </Form.Item>

              <Form.Item label="月薪" name="monthlySalary">
                <Input placeholder="选填，不填则不显示收入" type="number"/>
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
            <div>
              {timeInfo.type === 'lunch' ? '🍱' : timeInfo.type === 'holiday' ? '🎉' : '🧑‍💻'}
            </div>
            <div>
              {timeInfo.type === 'holiday' ?
                `${timeInfo.name}: ${timeInfo.timeRemaining}` :
                timeInfo.type === 'lunch' ?
                  `午餐: ${timeInfo.timeRemaining}` :
                  `下班: ${timeInfo.timeRemaining}`
              }
            </div>
            {timeInfo.earnedAmount !== undefined && (
              <div>💰：{timeInfo.earnedAmount.toFixed(2)}</div>
            )}
          </div>
        </Button>
      </div>

      {/* 添加老板键设置Modal */}
      <Modal
        title="老板键设置"
        open={isBossKeyOpen}
        onCancel={() => setIsBossKeyOpen(false)}
        footer={null}
      >
        <Form
          initialValues={bossKeyConfig}
          onFinish={(values) => {
            setBossKeyConfig(values);
            localStorage.setItem('bossKeyConfig', JSON.stringify(values));
            message.success('老板键设置已保存');
            setIsBossKeyOpen(false);
          }}
        >
          <Form.Item
            label="触发按键"
            name="key"
            rules={[{ required: true, message: '请设置触发按键！' }]}
          >
            <Select>
              <Select.Option value="Escape">ESC键</Select.Option>
              <Select.Option value="F1">F1键</Select.Option>
              <Select.Option value="F2">F2键</Select.Option>
              <Select.Option value="F3">F3键</Select.Option>
              <Select.Option value="F4">F4键</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="跳转网址"
            name="redirectUrl"
            rules={[
              { required: true, message: '请输入跳转网址！' },
              { type: 'url', message: '请输入有效的网址！' }
            ]}
          >
            <Input placeholder="请输入紧急情况下要跳转的网址" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button onClick={() => setIsBossKeyOpen(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
};

export const AvatarName = () => {
};
