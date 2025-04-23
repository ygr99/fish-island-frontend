import { useState, useEffect } from "react"
import { Card, Avatar, Statistic, Typography, Divider, Tooltip, Button, Modal } from "antd"
import { CrownOutlined, RiseOutlined, HeartOutlined, GiftOutlined, TrophyOutlined } from "@ant-design/icons"
import "./index.css"

const { Title, Text } = Typography

// 模拟数据
const initialDonors = [
  {
    id: 1900004165649797122,
    name: "abf",
    amount: 66,
    avatar: "https://codebug-1309318075.cos.ap-shanghai.myqcloud.com/fishMessage/52ae3b96-cbbb-4bcd-9d47-86f23ce821df_048727d3d6d1a726edbc77e6864ec533.gif",
    avatarFramerUrl: "https://api.oss.cqbo.com/moyu/avatar_frame/头像框 (302)_爱给网_aigei_com.png",
    message: "我要当第一",
    emoji: "🚀",
  },
  {
    id: 1909418438377443329,
    name: "群主的小老弟在线炒粉",
    amount: 50,
    avatar: "https://api.oss.cqbo.com/moyu/user_avatar/1909418438377443329/z1yXHzI4-322084_2.webp",
    avatarFramerUrl: "https://api.oss.cqbo.com/moyu/avatar_frame/头像框 (588)_爱给网_aigei_com.png",
    message: "支持下，这开源项目还是不错的",
    emoji: "🚀",
  },
  {
    id: 1897542410243772418,
    name: "99",
    amount: 9.9,
    avatar: "https://api.oss.cqbo.com/moyu/user_avatar/1897542410243772418/F1gbEOP3-aLSLb72YT0WNvqy.thumb.1000_0.gif",
    avatarFramerUrl: "https://api.oss.cqbo.com/moyu/avatar_frame/头像框 (188)_爱给网_aigei_com.png",
    message: "赶紧修bug，money少不了你的",
    emoji: "🚀",
  },
  {
    id: 1911697298754211842,
    name: "主播是我义父",
    amount: 5,
    avatar: "https://img1.baidu.com/it/u=648366534,1664954226&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800",
    avatarFramerUrl: "",
    message: "主播我支持你",
    emoji: "🚀",
  },
  {
    id: 1900454124186603521,
    name: "小呆呆暴揍猪猪侠",
    amount: 2.22,
    avatar: "https://pic4.zhimg.com/v2-73a6aaa7059e2f5f9ffdc95ef6799acf_b.gif",
    avatarFramerUrl: "https://api.oss.cqbo.com/moyu/avatar_frame/头像框 (188)_爱给网_aigei_com.png",
    message: "支持主播 2.22元",
    emoji: "🚀",
  },
  {
    id: 1910613642551857153,
    name: "突突突",
    amount: 1.1,
    avatar: "https://api.oss.cqbo.com/moyu/user_avatar/1910613642551857153/eoTGZt3s-ada08f3b61323d55c13d0eb0db0edd88.gif",
    avatarFramerUrl: "",
    message: "全给群主了",
    emoji: "🚀",
  },
  {
    id: 1905463930479808513,
    name: "贞德食泥鸭",
    amount: 0.01,
    avatar: "https://api.oss.cqbo.com/moyu/user_avatar/1905463930479808513/YCbpMqjq-Snipaste_2025-04-18_15-05-20.png",
    avatarFramerUrl: "https://api.oss.cqbo.com/moyu/avatar_frame/头像框 (188)_爱给网_aigei_com.png",
    message: "给主播打赏了0.01元",
    emoji: "🚀",
  },
  {
    id: 1914166668201922561,
    name: "粉色大头龟",
    amount: 0.01,
    avatar: "https://img.picui.cn/free/2025/04/21/68060af660d05.gif",
    avatarFramerUrl: "",
    message: "给主播打赏了0.01元",
    emoji: "🚀",
  }
]

export default function DonationLeaderboard() {
  const [donors, setDonors] = useState(initialDonors)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalDonors, setTotalDonors] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    // 计算总金额和总人数
    const total = Number(donors.reduce((sum, donor) => sum + donor.amount, 0).toFixed(2))
    setTotalAmount(total)
    setTotalDonors(donors.length)
  }, [donors])

  // 获取前三名的标识
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CrownOutlined style={{ color: "#FFD700" }} />
      case 1:
        return <CrownOutlined style={{ color: "#C0C0C0" }} />
      case 2:
        return <CrownOutlined style={{ color: "#CD7F32" }} />
      default:
        return null
    }
  }

  // 获取排名标签的颜色类名
  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return "gold"
      case 1:
        return "silver"
      case 2:
        return "bronze"
      default:
        return "normal"
    }
  }

  return (
    <div className="leaderboard-container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} className="header-title">
            <TrophyOutlined className="header-icon" />
            打赏榜
          </Title>
          <Button
            type="primary"
            icon={<GiftOutlined />}
            size="large"
            onClick={() => setIsModalVisible(true)}
          >
            打赏支持
          </Button>
        </div>
        <Text type="secondary">感谢每一位支持者的鼓励与厚爱 💝</Text>

        <div className="stats-row">
          <Card bordered={false} className="stats-card stats-card-donors">
            <Statistic
              title={
                <span>
                  <HeartOutlined /> 爱心总数
                </span>
              }
              value={totalDonors}
              suffix="人"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
          <Card bordered={false} className="stats-card stats-card-amount">
            <Statistic
              title={
                <span>
                  <GiftOutlined /> 打赏总额
                </span>
              }
              value={totalAmount}
              prefix="￥"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </div>
      </div>

      <Modal
        title="感谢支持"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/img/391745205618_.pic.jpg"
            alt="打赏二维码"
            style={{ width: '100%', maxWidth: 300 }}
          />
          <p style={{ marginTop: 16, color: '#666' }}>感谢您的支持！</p>
        </div>
      </Modal>

      <div className="divider">
        <Divider />
        <div className="divider-text">
          <RiseOutlined className="divider-icon" />
          排行榜
        </div>
      </div>

      <ul className="donor-list">
        {donors.map((item, index) => (
          <li key={item.id} className="donor-item">
            <div className="donor-card">
              <div className="donor-content">
                <div className="avatar-container">
                  <div className="avatarWithFrame">
                    <Avatar size={64} src={item.avatar} className={`avatar ${getRankClass(index)}`} />
                    {item.avatarFramerUrl && (
                      <img
                        src={item.avatarFramerUrl}
                        className="avatarFrame"
                        alt="avatar-frame"
                      />
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`rank-tag ${getRankClass(index)}`}>
                      {getRankIcon(index)} {index + 1}
                    </div>
                  )}
                </div>

                <div className="donor-info">
                  <div className="donor-header">
                    <Title level={5} className="donor-name">
                      {item.name}{" "}
                      <Text type="secondary" className="donor-emoji">
                        ({item.emoji})
                      </Text>
                    </Title>
                    <Tooltip title="打赏金额">
                      <span className="amount-tag">￥{item.amount}</span>
                    </Tooltip>
                  </div>
                  <Text type="secondary" className="donor-message">
                    "{item.message}"
                  </Text>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
