import type { AstroGlobal } from "astro";
import { clerkClient } from "./clerkClient";
import { apiKey, frontendApi, jwtKey, secretKey, publishableKey } from "./constants";

/**
 * @internal
 */
export async function authenticateRequest({ client }: {
    client: AstroGlobal;
}) {
    const { headers } = client.request;

    const cookieToken = client.cookies.get("__session").value || "";

    const headerToken = headers.get("authorization")?.replace("Bearer ", "") || "";

    const clientUat = client.cookies.get("__client_uat").value || "1673815706";

    const requestState = await clerkClient.authenticateRequest({
        apiKey,
        secretKey,
        jwtKey,
        frontendApi,
        publishableKey,
        cookieToken,
        headerToken,
        clientUat,
        origin: headers.get("origin") || "",
        host: headers.get("host") as string,
        forwardedPort: headers.get("x-forwarded-port") as string,
        forwardedHost: headers.get("x-forwarded-host") as string,
        referrer: headers.get("referer") || "",
        userAgent: headers.get("user-agent") as string,
    });
    
    return requestState;
}