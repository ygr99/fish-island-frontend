import React, { useState, useEffect } from 'react';
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

interface EmoticonPickerProps {
  onSelect: (url: string) => void;
}

const STORAGE_KEY = 'favorite_emoticons';

const EmoticonPicker: React.FC<EmoticonPickerProps> = ({ onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [favoriteEmoticons, setFavoriteEmoticons] = useState<Emoticon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const searchEmoticons = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setEmoticons([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://fish.codebug.icu/sogou-api/napi/wap/emoji/searchlist?keyword=${encodeURIComponent(searchKeyword)}&spver=&rcer=&tag=0&routeName=emosearch`
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

  const debouncedSearch = debounce(searchEmoticons, 500);

  useEffect(() => {
    debouncedSearch(keyword);
    return () => {
      debouncedSearch.cancel();
    };
  }, [keyword]);

  const handleImageError = (emoticon: Emoticon, isSearchTab: boolean) => {
    if (isSearchTab) {
      setEmoticons(prev => 
        prev.map(e => 
          e.idx === emoticon.idx && e.thumbSrc === emoticon.thumbSrc
            ? { ...e, isError: true }
            : e
        )
      );
    } else {
      setFavoriteEmoticons(prev => 
        prev.map(e => 
          e.idx === emoticon.idx && e.thumbSrc === emoticon.thumbSrc
            ? { ...e, isError: true }
            : e
        )
      );
      // 更新localStorage中的数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteEmoticons));
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

  const items = [
    {
      key: 'search',
      label: '搜索表情',
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