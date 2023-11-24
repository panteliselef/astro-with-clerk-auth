import {
  buildRequestUrl,
  type OptionalVerifyTokenOptions,
  type RequestState,
  constants,
} from "@clerk/backend";
import { handleValueOrFn } from "@clerk/shared";
import type { MultiDomainAndOrProxy } from "@clerk/types";
import type { APIContext } from "astro";
import {
  clerkClient,
  publishableKey,
  authenticateRequest,
} from "astro-clerk-auth";
import { defineMiddleware } from "astro:middleware";

type WithAuthOptions = OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    publishableKey?: string;
    secretKey?: string;
    signInUrl?: string;
  };

// export const authenticateRequest = async (
//   req: Request,
//   opts: WithAuthOptions,
// ) => {
//   return await clerkClient.authenticateRequest({
//     ...opts,
//     secretKey: opts.secretKey || secretKey,
//     publishableKey: opts.publishableKey || publishableKey,
//     isSatellite: false,
//     domain: "",
//     signInUrl: "",
//     proxyUrl: "",
//     request: req,
//   });
// };

export const apiEndpointUnauthorizedNextResponse = () => {
  return Response.json(null, { status: 401, statusText: "Unauthorized" });
};

const decorateResponseWithObservabilityHeaders = (
  res: Response,
  requestState: RequestState,
) => {
  requestState.message &&
    res.headers.set(
      constants.Headers.AuthMessage,
      encodeURIComponent(requestState.message),
    );
  requestState.reason &&
    res.headers.set(
      constants.Headers.AuthReason,
      encodeURIComponent(requestState.reason),
    );
  requestState.status &&
    res.headers.set(
      constants.Headers.AuthStatus,
      encodeURIComponent(requestState.status),
    );
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
  return !["get", "head", "options"].includes(requestMethod);
};

const isRequestContentTypeJson = (req: Request): boolean => {
  const requestContentType = req.headers.get(constants.Headers.ContentType);
  return requestContentType === constants.ContentTypes.Json;
};

const createApiRoutes = (): ((req: Request) => boolean) => {
  const isDefaultApiRoute = createRouteMatcher();
  return (req: Request) =>
    isDefaultApiRoute(req) ||
    isRequestMethodIndicatingApiRoute(req) ||
    isRequestContentTypeJson(req);
};

export const debugRequestState = (params: RequestState) => {
  const {
    isSignedIn,
    proxyUrl,
    isInterstitial,
    reason,
    message,
    publishableKey,
    isSatellite,
    domain,
  } = params;
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

export const handleInterstitialState = (
  requestState: RequestState,
  opts: WithAuthOptions,
) => {
  const response = new Response(
    clerkClient.localInterstitial({
      frontendApi: "",
      publishableKey: opts.publishableKey || publishableKey,
      clerkJSUrl: "",
      clerkJSVersion: "",
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
        "content-type": "text/html",
      },
    },
  );
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export function decorateRequest(
  locals: APIContext['locals'],
  res: Response,
  requestState: RequestState,
): Response {
  const { reason, message, status } = requestState;

  console.log('locals', locals)
  locals.authStatus = status
  locals.authMessage = message
  locals.authReason = reason
  console.log('locals', locals)

  res.headers.set(constants.Headers.AuthStatus, status);
  res.headers.set(constants.Headers.AuthMessage, message || "");
  res.headers.set(constants.Headers.AuthReason, reason || "");

  return res;
}

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
  const isApiRoute = createApiRoutes();

  console.log('lowlwowo')
  const requestState = await authenticateRequest({ server: context.request });
  console.log('lowlwowo', requestState.isUnknown, requestState.isInterstitial)

  if (requestState.isUnknown) {
    console.log('------ isUnknown')
    return handleUnknownState(requestState);
  } else if (requestState.isInterstitial && isApiRoute(context.request)) {
    console.log('------ WOWOW')
    return handleUnknownState(requestState);
  } else if (requestState.isInterstitial) {
    console.log('------ INTERSTITIALL')
    const res = handleInterstitialState(requestState, {});
    return res;
  }

  console.log('lo')


  const finalRes = await next() as Response;

  // @ts-ignore
  return decorateRequest(context.locals, finalRes, requestState);
});
