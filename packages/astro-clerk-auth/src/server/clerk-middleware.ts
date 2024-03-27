import type { AuthenticateRequestOptions, AuthObject, ClerkRequest, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { clerkClient } from '../v0/clerkClient';
import { DOMAIN, IS_SATELLITE, PROXY_URL, PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL } from '../v0/constants';
import type {
  AstroMiddleware,
  AstroMiddlewareNextParam,
  AstroMiddlewareContextParam,
  AstroMiddlewareReturn,
} from './types';
import { getAuth } from './get-auth';
import { handleValueOrFn, isDevelopmentFromSecretKey, isHttpOrHttps } from '@clerk/shared';
import { APIContext } from 'astro';
import { createCurrentUser } from './current-user';
import { isRedirect, setHeader } from './utils';
import { serverRedirectWithAuth } from './server-redirect-with-auth';
import { buildClerkHotloadScript } from './build-clerk-hotload-script';

const CONTROL_FLOW_ERROR = {
  REDIRECT_TO_SIGN_IN: 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN',
};

type ClerkMiddlewareAuthObject = AuthObject & {
  redirectToSignIn: (opts?: { returnBackUrl?: URL | string | null }) => Response;
};

type ClerkAstroMiddlewareHandler = (
  auth: () => ClerkMiddlewareAuthObject,
  context: AstroMiddlewareContextParam,
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

  const astroMiddleware: AstroMiddleware = async (context, next) => {
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

    const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
    const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { redirectToSignIn });

    decorateAstroLocal(context.request, context.locals, requestState);

    /**
     * Generate SSR page
     */
    let handlerResult: Response;
    try {
      handlerResult = (await handler?.(() => authObjWithMethods, context, next)) || ((await next()) as Response);
    } catch (e: any) {
      handlerResult = handleControlFlowErrors(e, clerkRequest, requestState);
    }

    if (isRedirect(handlerResult)) {
      return serverRedirectWithAuth(context, clerkRequest, handlerResult, options);
    }

    const response = await decorateRequest(context.locals, handlerResult, requestState);
    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        response.headers.append(key, value);
      });
    }

    return response;
  };

  return astroMiddleware;
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

function decorateAstroLocal(req: Request, locals: APIContext['locals'], requestState: RequestState) {
  const { reason, message, status, token } = requestState;
  locals.authToken = token;
  locals.authStatus = status;
  locals.authMessage = message;
  locals.authReason = reason;
  locals.auth = () => getAuth(req, locals);
  locals.currentUser = createCurrentUser(req, locals);
}

async function decorateRequest(
  locals: APIContext['locals'],
  res: Response,
  requestState: RequestState,
): Promise<Response> {
  const { reason, message, status, token } = requestState;

  res.headers.set(constants.Headers.AuthToken, token || '');
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
        let { value, done } = await reader!.read();
        while (!done) {
          const decodedValue = new TextDecoder().decode(value);

          /**
           * Hijack html response to position `__CLERK_ASTRO_DATA__` before the closing `head` html tag
           */
          if (decodedValue.includes('</head>')) {
            const [p1, p2] = decodedValue.split('</head>');
            controller.enqueue(p1);
            controller.enqueue(
              `<script id="__CLERK_ASTRO_DATA__" type="application/json">${JSON.stringify(locals.auth())}</script>\n`,
            );

            if (__HOTLOAD__) {
              controller.enqueue(buildClerkHotloadScript());
            }

            controller.enqueue('</head>');
            controller.enqueue(p2);
          } else {
            controller.enqueue(value);
          }

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

const redirectAdapter = (url: string | URL) => {
  const res = new Response(null, {
    status: 307,
  });

  /**
   * Hint to clerk to add cookie with db jwt
   */
  setHeader(res, constants.Headers.ClerkRedirectTo, 'true');
  return setHeader(res, 'Location', url instanceof URL ? url.href : url);
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN) as any;
    err.returnBackUrl = opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkRequest.clerkUrl.toString();
    throw err;
  };
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (e: any, clerkRequest: ClerkRequest, requestState: RequestState): Response => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return createRedirect({
        redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        publishableKey: PUBLISHABLE_KEY,
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
