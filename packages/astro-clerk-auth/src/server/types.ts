import type { defineMiddleware } from 'astro/middleware';

export type AstroMiddleware = Parameters<typeof defineMiddleware>[0];
export type AstroMiddlewareContextParam = Parameters<AstroMiddleware>['0'];
export type AstroMiddlewareNextParam = Parameters<AstroMiddleware>['1'];
export type AstroMiddlewareReturn =
  // Promise<void> | void |
  Response | Promise<Response>;
