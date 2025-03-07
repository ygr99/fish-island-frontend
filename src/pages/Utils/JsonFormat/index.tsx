import React, {useState, useEffect, ChangeEvent} from "react"
import dynamic from "next/dynamic"
import {
  Layout,
  Typography,
  Input,
  Button,
  Space,
  Divider,
  message,
  Tabs,
  Tooltip,
  Switch,
  Card,
  Select,
  Radio,
  Drawer,
  theme,
  RadioChangeEvent,
} from "antd"
import {
  FormatPainterOutlined,
  CompressOutlined,
  CopyOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  DeleteOutlined,
  SwapOutlined,
  SettingOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
} from "@ant-design/icons"
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import {vscDarkPlus, vs} from "react-syntax-highlighter/dist/esm/styles/prism"
import YAML from "yaml"
import "./index.css"


// 动态导入 JsonViewer 组件，避免服务端渲染问题
const JsonViewer = dynamic(() => import("@textea/json-viewer").then(mod => mod.JsonViewer), {
  ssr: false,
  loading: () => <div style={{padding: "16px"}}>加载中...</div>,
})

const {Header, Content} = Layout
const {Title, Text, Paragraph} = Typography
const {TextArea} = Input
const {TabPane} = Tabs

const JsonFormat: React.FC = () => {
  const {token} = theme.useToken()
  const [inputJson, setInputJson] = useState("")
  const [outputJson, setOutputJson] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("tree")
  const [indentSize, setIndentSize] = useState(2)
  const [collapseLevel, setCollapseLevel] = useState(1)
  const [messageApi, contextHolder] = message.useMessage()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [, setJsonTheme] = useState("rjv-default")
  const [autoFormat, setAutoFormat] = useState(true)
  const [isBrowser, setIsBrowser] = useState(false)

  // 检测是否在浏览器环境
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // 格式化JSON
  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setErrorMsg("请输入JSON数据 🙏")
        setOutputJson("")
        setParsedJson(null)
        return
      }

      let parsed;
      try {
        // 尝试解析输入的JSON字符串
        if (typeof inputJson === 'string') {
          parsed = JSON.parse(inputJson.trim());
        } else {
          parsed = inputJson;
        }
      } catch (e) {
        // 如果解析失败，尝试执行 eval
        try {
          // 使用 Function 构造器来安全地执行字符串
          parsed = new Function('return ' + inputJson)();
        } catch (evalError) {
          throw new Error('无效的 JSON 格式');
        }
      }

      setParsedJson(parsed)
      const formattedJson = JSON.stringify(parsed, null, indentSize)
      setOutputJson(formattedJson)
      setErrorMsg("")
      messageApi.success("格式化成功 🎉")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setErrorMsg(`JSON解析错误: ${errorMessage} 😕`)
      setOutputJson("")
      setParsedJson(null)
    }
  }

  // 压缩JSON
  const compressJson = () => {
    try {
      if (!inputJson.trim()) {
        setErrorMsg("请输入JSON数据 🙏")
        setOutputJson("")
        setParsedJson(null)
        return
      }

      const parsed = JSON.parse(inputJson)
      setParsedJson(parsed)
      const compressedJson = JSON.stringify(parsed)
      setOutputJson(compressedJson)
      setErrorMsg("")
      messageApi.success("压缩成功 🚀")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setErrorMsg(`JSON解析错误: ${errorMessage} 😕`)
      setOutputJson("")
      setParsedJson(null)
    }
  }

  // 验证JSON
  const validateJson = () => {
    try {
      if (!inputJson.trim()) {
        setErrorMsg("请输入JSON数据 🙏")
        return
      }

      JSON.parse(inputJson)
      setErrorMsg("")
      messageApi.success("JSON有效 ✅")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setErrorMsg(`JSON无效: ${errorMessage} ❌`)
    }
  }

  // 转换为YAML
  const convertToYaml = () => {
    try {
      if (!inputJson.trim()) {
        setErrorMsg("请输入JSON数据 🙏")
        setOutputJson("")
        return
      }

      const parsed = JSON.parse(inputJson)
      setParsedJson(parsed)
      const yamlString = YAML.stringify(parsed)
      setOutputJson(yamlString)
      setErrorMsg("")
      messageApi.success("转换为YAML成功 🔄")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setErrorMsg(`转换错误: ${errorMessage} 😕`)
      setOutputJson("")
      setParsedJson(null)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (!isBrowser) return

    if (!outputJson && !parsedJson) {
      messageApi.warning("没有内容可复制 📋")
      return
    }

    const contentToCopy = activeTab === "tree" ? JSON.stringify(parsedJson, null, indentSize) : outputJson

    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        messageApi.success("已复制到剪贴板 📋")
      })
      .catch(() => {
        messageApi.error("复制失败，请手动复制 ❌")
      })
  }

  // 下载JSON
  const downloadJson = () => {
    if (!isBrowser) return

    if (!outputJson && !parsedJson) {
      messageApi.warning("没有内容可下载 💾")
      return
    }

    const contentToDownload = activeTab === "tree" ? JSON.stringify(parsedJson, null, indentSize) : outputJson

    try {
      const blob = new Blob([contentToDownload], {type: "application/json"})
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "formatted-json.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      messageApi.success("下载成功 💾")
    } catch (error) {
      messageApi.error("下载失败 ❌")
    }
  }

  // 上传JSON文件
  const uploadJson = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isBrowser || !e.target.files?.length) return

    const fileReader = new FileReader()
    fileReader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const result = event.target?.result
        if (typeof result === 'string') {
          setInputJson(result)
          messageApi.success("文件上传成功 📤")
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        setErrorMsg(`文件读取错误: ${errorMessage} 😕`)
      }
    }
    fileReader.readAsText(e.target.files[0])
  }

  // 清空输入
  const clearInput = () => {
    setInputJson("")
    setOutputJson("")
    setParsedJson(null)
    setErrorMsg("")
    messageApi.info("已清空 🧹")
  }

  // 交换输入和输出
  const swapInputOutput = () => {
    if (!outputJson && !parsedJson) {
      messageApi.warning("没有输出内容可交换 🔄")
      return
    }

    const contentToSwap = activeTab === "tree" ? JSON.stringify(parsedJson, null, indentSize) : outputJson

    setInputJson(contentToSwap)
    messageApi.success("已交换输入和输出 🔄")
  }

  // 处理缩进大小变化
  const handleIndentChange = (value: number) => {
    setIndentSize(value)
    if (parsedJson && (activeTab === "formatted" || activeTab === "tree")) {
      setOutputJson(JSON.stringify(parsedJson, null, value))
    }
  }

  // 处理折叠层级变化
  const handleCollapseLevelChange = (e: RadioChangeEvent) => {
    const newLevel = e.target.value;
    setCollapseLevel(newLevel);
  }

  // 展开所有节点
  const expandAll = () => {
    setCollapseLevel(Infinity);
    messageApi.success("已展开所有节点 📂")
  }

  // 折叠到指定层级
  const collapseToLevel = (level: number) => {
    setCollapseLevel(level);
    if (parsedJson && typeof parsedJson === 'object') {
      // 强制重新渲染JsonViewer
      setParsedJson({...parsedJson});
    }
    messageApi.success(`已折叠到第 ${level} 层 📁`)
  }

  // 切换暗黑模式
  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked)
    setJsonTheme(checked ? "monokai" : "rjv-default")
  }

  // 当输入变化时自动尝试格式化
  useEffect(() => {
    if (inputJson && autoFormat) {
      try {
        let parsed;
        try {
          // 尝试解析输入的JSON字符串
          if (typeof inputJson === 'string') {
            parsed = JSON.parse(inputJson.trim());
          } else {
            parsed = inputJson;
          }
        } catch (e) {
          // 如果解析失败，尝试执行 eval
          try {
            // 使用 Function 构造器来安全地执行字符串
            parsed = new Function('return ' + inputJson)();
          } catch (evalError) {
            // 自动格式化时不显示错误
            return;
          }
        }

        setParsedJson(parsed)

        if (activeTab === "formatted" || activeTab === "tree") {
          setOutputJson(JSON.stringify(parsed, null, indentSize))
        } else if (activeTab === "compressed") {
          setOutputJson(JSON.stringify(parsed))
        } else if (activeTab === "yaml") {
          setOutputJson(YAML.stringify(parsed))
        }
        setErrorMsg("")
      } catch (error) {
        // 不显示错误，等待用户完成输入
        setParsedJson(null)
      }
    } else if (!inputJson) {
      setParsedJson(null)
      setOutputJson("")
    }
  }, [inputJson, activeTab, indentSize, autoFormat])

  // 示例JSON数据
  const loadSampleJson = () => {
    const sampleJson = {
      name: "JSON格式化工具",
      version: "1.0.0",
      description: "一个美观的JSON格式化工具",
      features: ["格式化", "压缩", "验证", "转换为YAML"],
      settings: {
        theme: "light/dark",
        indentation: 2,
        collapseLevel: 1,
      },
      performance: {
        speed: "fast",
        memory: "efficient",
      },
      author: {
        name: "开发者",
        website: "https://example.com",
      },
    }
    setInputJson(JSON.stringify(sampleJson, null, 2))
    messageApi.success("已加载示例JSON 📝")
  }

  return (
    <Layout className={isDarkMode ? "dark" : ""} style={{minHeight: "100vh"}}>
      {contextHolder}
      <Header
        style={{
          background: isDarkMode ? "#1f1f1f" : token.colorBgContainer,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
        }}
      >
        <div style={{display: "flex", alignItems: "center"}}>
          <FormatPainterOutlined style={{fontSize: "24px", marginRight: "12px", color: token.colorPrimary}}/>
          <Title level={3} style={{margin: 0, color: isDarkMode ? "#fff" : token.colorText}}>
            JSON格式化工具
          </Title>
        </div>
        <Space>
          <Tooltip title="设置">
            <Button icon={<SettingOutlined/>} onClick={() => setSettingsOpen(true)} type="text" size="large"/>
          </Tooltip>
          <Tooltip title="暗黑模式">
            <Switch checked={isDarkMode} onChange={toggleDarkMode} checkedChildren="🌙" unCheckedChildren="☀️"/>
          </Tooltip>
        </Space>
      </Header>

      <Content style={{padding: "24px", background: isDarkMode ? "#121212" : token.colorBgLayout}}>
        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            background: isDarkMode ? "#1f1f1f" : token.colorBgContainer,
            marginBottom: "24px",
          }}
        >
          <Space direction="vertical" size="large" style={{width: "100%"}}>
            <div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "16px"}}>
                <Space wrap>
                  <Tooltip title="格式化JSON">
                    <Button type="primary" icon={<FormatPainterOutlined/>} onClick={formatJson}>
                      格式化 🎨
                    </Button>
                  </Tooltip>
                  <Tooltip title="压缩JSON">
                    <Button icon={<CompressOutlined/>} onClick={compressJson}>
                      压缩 🗜️
                    </Button>
                  </Tooltip>
                  <Tooltip title="验证JSON">
                    <Button icon={<FileSearchOutlined/>} onClick={validateJson}>
                      验证 🔍
                    </Button>
                  </Tooltip>
                  <Tooltip title="转换为YAML">
                    <Button icon={<SwapOutlined/>} onClick={convertToYaml}>
                      转YAML 📝
                    </Button>
                  </Tooltip>
                </Space>
                <Space wrap>
                  <Tooltip title="加载示例">
                    <Button onClick={loadSampleJson}>示例 📋</Button>
                  </Tooltip>
                  <Tooltip title="清空">
                    <Button danger icon={<DeleteOutlined/>} onClick={clearInput}>
                      清空 🧹
                    </Button>
                  </Tooltip>
                  <Tooltip title="交换输入输出">
                    <Button icon={<SwapOutlined/>} onClick={swapInputOutput}>
                      交换 🔄
                    </Button>
                  </Tooltip>
                  <Tooltip title="上传JSON文件">
                    <Button icon={<UploadOutlined/>}>
                      上传 📤
                      <input
                        type="file"
                        accept=".json"
                        onChange={uploadJson}
                        style={{
                          opacity: 0,
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          cursor: "pointer",
                        }}
                      />
                    </Button>
                  </Tooltip>
                </Space>
              </div>

              <TextArea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder="在此粘贴您的JSON数据... 📋"
                autoSize={{minRows: 8, maxRows: 12}}
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  background: isDarkMode ? "#2d2d2d" : token.colorBgContainer,
                  color: isDarkMode ? "#e0e0e0" : token.colorText,
                  borderColor: errorMsg ? token.colorError : undefined,
                }}
              />

              {errorMsg && (
                <Text type="danger" style={{display: "block", marginTop: "8px"}}>
                  {errorMsg}
                </Text>
              )}
            </div>

            <Divider style={{margin: "12px 0"}}/>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{marginBottom: "8px"}}>
                  <TabPane tab="树视图 🌲" key="tree"/>
                  <TabPane tab="格式化 🎨" key="formatted"/>
                  <TabPane tab="压缩 🗜️" key="compressed"/>
                  <TabPane tab="YAML 📝" key="yaml"/>
                </Tabs>
                <Space wrap>
                  {activeTab === "tree" && (
                    <>
                      <Radio.Group
                        value={collapseLevel}
                        onChange={handleCollapseLevelChange}
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Tooltip title="只显示第1层">
                          <Radio.Button value={1}>1层</Radio.Button>
                        </Tooltip>
                        <Tooltip title="显示到第2层">
                          <Radio.Button value={2}>2层</Radio.Button>
                        </Tooltip>
                        <Tooltip title="显示到第3层">
                          <Radio.Button value={3}>3层</Radio.Button>
                        </Tooltip>
                      </Radio.Group>
                      <Tooltip title="展开所有">
                        <Button icon={<ExpandAltOutlined/>} onClick={expandAll}/>
                      </Tooltip>
                      <Tooltip title="全部折叠">
                        <Button icon={<ShrinkOutlined/>} onClick={() => collapseToLevel(1)}/>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="复制到剪贴板">
                    <Button icon={<CopyOutlined/>} onClick={copyToClipboard}>
                      复制 📋
                    </Button>
                  </Tooltip>
                  <Tooltip title="下载JSON">
                    <Button icon={<DownloadOutlined/>} onClick={downloadJson}>
                      下载 💾
                    </Button>
                  </Tooltip>
                </Space>
              </div>

              <div style={{position: "relative", minHeight: "300px"}}>
                {activeTab === "tree" && parsedJson && isBrowser ? (
                  <div
                    style={{
                      background: isDarkMode ? "#2d2d2d" : "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                      minHeight: "300px",
                      maxHeight: "500px",
                      overflow: "auto",
                    }}
                  >
                    <JsonViewer
                      key={`json-viewer-${collapseLevel}`}
                      value={parsedJson}
                      theme={isDarkMode ? "dark" : "light"}
                      rootName={false}
                      defaultInspectDepth={collapseLevel}
                      enableClipboard={false}
                      displayDataTypes={false}
                      quotesOnKeys={false}
                      indentWidth={indentSize}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "14px",
                        background: "transparent",
                      }}
                      highlightUpdates={true}
                    />
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language={activeTab === "yaml" ? "yaml" : "json"}
                    style={isDarkMode ? vscDarkPlus : vs}
                    customStyle={{
                      margin: 0,
                      borderRadius: "4px",
                      minHeight: "300px",
                      maxHeight: "500px",
                    }}
                  >
                    {outputJson || "// 格式化后的结果将显示在这里 ✨"}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          </Space>
        </Card>

      </Content>

      {isBrowser && (
        <Drawer title="设置 ⚙️" placement="right" onClose={() => setSettingsOpen(false)} open={settingsOpen}
                width={360}>
          <Space direction="vertical" size="large" style={{width: "100%"}}>
            <div>
              <Title level={5}>外观</Title>
              <Space direction="vertical" style={{width: "100%"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Text>暗黑模式</Text>
                  <Switch checked={isDarkMode} onChange={toggleDarkMode} checkedChildren="开" unCheckedChildren="关"/>
                </div>
              </Space>
            </div>

            <div>
              <Title level={5}>格式化选项</Title>
              <Space direction="vertical" style={{width: "100%"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Text>缩进大小</Text>
                  <Select
                    value={indentSize}
                    style={{width: 120}}
                    onChange={handleIndentChange}
                    options={[
                      {value: 2, label: "2空格"},
                      {value: 4, label: "4空格"},
                      {value: 8, label: "8空格"},
                    ]}
                  />
                </div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Text>自动格式化</Text>
                  <Switch checked={autoFormat} onChange={setAutoFormat} checkedChildren="开" unCheckedChildren="关"/>
                </div>
              </Space>
            </div>

            <div>
              <Title level={5}>树视图选项</Title>
              <Space direction="vertical" style={{width: "100%"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Text>默认折叠层级</Text>
                  <Radio.Group value={collapseLevel} onChange={handleCollapseLevelChange}>
                    <Radio.Button value={1}>1</Radio.Button>
                    <Radio.Button value={2}>2</Radio.Button>
                    <Radio.Button value={3}>3</Radio.Button>
                    <Radio.Button value={0}>全部</Radio.Button>
                  </Radio.Group>
                </div>
              </Space>
            </div>

            <div>
              <Title level={5}>关于</Title>
              <Paragraph>
                JSON格式化工具 v1.0.0
                <br/>
                一个美观、高效的JSON处理工具
              </Paragraph>
            </div>
          </Space>
        </Drawer>
      )}
    </Layout>
  );
};
export default JsonFormat;
