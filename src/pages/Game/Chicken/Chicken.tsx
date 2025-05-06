import { ExclamationCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { Alert, Button, message, Modal, Tooltip, Upload } from 'antd';
import React, { FC, useState } from 'react';
import './Chicken.css';
import Game from './components/Game';
import { Title } from './components/Title';
import { ikunTheme } from './themes/ikun';
import { Theme } from './themes/interface';
import { jinlunTheme } from './themes/jinlun';
import { pddTheme } from './themes/pdd';
import {
  CUSTOM_SYSTEM_THEMES_STORAGE_KEY,
  domRelatedOptForTheme,
  LAST_LEVEL_STORAGE_KEY,
  LAST_SCORE_STORAGE_KEY,
  LAST_TIME_STORAGE_KEY,
  PLAYING_THEME_ID_STORAGE_KEY,
  resetScoreStorage,
  wrapThemeDefaultSounds,
} from './utils';

const { Dragger } = Upload;
const { confirm } = Modal;

const ThemeChanger = React.lazy(() => import('./components/ThemeChanger'));
const ConfigDialog = React.lazy(() => import('./components/ConfigDialog'));
const Chicken: FC<{ theme?: Theme<any> }> = () => {
  const [theme, setTheme] = useState<Theme<any>>(ikunTheme);
  const [diyDialogShow, setDiyDialogShow] = useState<boolean>(false);
  const [bgmOn, setBgmOn] = useState<boolean>(false);
  const [clickBgmOn, setClickBgmOn] = useState<boolean>(false);

  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const [builtinThemes, setBuiltinThemes] = useState<Theme<any>[]>([
    jinlunTheme,
    pddTheme,
    ikunTheme,
    ...JSON.parse(localStorage.getItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY) || '[]'),
  ]);

  // 读取缓存关卡得分
  const [initLevel, setInitLevel] = useState<number>(
    Number(localStorage.getItem(LAST_LEVEL_STORAGE_KEY) || '1'),
  );
  const [initScore, setInitScore] = useState<number>(
    Number(localStorage.getItem(LAST_SCORE_STORAGE_KEY) || '0'),
  );
  const [initTime, setInitTime] = useState<number>(
    Number(localStorage.getItem(LAST_TIME_STORAGE_KEY) || '0'),
  );

  // 改变主题
  const changeTheme = (theme: Theme<any>) => {
    localStorage.setItem(PLAYING_THEME_ID_STORAGE_KEY, theme.title);
    setInitLevel(1);
    setInitScore(0);
    setInitTime(0);
    resetScoreStorage();
    wrapThemeDefaultSounds(theme);
    domRelatedOptForTheme(theme);
    setTheme({ ...theme });
  };

  // 添加自定义主题
  const addCustomSystemThemes = (customThemes: Theme<any>[]) => {
    setBuiltinThemes([...builtinThemes, ...customThemes]);
  };

  // 删除自定义主题
  const deleteTheme = (themeToDelete: Theme<any>) => {
    // 系统内置主题不允许删除
    if (themeToDelete.isSystemTheme) {
      message.error('系统内置主题不允许删除');
      return;
    }

    // 从builtin主题中移除
    const updatedThemes = builtinThemes.filter((theme) => theme.id !== themeToDelete.id);
    setBuiltinThemes(updatedThemes);

    // 从本地存储中移除
    const customSystemThemes = JSON.parse(
      localStorage.getItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY) || '[]',
    );
    const updatedCustomThemes = customSystemThemes.filter(
      (theme: Theme<any>) => theme.id !== themeToDelete.id,
    );
    localStorage.setItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY, JSON.stringify(updatedCustomThemes));

    // 如果当前主题被删除，切换到默认主题
    if (theme.id === themeToDelete.id) {
      changeTheme(ikunTheme);
    }

    message.success(`主题 "${themeToDelete.title}" 已删除`);
  };

  // 预览主题
  const previewTheme = (_theme: Theme<any>) => {
    const theme = JSON.parse(JSON.stringify(_theme));
    wrapThemeDefaultSounds(theme);
    domRelatedOptForTheme(theme);
    setTheme(theme);
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;

        if (!content) {
          setErrorMessage('无法读取文件内容');
          setLoading(false);
          return;
        }

        // 导入配置
        console.log('导入配置', content);

        const customThemes = JSON.parse(content);

        // 从本地存储中移除
        const customSystemThemes = JSON.parse(
          localStorage.getItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY) || '[]',
        );

        customSystemThemes.push(...customThemes);

        addCustomSystemThemes(customThemes);

        localStorage.setItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY, JSON.stringify(customSystemThemes));

        setShowImportModal(false);
        setLoading(false);
      };

      reader.onerror = () => {
        setErrorMessage('读取文件失败');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('处理文件失败', error);
      setErrorMessage('处理文件失败');
      setLoading(false);
    }

    return false;
  };

  /**
   * 下载配置文件
   */
  const downloadConfigFile = () => {
    const customSystemThemesStr = localStorage.getItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY) || '[]';
    const blob = new Blob([customSystemThemesStr], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    link.href = url;
    link.download = `🐔鸡了个鸡🐔-自定义系统主题配置_${dateString}.json`;
    link.click();

    // 清理URL对象
    URL.revokeObjectURL(url);
  };

  // 处理导出配置
  const handleExportConfig = () => {
    confirm({
      title: '导出配置',
      icon: <ExclamationCircleOutlined />,
      content: '确定要导出自定义系统主题配置吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        downloadConfigFile();
        message.success('自定义系统主题配置文件已开始下载');
      },
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: handleFileUpload,
    showUploadList: false,
    maxCount: 1,
  };

  return (
    <div className="game-chicken-container">
      {theme?.background && (
        <img
          alt="background"
          src={theme.background}
          className="game-chicken-background"
          style={{
            filter: theme.backgroundBlur ? 'blur(8px)' : 'none',
          }}
        />
      )}
      <div className="game-chicken-content">
        <Title title={theme.title} desc={theme.desc} />
        <div className="game-chicken-wrapper">
          <div className="game-controls-header">
            <Tooltip title={'开启/关闭背景音乐'}>
              {
                // eslint-disable-next-line react/button-has-type
                <button className="bgm-button" onClick={() => setBgmOn(!bgmOn)}>
                  {bgmOn ? '🎵' : '🔕'}
                </button>
              }
            </Tooltip>
            <Tooltip title={'开启/关闭点击音效'}>
              {
                // eslint-disable-next-line react/button-has-type
                <button className="bgm-button" onClick={() => setClickBgmOn(!clickBgmOn)}>
                  {clickBgmOn ? '🔊' : '🔈'}
                </button>
              }
            </Tooltip>
            <Tooltip title={'自定义主题'}>
              {
                // eslint-disable-next-line react/button-has-type
                <button className="setting-button" onClick={() => setDiyDialogShow(!diyDialogShow)}>
                  {diyDialogShow ? '🧐' : '🤡'}
                </button>
              }
            </Tooltip>
            <Tooltip title={'导出自定义系统主题'}>
              {
                // eslint-disable-next-line react/button-has-type
                <button className="setting-button" onClick={handleExportConfig}>
                  ⬆️
                </button>
              }
            </Tooltip>
            <Tooltip title={'导入自定义系统主题'}>
              {
                // eslint-disable-next-line react/button-has-type
                <button className="setting-button" onClick={() => setShowImportModal(true)}>
                  ⬇️
                </button>
              }
            </Tooltip>
            {!theme.pure && (
              <React.Suspense fallback={<div>加载中...</div>}>
                <ThemeChanger
                  changeTheme={changeTheme}
                  onDiyClick={() => setDiyDialogShow(true)}
                  builtinThemes={builtinThemes}
                  onDeleteTheme={deleteTheme}
                />
              </React.Suspense>
            )}
            <React.Suspense fallback={<span>Loading</span>}>
              <ConfigDialog
                closeMethod={() => setDiyDialogShow(false)}
                previewMethod={previewTheme}
                visible={diyDialogShow}
                addCustomSystemThemes={addCustomSystemThemes}
              />
            </React.Suspense>
          </div>
          <Game
            key={theme.title}
            theme={theme}
            initLevel={initLevel}
            initScore={initScore}
            initTime={initTime}
            initBgmOn={bgmOn}
            initClickBgmOn={clickBgmOn}
          />
        </div>
      </div>
      <Modal
        title="导入主题"
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowImportModal(false)}>
            取消
          </Button>,
        ]}
        width={500}
        centered
      >
        {errorMessage && (
          <Alert
            message="导入失败"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Dragger {...uploadProps} disabled={loading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">仅支持上传 JSON 格式的自定义系统主题配置文件</p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default Chicken;
