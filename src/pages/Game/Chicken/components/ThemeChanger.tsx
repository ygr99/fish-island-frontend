import { Tooltip, Popconfirm } from 'antd';
import classNames from 'classnames';
import { FC, useState } from 'react';
import { Theme } from '../themes/interface';
import style from './ThemeChanger.css';

const ThemeChanger: FC<{
  changeTheme: (theme: Theme<any>) => void;
  onDiyClick: () => void;
  builtinThemes: Theme<any>[];
  onDeleteTheme?: (theme: Theme<any>) => void;
}> = ({ changeTheme, builtinThemes, onDeleteTheme }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={classNames(style.container, open && style.open)}>
        {builtinThemes.map((theme, idx) => (
          <div
            className={classNames(style.themeContainer)}
            key={theme.title}
            style={{
              opacity: open ? 1 : 0.3,
              transform: open ? `translateY(${110 * (idx + 1)}%)` : '',
            }}
          >
            <div
              className={classNames(style.square)}
              onClick={() => {
                setOpen(false);
                changeTheme(theme);
              }}
            >
              {typeof theme.icons[0].content === 'string' ? (
                theme.icons[0].content.startsWith('http') ? (
                  // http地址
                  <img src={theme.icons[0].content} alt="" />
                ) : (
                  // base64
                  <img src={theme.icons[0].content} alt="" />
                )
              ) : (
                // 图片元素
                theme.icons[0].content
              )}
            </div>
            {open && onDeleteTheme && (!theme.isSystemTheme) && (
              <Popconfirm
                title="确认删除"
                description="确定要删除此主题吗？"
                onConfirm={() => onDeleteTheme(theme)}
                okText="确定"
                cancelText="取消"
              >
                <div className={style.deleteButton}>×</div>
              </Popconfirm>
            )}
          </div>
        ))}
        <Tooltip title={'切换游戏主题'}>
          <div onClick={() => setOpen(!open)} className={classNames(style.square)}>
            {open ? '收起' : '更多'}
          </div>
        </Tooltip>
      </div>
    </>
  );
};

export default ThemeChanger;
