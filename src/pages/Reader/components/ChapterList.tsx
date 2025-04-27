import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  List,
  Input,
  Button,
  Typography,
  Spin,
  Empty,
  message,
  Space
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;
const { Search } = Input;

const API_URLS = {
  CHAPTER_LIST: `/getChapterList`,
  BOOK_CONTENT: `/getBookContent`
};

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

// 添加阅读器设置类型
interface ReaderSettings {
  fontColor: string;
  backgroundColor: string;
  opacity: number;
  allowWindowMove: boolean;
  fontSize: number;
  fontFamily: string;
  prevPageKey: string;
  nextPageKey: string;
  quickHide: 'mouseOut' | 'key' | 'none';
  accessToken?: string;
  apiBaseUrl?: string;
}

interface ChapterListProps {
  book: Book;
  onChapterSelect: (chapterIndex: number, chapter?: Chapter) => void;
  settings: ReaderSettings; // 添加settings参数
}

// 使用缓存记录已经加载过的书籍ID，避免重复请求章节列表
const loadedBooksCache = new Set<number>();

const ChapterList: React.FC<ChapterListProps> = ({ book, onChapterSelect, settings }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // 添加一个引用来追踪当前章节元素
  const currentChapterRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  // 添加章节内容加载状态
  const [loadingContent, setLoadingContent] = useState(false);
  // 添加初始化标志，防止重复加载
  const hasInitializedRef = useRef(false);

  // 加载章节
  useEffect(() => {
    // console.log('ChapterList组件初始化或book变更', book.id););

    // 防止重复初始化
    if (hasInitializedRef.current && book.chapters && book.chapters.length > 0) {
      // console.log('ChapterList组件已初始化且有缓存数据，跳过加载'););
      setChapters(book.chapters);
      setFilteredChapters(book.chapters);
      setLoading(false);
      return;
    }

    hasInitializedRef.current = true;

    const loadChapters = async () => {
      setLoading(true);
      try {
        // 检查本地存储中是否已有最新数据
        const savedBooks = localStorage.getItem("fish-reader-books");
        if (savedBooks) {
          const books = JSON.parse(savedBooks);
          const savedBook = books.find((b: Book) => b.id === book.id);
          if (savedBook && savedBook.chapters && savedBook.chapters.length > 0) {
            // console.log('从localStorage获取最新章节数据', savedBook.chapters.length););
            setChapters(savedBook.chapters);
            setFilteredChapters(savedBook.chapters);
            // 标记该书籍已加载章节列表
            loadedBooksCache.add(book.id);
            setLoading(false);
            return;
          }
        }

        if (book.chapters && book.chapters.length > 0) {
          // 如果已有章节数据，直接使用缓存数据
          // console.log('使用book对象中的章节数据', book.chapters.length););
          setChapters(book.chapters);
          setFilteredChapters(book.chapters);

          // 标记该书籍已加载章节列表
          loadedBooksCache.add(book.id);
        } else if (book.source === 'online' && book.url && !loadedBooksCache.has(book.id)) {
          // 只有当书籍没有章节列表且未曾加载过时，才调用API
          // console.log('书籍无章节缓存，调用API获取章节列表'););
          await refreshChapters();

          // 标记该书籍已加载章节列表
          loadedBooksCache.add(book.id);
        } else if (!book.chapters || book.chapters.length === 0) {
          // console.log('书籍无章节数据，但已加载过或不是在线书籍'););
          message.info('无法获取章节列表，请尝试刷新');
        }
      } catch (error) {
        console.error('加载章节失败:', error);
        message.error('加载章节失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [book.id]); // 只在book.id变化时重新加载，避免不必要的重复加载

  // 更新本地存储中的书籍信息
  const updateBookInStorage = (updatedBook: Book) => {
    try {
      const savedBooks = localStorage.getItem("fish-reader-books");
      if (savedBooks) {
        const books = JSON.parse(savedBooks);
        const updatedBooks = books.map((b: Book) => b.id === updatedBook.id ? updatedBook : b);
        localStorage.setItem("fish-reader-books", JSON.stringify(updatedBooks));
      }
    } catch (error) {
      console.error('更新本地存储失败:', error);
    }
  };

  // 搜索章节
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredChapters(chapters);
      return;
    }

    const filtered = chapters.filter(chapter =>
      chapter.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredChapters(filtered);
  };

  // 获取章节内容
  const fetchChapterContent = async (chapter: Chapter) => {
    if (loadingContent) return; // 防止重复请求

    // 首先检查localStorage中的最新数据
    const savedBooks = localStorage.getItem("fish-reader-books");
    if (savedBooks) {
      const books = JSON.parse(savedBooks);
      const savedBook = books.find((b: Book) => b.id === book.id);
      if (savedBook && savedBook.chapters) {
        const savedChapter = savedBook.chapters.find((c: Chapter) => c.index === chapter.index);
        if (savedChapter && savedChapter.content) {
          // console.log(`从localStorage获取章节"${chapter.title}"内容，长度: ${savedChapter.content.length}`););
          // 更新本地章节列表
          if (!chapter.content) {
            const updatedChapter = { ...chapter, content: savedChapter.content };
            const updatedChapters = chapters.map((c: Chapter) =>
              c.index === chapter.index ? updatedChapter : c
            );
            setChapters(updatedChapters);
            setFilteredChapters(searchText ?
              filteredChapters.map((c: Chapter) => c.index === chapter.index ? updatedChapter : c) :
              updatedChapters
            );
          }
          return { ...chapter, content: savedChapter.content };
        }
      }
    }

    // 如果章节已有内容，直接返回
    if (chapter.content) {
      // console.log(`章节"${chapter.title}"已有内容，直接使用缓存`););
      return chapter;
    }

    setLoadingContent(true);
    message.loading('获取章节内容...', 0);

    try {
      const timestamp = new Date().getTime();
      // 从settings中获取accessToken和apiBaseUrl
      const accessToken = settings.accessToken || 'congg:7e0efee65786976202e4fc20c6a98d89';
      const apiBaseUrl = settings.apiBaseUrl || 'https://reader.yucoder.cn/reader3';
      const apiUrl = `${apiBaseUrl}${API_URLS.BOOK_CONTENT}?accessToken=${accessToken}&v=${timestamp}`;

      // console.log(`发送获取章节内容请求: ${apiUrl}`););
      // console.log(`请求参数: url=${book.url}, index=${chapter.index}`););

      const response = await axios.post(apiUrl, {
        url: book.url,
        index: chapter.index
      });

      // console.log('章节内容API响应状态:', response.status););
      // console.log('章节内容API响应数据结构:', Object.keys(response.data || {})););

      if (response.data && response.data.data) {
        // 直接获取response.data.data作为内容，而不是response.data.data.content
        const content = response.data.data || '';

        // console.log(`获取到的内容类型: ${typeof content}`););
        // console.log(`内容长度: ${content.length || 0}`););

        if (content && content.length > 0) {
          // console.log(`成功获取章节"${chapter.title}"内容，长度: ${content.length}`););

          // 更新章节内容
          const updatedChapter = { ...chapter, content };

          // 更新章节列表中对应章节的内容
          const updatedChapters = chapters.map(c =>
            c.index === chapter.index ? updatedChapter : c
          );

          setChapters(updatedChapters);

          // 同步更新过滤后的章节列表
          if (searchText) {
            const updatedFilteredChapters = filteredChapters.map(c =>
              c.index === chapter.index ? updatedChapter : c
            );
            setFilteredChapters(updatedFilteredChapters);
          } else {
            setFilteredChapters(updatedChapters);
          }

          // 更新本地存储
          const updatedBook = {
            ...book,
            chapters: updatedChapters,
            lastReadChapter: chapter.index
          };

          // 保存到本地存储
          updateBookInStorage(updatedBook);

          message.success(`章节"${chapter.title}"内容加载完成`);

          // 确认返回带内容的章节对象
          // console.log(`返回更新后的章节对象，内容长度: ${updatedChapter.content.length}`););
          return updatedChapter;
        } else {
          console.error('获取到的内容为空');
          message.error('获取章节内容失败: 内容为空');
        }
      } else {
        console.error('章节内容数据格式不正确', response.data);
        message.error('获取章节内容失败: 响应数据格式不正确');
      }
    } catch (error: any) {
      console.error('获取章节内容失败:', error);
      message.error('获取章节内容失败: ' + (error.message || '请检查网络连接'));
    } finally {
      setLoadingContent(false);
      message.destroy(); // 关闭加载提示
    }

    return chapter;
  };

  // 处理章节点击
  const handleChapterClick = async (chapter: Chapter) => {
    // console.log(`点击章节: ${chapter.title}, 索引: ${chapter.index}`););

    // 检查章节内容是否存在，不存在则获取
    if (!chapter.content && book.source === 'online') {
      // console.log('章节无内容，开始获取内容'););
      const updatedChapter = await fetchChapterContent(chapter) || chapter;
      // 不管有没有内容，都调用父组件回调，并传递章节对象
      onChapterSelect(chapter.index, updatedChapter);
    } else {
      // console.log('章节已有内容或非在线书籍，直接使用现有内容'););
      // 直接调用父组件的回调，并传递章节对象
      onChapterSelect(chapter.index, chapter);
    }
  };

  // 刷新章节列表 - 添加节流控制
  const refreshChapters = useCallback(async () => {
    if (book.source !== 'online' || !book.url) {
      message.info('仅在线书籍支持刷新章节列表');
      return;
    }

    if (refreshDisabled) {
      message.info('请稍后再试，操作过于频繁');
      return;
    }

    setRefreshDisabled(true);
    setRefreshing(true);
    setLoading(true);

    try {
      // 先检查本地存储是否有最新数据
      const savedBooks = localStorage.getItem("fish-reader-books");
      if (!refreshing && savedBooks) { // 只在非强制刷新时检查缓存
        const books = JSON.parse(savedBooks);
        const savedBook = books.find((b: Book) => b.id === book.id);
        if (savedBook && savedBook.chapters && savedBook.chapters.length > 0) {
          // console.log('使用本地存储中的章节数据，跳过API调用'););
          setChapters(savedBook.chapters);
          setFilteredChapters(savedBook.chapters);
          setLoading(false);
          setRefreshing(false);

          // 短时间内禁用刷新按钮
          setTimeout(() => {
            setRefreshDisabled(false);
          }, 1000);

          return;
        }
      }

      const timestamp = new Date().getTime();
      // 从settings中获取accessToken和apiBaseUrl
      const accessToken = settings.accessToken || 'congg:7e0efee65786976202e4fc20c6a98d89';
      const apiBaseUrl = settings.apiBaseUrl || 'https://reader.yucoder.cn/reader3';
      const apiUrl = `${apiBaseUrl}${API_URLS.CHAPTER_LIST}?accessToken=${accessToken}&v=${timestamp}`;

      // console.log(`发送章节列表请求: ${apiUrl}`););
      // console.log(`请求参数: url=${book.url}, refresh=0, bookSourceUrl=${book.sourceInfo.url}`););

      const response = await axios.post(apiUrl, {
        url: book.url || book.sourceInfo.url,
        refresh: 0, // 不强制刷新
        bookSourceUrl: book.sourceInfo.url
      });

      // 检查响应数据格式并正确处理
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const parsedChapters = response.data.data;

        if (parsedChapters.length > 0) {
          // 保留现有章节的内容
          if (chapters.length > 0) {
            parsedChapters.forEach((newChapter: Chapter) => {
              const existingChapter = chapters.find(c => c.index === newChapter.index || c.url === newChapter.url);
              if (existingChapter && existingChapter.content) {
                newChapter.content = existingChapter.content;
              }
            });
          }

          setChapters(parsedChapters);
          setFilteredChapters(parsedChapters);

          // 同时更新本地存储
          const updatedBook = {
            ...book,
            chapters: parsedChapters
          };

          // 更新本地存储中的书籍章节信息
          updateBookInStorage(updatedBook);
          message.success(`成功获取 ${parsedChapters.length} 个章节`);
        } else {
          message.error('未能从页面解析出章节信息');
        }
      } else {
        message.error('章节列表数据格式不正确，请稍后重试');
      }
    } catch (error: any) {
      console.error('刷新章节列表失败:', error);
      message.error('刷新章节列表失败: ' + (error.message || '请检查网络连接'));
    } finally {
      setLoading(false);
      setRefreshing(false);

      // 5秒后允许再次刷新
      setTimeout(() => {
        setRefreshDisabled(false);
      }, 5000);
    }
  }, [book, refreshDisabled, refreshing]);  // 确保依赖项包含settings

  // 章节列表加载完成后，滚动到当前阅读章节
  useEffect(() => {
    if (!loading && filteredChapters.length > 0 && book.lastReadChapter !== undefined && book.lastReadChapter >= 0 && currentChapterRef.current && listContainerRef.current) {
      // 使用setTimeout确保DOM已完全渲染
      // console.log(`尝试滚动到当前章节: ${book.lastReadChapter}`););
      setTimeout(() => {
        if (currentChapterRef.current) {
          // console.log('滚动到当前阅读章节'););
          currentChapterRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } else {
          // console.log('未找到当前章节引用，无法滚动'););
        }
      }, 300);
    }
  }, [loading, filteredChapters, book.lastReadChapter]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索章节标题"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={refreshChapters}
          loading={refreshing}
          disabled={refreshDisabled}
        >
          刷新章节
        </Button>
        {book.lastReadChapter !== undefined && book.lastReadChapter >= 0 && (
          <Button
            onClick={() => {
              // 定位到当前阅读章节
              const currentChapter = filteredChapters.find(c => c.index === book.lastReadChapter);
              if (currentChapter && currentChapterRef.current) {
                currentChapterRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }
            }}
          >
            定位到当前章节
          </Button>
        )}
      </Space>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载章节中..." />
        </div>
      ) : filteredChapters.length > 0 ? (
        <List
          dataSource={filteredChapters}
          renderItem={chapter => (
            <List.Item
              key={chapter.index}
              onClick={() => handleChapterClick(chapter)}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                transition: 'all 0.3s',
                backgroundColor: book.lastReadChapter === chapter.index ? '#f0f5ff' : 'transparent',
                borderLeft: book.lastReadChapter === chapter.index ? '3px solid #1890ff' : '3px solid transparent'
              }}
              className="chapter-item"
              ref={book.lastReadChapter === chapter.index ? currentChapterRef : null}
            >
              <div
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {chapter.title}
                {book.lastReadChapter === chapter.index && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    (当前)
                  </Text>
                )}
                {chapter.content ? (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    (已缓存)
                  </Text>
                ) : null}
              </div>
            </List.Item>
          )}
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: '4px'
          }}
          ref={listContainerRef}
        />
      ) : (
        <Empty
          description="没有找到章节"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <style>
        {`
          .chapter-item:hover {
            background-color: #f5f5f5 !important;
          }
        `}
      </style>
    </div>
  );
};

export default ChapterList;
