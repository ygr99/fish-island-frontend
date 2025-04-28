import { EnvironmentOutlined, EyeOutlined, SoundOutlined } from '@ant-design/icons';
import { Divider, Drawer, Slider, Space, Switch, Typography } from 'antd';
import React from 'react';
import styles from './SettingsPanel.less';

const { Text } = Typography;

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible, onClose }) => {
  return (
    <Drawer
      title="设置"
      placement="right"
      onClose={onClose}
      open={visible}
      width={300}
      className={styles.settingsDrawer}
    >
      <div className={styles.settingItem}>
        <Space>
          <SoundOutlined />
          <Text>旅行声音</Text>
        </Space>
        <Switch defaultChecked />
      </div>

      <div className={styles.settingItem}>
        <Space>
          <EyeOutlined />
          <Text>显示路线</Text>
        </Space>
        <Switch defaultChecked />
      </div>

      <div className={styles.settingItem}>
        <div style={{ width: '100%' }}>
          <Space>
            <EnvironmentOutlined />
            <Text>地图缩放</Text>
          </Space>
          <Slider defaultValue={30} className={styles.settingSlider} />
        </div>
      </div>

      <Divider />

      <div className={styles.settingSection}>
        <Text type="secondary" className={styles.sectionTitle}>
          提示信息
        </Text>
        <div className={styles.settingInfo}>这些设置都没有用</div>
      </div>
    </Drawer>
  );
};

export default SettingsPanel;
