import { defineMiddleware } from 'astro/middleware';
import { type OptionalVerifyTokenOptions, type RequestState, constants } from '@clerk/backend';
import type { MultiDomainAndOrProxy } from '@clerk/types';
import type { APIContext } from 'astro';
import { clerkClient } from '../v0/clerkClient';
import { publishableKey } from '../v0/constants';
import { getAuth } from '.';
import { authenticateRequest } from '../v0/authenticateRequest';
import { createCurrentUser } from './current-user';

type WithAuthOptions = OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    publishableKey?: string;
    secretKey?: string;
    signInUrl?: string;
  };

export const apiEndpointUnauthorizedNextResponse = () => {
  return new Response(null, {
    status: 401,
    statusText: 'Unauthorized',
  });
};

const decorateResponseWithObservabilityHeaders = (res: Response, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

export const handleUnknownState = (requestState: RequestState) => {
  const response = apiEndpointUnauthorizedNextResponse();
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export const createRouteMatcher = () => {
  return (req: Request) => [/\/api\//].some((matcher) => matcher.test(req.url));
};

const isRequestMethodIndicatingApiRoute = (req: Request): boolean => {
  const requestMethod = req.method.toLowerCase();
  return !['get', 'head', 'options'].includes(requestMethod);
};

const isRequestContentTypeJson = (req: Request): boolean => {
  const requestContentType = req.headers.get(constants.Headers.ContentType);
  return requestContentType === constants.ContentTypes.Json;
};

const createApiRoutes = (): ((req: Request) => boolean) => {
  const isDefaultApiRoute = createRouteMatcher();
  return (req: Request) =>
    isDefaultApiRoute(req) || isRequestMethodIndicatingApiRoute(req) || isRequestContentTypeJson(req);
};

export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain } = params;
  return {
    isSignedIn,
    proxyUrl,
    isInterstitial,
    reason,
    message,
    publishableKey,
    isSatellite,
    domain,
  };
};

export const handleInterstitialState = (requestState: RequestState, opts: WithAuthOptions) => {
  const response = new Response(
    clerkClient.localInterstitial({
      publishableKey: opts.publishableKey || publishableKey,
      clerkJSUrl: '',
      clerkJSVersion: '',
      proxyUrl: requestState.proxyUrl,
      isSatellite: requestState.isSatellite,
      domain: requestState.domain,
      // @ts-ignore
      debugData: debugRequestState(requestState),
      signInUrl: requestState.signInUrl,
    }),
    {
      status: 401,
      headers: {
        'content-type': 'text/html',
      },
    },
  );
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export function decorateRequest(
  req: Request,
  locals: APIContext['locals'],
  res: Response,
  requestState: RequestState,
): Response {
  const { reason, message, status } = requestState;

  locals.authStatus = status;
  locals.authMessage = message;
  locals.authReason = reason;
  locals.auth = () => getAuth(req, locals);
  locals.currentUser = createCurrentUser(req, locals);

  res.headers.set(constants.Headers.AuthStatus, status);
  res.headers.set(constants.Headers.AuthMessage, message || '');
  res.headers.set(constants.Headers.AuthReason, reason || '');

  return res;
}

export const clerkMiddleware = () => {
  return defineMiddleware(async (context, next) => {
    const isApiRoute = createApiRoutes();

    const requestState = await authenticateRequest({ server: context.request });

    if (requestState.isUnknown) {
      return handleUnknownState(requestState);
    } else if (requestState.isInterstitial && isApiRoute(context.request)) {
      return handleUnknownState(requestState);
    } else if (requestState.isInterstitial) {
      const res = handleInterstitialState(requestState, {});
      return res;
    }

    const finalRes = (await next()) as Response;

    // @ts-ignore
    return decorateRequest(context.request, context.locals, finalRes, requestState);
  });
};
