import { Request } from 'express';

export function pagination(req: Request) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 25), 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function paged<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) } };
}
