import React, { useState } from 'react';
import { Modal, Tabs, Button, Progress, Card, Avatar, Row, Col } from 'antd';
import {
  HeartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  GiftOutlined,
  ShoppingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import styles from './index.less';

export interface PetInfo {
  id: string;
  name: string;
  type: string;
  level: number;
  exp: number;
  maxExp: number;
  hunger: number;
  maxHunger: number;
  mood: number;
  maxMood: number;
  avatar: string;
  skills: PetSkill[];
  items: PetItem[];
  achievements: PetAchievement[];
}

interface PetSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  icon: string;
}

interface PetItem {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  type: 'food' | 'toy' | 'special';
}

interface PetAchievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  icon: string;
  progress: number;
  maxProgress: number;
}

interface MoyuPetProps {
  visible: boolean;
  onClose: () => void;
}

const MoyuPet: React.FC<MoyuPetProps> = ({ visible, onClose }) => {
  // 示例宠物数据
  const [pet, setPet] = useState<PetInfo>({
    id: '1',
    name: '小鱼儿',
    type: '鱼',
    level: 5,
    exp: 350,
    maxExp: 1000,
    hunger: 70,
    maxHunger: 100,
    mood: 85,
    maxMood: 100,
    avatar: 'https://api.oss.cqbo.com/moyu/pet%2F%E6%B4%BE%E8%92%99_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.png',
    skills: [
      {
        id: 's1',
        name: '摸鱼技能',
        description: '提高摸鱼效率10%',
        level: 3,
        icon: '🐟',
      },
      {
        id: 's2',
        name: '打工技能',
        description: '每小时额外获得5金币',
        level: 2,
        icon: '💰',
      },
    ],
    items: [
      {
        id: 'i1',
        name: '鱼饵',
        description: '恢复20点饥饿值',
        count: 5,
        icon: '🍞',
        type: 'food',
      },
      {
        id: 'i2',
        name: '玩具球',
        description: '提高15点心情值',
        count: 3,
        icon: '🎾',
        type: 'toy',
      },
    ],
    achievements: [
      {
        id: 'a1',
        name: '摸鱼达人',
        description: '累计摸鱼时间达到100小时',
        completed: false,
        icon: '🏆',
        progress: 65,
        maxProgress: 100,
      },
      {
        id: 'a2',
        name: '社交达人',
        description: '在聊天室发送1000条消息',
        completed: false,
        icon: '🎖️',
        progress: 580,
        maxProgress: 1000,
      },
    ],
  });

  // 模拟喂食
  const handleFeed = (itemId: string) => {
    const item = pet.items.find(i => i.id === itemId);
    if (item && item.count > 0 && item.type === 'food') {
      // 模拟更新状态
      setPet(prev => ({
        ...prev,
        hunger: Math.min(prev.hunger + 20, prev.maxHunger),
        items: prev.items.map(i =>
          i.id === itemId ? { ...i, count: i.count - 1 } : i
        )
      }));
    }
  };

  // 模拟玩耍
  const handlePlay = (itemId: string) => {
    const item = pet.items.find(i => i.id === itemId);
    if (item && item.count > 0 && item.type === 'toy') {
      // 模拟更新状态
      setPet(prev => ({
        ...prev,
        mood: Math.min(prev.mood + 15, prev.maxMood),
        items: prev.items.map(i =>
          i.id === itemId ? { ...i, count: i.count - 1 } : i
        )
      }));
    }
  };

  return (
    <Modal
      title={
        <div className={styles.petModalTitle}>
          <span className={styles.petIcon}>🐟</span>
          <span>我的摸鱼宠物</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className={styles.petModal}
    >
      <div className={styles.petContainer}>
        <div className={styles.petInfo}>
          <div className={styles.petAvatar}>
            <Avatar src={pet.avatar} size={100} />
          </div>
          <div className={styles.petDetails}>
            <div className={styles.petName}>
              <span className={styles.name}>{pet.name}</span>
              <span className={styles.level}>Lv.{pet.level}</span>
              <span className={styles.type}>{pet.type}</span>
            </div>
            <div className={styles.petStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <HeartOutlined /> 心情:
                </span>
                <Progress
                  percent={(pet.mood / pet.maxMood) * 100}
                  status="active"
                  strokeColor="#ff7875"
                  size="small"
                />
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <ThunderboltOutlined /> 饥饿:
                </span>
                <Progress
                  percent={(pet.hunger / pet.maxHunger) * 100}
                  status="active"
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <ExperimentOutlined /> 经验:
                </span>
                <Progress
                  percent={(pet.exp / pet.maxExp) * 100}
                  status="active"
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        <Tabs
          defaultActiveKey="items"
          items={[
            {
              key: 'items',
              label: (
                <span>
                  <GiftOutlined /> 物品
                </span>
              ),
              children: (
                <div className={styles.itemsContainer}>
                  <Row gutter={[16, 16]}>
                    {pet.items.map((item) => (
                      <Col span={8} key={item.id}>
                        <Card className={styles.itemCard}>
                          <div className={styles.itemIcon}>{item.icon}</div>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemCount}>数量: {item.count}</div>
                          <div className={styles.itemDesc}>{item.description}</div>
                          <div className={styles.itemActions}>
                            {item.type === 'food' && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleFeed(item.id)}
                                disabled={item.count <= 0}
                              >
                                喂食
                              </Button>
                            )}
                            {item.type === 'toy' && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handlePlay(item.id)}
                                disabled={item.count <= 0}
                              >
                                玩耍
                              </Button>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            },
            {
              key: 'skills',
              label: (
                <span>
                  <ThunderboltOutlined /> 技能
                </span>
              ),
              children: (
                <div className={styles.skillsContainer}>
                  <Row gutter={[16, 16]}>
                    {pet.skills.map((skill) => (
                      <Col span={12} key={skill.id}>
                        <Card className={styles.skillCard}>
                          <div className={styles.skillIcon}>{skill.icon}</div>
                          <div className={styles.skillInfo}>
                            <div className={styles.skillName}>
                              {skill.name} <span className={styles.skillLevel}>Lv.{skill.level}</span>
                            </div>
                            <div className={styles.skillDesc}>{skill.description}</div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            },
            {
              key: 'shop',
              label: (
                <span>
                  <ShoppingOutlined /> 商店
                </span>
              ),
              children: (
                <div className={styles.shopContainer}>
                  <div className={styles.shopEmpty}>
                    <div className={styles.emptyIcon}>🛒</div>
                    <div className={styles.emptyText}>商店即将开业，敬请期待！</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'achievements',
              label: (
                <span>
                  <TrophyOutlined /> 成就
                </span>
              ),
              children: (
                <div className={styles.achievementsContainer}>
                  {pet.achievements.map((achievement) => (
                    <Card key={achievement.id} className={styles.achievementCard}>
                      <div className={styles.achievementIcon}>{achievement.icon}</div>
                      <div className={styles.achievementInfo}>
                        <div className={styles.achievementName}>
                          {achievement.name}
                          {achievement.completed && <span className={styles.completedBadge}>已完成</span>}
                        </div>
                        <div className={styles.achievementDesc}>{achievement.description}</div>
                        <Progress
                          percent={(achievement.progress / achievement.maxProgress) * 100}
                          size="small"
                          status={achievement.completed ? "success" : "active"}
                        />
                        <div className={styles.achievementProgress}>
                          {achievement.progress}/{achievement.maxProgress}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default MoyuPet;
