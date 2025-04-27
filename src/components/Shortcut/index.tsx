import React from 'react';
import styles from './index.less';

interface ShortcutProps {
  icon: string;
  title: string;
  url: string;
  bgColor?: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, title, url, bgColor = 'bg-blue-500' }) => {
  // 增强判断是否为URL图标的逻辑
  const isUrlIcon =
    icon &&
    (icon.startsWith('http') ||
      icon.startsWith('/') ||
      icon.startsWith('./') ||
      icon.includes('.png') ||
      icon.includes('.jpg') ||
      icon.includes('.jpeg') ||
      icon.includes('.svg') ||
      icon.includes('.ico'));

  // 是否是FontAwesome图标的判断 - 通常以fa-开头
  const isFontAwesomeIcon = icon && icon.includes('fa-');

  // console.log('Shortcut渲染:', { title, icon, bgColor, isUrlIcon, isFontAwesomeIcon });

  return (
    <div className={styles.shortcut}>
      <div className={styles.iconWrapper}>
        {isUrlIcon ? (
          <img src={icon} alt={title} className={styles.icon} />
        ) : isFontAwesomeIcon ? (
          <div className={`${bgColor} rounded-md w-full h-full flex items-center justify-center`}>
            <i className={`${icon} text-white text-xl`}></i>
          </div>
        ) : (
          // 默认情况: 既不是URL也不是FA图标，显示默认图标
          <div className={`${bgColor} rounded-md w-full h-full flex items-center justify-center`}>
            <i className="fa-solid fa-puzzle-piece text-white text-xl"></i>
          </div>
        )}
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default Shortcut;
