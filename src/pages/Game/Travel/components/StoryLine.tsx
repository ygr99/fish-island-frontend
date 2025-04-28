import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Divider, Drawer, List, Space, Typography } from 'antd';
import React from 'react';
import styles from './StoryLine.less';

const { Text, Title } = Typography;

interface StoryLineProps {
  visible: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  travelTime: string;
  distance: string;
  progress: number;
}

const StoryLine: React.FC<StoryLineProps> = ({
  visible,
  onClose,
  origin,
  destination,
  travelTime,
  distance,
  progress,
}) => {
  // 生成故事线数据
  const getStoryPoints = () => {
    // 这里可以根据进度计算应该显示多少个点
    const points = [
      {
        title: '旅程开始',
        description: `从${origin}出发`,
        time: '0%',
        completed: progress > 0,
      },
      {
        title: '沿途风景',
        description: '路上可以欣赏美丽的风景',
        time: '25%',
        completed: progress >= 25,
      },
      {
        title: '中途休息',
        description: '停下来补充能量',
        time: '50%',
        completed: progress >= 50,
      },
      {
        title: '继续前行',
        description: '离目的地越来越近了',
        time: '75%',
        completed: progress >= 75,
      },
      {
        title: '到达目的地',
        description: `抵达${destination}`,
        time: '100%',
        completed: progress >= 100,
      },
    ];

    return points;
  };

  return (
    <Drawer
      title="故事线"
      placement="left"
      onClose={onClose}
      open={visible}
      width={300}
      className={styles.storyLineDrawer}
    >
      <div className={styles.tripInfo}>
        <Space direction="vertical" size="small">
          <div className={styles.tripEndpoints}>
            <Text strong>{origin}</Text>
            <div className={styles.tripLine}></div>
            <Text strong>{destination}</Text>
          </div>
          <Space size="large">
            <Space>
              <ClockCircleOutlined />
              <Text>{travelTime}</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>{distance}</Text>
            </Space>
          </Space>
        </Space>
      </div>

      <Divider />

      <List
        className={styles.storyList}
        itemLayout="horizontal"
        dataSource={getStoryPoints()}
        renderItem={(item) => (
          <List.Item className={item.completed ? styles.storyItemCompleted : styles.storyItem}>
            <List.Item.Meta
              title={
                <div className={styles.storyTitle}>
                  <div
                    className={`${styles.storyPoint} ${item.completed ? styles.completed : ''}`}
                  />
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" className={styles.storyTime}>
                    {item.time}
                  </Text>
                </div>
              }
              description={<Text className={styles.storyDescription}>{item.description}</Text>}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default StoryLine;
