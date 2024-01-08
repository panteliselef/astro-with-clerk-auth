import type { AuthenticateRequestOptions, AuthObject, ClerkRequest, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, redirect } from '@clerk/backend/internal';
import { clerkClient } from '../v0/clerkClient';
import { DOMAIN, IS_SATELLITE, PROXY_URL, PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL } from '../v0/constants';
import type {
  AstroMiddleware,
  AstroMiddlewareNextParam,
  AstroMiddlewareContexttParam,
  AstroMiddlewareReturn,
} from './types';
import { getAuth } from './get-auth';
import { handleValueOrFn, isDevelopmentFromSecretKey, isHttpOrHttps } from '@clerk/shared';
import { APIContext } from 'astro';
import { createCurrentUser } from './current-user';

type ClerkMiddlewareAuthObject = AuthObject;

type ClerkAstroMiddlewareHandler = (
  auth: () => ClerkMiddlewareAuthObject,
  context: AstroMiddlewareContexttParam,
  next: AstroMiddlewareNextParam,
) => AstroMiddlewareReturn;

type ClerkAstroMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

/**
 * Middleware for Astro that handles authentication and authorization with Clerk.
 */
interface ClerkMiddleware {
  /**
   * @example
   * export default clerkMiddleware((auth, context, next) => { ... }, options);
   */
  (handler: ClerkAstroMiddlewareHandler, options?: ClerkAstroMiddlewareOptions): AstroMiddleware;
  /**
   * @example
   * export default clerkMiddleware(options);
   */
  (options?: ClerkAstroMiddlewareOptions): AstroMiddleware;
}

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]): any => {
  const [handler, options] = parseHandlerAndOptions(args);

  const nextMiddleware: AstroMiddleware = async (context, next) => {
    const clerkRequest = createClerkRequest(context.request);

    const requestState = await clerkClient.authenticateRequest(
      clerkRequest,
      createAuthenticateRequestOptions(clerkRequest, options),
    );

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      const res = new Response(null, { status: 307, headers: requestState.headers });
      return decorateResponseWithObservabilityHeaders(res, requestState);
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    const authObject = requestState.toAuth();

    const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, {});

    let handlerResult = (await next()) as Response;
    try {
      handlerResult = (await handler?.(() => authObjWithMethods, context, next)) || handlerResult;
    } catch (e: any) {
      switch (e.message) {
        default:
          throw e;
      }
    }

    // TODO: Handle Redirect thrown from handler
    // if (isRedirect(handlerResult)) {
    //   const res = setHeader(handlerResult, constants.Headers.AuthReason, 'redirect');
    //   return serverRedirectWithAuth(clerkRequest, res, options);
    // }

    const response = decorateRequest(clerkRequest, context.locals, handlerResult, requestState);
    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        response.headers.append(key, value);
      });
    }

    return response;
  };

  return nextMiddleware;
};

// Duplicate from '@clerk/nextjs'
const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [ClerkAstroMiddlewareHandler | undefined, ClerkAstroMiddlewareOptions];
};

// Duplicate from '@clerk/nextjs'
export const createAuthenticateRequestOptions = (clerkRequest: ClerkRequest, options: ClerkAstroMiddlewareOptions) => {
  return {
    ...options,
    secretKey: options.secretKey || SECRET_KEY,
    publishableKey: options.publishableKey || PUBLISHABLE_KEY,
    ...handleMultiDomainAndProxy(clerkRequest, options),
  };
};

// Duplicate from '@clerk/nextjs'
export const decorateResponseWithObservabilityHeaders = (res: Response, requestState: RequestState): Response => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
  return res;
};

// Duplicate from '@clerk/nextjs'
export const handleMultiDomainAndProxy = (clerkRequest: ClerkRequest, opts: AuthenticateRequestOptions) => {
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts?.proxyUrl, clerkRequest.clerkUrl, PROXY_URL);

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(clerkRequest.url), IS_SATELLITE);
  const domain = handleValueOrFn(opts.domain, new URL(clerkRequest.url), DOMAIN);
  const signInUrl = opts?.signInUrl || SIGN_IN_URL;

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(opts.secretKey || SECRET_KEY)) {
    throw new Error(missingSignInUrlInDev);
  }

  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
  };
};

// Duplicate from '@clerk/nextjs'
export const missingDomainAndProxy = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default authMiddleware({domain:'YOUR_DOMAIN',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'
   `;

// Duplicate from '@clerk/nextjs'
export const missingSignInUrlInDev = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default authMiddleware({signInUrl:'SOME_URL', isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'`;

function decorateRequest(
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

  /**
   * Populate every page with the authObject. This allows for SSR to work properly
   * without the developer having to wrap manually each page with `ClerkLayout.astro`
   * ^ ClerkLayout is still needed in order to populate the ssrState store, but it not responsible for passing the data to a page.
   */
  if (res.headers.get('content-type') === 'text/html') {
    const reader = res.body?.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          `<script id="__CLERK_ASTRO_DATA__" type="application/json">${JSON.stringify(locals.auth())}</script>\n`,
        );
        let { value, done } = await reader!.read();
        while (!done) {
          controller.enqueue(value);
          ({ value, done } = await reader!.read());
        }
        controller.close();
      },
    });

    const modifiedResponse = new Response(stream, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });

    return modifiedResponse;
  }
  return res;
}
