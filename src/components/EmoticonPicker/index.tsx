import React, { useState, useEffect, useRef } from 'react';
import { Input, Spin, Button, Tooltip, message } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import styles from './index.less';
import { debounce } from 'lodash';
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
    try {
      const response = await fetch(
        `https://moyuapi.codebug.icu/sogou-api/napi/wap/emoji/searchlist?keyword=${encodeURIComponent(searchKeyword)}&spver=&rcer=&tag=0&routeName=emosearch`
      );
      const data = await response.json();
      if (data.status === 0 && data.data?.emotions) {
        const newEmoticons = data.data.emotions.map((emoticon: Emoticon) => ({ ...emoticon, isError: false }));
        // 如果是第一页，直接设置新结果
        if (page === 1) {
          setSogouEmoticons(newEmoticons);
        } else {
          // 如果是加载更多，则追加到现有结果
          setSogouEmoticons(prev => [...prev, ...newEmoticons]);
        }
        setHasMore(newEmoticons.length === PAGE_SIZE);
        setSogouPage(page);
      } else {
        // 如果请求失败或没有数据，清空结果
        setSogouEmoticons([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('搜索搜狗表情包失败:', error);
      // 发生错误时清空结果
      setSogouEmoticons([]);
      setHasMore(false);
    } finally {
      setSogouLoading(false);
    }
  };

  const debouncedSogouSearch = debounce(searchSogouEmoticons, 500);

  useEffect(() => {
    // 每次关键词改变时，重置页码和状态
    setSogouPage(1);
    setHasMore(true);
    setSogouEmoticons([]); // 清空之前的结果
    debouncedSogouSearch(keyword, 1);
    return () => {
      debouncedSogouSearch.cancel();
    };
  }, [keyword]);

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
        debouncedSogouSearch(keyword, sogouPage + 1);
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
                  onClick={() => onSelect(emoticon.source)}
                  onError={() => handleImageError(emoticon)}
                />
              </Tooltip>
              <Button
                type="text"
                size="small"
                icon={isFavorite(emoticon.source) ? <StarFilled /> : <StarOutlined />}
                className={styles.favoriteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(emoticon.source);
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

  return (
    <div className={styles.emoticonPicker}>
      <Input
        placeholder="搜索表情包..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className={styles.searchInput}
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
