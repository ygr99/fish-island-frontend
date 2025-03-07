import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Button, Image, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface BossKeySettingsProps {
  visible: boolean;
  onClose: () => void;
  onConfigUpdate: (config: BossKeyConfig) => void;
}

interface BossKeyConfig {
  image: string;
  title: string;
  placeholder: string;
}

const BossKeySettings: React.FC<BossKeySettingsProps> = ({ visible, onClose, onConfigUpdate }) => {
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // 从localStorage加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('bossKeyConfig');
    if (savedConfig) {
      const config: BossKeyConfig = JSON.parse(savedConfig);
      if (config.image) {
        setPreviewImage(config.image);
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: config.image,
          },
        ]);
      }
    }
  }, [form]);

  const handleSubmit = async () => {
    const config: BossKeyConfig = {
      image: previewImage || '',
      title: '工作页面',
      placeholder: '百度一下，你就知道'
    };
    localStorage.setItem('bossKeyConfig', JSON.stringify(config));
    onClose();
  };

  const handleImageUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleChange = async ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        try {
          setUploading(true);
          message.loading('图片处理中...', 0);
          
          const base64 = await handleImageUpload(file);
          setPreviewImage(base64);
          
          // 立即更新配置
          const newConfig: BossKeyConfig = {
            image: base64,
            title: '工作页面',
            placeholder: '百度一下，你就知道'
          };
          localStorage.setItem('bossKeyConfig', JSON.stringify(newConfig));
          onConfigUpdate(newConfig);
          
          message.destroy(); // 清除loading消息
          message.success('图片已更新');
        } catch (error) {
          message.destroy();
          message.error('图片处理失败，请重试');
          console.error('Error uploading image:', error);
        } finally {
          setUploading(false);
        }
      }
    } else {
      setPreviewImage('');
      // 清除图片时也更新配置
      const newConfig: BossKeyConfig = {
        image: '',
        title: '工作页面',
        placeholder: '百度一下，你就知道'
      };
      localStorage.setItem('bossKeyConfig', JSON.stringify(newConfig));
      onConfigUpdate(newConfig);
    }
  };

  return (
    <Modal
      title="老板键设置"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label="上传工作模式背景图">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={() => false}
            maxCount={1}
            disabled={uploading}
          >
            {fileList.length === 0 && (
              uploading ? <LoadingOutlined /> : <UploadOutlined />
            )}
          </Upload>
          <div className="text-gray-500 text-sm mt-2">
            提示：上传图片后，按下老板键将全屏显示此图片。不上传图片则显示默认的百度搜索页面。
          </div>
        </Form.Item>

        {previewImage && (
          <Form.Item label="预览效果">
            <div style={{ textAlign: 'center' }}>
              <Image
                src={previewImage}
                alt="预览"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" onClick={onClose} block>
            完成
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BossKeySettings; 