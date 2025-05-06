// 骚猪主题
import {Theme} from '../interface';
// @ts-ignore
// import bgm from './sounds/bgm.mp3';

const importAll = (r: any, suffix: string) =>
  r.keys().reduce((acc: any, key: any) => {
    const fileName = key.replace('./', '').replace(suffix, '');
    acc[fileName] = r(key);
    return acc;
  }, {});

const soundUrls = importAll(require.context('./sounds', false, /\.mp3$/), '.mp3');
const imagesUrls = importAll(require.context('./images', false, /\.png$/), '.png');

const sounds = Object.entries(soundUrls).map(([key, value]) => ({
  name: key,
  src: value,
})) as Theme<string>['sounds'];

const icons = Object.entries(imagesUrls).map(([key, value]) => ({
  name: key,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  content: <img src={value} alt=""/>,
}));

export const pddTheme: Theme<string> = {
  isSystemTheme: true,
  title: '🐷猪了个猪🐷',
  bgm: undefined,
  icons: icons.map(({name, content}) => ({
    name,
    content,
    clickSound: name,
    tripleSound: '8',
  })),
  sounds,
};
