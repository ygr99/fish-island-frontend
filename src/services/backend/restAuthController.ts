// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** callback GET /api/oauth/callback/${param0} */
export async function callbackUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackUsingGETParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.ModelAndView>(`/api/oauth/callback/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** callback PUT /api/oauth/callback/${param0} */
export async function callbackUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.ModelAndView>(`/api/oauth/callback/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** callback POST /api/oauth/callback/${param0} */
export async function callbackUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.ModelAndView>(`/api/oauth/callback/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** callback DELETE /api/oauth/callback/${param0} */
export async function callbackUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.ModelAndView>(`/api/oauth/callback/${param0}`, {
    method: 'DELETE',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** callback PATCH /api/oauth/callback/${param0} */
export async function callbackUsingPatch(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackUsingPATCHParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.ModelAndView>(`/api/oauth/callback/${param0}`, {
    method: 'PATCH',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** renderAuth GET /api/oauth/render/${param0} */
export async function renderAuthUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.renderAuthUsingGETParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(`/api/oauth/render/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** unbind DELETE /api/oauth/unbind/${param0} */
export async function unbindUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unbindUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { source: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/oauth/unbind/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
