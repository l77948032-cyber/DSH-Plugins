import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, lstat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const MAX_NOTE_BYTES = 4 * 1024 * 1024;
const MAX_ENTRIES = 5000;
const HIDDEN = '.dsh-trash';
const IMAGE_TYPES = new Map([
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'], ['.webp', 'image/webp'], ['.avif', 'image/avif'],
]);

export class NotesError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function cleanPath(path, { allowRoot = false } = {}) {
  if (typeof path !== 'string' || path.includes('\\') || path.includes('\0') || isAbsolute(path)) {
    throw new NotesError(400, 'invalid-path', 'Invalid path');
  }
  const parts = path.split('/').filter(Boolean);
  if ((!allowRoot && parts.length === 0) || parts.some(part => part === '.' || part === '..' || part === HIDDEN)) {
    throw new NotesError(400, 'invalid-path', 'Invalid path');
  }
  return parts.join('/');
}

function cleanName(name) {
  if (typeof name !== 'string' || !name.trim() || name !== name.trim() || /[\\/\0]/.test(name) || name === '.' || name === '..' || name === HIDDEN) {
    throw new NotesError(400, 'invalid-name', 'Invalid name');
  }
  return name;
}

function versionOf(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function createNotesStore(directory) {
  const root = resolve(directory);
  const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });
  let ready;
  async function ensureRoot() {
    if (!ready) ready = mkdir(root, { recursive: true }).then(async () => {
      const stat = await lstat(root);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new NotesError(400, 'invalid-root', 'Notebook directory must be a real directory');
    });
    await ready;
  }

  async function checked(path, { allowRoot = false, missingLeaf = false } = {}) {
    await ensureRoot();
    const rel = cleanPath(path, { allowRoot });
    const absolute = resolve(root, rel);
    if (absolute !== root && !absolute.startsWith(root + sep)) throw new NotesError(400, 'invalid-path', 'Path escapes notebook');
    let current = root;
    for (const [index, part] of rel.split('/').filter(Boolean).entries()) {
      current = join(current, part);
      let stat;
      try { stat = await lstat(current); }
      catch (error) {
        if (error.code === 'ENOENT' && missingLeaf && index === rel.split('/').filter(Boolean).length - 1) break;
        throw new NotesError(404, 'not-found', 'File or folder not found');
      }
      if (stat.isSymbolicLink()) throw new NotesError(403, 'symlink', 'Symbolic links are not supported');
    }
    return { rel, absolute };
  }

  async function tree() {
    await ensureRoot();
    let count = 0;
    async function visit(dir, depth) {
      if (depth > 32) return [];
      const entries = await readdir(dir, { withFileTypes: true });
      const result = [];
      for (const entry of entries.sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name, 'zh'))) {
        if (entry.name === HIDDEN || entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
        if (!entry.isDirectory() && !(entry.isFile() && entry.name.toLowerCase().endsWith('.md'))) continue;
        if (++count > MAX_ENTRIES) throw new NotesError(413, 'too-many-files', 'Notebook contains too many files');
        const absolute = join(dir, entry.name);
        const path = relative(root, absolute).split(sep).join('/');
        result.push(entry.isDirectory()
          ? { kind: 'folder', name: entry.name, path, children: await visit(absolute, depth + 1) }
          : { kind: 'note', name: entry.name, path });
      }
      return result;
    }
    return visit(root, 0);
  }

  async function read(path) {
    const { absolute, rel } = await checked(path);
    if (!rel.toLowerCase().endsWith('.md')) throw new NotesError(400, 'not-markdown', 'Only Markdown notes can be opened');
    const stat = await lstat(absolute);
    if (!stat.isFile()) throw new NotesError(400, 'not-file', 'Path is not a file');
    if (stat.size > MAX_NOTE_BYTES) throw new NotesError(413, 'too-large', 'Note exceeds 4 MB');
    const content = await readFile(absolute, 'utf8');
    return { path: rel, content, version: versionOf(content) };
  }

  async function write(path, content, expectedVersion) {
    if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_NOTE_BYTES) throw new NotesError(413, 'too-large', 'Note exceeds 4 MB');
    if (typeof expectedVersion !== 'string') throw new NotesError(400, 'missing-version', 'Expected version is required');
    const current = await read(path);
    if (current.version !== expectedVersion) throw new NotesError(409, 'changed-on-disk', 'Note changed on disk; reload before saving');
    const { absolute } = await checked(path);
    const temp = join(dirname(absolute), `.${basename(absolute)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temp, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
      await rename(temp, absolute);
    } catch (error) {
      try { await unlink(temp); } catch {}
      throw error;
    }
    return { path, version: versionOf(content) };
  }

  async function create(parent, name, kind) {
    const parentPath = await checked(parent, { allowRoot: true });
    if (!(await lstat(parentPath.absolute)).isDirectory()) throw new NotesError(400, 'not-folder', 'Parent is not a folder');
    const validName = cleanName(name);
    if (kind !== 'folder' && kind !== 'note') throw new NotesError(400, 'invalid-kind', 'Invalid item kind');
    const fileName = kind === 'note' && !validName.toLowerCase().endsWith('.md') ? `${validName}.md` : validName;
    const path = [parentPath.rel, fileName].filter(Boolean).join('/');
    const { absolute } = await checked(path, { missingLeaf: true });
    try {
      if (kind === 'folder') await mkdir(absolute);
      else await writeFile(absolute, '', { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if (error.code === 'EEXIST') throw new NotesError(409, 'already-exists', 'Name already exists');
      throw error;
    }
    return { path };
  }

  async function move(path, name) {
    const source = await checked(path);
    const fileName = cleanName(name);
    const destinationPath = [dirname(source.rel) === '.' ? '' : dirname(source.rel), fileName].filter(Boolean).join('/');
    const destination = await checked(destinationPath, { missingLeaf: true });
    const sourceStat = await lstat(source.absolute);
    if (sourceStat.isFile() && !fileName.toLowerCase().endsWith('.md')) throw new NotesError(400, 'not-markdown', 'Note names must end in .md');
    if (source.absolute === destination.absolute) return { path: source.rel };
    try { await lstat(destination.absolute); throw new NotesError(409, 'already-exists', 'Name already exists'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await rename(source.absolute, destination.absolute);
    return { path: destinationPath };
  }

  async function remove(path) {
    const source = await checked(path);
    const trash = join(root, HIDDEN);
    await mkdir(trash, { recursive: true });
    await rename(source.absolute, join(trash, `${Date.now()}-${randomUUID()}-${basename(source.absolute)}`));
    return { path: source.rel };
  }

  async function asset(path) {
    const { absolute } = await checked(path);
    const type = IMAGE_TYPES.get(extname(absolute).toLowerCase());
    if (!type) throw new NotesError(415, 'unsupported-asset', 'Unsupported image type');
    const stat = await lstat(absolute);
    if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw new NotesError(413, 'too-large', 'Image exceeds 16 MB');
    return { type, bytes: await readFile(absolute) };
  }

  function preview(path, content) {
    const rel = cleanPath(path);
    if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_NOTE_BYTES) throw new NotesError(413, 'too-large', 'Note exceeds 4 MB');
    const tokens = markdown.parse(content, {});
    for (const token of tokens) {
      if (token.type !== 'inline') continue;
      for (const child of token.children ?? []) {
        if (child.type !== 'image') continue;
        const src = child.attrGet('src');
        if (!src || /^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith('/')) continue;
        let decoded;
        try { decoded = decodeURIComponent(src); } catch { continue; }
        const local = resolve(root, dirname(rel), decoded);
        if (!local.startsWith(root + sep)) continue;
        child.attrSet('src', `/dsh-notes/asset?path=${encodeURIComponent(relative(root, local).split(sep).join('/'))}`);
      }
    }
    return sanitizeHtml(markdown.renderer.render(tokens, markdown.options, {}), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title'] },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: { img: ['http', 'https'] },
      allowProtocolRelative: false,
    });
  }

  return { root, tree, read, write, create, move, remove, asset, preview };
}
