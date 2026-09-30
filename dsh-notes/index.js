import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createNotesStore, NotesError } from './store.js';

export const name = 'dsh-notes';
export const inject = ['webServer', 'connection'];

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const DEFAULT_ROOT = join(homedir(), 'Documents', 'DSH Notes');

function send(res, status, value) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(value));
}

async function bodyOf(req) {
  if (String(req.headers['content-type']).split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
    throw new NotesError(415, 'content-type', 'Expected application/json');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.byteLength;
    if (size > MAX_BODY_BYTES) {
      req.resume();
      throw new NotesError(413, 'too-large', 'Request body is too large');
    }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks, size).toString('utf8')); }
  catch { throw new NotesError(400, 'invalid-json', 'Invalid JSON body'); }
}

function errorResponse(res, error) {
  if (error instanceof NotesError) return send(res, error.status, { code: error.code, message: error.message });
  console.error('[dsh-notes]', error);
  return send(res, 500, { code: 'internal', message: 'Notebook operation failed' });
}

export function apply(ctx, config = {}) {
  const root = resolve(config.rootDir || process.env.DSH_NOTES_DIR || DEFAULT_ROOT);
  const store = createNotesStore(root);
  const authenticate = (req, res) => {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection === undefined) return true;
    res.statusCode = rejection;
    res.end();
    return false;
  };

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/dsh-notes/api',
    handler: async (req, res) => {
      if (!authenticate(req, res)) return;
      try {
        const url = new URL(String(req.url), 'http://localhost');
        if (req.method === 'GET') {
          const action = url.searchParams.get('action');
          if (action === 'tree') return send(res, 200, { root, items: await store.tree() });
          if (action === 'read') return send(res, 200, await store.read(url.searchParams.get('path')));
          return send(res, 400, { code: 'invalid-action', message: 'Unknown action' });
        }
        if (req.method !== 'POST') {
          res.setHeader('allow', 'GET, POST');
          return send(res, 405, { code: 'method', message: 'Method not allowed' });
        }
        const body = await bodyOf(req);
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new NotesError(400, 'invalid-body', 'Expected object');
        switch (body.action) {
          case 'write': return send(res, 200, await store.write(body.path, body.content, body.expectedVersion));
          case 'create': return send(res, 201, await store.create(body.parent, body.name, body.kind));
          case 'rename': return send(res, 200, await store.move(body.path, body.name));
          case 'remove': return send(res, 200, await store.remove(body.path));
          case 'preview': return send(res, 200, { html: store.preview(body.path, body.content) });
          default: throw new NotesError(400, 'invalid-action', 'Unknown action');
        }
      } catch (error) { errorResponse(res, error); }
    },
  }), 'dsh-notes API');

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/dsh-notes/asset',
    handler: async (req, res) => {
      if (!authenticate(req, res)) return;
      if (req.method !== 'GET') {
        res.setHeader('allow', 'GET');
        return send(res, 405, { code: 'method', message: 'Method not allowed' });
      }
      try {
        const url = new URL(String(req.url), 'http://localhost');
        const { type, bytes } = await store.asset(url.searchParams.get('path'));
        res.statusCode = 200;
        res.setHeader('content-type', type);
        res.setHeader('x-content-type-options', 'nosniff');
        res.setHeader('cache-control', 'private, max-age=60');
        res.end(bytes);
      } catch (error) { errorResponse(res, error); }
    },
  }), 'dsh-notes assets');
}
