import { MiddlewareNextResponse, MiddlewareResponseHandler } from 'astro';

export type AstroMiddleware = MiddlewareResponseHandler;
export type AstroMiddlewareContextParam = Parameters<AstroMiddleware>['0'];
export type AstroMiddlewareNextParam = MiddlewareNextResponse;
export type AstroMiddlewareReturn = Response | Promise<Response>;
