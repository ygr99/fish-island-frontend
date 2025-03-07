import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Button, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface BossKeySettingsProps {
  visible: boolean;
  onClose: () => void;
}

interface BossKeyConfig {
  image: string;
}

const BossKeySettings: React.FC<BossKeySettingsProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        try {
          const base64 = await handleImageUpload(file);
          setPreviewImage(base64);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    } else {
      setPreviewImage('');
    }
    setFileList(newFileList);
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
          >
            {fileList.length === 0 && <UploadOutlined />}
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
          <Button type="primary" onClick={handleSubmit} block>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BossKeySettings; 