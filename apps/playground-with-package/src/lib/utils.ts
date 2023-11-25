import { constants, decodeJwt } from "@clerk/backend";
import type {
  ActiveSessionResource,
  InitialState,
  MembershipRole,
  OrganizationResource,
  Resources,
  UserResource,
} from "@clerk/types";

export function deriveState(
  clerkLoaded: boolean,
  state: Resources,
  initialState: InitialState | undefined,
) {
  if (!clerkLoaded && initialState)
    return {
      ...deriveFromSsrInitialState(initialState),
      clerkLoaded,
    };

  return {
    ...deriveFromClientSideState(state),
    clerkLoaded,
  };
}

function deriveFromSsrInitialState(initialState: InitialState) {
  const userId = initialState.userId;
  const user = initialState.user as any as UserResource;
  const sessionId = initialState.sessionId;
  const session = initialState.session as any as ActiveSessionResource;
  const organization = initialState.organization as any as OrganizationResource;
  const orgId = initialState.orgId;
  const orgRole = initialState.orgRole as MembershipRole;
  const orgSlug = initialState.orgSlug;
  const actor = initialState.actor;

  return {
    userId,
    user,
    sessionId,
    session,
    organization,
    orgId,
    orgRole,
    orgSlug,
    actor,
  };
}

function deriveFromClientSideState(state: Resources) {
  const userId: string | null | undefined = state.user
    ? state.user.id
    : state.user;
  const user = state.user;
  const sessionId: string | null | undefined = state.session
    ? state.session.id
    : state.session;
  const session = state.session;
  const actor = session?.actor;
  const organization = state.organization;
  const orgId: string | null | undefined = state.organization
    ? state.organization.id
    : state.organization;
  const orgSlug = organization?.slug;
  const membership = organization
    ? user?.organizationMemberships?.find((om) => om.organization.id === orgId)
    : organization;
  const orgRole = membership ? membership.role : membership;

  return {
    userId,
    user,
    sessionId,
    session,
    organization,
    orgId,
    orgRole,
    orgSlug,
    actor,
  };
}

type AuthKey = "AuthStatus" | "AuthMessage" | "AuthReason";

export function getAuthKeyFromRequest(
  req: Request,
  key: AuthKey,
): string | null | undefined {
  return getHeader(req, constants.Headers[key]);
}

function getHeader(req: Request, name: string) {
  return req.headers.get(name);
}

const parseCookie = (str: string) => {
  if (!str) return {};
  return str
    .split(";")
    .map((v) => v.split("="))
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
  return parseCookie(req.headers.get("cookie") ?? "")[name] || "";
}

export const parseJwt = (req: Request) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, "authorization")?.replace("Bearer ", "");
  return decodeJwt(cookieToken || headerToken || "");
};
