import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import { apply } from './index.js';
import { createNotesStore, NotesError } from './store.js';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'dsh-notes-test-'));
  return { root, store: createNotesStore(root) };
}

test('creates, reads, edits, renames and trashes Markdown notes', async () => {
  const { root, store } = await fixture();
  await store.create('', 'Ideas', 'folder');
  const { path } = await store.create('Ideas', 'First', 'note');
  assert.equal(path, 'Ideas/First.md');
  const initial = await store.read(path);
  assert.equal(initial.content, '');
  const saved = await store.write(path, '# First\n\nHello.', initial.version);
  assert.equal((await store.read(path)).content, '# First\n\nHello.');
  await assert.rejects(store.write(path, 'old edit', initial.version), error => error.code === 'changed-on-disk');
  assert.notEqual(saved.version, initial.version);
  const renamed = await store.move(path, 'Second.md');
  assert.equal(renamed.path, 'Ideas/Second.md');
  assert.deepEqual((await store.tree()).map(item => item.name), ['Ideas']);
  await store.remove(renamed.path);
  assert.deepEqual((await store.tree())[0].children, []);
  assert.equal((await readdir(join(root, '.dsh-trash'))).length, 1);
});

test('blocks traversal and symlinks before opening data', async () => {
  const { root, store } = await fixture();
  await mkdir(join(root, 'safe'));
  await symlink(tmpdir(), join(root, 'escape'));
  await assert.rejects(store.read('../outside.md'), error => error instanceof NotesError && error.code === 'invalid-path');
  await assert.rejects(store.read('escape/secret.md'), error => error instanceof NotesError && error.code === 'symlink');
  await assert.rejects(store.create('safe', '../bad', 'note'), error => error instanceof NotesError && error.code === 'invalid-name');
});

test('preview escapes HTML and scopes relative images', async () => {
  const { store } = await fixture();
  const html = store.preview('Ideas/Test.md', '# Title\n\n<script>alert(1)</script>\n\n![pic](cover.png)');
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /\/dsh-notes\/asset\?path=Ideas%2Fcover.png/);
  assert.doesNotMatch(html, /<script>/);
});

test('HTTP routes reject unauthenticated writes and support notebook actions', async () => {
  const { root } = await fixture();
  const routes = new Map();
  let rejection = 401;
  apply({
    connection: { requestRejection: () => rejection },
    webServer: { register: route => { routes.set(route.path, route.handler); return () => routes.delete(route.path); } },
    effect: setup => setup(),
  }, { rootDir: root });
  async function call(method, path, body) {
    const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []);
    req.method = method;
    req.url = path;
    req.headers = body ? { 'content-type': 'application/json' } : {};
    const headers = {};
    const res = { statusCode: 200, setHeader: (key, value) => { headers[key] = value; }, end: value => { res.body = value; } };
    await routes.get('/dsh-notes/api')(req, res);
    return { status: res.statusCode, data: res.body ? JSON.parse(res.body) : null, headers };
  }
  assert.equal((await call('POST', '/dsh-notes/api', { action: 'create', parent: '', name: 'Blocked', kind: 'note' })).status, 401);
  rejection = undefined;
  assert.equal((await call('POST', '/dsh-notes/api', { action: 'create', parent: '', name: 'Allowed', kind: 'note' })).status, 201);
  const tree = await call('GET', '/dsh-notes/api?action=tree');
  assert.equal(tree.data.items[0].path, 'Allowed.md');
  assert.equal((await call('GET', '/dsh-notes/api?action=read&path=..%2Foutside.md')).status, 400);
});
