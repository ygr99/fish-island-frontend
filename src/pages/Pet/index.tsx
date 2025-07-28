import React, { useState } from 'react';
import { Row, Col, Card, Table, Avatar, Badge, Tabs } from 'antd';
import { TrophyOutlined, CrownOutlined, HomeOutlined, BarChartOutlined } from '@ant-design/icons';
import MoyuPet from '@/components/MoyuPet';
import styles from './index.less';

// 模拟排行榜数据
const mockRankData = [
  {
    key: '1',
    rank: 1,
    name: '小鱼儿',
    level: 25,
    owner: '摸鱼达人',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '2',
    rank: 2,
    name: '鱼丸',
    level: 23,
    owner: '摸鱼专家',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '3',
    rank: 3,
    name: '咸鱼',
    level: 21,
    owner: '摸鱼爱好者',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '4',
    rank: 4,
    name: '鲨鱼',
    level: 19,
    owner: '摸鱼新手',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '5',
    rank: 5,
    name: '金鱼',
    level: 18,
    owner: '摸鱼学徒',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '6',
    rank: 6,
    name: '河豚',
    level: 16,
    owner: '快乐摸鱼',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '7',
    rank: 7,
    name: '海马',
    level: 15,
    owner: '摸鱼小能手',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
  {
    key: '8',
    rank: 8,
    name: '水母',
    level: 14,
    owner: '摸鱼人生',
    avatar: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png',
  },
];

const PetPage: React.FC = () => {
  const [rankData] = useState(mockRankData);

  // 定义排行榜列
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (rank: number) => {
        if (rank === 1) {
          return <div className={styles.rankFirst}>{rank}</div>;
        } else if (rank === 2) {
          return <div className={styles.rankSecond}>{rank}</div>;
        } else if (rank === 3) {
          return <div className={styles.rankThird}>{rank}</div>;
        }
        return <div className={styles.rankNormal}>{rank}</div>;
      }
    },
    {
      title: '宠物',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div className={styles.petInfo}>
          <Avatar src={record.avatar} size={36} className={styles.petAvatar} />
          <div className={styles.petNameContainer}>
            <div className={styles.petName}>{name}</div>
            <div className={styles.petOwner}>{record.owner}</div>
          </div>
        </div>
      )
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => <div className={styles.levelBadge}>Lv.{level}</div>
    }
  ];

  // 渲染排行榜内容
  const renderRankingContent = () => {
    return (
      <div className={styles.comingSoonContainer}>
        <div className={styles.comingSoonIcon}>🏆</div>
        <div className={styles.comingSoonTitle}>排行榜功能即将上线</div>
        <div className={styles.comingSoonDesc}>敬请期待！</div>
      </div>
    );
  };

  return (
    <div className={styles.petPageContainer}>
      <Card className={styles.petTabsCard}>
        <Tabs
          defaultActiveKey="pet"
          items={[
            {
              key: 'pet',
              label: (
                <span>
                  <HomeOutlined /> 我的宠物
                </span>
              ),
              children: (
                <div className={styles.petComponentWrapper}>
                  <MoyuPet isPageComponent={true} />
                </div>
              ),
            },
            {
              key: 'ranking',
              label: (
                <span>
                  <BarChartOutlined /> 排行榜
                </span>
              ),
              children: renderRankingContent(),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PetPage;
