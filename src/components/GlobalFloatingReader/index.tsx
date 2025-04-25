import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Tooltip, Spin, Modal, Slider } from 'antd';
import { 
  BarsOutlined, 
  DeleteOutlined, 
  ColumnHeightOutlined,
  BorderOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { createPortal } from 'react-dom';
import axios from 'axios';

// 定义类型
interface Book {
  id: number;
  title: string;
  author?: string;
  cover?: string;
  format: 'txt' | 'epub' | 'mobi' | 'online';
  source: 'local' | 'online';
  filePath?: string;
  url?: string;
  lastReadPosition?: number;
  lastReadChapter?: number;
  lastReadTime?: number;
  tags?: string[];
  chapters?: Chapter[];
  sourceInfo: {
    name: string;
    url: string;
  };
}

interface Chapter {
  baseUrl: string;
  bookUrl: string;
  index: number;
  isVolume: boolean;
  tag: string;
  title: string;
  url: string;
  content: string;
  position?: number;
}

interface ReaderSettings {
  fontColor: string;
  backgroundColor: string;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

interface ReaderProps {
  visible: boolean;
  onClose: () => void;
}

// 默认设置
const DEFAULT_SETTINGS: ReaderSettings = {
  fontColor: '#333333',
  backgroundColor: '#f5f5f5',
  opacity: 0.95,
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  lineHeight: 1.5
};

// 默认尺寸
const DEFAULT_SIZE = {
  width: 500,
  height: 600
};

// 默认位置
const DEFAULT_POSITION = {
  x: window.innerWidth / 2 - 250,
  y: 50
};

// 可用字体列表
const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: '默认' },
  { value: '"Microsoft YaHei", "微软雅黑", sans-serif', label: '微软雅黑' },
  { value: '"SimSun", "宋体", serif', label: '宋体' },
  { value: '"KaiTi", "楷体", serif', label: '楷体' },
  { value: '"SimHei", "黑体", sans-serif', label: '黑体' },
  { value: '"Source Han Sans CN", "思源黑体", sans-serif', label: '思源黑体' },
  { value: '"Source Han Serif CN", "思源宋体", serif', label: '思源宋体' }
];

const GlobalReader: React.FC<ReaderProps> = ({ visible, onClose }) => {
  // 状态
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState<string>('');
  const [showChapterList, setShowChapterList] = useState(false);
  const [isClickThrough, setIsClickThrough] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // 拖动和调整大小相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // 引用
  const loadingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  
  // 记录加载时间，防止频繁重复加载
  const lastLoadTimeRef = useRef(0);
  
  // 加载书籍数据
  useEffect(() => {
    if (!visible) return;
    
    const loadBook = async () => {
      // 防止重复加载
      if (loadingRef.current) return;
      
      // 加载频率限制
      const now = Date.now();
      if (now - lastLoadTimeRef.current < 1000) return;
      
      lastLoadTimeRef.current = now;
      loadingRef.current = true;
      
      try {
        setLoading(true);
        
        // 从本地存储加载设置
        const savedSettings = localStorage.getItem('fish-reader-settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // 加载上次阅读窗口大小
        const savedSize = localStorage.getItem('fish-reader-size');
        if (savedSize) {
          setSize(JSON.parse(savedSize));
        }
        
        // 加载上次阅读窗口位置
        const savedPosition = localStorage.getItem('fish-reader-position');
        if (savedPosition) {
          setPosition(JSON.parse(savedPosition));
        }
        
        // 加载点击穿透设置
        const savedClickThrough = localStorage.getItem('fish-reader-click-through');
        if (savedClickThrough) {
          setIsClickThrough(JSON.parse(savedClickThrough));
        }
        
        // 加载最后阅读的书籍
        const lastBookId = localStorage.getItem('fish-reader-last-book');
        if (!lastBookId) {
          message.warning('未找到最后阅读的书籍');
          setLoading(false);
          loadingRef.current = false;
          return;
        }
        
        // 从本地存储加载书籍列表
        const savedBooks = localStorage.getItem('fish-reader-books');
        if (!savedBooks) {
          message.warning('未找到书籍列表');
          setLoading(false);
          loadingRef.current = false;
          return;
        }
        
        const bookList = JSON.parse(savedBooks);
        const currentBook = bookList.find((b: Book) => b.id === parseInt(lastBookId));
        
        if (!currentBook) {
          message.warning('未找到对应的书籍');
          setLoading(false);
          loadingRef.current = false;
          return;
        }
        
        // 设置当前书籍
        setBook(currentBook);
        
        // 设置当前章节索引
        const chapterIdx = currentBook.lastReadChapter || 0;
        setChapterIndex(chapterIdx);
        
        // 加载章节列表
        if (!currentBook.chapters || currentBook.chapters.length === 0) {
          // 需要加载章节列表
          const bookWithChapters = await loadChapterList(currentBook);
          if (bookWithChapters && bookWithChapters.chapters && bookWithChapters.chapters.length > 0) {
            setBook(bookWithChapters);
            setChapters(bookWithChapters.chapters);
            
            // 加载当前章节内容
            const chapter = bookWithChapters.chapters.find((c: Chapter) => c.index === chapterIdx);
            if (chapter) {
              const chapterWithContent = await loadChapterContent(bookWithChapters, chapter);
              if (chapterWithContent) {
                setChapterContent(chapterWithContent.content || '章节内容加载失败');
              }
            }
          } else {
            message.error('加载章节列表失败');
          }
        } else {
          // 已有章节列表
          setChapters(currentBook.chapters);
          
          // 加载当前章节内容
          const chapter = currentBook.chapters.find((c: Chapter) => c.index === chapterIdx);
          if (chapter) {
            if (chapter.content) {
              // 已有缓存的章节内容
              setChapterContent(chapter.content);
            } else {
              // 需要加载章节内容
              const chapterWithContent = await loadChapterContent(currentBook, chapter);
              if (chapterWithContent) {
                setChapterContent(chapterWithContent.content || '章节内容加载失败');
              }
            }
          }
        }
      } catch (error) {
        console.error('加载书籍数据失败:', error);
        message.error('加载书籍数据失败');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadBook();
  }, [visible]);
  
  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };
  
  // 处理调整大小开始
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    e.preventDefault();
    e.stopPropagation();
  };
  
  // 处理鼠标移动（拖动和调整大小）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // 计算新位置
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // 边界检查
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        const safeX = Math.max(0, Math.min(maxX, newX));
        const safeY = Math.max(0, Math.min(maxY, newY));
        
        setPosition({ x: safeX, y: safeY });
      } else if (isResizing) {
        // 计算新尺寸
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(200, resizeStart.width + deltaX);
        const newHeight = Math.max(100, resizeStart.height + deltaY);
        
        // 边界检查
        const maxWidth = window.innerWidth - position.x;
        const maxHeight = window.innerHeight - position.y;
        const safeWidth = Math.min(maxWidth, newWidth);
        const safeHeight = Math.min(maxHeight, newHeight);
        
        setSize({ width: safeWidth, height: safeHeight });
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // 保存位置
        localStorage.setItem('fish-reader-position', JSON.stringify(position));
      }
      
      if (isResizing) {
        setIsResizing(false);
        // 保存尺寸
        localStorage.setItem('fish-reader-size', JSON.stringify(size));
      }
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, position, size]);
  
  // 加载章节列表
  const loadChapterList = async (book: Book): Promise<Book | null> => {
    if (book.source !== 'online' || !book.url) {
      return book; // 非在线书籍，直接返回
    }
    
    try {
      // 获取API设置
      const savedSettings = localStorage.getItem('fish-reader-settings');
      let accessToken = 'guest:49bc67e197c44885322d093a603ffd45';
      let apiBaseUrl = 'https://reader.nxnow.top/reader3';
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        accessToken = parsedSettings.accessToken || accessToken;
        apiBaseUrl = parsedSettings.apiBaseUrl || apiBaseUrl;
      }
      
      // 构造API请求
      const timestamp = Date.now();
      const url = `${apiBaseUrl}/getChapterList?accessToken=${accessToken}&v=${timestamp}`;
      
      // 发送请求
      const response = await axios.post(url, { url: book.url });
      
      if (!response.data || !response.data.data) {
        message.error('获取章节列表失败: 数据格式错误');
        return book;
      }
      
      // 更新书籍对象
      const updatedBook = {
        ...book,
        chapters: response.data.data
      };
      
      // 更新本地存储
      updateBookInStorage(updatedBook);
      
      return updatedBook;
    } catch (error) {
      console.error('加载章节列表失败:', error);
      message.error('加载章节列表失败');
      return book;
    }
  };
  
  // 加载章节内容
  const loadChapterContent = async (book: Book, chapter: Chapter): Promise<Chapter | null> => {
    if (chapter.content) {
      return chapter; // 已有内容，直接返回
    }
    
    if (book.source !== 'online' || !book.url) {
      return chapter; // 非在线书籍，直接返回
    }
    
    try {
      // 获取API设置
      const savedSettings = localStorage.getItem('fish-reader-settings');
      let accessToken = 'guest:49bc67e197c44885322d093a603ffd45';
      let apiBaseUrl = 'https://reader.nxnow.top/reader3';
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        accessToken = parsedSettings.accessToken || accessToken;
        apiBaseUrl = parsedSettings.apiBaseUrl || apiBaseUrl;
      }
      
      // 构造API请求
      const timestamp = Date.now();
      const url = `${apiBaseUrl}/getBookContent?accessToken=${accessToken}&v=${timestamp}`;
      
      // 发送请求
      const response = await axios.post(url, { 
        url: book.url,
        index: chapter.index
      });
      
      if (!response.data || !response.data.data) {
        message.error('获取章节内容失败: 数据格式错误');
        return chapter;
      }
      
      // 更新章节对象
      const updatedChapter = {
        ...chapter,
        content: response.data.data
      };
      
      // 更新书籍中的章节
      if (book.chapters) {
        const updatedChapters = book.chapters.map((c: Chapter) => 
          c.index === chapter.index ? updatedChapter : c
        );
        
        const updatedBook = {
          ...book,
          chapters: updatedChapters
        };
        
        // 更新本地存储
        updateBookInStorage(updatedBook);
      }
      
      return updatedChapter;
    } catch (error) {
      console.error('加载章节内容失败:', error);
      message.error('加载章节内容失败');
      return chapter;
    }
  };
  
  // 更新本地存储中的书籍
  const updateBookInStorage = (updatedBook: Book) => {
    try {
      const savedBooks = localStorage.getItem('fish-reader-books');
      if (!savedBooks) return;
      
      const books = JSON.parse(savedBooks);
      const updatedBooks = books.map((b: Book) => 
        b.id === updatedBook.id ? updatedBook : b
      );
      
      localStorage.setItem('fish-reader-books', JSON.stringify(updatedBooks));
    } catch (error) {
      console.error('更新本地存储失败:', error);
    }
  };
  
  // 保存阅读进度包括滚动位置
  const updateReadingProgress = (scrollPosition?: number) => {
    if (!book) return;
    
    // 如果没有提供滚动位置，从内容区域获取
    const position = scrollPosition !== undefined 
      ? scrollPosition 
      : contentRef.current?.scrollTop || 0;
    
    // 更新章节的滚动位置
    let updatedBook = { ...book };
    
    if (updatedBook.chapters) {
      const updatedChapters = updatedBook.chapters.map((chapter: Chapter) => {
        if (chapter.index === chapterIndex) {
          return {
            ...chapter,
            position: position || 0
          };
        }
        return chapter;
      });
      
      updatedBook = {
        ...updatedBook,
        chapters: updatedChapters,
        lastReadChapter: chapterIndex,
        lastReadPosition: position || 0,
        lastReadTime: Date.now()
      };
    } else {
      updatedBook = {
        ...updatedBook,
        lastReadChapter: chapterIndex,
        lastReadPosition: position || 0,
        lastReadTime: Date.now()
      };
    }
    
    setBook(updatedBook);
    updateBookInStorage(updatedBook);
    
    // 保存最后阅读的书籍ID
    localStorage.setItem('fish-reader-last-book', updatedBook.id.toString());
  };
  
  // 切换章节
  const changeChapter = async (newIndex: number) => {
    if (!book || !book.chapters) return;
    
    // 在切换章节前保存当前进度
    updateReadingProgress();
    
    // 索引边界检查
    if (newIndex < 0 || newIndex >= book.chapters.length) return;
    
    try {
      setLoading(true);
      
      // 更新章节索引
      setChapterIndex(newIndex);
      
      // 获取章节
      const chapter = book.chapters.find((c: Chapter) => c.index === newIndex);
      if (!chapter) {
        message.error('找不到对应章节');
        setLoading(false);
        return;
      }
      
      // 检查是否已有内容
      if (chapter.content) {
        setChapterContent(chapter.content);
      } else {
        // 加载章节内容
        const chapterWithContent = await loadChapterContent(book, chapter);
        if (chapterWithContent && chapterWithContent.content) {
          setChapterContent(chapterWithContent.content);
        } else {
          setChapterContent('章节内容加载失败');
        }
      }
      
      // 更新阅读进度
      const updatedBook = {
        ...book,
        lastReadChapter: newIndex,
        lastReadTime: Date.now()
      };
      
      setBook(updatedBook);
      updateBookInStorage(updatedBook);
      
      // 关闭章节列表
      setShowChapterList(false);
    } catch (error) {
      console.error('切换章节失败:', error);
      message.error('切换章节失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 恢复滚动位置
  useEffect(() => {
    if (!loading && contentRef.current && book && book.chapters) {
      // 查找当前章节
      const currentChapter = book.chapters.find(c => c.index === chapterIndex);
      if (currentChapter && currentChapter.position !== undefined) {
        // 恢复到上次的阅读位置
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = currentChapter.position as number;
          }
        }, 100);
      } else {
        // 新章节或无记录的章节，滚动到顶部
        contentRef.current.scrollTop = 0;
      }
    }
  }, [loading, chapterContent, chapterIndex]);
  
  // 定期保存阅读进度
  useEffect(() => {
    if (!visible || !book) return;
    
    // 30秒保存一次阅读进度
    const saveInterval = setInterval(() => {
      if (contentRef.current) {
        updateReadingProgress(contentRef.current.scrollTop);
      }
    }, 30000);
    
    // 清理
    return () => {
      clearInterval(saveInterval);
      
      // 退出前保存一次
      if (contentRef.current) {
        updateReadingProgress(contentRef.current.scrollTop);
      }
    };
  }, [visible, book, chapterIndex]);
  
  // 处理滚动事件
  const handleScroll = () => {
    // 节流处理，不要每次滚动都保存
    if (!book || !contentRef.current) return;
    
    const now = Date.now();
    // 限制为1秒保存一次
    if (now - lastLoadTimeRef.current > 1000) {
      lastLoadTimeRef.current = now;
      // 仅在用户停止滚动后保存
      setTimeout(() => {
        if (contentRef.current) {
          const currentScrollTop = contentRef.current.scrollTop;
          updateReadingProgress(currentScrollTop);
        }
      }, 500);
    }
  };
  
  // 切换点击穿透
  const toggleClickThrough = () => {
    const newValue = !isClickThrough;
    setIsClickThrough(newValue);
    localStorage.setItem('fish-reader-click-through', JSON.stringify(newValue));
    message.info(newValue ? '已启用点击穿透' : '已禁用点击穿透');
  };
  
  // 重新加载
  const handleReload = async () => {
    if (!book) return;
    
    try {
      setLoading(true);
      
      // 重新加载章节列表
      const refreshedBook = await loadChapterList(book);
      if (refreshedBook && refreshedBook.chapters && refreshedBook.chapters.length > 0) {
        setBook(refreshedBook);
        setChapters(refreshedBook.chapters);
        
        // 加载当前章节内容
        const chapter = refreshedBook.chapters.find((c: Chapter) => c.index === chapterIndex);
        if (chapter) {
          const chapterWithContent = await loadChapterContent(refreshedBook, chapter);
          if (chapterWithContent) {
            setChapterContent(chapterWithContent.content || '章节内容加载失败');
          }
        }
        
        message.success('重新加载成功');
      } else {
        message.error('重新加载失败');
      }
    } catch (error) {
      console.error('重新加载失败:', error);
      message.error('重新加载失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 章节列表组件
  const ChapterListComponent = () => (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        maxHeight: '80vh',
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: 8,
        zIndex: 1050,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0 }}>章节列表</h3>
        <Button 
          type="text" 
          onClick={() => setShowChapterList(false)}
        >
          关闭
        </Button>
      </div>
      
      <div
        style={{
          padding: '0 8px',
          overflowY: 'auto',
          flex: 1
        }}
      >
        {chapters.map((chapter) => (
          <div
            key={chapter.index}
            style={{
              padding: '10px 8px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: chapter.index === chapterIndex ? '#f6f6f6' : 'transparent',
              fontWeight: chapter.index === chapterIndex ? 'bold' : 'normal'
            }}
            onClick={() => changeChapter(chapter.index)}
          >
            {chapter.title}
          </div>
        ))}
      </div>
    </div>
  );
  
  // 键盘快捷键处理
  useEffect(() => {
    if (!visible) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // 仅当阅读器可见时处理快捷键
      if (!book) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          // 上一章
          if (chapterIndex > 0) {
            changeChapter(chapterIndex - 1);
          }
          break;
        case 'ArrowRight':
          // 下一章
          if (book.chapters && chapterIndex < book.chapters.length - 1) {
            changeChapter(chapterIndex + 1);
          }
          break;
        case 'Escape':
          // 退出阅读器
          onClose();
          break;
        case 'c':
          // 打开章节列表
          if (e.ctrlKey) {
            setShowChapterList(true);
            e.preventDefault();
          }
          break;
        case 't':
          // 切换点击穿透
          if (e.ctrlKey) {
            toggleClickThrough();
            e.preventDefault();
          }
          break;
      }
    };
    
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, book, chapterIndex]);
  
  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    // 阻止默认右键菜单
    e.preventDefault();
    
    // 创建自定义右键菜单
    const menuDiv = document.createElement('div');
    menuDiv.className = 'reader-context-menu';
    menuDiv.style.position = 'fixed';
    menuDiv.style.top = `${e.clientY}px`;
    menuDiv.style.left = `${e.clientX}px`;
    menuDiv.style.backgroundColor = '#fff';
    menuDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menuDiv.style.borderRadius = '4px';
    menuDiv.style.padding = '4px 0';
    menuDiv.style.zIndex = '1100';
    menuDiv.style.width = '180px';
    
    // 菜单项
    const menuItems = [
      { text: '上一章', disabled: !book || !book.chapters || chapterIndex <= 0, action: () => changeChapter(chapterIndex - 1) },
      { text: '下一章', disabled: !book || !book.chapters || chapterIndex >= (book.chapters?.length || 0) - 1, action: () => changeChapter(chapterIndex + 1) },
      { text: '章节列表', action: () => setShowChapterList(true) },
      { text: `${isClickThrough ? '禁用' : '启用'}点击穿透`, action: toggleClickThrough },
      { text: '刷新内容', action: handleReload },
      { text: '关闭阅读器', action: onClose }
    ];
    
    // 创建菜单项
    menuItems.forEach((item) => {
      const menuItem = document.createElement('div');
      menuItem.style.padding = '8px 16px';
      menuItem.style.cursor = item.disabled ? 'not-allowed' : 'pointer';
      menuItem.style.fontSize = '14px';
      menuItem.style.color = item.disabled ? '#ccc' : '#333';
      menuItem.innerText = item.text;
      
      if (!item.disabled) {
        menuItem.addEventListener('click', () => {
          document.body.removeChild(menuDiv);
          item.action();
        });
        
        menuItem.addEventListener('mouseover', () => {
          menuItem.style.backgroundColor = '#f5f5f5';
        });
        
        menuItem.addEventListener('mouseout', () => {
          menuItem.style.backgroundColor = 'transparent';
        });
      }
      
      menuDiv.appendChild(menuItem);
    });
    
    // 添加到body
    document.body.appendChild(menuDiv);
    
    // 点击其他区域关闭菜单
    const closeMenu = () => {
      if (document.body.contains(menuDiv)) {
        document.body.removeChild(menuDiv);
      }
      document.removeEventListener('click', closeMenu);
    };
    
    // 延迟添加事件，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 100);
  };
  
  // 如果不可见则不渲染
  if (!visible) return null;
  
  return createPortal(
    <>
      {/* 背景遮罩 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isClickThrough ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          pointerEvents: isClickThrough ? 'none' : 'auto'
        }}
        onClick={isClickThrough ? undefined : onClose}
      />
      
      {/* 阅读器窗口 */}
      <div
        ref={readerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: size.width,
          height: size.height,
          transform: `translate(${position.x}px, ${position.y}px)`,
          backgroundColor: settings.backgroundColor,
          opacity: settings.opacity,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          zIndex: 1001,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          transition: isDragging || isResizing ? 'none' : 'transform 0.2s, width 0.2s, height 0.2s'
        }}
        onMouseDown={handleDragStart}
        onContextMenu={handleContextMenu}
      >
        {/* 标题栏 */}
        <div
          className="handle"
          style={{
            padding: '8px 12px',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd',
            cursor: 'move',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <div>{book?.title || '阅读器'}</div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="章节列表">
              <Button
                type="text"
                size="small"
                icon={<BarsOutlined />}
                onClick={() => setShowChapterList(true)}
              />
            </Tooltip>
            
            <Tooltip title="刷新">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleReload}
              />
            </Tooltip>
            
            <Tooltip title={isClickThrough ? "禁用点击穿透" : "启用点击穿透"}>
              <Button
                type={isClickThrough ? "primary" : "text"}
                size="small"
                icon={<BorderOutlined />}
                onClick={toggleClickThrough}
              />
            </Tooltip>
            
            <Tooltip title="关闭">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={onClose}
              />
            </Tooltip>
          </div>
        </div>
        
        {/* 章节导航栏 */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f8f8f8',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            size="small"
            onClick={() => changeChapter(chapterIndex - 1)}
            disabled={!book || !book.chapters || chapterIndex <= 0}
          >
            上一章
          </Button>
          
          <div style={{ fontSize: 14 }}>
            {book && book.chapters ? 
              `${chapterIndex + 1}/${book.chapters.length}` : 
              '加载中...'
            }
          </div>
          
          <Button
            size="small"
            onClick={() => changeChapter(chapterIndex + 1)}
            disabled={!book || !book.chapters || chapterIndex >= (book.chapters?.length || 0) - 1}
          >
            下一章
          </Button>
        </div>
        
        {/* 内容区域 */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            position: 'relative',
            color: settings.fontColor,
            lineHeight: settings.lineHeight,
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            userSelect: 'text'
          }}
          onScroll={handleScroll}
          onContextMenu={handleContextMenu}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : !book ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>未找到书籍</p>
              <Button type="primary" onClick={() => window.location.href = '/reader'}>
                返回书架
              </Button>
            </div>
          ) : !book.chapters || book.chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>章节列表为空，请尝试重新加载</p>
              <Button type="primary" onClick={handleReload}>
                重新加载
              </Button>
            </div>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                {book.chapters[chapterIndex]?.title || `第${chapterIndex + 1}章`}
              </h2>
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  textIndent: '2em'
                }}
              >
                {chapterContent.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? 
                    <p key={index}>{paragraph}</p> : 
                    <br key={index} />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* 调整大小的手柄 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 20,
            height: 20,
            cursor: 'nwse-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#999',
            opacity: isResizing ? 1 : 0.5
          }}
          onMouseDown={handleResizeStart}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              fill="currentColor"
              d="M9,9 H7 V7 H9 V9 M9,6 H7 V4 H9 V6 M6,9 H4 V7 H6 V9 M3,9 H1 V7 H3 V9"
            />
          </svg>
        </div>
      </div>
      
      {/* 章节列表弹窗 */}
      {showChapterList && <ChapterListComponent />}
      
      {/* 帮助提示 */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          fontSize: 12,
          color: '#999',
          pointerEvents: 'none',
          opacity: 0.6,
          zIndex: 1002,
          display: !isClickThrough && !showChapterList ? 'block' : 'none'
        }}
      >
        快捷键: ← → (翻页) | Ctrl+C (章节) | Ctrl+T (点击穿透) | 右键(菜单)
      </div>
    </>,
    document.body
  );
};

export default GlobalReader; 