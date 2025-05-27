"use client"

import { useState } from "react"
import { useModel } from '@umijs/max'

interface GameSetupProps {
  onGameStart: (data: any) => void
  onBack: () => void
}

const wordPairs = [
  { civilian: "🍎 苹果", undercover: "🍊 橙子" },
  { civilian: "👨‍⚕️ 医生", undercover: "👩‍⚕️ 护士" },
  { civilian: "👨‍🏫 老师", undercover: "👨‍🎓 学生" },
  { civilian: "🐱 猫", undercover: "🐶 狗" },
  { civilian: "🎬 电影", undercover: "📺 电视剧" },
  { civilian: "🌸 春天", undercover: "☀️ 夏天" },
  { civilian: "☕ 咖啡", undercover: "🫖 茶" },
  { civilian: "📚 书", undercover: "📰 杂志" },
  { civilian: "🚗 汽车", undercover: "🏍️ 摩托车" },
  { civilian: "📱 手机", undercover: "💻 电脑" },
]

// 添加默认头像列表
const defaultAvatars = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆"
]

// 默认头像URL
const DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/avataaars/svg?seed=visitor";

// 定义角色类型
type PlayerRole = "civilian" | "undercover";

export default function GameSetup({ onGameStart, onBack }: GameSetupProps) {
  // 使用 useModel 获取当前用户信息
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  
  // 从 currentUser 获取用户名和头像，如果不存在则使用默认值
  const userName = currentUser?.userName || "我";
  const userAvatar = currentUser?.userAvatar || DEFAULT_AVATAR_URL;

  const [playerCount, setPlayerCount] = useState(6)
  const [undercoverCount, setUndercoverCount] = useState(1)
  const [selectedWords, setSelectedWords] = useState(wordPairs[0])
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(6)
      .fill("")
      .map((_, i) => i === 0 ? userName : `玩家${i + 1}`),
  )
  // 添加玩家头像状态
  const [playerAvatars, setPlayerAvatars] = useState<string[]>(
    Array(6)
      .fill("")
      .map((_, i) => i === 0 ? userAvatar : defaultAvatars[i % defaultAvatars.length])
  )

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count)
    const newNames = Array(count)
      .fill("")
      .map((_, i) => i === 0 ? userName : (i < playerNames.length ? playerNames[i] : `玩家${i + 1}`))
    setPlayerNames(newNames)
    // 更新头像列表
    const newAvatars = Array(count)
      .fill("")
      .map((_, i) => i === 0 ? userAvatar : (i < playerAvatars.length ? playerAvatars[i] : defaultAvatars[i % defaultAvatars.length]))
    setPlayerAvatars(newAvatars)
  }

  // 添加随机更换头像的功能，但第一个玩家除外
  const randomizeAvatar = (index: number) => {
    // 如果是当前用户（第一个玩家），不允许修改头像
    if (index === 0) return
    
    const newAvatars = [...playerAvatars]
    const currentAvatar = newAvatars[index]
    let newAvatar
    do {
      newAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
    } while (newAvatar === currentAvatar && defaultAvatars.length > 1)
    newAvatars[index] = newAvatar
    setPlayerAvatars(newAvatars)
  }

  const randomizeWords = () => {
    const randomIndex = Math.floor(Math.random() * wordPairs.length)
    setSelectedWords(wordPairs[randomIndex])
  }

  // 判断是否为URL
  const isUrl = (str: string) => {
    try {
      return Boolean(new URL(str));
    } catch (e) {
      return false;
    }
  }

  // 渲染头像
  const renderAvatar = (avatar: string, index: number) => {
    if (index === 0 || isUrl(avatar)) {
      return <img src={avatar} alt={`玩家${index + 1}头像`} className="avatar-image" />;
    } else {
      return avatar;
    }
  }

  const startGame = () => {
    const players = playerNames.map((name, index) => ({ id: index, name, role: "civilian" as PlayerRole }))
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    for (let i = 0; i < undercoverCount; i++) {
      shuffled[i].role = "undercover"
    }

    const gameData = {
      players: shuffled,
      words: selectedWords,
      currentRound: 1,
      phase: "description" as const,
    }

    onGameStart(gameData)
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="setup-header">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="title-container">
            <h1 className="setup-title">游戏设置</h1>
            <div className="title-decoration"></div>
          </div>
          <button className="primary-button start-button" onClick={startGame}>
            <span className="emoji-icon">🎮</span>
            <span>开始游戏</span>
          </button>
        </div>

        <div className="setup-content">
          <div className="setup-layout">
            {/* 左侧玩家列表 */}
            <div className="players-section">
              <div className="setup-card players-card">
                <div className="setup-card-header">
                  <div className="icon-container icon-indigo">
                    <span className="emoji-icon">👤</span>
                  </div>
                  <h3 className="setup-card-title">玩家列表</h3>
                </div>
                <div className="setup-card-content">
                  <div className="players-list">
                    {playerNames.map((name, index) => (
                      <div key={index} className="player-item">
                        <div 
                          className={`player-avatar ${index === 0 ? 'current-user' : ''}`} 
                          onClick={() => randomizeAvatar(index)}
                          title={index === 0 ? "当前用户" : "点击随机更换头像"}
                        >
                          {renderAvatar(playerAvatars[index], index)}
                        </div>
                        <div className="player-info">
                          <div className="player-number-plain">
                            {index === 0 ? (
                              <span className="current-user-badge">当前用户</span>
                            ) : (
                              `#${index + 1}`
                            )}
                          </div>
                          <div className="player-name-plain">
                            {name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧设置区域 */}
            <div className="settings-section">
              {/* 基础设置 */}
              <div className="setup-card">
                <div className="setup-card-header">
                  <div className="icon-container icon-blue">
                    <span className="emoji-icon">👥</span>
                  </div>
                  <h3 className="setup-card-title">基础设置</h3>
                </div>
                <div className="setup-card-content">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">玩家总数</label>
                      <select
                        className="form-select"
                        value={playerCount}
                        onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                      >
                        {[4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}人
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">卧底人数</label>
                      <select
                        className="form-select"
                        value={undercoverCount}
                        onChange={(e) => setUndercoverCount(Number(e.target.value))}
                      >
                        {Array.from({ length: Math.floor(playerCount / 2) }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}人
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 词语设置 */}
              <div className="setup-card">
                <div className="setup-card-header">
                  <div className="icon-container icon-purple">
                    <span className="emoji-icon">🎲</span>
                  </div>
                  <h3 className="setup-card-title">词语设置</h3>
                </div>
                <div className="setup-card-content">
                  <div className="words-container">
                    <div className="words-display">
                      <div className="word-item word-civilian">
                        <div className="word-label">平民词语</div>
                        <div className="word-value">{selectedWords.civilian}</div>
                      </div>
                      <div className="word-item word-undercover">
                        <div className="word-label">卧底词语</div>
                        <div className="word-value">{selectedWords.undercover}</div>
                      </div>
                    </div>
                    <button className="shuffle-button" onClick={randomizeWords}>
                      <span className="emoji-icon">🎲</span>
                      随机
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .setup-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
          padding: var(--spacing-lg) 0;
          position: relative;
        }

        .title-container {
          flex: 1;
          position: relative;
          text-align: center;
        }

        .setup-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #1890ff, #096dd9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          z-index: 1;
        }

        .title-decoration {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: linear-gradient(90deg, #1890ff, #096dd9);
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: none;
          border-radius: var(--radius-lg);
          background: #f0f2f5;
          color: #1890ff;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .back-button:hover {
          background: #e6f7ff;
          transform: translateX(-2px);
        }

        .start-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: 1.25rem;
          font-weight: 600;
          border-radius: var(--radius-xl);
          background: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
          transition: all 0.3s ease;
          border: none;
          color: white;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .start-button:hover {
          transform: translateY(-2px);
          background: #40a9ff;
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
        }

        .start-button:active {
          transform: translateY(0);
          background: #096dd9;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
        }

        .emoji-icon {
          font-size: 1.5rem;
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .setup-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg);
        }

        .setup-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--spacing-lg);
          align-items: start;
        }

        .players-section {
          position: sticky;
          top: var(--spacing-lg);
        }

        .players-card {
          height: 100%;
        }

        .players-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .player-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: #fafafa;
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .player-item:hover {
          background: #f5f5f5;
          transform: translateX(4px);
          border-color: #e6f7ff;
        }

        .player-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: var(--radius-lg);
          font-size: 1.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
          border: 2px solid #e6f7ff;
          overflow: hidden;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .player-avatar:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
        }

        .player-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .player-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 8px;
          background: #1890ff;
          color: white;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.75rem;
          width: fit-content;
        }

        .player-number-plain {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          padding: 2px 0;
          color: #8c8c8c;
          font-weight: 600;
          font-size: 0.75rem;
          width: fit-content;
        }

        .player-item .form-input {
          width: 100%;
          background: white;
          border: 1px solid #d9d9d9;
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          transition: all 0.3s ease;
        }

        .player-item .form-input:focus {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .player-name {
          width: 100%;
          background: white;
          border: 1px solid #d9d9d9;
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          transition: all 0.3s ease;
        }
        
        .player-name-plain {
          width: 100%;
          padding: var(--spacing-sm) 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: #262626;
        }
        
        .current-user-name {
          background: transparent;
          border: none;
          font-weight: 600;
          color: #262626;
        }

        .current-user-badge {
          background: #ff4d4f;
          color: white;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.75rem;
        }

        .player-avatar.current-user {
          border: 2px solid #ff4d4f;
          box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .setup-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          overflow: hidden;
        }

        .setup-card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
        }

        .setup-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #262626;
          margin: 0;
        }

        .setup-card-content {
          padding: var(--spacing-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-select,
        .form-input {
          padding: var(--spacing-md);
          border: 1px solid #d9d9d9;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: white;
          transition: all 0.3s ease;
        }

        .form-select:focus,
        .form-input:focus {
          outline: none;
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .words-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .words-display {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .word-item {
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          text-align: center;
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .word-item:hover {
          transform: translateY(-2px);
        }

        .word-civilian {
          background: #f6ffed;
          border-color: #b7eb8f;
        }

        .word-undercover {
          background: #fff2e8;
          border-color: #ffd591;
        }

        .word-label {
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .word-civilian .word-label {
          color: #52c41a;
        }

        .word-undercover .word-label {
          color: #fa8c16;
        }

        .word-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #262626;
        }

        .shuffle-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          border: 1px solid #d9d9d9;
          border-radius: var(--radius-md);
          background: white;
          color: #595959;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .shuffle-button:hover {
          border-color: #40a9ff;
          color: #1890ff;
          transform: rotate(180deg) scale(1.05);
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: #e6f7ff;
          color: #1890ff;
        }

        .icon-blue {
          background: #e6f7ff;
          color: #1890ff;
        }

        .icon-purple {
          background: #f9f0ff;
          color: #722ed1;
        }

        .icon-indigo {
          background: #f0f5ff;
          color: #2f54eb;
        }

        @media (max-width: 1024px) {
          .setup-layout {
            grid-template-columns: 1fr;
          }

          .players-section {
            position: static;
          }

          .players-card {
            height: auto;
          }
        }

        @media (max-width: 768px) {
          .setup-content {
            padding: 0 var(--spacing-md);
          }

          .player-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: var(--spacing-lg);
          }

          .player-info {
            width: 100%;
            align-items: center;
          }

          .player-number {
            margin-bottom: var(--spacing-xs);
          }

          .player-avatar {
            margin-bottom: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  )
}
