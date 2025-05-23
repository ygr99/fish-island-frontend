import React, { useState, useEffect, useRef } from 'react';
import { Input, Spin, Button, Tooltip, message } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import styles from './index.less';
import {
  addEmoticonFavourUsingPost,
  deleteEmoticonFavourUsingPost,
  listEmoticonFavourByPageUsingPost
} from '@/services/backend/emoticonFavourController';
import eventBus from '@/utils/eventBus';
import { EMOTICON_FAVORITE_CHANGED } from '@/components/MessageContent';
import { useModel } from '@umijs/max';

interface Emoticon {
  thumbSrc: string;
  idx: number;
  source: string;
  isError?: boolean;
}

interface SogouEmoticon {
  thumbSrc: string;
  idx: number;
  source: string;
  isError?: boolean;
}

interface EmoticonPickerProps {
  onSelect: (url: string) => void;
}

const PAGE_SIZE = 12;

const EmoticonPicker: React.FC<EmoticonPickerProps> = ({ onSelect }) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [keyword, setKeyword] = useState('');
  const [sogouEmoticons, setSogouEmoticons] = useState<SogouEmoticon[]>([]);
  const [sogouLoading, setSogouLoading] = useState(false);
  const [sogouPage, setSogouPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteEmoticons, setFavoriteEmoticons] = useState<API.EmoticonFavour[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritePage, setFavoritePage] = useState(1);
  const [favoriteHasMore, setFavoriteHasMore] = useState(true);
  const sogouListRef = useRef<HTMLDivElement>(null);
  const favoriteListRef = useRef<HTMLDivElement>(null);
  const hasFetchedFavorites = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 获取收藏的表情包
  const fetchFavoriteEmoticons = async (page: number = 1) => {
    // 如果用户未登录，不获取收藏表情
    if (!currentUser?.id) {
      setFavoriteEmoticons([]);
      return;
    }

    // 如果已经获取过第一页，且不是加载更多，则不再重复获取
    if (page === 1 && hasFetchedFavorites.current) {
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await listEmoticonFavourByPageUsingPost({
        current: page,
        pageSize: PAGE_SIZE,
      });

      if (response.code === 0 && response.data) {
        const { records, total } = response.data;
        if (page === 1) {
          setFavoriteEmoticons(records || []);
          hasFetchedFavorites.current = true;
        } else {
          setFavoriteEmoticons(prev => [...prev, ...(records || [])]);
        }
        // 如果当前页没有记录，或者已经加载完所有记录，则设置没有更多数据
        if (!records || records.length === 0 || (records?.length || 0) * page >= (total || 0)) {
          setFavoriteHasMore(false);
        } else {
          setFavoriteHasMore((records?.length || 0) * page < (total || 0));
        }
        setFavoritePage(page);
      } else {
        message.error('获取收藏表情包失败');
      }
    } catch (error) {
      console.error('获取收藏表情包失败:', error);
      message.error('获取收藏表情包失败');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 添加收藏
  const addFavorite = async (emoticonSrc: string) => {
    try {
      const response = await addEmoticonFavourUsingPost(emoticonSrc);
      if (response.code === 0) {
        message.success('收藏成功');
        // 刷新收藏列表
        fetchFavoriteEmoticons(1);
      } else {
        message.error('收藏失败');
      }
    } catch (error) {
      console.error('收藏失败:', error);
      message.error('收藏失败');
    }
  };

  // 取消收藏
  const removeFavorite = async (id: number) => {
    try {
      const response = await deleteEmoticonFavourUsingPost({ id });
      if (response.code === 0) {
        message.success('取消收藏成功');
        // 刷新收藏列表
        fetchFavoriteEmoticons(1);
      } else {
        message.error('取消收藏失败');
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      message.error('取消收藏失败');
    }
  };

  // 检查是否已收藏
  const isFavorite = (emoticonSrc: string) => {
    return favoriteEmoticons.some(fav => fav.emoticonSrc === emoticonSrc);
  };

  // 切换收藏状态
  const toggleFavorite = (emoticonSrc: string) => {
    const favorite = favoriteEmoticons.find(fav => fav.emoticonSrc === emoticonSrc);
    if (favorite) {
      removeFavorite(favorite.id!);
    } else {
      addFavorite(emoticonSrc);
    }
  };

  const searchSogouEmoticons = async (searchKeyword: string, page: number = 1) => {
    if (!searchKeyword.trim()) {
      setSogouEmoticons([]);
      return;
    }

    setSogouLoading(true);
    setIsSearching(true);
    try {
      // 首先尝试使用新的数据源
      const response = await fetch(
        `https://cn.apihz.cn/api/img/apihzbqbbaidu.php?id=10004660&key=7c3485d99f196b59266266835e3982a9&limit=10&page=${page}&words=${encodeURIComponent(searchKeyword)}`
      );
      const data = await response.json();

      if (data.code === 200 && data.res && data.res.length > 0) {
        // 转换数据格式以匹配现有接口
        const newEmoticons = data.res.map((url: string, index: number) => ({
          thumbSrc: url,
          idx: index,
          source: url,
          isError: false
        }));

        // 如果是第一页，直接设置新结果
        if (page === 1) {
          setSogouEmoticons(newEmoticons);
        } else {
          // 如果是加载更多，则追加到现有结果
          setSogouEmoticons(prev => [...prev, ...newEmoticons]);
        }
        setHasMore(page < parseInt(data.maxpage));
        setSogouPage(page);
      } else {
        // 如果主数据源失败，尝试使用搜狗作为兜底
        const sogouResponse = await fetch(
          `https://moyuapi.codebug.icu/sogou-api/napi/wap/emoji/searchlist?keyword=${encodeURIComponent(searchKeyword)}&spver=&rcer=&tag=0&routeName=emosearch`
        );
        const sogouData = await sogouResponse.json();

        if (sogouData.status === 0 && sogouData.data?.emotions) {
          const newEmoticons = sogouData.data.emotions.map((emoticon: Emoticon) => ({ ...emoticon, isError: false }));
          if (page === 1) {
            setSogouEmoticons(newEmoticons);
          } else {
            setSogouEmoticons(prev => [...prev, ...newEmoticons]);
          }
          setHasMore(newEmoticons.length === PAGE_SIZE);
          setSogouPage(page);
        } else {
          // 如果两个数据源都失败，清空结果
          setSogouEmoticons([]);
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('搜索表情包失败:', error);
      // 发生错误时清空结果
      setSogouEmoticons([]);
      setHasMore(false);
    } finally {
      setSogouLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 如果输入为空，清空结果
    if (!value.trim()) {
      setSogouEmoticons([]);
      return;
    }

    // 设置新的定时器，延迟 800ms 后执行搜索
    searchTimeoutRef.current = setTimeout(() => {
      setSogouPage(1);
      setHasMore(true);
      setSogouEmoticons([]); // 清空之前的结果
      searchSogouEmoticons(value, 1);
    }, 800);
  };

  useEffect(() => {
    // 初始加载收藏表情包
    fetchFavoriteEmoticons(1);

    // 监听收藏变化事件
    const handleFavoriteChanged = () => {
      hasFetchedFavorites.current = false; // 重置标志，允许重新获取
      fetchFavoriteEmoticons(1);
    };

    eventBus.on(EMOTICON_FAVORITE_CHANGED, handleFavoriteChanged);

    // 组件卸载时取消订阅
    return () => {
      eventBus.off(EMOTICON_FAVORITE_CHANGED, handleFavoriteChanged);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sogouListRef.current || sogouLoading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = sogouListRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        searchSogouEmoticons(keyword, sogouPage + 1);
      }
    };

    const listElement = sogouListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [sogouLoading, hasMore, sogouPage, keyword]);

  useEffect(() => {
    const handleScroll = () => {
      if (!favoriteListRef.current || favoriteLoading || !favoriteHasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = favoriteListRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        fetchFavoriteEmoticons(favoritePage + 1);
      }
    };

    const listElement = favoriteListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [favoriteLoading, favoriteHasMore, favoritePage]);

  const handleImageError = (emoticon: SogouEmoticon) => {
    setSogouEmoticons(prev =>
      prev.map(e =>
        e.source === emoticon.source
          ? { ...e, isError: true }
          : e
      )
    );
  };

  const renderEmoticonList = (items: API.EmoticonFavour[]) => {
    return items.map((emoticon) => (
      <div key={emoticon.id} className={styles.emoticonItemWrapper}>
        <Tooltip
          title={
            <div className={styles.previewContainer}>
              <img
                src={emoticon.emoticonSrc}
                alt="preview"
                className={styles.previewImage}
              />
            </div>
          }
          placement="right"
          overlayClassName={styles.tooltipOverlay}
          mouseEnterDelay={0.5}
        >
          <img
            src={emoticon.emoticonSrc}
            alt="emoticon"
            className={styles.emoticonItem}
            onClick={() => onSelect(emoticon.emoticonSrc!)}
          />
        </Tooltip>
        <Button
          type="text"
          size="small"
          icon={<StarFilled />}
          className={styles.favoriteButton}
          onClick={(e) => {
            e.stopPropagation();
            removeFavorite(emoticon.id!);
          }}
        />
      </div>
    ));
  };

  const renderSogouEmoticonList = (items: SogouEmoticon[]) => {
    return (
      <div ref={sogouListRef} className={styles.emoticonList}>
        {items
          .filter(emoticon => !emoticon.isError)
          .map((emoticon) => (
            <div key={emoticon.source} className={styles.emoticonItemWrapper}>
              <Tooltip
                title={
                  <div className={styles.previewContainer}>
                    <img
                      src={emoticon.thumbSrc}
                      alt="preview"
                      className={styles.previewImage}
                    />
                  </div>
                }
                placement="right"
                overlayClassName={styles.tooltipOverlay}
                mouseEnterDelay={0.5}
              >
                <img
                  src={emoticon.thumbSrc}
                  alt="emoticon"
                  className={styles.emoticonItem}
                  onClick={() => onSelect(emoticon.thumbSrc)}
                  onError={() => handleImageError(emoticon)}
                />
              </Tooltip>
              <Button
                type="text"
                size="small"
                icon={isFavorite(emoticon.thumbSrc) ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                className={styles.favoriteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(emoticon.thumbSrc);
                }}
              />
            </div>
          ))}
        {sogouLoading && (
          <div className={styles.loading}>
            <Spin />
          </div>
        )}
      </div>
    );
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.emoticonPicker}>
      <Input.Search
        placeholder="搜索表情包..."
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={(value) => handleSearch(value)}
        className={styles.searchInput}
        loading={isSearching}
        allowClear
      />
      {keyword.trim() ? (
        renderSogouEmoticonList(sogouEmoticons)
      ) : (
        <>
          <div ref={favoriteListRef} className={styles.emoticonList}>
            {renderEmoticonList(favoriteEmoticons)}
            {favoriteLoading && (
              <div className={styles.loading}>
                <Spin />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmoticonPicker;
