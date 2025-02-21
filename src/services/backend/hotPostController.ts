// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取列表（封装类） POST /api/hot/list */
export async function getHotPostListUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListHotPostVO_>('/api/hot/list', {
    method: 'POST',
    ...(options || {}),
  });
}
