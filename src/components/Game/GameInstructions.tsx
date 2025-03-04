import React from 'react';
import { Modal, Typography, Steps, Divider } from 'antd';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Smartphone } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

interface GameInstructionsProps {
  open: boolean;
  onClose: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ open, onClose }) => {
  return (
    <Modal
      title={<Title level={3}>2048 游戏说明</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Typography>
        <Paragraph>
          2048 是一款简单而有趣的数字益智游戏。游戏的目标是在网格上滑动方块，将相同数字的方块合并，最终获得一个数值为 2048 的方块。
        </Paragraph>

        <Divider orientation="left">游戏规则</Divider>
        
        <Steps
          direction="vertical"
          items={[
            {
              title: '移动方块',
              description: (
                <div>
                  <Paragraph>
                    使用键盘方向键 <ArrowLeft className="inline h-4 w-4" /> <ArrowRight className="inline h-4 w-4" /> <ArrowUp className="inline h-4 w-4" /> <ArrowDown className="inline h-4 w-4" /> 或在触摸屏上滑动 <Smartphone className="inline h-4 w-4" /> 来移动所有方块。
                  </Paragraph>
                </div>
              ),
            },
            {
              title: '合并方块',
              description: (
                <Paragraph>
                  当两个相同数字的方块相撞时，它们会合并成为一个新的方块，其数值是原来两个方块的总和。例如，两个 "2" 方块会合并成一个 "4" 方块。
                </Paragraph>
              ),
            },
            {
              title: '新方块出现',
              description: (
                <Paragraph>
                  每次移动后，如果有方块移动或合并，一个新的方块（数值为 2 或 4）会随机出现在空白位置。
                </Paragraph>
              ),
            },
            {
              title: '游戏目标',
              description: (
                <Paragraph>
                  游戏的主要目标是创建一个数值为 2048 的方块。达成这个目标后，您可以继续游戏，尝试获得更高的分数和更大的数字方块。
                </Paragraph>
              ),
            },
            {
              title: '游戏结束',
              description: (
                <Paragraph>
                  当网格填满且没有可以合并的相邻方块时，游戏结束。
                </Paragraph>
              ),
            },
          ]}
        />

        <Divider orientation="left">游戏技巧</Divider>
        
        <Paragraph>
          <ul className="list-disc pl-5">
            <li>尽量保持大数值的方块在角落位置</li>
            <li>尝试保持方块有序排列，避免小数值方块散布在网格中</li>
            <li>提前规划您的移动，考虑几步之后的局面</li>
            <li>避免频繁地上下左右来回移动，这可能导致小数值方块分散</li>
          </ul>
        </Paragraph>

        <Divider />
        
        <Paragraph className="text-center">
          <Text type="secondary">祝您游戏愉快！</Text>
        </Paragraph>
      </Typography>
    </Modal>
  );
};

export default GameInstructions;