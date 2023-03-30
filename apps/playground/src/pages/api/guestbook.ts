import type { APIRoute } from "astro";
import { clerkClient, getAuth } from "../../clerk";
import { queryBuilder } from "../../db/planetscale";

export const post: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const { message } = body;
    try {
      const auth = await getAuth({ server: request });

      if (auth instanceof Response) {
        throw new Error("not logged in");
      }

      if (!auth.userId) {
        throw new Error("not logged in");
      }

      const { primaryEmailAddressId, username } =
        await clerkClient.users.getUser(auth.userId);

      if (!primaryEmailAddressId) throw new Error("Email not found");
      if (!username) throw new Error("username not found");

      await queryBuilder
        .insertInto("guestbook")
        .values({
          email: primaryEmailAddressId,
          message,
          created_by: username,
        })
        .execute();

      return new Response(
        JSON.stringify({
          error: null,
        }),
        {
          status: 200,
        }
      );
    } catch (e) {
      console.log(e);
      return new Response(
        JSON.stringify({
          message: "Something went wrong",
        }),
        { status: 400 }
      );
    }
  }
  return new Response(
    JSON.stringify({
      message: "Method not allowed",
    }),
    { status: 405 }
  );
};
