import {Col, Row, Card, Badge, Image, List, Typography, Tooltip, Tabs, Modal, Skeleton, Select, Button, Space} from 'antd';
import React, {useState, useEffect} from 'react';
import {getHotPostListUsingPost} from '@/services/backend/hotPostController';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { SettingOutlined, AppstoreOutlined, GlobalOutlined, ThunderboltOutlined, RocketOutlined, PlayCircleOutlined, CustomerServiceOutlined, TrophyOutlined } from '@ant-design/icons';
import './Index.less';

const STORAGE_KEY = 'selected_source_ids';

// 添加移动端检测
const isMobile = () => {
  return window.innerWidth <= 768;
};

// 添加自定义断点检测
const isSmallScreen = () => {
  return window.innerWidth < 1590;
};

const Index: React.FC = () => {
  const [hostPostVoList, setHostPostVoList] = useState<API.HotPostVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState("//music.163.com/outchain/player?type=2&id=2674443509&auto=0&height=66");
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSelectedSourceIds, setTempSelectedSourceIds] = useState<number[]>([]);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [isSmallScreenView, setIsSmallScreenView] = useState(isSmallScreen());

  // 添加窗口大小变化监听
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
      setIsSmallScreenView(isSmallScreen());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getHotPostListUsingPost();
      if (result.data) {
        setHostPostVoList(result.data);
        const uniqueCategories = Array.from(new Set(result.data.map((item: API.HotPostVO) => item.category || '')));
        // @ts-ignore
        setCategories(uniqueCategories.filter(Boolean));
        
        // 从本地存储读取数据源设置
        const storedIds = localStorage.getItem(STORAGE_KEY);
        if (storedIds) {
          const parsedIds = JSON.parse(storedIds);
          setSelectedSourceIds(parsedIds);
          setTempSelectedSourceIds(parsedIds);
        }
      }
    } catch (error) {
      console.error('Error fetching hot post list:', error);
    } finally {
      setLoading(false);
    }
  };

  // 设置默认选中的第一个数据源
  useEffect(() => {
    if (hostPostVoList.length > 0 && !activeTab) {
      if (isMobileView) {
        // 移动端默认选中第一个数据源
        const firstSource = hostPostVoList.find(item => 
          selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number)
        );
        if (firstSource) {
          setActiveTab(String(firstSource.id));
        }
      } else {
        // 电脑端默认选中"全部"
        setActiveTab('all');
      }
    }
  }, [hostPostVoList, selectedSourceIds, isMobileView]);

  useEffect(() => {
    fetchData();
  }, []);

  dayjs.extend(relativeTime);

  // 根据分类返回对应的图标
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '1': <ThunderboltOutlined style={{ color: '#ff4d4f' }} />, // 热门内容 - 红色闪电
      '2': <RocketOutlined style={{ color: '#1890ff' }} />,      // 推荐内容 - 蓝色火箭
      '3': <PlayCircleOutlined style={{ color: '#52c41a' }} />,  // 视频内容 - 绿色播放
      '4': <CustomerServiceOutlined style={{ color: '#722ed1' }} />, // 音乐内容 - 紫色音频
      '6': <TrophyOutlined style={{ color: '#fa8c16' }} /> // 体育赛事 - 橙色奖杯
    };
    return iconMap[category] || <AppstoreOutlined style={{ color: '#faad14' }} />;
  };

  // 过滤数据源
  const filteredList = activeTab === 'all'
    ? hostPostVoList.filter(item => selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number))
    : hostPostVoList.filter(item => 
        (item.category as any === activeTab) && 
        (selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number))
      );

  // 获取当前选中的数据源
  const currentSource = hostPostVoList.find(item => String(item.id) === activeTab);

  const items = [
    {key: 'all', label: <><GlobalOutlined style={{ color: '#1890ff' }} /> 全部</>},
    ...categories
      .filter(category => {
        if (selectedSourceIds.length === 0) return true;
        return hostPostVoList.some(item => 
          String(item.category) === String(category) && selectedSourceIds.includes(item.id as number)
        );
      })
      .map(category => ({
        key: category,
        label: <>{getCategoryIcon(category)} {hostPostVoList.find(item => String(item.category) === String(category))?.categoryName || category}</>
      }))
  ];

  const handleSettingsSave = () => {
    setSelectedSourceIds(tempSelectedSourceIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempSelectedSourceIds));
    setIsSettingsOpen(false);
  };

  return (
    <>
      <Modal
        title="🎵"
        footer={null}
        open={isMusicOpen}
        onCancel={() => {
          setCurrentMusic("about:blank");
          setTimeout(() => {
            setIsMusicOpen(false);
            setCurrentMusic("");
          }, 100);
        }}
        bodyStyle={{ padding: 0 }}
        width={350}
      >
        <iframe
          key={currentMusic}
          frameBorder="no"
          width={300}
          height={86}
          src={currentMusic}
        />
      </Modal>

      <Modal
        title="数据源设置"
        open={isSettingsOpen}
        onOk={handleSettingsSave}
        onCancel={() => {
          setIsSettingsOpen(false);
          setTempSelectedSourceIds(selectedSourceIds);
        }}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            选择你想要显示的数据源，设置会被保存到本地
          </Typography.Text>
        </div>
        <Select
          mode="multiple"
          placeholder="选择数据源"
          style={{ width: '100%' }}
          value={tempSelectedSourceIds}
          onChange={setTempSelectedSourceIds}
          options={hostPostVoList.map(item => ({
            label: item.name,
            value: item.id
          }))}
        />
      </Modal>

      {isMobileView ? (
        // 移动端布局
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          paddingBottom: '50px', // 为底部 tab-bar 留出空间
        }}>
          {loading ? (
            <Skeleton active />
          ) : currentSource ? (
            <div
              style={{
                padding: '0 16px'
              }}
            >
              <List
                dataSource={currentSource.data}
                renderItem={(data, index) => (
                  <List.Item>
                    <Tooltip title={data.title} mouseEnterDelay={0.2}>
                      <Typography.Link
                        target="_blank"
                        onClick={(e) => {
                          if (currentSource.category === 4) {
                            e.preventDefault()
                            setCurrentMusic(data.url as any);
                            setIsMusicOpen(true);
                          }
                        }}
                        href={data.url}
                        style={{
                          display: 'flex',
                          width: '100%',
                          color: 'black',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{flexGrow: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                          {index + 1}.{data?.title?.length && data?.title?.length > 25 ? data.title.slice(0, 25) + '...' : data.title}
                        </span>
                        <span style={{flexShrink: 0, marginRight: '10px', fontSize: '12px'}}>
                          🔥 {data.followerCount && data.followerCount >= 10000 ? (data.followerCount / 10000).toFixed(1) + "万" : data.followerCount === 0 ? "置顶🔝" : data.followerCount}
                        </span>
                      </Typography.Link>
                    </Tooltip>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Typography.Text type="secondary">请选择一个数据源</Typography.Text>
            </div>
          )}
          
          {/* 底部 tab-bar */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 1000
          }}>
            {hostPostVoList
              .filter(item => selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number))
              .map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(String(item.id))}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 0',
                  cursor: 'pointer',
                  color: activeTab === String(item.id) ? '#1890ff' : '#666'
                }}
              >
                <Image
                  src={item.iconUrl}
                  preview={false}
                  style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%',
                    border: activeTab === String(item.id) ? '2px solid #1890ff' : 'none'
                  }}
                />
              </div>
            ))}
            <div
              onClick={() => setIsSettingsOpen(true)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 0',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              <SettingOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>
      ) : (
        // 桌面端布局（保持原有代码）
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              style={{ flex: 1 }}
            />
            <Space>
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                onClick={() => setIsSettingsOpen(true)}
              >
                设置
              </Button>
            </Space>
          </div>
          <Row gutter={[16, 16]}>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Col xs={24} sm={24} md={12} lg={isSmallScreenView ? 12 : 8} key={index}>
                  <Card>
                    <Skeleton active>
                      <List.Item>
                        <List.Item.Meta
                          title={<Skeleton.Input style={{ width: 200 }} active />}
                          description={<Skeleton.Input style={{ width: 300 }} active />}
                        />
                      </List.Item>
                    </Skeleton>
                  </Card>
                </Col>
              ))
            ) : (
              filteredList.map((item, index) => (
                <Col xs={24} sm={24} md={12} lg={isSmallScreenView ? 12 : 8} key={index}>
                  <Badge.Ribbon text={item.typeName}>
                    <Card
                      title={
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <Image
                            src={item.iconUrl}
                            preview={false}
                            style={{width: 24, height: 24, marginRight: 8}}
                          />
                          <Typography.Text>{item.name}</Typography.Text>
                          <Typography.Text style={{marginLeft: "10px", color: 'gray', fontSize: '12px'}}>
                            (更新时间：{dayjs(item.updateTime).fromNow()})
                          </Typography.Text>
                        </div>
                      }
                    >
                      <div
                        id="scrollableDiv"
                        style={{
                          height: 400,
                          overflow: 'auto',
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                        }}
                        className="custom-scrollbar"
                      >
                        <List
                          dataSource={item.data}
                          renderItem={(data, index) => (
                            <List.Item>
                              <Tooltip title={data.title} mouseEnterDelay={0.2}>
                                <Typography.Link
                                  target="_blank"
                                  onClick={(e) => {
                                    if (item.category === 4) {
                                      e.preventDefault()
                                      setCurrentMusic(data.url as any);
                                      setIsMusicOpen(true);
                                    }
                                  }}
                                  href={data.url}
                                  style={{
                                    display: 'flex',
                                    width: '100%',
                                    color: 'black',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span style={{flexGrow: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                                    {index + 1}.{data?.title?.length && data?.title?.length > 25 ? data.title.slice(0, 25) + '...' : data.title}
                                  </span>
                                  <span style={{flexShrink: 0, marginRight: '10px', fontSize: '12px'}}>
                                    🔥 {data.followerCount && data.followerCount >= 10000 ? (data.followerCount / 10000).toFixed(1) + "万" : data.followerCount === 0 ? "置顶🔝" : data.followerCount}
                                  </span>
                                </Typography.Link>
                              </Tooltip>
                            </List.Item>
                          )}
                        />
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))
            )}
          </Row>
        </>
      )}
    </>
  );
};

export default Index;
