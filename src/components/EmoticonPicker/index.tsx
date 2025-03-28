import React, { useState, useEffect, useRef } from 'react';
import { Input, Spin, Button } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import styles from './index.less';
import { debounce } from 'lodash';

interface Emoticon {
  thumbSrc: string;
  idx: number;
  source: string;
  isError?: boolean;
}

interface BaiduEmoticon {
  url: string;
  isError?: boolean;
}

interface EmoticonPickerProps {
  onSelect: (url: string) => void;
}

const STORAGE_KEY = 'favorite_emoticons';
const PAGE_SIZE = 12;

const EmoticonPicker: React.FC<EmoticonPickerProps> = ({ onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [baiduEmoticons, setBaiduEmoticons] = useState<BaiduEmoticon[]>([]);
  const [baiduLoading, setBaiduLoading] = useState(false);
  const [baiduPage, setBaiduPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteEmoticons, setFavoriteEmoticons] = useState<Emoticon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const baiduListRef = useRef<HTMLDivElement>(null);

  const searchBaiduEmoticons = async (searchKeyword: string, page: number = 1) => {
    if (!searchKeyword.trim()) {
      setBaiduEmoticons([]);
      return;
    }

    setBaiduLoading(true);
    try {
      const response = await fetch(
        `https://cn.apihz.cn/api/img/apihzbqbbaidu.php?id=88888888&key=88888888&limit=${PAGE_SIZE}&page=${page}&words=${encodeURIComponent(searchKeyword)}`
      );
      const data = await response.json();
      if (data.code === 200 && data.res) {
        const newEmoticons = data.res.map((url: string) => ({ url, isError: false }));
        if (page === 1) {
          setBaiduEmoticons(newEmoticons);
        } else {
          setBaiduEmoticons(prev => [...prev, ...newEmoticons]);
        }
        setHasMore(newEmoticons.length === PAGE_SIZE);
        setBaiduPage(page);
      }
    } catch (error) {
      console.error('搜索百度表情包失败:', error);
    } finally {
      setBaiduLoading(false);
    }
  };

  const debouncedBaiduSearch = debounce(searchBaiduEmoticons, 500);

  useEffect(() => {
    setBaiduPage(1);
    setHasMore(true);
    debouncedBaiduSearch(keyword, 1);
    return () => {
      debouncedBaiduSearch.cancel();
    };
  }, [keyword]);

  useEffect(() => {
    const handleScroll = () => {
      if (!baiduListRef.current || baiduLoading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = baiduListRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        debouncedBaiduSearch(keyword, baiduPage + 1);
      }
    };

    const listElement = baiduListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [baiduLoading, hasMore, baiduPage, keyword]);

  const handleImageError = (emoticon: Emoticon | BaiduEmoticon) => {
    if ('idx' in emoticon) {
      setFavoriteEmoticons(prev =>
        prev.map(e =>
          e.idx === emoticon.idx && e.thumbSrc === emoticon.thumbSrc
            ? { ...e, isError: true }
            : e
        )
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteEmoticons));
    } else {
      setBaiduEmoticons(prev =>
        prev.map(e =>
          e.url === emoticon.url
            ? { ...e, isError: true }
            : e
        )
      );
    }
  };

  const isFavorite = (emoticon: Emoticon) => {
    return favoriteEmoticons.some(
      (fav) => fav.thumbSrc === emoticon.thumbSrc && fav.idx === emoticon.idx
    );
  };

  const toggleFavorite = (emoticon: Emoticon) => {
    const newFavorites = isFavorite(emoticon)
      ? favoriteEmoticons.filter(
          (fav) => !(fav.thumbSrc === emoticon.thumbSrc && fav.idx === emoticon.idx)
        )
      : [...favoriteEmoticons, { ...emoticon, isError: false }];

    setFavoriteEmoticons(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const renderEmoticonList = (items: Emoticon[]) => {
    return items
      .filter(emoticon => !emoticon.isError)
      .map((emoticon) => (
        <div key={`${emoticon.idx}-${emoticon.thumbSrc}`} className={styles.emoticonItemWrapper}>
          <img
            src={emoticon.thumbSrc}
            alt="emoticon"
            className={styles.emoticonItem}
            onClick={() => onSelect(emoticon.thumbSrc)}
            onError={() => handleImageError(emoticon)}
          />
          <Button
            type="text"
            size="small"
            icon={isFavorite(emoticon) ? <StarFilled /> : <StarOutlined />}
            className={styles.favoriteButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(emoticon);
            }}
          />
        </div>
      ));
  };

  const renderBaiduEmoticonList = (items: BaiduEmoticon[]) => {
    return (
      <div ref={baiduListRef} className={styles.emoticonList}>
        {items
          .filter(emoticon => !emoticon.isError)
          .map((emoticon) => (
            <div key={emoticon.url} className={styles.emoticonItemWrapper}>
              <img
                src={emoticon.url}
                alt="emoticon"
                className={styles.emoticonItem}
                onClick={() => onSelect(emoticon.url)}
                onError={() => handleImageError(emoticon)}
              />
            </div>
          ))}
        {baiduLoading && (
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
        renderBaiduEmoticonList(baiduEmoticons)
      ) : (
        <>
          <div className={styles.sectionTitle}>我的收藏</div>
          <div className={styles.emoticonList}>
            {renderEmoticonList(favoriteEmoticons)}
          </div>
        </>
      )}
    </div>
  );
};

export default EmoticonPicker;
