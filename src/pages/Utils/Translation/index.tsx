import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Select, Row, Col, Tooltip, Typography, Space, Tabs, message, Radio, Modal, Form, Divider } from 'antd';
import { CopyOutlined, DeleteOutlined, SyncOutlined, SwapOutlined, FullscreenOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import './index.css';

const { TextArea } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;

// 卡片阴影样式
const cardStyle = {
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  marginBottom: '16px'
};

// 翻译网站配置
const systemTranslationServices = [
  {
    name: '百度翻译',
    baseUrl: 'https://fanyi.baidu.com/mtpe-individual/multimodal',
    logo: 'https://fanyi.baidu.com/favicon.ico',
    paramName: 'query', // 百度翻译使用 ?query=xxx
    isSystem: true,
  },
  {
    name: '腾讯翻译',
    baseUrl: 'https://fanyi.qq.com/',
    logo: 'https://fanyi.qq.com/favicon.ico',
    isSystem: true,
    // 腾讯翻译URL中看不到参数，无法通过URL传递
  },
  {
    name: '有道翻译',
    baseUrl: 'https://fanyi.youdao.com/#/TextTranslate',
    logo: 'https://fanyi.youdao.com/favicon.ico',
    isSystem: true,
    // 有道翻译使用hash，无法直接传递
  },
  {
    name: '搜狗翻译',
    baseUrl: 'https://fanyi.sogou.com/text',
    logo: 'https://fanyi.sogou.com/favicon.ico',
    paramName: 'keyword', // 搜狗翻译使用 ?keyword=xxx
    isSystem: true,
  },
  {
    name: '微软翻译',
    baseUrl: 'https://www.bing.com/translator',
    logo: 'https://www.bing.com/favicon.ico',
    isSystem: true,
    // 微软翻译URL中看不到参数，无法通过URL传递
  },
];

// 定义翻译服务类型
interface TranslationService {
  name: string;
  baseUrl: string;
  logo: string;
  paramName?: string;
  isSystem?: boolean;
}

const Translation: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    // 从localStorage获取上次使用的翻译服务
    const savedServices = localStorage.getItem('selectedTranslationServices');
    return savedServices ? JSON.parse(savedServices) : ['百度翻译', '有道翻译', '腾讯翻译', '搜狗翻译'];
  });
  
  // 自定义翻译服务状态
  const [customServices, setCustomServices] = useState<TranslationService[]>(() => {
    const savedCustomServices = localStorage.getItem('customTranslationServices');
    return savedCustomServices ? JSON.parse(savedCustomServices) : [];
  });
  
  // 合并系统和自定义翻译服务
  const [allTranslationServices, setAllTranslationServices] = useState<TranslationService[]>([
    ...systemTranslationServices,
    ...customServices
  ]);
  
  // 添加/编辑翻译服务的模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<TranslationService | null>(null);
  const [form] = Form.useForm();
  
  const [viewMode, setViewMode] = useState<'grid' | 'tabs'>('tabs'); // 默认为标签视图
  const [activeTabKey, setActiveTabKey] = useState<string>('0');
  const [hasAutoDetectedViewMode, setHasAutoDetectedViewMode] = useState<boolean>(false);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const [lastTranslatedText, setLastTranslatedText] = useState<string>('');
  const textAreaRef = useRef<any>(null); // 新增：添加一个ref用于TextArea
  const [isComposing, setIsComposing] = useState<boolean>(false); // 新增：跟踪是否正在进行中文输入
  const [focusLocked, setFocusLocked] = useState<boolean>(false); // 新增：防止在短时间内反复设置焦点
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false); // 新增：跟踪下拉选择框是否打开
  const [isInteractingWithControls, setIsInteractingWithControls] = useState<boolean>(false); // 新增：跟踪用户是否正在与控件交互

  // 在自定义翻译服务变化时更新所有翻译服务
  useEffect(() => {
    setAllTranslationServices([...systemTranslationServices, ...customServices]);
    // 保存到本地存储
    localStorage.setItem('customTranslationServices', JSON.stringify(customServices));
  }, [customServices]);

  // 安全地获取选定服务
  // 新增：创建一个安全的获取服务方法，避免类型错误
  const getSelectedService = (index: string | number): string | undefined => {
    const numIndex = typeof index === 'string' ? parseInt(index, 10) : index;
    return selectedServices[numIndex];
  };

  // 监听窗口大小变化，自动切换视图模式
  useEffect(() => {
    if (!hasAutoDetectedViewMode) {
      setHasAutoDetectedViewMode(true);
      return;
    }

    const handleResize = () => {
      // 保留响应式调整，但不会改变用户手动设置的视图模式
      if (window.innerWidth < 768) {
        setViewMode('tabs');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hasAutoDetectedViewMode]);

  // 构建翻译URL，根据不同的翻译服务添加适当的查询参数
  const getTranslationUrl = (service: typeof systemTranslationServices[0], textToTranslate: string): string => {
    if (!textToTranslate) return service.baseUrl;
    
    // 如果服务有定义参数名称，则添加对应的参数
    if (service.paramName) {
      const url = new URL(service.baseUrl);
      url.searchParams.set(service.paramName, textToTranslate);
      return url.toString();
    }
    
    // 对于不支持直接参数的服务，返回原始URL
    return service.baseUrl;
  };

  // 翻译文本变化处理
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // 新增：修改保持输入框焦点的函数，尊重中文输入过程
  const keepTextAreaFocus = () => {
    // 如果正在进行中文输入、焦点锁定中、下拉框打开或者正在与控件交互，则不干扰焦点
    if (isComposing || focusLocked || isSelectOpen || isInteractingWithControls) {
      return;
    }
    
    if (textAreaRef.current) {
      // 锁定焦点一段时间，防止频繁设置焦点
      setFocusLocked(true);
      setTimeout(() => {
        if (!isComposing && !isSelectOpen && !isInteractingWithControls) { // 再次检查状态
          textAreaRef.current?.focus();
        }
        // 解除焦点锁定
        setTimeout(() => setFocusLocked(false), 300);
      }, 100);
    }
  };

  // 新增：处理iframe点击事件，防止焦点丢失
  const handleIframeClick = () => {
    // 如果正在输入中文，不干扰输入过程
    if (!isComposing) {
      keepTextAreaFocus();
    }
  };

  // 新增：创建iframe包装元素，添加点击事件监听
  const createIframeWrapper = (iframe: JSX.Element): JSX.Element => {
    return (
      <div 
        className="iframe-wrapper" 
        onClick={handleIframeClick}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          cursor: 'default'
        }}
      >
        {iframe}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            pointerEvents: 'none', 
            border: '2px solid #1890ff',
            borderRadius: '4px',
            opacity: 0.1
          }} 
        />
      </div>
    );
  };

  // 应用翻译
  const applyTranslation = () => {
    if (!text) {
      message.warning('请先输入要翻译的文本');
      return;
    }
    
    if (text === lastTranslatedText) {
      message.info('文本未变更，无需重新翻译');
      return;
    }
    
    selectedServices.forEach(serviceName => {
      const service = systemTranslationServices.find(s => s.name === serviceName);
      if (!service) return;
      
      const iframe = iframeRefs.current[serviceName];
      if (iframe) {
        const translationUrl = getTranslationUrl(service, text);
        iframe.src = translationUrl;
      }
    });
    
    setLastTranslatedText(text);
    message.success('已应用翻译');
    keepTextAreaFocus(); // 确保翻译后焦点回到文本框
  };

  // 清空文本
  const handleClear = () => {
    setText('');
    setLastTranslatedText('');
    message.success('已清空文本');
    
    // 刷新所有iframe到原始URL
    selectedServices.forEach(serviceName => {
      const service = systemTranslationServices.find(s => s.name === serviceName);
      if (!service) return;
      
      const iframe = iframeRefs.current[serviceName];
      if (iframe) {
        iframe.src = service.baseUrl;
      }
    });
    
    keepTextAreaFocus(); // 新增：保持焦点
  };

  // 复制文本
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('文本已复制到剪贴板');
      },
      (err) => {
        message.error('无法复制文本');
        console.error('无法复制文本:', err);
      }
    );
  };

  // 处理服务选择变化
  const handleServiceChange = (values: string[]) => {
    // 至少选择一个翻译服务
    if (values.length === 0) {
      message.warning('请至少选择一个翻译服务');
      return;
    }
    
    setSelectedServices(values);
    // 保存选择到localStorage
    localStorage.setItem('selectedTranslationServices', JSON.stringify(values));
  };

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'tabs' : 'grid');
  };

  // 刷新特定翻译服务的iframe
  const refreshIframe = (serviceName: string) => {
    const service = systemTranslationServices.find(s => s.name === serviceName);
    if (!service) return;

    const iframe = iframeRefs.current[serviceName];
    if (iframe) {
      // 修改：仅当有 lastTranslatedText 时才显示翻译内容，否则显示基础页面
      const url = lastTranslatedText && service.paramName 
        ? getTranslationUrl(service, lastTranslatedText)
        : service.baseUrl;
      
      iframe.src = url;
      message.success(`已刷新${serviceName}`);
    }
    
    keepTextAreaFocus(); // 新增：保持焦点
  };

  // 刷新所有翻译服务的iframe
  const refreshAllIframes = () => {
    selectedServices.forEach(serviceName => {
      refreshIframe(serviceName);
    });
    message.success('已刷新所有翻译服务');
    keepTextAreaFocus(); // 新增：保持焦点
  };

  // 渲染翻译iframe (单行布局)
  const renderTranslationIframes = () => {
    return selectedServices.map(serviceName => {
      const service = systemTranslationServices.find(s => s.name === serviceName);
      if (!service) return null;

      // 修改：初始始终使用基础URL，不带翻译参数
      const initialUrl = service.baseUrl;

      const iframe = (
        <iframe
          title={serviceName}
          src={initialUrl}
          className="translation-iframe"
          ref={el => { iframeRefs.current[serviceName] = el; }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          tabIndex={-1}
          onLoad={() => keepTextAreaFocus()}
        />
      );

      return (
        <div key={serviceName} className="translation-iframe-box">
          <div className="translation-iframe-header">
            <div className="translation-iframe-title">
              <img 
                src={service.logo} 
                alt={`${serviceName} logo`} 
                style={{ width: 16, height: 16, marginRight: 8 }} 
              />
              {serviceName}
              {!service.paramName && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#ff4d4f' }}>
                  (不支持自动填充)
                </span>
              )}
            </div>
            <Space>
              {!service.paramName && (
                <Tooltip title="复制文本后手动粘贴到该翻译网站">
                  <Button 
                    type="link" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopy}
                  >
                    复制文本
                  </Button>
                </Tooltip>
              )}
              <Button 
                type="link" 
                icon={<SyncOutlined />} 
                onClick={() => refreshIframe(serviceName)}
              >
                刷新
              </Button>
            </Space>
          </div>
          <div className="translation-iframe-body">
            {createIframeWrapper(iframe)}
          </div>
        </div>
      );
    });
  };

  // 渲染标签页布局
  const renderTabs = () => {
    return (
      <Tabs 
        activeKey={activeTabKey}
        onChange={(key) => {
          setActiveTabKey(key);
          keepTextAreaFocus(); // 新增：切换标签时保持焦点
        }}
        tabBarExtraContent={
          <Space>
            {selectedServices.length > 0 && 
              getSelectedService(activeTabKey) && 
              !systemTranslationServices.find(s => 
                s.name === getSelectedService(activeTabKey))?.paramName && (
              <Tooltip title="复制文本后手动粘贴到该翻译网站">
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={handleCopy}
                >
                  复制文本
                </Button>
              </Tooltip>
            )}
            <Button 
              icon={<SyncOutlined />} 
              onClick={() => {
                const currentService = getSelectedService(activeTabKey);
                if (currentService) {
                  refreshIframe(currentService);
                }
              }}
            >
              刷新当前
            </Button>
          </Space>
        }
        style={{ padding: '0 16px' }} // 添加水平内边距
        tabBarStyle={{ margin: '8px 0' }} // 为标签栏添加上下间距
      >
        {selectedServices.map((serviceName, index) => {
          const service = systemTranslationServices.find(s => s.name === serviceName);
          if (!service) return null;

          // 修改：初始始终使用基础URL，不带翻译参数
          const initialUrl = service.baseUrl;

          const iframe = (
            <iframe
              title={serviceName}
              src={initialUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              ref={el => { iframeRefs.current[serviceName] = el; }}
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              tabIndex={-1}
              onLoad={() => keepTextAreaFocus()}
            />
          );

          return (
            <TabPane 
              tab={
                <span>
                  <img 
                    src={service.logo} 
                    alt={`${serviceName} logo`} 
                    style={{ width: 16, height: 16, marginRight: 4 }} 
                  />
                  {serviceName}
                  {!service.paramName && (
                    <span style={{ marginLeft: 4, fontSize: 12, color: '#ff4d4f' }}>
                      *
                    </span>
                  )}
                </span>
              } 
              key={String(index)}
            >
              <div style={{ height: 'calc(100vh - 300px)', padding: '0 8px 8px 8px' }}>
                {createIframeWrapper(iframe)}
              </div>
            </TabPane>
          );
        })}
      </Tabs>
    );
  };

  // 在组件挂载时和窗口事件上添加焦点保持
  useEffect(() => {
    // 焦点管理 - 降低频率到2秒一次，减少对用户输入的干扰
    const focusInterval = setInterval(() => {
      // 如果文档的活动元素不是文本框，且不在控件交互状态，尝试恢复焦点
      if (document.activeElement !== textAreaRef.current && 
          !isComposing && 
          !isSelectOpen && 
          !isInteractingWithControls) {
        keepTextAreaFocus();
      }
    }, 2000); // 将检查间隔从500ms延长到2000ms
    
    // 当用户点击页面任何地方时，尝试保持焦点，但避免干扰中文输入
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 检查是否点击的是控件（select、button等）或其容器
      const isControlElement = 
        target.closest('.ant-select') || 
        target.closest('.ant-btn') || 
        target.closest('.ant-radio-group') ||
        target.closest('.iframe-wrapper');
      
      // 如果点击的是控件，标记为正在与控件交互
      if (isControlElement) {
        setIsInteractingWithControls(true);
        // 3秒后重置交互状态
        setTimeout(() => {
          setIsInteractingWithControls(false);
        }, 3000);
        return;
      }
      
      // 非控件点击且非中文输入状态，恢复焦点
      if (!isComposing && !isSelectOpen) {
        keepTextAreaFocus();
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      clearInterval(focusInterval);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isComposing, isSelectOpen, isInteractingWithControls]); // 添加依赖项

  // 添加/编辑翻译服务模态框
  const showAddServiceModal = () => {
    setIsInteractingWithControls(true);
    setIsModalVisible(true);
    form.resetFields();
  };

  const showEditServiceModal = (service: TranslationService) => {
    setIsInteractingWithControls(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: service.name,
      baseUrl: service.baseUrl,
      logo: service.logo,
      paramName: service.paramName,
    });
    setEditingService(service);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingService) {
        // 编辑服务
        const updatedServices = customServices.map(service =>
          service.name === editingService.name ? values : service
        );
        setCustomServices(updatedServices);
        setEditingService(null);
      } else {
        // 添加新服务
        setCustomServices([...customServices, values as TranslationService]);
      }
      setIsModalVisible(false);
      setIsInteractingWithControls(false);
    }).catch(error => {
      console.error('表单验证失败:', error);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsInteractingWithControls(false);
  };

  const handleDeleteService = (serviceName: string) => {
    setIsInteractingWithControls(true);
    const updatedServices = customServices.filter(service => service.name !== serviceName);
    setCustomServices(updatedServices);
    setIsInteractingWithControls(false);
  };

  return (
    <div className="translation-container">
      <Card className="translation-header" style={cardStyle}>
        <Title level={4}>聚合翻译</Title>
        <p>在一个界面同时使用多个翻译服务，方便对比不同翻译结果</p>
      </Card>

      <div className="translation-main">
        <Card style={cardStyle}>
          <div className="translation-input-container">
            <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
              <Col xs={24} md={16}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="选择翻译服务"
                  value={selectedServices}
                  onChange={handleServiceChange}
                  optionLabelProp="label"
                  onDropdownVisibleChange={(open) => {
                    setIsSelectOpen(open);
                    // 下拉框关闭后延迟一段时间再允许焦点回到文本框
                    if (!open) {
                      setTimeout(() => {
                        setIsSelectOpen(false);
                      }, 500);
                    }
                  }}
                  onClick={() => {
                    // 点击下拉框时标记正在与控件交互
                    setIsInteractingWithControls(true);
                  }}
                  dropdownRender={menu => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div style={{ padding: '8px', textAlign: 'left' }}>
                        <Button 
                          type="text" 
                          icon={<PlusOutlined />} 
                          onClick={() => {
                            setIsInteractingWithControls(true);
                            showAddServiceModal();
                          }}
                          block
                        >
                          添加自定义翻译服务
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {allTranslationServices.map(service => (
                    <Select.Option key={service.name} value={service.name} label={service.name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src={service.logo} 
                            alt={`${service.name} logo`} 
                            style={{ width: 16, height: 16, marginRight: 8 }} 
                          />
                          {service.name}
                          {!service.paramName && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: '#ff4d4f' }}>
                              (不支持自动填充)
                            </span>
                          )}
                        </div>
                        {!service.isSystem && (
                          <div style={{ marginLeft: 8 }}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsInteractingWithControls(true);
                                showEditServiceModal(service);
                              }}
                              style={{ marginRight: 4 }}
                            />
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsInteractingWithControls(true);
                                handleDeleteService(service.name);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Radio.Group 
                    value={viewMode} 
                    onChange={(e) => {
                      setViewMode(e.target.value);
                      // 标记正在交互，禁止焦点自动返回
                      setIsInteractingWithControls(true);
                      setTimeout(() => {
                        setIsInteractingWithControls(false);
                        keepTextAreaFocus();
                      }, 500);
                    }}
                    optionType="button" 
                    buttonStyle="solid"
                  >
                    <Radio.Button value="grid">网格视图</Radio.Button>
                    <Radio.Button value="tabs">标签视图</Radio.Button>
                  </Radio.Group>
                  <Button 
                    icon={<SyncOutlined />} 
                    onClick={() => {
                      setIsInteractingWithControls(true);
                      refreshAllIframes();
                      setTimeout(() => {
                        setIsInteractingWithControls(false);
                      }, 500);
                    }}
                    title="刷新所有"
                  />
                </Space>
              </Col>
            </Row>
            
            <TextArea
              className="translation-textarea"
              value={text}
              onChange={handleTextChange}
              placeholder="请输入要翻译的文本，完成输入后按Enter键或点击「应用翻译」按钮进行翻译"
              autoSize={{ minRows: 3, maxRows: 10 }}
              ref={textAreaRef}
              autoFocus={true}
              // 添加中文输入法事件处理
              onCompositionStart={() => setIsComposing(true)}
              onCompositionUpdate={() => setIsComposing(true)}
              onCompositionEnd={() => {
                setIsComposing(false);
                // 中文输入完成后确保焦点在文本框上
                setTimeout(() => keepTextAreaFocus(), 50);
              }}
              onBlur={(e) => {
                // 只有在非中文输入状态下才尝试保持焦点
                if (!isComposing) {
                  // 不立即执行，给其他事件处理一个机会
                  setTimeout(() => keepTextAreaFocus(), 100);
                }
              }}
              onPressEnter={(e) => {
                if (!e.shiftKey && !isComposing) {
                  e.preventDefault();
                  applyTranslation();
                }
              }}
            />
            
            <Row justify="end" style={{ marginTop: 8 }}>
              <Space>
                <Button type="primary" onClick={applyTranslation}>
                  应用翻译
                </Button>
                <Tooltip title="复制文本">
                  <Button icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
                </Tooltip>
                <Tooltip title="清空文本">
                  <Button icon={<DeleteOutlined />} onClick={handleClear}>清空</Button>
                </Tooltip>
              </Space>
            </Row>
            
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              <p>
                注意：带<span style={{ color: '#ff4d4f' }}>*</span>标记的翻译服务不支持通过URL参数自动填充文本，请复制文本后手动粘贴到对应翻译网站。
                输入完成后按Enter键或点击「应用翻译」按钮进行翻译。
              </p>
            </div>
          </div>
        </Card>

        <Card bodyStyle={{ padding: 12, flex: 1, display: 'flex', overflow: 'hidden' }} style={cardStyle}>
          {viewMode === 'grid' ? (
            <div className="translation-iframe-container" style={{ padding: '8px' }}>
              {renderTranslationIframes()}
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {renderTabs()}
            </div>
          )}
        </Card>
      </div>

      {/* 添加/编辑翻译服务模态框 */}
      <Modal
        title={editingService ? '编辑翻译服务' : '添加翻译服务'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        okText={editingService ? '保存' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          name="serviceForm"
        >
          <Form.Item
            name="name"
            label="翻译服务名称"
            rules={[{ required: true, message: '请输入翻译服务名称' }]}
          >
            <Input placeholder="例如：Google翻译" />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label="翻译服务网址"
            rules={[
              { required: true, message: '请输入翻译服务网址' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="例如：https://translate.google.com/" />
          </Form.Item>
          <Form.Item
            name="logo"
            label="图标URL"
            tooltip="可选，如不填写将使用默认图标"
          >
            <Input placeholder="例如：https://translate.google.com/favicon.ico" />
          </Form.Item>
          <Form.Item
            name="paramName"
            label="查询参数名称"
            tooltip="可选，如果翻译服务支持通过URL参数传递文本，请填写参数名"
          >
            <Input placeholder="例如：text (网址会变成 ?text=翻译内容)" />
          </Form.Item>
          <div style={{ fontSize: 12, color: '#888' }}>
            <p>填写查询参数可以实现自动填充翻译文本，无需手动复制粘贴。</p>
            <p>如果不确定参数名称，可以在该翻译网站手动输入内容后，观察URL中的参数。</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Translation; 