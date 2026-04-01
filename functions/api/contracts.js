import { getAllContracts } from '../_shared.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    try {
      const contracts = await getAllContracts();
      return new Response(JSON.stringify(contracts), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://104e2d5b.premunia-6ku.pages.dev',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch contracts' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://104e2d5b.premunia-6ku.pages.dev',
        },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://104e2d5b.premunia-6ku.pages.dev',
    },
  });
}