"use client"

import {useState} from "react"

interface Player {
  id: number
  name: string
  role: "civilian" | "undercover"
  isAlive: boolean
  description?: string
  votes?: number
}

interface ChatMessage {
  playerId: number
  playerName: string
  content: string
  timestamp: number
}

interface GameData {
  players: Player[]
  words: { civilian: string; undercover: string }
  currentRound: number
  phase: "description" | "voting" | "result"
}

interface GamePlayProps {
  gameData: GameData
  onGameEnd: () => void
}

export default function GamePlay({gameData: initialGameData, onGameEnd}: GamePlayProps) {
  const [gameData, setGameData] = useState<GameData>({
    ...initialGameData,
    players: initialGameData.players.map((p) => ({...p, isAlive: true, votes: 0})),
  })
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [showIdentity, setShowIdentity] = useState(false)
  const [description, setDescription] = useState("")
  const [selectedVote, setSelectedVote] = useState<number | null>(null)
  const [gameResult, setGameResult] = useState<"civilian" | "undercover" | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const alivePlayers = gameData.players.filter((p) => p.isAlive)
  const currentPlayer = alivePlayers[currentPlayerIndex]

  const checkGameEnd = (players: Player[]) => {
    const aliveUndercoverCount = players.filter((p) => p.isAlive && p.role === "undercover").length
    const aliveCivilianCount = players.filter((p) => p.isAlive && p.role === "civilian").length

    if (aliveUndercoverCount === 0) {
      return "civilian"
    }
    if (aliveUndercoverCount >= aliveCivilianCount) {
      return "undercover"
    }
    return null
  }

  const handleNextDescription = () => {
    if (description.trim()) {
      // 添加新的聊天消息
      setChatMessages(prev => [...prev, {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        content: description.trim(),
        timestamp: Date.now()
      }])
    }

    if (currentPlayerIndex < alivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
      setDescription("")
      setShowIdentity(false)
    } else {
      setGameData((prev) => ({...prev, phase: "voting"}))
      setCurrentPlayerIndex(0)
    }
  }

  const handleVote = () => {
    if (selectedVote === null) return

    const newPlayers = [...gameData.players]
    const votedPlayer = newPlayers.find((p) => p.id === selectedVote)
    if (votedPlayer) {
      votedPlayer.votes = (votedPlayer.votes || 0) + 1
    }

    if (currentPlayerIndex < alivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
      setSelectedVote(null)
    } else {
      const maxVotes = Math.max(...newPlayers.filter((p) => p.isAlive).map((p) => p.votes || 0))
      const eliminatedPlayers = newPlayers.filter((p) => p.isAlive && p.votes === maxVotes)

      if (eliminatedPlayers.length === 1) {
        eliminatedPlayers[0].isAlive = false
      }

      newPlayers.forEach((p) => (p.votes = 0))

      const result = checkGameEnd(newPlayers)
      if (result) {
        setGameResult(result)
      }

      setGameData((prev) => ({
        ...prev,
        players: newPlayers,
        phase: "result",
        currentRound: prev.currentRound + 1,
      }))
      setCurrentPlayerIndex(0)
    }
  }

  const handleNextRound = () => {
    setGameData((prev) => ({...prev, phase: "description"}))
    setCurrentPlayerIndex(0)
    setShowIdentity(false)
  }

  if (gameResult) {
    return (
      <div className="app-container">
        <div className="main-content game-result">
          <div className="result-card">
            <div className="result-header">
              <div className="trophy-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
              <h1 className="result-title">{gameResult === "civilian" ? "平民获胜！" : "卧底获胜！"}</h1>
            </div>

            <div className="result-content">
              <h3 className="reveal-title">身份揭晓</h3>
              <div className="players-reveal">
                {gameData.players.map((player) => (
                  <div key={player.id} className={`player-reveal ${player.role}`}>
                    <span className="player-name">{player.name}</span>
                    <div className="player-info">
                      <span className={`tag ${player.role === "civilian" ? "tag-green" : "tag-red"}`}>
                        {player.role === "civilian" ? "平民" : "卧底"}
                      </span>
                      <span className="player-word">
                        {player.role === "civilian" ? gameData.words.civilian : gameData.words.undercover}
                      </span>
                      {!player.isAlive && <span className="eliminated">已淘汰</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-actions">
              <button className="primary-button" onClick={onGameEnd}>
                返回首页
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .game-result {
            max-width: 800px;
          }

          .result-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            border: 1px solid rgba(255, 255, 255, 0.3);
            overflow: hidden;
          }

          .result-header {
            text-align: center;
            padding: var(--spacing-2xl) var(--spacing-lg);
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
          }

          .trophy-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--spacing-lg);
            color: white;
          }

          .result-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            margin: 0;
          }

          .result-content {
            padding: var(--spacing-2xl) var(--spacing-lg);
          }

          .reveal-title {
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: var(--spacing-lg);
            color: var(--text-primary);
          }

          .players-reveal {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .player-reveal {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            border-left: 4px solid;
          }

          .player-reveal.civilian {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-color: var(--success-color);
          }

          .player-reveal.undercover {
            background: linear-gradient(135deg, #fef2f2, #fecaca);
            border-color: var(--danger-color);
          }

          .player-name {
            font-weight: 600;
            font-size: 1.125rem;
            color: var(--text-primary);
          }

          .player-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
          }

          .player-word {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .eliminated {
            font-size: 0.75rem;
            color: var(--text-light);
            font-style: italic;
          }

          .result-actions {
            padding: var(--spacing-lg);
            text-align: center;
            background: rgba(248, 250, 252, 0.8);
          }

          @media (max-width: 768px) {
            .player-reveal {
              flex-direction: column;
              text-align: center;
              gap: var(--spacing-sm);
            }

            .player-info {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    )
  }

  if (gameData.phase === "result") {
    const eliminatedPlayer = gameData.players.find((p) => !p.isAlive && p.votes !== undefined)

    return (
      <div className="app-container">
        <div className="main-content game-round-result">
          <div className="round-result-card">
            <div className="round-result-header">
              <h2 className="round-title">第 {gameData.currentRound} 轮结果</h2>
            </div>

            <div className="round-result-content">
              {eliminatedPlayer && (
                <div className="eliminated-section">
                  <h3 className="section-title">被淘汰玩家</h3>
                  <div className={`eliminated-player ${eliminatedPlayer.role}`}>
                    <span className="eliminated-name">{eliminatedPlayer.name}</span>
                    <div className="eliminated-info">
                      <span className={`tag ${eliminatedPlayer.role === "civilian" ? "tag-green" : "tag-red"}`}>
                        {eliminatedPlayer.role === "civilian" ? "平民" : "卧底"}
                      </span>
                      <span className="eliminated-word">
                        词语：
                        {eliminatedPlayer.role === "civilian" ? gameData.words.civilian : gameData.words.undercover}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="survivors-section">
                <h3 className="section-title">存活玩家</h3>
                <div className="survivors-list">
                  {alivePlayers.map((player) => (
                    <div key={player.id} className="survivor-item">
                      <span className="survivor-name">{player.name}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="round-result-actions">
              <button className="primary-button" onClick={handleNextRound}>
                继续下一轮
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .game-round-result {
            max-width: 800px;
          }

          .round-result-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            border: 1px solid rgba(255, 255, 255, 0.3);
            overflow: hidden;
          }

          .round-result-header {
            padding: var(--spacing-lg);
            background: rgba(248, 250, 252, 0.95);
            border-bottom: 1px solid var(--border-light);
            text-align: center;
          }

          .round-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .round-result-content {
            padding: var(--spacing-lg);
          }

          .eliminated-section {
            margin-bottom: var(--spacing-xl);
          }

          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            color: var(--text-primary);
          }

          .eliminated-player {
            padding: var(--spacing-lg);
            border-radius: var(--radius-md);
            text-align: center;
            border-left: 4px solid;
          }

          .eliminated-player.civilian {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-color: var(--success-color);
          }

          .eliminated-player.undercover {
            background: linear-gradient(135deg, #fef2f2, #fecaca);
            border-color: var(--danger-color);
          }

          .eliminated-name {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            display: block;
            margin-bottom: var(--spacing-sm);
          }

          .eliminated-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-md);
          }

          .eliminated-word {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .survivors-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          .survivor-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md);
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-radius: var(--radius-md);
            border-left: 4px solid var(--success-color);
          }

          .survivor-name {
            font-weight: 500;
            color: var(--text-primary);
          }

          .round-result-actions {
            padding: var(--spacing-lg);
            text-align: center;
            background: rgba(248, 250, 252, 0.8);
          }

          @media (max-width: 768px) {
            .eliminated-info {
              flex-direction: column;
              gap: var(--spacing-sm);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="main-content game-play">
        {/* 游戏状态 */}
        <div className="game-status">
          <div className="status-header">
            <h2 className="round-info">第 {gameData.currentRound} 轮</h2>
            <span className={`phase-badge ${gameData.phase}`}>
              {gameData.phase === "description" ? "描述阶段" : "投票阶段"}
            </span>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{width: `${(currentPlayerIndex / alivePlayers.length) * 100}%`}}
              ></div>
            </div>
            <p className="progress-text">
              进度：{currentPlayerIndex + 1} / {alivePlayers.length}
            </p>
          </div>
        </div>

        <div className="game-content">
          <div className="game-main">
            {gameData.phase === "description" ? (
              <div className="game-card description-phase">
                <div className="game-card-header">
                  <div className="icon-container icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h3 className="phase-title">{currentPlayer.name} 的回合</h3>
                </div>
                <div className="game-card-content">
                  <div className="identity-section">
                    <button
                      className={`identity-toggle ${showIdentity ? "active" : ""}`}
                      onClick={() => setShowIdentity(!showIdentity)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showIdentity ? (
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </>
                        )}
                      </svg>
                      {showIdentity ? "隐藏身份" : "查看身份"}
                    </button>

                    {showIdentity && (
                      <div className={`identity-reveal ${currentPlayer.role}`}>
                        <div className="identity-badge">
                          <span className={`tag ${currentPlayer.role === "civilian" ? "tag-green" : "tag-red"}`}>
                            {currentPlayer.role === "civilian" ? "平民" : "卧底"}
                          </span>
                        </div>
                        <p className="identity-word">
                          你的词语：
                          <strong>
                            {currentPlayer.role === "civilian" ? gameData.words.civilian : gameData.words.undercover}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="description-section">
                    <label className="form-label">描述你的词语（不能直接说出词语本身）</label>
                    <textarea
                      className="description-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="请描述你的词语的特征、用途、外观等..."
                      rows={4}
                    />
                  </div>

                  <div className="action-section">
                    <button className="primary-button" onClick={handleNextDescription} disabled={!description.trim()}>
                      {currentPlayerIndex < alivePlayers.length - 1 ? "下一位玩家" : "进入投票"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="game-card voting-phase">
                <div className="game-card-header">
                  <div className="icon-container icon-purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      <path d="M13 12h3"/>
                      <path d="M8 12H5"/>
                    </svg>
                  </div>
                  <h3 className="phase-title">{currentPlayer.name} 投票</h3>
                </div>
                <div className="game-card-content">
                  <div className="voting-section">
                    <h4 className="voting-title">选择你认为的卧底</h4>
                    <div className="voting-options">
                      {alivePlayers
                        .filter((p) => p.id !== currentPlayer.id)
                        .map((player) => (
                          <div
                            key={player.id}
                            className={`voting-option ${selectedVote === player.id ? "selected" : ""}`}
                            onClick={() => setSelectedVote(player.id)}
                          >
                            <span className="option-name">{player.name}</span>
                            {selectedVote === player.id && <div className="selection-indicator"></div>}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="action-section">
                    <button className="primary-button" onClick={handleVote} disabled={selectedVote === null}>
                      确认投票
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <h3>📝 描述记录</h3>
              <span className="chat-round">第 {gameData.currentRound} 轮</span>
            </div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className="chat-message">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.playerName} {message.playerName === currentPlayer.name ? '👤' : ''}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-content">
                    <span className="message-bubble">{message.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .game-play {
          max-width: 1200px;
        }

        .game-status {
          margin-bottom: var(--spacing-lg);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          border: 1px solid rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(8px);
        }

        .status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-md);
          padding: 0 var(--spacing-sm);
        }

        .round-info {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
          margin: 0;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .phase-badge {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .progress-container {
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-full);
          padding: var(--spacing-md) var(--spacing-lg);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(226, 232, 240, 0.8);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
        }

        .progress-text {
          font-size: 0.875rem;
          color: #1e40af;
          margin: 0;
          text-align: center;
          font-weight: 500;
        }

        .game-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
        }

        .game-main {
          min-width: 0;
          max-width: 700px;
        }

        .chat-panel {
          background: rgba(255, 255, 255, 0.98);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(59, 130, 246, 0.1);
          display: flex;
          flex-direction: column;
          height: calc(100vh - 250px);
          min-height: 400px;
          overflow: hidden;
        }

        .chat-header {
          padding: var(--spacing-md) var(--spacing-lg);
          border-bottom: 1px solid var(--border-light);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .chat-round {
          font-size: 0.875rem;
          color: var(--text-secondary);
          background: rgba(59, 130, 246, 0.15);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-weight: 500;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.5), rgba(241, 245, 249, 0.5));
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          max-width: 85%;
          animation: messageAppear 0.3s ease-out;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--spacing-sm);
        }

        .message-sender {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.8);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        .message-content {
          position: relative;
        }

        .message-bubble {
          display: inline-block;
          padding: var(--spacing-md) var(--spacing-lg);
          background: white;
          border-radius: var(--radius-xl);
          color: var(--text-primary);
          font-size: 0.875rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          position: relative;
        }

        .message-bubble::before {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 16px;
          height: 16px;
          background: white;
          border-left: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          transform: rotate(45deg);
          transform-origin: bottom right;
        }

        .chat-message:nth-child(even) {
          align-self: flex-end;
        }

        .chat-message:nth-child(even) .message-bubble {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .chat-message:nth-child(even) .message-bubble::before {
          background: #3b82f6;
          border: none;
          left: auto;
          right: -8px;
          transform: rotate(45deg) scaleX(-1);
        }

        .chat-message:nth-child(even) .message-time {
          order: -1;
        }

        @media (max-width: 1024px) {
          .game-content {
            grid-template-columns: 1fr;
          }

          .chat-panel {
            height: 400px;
            min-height: auto;
          }

          .chat-message {
            max-width: 90%;
          }
        }

        .game-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }

        .game-card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: rgba(248, 250, 252, 0.95);
          border-bottom: 1px solid var(--border-light);
        }

        .phase-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .game-card-content {
          padding: var(--spacing-lg);
        }

        .identity-section {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .identity-toggle {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: white;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: var(--spacing-md);
        }

        .identity-toggle:hover,
        .identity-toggle.active {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .identity-reveal {
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          border-left: 4px solid;
        }

        .identity-reveal.civilian {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-color: var(--success-color);
        }

        .identity-reveal.undercover {
          background: linear-gradient(135deg, #fef2f2, #fecaca);
          border-color: var(--danger-color);
        }

        .identity-badge {
          margin-bottom: var(--spacing-sm);
        }

        .identity-word {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin: 0;
        }

        .identity-word strong {
          font-weight: 700;
          margin-left: var(--spacing-sm);
        }

        .description-section {
          margin-bottom: var(--spacing-xl);
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .description-textarea {
          width: 100%;
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-family: inherit;
          background: white;
          resize: vertical;
          min-height: 120px;
          transition: all 0.3s ease;
        }

        .description-textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .voting-section {
          margin-bottom: var(--spacing-xl);
        }

        .voting-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .voting-options {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .voting-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .voting-option:hover {
          border-color: var(--primary-color);
          transform: translateX(4px);
        }

        .voting-option.selected {
          border-color: var(--secondary-color);
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          box-shadow: var(--shadow-md);
        }

        .option-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .selection-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          box-shadow: var(--shadow-sm);
        }

        .action-section {
          text-align: center;
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .primary-button:disabled:hover {
          transform: none;
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 768px) {
          .status-header {
            flex-direction: column;
            gap: var(--spacing-sm);
            text-align: center;
          }

          .game-card-header {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-sm);
          }

          .voting-option {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-sm);
          }

          .game-play {
            max-width: 100%;
            padding: 0 var(--spacing-md);
          }
        }
      `}</style>
    </div>
  )
}
