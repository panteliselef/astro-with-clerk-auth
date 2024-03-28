export async function GET() {
  return new Response(
    JSON.stringify({
      applinks: {
        apps: [import.meta.env.APP_ID],
        details: [
          {
            appID: import.meta.env.APP_ID,
            paths: ["/v1/oauth-native-callback"],
          },
        ],
      },
      webcredentials: {
        apps: [import.meta.env.APP_ID],
      },
    }),
  );
}
