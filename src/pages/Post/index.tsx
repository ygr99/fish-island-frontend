import React, { useState } from 'react';
import { Card, List, Tag, Space, Button, Input, Tabs, Avatar, Badge } from 'antd';
import {
  FireOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  LikeOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import './index.less';

const { TabPane } = Tabs;
const { Search } = Input;

// 模拟分类数据
const categories = [
  { id: 1, name: '职场', color: 'blue' },
  { id: 2, name: '技术', color: 'green' },
  { id: 3, name: '生活', color: 'orange' },
  { id: 4, name: '娱乐', color: 'purple' },
  { id: 5, name: '游戏', color: 'red' },
  { id: 6, name: '美食', color: 'cyan' },
  { id: 7, name: '旅行', color: 'gold' },
  { id: 8, name: '其他', color: 'gray' },
];

// 模拟帖子数据
const posts = [
  {
    id: 1,
    title: '今天在办公室发现了什么？一个隐藏的休息室！',
    author: '摸鱼达人',
    avatar: 'https://joeschmoe.io/api/v1/random',
    category: 1,
    content: '今天无意中发现了办公室的隐藏休息室，里面居然有按摩椅...',
    createTime: '2小时前',
    views: 256,
    likes: 32,
    comments: 18,
  },
  {
    id: 2,
    title: 'React 18新特性体验，值得升级吗？',
    author: '前端小能手',
    avatar: 'https://joeschmoe.io/api/v1/joe',
    category: 2,
    content: '最近体验了React 18的并发特性，感觉性能提升明显...',
    createTime: '4小时前',
    views: 512,
    likes: 64,
    comments: 24,
  },
  {
    id: 3,
    title: '分享一个五分钟午休的高效方法',
    author: '职场达人',
    avatar: 'https://joeschmoe.io/api/v1/jess',
    category: 3,
    content: '只要五分钟，就能让下午的工作效率提升30%...',
    createTime: '昨天',
    views: 1024,
    likes: 128,
    comments: 42,
  },
  {
    id: 4,
    title: '最近很火的这部剧，到底值不值得追？',
    author: '剧评人',
    avatar: 'https://joeschmoe.io/api/v1/james',
    category: 4,
    content: '这部剧前三集节奏有点慢，但是后面剧情反转...',
    createTime: '3天前',
    views: 2048,
    likes: 256,
    comments: 96,
  },
  {
    id: 5,
    title: '这款新出的独立游戏，玩了三天停不下来',
    author: '游戏迷',
    avatar: 'https://joeschmoe.io/api/v1/jana',
    category: 5,
    content: '画风清新，玩法创新，剧情感人，强烈推荐...',
    createTime: '4天前',
    views: 1536,
    likes: 192,
    comments: 64,
  },
];

// 模拟热门话题数据
const hotTopics = [
  { id: 1, title: '远程办公还是现场办公？', count: 128 },
  { id: 2, title: '如何平衡工作和生活', count: 96 },
  { id: 3, title: '最佳摸鱼时间段', count: 85 },
  { id: 4, title: '有哪些高效办公技巧', count: 72 },
  { id: 5, title: '周五下午如何度过', count: 64 },
];

const PostPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 根据选中的分类筛选帖子
  const filteredPosts = selectedCategory
    ? posts.filter(post => post.category === selectedCategory)
    : posts;

  // 获取分类名称
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  // 获取分类颜色
  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'default';
  };

  return (
    <div className="post-page">

      <div className="post-container">
        <div className="post-main">
          <Card className="post-filter-card">
            <div className="filter-container">
              <div className="category-filter">
                <span className="filter-label">分类：</span>
                <div className="tag-container">
                  <Tag 
                    color={selectedCategory === null ? 'orange' : ''}
                    className={selectedCategory === null ? 'category-tag active' : 'category-tag'} 
                    onClick={() => setSelectedCategory(null)}
                  >
                    全部
                  </Tag>
                  {categories.map(category => (
                    <Tag
                      key={category.id}
                      color={selectedCategory === category.id ? category.color : ''}
                      className={selectedCategory === category.id ? 'category-tag active' : 'category-tag'}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="post-search">
                <Input 
                  placeholder="搜索帖子" 
                  prefix={<SearchOutlined className="search-icon" />}
                  allowClear 
                  className="search-input"
                />
                <Button type="primary" icon={<SearchOutlined />} className="search-button">搜索</Button>
              </div>
            </div>
          </Card>

          <Card className="post-list-card">
            <div className="post-list-header">
              <div className="tabs-container">
                <Tabs defaultActiveKey="latest" className="post-tabs">
                  <TabPane 
                    tab={<span><ClockCircleOutlined /> 最新发布</span>} 
                    key="latest" 
                  />
                  <TabPane 
                    tab={<span><FireOutlined /> 热门讨论</span>} 
                    key="hot" 
                  />
                  <TabPane 
                    tab={<span><RiseOutlined /> 精华内容</span>} 
                    key="featured" 
                  />
                </Tabs>
              </div>
              <div className="button-container">
                <Button type="primary" icon={<PlusOutlined />}>发布帖子</Button>
              </div>
            </div>

            <List
              itemLayout="vertical"
              size="large"
              pagination={{
                pageSize: 5,
                simple: true,
              }}
              dataSource={filteredPosts}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  className="post-item"
                  actions={[
                    <span><EyeOutlined /> {item.views}</span>,
                    <span><LikeOutlined /> {item.likes}</span>,
                    <span><MessageOutlined /> {item.comments}</span>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={
                      <div className="post-title">
                        <a href={`/post/${item.id}`}>{item.title}</a>
                        <Tag color={getCategoryColor(item.category)} className="category-tag-small">
                          {getCategoryName(item.category)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="post-meta">
                        <span className="post-author">{item.author}</span>
                        <span className="post-time">{item.createTime}</span>
                      </div>
                    }
                  />
                  <div className="post-content">{item.content}</div>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="post-sidebar">
          <Card title="热门话题" className="hot-topics-card">
            <List
              size="small"
              dataSource={hotTopics}
              renderItem={(item, index) => (
                <List.Item className="hot-topic-item">
                  <Badge
                    count={index + 1}
                    style={{
                      backgroundColor: index < 3 ? '#ff4d4f' : '#999',
                      marginRight: '8px'
                    }}
                  />
                  <a href={`/topic/${item.id}`}>{item.title}</a>
                  <span className="topic-count">{item.count}人参与</span>
                </List.Item>
              )}
            />
          </Card>

          <Card title="社区公告" className="announcement-card">
            <p>🎉 欢迎来到摸鱼论坛！</p>
            <p>🚀 新功能上线：表情包发送功能已开放</p>
            <p>📢 社区规则已更新，请遵守社区规范</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
