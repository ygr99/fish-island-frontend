import {Col, Row, Card, Badge, Image, List, Typography} from 'antd';
import React from "react";
import zhihu from '@/assets/zhihu.png'; // 引入图片
import douban from '@/assets/douban.png'; // 引入图片
const data = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.',
];
export default () => {
  // @ts-ignore
  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Badge.Ribbon text="知乎">
            <Card
              title={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Image
                    src={zhihu}
                    preview={false} // 不启用预览
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  知乎热榜
                </div>
              }
            >
              <List
                dataSource={data}
                renderItem={(item) => (
                  <List.Item>
                    <Typography.Text mark>[ITEM]</Typography.Text> {item}
                  </List.Item>
                )}
              />
            </Card>
          </Badge.Ribbon>
        </Col>
        <Col span={12}>
          <Badge.Ribbon text="豆瓣">
            <Card
              title={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Image
                    src={douban}
                    preview={false} // 不启用预览
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  豆瓣热话
                </div>
              }
            >
              Card content
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>


    </>
  );
};
