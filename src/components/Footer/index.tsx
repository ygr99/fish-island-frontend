import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const defaultMessage = '聪ζ';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'github',
          title: '聪ζ',
          href: 'https://github.com/lhccong',
          blankTarget: true,
        },
        {
          key: 'shortDog',
          title: (
            <>
              <GithubOutlined /> 摸鱼岛🎣
            </>
          ),
          href: 'https://github.com/lhccong/react-frontend-int',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
