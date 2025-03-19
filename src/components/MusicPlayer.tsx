import React, { useEffect, useState } from 'react';

interface MusicPlayerProps {
  playerId: string;
  mode?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ playerId, mode = "1" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // 检查 jQuery 是否已加载
    const loadJQuery = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.jQuery) {
          resolve();
          return;
        }

        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js';
        jqueryScript.async = true;
        jqueryScript.onload = () => resolve();
        jqueryScript.onerror = () => reject(new Error('Failed to load jQuery'));
        document.head.appendChild(jqueryScript);

        // 设置超时
        timeoutId = setTimeout(() => {
          reject(new Error('jQuery loading timeout'));
        }, 10000);
      });
    };

    // 加载播放器脚本
    const loadPlayerScript = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://myhkw.cn/api/player/${playerId}`;
        script.id = 'myhk';
        script.setAttribute('key', playerId);
        script.setAttribute('m', mode);
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load player script'));
        document.body.appendChild(script);

        // 设置超时
        timeoutId = setTimeout(() => {
          reject(new Error('Player script loading timeout'));
        }, 10000);
      });
    };

    // 按顺序加载脚本
    const loadScripts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadJQuery();
        await loadPlayerScript();
      } catch (error) {
        console.error('Error loading scripts:', error);
        setError(error instanceof Error ? error.message : '加载播放器失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadScripts();

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
      // 移除播放器脚本
      const existingScript = document.getElementById('myhk');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // 移除播放器相关的其他元素
      const playerElements = document.querySelectorAll('[class*="myhk"]');
      playerElements.forEach(element => {
        element.remove();
      });
    };
  }, [playerId, mode]);

  return <div id="music-player-container" />;
};

// 为了 TypeScript 支持
declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

export default MusicPlayer;
