import { Helmet } from '@umijs/max';
import { useEffect, useState } from 'react';

const GlobalTitle: React.FC = () => {
  const [siteName, setSiteName] = useState('摸鱼岛🎣');

  useEffect(() => {
    const savedSiteConfig = localStorage.getItem('siteConfig');
    if (savedSiteConfig) {
      const { siteName } = JSON.parse(savedSiteConfig);
      // 如果 siteName 包含 "-"，则只取后面的内容
      const processedSiteName = siteName.includes('-') 
        ? siteName.split('-')[1].trim() 
        : siteName;
      setSiteName(processedSiteName);
    }
  }, []);

  return <Helmet title={siteName} titleTemplate="%s" />;
};

export default GlobalTitle; 