// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 禁言用户 POST /api/user/mute/add */
export async function muteUserUsingPost(
  body: API.UserMuteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/mute/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户禁言状态 GET /api/user/mute/info */
export async function getUserMuteInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserMuteInfoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUserMuteVO_>('/api/user/mute/info', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 解除用户禁言 POST /api/user/mute/remove */
export async function unmuteUserUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unmuteUserUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/mute/remove', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
