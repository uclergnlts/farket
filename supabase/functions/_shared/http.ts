// JSON responses with CORS headers, for functions that need nothing else from generate.ts.
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });

export const preflight = () => json({ ok: true });
