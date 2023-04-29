/**
 * Validate the correctness of a user-provided URL.
 */
function validateURL(url: string | URL): string {
  try {
    return String(new URL(String(url)));
  } catch (error: any) {
    throw new Error(
      `URL is malformed "${String(
        url,
      )}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`,
      { cause: error },
    );
  }
}

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

export const redirect = (url: string | URL, init?: number) => {
  const status = init || 307;
  if (!REDIRECTS.has(status)) {
    throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
  }
  const initObj = typeof init === 'object' ? init : {};
  const headers = new Headers();
  headers.set('Location', validateURL(url));

  return new Response(null, {
    ...initObj,
    headers,
    status,
  });
};

export const isRedirect = (response: Response) => {
  return response.headers.get('Location');
};
