import { Theme } from '../interface';
// @ts-ignore
import niganma from './sounds/你干嘛哎呦.mp3';
// @ts-ignore
import dajiahao from './sounds/全民制作人大家好.mp3';
// @ts-ignore
import jntm from './sounds/鸡你太美.mp3';
// @ts-ignore
import music from './sounds/music.mp3';
// @ts-ignore
import lianxisheng from './sounds/个人练习生.mp3';
// @ts-ignore
import boom from './sounds/篮球击地.mp3';
// @ts-ignore
// import bgm from './sounds/bgm.mp3';

import kun from './images/kun.png';
import kw1 from './images/坤舞1.png';
import kw2 from './images/坤舞2.png';
import kw3 from './images/坤舞3.png';
import kw4 from './images/坤舞4.png';
import kw5 from './images/坤舞5.png';
import kw6 from './images/坤舞6.png';
import kw7 from './images/坤舞7.png';
import jjj from './images/尖叫鸡.png';
import lq from './images/篮球.png';

type SoundNames = '你干嘛' | '鸡你太美' | '全民制作人大家好' | 'music' | '个人练习生' | '篮球击地';

const pictureSoundMap: Record<string, SoundNames> = {
  ['kun']: '全民制作人大家好',
  ['坤舞1']: '篮球击地',
  ['坤舞2']: '个人练习生',
  ['坤舞3']: '篮球击地',
  ['坤舞4']: '你干嘛',
  ['坤舞5']: '个人练习生',
  ['坤舞6']: '鸡你太美',
  ['坤舞7']: 'music',
  ['尖叫鸡']: '你干嘛',
  ['篮球']: '篮球击地',
};

const sounds: { name: SoundNames; src: string }[] = [
  { name: '你干嘛', src: niganma },
  { name: '鸡你太美', src: jntm },
  { name: '全民制作人大家好', src: dajiahao },
  { name: 'music', src: music },
  { name: '个人练习生', src: lianxisheng },
  { name: '篮球击地', src: boom },
];
// 动态导入所有图片
const imagesUrls = {
  kun: kun,
  坤舞1: kw1,
  坤舞2: kw2,
  坤舞3: kw3,
  坤舞4: kw4,
  坤舞5: kw5,
  坤舞6: kw6,
  坤舞7: kw7,
  尖叫鸡: jjj,
  篮球: lq,
};

const icons = Object.entries(imagesUrls).map(([key, value]) => {
  return {
    name: key,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    content: <img src={value} alt="" />,
  };
});

export const ikunTheme: Theme<SoundNames> = {
  isSystemTheme: true,
  title: '🐔鸡了个鸡🐔',
  bgm: undefined,
  icons: icons.map(({ name, content }) => ({
    name,
    content,
    clickSound: pictureSoundMap[name],
    tripleSound: '鸡你太美',
  })),
  sounds,
};
