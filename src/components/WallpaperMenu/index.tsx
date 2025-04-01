import React from 'react';
import { Menu, Upload } from 'antd';
import type { MenuProps } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';

interface WallpaperMenuProps {
  onWallpaperChange: (wallpaper: string) => void;
}

const WallpaperMenu: React.FC<WallpaperMenuProps> = ({ onWallpaperChange }) => {
  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onWallpaperChange(e.target.result as string);
        // 保存到 localStorage
        localStorage.setItem('wallpaper', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'default',
      icon: <PictureOutlined />,
      label: '恢复默认壁纸',
      onClick: () => {
        onWallpaperChange('/img/defaultWallpaper.webp');
        localStorage.removeItem('wallpaper');
      }
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: (
        <Upload
          showUploadList={false}
          accept="image/*"
          beforeUpload={handleUpload}
        >
          上传图片
        </Upload>
      ),
    }
  ];

  return <Menu items={menuItems} />;
};

export default WallpaperMenu; 