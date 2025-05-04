// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** getRandomHero GET /api/hero/get/random */
export async function getRandomHero(
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHeroVO_>('/api/hero/get/random', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getNewHero GET /api/hero/get/new */
export async function getNewHero(
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHeroVO_>('/api/hero/get/new', {
    method: 'GET',
    ...(options || {}),
  });
}

/** listSimpleHero GET /api/hero/list/simple */
export async function listSimpleHero(
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSimpleHeroVO_>('/api/hero/list/simple', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getHeroById GET /api/hero/get */
export async function getHeroById(
  params: {
    id: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHeroVO_>('/api/hero/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
