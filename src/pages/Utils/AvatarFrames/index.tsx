import React, { useState, useEffect } from 'react';
import { Avatar, Button, message, Spin, Skeleton } from 'antd';
import { getLoginUserUsingGet } from '@/services/backend/userController';
import { listAvatarFrameVoByPageUsingPost, exchangeFrameUsingPost, setCurrentFrameUsingPost } from '@/services/backend/avatarFrameController';
import styles from './index.module.less';
import { useModel } from '@umijs/max';
import InfiniteScroll from 'react-infinite-scroll-component';

const AvatarFrames: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [frames, setFrames] = useState<API.AvatarFrameVO[]>([]);
  const [currentUser, setCurrentUser] = useState<API.LoginUserVO | null>(null);
  const [previewFrame, setPreviewFrame] = useState<API.AvatarFrameVO | null>(null);
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 获取当前登录用户
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getLoginUserUsingGet();
        if (res.data) {
          setCurrentUser(res.data);
        }
      } catch (error) {
        message.error('获取用户信息失败');
      }
    };
    fetchUser();
  }, []);

  // 获取头像框列表
  const fetchFrames = async (page: number) => {
    try {
      const res = await listAvatarFrameVoByPageUsingPost({
        current: page,
        pageSize: 10,
      });
      if (res?.data) {
        // 添加空头像框作为第一个选项（仅在第一页）
        if (page === 1) {
          const emptyFrame: API.AvatarFrameVO = {
            id: -1,
            name: '无头像框',
            points: 0,
            url: '',
            hasOwned: true
          };
          setFrames([emptyFrame, ...(res.data.records ?? [])]);
        } else {
          setFrames(prev => [...prev, ...(res.data.records ?? [])]);
        }
        setTotal((Number(res.data.total) ?? 0) + (page === 1 ? 1 : 0));
        setHasMore((res.data.records?.length ?? 0) > 0);
      }
    } catch (error) {
      message.error('获取头像框列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchFrames(1);
  }, []);

  const loadMoreData = () => {
    if (loading) return;
    setLoading(true);
    const nextPage = current + 1;
    setCurrent(nextPage);
    fetchFrames(nextPage);
  };

  const handlePurchase = async (frame: API.AvatarFrameVO) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    const availablePoints = (currentUser.points ?? 0) - (currentUser.usedPoints ?? 0);
    if (availablePoints < (frame.points ?? 0)) {
      message.error('可用积分不足');
      return;
    }

    try {
      const res = await exchangeFrameUsingPost({
        frameId: frame.id ?? 0,
      });
      if (res.data) {
        message.success('购买成功！');
        // 刷新用户信息和头像框列表
        const userRes = await getLoginUserUsingGet();
        if (userRes.data) {
          setCurrentUser(userRes.data);
        }
        // 重新加载第一页数据
        setCurrent(1);
        fetchFrames(1);
      }
    } catch (error) {
      message.error('购买失败，请重试');
    }
  };

  const handleSetFrame = async (frame: API.AvatarFrameVO) => {
    try {
      const res = await setCurrentFrameUsingPost({
        frameId: frame.id ?? 0,
      });
      if (res.data) {
        message.success('设置成功！');
        // 刷新用户信息
        const userRes = await getLoginUserUsingGet();
        if (userRes.data) {
          setCurrentUser(userRes.data);
          // 更新全局状态
          setInitialState((s) => ({
            ...s,
            currentUser: userRes.data,
          }));
        }
      }
    } catch (error) {
      message.error('设置失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>头像框商城</h1>
          <p className={styles.subtitle}>用积分兑换专属头像框，展示你的个性</p>
        </div>
        <div className={styles.userPreview}>
          <div className={styles.avatarWithFrame}>
            <Avatar src={currentUser?.userAvatar} size={120} />
            {previewFrame && previewFrame.id !== -1 && (
              <img
                src={previewFrame.url}
                className={styles.avatarFrame}
                alt={previewFrame.name}
              />
            )}
          </div>
          <div className={styles.userPoints}>
            当前积分：{currentUser?.points ?? 0}
            <span className={styles.availablePoints}>
              （可用：{(currentUser?.points ?? 0) - (currentUser?.usedPoints ?? 0)}）
            </span>
          </div>
        </div>
      </div>

      <InfiniteScroll
        dataLength={frames.length}
        next={loadMoreData}
        hasMore={hasMore}
        loader={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        }
        endMessage={
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            没有更多头像框了
          </div>
        }
      >
        <div className={styles.frameList}>
          {frames.map((frame) => (
            <div
              key={frame.id}
              className={styles.frameItem}
              onMouseEnter={() => setPreviewFrame(frame)}
              onMouseLeave={() => setPreviewFrame(null)}
            >
              <div className={styles.framePreview}>
                <div className={styles.frameDisplay}>
                  <div className={styles.placeholderCircle} />
                  {frame.id !== -1 && (
                    <img
                      src={frame.url}
                      className={styles.avatarFrame}
                      alt={frame.name}
                    />
                  )}
                </div>
              </div>
              <div className={styles.frameInfo}>
                <div className={styles.priceTag}>
                  {frame.points} 积分
                </div>
                {frame.hasOwned ? (
                  <Button
                    type="primary"
                    onClick={() => handleSetFrame(frame)}
                    className={styles.purchaseButton}
                  >
                    使用
                  </Button>
                ) : (
                  <Button
                    type="default"
                    danger
                    onClick={() => handlePurchase(frame)}
                    className={styles.purchaseButton}
                  >
                    立即兑换
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default AvatarFrames;
