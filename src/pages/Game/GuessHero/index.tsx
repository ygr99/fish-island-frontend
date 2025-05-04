import React, {useState, useEffect} from 'react';
import {Card, Form, Button, Table, Space, message, Select} from 'antd';
import {listSimpleHero, getRandomHero, getHeroById} from '@/services/backend/heroController';
import "./index.css"
import {ArrowDownOutlined, ArrowUpOutlined} from "@ant-design/icons";

const GuessHero: React.FC = () => {
  const [form] = Form.useForm();
  const [heroList, setHeroList] = useState<API.SimpleHeroVO_[]>([]);
  const [randomHero, setRandomHero] = useState<API.HeroVO_ | null>(null);
  const [guessList, setGuessList] = useState<API.HeroVO_[]>([]);
  const [loading, setLoading] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  // 在现有状态声明区域添加
  const [correctHeroId, setCorrectHeroId] = useState<number | null>(null);

  // 加载英雄列表
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const response = await listSimpleHero();
        if (response.code === 0) {
          setHeroList(response.data || []);
        }
      } catch (error) {
        message.error('加载英雄列表失败');
      }
    };
    fetchHeroes();
  }, []);

  // 开始游戏
  const handleStartGame = async () => {
    try {
      setLoading(true);
      const response = await getRandomHero();
      if (response.code === 0) {
        setRandomHero(response.data);
        setCorrectHeroId(response.data?.id || null); // 存储正确答案 ID
        setGuessList([]);
        setGameStarted(true);
      }
    } catch (error) {
      message.error('获取随机英雄失败');
    } finally {
      setLoading(false);
    }
  };

  // 结束游戏
  const handleEndGame = () => {
    if (randomHero) {
      setGuessList([randomHero, ...guessList]);
      resetGame();
    }
  };

  // 猜测英雄
  const handleGuess = async (values: { heroId: number }) => {
    try {
      // 新增重复猜测校验
      const isDuplicate = guessList.some(item => item.id === values.heroId);
      if (isDuplicate) {
        message.warning('请勿重复猜测同一英雄');
        return;
      }
      setLoading(true);
      if (values.heroId === randomHero?.id) {
        // 猜中逻辑
        setGuessList(prev => [randomHero, ...prev]);
        message.success('恭喜猜中！');
        resetGame();
      } else {
        // 未猜中逻辑
        const response = await getHeroById({id: values.heroId});
        if (response.code === 0) {
          setGuessList(prev => [response.data, ...prev]); // 使用函数式更新
        }
      }
    } catch (error) {
      message.error('获取英雄详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置游戏状态
  const resetGame = () => {
    form.resetFields();
    setRandomHero(null);
    setGameStarted(false);
  };

  // 定义码值映射
  const typeMap = {
    1: '战士',
    2: '法师',
    3: '坦克',
    4: '刺客',
    5: '射手',
    6: '辅助',
  };

  // 判断两个字段是否相等
  const isSame = (a: any, b: any) => a === b;

  // 获取身高前三位并转为数字
  const getHeightNumber = (height: string) => {
    const match = height?.match(/^\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // 比较函数：返回 ↑ 或 ↓ 的图标
  const getArrow = (current: number, target: number) => {
    if (current > target) return <ArrowDownOutlined style={{color: 'red'}}/>;
    if (current < target) return <ArrowUpOutlined style={{color: 'red'}}/>;
    return '';
  };


  // 表格列配置
  const columns = [
    {
      title: '英雄图片',
      dataIndex: 'ename',
      key: 'ename',
      render: (text, record) => {
        const imageUrl = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${record.ename}/${record.ename}.jpg`;
        return (
          <img
            src={imageUrl}
            alt={record.cname}
            style={{width: 60, height: 60, objectFit: 'contain'}}
          />
        );
      },
    },
    {
      title: '英雄名称',
      dataIndex: 'cname',
      key: 'cname',
    },
    {
      title: '上线时间',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (text, record) => {
        if (!randomHero) return text;
        const current = new Date(record.releaseDate).getTime();
        const target = new Date(randomHero.releaseDate).getTime();
        const arrow = getArrow(current, target);
        const same = isSame(current, target);
        return same ? `${text} ✅` : (
          <span>
        {text} {arrow}
      </span>
        );
      },
    },
    {
      title: '主定位',
      dataIndex: 'primaryType',
      key: 'primaryType',
      render: (text, record) => {
        let label = typeof record.primaryType === 'number'
          ? typeMap[record.primaryType as keyof typeof typeMap] || record.primaryType
          : record.primaryType;

        if (!randomHero) return label;
        //label如果为null, 则返回空字符串
        label = label || '无';
        const same = isSame(record.primaryType, randomHero.primaryType);
        return same ? `${label} ✅` : label;
      },
    },

    {
      title: '副定位',
      dataIndex: 'secondaryType',
      key: 'secondaryType',
      render: (text, record) => {
        let label = typeof record.secondaryType === 'number'
          ? typeMap[record.secondaryType as keyof typeof typeMap] || record.secondaryType
          : record.secondaryType;

        if (!randomHero) return label;
        //label如果为null, 则返回空字符串
        label = label || '无';
        const same = isSame(record.secondaryType, randomHero.secondaryType);
        return same ? `${label} ✅` : label;
      },
    },
    {
      title: '种族',
      dataIndex: 'race',
      key: 'race',
      render: (text, record) => {
        if (!randomHero) return text;
        const same = isSame(record.race, randomHero.race);
        return same ? `${text} ✅` : text;
      },
    },
    {
      title: '阵营',
      dataIndex: 'faction',
      key: 'faction',
      render: (text, record) => {
        if (!randomHero) return text;
        const same = isSame(record.faction, randomHero.faction);
        return same ? `${text} ✅` : text;
      },
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      render: (text, record) => {
        if (!randomHero) return text;
        const same = isSame(record.region, randomHero.region);
        return same ? `${text} ✅` : text;
      },
    },
    {
      title: '能量',
      dataIndex: 'ability',
      key: 'ability',
      render: (text, record) => {
        if (!randomHero) return text;
        const same = isSame(record.ability, randomHero.ability);
        return same ? `${text} ✅` : text;
      },
    },
    {
      title: '身高',
      dataIndex: 'height',
      key: 'height',
      render: (text, record) => {
        if (!randomHero) return text;
        const currentHeight = getHeightNumber(record.height);
        const targetHeight = getHeightNumber(randomHero.height);
        const arrow = getArrow(currentHeight, targetHeight);
        const same = currentHeight === targetHeight;
        return same ? `${text} ✅` : (
          <span>
          {text} {arrow}
        </span>
        );
      },
    },
    {
      title: '皮肤数量',
      dataIndex: 'skinsNum',
      key: 'skinsNum',
      render: (text, record) => {
        if (!randomHero) return text;
        const currentNum = parseInt(record.skinsNum, 10);
        const targetNum = parseInt(randomHero.skinsNum, 10);
        const arrow = getArrow(currentNum, targetNum);
        const same = currentNum === targetNum;
        return same ? `${text} ✅` : (
          <span>
          {text} {arrow}
        </span>
        );
      },
    },
  ];


  return (
    <Card title="王者猜英雄">
      <Form form={form} onFinish={handleGuess}>
        <Space
          direction="vertical"
          size="large"
          style={{width: '100%'}}
          align="center" // 新增属性
        >
          <Form.Item
            label="选择英雄"
            name="heroId"
            rules={[{required: true}]}
            style={{textAlign: 'center'}} // 新增样式
            labelCol={{style: {textAlign: 'left'}}} // 保持标签左对齐
          >
            <Select
              showSearch={{
                filter: true,
                placeholder: '请输入英雄名称',
              }}
              options={heroList.map(hero => ({
                label: hero.cname,
                value: hero.id,
              }))}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              style={{width: 200}}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              onClick={handleStartGame}
              loading={loading}
              disabled={gameStarted}
            >
              开始
            </Button>
            <Button
              danger
              onClick={handleEndGame}
              disabled={!gameStarted}
            >
              结束
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (randomHero?.quote) {
                  message.success(`英雄台词：${randomHero.quote}`);
                } else {
                  message.warning('该英雄暂无经典台词');
                }
              }}
              disabled={!gameStarted}
            >
              提示
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!gameStarted}
              loading={loading}
            >
              猜一下
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={guessList}
            rowKey="id"
            rowClassName={(record) =>
              record.id === correctHeroId ? 'highlight-row' : ''
            }
          />

        </Space>
      </Form>
    </Card>
  );
};

export default GuessHero;
