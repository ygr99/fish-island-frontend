import {Col, Row, Card, Badge, Image, List, Typography, Tooltip, Tabs, Modal, Skeleton, Select, Button, Space} from 'antd';
import React, {useState, useEffect} from 'react';
import {getHotPostListUsingPost} from '@/services/backend/hotPostController';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { SettingOutlined } from '@ant-design/icons';

const STORAGE_KEY = 'selected_source_ids';

const Index: React.FC = () => {
  const [hostPostVoList, setHostPostVoList] = useState<API.HotPostVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState("//music.163.com/outchain/player?type=2&id=2674443509&auto=0&height=66");
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSelectedSourceIds, setTempSelectedSourceIds] = useState<number[]>([]);

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

  useEffect(() => {
    fetchData();
  }, []);

  dayjs.extend(relativeTime);

  // 根据分类返回对应的 emoji
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      '1': '🌈',
      '2': '✨',
      '3': '📺',
      '4': '🎶'
    };
    return emojiMap[category] || '🎯';
  };

  // 过滤数据源
  const filteredList = activeTab === 'all'
    ? hostPostVoList.filter(item => selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number))
    : hostPostVoList.filter(item => 
        (item.category as any === activeTab) && 
        (selectedSourceIds.length === 0 || selectedSourceIds.includes(item.id as number))
      );

  const items = [
    {key: 'all', label: '🌟 全部'},
    ...categories.map(category => ({
      key: category,
      label: `${getCategoryEmoji(category)} ${hostPostVoList.find(item => item.category as any === category)?.categoryName || category}`
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

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          style={{ flex: 1 }}
        />
        <Space>
          <Typography.Text type="secondary" style={{ marginRight: 8 }}>
            {selectedSourceIds.length > 0 
              ? `已选择 ${selectedSourceIds.length} 个数据源` 
              : '显示全部数据源'}
          </Typography.Text>
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
          // 加载状态下显示骨架屏
          Array.from({ length: 6 }).map((_, index) => (
            <Col xs={24} sm={24} md={12} lg={8} key={index}>
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
            <Col xs={24} sm={24} md={12} lg={8} key={index}>
              <Badge.Ribbon text={item.typeName}>
                <Card
                  title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <Image
                        src={
                          item.iconUrl
                        }
                        preview={false} // 不启用预览
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
                    }}
                  >
                    <List
                      dataSource={item.data}
                      renderItem={(data, index) => (
                        <List.Item
                        >
                          <Tooltip title={data.title} mouseEnterDelay={0.2}>
                            <Typography.Link
                              target="_blank" // 在新标签页打开链接
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
                              onMouseEnter={(e) => e.currentTarget.style.color = '#8F999F'}  // 鼠标悬停时变色
                              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}  // 鼠标离开时恢复默认颜色
                            >
                              <span
                                style={{flexGrow: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                                  {index + 1}.{data?.title?.length && data?.title?.length > 25 ? data.title.slice(0, 25) + '...' : data.title}
                                </span>
                              <span style={{
                                flexShrink: 0,
                                marginRight: '10px',
                                fontSize: '12px'
                              }}>
                                🔥 {data.followerCount && data.followerCount >= 10000 ? (data.followerCount / 10000).toFixed(1) + "万" : data.followerCount === 0 ? "置顶🔝" : data.followerCount}</span>
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
  );
};

export default Index;
