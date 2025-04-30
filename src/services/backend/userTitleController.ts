// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户可用的称号列表 GET /api/user/title/list */
export async function listAvailableFramesUsingGet1(options?: { [key: string]: any }) {
  return request<API.BaseResponseListUserTitle_>('/api/user/title/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 设置当前使用的称号 POST /api/user/title/set */
export async function setCurrentFrameUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setCurrentFrameUsingPOST1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/title/set', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
