import http from 'node:http';

const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map((value) => value.trim());

function setCors(response, request) {
  const origin = request.headers.origin;
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let data = '';
  for await (const chunk of request) {
    data += chunk;
    if (data.length > 100_000) throw new Error('Request body too large');
  }
  return data ? JSON.parse(data) : {};
}

async function createNarrative(role) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }
  const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a concise fantasy game narrator. Return an immersive narrative of 2-4 paragraphs.' },
        { role: 'user', content: `Create a narrative for a ${role} character.` }
      ],
      temperature: 0.8
    })
  });
  if (!apiResponse.ok) {
    const error = new Error(`Narrative provider returned ${apiResponse.status}`);
    error.statusCode = apiResponse.status >= 500 ? 502 : 400;
    throw error;
  }
  const data = await apiResponse.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export const server = http.createServer(async (request, response) => {
  setCors(response, request);
  if (request.method === 'OPTIONS') return response.writeHead(204).end();
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (request.method === 'GET' && url.pathname === '/health') return sendJson(response, 200, { status: 'ok' });
    if (request.method === 'POST' && url.pathname === '/narrative') {
      const body = await readBody(request);
      const role = typeof body.role === 'string' ? body.role.trim() : '';
      if (!role || role.length > 80) return sendJson(response, 400, { error: 'role must be a non-empty string of 80 characters or fewer' });
      const narrative = await createNarrative(role);
      return sendJson(response, 200, { narrative });
    }
    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.statusCode || (error instanceof SyntaxError ? 400 : 500);
    sendJson(response, status, { error: status === 500 ? 'Internal server error' : error.message });
  }
});

if (process.env.NODE_ENV !== 'test') server.listen(port, () => console.log(`Ludus backend listening on port ${port}`));
