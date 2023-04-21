import type { APIRoute } from 'astro';
import { getAuth, clerkClient } from 'astro-clerk-auth';
import { queryBuilder } from '../../db/planetscale';
import { getGuestbook } from '../../utils';

export const post: APIRoute = async ({ request }) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const body = await request.json();
    const { message } = body;
    try {
      const auth = await getAuth({ server: request });

      if (auth instanceof Response) {
        throw new Error('not logged in');
      }

      if (!auth.userId) {
        throw new Error('not logged in');
      }

      const { primaryEmailAddressId, username } = await clerkClient.users.getUser(auth.userId);

      if (!primaryEmailAddressId) throw new Error('Email not found');
      if (!username) throw new Error('username not found');

      const result = await queryBuilder
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

export const get: APIRoute = async ({ request }) => {
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
