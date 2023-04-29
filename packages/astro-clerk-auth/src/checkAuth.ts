import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import { AuthStatus, constants, decodeJwt, signedInAuthObject, signedOutAuthObject } from '@clerk/backend';
import type { SecretKeyOrApiKey } from '@clerk/types';

import type { RequestLike } from './middleware/types';
import { getAuthKeyFromRequest, getCookie, getHeader } from './middleware/utils';
import { apiKey, apiUrl, apiVersion, secretKey } from './constants';

type GetAuthOpts = Partial<SecretKeyOrApiKey>;
export const checkAuth = (req: RequestLike, opts?: GetAuthOpts): SignedInAuthObject | SignedOutAuthObject => {
  // When the auth status is set, we trust that the middleware has already run
  // Then, we don't have to re-verify the JWT here,
  // we can just strip out the claims manually.
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');

  console.log('dwadawd', authStatus, req.headers.get(constants.Headers.AuthStatus));

  if (!authStatus) {
    throw new Error(
      'You need to use "withClerkMiddleware" in your middleware file. You also need to make sure that your middleware matcher is configured correctly and matches this route or page.',
    );
  }

  const options = {
    apiKey: opts?.apiKey || apiKey,
    secretKey: opts?.secretKey || secretKey,
    apiUrl: apiUrl,
    apiVersion: apiVersion,
    authStatus,
    authMessage,
    authReason,
  };

  if (authStatus !== AuthStatus.SignedIn) {
    return signedOutAuthObject(options);
  }

  const jwt = parseJwt(req);
  return signedInAuthObject(jwt.payload, { ...options, token: jwt.raw.text });
};

const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};
