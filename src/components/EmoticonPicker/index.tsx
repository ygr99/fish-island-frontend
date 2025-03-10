import React, { useState, useEffect } from 'react';
import { Input, Spin } from 'antd';
import styles from './index.less';
import { debounce } from 'lodash';

interface Emoticon {
  thumbSrc: string;
  idx: number;
  source: string;
}

interface EmoticonPickerProps {
  onSelect: (url: string) => void;
}

const EmoticonPicker: React.FC<EmoticonPickerProps> = ({ onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [loading, setLoading] = useState(false);

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
        setEmoticons(data.data.emotions);
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

  return (
    <div className={styles.emoticonPicker}>
      <Input
        placeholder="搜索表情包..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.emoticonList}>
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : (
          emoticons.map((emoticon) => (
            <img
              key={`${emoticon.idx}-${emoticon.thumbSrc}`}
              src={emoticon.thumbSrc}
              alt="emoticon"
              className={styles.emoticonItem}
              onClick={() => onSelect(emoticon.thumbSrc)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EmoticonPicker; 