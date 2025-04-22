import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Input,
  Button,
  Space,
  Divider,
  message,
  Select,
  Card,
  Tooltip,
  Tabs,
  Modal,
  Form,
  Popover,
  List,
  theme,
  Switch,
} from 'antd';
import {
  CopyOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  UndoOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './index.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// 卡片阴影样式
const cardStyle = {
  width: '100%',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  marginBottom: '16px'
};

// 定义类型
type EmojiItem = {
  name: string;
  emoji: string;
  description?: string;
  pinyin?: string;
};

type CommitType = {
  value: string;
  label: string;
  emoji?: string;
};

// 默认的提交类型
const defaultTypes: CommitType[] = [
  { value: 'feat', label: '新功能(feat)', emoji: '✨' },
  { value: 'fix', label: '修复bug(fix)', emoji: '🐛' },
  { value: 'docs', label: '文档变更(docs)', emoji: '📝' },
  { value: 'style', label: '代码格式(style)', emoji: '🎨' },
  { value: 'refactor', label: '重构(refactor)', emoji: '♻️' },
  { value: 'perf', label: '性能优化(perf)', emoji: '⚡️' },
  { value: 'test', label: '增加或者更新测试(test)', emoji: '✅' },
  { value: 'build', label: '构建系统或者外部依赖更改(build)', emoji: '🛠️' },
  { value: 'ci', label: 'CI配置或者脚本变动(ci)', emoji: '👷' },
  { value: 'chore', label: '不影响代码的其余变动(chore)', emoji: '📦' },
  { value: 'revert', label: '回退(revert)', emoji: '⏪' },
];

// 默认的emoji选项
const defaultEmojis: EmojiItem[] = [
  { name: 'sparkles', emoji: '✨', description: '引入新的特性' },
  { name: 'art', emoji: '🎨', description: '结构改进 / 格式化代码' },
  { name: 'zap', emoji: '⚡', description: '性能改善' },
  { name: 'fire', emoji: '🔥', description: '删除代码或者文件' },
  { name: 'bug', emoji: '🐛', description: '修了一个BUG' },
  { name: 'ambulance', emoji: '🚑', description: '重大热修复' },
  { name: 'memo', emoji: '📝', description: '添加或更新文档' },
  { name: 'rocket', emoji: '🚀', description: '部署相关' },
  { name: 'lipstick', emoji: '💄', description: '更新界面与样式文件' },
  { name: 'tada', emoji: '🎉', description: '创世提交' },
  { name: 'white_check_mark', emoji: '✅', description: '更新测试' },
  { name: 'lock', emoji: '🔒', description: '修复安全问题' },
  { name: 'bookmark', emoji: '🔖', description: '发布 / 版本标签' },
  { name: 'rotating_light', emoji: '🚨', description: '消除 linter 警告' },
  { name: 'construction', emoji: '🚧', description: '进行中' },
  { name: 'green_heart', emoji: '💚', description: '修复持续集成构建' },
  { name: 'arrow_down', emoji: '⬇️', description: '降级依赖' },
  { name: 'arrow_up', emoji: '⬆️', description: '升级依赖' },
  { name: 'pushpin', emoji: '📌', description: '固定依赖在特定的版本' },
  { name: 'construction_worker', emoji: '👷', description: '添加持续集成构建系统' },
  { name: 'chart_with_upwards_trend', emoji: '📈', description: '添加分析或者跟踪代码' },
  { name: 'recycle', emoji: '♻️', description: '代码重构' },
  { name: 'heavy_plus_sign', emoji: '➕', description: '添加依赖' },
  { name: 'heavy_minus_sign', emoji: '➖', description: '删除依赖' },
  { name: 'wrench', emoji: '🔧', description: '改变配置文件' },
  { name: 'globe_with_meridians', emoji: '🌐', description: '国际化与本地化' },
  { name: 'pencil2', emoji: '✏️', description: '修正拼写错误' },
  { name: 'poop', emoji: '💩', description: '写需要改进的坏代码' },
  { name: 'rewind', emoji: '⏪', description: '回滚改动' },
  { name: 'twisted_rightwards_arrows', emoji: '🔀', description: '合并分支' },
  { name: 'package', emoji: '📦', description: '更新编译后的文件或者包' },
  { name: 'alien', emoji: '👽', description: '由于外部API变动而更新代码' },
  { name: 'truck', emoji: '🚚', description: '文件移动或者重命名' },
  { name: 'page_facing_up', emoji: '📄', description: '添加或者更新许可' },
  { name: 'boom', emoji: '💥', description: '引入破坏性的改动' },
  { name: 'bento', emoji: '🍱', description: '添加或者更新静态资源' },
  { name: 'wheelchair', emoji: '♿', description: '改进可访问性' },
  { name: 'bulb', emoji: '💡', description: '给源代码加文档' },
  { name: 'beers', emoji: '🍻', description: '醉写代码' },
  { name: 'speech_balloon', emoji: '💬', description: '更新文本和字面' },
  { name: 'card_file_box', emoji: '🗃️', description: '执行数据库相关的改动' },
  { name: 'loud_sound', emoji: '🔊', description: '添加日志' },
  { name: 'mute', emoji: '🔇', description: '删除日志' },
  { name: 'busts_in_silhouette', emoji: '👥', description: '添加贡献者（们）' },
  { name: 'children_crossing', emoji: '🚸', description: '改进用户体验 / 可用性' },
  { name: 'building_construction', emoji: '🏗️', description: '架构改动' },
  { name: 'iphone', emoji: '📱', description: '响应性设计相关' },
  { name: 'clown_face', emoji: '🤡', description: '模拟相关' },
  { name: 'egg', emoji: '🥚', description: '添加一个彩蛋' },
  { name: 'see_no_evil', emoji: '🙈', description: '添加或者更新 .gitignore 文件' },
  { name: 'camera_flash', emoji: '📸', description: '添加或者更新快照' },
  { name: 'alembic', emoji: '⚗️', description: '研究新事物' },
  { name: 'hammer_and_wrench', emoji: '🛠️', description: '构建系统更改' },
  { name: 'mag', emoji: '🔍', description: '改进搜索引擎优化' },
  { name: 'label', emoji: '🏷️', description: '添加或者更新类型（Flow, TypeScirpt）' },
  { name: 'closed_lock_with_key', emoji: '🔐', description: '添加或更新机密' },
  { name: 'hammer', emoji: '🔨', description: '添加或更新开发脚本' },
  { name: 'seedling', emoji: '🌱', description: '添加或更新种子文件' },
  { name: 'triangular_flag_on_post', emoji: '🚩', description: '添加、更新或删除功能标志' },
  { name: 'goal_net', emoji: '🥅', description: '捕获错误' },
  { name: 'dizzy', emoji: '💫', description: '添加或更新动画和过渡' },
  { name: 'wastebasket', emoji: '🗑️', description: '弃用需要清理的代码' },
  { name: 'passport_control', emoji: '🛂', description: '编写与授权、角色和权限相关的代码' },
  { name: 'adhesive_bandage', emoji: '🩹', description: '针对非关键文件的简单修复' },
  { name: 'monocle_face', emoji: '🧐', description: '数据探索/检查' },
  { name: 'coffin', emoji: '⚰️', description: '删除死代码' },
  { name: 'test_tube', emoji: '🧪', description: '添加一个失败测试' },
  { name: 'necktie', emoji: '👔', description: '添加或更新业务逻辑' },
  { name: 'stethoscope', emoji: '🩺', description: '添加或更新运行状况检查' },
  { name: 'bricks', emoji: '🧱', description: '与基础设施相关的更改' },
  { name: 'technologist', emoji: '🧑‍💻', description: '改善开发人员体验' },
  { name: 'money_with_wings', emoji: '💸', description: '添加赞助或与资金相关的基础设施' },
  { name: 'thread', emoji: '🧵', description: '添加或更新与多线程或并发相关的代码' },
  { name: 'safety_vest', emoji: '🦺', description: '添加或更新与验证相关的代码' },
];

const GitCommit: React.FC = () => {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  
  // 表单状态
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('');
  const [emoji, setEmoji] = useState<EmojiItem>(() => {
    // 默认选中第一个emoji
    return defaultEmojis.length > 0 ? 
      { 
        name: defaultEmojis[0].name, 
        emoji: defaultEmojis[0].emoji,
        description: defaultEmojis[0].description,
        pinyin: defaultEmojis[0].pinyin
      } : 
      { name: '', emoji: '' };
  });
  const [description, setDescription] = useState('');
  const [detailContent, setDetailContent] = useState(''); // 详细内容
  const [result, setResult] = useState('');

  // 设置状态
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [customMsgText, setCustomMsgText] = useState('');
  const [customEmojiText, setCustomEmojiText] = useState('');
  const [useEmoji, setUseEmoji] = useState(true); // 是否在提交信息中包含emoji
  const [useCodeEmoji, setUseCodeEmoji] = useState(false); // 是否使用代码形式的emoji，如:bug:
  
  // 自定义配置
  const [commitTypes, setCommitTypes] = useState(defaultTypes);
  const [emojiList, setEmojiList] = useState(defaultEmojis);
  
  // 搜索
  const [emojiSearchText, setEmojiSearchText] = useState('');
  
  // 历史记录
  const [history, setHistory] = useState<string[]>(() => {
    // 从localStorage获取历史记录
    const savedHistory = localStorage.getItem('gitcommit_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // 加载设置
  useEffect(() => {
    // 从本地存储加载设置
    const savedUseEmoji = localStorage.getItem('gitcommit_useEmoji');
    const savedUseCodeEmoji = localStorage.getItem('gitcommit_useCodeEmoji');
    
    if (savedUseEmoji !== null) {
      setUseEmoji(savedUseEmoji === 'true');
    }
    
    if (savedUseCodeEmoji !== null) {
      setUseCodeEmoji(savedUseCodeEmoji === 'true');
    }
  }, []);

  // 保存设置
  useEffect(() => {
    localStorage.setItem('gitcommit_useEmoji', String(useEmoji));
    localStorage.setItem('gitcommit_useCodeEmoji', String(useCodeEmoji));
  }, [useEmoji, useCodeEmoji]);
  
  // 保存历史记录
  useEffect(() => {
    localStorage.setItem('gitcommit_history', JSON.stringify(history));
  }, [history]);

  // 生成结果
  useEffect(() => {
    generateResult();
  }, [type, scope, emoji, description, useEmoji, useCodeEmoji, detailContent]);

  // 生成提交信息
  const generateResult = () => {
    let message = '';
    
    if (type) {
      message += type;
      
      if (scope) {
        message += `(${scope})`;
      }
      
      message += ': ';
    }
    
    if (useEmoji && emoji.emoji) {
      if (useCodeEmoji && emoji.name) {
        message += `:${emoji.name}: `;
      } else {
        message += `${emoji.emoji} `;
      }
    }
    
    message += description;
    
    // 如果有详细内容，添加两个换行后附加
    if (detailContent) {
      message += `\n\n${detailContent}`;
    }
    
    setResult(message);
  };

  // 复制结果
  const copyResult = () => {
    if (!result) {
      messageApi.warning('没有内容可复制');
      return;
    }
    
    if (!description) {
      messageApi.error('请填写简短描述');
      return;
    }
    
    navigator.clipboard
      .writeText(result)
      .then(() => {
        messageApi.success('已复制到剪贴板');
        
        // 添加到历史记录
        if (result && !history.includes(result)) {
          const newHistory = [result, ...history];
          if (newHistory.length > 5) newHistory.pop(); // 限制历史记录最多5条
          setHistory(newHistory);
        }
      })
      .catch(() => {
        messageApi.error('复制失败，请手动复制');
      });
  };

  // 重置表单
  const resetForm = () => {
    setType('feat');
    setScope('');
    // 重置为第一个emoji
    if (defaultEmojis.length > 0) {
      const firstEmoji = defaultEmojis[0];
      const newEmoji: EmojiItem = {
        name: firstEmoji.name,
        emoji: firstEmoji.emoji
      };
      
      if (firstEmoji.description) {
        newEmoji.description = firstEmoji.description;
      }
      
      if (firstEmoji.pinyin) {
        newEmoji.pinyin = firstEmoji.pinyin;
      }
      
      setEmoji(newEmoji);
    } else {
      setEmoji({ name: '', emoji: '' });
    }
    setDescription('');
    setDetailContent(''); // 清空详细内容
    messageApi.success('已重置表单');
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('gitcommit_history');
    messageApi.success('已清空历史记录');
  };

  // 删除单条历史记录
  const deleteHistoryItem = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    messageApi.success('已删除该条历史记录');
  };

  // 处理自定义消息提交
  const handleCustomMsgSubmit = () => {
    try {
      if (!customMsgText.trim()) {
        messageApi.warning('请输入自定义消息配置');
        return;
      }
      
      const customMsg = JSON.parse(customMsgText);
      
      if (!Array.isArray(customMsg)) {
        messageApi.error('请输入有效的JSON数组');
        return;
      }
      
      // 验证格式
      for (const item of customMsg) {
        if (!item.value || !item.label) {
          messageApi.error('每个对象必须包含value和label字段');
          return;
        }
      }
      
      // 合并自定义消息与默认消息
      const newTypes = [...defaultTypes];
      
      customMsg.forEach(item => {
        const index = newTypes.findIndex(t => t.value === item.value);
        if (index !== -1) {
          newTypes[index] = item;
        } else {
          newTypes.push(item);
        }
      });
      
      setCommitTypes(newTypes);
      messageApi.success('自定义消息已更新');
      
      // 自动更新当前选择的emoji
      const currentType = newTypes.find(t => t.value === type);
      if (currentType && currentType.emoji) {
        const matchingEmoji = emojiList.find(e => e.emoji === currentType.emoji);
        if (matchingEmoji) {
          const newEmoji: EmojiItem = {
            name: matchingEmoji.name,
            emoji: matchingEmoji.emoji
          };
          
          if (matchingEmoji.description) {
            newEmoji.description = matchingEmoji.description;
          }
          
          if (matchingEmoji.pinyin) {
            newEmoji.pinyin = matchingEmoji.pinyin;
          }
          
          setEmoji(newEmoji);
        }
      }
    } catch (error) {
      messageApi.error('JSON解析错误，请检查格式');
    }
  };

  // 清空自定义消息
  const clearCustomMsg = () => {
    setCustomMsgText('');
    setCommitTypes(defaultTypes);
    messageApi.success('已重置为默认提交类型');
  };

  // 处理自定义emoji提交
  const handleCustomEmojiSubmit = () => {
    try {
      if (!customEmojiText.trim()) {
        messageApi.warning('请输入自定义emoji配置');
        return;
      }
      
      const customEmoji = JSON.parse(customEmojiText);
      
      if (!Array.isArray(customEmoji)) {
        messageApi.error('请输入有效的JSON数组');
        return;
      }
      
      // 验证格式
      for (const item of customEmoji) {
        if (!item.name) {
          messageApi.error('每个对象必须包含name字段');
          return;
        }
      }
      
      // 合并自定义emoji与默认emoji
      const newEmojiList = [...defaultEmojis];
      
      customEmoji.forEach(item => {
        const index = newEmojiList.findIndex(e => e.name === item.name);
        if (index !== -1) {
          // 保留原有字段，合并新字段
          newEmojiList[index] = { ...newEmojiList[index], ...item };
        } else if (item.emoji) { // 只有提供了emoji的新项才添加
          newEmojiList.push(item);
        }
      });
      
      setEmojiList(newEmojiList);
      messageApi.success('自定义emoji已更新');
    } catch (error) {
      messageApi.error('JSON解析错误，请检查格式');
    }
  };

  // 清空自定义emoji
  const clearCustomEmoji = () => {
    setCustomEmojiText('');
    setEmojiList(defaultEmojis);
    // 重置为第一个emoji
    if (defaultEmojis.length > 0) {
      const firstEmoji = defaultEmojis[0];
      const newEmoji: EmojiItem = {
        name: firstEmoji.name,
        emoji: firstEmoji.emoji
      };
      
      if (firstEmoji.description) {
        newEmoji.description = firstEmoji.description;
      }
      
      if (firstEmoji.pinyin) {
        newEmoji.pinyin = firstEmoji.pinyin;
      }
      
      setEmoji(newEmoji);
    }
    messageApi.success('已重置为默认emoji');
  };

  // 搜索emoji
  const filteredEmojis = emojiSearchText
    ? emojiList.filter(item => {
        const searchLower = emojiSearchText.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          (item.emoji && item.emoji.includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.pinyin && item.pinyin.toLowerCase().includes(searchLower)) ||
          (item.pinyin && searchLower.split('').every(char => 
            item.pinyin?.toLowerCase().includes(char)
          ))
        );
      })
    : emojiList;

  // 从历史记录设置内容
  const setFromHistory = (historyItem: string) => {
    // 简单解析历史记录项
    const typeMatch = historyItem.match(/^([^(:]*)(?:\(([^)]*)\))?:/);
    if (typeMatch) {
      const historyType = typeMatch[1].trim();
      const historyScope = typeMatch[2] || '';
      
      // 设置类型
      setType(historyType);
      setScope(historyScope);
      
      // 尝试提取emoji和描述
      const afterColon = historyItem.substring(historyItem.indexOf(':') + 1).trim();
      
      // 检查是否有emoji (简单假设emoji是单个字符)
      const hasEmoji = /^\s*(\p{Emoji}|[\u{1F300}-\u{1F6FF}])/u.test(afterColon);
      
      if (hasEmoji) {
        const emojiChar = afterColon.match(/^\s*(\p{Emoji}|[\u{1F300}-\u{1F6FF}])/u)?.[1] || '';
        const emojiObj = emojiList.find(e => e.emoji === emojiChar);
        if (emojiObj) {
          const newEmoji: EmojiItem = {
            name: emojiObj.name,
            emoji: emojiObj.emoji
          };
          
          if (emojiObj.description) {
            newEmoji.description = emojiObj.description;
          }
          
          if (emojiObj.pinyin) {
            newEmoji.pinyin = emojiObj.pinyin;
          }
          
          setEmoji(newEmoji);
        } else {
          setEmoji({ name: '', emoji: emojiChar });
        }
        
        // 描述是emoji后的内容
        setDescription(afterColon.replace(/^\s*(\p{Emoji}|[\u{1F300}-\u{1F6FF}])/u, '').trim());
      } else {
        // 没有emoji，整个内容是描述
        setEmoji({ name: '', emoji: '' });
        setDescription(afterColon);
      }
    }
  };

  // 帮助内容
  const helpContent = (
    <div style={{ maxWidth: '600px', padding: '8px 0' }}>
      <Paragraph>
        历史记录最多保存5条历史，单击复制信息内容，双击将对应信息内容设置到表单，方便二次编辑
      </Paragraph>
      
      <Title level={5}>【gitemoji关键字】—— 快速搜索，可用于仅需要相关emoji表情：</Title>
      <Paragraph>
        在该关键字下可直接使用英文或中文（首字母）搜索emoji
        选中emoji后按下回车可以快速复制
      </Paragraph>
      
      <Title level={5}>【自定义commit message】—— 更改已有或添加自己的message：</Title>
      <Paragraph>
        请填入JSON数组格式的文本，数组中的每个元素都为对象，每个对象都是一个msg所需信息，格式大概是message(范围描述), 每个对象包含以下三个键： <br/>
        <ul>
            <li>value(必填)：消息的内容</li>
            <li>label(必填)：该value的描述</li>
            <li> emoji(可省略)：这个将会与下方emoji选项对应。例如这里填写了🐛，下方的emoji选项将会自动选中 🐛:bug: 项</li>
        </ul>
        以上的三个键的值都能作为搜索条件哦~
      </Paragraph>
      
      <Paragraph>
        以下是示例代码。第一和第二个为完整的自定义消息；第三个对象仅有必填项
        <pre style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px', color: '#333', border: '1px solid #ddd' }}>
{`[
    {
        "value": "wuhu",
        "label": "芜湖",
        "emoji": "😛"
    },
    {
        "value": "fly",
        "label": "起飞",
        "emoji": "🛫"
    },
    {
        "value": "wtf",
        "label": "公司倒闭了"
    }
]`}
        </pre>
      </Paragraph>
      
      <Title level={5}>【自定义emoji】—— 更改已有或添加自己的emoji：</Title>
      <Paragraph>
        请填入JSON数组格式的文本，数组中的每个元素都为对象，每个对象都是一个emoji所需信息<br/>
        每个对象包含以下四个键：<br/>
        <ul>
            <li>name(必填)：emoji的代码</li>
            <li>emoji(可省略)：emoji代码对应的表情，例🔥，如果是新添加的emoji不建议省略！</li>
            <li>description(可省略)： 对该表情的使用描述，例删除代码或者文件</li>
            <li>pinyin(可省略)：自定义关键字，可以使用对应拼音shan chu dai ma huo zhe wen jian（每个汉字的拼音请用空格隔开，以便支持首字母搜索），也可以自己定义hello</li>
        </ul>
        以上四个键的值都能作为搜索条件哦
      </Paragraph>
      
      <Paragraph>
        以下是示例代码。第一个对象更改内置的fire表情的描述和pinyin，之后可以在搜索中输入hello快速查找；第二个对象新添了一个emoji信息
        <pre style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px', color: '#333', border: '1px solid #ddd' }}>
{`[
  {
    "name": "fire",
    "description": "这是更改后的描述",
    "pinyin": "hello"
  },
  {
    "name": "apple",
    "description": "修复在苹果系统上的问题",
    "pinyin": "xiu fu zai ping guo xi tong shang de wen ti",
    "emoji": "🍎"
  }
]`}
        </pre>
      </Paragraph>
    </div>
  );

  return (
    <Layout style={{ background: 'transparent', minHeight: '100vh', width: '100%' }}>
      {contextHolder}
      
      <Content style={{ width: '100%', padding: '24px 16px' }}>
        {/* 标题和描述 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: '0 0 8px 0' }}>Git 提交内容生成</Title>
          <Text type="secondary">一个简单 Git Commit Message 书写的表单工具</Text>
        </div>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 合并三个区域为一个Card */}
          <Card style={cardStyle} bodyStyle={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 操作按钮区 */}
              <div>
                <Space wrap style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />} 
                    onClick={copyResult}
                    size="large"
                  >
                    复制结果
                  </Button>
                  <Button 
                    icon={<UndoOutlined />} 
                    onClick={resetForm}
                    size="large"
                  >
                    重置内容
                  </Button>
                  <Button 
                    icon={<SettingOutlined />} 
                    onClick={() => setSettingsVisible(true)}
                    size="large"
                  >
                    设置选项
                  </Button>
                  <Button 
                    icon={<QuestionCircleOutlined />} 
                    onClick={() => setHelpVisible(true)}
                    size="large"
                  >
                    帮助
                  </Button>
                </Space>
              </div>
              
              <Divider style={{ margin: '8px 0' }} />
              
              {/* 表单区 */}
              <div>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* 表单字段 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {/* 提交类型和范围在一行 */}
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <Select 
                        placeholder="提交类型"
                        style={{ minWidth: '200px', width: '30%', flexShrink: 0 }} 
                        value={type}
                        onChange={(value) => {
                          const selectedType = commitTypes.find(t => t.value === value);
                          setType(value);
                          
                          // 当选择提交类型时，自动选择对应的emoji
                          if (selectedType && selectedType.emoji) {
                            // 根据emoji查找对应的emojiList项
                            const matchingEmoji = emojiList.find(e => e.emoji === selectedType.emoji);
                            if (matchingEmoji) {
                              const newEmoji: EmojiItem = {
                                name: matchingEmoji.name,
                                emoji: matchingEmoji.emoji
                              };
                              
                              if (matchingEmoji.description) {
                                newEmoji.description = matchingEmoji.description;
                              }
                              
                              if (matchingEmoji.pinyin) {
                                newEmoji.pinyin = matchingEmoji.pinyin;
                              }
                              
                              setEmoji(newEmoji);
                            }
                          }
                        }}
                        showSearch
                        optionFilterProp="label"
                        size="large"
                        dropdownRender={menu => (
                          <div>
                            <Divider style={{ margin: '4px 0' }} />
                            {menu}
                          </div>
                        )}
                      >
                        {commitTypes.map(option => (
                          <Option 
                            key={option.value} 
                            value={option.value} 
                            label={`${option.emoji || ''} ${option.label}`}
                          >
                            {option.emoji && (
                              <span style={{ marginRight: '8px' }}>{option.emoji}</span>
                            )}
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                      
                      <Input 
                        placeholder="范围 (非必填) 例如：auth, ui" 
                        value={scope}
                        onChange={e => setScope(e.target.value)}
                        style={{ width: '70%', flexGrow: 1 }}
                        size="large"
                      />
                    </div>
                    
                    {/* Git Emoji和简短描述在一行 */}
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <Select
                        placeholder="Git Emoji (可选)"
                        style={{ minWidth: '200px', width: '30%', flexShrink: 0 }}
                        value={emoji.emoji ? `${emoji.emoji} :${emoji.name}: ${emoji.description || ''}` : undefined}
                        onChange={(value) => {
                          const selected = emojiList.find(e => `${e.emoji} :${e.name}: ${e.description || ''}` === value);
                          if (selected) {
                            // 保存完整的emoji对象，包括description
                            const newEmoji: EmojiItem = {
                              name: selected.name,
                              emoji: selected.emoji
                            };
                            
                            if (selected.description) {
                              newEmoji.description = selected.description;
                            }
                            
                            if (selected.pinyin) {
                              newEmoji.pinyin = selected.pinyin;
                            }
                            
                            setEmoji(newEmoji);
                          }
                        }}
                        allowClear
                        showSearch
                        optionFilterProp="title"
                        size="large"
                        dropdownRender={menu => (
                          <div>
                            <Divider style={{ margin: '4px 0' }} />
                            {menu}
                          </div>
                        )}
                        disabled={!useEmoji}
                      >
                        {filteredEmojis.map(option => (
                          <Option 
                            key={option.name} 
                            value={`${option.emoji} :${option.name}: ${option.description || ''}`}
                            title={`${option.emoji} ${option.name} ${option.description || ''} ${option.pinyin || ''}`}
                          >
                            <Space>
                              <span>{option.emoji}</span>
                              <span>:{option.name}:</span>
                              <span>{option.description}</span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                      
                      <Input 
                        placeholder="简短描述（必填，最多50字）" 
                        value={description}
                        onChange={e => setDescription(e.target.value.slice(0, 50))}
                        maxLength={50}
                        style={{ width: '70%', flexGrow: 1 }}
                        size="large"
                        required
                        status={!description ? 'error' : ''}
                      />
                    </div>
                    
                    {/* 详细内容 */}
                    <TextArea
                      placeholder="具体内容（非必填）"
                      value={detailContent}
                      onChange={e => setDetailContent(e.target.value)}
                      autoSize={{ minRows: 5, maxRows: 10 }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Space>
              </div>
              
              <Divider style={{ margin: '8px 0' }} />
              
              {/* 生成结果 */}
              <div>
                <TextArea 
                  value={result} 
                  readOnly 
                  autoSize={{ minRows: 5, maxRows: 12 }}
                  placeholder="生成的提交信息将显示在这里"
                  style={{ fontSize: '16px', width: '100%' }}
                />
              </div>
            </Space>
          </Card>
          
          {/* 历史记录 */}
          {history.length > 0 && (
            <Card 
              title="历史记录" 
              style={cardStyle}
              bodyStyle={{ padding: '24px' }}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={clearHistory}
                >
                  清空
                </Button>
              }
            >
              <List
                bordered
                dataSource={history}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="use"
                        type="link"
                        onClick={() => setFromHistory(item)}
                      >
                        使用
                      </Button>,
                      <Button
                        key="copy"
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(item);
                          messageApi.success('已复制到剪贴板');
                        }}
                      >
                        复制
                      </Button>,
                      <Button
                        key="delete"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteHistoryItem(index)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <span>{item}</span>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Space>
      </Content>
      
      {/* 预览弹窗 */}
      <Modal
        title="提交信息预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="copy" 
            type="primary" 
            icon={<CopyOutlined />}
            onClick={() => {
              copyResult();
              setPreviewVisible(false);
            }}
          >
            复制并关闭
          </Button>,
        ]}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f0f0f0', padding: '16px', borderRadius: '4px', color: '#333', border: '1px solid #ddd', boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.1)' }}>
          {result}
        </pre>
      </Modal>
      
      {/* 设置弹窗 */}
      <Modal
        title="设置选项"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        width={800}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="基础设置" key="1">
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Text strong>开启Emoji</Text>
                    <div>
                      <Text type="secondary">在提交信息中包含emoji表情</Text>
                    </div>
                  </div>
                  <Switch checked={useEmoji} onChange={setUseEmoji} />
                </Space>
              </div>
              
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Text strong>使用代码形式的Emoji</Text>
                    <div>
                      <Text type="secondary">使用:code:格式替代Unicode表情符号</Text>
                    </div>
                  </div>
                  <Switch
                    checked={useCodeEmoji}
                    onChange={setUseCodeEmoji}
                    disabled={!useEmoji}
                  />
                </Space>
              </div>
            </Space>
          </TabPane>
          <TabPane tab="自定义msg" key="2">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>在下方输入自定义的Git提交类型（JSON格式）</Text>
              <TextArea
                rows={10}
                value={customMsgText}
                onChange={e => setCustomMsgText(e.target.value)}
                placeholder={`[
  {
    "value": "wuhu",
    "label": "芜湖",
    "emoji": "😛"
  }
]`}
              />
              <Space>
                <Button type="primary" onClick={handleCustomMsgSubmit}>
                  应用
                </Button>
                <Button onClick={() => setCustomMsgText('')}>
                  清空
                </Button>
                <Button type="primary" danger onClick={clearCustomMsg}>
                  重置为默认值
                </Button>
              </Space>
            </Space>
          </TabPane>
          <TabPane tab="自定义emoji" key="3">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>在下方输入自定义的Git emoji（JSON格式）</Text>
              <TextArea
                rows={10}
                value={customEmojiText}
                onChange={e => setCustomEmojiText(e.target.value)}
                placeholder={`[
  {
    "name": "fire",
    "description": "这是更改后的描述",
    "pinyin": "hello"
  }
]`}
              />
              <Space>
                <Button type="primary" onClick={handleCustomEmojiSubmit}>
                  应用
                </Button>
                <Button onClick={() => setCustomEmojiText('')}>
                  清空
                </Button>
                <Button type="primary" danger onClick={clearCustomEmoji}>
                  重置为默认值
                </Button>
              </Space>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
      
      {/* 帮助弹窗 */}
      <Modal
        title="帮助"
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setHelpVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {helpContent}
      </Modal>
    </Layout>
  );
};

export default GitCommit; 