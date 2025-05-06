import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  UploadProps,
} from 'antd';
import { FC, useEffect, useState } from 'react';
import { Icon, Sound, Theme } from '../themes/interface';
import {
  canvasToFile,
  createCanvasByImgSrc,
  CUSTOM_SYSTEM_THEMES_STORAGE_KEY,
  CUSTOM_THEME_STORAGE_KEY,
  getFileBase64String,
  linkReg,
  randomString,
  wrapThemeDefaultSounds,
} from '../utils';
import {uuid} from "@ant-design/charts-util";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CustomIcon extends Icon {
  content: string;
}

interface CustomTheme extends Theme<any> {
  id: string;
  icons: CustomIcon[];
}

const ConfigDialog: FC<{
  closeMethod: () => void;
  previewMethod: (theme: Theme<string>) => void;
  visible: boolean;
  addCustomSystemThemes: (theme: Theme<any>[]) => void;
}> = ({ closeMethod, previewMethod, visible, addCustomSystemThemes }) => {
  const [form] = Form.useForm();
  // 错误提示
  const [configError, setConfigError] = useState<string>('');

  // 主题大对象
  const [customTheme, setCustomTheme] = useState<CustomTheme>(
    JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) as string) || {
      id: uuid(),
      title: '',
      sounds: [],
      pure: false,
      icons: new Array(10).fill(0).map(() => ({
        name: randomString(4),
        content: '',
        clickSound: '',
        tripleSound: '',
      })),
    },
  );

  function updateCustomTheme(key: keyof CustomTheme, value: any) {
    if (['sounds', 'icons'].includes(key)) {
      if (Array.isArray(value)) {
        setCustomTheme({
          ...customTheme,
          [key]: [...value],
        });
      } else {
        setCustomTheme({
          ...customTheme,
          [key]: [...customTheme[key as 'sounds' | 'icons'], value],
        });
      }
    } else {
      setCustomTheme({
        ...customTheme,
        [key]: value,
      });
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
    } catch (e) {}
  }, [customTheme]);

  // 音效
  const [newSound, setNewSound] = useState<Sound>({ name: '', src: '' });
  const [soundError, setSoundError] = useState<string>('');

  const onNewSoundChange = (key: keyof Sound, value: string) => {
    setNewSound({
      ...newSound,
      [key]: value,
    });
  };

  const onAddNewSoundClick = () => {
    setSoundError('');
    let error = '';
    if (!linkReg.test(newSound.src)) error = '请输入https链接';
    if (!newSound.name) error = '请输入音效名称';
    if (customTheme.sounds.find((s) => s.name === newSound.name)) error = '名称已存在';
    if (error) {
      setSoundError(error);
      message.error(error);
    } else {
      updateCustomTheme('sounds', newSound);
      setNewSound({ name: '', src: '' });
      message.success('音效添加成功');
    }
  };

  const onDeleteSoundClick = (idx: number) => {
    const deleteSoundName = customTheme.sounds[idx].name;
    const findIconUseIdx = customTheme.icons.findIndex(({ clickSound, tripleSound }) =>
      [clickSound, tripleSound].includes(deleteSoundName),
    );
    if (findIconUseIdx !== -1) {
      const error = `第${findIconUseIdx + 1}项图标有使用该音效，请取消后再删除`;
      setSoundError(error);
      message.error(error);
      return;
    }

    const newSounds = customTheme.sounds.slice();
    newSounds.splice(idx, 1);
    updateCustomTheme('sounds', newSounds);
    message.success('音效删除成功');
  };

  // 本地文件选择
  const [bgmError] = useState<string>('');
  const [iconErrors, setIconErrors] = useState<string[]>(new Array(10).fill(''));

  const makeIconErrors = (idx: number, error: string) =>
    new Array(10).fill('').map((item, _idx) => (idx === _idx ? error : iconErrors[_idx]));

  const onFileChange: (props: {
    type: 'bgm' | 'background' | 'sound' | 'icon';
    file?: File;
    idx?: number;
  }) => void = async ({ type, file, idx }) => {
    if (!file) return;
    switch (type) {
      case 'icon':
        if (idx === undefined) return;
        setIconErrors(makeIconErrors(idx, ''));
        try {
          const _file = await canvasToFile({
            canvas: await createCanvasByImgSrc({ imgSrc: await getFileBase64String(file) }),
            maxFileSize: 4 * 1024,
          });
          const fileBase64 = await getFileBase64String(_file);
          updateCustomTheme(
            'icons',
            customTheme.icons.map((icon, _idx) =>
              _idx === idx ? { ...icon, content: fileBase64 } : icon,
            ),
          );
          message.success(`第${idx + 1}个图标上传成功`);
        } catch (e: any) {
          setIconErrors(makeIconErrors(idx, e));
          message.error(e);
        }
        break;
    }
  };

  // 图标更新
  const updateIcons = (key: keyof CustomIcon, value: string, idx: number) => {
    const newIcons = customTheme.icons.map((icon, _idx) =>
      _idx === idx
        ? {
            ...icon,
            [key]: value,
          }
        : icon,
    );
    updateCustomTheme('icons', newIcons);
  };

  // 初始化
  useEffect(() => {
    try {
      const configString = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (configString) {
        const parseRes = JSON.parse(configString);
        if (typeof parseRes === 'object') {
          setTimeout(() => {
            setCustomTheme(parseRes);
            form.setFieldsValue({
              title: parseRes.title,
              desc: parseRes.desc,
              maxLevel: parseRes.maxLevel,
              backgroundColor: parseRes.backgroundColor || '#ffffff',
            });
          }, 300);
        }
      }
    } catch (e) {}
  }, [form]);

  // 校验主题
  const validateTheme: () => Promise<string> = async () => {
    // 校验
    if (!customTheme.title) return Promise.reject('请输入标题');
    if (customTheme.bgm && !linkReg.test(customTheme.bgm))
      return Promise.reject('bgm请输入https链接');
    if (customTheme.background && !linkReg.test(customTheme.background))
      return Promise.reject('背景图请输入https链接');
    if (!customTheme.maxLevel || customTheme.maxLevel < 5)
      return Promise.reject('请输入大于5的关卡数');
    const findIconError = iconErrors.find((i) => !!i);
    if (findIconError) return Promise.reject(`图标素材有错误：${findIconError}`);
    const findUnfinishedIconIdx = customTheme.icons.findIndex((icon) => !icon.content);
    if (findUnfinishedIconIdx !== -1) {
      setIconErrors(makeIconErrors(findUnfinishedIconIdx, '请填写链接'));
      return Promise.reject(`第${findUnfinishedIconIdx + 1}图标素材未完成`);
    }

    return Promise.resolve('');
  };

  // 预览
  const onPreviewClick = () => {
    setConfigError('');
    validateTheme()
      .then(() => {
        const cloneTheme = JSON.parse(JSON.stringify(customTheme));
        wrapThemeDefaultSounds(cloneTheme);
        previewMethod(cloneTheme);
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
        closeMethod();
      })
      .catch((e) => {
        setConfigError(e);
        message.error(e);
      });
  };

  // 保存到系统
  const onSaveClick = () => {
    setConfigError('');
    validateTheme()
      .then(() => {
        customTheme.id = uuid()
        console.log(customTheme)
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
        // 自定义系统主题
        const customSystemThemes = JSON.parse(
          localStorage.getItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY) || '[]',
        );
        customSystemThemes.push(customTheme);
        localStorage.setItem(CUSTOM_SYSTEM_THEMES_STORAGE_KEY, JSON.stringify(customSystemThemes));

        addCustomSystemThemes([customTheme]);
        closeMethod();
      })
      .catch((e) => {
        setConfigError(e);
        message.error(e);
      });
  };

  // 彩蛋
  const [pureClickTime] = useState<number>(0);
  useEffect(() => {
    updateCustomTheme('pure', pureClickTime % 5 === 0 && pureClickTime !== 0);
  }, [pureClickTime]);

  // 上传按钮属性
  const uploadProps: UploadProps = {
    beforeUpload: () => {
      return false;
    },
    showUploadList: false,
  };

  return (
    <Modal
      title="自定义主题"
      open={visible}
      onCancel={closeMethod}
      footer={null}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      {configError && <Alert type="error" message={configError} style={{ marginBottom: 16 }} />}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: customTheme.title,
          desc: customTheme.desc,
          maxLevel: customTheme.maxLevel,
          backgroundColor: customTheme.backgroundColor || '#ffffff',
        }}
        onValuesChange={(changedValues) => {
          Object.entries(changedValues).forEach(([key, value]) => {
            updateCustomTheme(key as keyof CustomTheme, value);
          });
        }}
      >
        <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item label="描述" name="desc">
          <TextArea placeholder="请输入描述" autoSize={{ minRows: 2 }} />
        </Form.Item>

        <Divider orientation="center">BGM设置</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">推荐使用外链</Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            {bgmError && <Text type="danger">{bgmError}</Text>}
            <Input
              placeholder="输入https外链"
              value={customTheme.bgm || ''}
              onChange={(e) => updateCustomTheme('bgm', e.target.value)}
            />
            {customTheme.bgm && <audio src={customTheme.bgm} controls style={{ width: '100%' }} />}
          </Space>
        </Space>
        <Divider orientation="center">关卡设置</Divider>
        <Form.Item
          label="关卡数"
          name="maxLevel"
          rules={[
            { required: true, message: '请输入关卡数' },
            {
              type: 'number',
              min: 5,
              message: '关卡数至少为5',
            },
          ]}
        >
          <InputNumber min={5} style={{ width: '100%' }} placeholder="最低5关，最高...理论上无限" />
        </Form.Item>
        <Divider orientation="center">音效素材</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            {customTheme.sounds.map((sound, idx) => (
              <Col key={sound.name} span={8}>
                <Card
                  size="small"
                  title={sound.name}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteSoundClick(idx)}
                    />
                  }
                >
                  <audio src={sound.src} controls style={{ width: '100%' }} />
                </Card>
              </Col>
            ))}
          </Row>

          <Input
            placeholder="输入音效名称"
            value={newSound.name}
            onChange={(e) => onNewSoundChange('name', e.target.value)}
          />
          <Text type="secondary">推荐使用外链</Text>
          <Input
            placeholder="输入https外链"
            value={newSound.src}
            onChange={(e) => onNewSoundChange('src', e.target.value)}
          />
          {soundError && <Text type="danger">{soundError}</Text>}
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddNewSoundClick}>
            添加音效
          </Button>
        </Space>

        <Divider orientation="center">图标素材</Divider>
        <Text type="secondary">
          上传的图片将会被严重压缩，推荐使用方形图片，
          <strong style={{ color: '#f5222d' }}>图标 1 默认被用作系统主题图标背景</strong>
        </Text>

        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          {customTheme.icons.map((icon, idx) => (
            <Card key={icon.name} size="small" title={`图标 ${idx + 1}`}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={16} align="middle">
                  <Col span={4}>
                    {icon.content ? (
                      <img
                        alt=""
                        src={icon.content}
                        style={{ width: 60, height: 60, objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <InfoCircleOutlined />
                      </div>
                    )}
                  </Col>
                  <Col span={20}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Upload
                        {...uploadProps}
                        accept=".jpg,.png,.gif"
                        onChange={(info) => {
                          onFileChange({
                            type: 'icon',
                            // @ts-ignore
                            file: info.file,
                            idx,
                          });
                        }}
                      >
                        <Button icon={<UploadOutlined />}>上传图标</Button>
                      </Upload>
                      <Input
                        placeholder="或者输入https外链"
                        value={customTheme.icons[idx].content}
                        onBlur={(e) => {
                          setIconErrors(
                            makeIconErrors(
                              idx,
                              linkReg.test(e.target.value) ? '' : '请输入https外链',
                            ),
                          );
                        }}
                        onChange={(e) => updateIcons('content', e.target.value, idx)}
                      />
                      {iconErrors[idx] && <Text type="danger">{iconErrors[idx]}</Text>}
                    </Space>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="选择点击音效"
                      value={customTheme.icons[idx].clickSound}
                      onChange={(value) => updateIcons('clickSound', value, idx)}
                    >
                      <Option value="">默认点击音效</Option>
                      {customTheme.sounds.map((sound) => (
                        <Option key={sound.name} value={sound.name}>
                          {sound.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="选择三连音效"
                      value={customTheme.icons[idx].tripleSound}
                      onChange={(value) => updateIcons('tripleSound', value, idx)}
                    >
                      <Option value="">默认三连音效</Option>
                      {customTheme.sounds.map((sound) => (
                        <Option key={sound.name} value={sound.name}>
                          {sound.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Space>
            </Card>
          ))}
        </Space>

        <Divider />

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button type="primary" size={'large'} onClick={onPreviewClick}>
              预览
            </Button>
            <Button type="primary" size={'large'} onClick={onSaveClick}>
              保存到系统
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigDialog;
