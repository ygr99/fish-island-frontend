import React, { useEffect, useState } from 'react';
import { Modal, Checkbox, Button } from 'antd';
import styles from './index.less';

interface AnnouncementModalProps {
  title?: string;
  content?: string;
  visible?: boolean;
  onClose?: () => void;
  storageKey?: string;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  title = '系统公告',
  content = '🎉 欢迎使用摸鱼岛！\n\n' +
    '💡 小贴士：\n' +
    '✅  使用 Ctrl + Shift + B 可以快速打开老板键，摸鱼更安全！\n' +
    '✅  使用 Ctrl + Shift + B 打开老板页面后再 Ctrl + Shift + S 打开设置页面自定义老板页面喔！\n' +
    '✅  左下角老板键还支持自定义快捷键和页面跳转喔\n' +
    '🌟 支持我们：\n' +
    '✅ 如果觉得摸鱼岛不错，欢迎给我们的项目点个 Star：\n' +
    '   https://github.com/lhccong/fish-island-frontend \n\n' +
    '🤝 参与贡献：\n' +
    '✅ 如果你想对本项目数据源进行贡献，欢迎在后端项目提交 PR：\n' +
    '   https://github.com/lhccong/fish-island-backend',
  visible = true,
  onClose,
  storageKey = 'announcement_visible',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // 先检查是否已经设置过不再显示
    const shouldShow = localStorage.getItem(storageKey) !== 'false';
    // 只有当应该显示时才设置visible为true
    if (shouldShow && visible) {
      setIsVisible(true);
    }
  }, [visible, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'false');
    }
    onClose?.();
  };

  const processContent = (text: string) => {
    // 将换行符转换为 <br> 标签
    let processedText = text.replace(/\n/g, '<br>');

    // 将 URL 转换为可点击的链接
    processedText = processedText.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    return processedText;
  };

  return (
    <Modal
      title={title}
      open={isVisible}
      onOk={handleClose}
      onCancel={handleClose}
      footer={[
        <div key="footer" className={styles.footer}>
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className={styles.checkbox}
          >
            不再显示
          </Checkbox>
          <Button type="primary" onClick={handleClose}>
            我知道了
          </Button>
        </div>,
      ]}
      className={styles.announcementModal}
    >
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: processContent(content) }}
      />
    </Modal>
  );
};

export default AnnouncementModal;
