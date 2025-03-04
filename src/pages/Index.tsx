import {Col, Row, Card, Badge, Image, List, Typography, Tooltip, Tabs} from 'antd';
import React, {useState, useEffect} from 'react';
import {getHotPostListUsingPost} from '@/services/backend/hotPostController';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

const Index: React.FC = () => {
  const [hostPostVoList, setHostPostVoList] = useState<API.HotPostVO[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const result = await getHotPostListUsingPost();
      if (result.data) {
        setHostPostVoList(result.data);
        // 提取所有不重复的 category
        const uniqueCategories = Array.from(new Set(result.data.map((item: API.HotPostVO) => item.category || '')));
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
      '3': '📺'
    };
    return emojiMap[category] || '🎯';
  };

  const filteredList = activeTab === 'all'
    ? hostPostVoList
    : hostPostVoList.filter(item => item.category === activeTab);

  const items = [
    { key: 'all', label: '🌟 全部' },
    ...categories.map(category => ({
      key: category,
      label: `${getCategoryEmoji(category)} ${hostPostVoList.find(item => item.category === category)?.categoryName || category}`
    }))
  ];


  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{ marginBottom: 16 }}
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
                    renderItem={(item, index) => (
                      <List.Item
                      >
                        <Tooltip title={item.title} mouseEnterDelay={0.2}>
                          <Typography.Link
                            target="_blank" // 在新标签页打开链接
                            href={item.url}
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
                              {index + 1}.{item?.title?.length && item?.title?.length > 25 ? item.title.slice(0, 25) + '...' : item.title}
                            </span>
                            <span style={{
                              flexShrink: 0,
                              marginRight: '10px',
                              fontSize: '12px'
                            }}>🔥 {item.followerCount && item.followerCount >= 10000 ? (item.followerCount / 10000).toFixed(1) + "万" : item.followerCount}</span>
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
