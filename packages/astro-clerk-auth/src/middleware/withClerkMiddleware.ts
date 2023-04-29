import type { AuthStatus, RequestState } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import { next } from '@vercel/edge';
import { API_KEY, FRONTEND_API, PUBLISHABLE_KEY, SECRET_KEY, clerkClient } from './clerk';
import type { WithAuthOptions } from './types';
import {
  getCookie,
  setCustomAttributeOnRequest,
} from './utils';
import { isRedirect } from './redirect';

type MiddlewareResult = Response | null | undefined | void;
type Middleware = (request: Request) => MiddlewareResult | Promise<MiddlewareResult>;

export const decorateResponseWithObservabilityHeaders = (res: Response, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

export const withClerkMiddleware = (...args: unknown[]) => {
  const noop = () => undefined;
  const [handler = noop, opts = {}] = args as [Middleware, WithAuthOptions] | [];
  // const proxyUrl = opts?.proxyUrl || PROXY_URL;

  // if (!!proxyUrl && !isHttpOrHttps(proxyUrl)) {
  //   throw new Error(unsupportedRelativePathProxyUrl);
  // }

  return async (req: Request) => {
    const { headers } = req;

    // const isSatellite = handleValueOrFn(opts.isSatellite, new URL(req.url), IS_SATELLITE);
    // const domain = handleValueOrFn(opts.domain, new URL(req.url), DOMAIN);
    // const signInUrl = opts?.signInUrl || SIGN_IN_URL;

    // if (isSatellite && !proxyUrl && !domain) {
    //   throw new Error(missingDomainAndProxy);
    // }

    // if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(SECRET_KEY || API_KEY)) {
    //   throw new Error(missingSignInUrlInDev);
    // }

    // get auth state, check if we need to return an interstitial
    const cookieToken = getCookie(req, constants.Cookies.Session);
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');
    const requestState = await clerkClient.authenticateRequest({
      ...opts,
      apiKey: opts.apiKey || API_KEY,
      secretKey: opts.secretKey || SECRET_KEY,
      frontendApi: opts.frontendApi || FRONTEND_API,
      publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
      cookieToken,
      headerToken,
      clientUat: getCookie(req, constants.Cookies.ClientUat),
      origin: headers.get('origin') || undefined,
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port') || undefined,
      forwardedHost: headers.get('x-forwarded-host') || undefined,
      referrer: headers.get('referer') || undefined,
      userAgent: headers.get('user-agent') || undefined,
      proxyUrl: '',
      isSatellite: false,
      domain: '',
      searchParams: new URL(req.url).searchParams,
      signInUrl: '',
    });

    // console.log(requestState);

    // Interstitial case
    // Note: there is currently no way to rewrite to a protected endpoint
    // Therefore we have to resort to a public interstitial endpoint
    if (requestState.isInterstitial || requestState.isUnknown) {
      const interstitialHtml = clerkClient.localInterstitial({
        pkgVersion: '',
        frontendApi: '',
        publishableKey: 'pk_test_aW50ZXJuYWwtamF2ZWxpbi05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
        debugData: debugRequestState(requestState),
      });
      const response = new Response(`<!DOCTYPE html><html${interstitialHtml}</html>`, {
        status: 401,
        headers: {
          'content-type': 'text/html',
          [constants.Headers.AuthMessage]: requestState.message,
          [constants.Headers.AuthReason]: requestState.reason || '',
          [constants.Headers.AuthStatus]: requestState.status || '',
        },
      });

      decorateResponseWithObservabilityHeaders(response, requestState);
      return response;
    }

    // Set auth result on request in a private property so that middleware can read it too
    setCustomAttributeOnRequest(req, constants.Attributes.AuthStatus, requestState.status);
    setCustomAttributeOnRequest(req, constants.Attributes.AuthMessage, requestState.message || '');
    setCustomAttributeOnRequest(req, constants.Attributes.AuthReason, requestState.reason || '');

    // get result from provided handler
    const res = await handler(req);

    const { status: authStatus, reason: authReason, message: authMessage } = requestState;

    return handleMiddlewareResult({
      req,
      res,
      authStatus,
      authReason,
      authMessage,
    });
  };
};

type HandleMiddlewareResultProps = {
  req: Request;
  res: MiddlewareResult;
  authStatus: AuthStatus;
  authReason: string | null;
  authMessage: string | null;
};

// Auth result will be set as both a query param & header when applicable
export function handleMiddlewareResult({
  // req,
  res,
  authStatus,
  authMessage,
  authReason,
}: HandleMiddlewareResultProps): MiddlewareResult {
  // pass-through case, convert to next()
  if (!res) {
    res = next();
  }

  // redirect() case, return early
  if (isRedirect(res)) {
    return res;
  }

  // let rewriteURL;

  // next() case, convert to a rewrite
  // if (res.headers.get(nextConstants.Headers.NextResume) === '1') {
  //   res.headers.delete(nextConstants.Headers.NextResume);
  //   rewriteURL = new URL(req.url);
  // }

  // rewrite() case, set auth result only if origin remains the same
  // const rewriteURLHeader = res.headers.get(nextConstants.Headers.NextRewrite);

  // if (rewriteURLHeader) {
  //   const reqURL = new URL(req.url);
  //   rewriteURL = new URL(rewriteURLHeader);

  //   // if the origin has changed, return early
  //   if (rewriteURL.origin !== reqURL.origin) {
  //     return res;
  //   }
  // }

  // if (rewriteURL) {
  //   if (nextJsVersionCanOverrideRequestHeaders()) {
  //     // If we detect that the host app is using a nextjs installation that reliably sets the
  //     // request headers, we don't need to fall back to the searchParams strategy.
  //     // In this case, we won't set them at all in order to avoid having them visible in the req.url
  //     setRequestHeadersOnNextResponse(res, req, {
  //       [constants.Headers.AuthStatus]: authStatus,
  //       [constants.Headers.AuthMessage]: authMessage || '',
  //       [constants.Headers.AuthReason]: authReason || '',
  //     });
  //   } else {
  res.headers.set(constants.Headers.AuthStatus, authStatus);
  res.headers.set(constants.Headers.AuthMessage, authMessage || '');
  res.headers.set(constants.Headers.AuthReason, authReason || '');
  // rewriteURL.searchParams.set(constants.SearchParams.AuthStatus, authStatus);
  // rewriteURL.searchParams.set(constants.Headers.AuthMessage, authMessage || '');
  // rewriteURL.searchParams.set(constants.Headers.AuthReason, authReason || '');
  // }
  // res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  // }

  return res;
}
