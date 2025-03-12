import React, { useState } from 'react';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import classNames from 'classnames';
import styles from './Announcement.less';

interface AnnouncementProps {
  announcements: {
    title: string;
    content: string;
    date: string;
  }[];
}

const Announcement: React.FC<AnnouncementProps> = ({ announcements = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={classNames(styles.announcementContainer, {
        [styles.collapsed]: isCollapsed,
      })}
    >
      <div className={styles.toggleButton} onClick={toggleCollapse}>
        {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
      </div>
      <Card
        className={styles.announcementCard}
        title="更新公告"
        bordered={false}
      >
        {announcements.map((announcement, index) => (
          <div key={index} className={styles.announcementItem}>
            <h3>{announcement.title}</h3>
            <p>{announcement.content}</p>
            <span className={styles.date}>{announcement.date}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Announcement; 