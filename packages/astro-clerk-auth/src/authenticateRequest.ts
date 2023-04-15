import type { AstroGlobal } from "astro";
import { clerkClient } from "./clerkClient";
import {
  apiKey,
  frontendApi,
  jwtKey,
  publishableKey,
  secretKey,
} from "./constants";

function assertClientOrServer(value: {
  client: AstroGlobal | undefined;
  server: Request | undefined;
}): asserts value is
  | { client: AstroGlobal; server: Request | undefined }
  | { client: AstroGlobal | undefined; server: Request } {
  if (!value.client && !value.server)
    throw new Error("Both client and server are missing");
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
        v
      ) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {}
    );
};

/**
 * @internal
 */
export async function authenticateRequest({
  client,
  server,
}: {
  client?: AstroGlobal | undefined;
  server?: Request | undefined;
}) {
  assertClientOrServer({ client, server });
  const { headers } = client?.request || (server as any);

  const cookieToken = client?.cookies?.get("__session").value || "";

  const serverCookieToken =
    parseCookie(server?.headers.get("cookie") ?? "")["__session"] || "";

  const headerToken =
    headers.get("authorization")?.replace("Bearer ", "") || "";

  const clientUat = client?.cookies.get("__client_uat").value || "";

  const serverClientUat =
    parseCookie(server?.headers.get("cookie") ?? "")["__client_uat"] || "";

  return clerkClient.authenticateRequest({
    apiKey,
    secretKey,
    jwtKey,
    frontendApi,
    publishableKey,
    cookieToken: cookieToken || serverCookieToken,
    headerToken,
    clientUat: clientUat || serverClientUat,
    origin: headers.get("origin") || "",
    host: headers.get("host") as string,
    forwardedPort: headers.get("x-forwarded-port") as string,
    forwardedHost: headers.get("x-forwarded-host") as string,
    referrer: headers.get("referer") || "",
    userAgent: headers.get("user-agent") as string,
  });
}
