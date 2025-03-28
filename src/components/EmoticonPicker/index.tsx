import React, { useState, useEffect, useRef } from 'react';
import { Input, Spin, Tabs, Button } from 'antd';
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
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [baiduEmoticons, setBaiduEmoticons] = useState<BaiduEmoticon[]>([]);
  const [loading, setLoading] = useState(false);
  const [baiduLoading, setBaiduLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [baiduPage, setBaiduPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteEmoticons, setFavoriteEmoticons] = useState<Emoticon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const baiduListRef = useRef<HTMLDivElement>(null);

  const searchEmoticons = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setEmoticons([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://moyuapi.codebug.icu/sogou-api/napi/wap/emoji/searchlist?keyword=${encodeURIComponent(searchKeyword)}&spver=&rcer=&tag=0&routeName=emosearch`
      );
      const data = await response.json();
      if (data.status === 0 && data.data.emotions) {
        setEmoticons(data.data.emotions.map((e: Emoticon) => ({ ...e, isError: false })));
      }
    } catch (error) {
      console.error('搜索表情包失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const debouncedSearch = debounce(searchEmoticons, 500);
  const debouncedBaiduSearch = debounce(searchBaiduEmoticons, 500);

  useEffect(() => {
    if (activeTab === 'search') {
      debouncedSearch(keyword);
    } else if (activeTab === 'baidu') {
      setBaiduPage(1);
      setHasMore(true);
      debouncedBaiduSearch(keyword, 1);
    }
    return () => {
      debouncedSearch.cancel();
      debouncedBaiduSearch.cancel();
    };
  }, [keyword, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'baidu' || !baiduListRef.current || baiduLoading || !hasMore) return;

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
  }, [activeTab, baiduLoading, hasMore, baiduPage, keyword]);

  const handleImageError = (emoticon: Emoticon | BaiduEmoticon, isSearchTab: boolean) => {
    if (isSearchTab) {
      if ('idx' in emoticon) {
        setEmoticons(prev =>
          prev.map(e =>
            e.idx === emoticon.idx && e.thumbSrc === emoticon.thumbSrc
              ? { ...e, isError: true }
              : e
          )
        );
      } else {
        setBaiduEmoticons(prev =>
          prev.map(e =>
            e.url === emoticon.url
              ? { ...e, isError: true }
              : e
          )
        );
      }
    } else {
      if ('idx' in emoticon) {
        setFavoriteEmoticons(prev =>
          prev.map(e =>
            e.idx === emoticon.idx && e.thumbSrc === emoticon.thumbSrc
              ? { ...e, isError: true }
              : e
          )
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteEmoticons));
      }
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

  const renderEmoticonList = (items: Emoticon[], isSearchTab: boolean) => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin />
        </div>
      );
    }

    return items
      .filter(emoticon => !emoticon.isError)
      .map((emoticon) => (
        <div key={`${emoticon.idx}-${emoticon.thumbSrc}`} className={styles.emoticonItemWrapper}>
          <img
            src={emoticon.thumbSrc}
            alt="emoticon"
            className={styles.emoticonItem}
            onClick={() => onSelect(emoticon.thumbSrc)}
            onError={() => handleImageError(emoticon, isSearchTab)}
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
                onError={() => handleImageError(emoticon, true)}
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

  const items = [
    {
      key: 'search',
      label: '搜狗表情',
      children: (
        <>
          <Input
            placeholder="搜索表情包..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.emoticonList}>
            {renderEmoticonList(emoticons, true)}
          </div>
        </>
      ),
    },
    {
      key: 'baidu',
      label: '百度表情',
      children: (
        <>
          <Input
            placeholder="搜索百度表情包..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
          {renderBaiduEmoticonList(baiduEmoticons)}
        </>
      ),
    },
    {
      key: 'favorites',
      label: '收藏表情',
      children: (
        <div className={styles.emoticonList}>
          {renderEmoticonList(favoriteEmoticons, false)}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.emoticonPicker}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className={styles.tabs}
      />
    </div>
  );
};

export default EmoticonPicker;
