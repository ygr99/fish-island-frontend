import '@umijs/max';
import {PageContainer, ProCard} from '@ant-design/pro-components';
import {Button, DatePicker, Descriptions, message, Radio, Space, Statistic,} from 'antd';
import React, {useEffect, useState} from 'react';
import {Line} from '@ant-design/charts';
import {history} from '@umijs/max';
import moment from 'moment';
import {getNewUserDataWebVO, getUserDataWebVO} from '@/services/backend/userController';

const { Divider } = ProCard;
const { RangePicker } = DatePicker;
import "./index.css"
/**
 * 数据分析
 *
 * @constructor
 */
const DataAdminPage: React.FC = () => {
  const [responsive] = useState(false);
  const [timeRange, setTimeRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [todayActiveUsers, setTodayActiveUsers] = useState(0);
  const [todayNewUsers, setTodayNewUsers] = useState(0);
  const [thisMonthActiveUsers, setMonthActiveUsers] = useState(0);


  const [type] = useState(0);
  const [data, setData] = useState([]);
  const config = {
    data,
    xField: '日期',
    yField: '新增用户',
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };

  /**
   * 首页-用户数据
   */
  const getUserData = async () => {
    try {
      getUserDataWebVO().then((res) => {
        if (res.data) {
          setTotalUsers(res.data.totalUsers);
          setTodayActiveUsers(res.data.todayActiveUsers);
          setTodayNewUsers(res.data.todayNewUsers);
          setMonthActiveUsers(res.data.thisMonthActiveUsers);
        }
      });
    } catch (error: any) {
      message.error('Failed to fetch userData:', error.message);
    }
  };

  /**
   * 首页-新增用户走势图
   * @param type 类型
   * @param beginTime 开始时间
   * @param endTime 结束时间
   */
  const getNewUserData = async (type: number, beginTime: string, endTime: string) => {
    try {
      const res = await getNewUserDataWebVO({ type, beginTime: beginTime, endTime: endTime });
      if (res.data) {
        const transformedData = res.data.map((item: any) => ({
          '日期': item.date,
          '新增用户': item.newUserCount,
        }));
        // @ts-ignore
        setData(transformedData);
      }
    } catch (error: any) {
      message.error('Failed to fetch newUserData:', error.message);
    }
  };

  /**
   * 首次加载时执行一次
   */
  useEffect(() => {
    getUserData();
    getNewUserData(type, '', '');
  }, []);

  const handleRangeChange = (dates: [moment.Moment, moment.Moment] | null) => {
    setTimeRange(dates);
  };

  const options = [
    { label: '本周', value: 0 },
    { label: '本月', value: 1 },
    { label: '今年', value: 2 },
  ];

  /**
   * 获取新增用户走势图
   * @param e
   */
  function handleRadioChange(e: any) {
    getNewUserData(e.target.value, '', '');
  }

  /**
   * 查询按钮点击事件
   */
  function handleButtonClick() {
    if (timeRange === null) {
      message.error('请选择时间范围');
      return;
    }
    //时间戳转成日期格式
    const beginTime = timeRange[0].format('YYYY-MM-DD');
    const endTime = timeRange[1].format('YYYY-MM-DD');
    //用户数据新增类型 3 - 时间范围
    getNewUserData(3, beginTime, endTime);
  }

  return (
    <>
      <PageContainer>
        <Space size="large" style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
          <ProCard
            title={'全部用户'}
            className="clickable-card"
            onClick={() => {
              history.push('/admin/user?type=0');
            }}
          >
            <Statistic value={totalUsers} suffix={'人'} />
          </ProCard>
          <ProCard
            title={'今日新增'}
            className="clickable-card"
            onClick={() => {
              history.push('/admin/user?type=1');
            }}
          >
            <Statistic value={todayNewUsers} suffix={'人'} />
          </ProCard>
          <ProCard
            title={'今日活跃'}
            className="clickable-card"
            onClick={() => {
              history.push('/admin/user?type=2');
            }}
          >
            <Statistic value={todayActiveUsers} suffix={'人'} />
          </ProCard>
          <ProCard
            title={'本月活跃'}
            className="clickable-card"
            onClick={() => {
              history.push('/admin/user?type=3');
            }}
          >
            <Statistic value={thisMonthActiveUsers} suffix={'人'} />
          </ProCard>

        </Space>
        <Divider type={responsive ? 'horizontal' : 'vertical'} />
        <Descriptions title="新增用户走势图">
          <ProCard.Group>
            <ProCard>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div style={{ marginRight: 16 }}>搜索时间</div>
                <RangePicker
                  value={timeRange}
                  onChange={handleRangeChange}
                  style={{ marginRight: 16 }}
                />
                <Button type="primary" style={{ marginRight: 16 }} onClick={handleButtonClick}>
                  查询
                </Button>
                <Radio.Group
                  options={options}
                  defaultValue={0}
                  onChange={handleRadioChange}
                  optionType="button"
                  buttonStyle="solid"
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Line {...config} />
              </div>
            </ProCard>
          </ProCard.Group>
        </Descriptions>
      </PageContainer>
    </>
  );
};
export default DataAdminPage;
