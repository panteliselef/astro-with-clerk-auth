import { constants } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

type AuthKey = 'AuthStatus' | 'AuthMessage' | 'AuthReason';

export function getAuthKeyFromRequest(req: Request, key: AuthKey): string | null | undefined {
  return getHeader(req, constants.Headers[key]);
}

function getHeader(req: Request, name: string) {
  return req.headers.get(name);
}

const parseCookie = (str: string) => {
  if (!str) return {};
  return str
    .split(';')
    .map((v) => v.split('='))
    .reduce(
      (
        acc: {
          [key: string]: string;
        },
        v,
      ) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {},
    );
};

function getCookie(req: Request, name: string): string | undefined {
  return parseCookie(req.headers.get('cookie') ?? '')[name] || '';
}

export const parseJwt = (req: Request) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  const { data, error } = decodeJwt(cookieToken || headerToken || '');

  if (error) {
    throw error;
  }

  return data;
};

export const isRedirect = (res: Response) => {
  return (
    [300, 301, 302, 303, 304, 307, 308].includes(res.status) ||
    res.headers.get(constants.Headers.ClerkRedirectTo) === 'true'
  );
};

export const setHeader = (res: Response, name: string, val: string) => {
  res.headers.set(name, val);
  return res;
};
