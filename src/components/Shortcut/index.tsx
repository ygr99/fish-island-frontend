import React from 'react';
import styles from './index.less';

interface ShortcutProps {
  icon: string;
  title: string;
  url: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, title, url }) => {
  const handleClick = () => {
    window.open(url, '_blank');
  };

  return (
    <div className={styles.shortcut} onClick={handleClick}>
      <div className={styles.iconWrapper}>
        <img src={icon} alt={title} className={styles.icon} />
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default Shortcut;
