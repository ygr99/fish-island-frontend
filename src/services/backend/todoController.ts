// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前登录用户待办数据 POST /api/todo/get */
export async function getTodoUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/todo/get', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 保存当前登录用户待办数据 POST /api/todo/save */
export async function saveTodoUsingPost(body: API.SaveTodoDto, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/todo/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
