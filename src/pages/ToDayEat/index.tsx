import {useState} from "react"
import {Button, Card, Radio, Typography, Space, ConfigProvider} from "antd"
import {ThunderboltOutlined} from "@ant-design/icons"
import "./index.css"

const {Title, Text} = Typography

export default function FoodRecommender() {
  const [mealTime, setMealTime] = useState("lunch")
  const [recommendation, setRecommendation] = useState("")

  const foodOptions: any = {
    breakfast: ["豆浆油条", "包子", "煎饼果子", "粥", "三明治", "牛奶麦片"],
    lunch: ["红烧肉盖饭", "兰州拉面", "麻辣香锅", "沙拉", "汉堡", "披萨", "寿司"],
    dinner: ["火锅", "烤鱼", "炒菜", "烧烤", "西餐牛排", "意大利面"],
    night: ["烤串", "炸鸡", "夜宵套餐", "小龙虾", "关东煮", "泡面"],
  }

  const getRandomFood = () => {
    const options =
      mealTime === "all"
        ? [...foodOptions.breakfast, ...foodOptions.lunch, ...foodOptions.dinner, ...foodOptions.night]
        : foodOptions[mealTime]

    const randomIndex = Math.floor(Math.random() * options.length)
    setRecommendation(options[randomIndex])
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f26522",
        },
      }}
    >
      <div className="food-recommender">
        <div className="header">
          <Title level={1} className="title">
            今天吃啥
          </Title>
          <Text className="subtitle">解决选择困难症的美食推荐神器</Text>
        </div>

        <div className="content">
          <Radio.Group
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            buttonStyle="solid"
            className="meal-tabs"
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="breakfast">早餐</Radio.Button>
            <Radio.Button value="lunch">午餐</Radio.Button>
            <Radio.Button value="dinner">晚餐</Radio.Button>
            <Radio.Button value="night">夜宵</Radio.Button>
          </Radio.Group>

          <Card className="recommendation-card">
            <Space direction="vertical" size="large" style={{width: "100%", textAlign: "center"}}>
              <Text className="question">不知道吃什么？</Text>
              <Title level={3} className="instruction">
                点击下方按钮随机推荐
              </Title>
              {recommendation && (
                <Title level={2} className="result">
                  {recommendation}
                </Title>
              )}
            </Space>
          </Card>

          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined/>}
            className="recommend-button"
            onClick={getRandomFood}
          >
            给我推荐
          </Button>
        </div>
      </div>
    </ConfigProvider>
  )
}
