"use client"

import { useState } from "react"
import { Modal, Input, message } from "antd"
import "./index.css"
import GameSetup from "@/components/Game/DrawGameSetup"
import GamePlay from "@/components/Game/DrawGamePlay"

type GamePhase = "intro" | "setup" | "playing" | "finished"

export default function UndercoverGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro")
  const [gameData, setGameData] = useState<any>(null)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [roomCode, setRoomCode] = useState("")

  const handleStartGame = () => {
    setGamePhase("setup")
  }

  const handleGameSetup = (data: any) => {
    setGameData(data)
    setGamePhase("playing")
  }

  const handleGameEnd = () => {
    setGamePhase("intro")
    setGameData(null)
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      message.error("请输入房间号")
      return
    }
    // TODO: 这里添加加入房间的逻辑
    message.success(`正在加入房间: ${roomCode}`)
    setIsJoinModalOpen(false)
    setRoomCode("")
  }

  const showJoinModal = () => {
    setIsJoinModalOpen(true)
  }

  const handleCancel = () => {
    setIsJoinModalOpen(false)
    setRoomCode("")
  }

  if (gamePhase === "setup") {
    return <GameSetup onGameStart={handleGameSetup} onBack={() => setGamePhase("intro")} />
  }

  if (gamePhase === "playing") {
    return <GamePlay gameData={gameData} onGameEnd={handleGameEnd} />
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* 标题区域和开始按钮并排 */}
        <div className="header-section">
          <div className="hero-section">
            <h1 className="main-title">
              <span className="title-text">谁是卧底</span>
              <span className="title-emoji">🕵️‍♂️</span>
              <div className="title-decoration"></div>
            </h1>
            <p className="subtitle">一场智慧与推理的较量 ✨</p>
          </div>
          <div className="action-section">
            <div className="button-group">
              <button className="primary-button create-room-button" onClick={handleStartGame}>
                <span className="button-emoji">🏠</span>
                <span>创建房间</span>
              </button>
              <button className="secondary-button join-room-button" onClick={showJoinModal}>
                <span className="button-emoji">🚪</span>
                <span>加入房间</span>
              </button>
            </div>
          </div>
        </div>

        {/* 游戏介绍卡片 - 水平布局 */}
        <div className="cards-container">
          <div className="cards-row">
            <div className="game-card">
              <div className="card-header">
                <div className="icon-container icon-blue">
                  <span className="card-emoji">👥</span>
                </div>
                <div className="card-title-group">
                  <h3 className="card-title">身份设定</h3>
                  <p className="card-subtitle">两种不同的身份角色</p>
                </div>
              </div>
              <div className="card-content">
                <div className="identity-item civilian">
                  <span className="tag tag-green">平民 👨‍👩‍👧‍👦</span>
                  <span className="identity-desc">人数较多，目标是找出卧底</span>
                </div>
                <div className="identity-item undercover">
                  <span className="tag tag-red">卧底 🎭</span>
                  <span className="identity-desc">人数较少，需要隐藏身份</span>
                </div>
              </div>
            </div>

            <div className="game-card">
              <div className="card-header">
                <div className="icon-container icon-purple">
                  <span className="card-emoji">🎯</span>
                </div>
                <div className="card-title-group">
                  <h3 className="card-title">游戏目标</h3>
                  <p className="card-subtitle">不同身份的获胜条件</p>
                </div>
              </div>
              <div className="card-content">
                <div className="goal-item goal-civilian">
                  <div className="goal-header">
                    <span className="goal-emoji">👀</span>
                    <span className="goal-title">平民获胜</span>
                  </div>
                  <p className="goal-desc">成功找出并投票淘汰所有卧底</p>
                </div>
                <div className="goal-item goal-undercover">
                  <div className="goal-header">
                    <span className="goal-emoji">🎭</span>
                    <span className="goal-title">卧底获胜</span>
                  </div>
                  <p className="goal-desc">存活到最后或人数与平民相等</p>
                </div>
              </div>
            </div>
          </div>

          {/* 游戏流程卡片 */}
          <div className="game-card flow-card">
            <div className="card-header">
              <div className="icon-container icon-indigo">
                <span className="card-emoji">🎲</span>
              </div>
              <div className="card-title-group">
                <h3 className="card-title">游戏流程</h3>
                <p className="card-subtitle">每轮游戏的进行步骤</p>
              </div>
            </div>
            <div className="card-content">
              <div className="steps-container">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4 className="step-title">词语分配 📝</h4>
                    <p className="step-desc">系统为平民和卧底分配相关但不同的词语</p>
                  </div>
                  <div className="step-line"></div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4 className="step-title">描述轮次 💭</h4>
                    <p className="step-desc">每位玩家描述自己的词语，但不能直接说出</p>
                  </div>
                  <div className="step-line"></div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4 className="step-title">投票淘汰 ✋</h4>
                    <p className="step-desc">所有玩家投票，得票最多的玩家被淘汰</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 加入房间弹框 */}
        <Modal
          title="加入房间"
          open={isJoinModalOpen}
          onOk={handleJoinRoom}
          onCancel={handleCancel}
          okText="加入"
          cancelText="取消"
          okButtonProps={{
            className: "ant-btn-primary",
            style: {
              background: "var(--gradient-button)",
              border: "none",
            },
          }}
        >
          <div className="join-room-modal-content">
            <p className="modal-description">请输入要加入的房间号</p>
            <Input
              placeholder="请输入6位房间号"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={6}
              size="large"
              className="room-code-input"
            />
          </div>
        </Modal>
      </div>
    </div>
  )
}
