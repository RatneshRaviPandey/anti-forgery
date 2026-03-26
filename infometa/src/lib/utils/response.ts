import { NextResponse } from 'next/server';

export const apiResponse = {
  success: (data: unknown, status = 200) =>
    NextResponse.json({ success: true, data }, { status }),

  created: (data: unknown) =>
    NextResponse.json({ success: true, data }, { status: 201 }),

  paginated: (data: unknown[], meta: { page: number; limit: number; total: number }) =>
    NextResponse.json({
      success: true,
      data,
      meta: {
        ...meta,
        totalPages: Math.ceil(meta.total / meta.limit),
        hasNext: meta.page * meta.limit < meta.total,
      },
    }),

  badRequest: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 400 }),

  unauthorized: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 401 }),

  forbidden: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 403 }),

  notFound: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 404 }),

  tooManyRequests: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 429 }),

  validationError: (errors: unknown) =>
    NextResponse.json({ success: false, error: 'Validation failed', details: errors }, { status: 422 }),

  serverError: (message: string) =>
    NextResponse.json({ success: false, error: message }, { status: 500 }),
};
