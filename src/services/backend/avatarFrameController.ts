// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 兑换头像框 POST /api/api/avatar/frame/exchange */
export async function exchangeFrameUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.exchangeFrameUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/api/avatar/frame/exchange', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取用户可用的头像框列表 GET /api/api/avatar/frame/list */
export async function listAvailableFramesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListAvatarFrame_>('/api/api/avatar/frame/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 分页获取头像框列表（封装类） POST /api/api/avatar/frame/list/page/vo */
export async function listAvatarFrameVoByPageUsingPost(
  body: API.AvatarFrameQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageAvatarFrameVO_>('/api/api/avatar/frame/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 设置当前使用的头像框 POST /api/api/avatar/frame/set */
export async function setCurrentFrameUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setCurrentFrameUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/api/avatar/frame/set', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
