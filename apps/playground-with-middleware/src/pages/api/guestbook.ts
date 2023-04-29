import type { APIRoute } from 'astro';
import { clerkClient, checkAuth } from 'astro-clerk-auth';
import { queryBuilder } from '../../db/planetscale';
import { getGuestbook } from '../../utils';

export const post: APIRoute = async ({ request }) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const body = await request.json();
    const { message } = body;
    try {
      const { userId } = checkAuth(request);

      if (!userId) {
        throw new Error('not logged in');
      }

      const { primaryEmailAddressId, username } = await clerkClient.users.getUser(userId);

      if (!primaryEmailAddressId) throw new Error('Email not found');
      if (!username) throw new Error('username not found');

      await queryBuilder
        .insertInto('guestbook')
        .values({
          email: primaryEmailAddressId,
          message,
          created_by: username,
        })
        .executeTakeFirst();

      return new Response(
        JSON.stringify({
          error: null,
        }),
        {
          status: 200,
        },
      );
    } catch (e) {
      console.log(e);
      return new Response(
        JSON.stringify({
          message: 'Something went wrong',
        }),
        { status: 400 },
      );
    }
  }
  return new Response(
    JSON.stringify({
      message: 'Method not allowed',
    }),
    { status: 405 },
  );
};

export const get: APIRoute = async () => {
  try {
    const result = await getGuestbook();

    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({
        message: 'Something went wrong',
      }),
      { status: 400 },
    );
  }
};
