// Middleware runs on the server side, before clerk-js is loaded, that's why we need Cookies.
import type { AuthenticateRequestOptions, ClerkRequest } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { DEV_BROWSER_JWT_KEY, isDevelopmentFromSecretKey, setDevBrowserJWTInURL } from '@clerk/shared';
import { SECRET_KEY } from '../v0/constants';
import { AstroMiddlewareContextParam } from './types';

/**
 * Grabs the dev browser JWT from cookies and appends it to the redirect URL when redirecting to cross-origin.
 */
export const serverRedirectWithAuth = (
  context: AstroMiddlewareContextParam,
  clerkRequest: ClerkRequest,
  res: Response,
  opts: AuthenticateRequestOptions,
) => {
  const location = res.headers.get('location');
  const shouldAppendDevBrowser = res.headers.get(constants.Headers.ClerkRedirectTo) === 'true';

  if (
    shouldAppendDevBrowser &&
    !!location &&
    isDevelopmentFromSecretKey(opts.secretKey || SECRET_KEY) &&
    clerkRequest.clerkUrl.isCrossOrigin(location)
  ) {
    const dbJwt = clerkRequest.cookies.get(DEV_BROWSER_JWT_KEY) || '';
    const url = new URL(location);
    const urlWithDevBrowser = setDevBrowserJWTInURL(url, dbJwt);
    return context.redirect(urlWithDevBrowser.href, 307);
  }
  return res;
};
