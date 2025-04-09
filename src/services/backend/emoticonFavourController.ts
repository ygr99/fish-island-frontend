// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 新增收藏表情包 POST /api/emoticon_favour/add */
export async function addEmoticonFavourUsingPost(body: string, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/emoticon_favour/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除收藏表情包 POST /api/emoticon_favour/delete */
export async function deleteEmoticonFavourUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/emoticon_favour/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据用户id分页查询收藏表情包 POST /api/emoticon_favour/list/page */
export async function listEmoticonFavourByPageUsingPost(
  body: API.PageRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmoticonFavour_>('/api/emoticon_favour/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
