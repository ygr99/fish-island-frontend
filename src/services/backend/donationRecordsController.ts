// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 添加打赏记录 POST /api/donation/add */
export async function addDonationRecordsUsingPost(
  body: API.DonationRecordsAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/donation/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除打赏记录 POST /api/donation/delete */
export async function deleteDonationUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/donation/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据 id 获取打赏记录包装类 GET /api/donation/get/vo */
export async function getDonationRecordsVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDonationRecordsVoByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseDonationRecordsVO_>('/api/donation/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取打赏记录列表（仅管理员） POST /api/donation/list/page */
export async function listDonationByPageUsingPost(
  body: API.DonationRecordsQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageDonationRecords_>('/api/donation/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取打赏记录列表（封装类） POST /api/donation/list/page/vo */
export async function listDonationVoByPageUsingPost(
  body: API.DonationRecordsQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageDonationRecordsVO_>('/api/donation/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新打赏记录（仅管理员） POST /api/donation/update */
export async function updateDonationRecordsUsingPost(
  body: API.DonationRecordsUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/donation/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
