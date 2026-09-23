import http from 'node:http';
import { askGwdg, hasGwdgConfig } from './providers/gwdg.js';

const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const maxBodyBytes = 100_000;

function setCors(response, request) {
  const origin = request.headers.origin;
  const isAllowed = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin));
  if (isAllowed) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Vary', 'Origin');
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const contentType = request.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    const error = new Error('Content-Type must be application/json.');
    error.statusCode = 415;
    throw error;
  }

  let data = '';
  for await (const chunk of request) {
    data += chunk;
    if (Buffer.byteLength(data) > maxBodyBytes) {
      const error = new Error('Request body too large.');
      error.statusCode = 413;
      throw error;
    }
  }
  return data ? JSON.parse(data) : {};
}

function validateContextPack(contextPack) {
  return contextPack === undefined || (contextPack !== null && typeof contextPack === 'object' && !Array.isArray(contextPack));
}

export const server = http.createServer(async (request, response) => {
  setCors(response, request);
  if (request.method === 'OPTIONS') return response.writeHead(204).end();

  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, {
        status: 'ok',
        provider: 'gwdg-arcana',
        configured: hasGwdgConfig()
      });
    }

    if (request.method === 'POST' && (url.pathname === '/api/assistant' || url.pathname === '/narrative')) {
      if (!hasGwdgConfig()) return sendJson(response, 503, { error: 'GWDG server configuration is missing.' });

      const body = await readBody(request);
      if (!body || typeof body !== 'object' || Array.isArray(body) || !validateContextPack(body.contextPack)) {
        return sendJson(response, 400, { error: 'Request must be a JSON object with an object contextPack.' });
      }

      const role = typeof body.role === 'string' ? body.role.trim() : '';
      const message = url.pathname === '/narrative'
        ? (role ? `Create an immersive narrative for a ${role} character.` : '')
        : body.message;
      if (typeof message !== 'string' || !message.trim() || message.length > 1000) {
        return sendJson(response, 400, { error: 'message is required and must be 1000 characters or fewer.' });
      }

      const result = await askGwdg({ message: message.trim(), contextPack: body.contextPack });
      return sendJson(response, 200, url.pathname === '/narrative' ? { narrative: result.text } : result);
    }
    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.statusCode || (error instanceof SyntaxError ? 400 : 502);
    return sendJson(response, status, {
      error: status === 502 ? 'AI provider request failed.' : error.message
    });
  }
});

if (process.env.NODE_ENV !== 'test') server.listen(port, () => console.log(`Ludus backend listening on port ${port}`));
