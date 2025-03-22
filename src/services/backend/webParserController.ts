// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 解析网页信息 GET /api/api/web/parse */
export async function parseWebPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.parseWebPageUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseWebParseVO_>('/api/api/web/parse', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
