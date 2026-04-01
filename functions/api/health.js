export async function onRequest(context) {
  return new Response(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://104e2d5b.premunia-6ku.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}