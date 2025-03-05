import {Col, Row, Card, Badge, Image, List, Typography, Tooltip, Tabs, Modal} from 'antd';
import React, {useState, useEffect} from 'react';
import {getHotPostListUsingPost} from '@/services/backend/hotPostController';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

const Index: React.FC = () => {
  const [hostPostVoList, setHostPostVoList] = useState<API.HotPostVO[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState("//music.163.com/outchain/player?type=2&id=2674443509&auto=0&height=66");

  const fetchData = async () => {
    try {
      const result = await getHotPostListUsingPost();
      if (result.data) {
        setHostPostVoList(result.data);
        // 提取所有不重复的 category
        const uniqueCategories = Array.from(new Set(result.data.map((item: API.HotPostVO) => item.category || '')));
        // @ts-ignore
        setCategories(uniqueCategories.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching hot post list:', error);
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

  // @ts-ignore
  const filteredList = activeTab === 'all'
    ? hostPostVoList
    : hostPostVoList.filter(item => item.category as any === activeTab);

  const items = [
    {key: 'all', label: '🌟 全部'},
    ...categories.map(category => ({
      key: category,
      label: `${getCategoryEmoji(category)} ${hostPostVoList.find(item => item.category as any === category)?.categoryName || category}`
    }))
  ];


  return (
    <>
      <Modal
        title="🎵"
        footer={null}
        open={isMusicOpen}
        onCancel={() => setIsMusicOpen(false)}
        bodyStyle={{ padding: 0 }} // 移除 padding
        width={350} // 让 Modal 宽度匹配 iframe
      >
        <iframe
          frameBorder="no"
          width={300}
          height={86}
          src={currentMusic}>
        </iframe>
      </Modal>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{marginBottom: 16}}
      />
      <Row gutter={[16, 16]}>
        {filteredList.map((item, index) => (
          <Col span={8} key={index}>
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
        ))}
      </Row>
    </>
  );
};

export default Index;
