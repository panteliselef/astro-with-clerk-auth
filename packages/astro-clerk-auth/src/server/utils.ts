import { constants, decodeJwt } from '@clerk/backend';

type AuthKey = 'AuthStatus' | 'AuthMessage' | 'AuthReason';

export function getAuthKeyFromRequest(req: Request, key: AuthKey): string | null | undefined {
  return getHeader(req, constants.Headers[key]);
}

function getHeader(req: Request, name: string) {
  return req.headers.get(name);
}

// "exports": {
//   ".": {
//     "types": "./dist/index.d.ts",
//     "default": "./dist/index.js"
//   },
//   "./react": {
//     "types": "./dist/react/index.d.mts",
//     "default": "./dist/react/index.mjs"
//   },
//   "./package.json": "./package.json"
// },

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
  return decodeJwt(cookieToken || headerToken || '');
};
