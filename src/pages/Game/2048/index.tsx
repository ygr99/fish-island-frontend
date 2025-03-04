import React, {useState, useEffect} from 'react';
import {Layout, Typography, Button, Modal, Statistic, Space, Card, Divider} from 'antd';
import {motion} from 'framer-motion';
import {Trophy, RotateCcw, Info} from 'lucide-react';
import Game2048 from '@/components/Game/Game2048';
import GameInstructions from '@/components/Game/GameInstructions';
import "./index.css"

const {Header, Content, Footer} = Layout;
const {Title} = Typography;

function App() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bestScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [key, setKey] = useState(0); // For resetting the game

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', score.toString());
    }
  }, [score, bestScore]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setKey(prev => prev + 1);
  };

  return (
    <Layout style={{borderRadius:20}} className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <Header style={{borderRadius:20}} className="flex items-center justify-between px-4 sm:px-6 bg-amber-500 shadow-md">
        <div className="flex items-center">
          <motion.div
            initial={{rotate: 0}}
            animate={{rotate: 360}}
            transition={{duration: 0.5}}
          >
            <Trophy className="h-8 w-8 text-yellow-100 mr-2"/>
          </motion.div>
        </div>
        <Space>
          <Button
            type="text"
            icon={<Info className="h-5 w-5 text-white"/>}
            onClick={() => setInstructionsOpen(true)}
            className="text-white hover:text-yellow-100"
          />
          <Button
            type="text"
            icon={<RotateCcw className="h-5 w-5 text-white"/>}
            onClick={resetGame}
            className="text-white hover:text-yellow-100"
          />
        </Space>
      </Header>

      <Content className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <Card className="bg-amber-100 border-amber-200 shadow-sm">
            <Statistic
              title="当前分数"
              value={score}
              valueStyle={{color: '#d97706'}}
            />
          </Card>
          <Card className="bg-amber-100 border-amber-200 shadow-sm">
            <Statistic
              title="最高分数"
              value={bestScore}
              valueStyle={{color: '#b45309'}}
            />
          </Card>
          <Button
            type="primary"
            onClick={resetGame}
            size="large"
            className="bg-amber-600 hover:bg-amber-700 border-amber-700"
          >
            重新开始
          </Button>
        </div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
          className="mb-6"
        >
          <Game2048
            key={key}
            onScoreUpdate={setScore}
            onGameOver={setGameOver}
            onGameWon={setGameWon}
          />
        </motion.div>

        <Divider className="border-amber-200">游戏说明</Divider>
        <div className="text-center text-gray-600 mb-4">
          <p>使用键盘方向键或滑动屏幕来移动方块</p>
          <p>相同数字的方块相撞时会合并成为它们的和</p>
          <p>目标是获得一个2048的方块</p>
        </div>
      </Content>

      <Modal
        title="游戏结束"
        open={gameOver && !gameWon}
        footer={[
          <Button key="reset" type="primary" onClick={resetGame}>
            再玩一次
          </Button>
        ]}
        closable={false}
        centered
      >
        <p>游戏结束！您的最终得分是 {score} 分。</p>
      </Modal>

      <Modal
        title="恭喜您！"
        open={gameWon}
        footer={[
          <Button key="continue" onClick={() => setGameWon(false)}>
            继续游戏
          </Button>,
          <Button key="reset" type="primary" onClick={resetGame}>
            重新开始
          </Button>
        ]}
        closable={false}
        centered
      >
        <p>您成功获得了2048方块！您的当前得分是 {score} 分。</p>
        <p>您可以选择继续游戏或重新开始。</p>
      </Modal>

      <GameInstructions
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />
    </Layout>
  );
}

export default App;
