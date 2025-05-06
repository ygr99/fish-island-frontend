import { Modal } from 'antd';
import { FC, MouseEventHandler, useEffect, useRef, useState } from 'react';
// @ts-ignore
import GameBgm from '../bgm/羊了个羊.mp3';
// @ts-ignore
import GameOver from '../bgm/game_over.mp3';
import { Icon, Theme } from '../themes/interface';
import {
  // LAST_LEVEL_STORAGE_KEY,
  // LAST_SCORE_STORAGE_KEY,
  // LAST_TIME_STORAGE_KEY,
  randomString,
  resetScoreStorage,
  timestampToUsedTimeString,
  waitTimeout,
} from '../utils';
import './Game.css';

interface MySymbol {
  id: string;
  status: number; // 0->1->2 正常->队列中->三连
  isCover: boolean;
  x: number;
  y: number;
  icon: Icon;
}

type Scene = MySymbol[];

// 随机位置、偏移量
const randomPositionOffset: (
  offsetPool: number[],
  range: number[],
) => { offset: number; row: number; column: number } = (offsetPool, range) => {
  const offset = offsetPool[Math.floor(offsetPool.length * Math.random())];
  const row = range[0] + Math.floor((range[1] - range[0]) * Math.random());
  const column = range[0] + Math.floor((range[1] - range[0]) * Math.random());
  return { offset, row, column };
};

// 制作场景：8*8虚拟网格  4*4->8*8
const sceneRanges = [
  [2, 6],
  [1, 6],
  [1, 7],
  [0, 7],
  [0, 8],
];
const offsets = [0, 25, -25, 50, -50];
const makeScene: (level: number, icons: Icon[]) => Scene = (level, icons) => {
  // 初始图标x2
  const iconPool = icons.slice(0, 2 * level);
  const offsetPool = offsets.slice(0, 1 + level);
  const scene: Scene = [];
  // 网格范围，随等级由中心扩满
  const range = sceneRanges[Math.min(4, level - 1)];
  // 在范围内随机摆放图标
  const randomSet = (icon: Icon) => {
    const { offset, row, column } = randomPositionOffset(offsetPool, range);
    scene.push({
      isCover: false,
      status: 0,
      icon,
      id: randomString(6),
      x: column * 120 + offset,
      y: row * 100 + offset,
    });
  };
  // 每间隔5级别增加icon池
  let compareLevel = level;
  while (compareLevel > 0) {
    iconPool.push(...iconPool.slice(0, Math.min(10, 2 * (compareLevel - 5))));
    compareLevel -= 5;
  }
  // icon池中每个生成六张卡片
  for (const icon of iconPool) {
    for (let i = 0; i < 6; i++) {
      randomSet(icon);
    }
  }
  return scene;
};

// o(n) 时间复杂度的洗牌算法
const fastShuffle: <T = any>(arr: T[]) => T[] = (arr) => {
  const res = arr.slice();
  for (let i = 0; i < res.length; i++) {
    const idx = (Math.random() * res.length) >> 0;
    [res[i], res[idx]] = [res[idx], res[i]];
  }
  return res;
};

// 洗牌
const washScene: (level: number, scene: Scene) => Scene = (level, scene) => {
  // 打乱顺序
  const updateScene = fastShuffle(scene);
  const offsetPool = offsets.slice(0, 1 + level);
  const range = sceneRanges[Math.min(4, level - 1)];
  // 重新设置位置
  const randomSet = (symbol: MySymbol) => {
    const { offset, row, column } = randomPositionOffset(offsetPool, range);
    symbol.x = column * 100 + offset;
    symbol.y = row * 100 + offset;
    symbol.isCover = false;
  };
  // 仅对仍在牌堆中的进行重置
  for (const symbol of updateScene) {
    if (symbol.status !== 0) continue;
    randomSet(symbol);
  }
  return updateScene;
};

// icon对应的组件
interface SymbolProps extends MySymbol {
  onClick: MouseEventHandler;
}

const Symbol: FC<SymbolProps> = ({ x, y, icon, isCover, status, onClick }) => {
  return (
    <div
      className="symbol"
      style={{
        transform: `translateX(${x}%) translateY(${y}%)`,
        backgroundColor: isCover ? '#212121' : '#f8f9fa',
        opacity: status < 2 ? 1 : 0,
      }}
      onClick={onClick}
    >
      <div className="symbol-inner" style={{ opacity: isCover ? 0.4 : 1 }}>
        {typeof icon.content === 'string' ? (
          icon.content.startsWith('data:') ||
          icon.content.startsWith('/') ||
          icon.content.startsWith('http') ? (
            /*图片地址*/
            <img src={icon.content} alt="" />
          ) : (
            /*字符表情*/
            <i>{icon.content}</i>
          )
        ) : (
          /*ReactNode*/
          icon.content
        )}
      </div>
    </div>
  );
};

const Game: FC<{
  theme: Theme<any>;
  initLevel?: number;
  initScore?: number;
  initTime?: number;
  initBgmOn?: boolean;
  initClickBgmOn?: boolean;
}> = ({
  theme,
  initLevel = 1,
  initScore = 0,
  initTime = 0,
  initBgmOn = false,
  initClickBgmOn = false,
}) => {
  const maxLevel = theme.maxLevel || 50;
  const [scene, setScene] = useState<Scene>(makeScene(initLevel, theme.icons));
  const [level, setLevel] = useState<number>(initLevel);
  const [score, setScore] = useState<number>(initScore);
  const [queue, setQueue] = useState<MySymbol[]>([]);
  const [sortedQueue, setSortedQueue] = useState<Record<MySymbol['id'], number>>({});
  const [finished, setFinished] = useState<boolean>(false);
  const [, setSuccess] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [end, setEnd] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  // 音效
  const soundRefMap = useRef<Record<string, HTMLAudioElement>>({});

  // 播放bgm
  const bgmRef = useRef<HTMLAudioElement>(null);
  const gameOverRef = useRef<HTMLAudioElement>(null);
  const [, setBgmOn] = useState<boolean>(initBgmOn);
  const [clickBgmOn, setClickBgmOn] = useState<boolean>(initClickBgmOn);
  const [once, setOnce] = useState<boolean>(false);

  useEffect(() => {
    setBgmOn(initBgmOn);
    if (!bgmRef.current) return;
    if (initBgmOn) {
      bgmRef.current.volume = 0.1;
      bgmRef.current.play().catch((err) => {
        console.error('BGM播放失败:', err);
        setBgmOn(false);
      });
    } else {
      bgmRef.current.pause();
    }
  }, [initBgmOn]);

  useEffect(() => {
    setClickBgmOn(initClickBgmOn);
  }, [initClickBgmOn]);

  // 关卡缓存
  useEffect(() => {
    // localStorage.setItem(LAST_LEVEL_STORAGE_KEY, level.toString());
    // localStorage.setItem(LAST_SCORE_STORAGE_KEY, score.toString());
    // // eslint-disable-next-line @typescript-eslint/no-use-before-define
    // localStorage.setItem(LAST_TIME_STORAGE_KEY, usedTime.toString());
  }, [level]);

  // 队列区排序
  useEffect(() => {
    const cache: Record<string, MySymbol[]> = {};
    // 加上索引，避免以id字典序来排
    const idx = 0;
    for (const symbol of queue) {
      if (cache[idx + symbol.icon.name]) {
        cache[idx + symbol.icon.name].push(symbol);
      } else {
        cache[idx + symbol.icon.name] = [symbol];
      }
    }
    const temp = [];
    for (const symbols of Object.values(cache)) {
      temp.push(...symbols);
    }
    const updateSortedQueue: typeof sortedQueue = {};
    let x = 150;
    for (const symbol of temp) {
      updateSortedQueue[symbol.id] = x;
      x += 100;
    }
    setSortedQueue(updateSortedQueue);
  }, [queue]);

  // 初始化覆盖状态
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    checkCover(scene);
  }, []);

  // 向后检查覆盖
  const checkCover = (scene: Scene) => {
    const updateScene = scene.slice();
    for (let i = 0; i < updateScene.length; i++) {
      // 当前item对角坐标
      const cur = updateScene[i];
      cur.isCover = false;
      if (cur.status !== 0) continue;
      const { x: x1, y: y1 } = cur;
      const x2 = x1 + 100,
        y2 = y1 + 100;

      for (let j = i + 1; j < updateScene.length; j++) {
        const compare = updateScene[j];
        if (compare.status !== 0) continue;
        // 两区域有交集视为选中
        // 两区域不重叠情况取反即为交集
        const { x, y } = compare;
        if (!(y + 100 <= y1 || y >= y2 || x + 100 <= x1 || x >= x2)) {
          cur.isCover = true;
          break;
        }
      }
    }
    setScene(updateScene);
  };

  // 弹出
  const popTime = useRef(0);
  const pop = () => {
    if (end) {
      return;
    }
    if (!queue.length) return;
    const updateQueue = queue.slice();
    const symbol = updateQueue.shift();
    setScore(score - 1);
    if (!symbol) return;
    const find = scene.find((s) => s.id === symbol.id);
    if (find) {
      setQueue(updateQueue);
      find.status = 0;
      find.x = 100 * (popTime.current % 7) + 20;
      find.y = 900;
      popTime.current++;
      checkCover(scene);
      // 音效
      if (soundRefMap.current?.['sound-shift'] && clickBgmOn) {
        soundRefMap.current['sound-shift'].currentTime = 0;
        soundRefMap.current['sound-shift'].volume = 0.1;
        soundRefMap.current['sound-shift']
          .play()
          .catch((err) => console.error('音效播放失败:', err));
      }
    }
  };

  // 撤销
  const undo = () => {
    if (end) {
      return;
    }
    if (!queue.length) return;
    setScore(score - 1);
    const updateQueue = queue.slice();
    const symbol = updateQueue.pop();
    if (!symbol) return;
    const find = scene.find((s) => s.id === symbol.id);
    if (find) {
      setQueue(updateQueue);
      find.status = 0;
      checkCover(scene);
      // 音效
      if (soundRefMap.current?.['sound-undo'] && clickBgmOn) {
        soundRefMap.current['sound-undo'].currentTime = 0;
        soundRefMap.current['sound-undo'].volume = 0.1;
        soundRefMap.current['sound-undo']
          .play()
          .catch((err) => console.error('音效播放失败:', err));
      }
    }
  };

  // 洗牌
  const wash = () => {
    if (end) {
      return;
    }
    setScore(score - 1);
    checkCover(washScene(level, scene));
    // 音效
    if (soundRefMap.current?.['sound-wash'] && clickBgmOn) {
      soundRefMap.current['sound-wash'].currentTime = 0;
      soundRefMap.current['sound-wash'].volume = 0.1;
      soundRefMap.current['sound-wash'].play().catch((err) => console.error('音效播放失败:', err));
    }
  };

  const levelDown = () => {
    if (level <= 1) {
      return;
    }
    // 跳关扣关卡对应数值的分
    setFinished(false);
    setLevel(level - 1);
    setQueue([]);
    checkCover(makeScene(level - 1, theme.icons));
  };

  // 加大难度，该方法由玩家点击下一关触发
  const levelUp = () => {
    if (level >= maxLevel) {
      return;
    }
    // 跳关扣关卡对应数值的分
    setScore(score - level);
    setFinished(false);
    setLevel(level + 1);
    setQueue([]);
    checkCover(makeScene(level + 1, theme.icons));
  };

  // 重开
  const restart = () => {
    setFinished(false);
    setSuccess(false);
    setScore(0);
    setLevel(level);
    setQueue([]);
    checkCover(makeScene(level, theme.icons));
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setUsedTime(0);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    startTimer(true);
  };

  // 点击item
  const clickSymbol = async (idx: number) => {
    if (finished || animating) return;
    // 第一次点击时，开启计时
    if (!once) {
      setOnce(true);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      startTimer();
    }

    const updateScene = scene.slice();
    const symbol = updateScene[idx];
    if (symbol.isCover || symbol.status !== 0) return;
    symbol.status = 1;
    // 点击音效
    if (clickBgmOn) {
      if (soundRefMap.current?.[symbol.icon.clickSound]) {
        soundRefMap.current[symbol.icon.clickSound].currentTime = 0;
        soundRefMap.current[symbol.icon.clickSound].volume = 0.05;
        soundRefMap.current[symbol.icon.clickSound]
          .play()
          .catch((err) => console.error('音效播放失败:', err));
      } else if (soundRefMap.current?.['sound-click']) {
        // 使用默认点击音效
        soundRefMap.current['sound-click'].currentTime = 0;
        soundRefMap.current['sound-click'].volume = 0.05;
        soundRefMap.current['sound-click']
          .play()
          .catch((err) => console.error('音效播放失败:', err));
      }
    }
    // 将点击项目加入队列
    let updateQueue = queue.slice();
    updateQueue.push(symbol);
    setQueue(updateQueue);
    checkCover(updateScene);

    // 动画锁 150ms
    setAnimating(true);
    await waitTimeout(150);

    // 查找当前队列中与点击项相同的
    const filterSame = updateQueue.filter((sb) => sb.icon === symbol.icon);

    // 后续状态判断
    // 三连了
    if (filterSame.length === 3) {
      // 三连一次+3分
      setScore(score + 3);
      updateQueue = updateQueue.filter((sb) => sb.icon !== symbol.icon);
      for (const sb of filterSame) {
        const find = updateScene.find((i) => i.id === sb.id);
        if (find) {
          find.status = 2;
          // 三连音效
          if (soundRefMap.current?.[symbol.icon.tripleSound] && clickBgmOn) {
            soundRefMap.current[symbol.icon.tripleSound].currentTime = 0;
            soundRefMap.current[symbol.icon.tripleSound].volume = 0.1;
            soundRefMap.current[symbol.icon.tripleSound]
              .play()
              .catch((err) => console.error('音效播放失败:', err));
          }
        }
      }
    }

    // 输了
    if (updateQueue.length === 7) {
      setFinished(true);
      setSuccess(false);
      setEnd(true);
      setShowModal(true);
      if (gameOverRef.current) {
        gameOverRef.current.currentTime = 0;
        gameOverRef.current.volume = 0.1;
        gameOverRef.current.play().catch(() => {});
      }
    }

    if (!updateScene.find((s) => s.status !== 2)) {
      // 队列清空了
      if (level === maxLevel) {
        // 胜利
        setFinished(true);
        setSuccess(true);
      } else {
        // 升级
        // 通关奖励关卡对应数值分数
        setScore(score + level);
        setLevel(level + 1);
        setQueue([]);
        checkCover(makeScene(level + 1, theme.icons));
      }
    } else {
      // 更新队列
      setQueue(updateQueue);
      checkCover(updateScene);
    }

    setAnimating(false);
  };

  // 计时相关
  const [startTime, setStartTime] = useState<number>(0);
  const [now, setNow] = useState<number>(0);
  const [usedTime, setUsedTime] = useState<number>(initTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 结束时重置计时器和关卡信息
  useEffect(() => {
    if (finished) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      intervalRef.current && clearInterval(intervalRef.current);
      resetScoreStorage();
    }
  }, [finished]);
  // 更新使用时间
  useEffect(() => {
    if (startTime && now) setUsedTime(now - startTime);
  }, [now]);
  // 计时器
  const startTimer = (restart?: boolean) => {
    setStartTime(Date.now() - (restart ? 0 : initTime));
    setNow(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  };

  return (
    <div>
      <Modal
        title="游戏结束"
        open={showModal}
        onOk={() => {
          setShowModal(false);
        }}
        onCancel={() => {
          setShowModal(false);
        }}
        okText="确定"
        cancelText="关闭"
      >
        <p>槽位已满（7个槽位）、游戏结束，你输了！</p>
      </Modal>
      <div className="game">
        <div className="scene-container">
          <div className="scene-inner">
            {scene.map((item, idx) => (
              <Symbol
                key={item.id}
                {...item}
                x={item.status === 0 ? item.x : item.status === 1 ? sortedQueue[item.id] : -1000}
                y={item.status === 0 ? item.y : item.status === 1 ? 1060 : -1000}
                onClick={() => clickSymbol(idx)}
              />
            ))}
          </div>
          <div className="game-controls-header">
            {
              // eslint-disable-next-line react/button-has-type
              <audio ref={bgmRef} loop src={theme.bgm || GameBgm} hidden />
            }
            {
              // eslint-disable-next-line react/button-has-type
              <audio ref={gameOverRef} src={GameOver} hidden />
            }
          </div>
        </div>
        <div className="queue-container" />

        <div className="game-controls">
          <div className="level">
            关卡{level}/{maxLevel} 剩余
            {scene.filter((i) => i.status === 0).length}
            <br />
            得分{score}
            <br />
            用时{timestampToUsedTimeString(usedTime)}
          </div>

          <div className="control-buttons">
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={pop}>弹出</button>
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={undo}>撤销</button>
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={wash}>洗牌</button>
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={levelDown}>上一关</button>
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={levelUp}>下一关</button>
            {/* eslint-disable-next-line react/button-has-type */}
            <button onClick={restart}>刷新本关</button>
          </div>
        </div>
      </div>

      {/*音效*/}
      {theme.sounds.map((sound) => (
        <audio
          key={sound.name}
          ref={(ref) => {
            if (ref) soundRefMap.current[sound.name] = ref;
          }}
          src={sound.src}
        />
      ))}
    </div>
  );
};

export default Game;
