import { useState, useCallback } from 'react';

// 定义阅读器全局状态模型
export default () => {
  // 阅读器显示状态
  const [isReaderVisible, setIsReaderVisible] = useState<boolean>(false);
  
  // 最后阅读的书籍ID
  const [lastBookId, setLastBookId] = useState<number | null>(null);

  // 显示全局阅读器
  const showReader = useCallback((bookId?: number) => {
    if (bookId) {
      setLastBookId(bookId);
      // 保存到本地存储
      localStorage.setItem("fish-reader-last-book", bookId.toString());
    } else {
      // 尝试从本地存储加载
      const savedBookId = localStorage.getItem("fish-reader-last-book");
      if (savedBookId) {
        setLastBookId(parseInt(savedBookId));
      }
    }
    
    setIsReaderVisible(true);
  }, []);

  // 隐藏全局阅读器
  const hideReader = useCallback(() => {
    setIsReaderVisible(false);
  }, []);

  // 切换阅读器显示状态
  const toggleReader = useCallback((bookId?: number) => {
    if (isReaderVisible) {
      hideReader();
    } else {
      showReader(bookId);
    }
  }, [isReaderVisible, hideReader, showReader]);

  return {
    isReaderVisible,
    lastBookId,
    showReader,
    hideReader,
    toggleReader,
  };
}; 