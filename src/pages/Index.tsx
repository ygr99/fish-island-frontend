import {Col, Row, Card, Badge, Image, List, Typography} from 'antd';
import React from "react";

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
      <Row gutter={[16,16]}>
        <Col span={12}>
          <Badge.Ribbon text="知乎">
            <Card
              title={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Image
                    src={"https://s1.aigei.com/src/img/png/5a/5a7a40a62b6f4383a2d3426a069b2893.png?imageMogr2/auto-orient/thumbnail/!133x132r/gravity/Center/crop/133x132/quality/85/%7CimageView2/2/w/133&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:J6OKFOfvHnmVEfjEvu9HYKrEhuU="}
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
          <Badge.Ribbon text="知乎">
            <Card
              title={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Image
                    src={"https://s1.aigei.com/src/img/png/5a/5a7a40a62b6f4383a2d3426a069b2893.png?imageMogr2/auto-orient/thumbnail/!133x132r/gravity/Center/crop/133x132/quality/85/%7CimageView2/2/w/133&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:J6OKFOfvHnmVEfjEvu9HYKrEhuU="}
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
          <Badge.Ribbon text="知乎">
            <Card
              title={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Image
                    src={"https://s1.aigei.com/src/img/png/5a/5a7a40a62b6f4383a2d3426a069b2893.png?imageMogr2/auto-orient/thumbnail/!133x132r/gravity/Center/crop/133x132/quality/85/%7CimageView2/2/w/133&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:J6OKFOfvHnmVEfjEvu9HYKrEhuU="}
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
      </Row>


    </>
  );
};
