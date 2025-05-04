import React, {useState, useEffect} from 'react';
import {Card, Form, Button, Table, Space, message, Select, Modal, List, Collapse} from 'antd';
import {listSimpleHero, getRandomHero, getHeroById, getNewHero} from '@/services/backend/heroController';
import "./index.css"
import {ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined, RocketOutlined} from "@ant-design/icons";

const GuessHero: React.FC = () => {
  const [form] = Form.useForm();
  const [heroList, setHeroList] = useState<API.SimpleHeroVO_[]>([]);
  const [randomHero, setRandomHero] = useState<API.HeroVO_ | null>(null);
  const [guessList, setGuessList] = useState<API.HeroVO_[]>([]);
  const [loading, setLoading] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  // 在现有状态声明区域添加
  const [correctHeroId, setCorrectHeroId] = useState<number | null>(null);
  const [newHero, setNewHero] = useState<API.HeroVO | null>(null);
  const [loadingNewHero, setLoadingNewHero] = useState(false);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);

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

    const fetchNewHero = async () => {
      setLoadingNewHero(true);
      try {
        const response = await getNewHero();
        if (response.code === 0) {
          setNewHero(response.data);
        } else {
          message.error('获取最新英雄失败');
        }
      } catch (error) {
        message.error('获取最新英雄失败');
      } finally {
        setLoadingNewHero(false);
      }
    };

    fetchNewHero();
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

  const gameRules = (
    <Modal
      title="游戏规则"
      visible={isRuleModalVisible}
      onOk={() => setIsRuleModalVisible(false)}
      onCancel={() => setIsRuleModalVisible(false)}
    >
      <div style={{ padding: '0 12px' }}>
        <ol>
          <li><strong>目标：</strong>通过每次猜测获取线索，最终猜中隐藏的英雄。</li>
          <li><strong>流程：</strong>点击「开始」获取随机英雄 → 选择猜测 → 获取属性对比线索 → 直到猜中或点击「结束」。</li>
          <li><strong>线索类型：</strong>上线时间、定位、身高、皮肤数量等属性对比（↑/↓），相同属性显示✅。</li>
          <li><strong>限制：</strong>不可重复猜测同一英雄。</li>
          <li><strong>提示功能：</strong>点击「提示」可查看正确英雄的台词（若存在）。</li>
        </ol>

        {/* 最新英雄信息区块 */}
        <div style={{
          marginTop: 24,
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
            最新英雄信息
          </h4>

          {loadingNewHero ? (
            <Space>
              <RocketOutlined spin style={{ color: '#ffa768' }} />
              <span>加载中...</span>
            </Space>
          ) : newHero ? (
            <Space>
              <img
                src={`https://game.gtimg.cn/images/yxzj/img201606/heroimg/${newHero.ename}/${newHero.ename}.jpg`}
                alt="最新英雄"
                style={{ width: 40, height: 40, borderRadius: 4 }}
              />
              <div>
                <div>名称：<strong>{newHero.cname}</strong></div>
                <div>上线时间：<strong>{newHero.releaseDate}</strong></div>
              </div>
            </Space>
          ) : (
            <span style={{ color: '#888' }}>暂无最新英雄信息</span>
          )}
        </div>
      </div>
    </Modal>
  );


  // 比较图标渲染函数
  const renderCompareIcon = (current: number, target: number) => {
    if (!randomHero) return null;
    if (current > target) return <ArrowDownOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />;
    if (current < target) return <ArrowUpOutlined style={{ color: '#49aa19', marginLeft: 4 }} />;
    return <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />;
  };
  // 替换表格的移动端列表展示
  const renderGuessList = () => (
    <List
      dataSource={guessList}
      renderItem={(record) => (
        <List.Item
          className={record.id === correctHeroId ? 'highlight-row' : ''}
          style={{
            backgroundColor: '#fff',
            marginBottom: 12,
            borderRadius: 8,
            padding: '12px 16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ width: '100%' }}>
            {/* 头部信息 */}
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <img
                src={`https://game.gtimg.cn/images/yxzj/img201606/heroimg/${record.ename}/${record.ename}.jpg`}
                style={{ width: 50, height: 50, borderRadius: 4, marginRight: 12 }}
              />
              <div>
                <div style={{fontWeight: 'bold', fontSize: 16}}>{record.cname}</div>
                <div style={{
                  fontSize: 12,
                }}>
                  {typeMap[record.primaryType as keyof typeof typeMap] || record.primaryType}
                  {randomHero && isSame(record.primaryType, randomHero.primaryType) && (
                    <CheckCircleOutlined style={{color: '#52c41a', marginLeft: 4}}/>
                  )}
                </div>
              </div>
            </div>

            {/* 核心对比指标 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              marginBottom: 8,
              fontSize: 12
            }}>
              <div style={{padding: 8, border: '1px solid #eee', borderRadius: 4}}>
                上线时间：{record.releaseDate}
                {renderCompareIcon(
                  new Date(record.releaseDate).getTime(),
                  randomHero?.releaseDate ? new Date(randomHero.releaseDate).getTime() : 0
                )}
              </div>

              <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
                皮肤数：{record.skinsNum}
                {renderCompareIcon(
                  parseInt(record.skinsNum),
                  randomHero?.skinsNum ? parseInt(randomHero.skinsNum) : 0
                )}
              </div>

              <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
                身高：{getHeightNumber(record.height)}cm
                {renderCompareIcon(
                  getHeightNumber(record.height),
                  randomHero?.height ? getHeightNumber(randomHero.height) : 0
                )}
              </div>
            </div>

            {/* 可展开详情 */}
            <Collapse size="small" bordered={false}>
              <Collapse.Panel header="查看详情" key="1">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 6,
                  fontSize: 12
                }}>
                  <div style={{
                    padding: 6,
                  }}>
                    阵营：{record.faction || '无'}
                    {randomHero && isSame(record.faction, randomHero.faction) && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                  </div>

                  <div style={{
                    padding: 6,
                  }}>
                    区域：{record.region || '无'}
                    {randomHero && isSame(record.region, randomHero.region) && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                  </div>

                  <div style={{
                    padding: 6,
                  }}>
                    副定位：
                    {record.secondaryType
                      ? typeMap[record.secondaryType as keyof typeof typeMap] || record.secondaryType
                      : '无'}
                    {randomHero && isSame(record.secondaryType, randomHero.secondaryType) && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                  </div>

                  <div style={{
                    padding: 6,
                  }}>
                    种族：{record.race || '无'}
                    {randomHero && isSame(record.race, randomHero.race) && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                  </div>

                  <div style={{
                    padding: 6,
                  }}>
                    能量：{record.ability || '无'}
                    {randomHero && isSame(record.ability, randomHero.ability) && (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </List.Item>
      )}
    />
  );
  return (
    <>
      {gameRules} {}
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>英雄猜猜乐</span>
          <a
            onClick={() => setIsRuleModalVisible(true)}
          >
            规则
          </a>
        </div>
      }
      // extra={
      //   <>
      //     {/* 最新英雄信息 */}
      //     {loadingNewHero ? (
      //       <span>加载中...</span>
      //     ) : newHero ? (
      //       <Space>
      //         <RocketOutlined style={{ color: '#ffa768' }} />
      //         <span style={{ color: '#ffa768' }}>
      //       最新英雄：<strong>{newHero.cname}</strong>，上线时间：<strong>{newHero.releaseDate}</strong>
      //     </span>
      //       </Space>
      //     ) : (
      //       <span>暂无最新英雄信息</span>
      //     )}
      //   </>
      // }
    >
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

          {guessList.length > 0 ? (
            renderGuessList()
          ) : (
            <p style={{ textAlign: 'center', color: '#888' }}>
              暂无猜测记录，请开始游戏并猜一下
            </p>
          )}
        </Space>
      </Form>
    </Card>
    </>
  );
};

export default GuessHero;
