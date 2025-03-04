import {useState, useEffect} from "react"
import {Table, Card, Avatar, Tag, Tooltip, Button, Spin, Badge} from "antd"
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
  CrownOutlined,
  ClockCircleOutlined,

} from "@ant-design/icons"
import {motion, AnimatePresence} from "framer-motion"

// 摸鱼用户数据类型
interface MoYuUser {
  id: number
  name: string
  avatar: string
  score: number
  lastWeekRank: number
  department: string
  level: number
  lastActive: string
  streak: number
}

// 模拟数据
const mockUsers: MoYuUser[] = [
  {
    id: 1,
    name: "小明",
    avatar: "https://img2.baidu.com/it/u=1247183257,1524477458&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=396b452a0b35749e56daad763896d002",
    score: 9876,
    lastWeekRank: 2,
    department: "技术部",
    level: 5,
    lastActive: "10分钟前",
    streak: 7,
  },
  {
    id: 2,
    name: "小🐷",
    avatar: "https://img0.baidu.com/it/u=729107211,4282634177&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=c71533fd1474ad537a4c7a068282c87b",
    score: 8654,
    lastWeekRank: 1,
    department: "市场部",
    level: 4,
    lastActive: "5分钟前",
    streak: 5,
  },
  {
    id: 3,
    name: "小王",
    avatar: "https://www.baidu.com/link?url=2CvyblZ1_dPNaNKb_Sax703hEWqQbt3ziqOKXFV37iGdYehPqSycUFwqzZJJBJa31Fj2Z1Pd1rQSD4FMfGCVZBfNnbvpbXTHC4Sr6l_sEwxxIvd7ND6prJv0V44BFmpM1PQlN8In11gqMot60qAh5tvGrA_WRzYnFph6HvT0AsZUS0GbcWHOFkAlpb2CIuuKF8xbPv_HDSgi9FQUWSXQJm5R1itgwERqlKph4z869pnG8jxAh6drN-G7dxzTVlmiAoYtxpHpo0EDNj3WRIssRMSr3Q20eSkWqdhTRRJwML8My4zihIY-XSCSGehDGUMx7AxhYy4T2TIs4A_S8Gbywqiwuua_cBhyUjNGQaiZP-CrWE1YCWfwq3PsBf6MORlz9phwPpwCRRkhuq5GrdQxr3ba_r9ZCRTSyNkpUtQo4ghRUgjVgkoUQ9HWS-K9wvFoRPndLuSNk403acXZavSoUmgaLxw1phvDVjHhB8bMZg3wGY4-dejnQZH6LmIdIg8WnXZ9qEtfQbvBxLSgaZFTKY8hBYNI7V2qXvaEaDeW8QEiRmXkUzottJIka-Gi0USlxafxSIJOq1NztmNvo0a9PaDTVoxs2kwpyasmrebPyYVnzOvjYjIUhEeeRC0X07Zej_Y3NV16oCwzW_eUOv6Lo2673ifrBSnQEAw6A9zxVvfGJmxnz9H1r2azCfCeralX-1RPU8qF6HYnk9MSIgS3Ak9Uv5v-Mim_Tvy7DCLXiqVzhrEtyhBY5NmXA2kOr8Z5L5f2IoCfpR9Jm1j2MdKrRUvwr93hpf0VmYmYz8AbETxNhxhV-TeseyRgNbTMlC7ZO3JBWJYKV38V3cMeWHq1FGgEHBLshwl8edZdZ7PgMyVm9Azvee3yb7AH-n4y8e0Kg1WQFizAtmYAyn4Uq_qltiQnqe0xkaGRoa0akuO891Sz1x8Sv38u8hdrLOXLXfwdU0-DlOenE5YcdVEj1-IAuMXgfYDA0TqNAt9KysVG0vxDfnpkI7jcGDWKqEFuJMO_Bi04NBJF-1X7goIsqauYfbf3ENcfKbo2GBzem6oKmVm&wd=&eqid=d959cafa0011295b0000000667c6badd",
    score: 7532,
    lastWeekRank: 4,
    department: "产品部",
    level: 4,
    lastActive: "刚刚",
    streak: 3,
  },
  {
    id: 4,
    name: "赵六",
    avatar: "https://img0.baidu.com/it/u=2768920610,164345610&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=134d4ae971463e867a0631723521b7d9",
    score: 6821,
    lastWeekRank: 3,
    department: "设计部",
    level: 3,
    lastActive: "30分钟前",
    streak: 2,
  },
  {
    id: 5,
    name: "钱七",
    avatar: "https://img0.baidu.com/it/u=2768920610,164345610&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=134d4ae971463e867a0631723521b7d9",
    score: 5943,
    lastWeekRank: 6,
    department: "人事部",
    level: 3,
    lastActive: "1小时前",
    streak: 4,
  },
  {
    id: 6,
    name: "孙八",
    avatar: "https://img0.baidu.com/it/u=2768920610,164345610&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=134d4ae971463e867a0631723521b7d9",
    score: 4567,
    lastWeekRank: 5,
    department: "财务部",
    level: 2,
    lastActive: "2小时前",
    streak: 1,
  },
  {
    id: 7,
    name: "周九",
    avatar: "https://img0.baidu.com/it/u=2768920610,164345610&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=134d4ae971463e867a0631723521b7d9",
    score: 3456,
    lastWeekRank: 8,
    department: "行政部",
    level: 2,
    lastActive: "3小时前",
    streak: 2,
  },
  {
    id: 8,
    name: "吴十",
    avatar: "https://img0.baidu.com/it/u=2768920610,164345610&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741194000&t=134d4ae971463e867a0631723521b7d9",
    score: 2345,
    lastWeekRank: 7,
    department: "客服部",
    level: 1,
    lastActive: "昨天",
    streak: 0,
  },
]

// 获取等级对应的表情
const getLevelEmoji = (level: number) => {
  switch (level) {
    case 5:
      return "🏆"
    case 4:
      return "🥇"
    case 3:
      return "🥈"
    case 2:
      return "🥉"
    case 1:
      return "🎖️"
    default:
      return "🎯"
  }
}

// 获取排名变化的图标和颜色
const getRankChange = (current: number, last: number) => {
  if (current < last) {
    return {icon: <RiseOutlined/>, color: "green", text: `上升${last - current}位`}
  } else if (current > last) {
    return {icon: <FallOutlined/>, color: "red", text: `下降${current - last}位`}
  } else {
    return {icon: <span>-</span>, color: "gray", text: "持平"}
  }
}

// 获取排名对应的奖杯图标
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <CrownOutlined style={{color: "#FFD700", fontSize: "24px"}}/>
    case 2:
      return <CrownOutlined style={{color: "#C0C0C0", fontSize: "22px"}}/>
    case 3:
      return <CrownOutlined style={{color: "#CD7F32", fontSize: "20px"}}/>
    default:
      return <span className="rank-number">{rank}</span>
  }
}

export default function MoYuLeaderboard() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<MoYuUser[]>([])

  // 模拟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 模拟刷新数据
  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      // 随机调整一下分数，模拟实时更新
      const updatedUsers = [...users]
        .map((user) => ({
          ...user,
          score: user.score + Math.floor(Math.random() * 100),
        }))
        .sort((a, b) => b.score - a.score)
        .map((user) => ({
          ...user,
          lastWeekRank: mockUsers.findIndex((u) => u.id === user.id) + 1,
          id: user.id,
        }))

      setUsers(updatedUsers)
      setLoading(false)
    }, 800)
  }

  // 表格列定义
  const columns = [
    {
      title: "排名",
      key: "rank",
      width: 80,
      render: (_: any, _record: any, index: number) => <div className="rank-cell">{getRankIcon(index + 1)}</div>,
    },
    {
      title: "用户",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: MoYuUser) => (
        <div className="user-cell">
          <Avatar src={record.avatar} size="large"/>
          <div className="user-info">
            <div className="user-name">{record.name}</div>
            <div className="user-department">{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: "摸鱼等级",
      key: "level",
      width: 120,
      render: (_: any, record: MoYuUser) => (
        <Tag color="blue" className="level-tag">
          {getLevelEmoji(record.level)} 摸鱼{record.level}级
        </Tag>
      ),
    },
    {
      title: "摸鱼分数",
      dataIndex: "score",
      key: "score",
      sorter: (a: MoYuUser, b: MoYuUser) => a.score - b.score,
      render: (score: number) => (
        <motion.div key={score} initial={{scale: 1.2}} animate={{scale: 1}} className="score-cell">
          <FireOutlined style={{color: "#ff4d4f", marginRight: 8}}/>
          {score}
        </motion.div>
      ),
    },
    {
      title: "连续摸鱼",
      key: "streak",
      width: 120,
      render: (_: any, record: MoYuUser) => (
        <Tooltip title={`连续摸鱼${record.streak}天`}>
          <Badge count={record.streak} showZero color="#52c41a">
            <Tag color="green" className="streak-tag">
              🔥 连续摸鱼
            </Tag>
          </Badge>
        </Tooltip>
      ),
    },
    {
      title: "排名变化",
      key: "rankChange",
      width: 120,
      render: (_: any, record: MoYuUser, index: number) => {
        const change = getRankChange(index + 1, record.lastWeekRank)
        return (
          <Tag color={change.color as any} className="rank-change-tag">
            {change.icon} {change.text}
          </Tag>
        )
      },
    },
    {
      title: "最近活跃",
      dataIndex: "lastActive",
      key: "lastActive",
      width: 120,
      render: (text: string) => (
        <span>
          <ClockCircleOutlined style={{marginRight: 4}}/> {text}
        </span>
      ),
    },
  ]

  return (
    <div className="moyu-leaderboard">
      <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
        <Card
          title={
            <div className="leaderboard-header">
              <TrophyOutlined className="trophy-icon"/> 摸鱼排行榜 🐟
            </div>
          }
          // extra={
          //   <Button type="primary" icon={<ReloadOutlined/>} onClick={refreshData} loading={loading}>
          //     刷新榜单
          //   </Button>
          // }
          className="leaderboard-card"
        >


          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="榜单加载中..."/>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <Table
                  dataSource={users}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  className="moyu-table"
                  rowClassName={(record, index) => (index < 3 ? `top-${index + 1}-row` : "")}
                />
              </motion.div>
            </AnimatePresence>
          )}

          <div className="leaderboard-footer">
            <p>🏊‍♂️ 摸鱼时间：工作日 9:00 - 18:00 | 🎯 每次摸鱼可得 1-100 分</p>
            <p>💡 小贴士：摸鱼不要太明显，被老板发现就没分了！</p>
          </div>
        </Card>
      </motion.div>

      <style>{`
        .moyu-leaderboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .leaderboard-card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
        }

        .trophy-icon {
          color: #faad14;
          font-size: 24px;
          margin-right: 8px;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: bold;
        }

        .user-department {
          font-size: 12px;
          color: #8c8c8c;
        }

        .level-tag, .streak-tag, .rank-change-tag {
          border-radius: 12px;
          padding: 2px 8px;
          font-weight: bold;
        }

        .score-cell {
          font-weight: bold;
          color: #ff4d4f;
        }

        .rank-cell {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40px;
        }

        .rank-number {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #f0f0f0;
          font-weight: bold;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        }

        .leaderboard-footer {
          margin-top: 20px;
          text-align: center;
          color: #8c8c8c;
          font-size: 14px;
        }

        .top-1-row {
          background-color: rgba(255, 215, 0, 0.05);
        }

        .top-2-row {
          background-color: rgba(192, 192, 192, 0.05);
        }

        .top-3-row {
          background-color: rgba(205, 127, 50, 0.05);
        }

        .ant-table-cell {
          padding: 16px 8px !important;
        }
      `}</style>
    </div>
  )
}

