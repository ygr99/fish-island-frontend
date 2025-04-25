import React from 'react';
import styles from './index.less';

interface ShortcutProps {
  icon: string;
  title: string;
  url: string;
  bgColor?: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, title, url, bgColor }) => {
  // 对iconClass进行处理
  const isFontAwesome = typeof icon === 'string' && icon.includes('fa-');

  return (
    <div className={styles.shortcut}>
      <div className={styles.iconWrapper}>
        {isFontAwesome ? (
          <div
            className={`${
              bgColor || 'bg-blue-500'
            } w-full h-full rounded-full flex items-center justify-center`}
          >
            <i className={`${icon} text-white text-xl`}></i>
          </div>
        ) : (
          <img src={icon} alt={title} className={styles.icon} />
        )}
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default Shortcut;
