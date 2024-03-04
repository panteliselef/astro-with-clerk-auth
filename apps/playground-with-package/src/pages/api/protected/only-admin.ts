import type { APIRoute } from "astro";
import { clerkClient } from "astro-clerk-auth/v0";

export const GET: APIRoute = async ({ locals }) => {
  const { auth } = locals;

  if (auth().has({ role: "admin" })) {
    return new Response(
      JSON.stringify(
        await clerkClient.organizations.getOrganization({
          organizationId: auth().orgId!,
        }),
      ),
      {
        status: 200,
      },
    );
  }

  return new Response(
    JSON.stringify({ error: "select or create an organization" }),
    {
      status: 400,
    },
  );
};
