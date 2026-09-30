window.__ModuleLoader__.load({
  id: '@l77948032-cyber/dsh-notes',
  factory: (require) => {
    const React = require('react');
    const { createElement: h, useEffect, useMemo, useRef, useState } = React;
    const Icons = require('@deepseek-ai/dsh-client-ui-primitives');
    const PANEL = 'dsh-notes';
    const API = '/dsh-notes/api';

    const style = `
.dsh-notes-shell{display:flex;width:100%;height:100%;min-height:0;color:var(--dsw-text-primary,#ddd);background:var(--dsw-surface-primary,#191919);font:13px/1.5 system-ui,sans-serif}
.dsh-notes-shell *{box-sizing:border-box}
.dsh-notes-sidebar{width:270px;min-width:190px;max-width:36%;display:flex;flex-direction:column;border-right:1px solid var(--dsw-border-subtle,#353535);background:var(--dsw-surface-subtle,#202020)}
.dsh-notes-sidehead,.dsh-notes-head{height:50px;min-height:50px;display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid var(--dsw-border-subtle,#353535)}
.dsh-notes-sidehead strong{font-size:14px;font-weight:650;flex:1}.dsh-notes-head{justify-content:space-between;gap:14px}
.dsh-notes-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:14px}
.dsh-notes-actions{display:flex;align-items:center;gap:2px;flex-shrink:0}
.dsh-notes-icon{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:5px;color:inherit;background:transparent;cursor:pointer}
.dsh-notes-icon:hover,.dsh-notes-tree-row:hover{background:var(--dsw-surface-hover,#333)}.dsh-notes-icon:disabled{opacity:.4;cursor:default}
.dsh-notes-search{margin:10px 10px 5px;width:calc(100% - 20px);height:32px;padding:0 10px;border:1px solid var(--dsw-border-subtle,#444);border-radius:5px;background:var(--dsw-surface-primary,#191919);color:inherit;outline:none}
.dsh-notes-search:focus{border-color:var(--dsw-accent,#8e79d5)}
.dsh-notes-tree{overflow:auto;flex:1;padding:5px 7px 16px}.dsh-notes-tree-row{display:flex;align-items:center;gap:5px;width:100%;min-height:30px;border:0;border-radius:4px;background:transparent;color:inherit;text-align:left;cursor:pointer;padding:2px 7px;white-space:nowrap;overflow:hidden}
.dsh-notes-tree-row[aria-current="page"]{background:var(--dsw-surface-selected,#3a3447)}.dsh-notes-tree-row span:last-child{overflow:hidden;text-overflow:ellipsis}
.dsh-notes-arrow{width:14px;flex:none;display:inline-flex;align-items:center}.dsh-notes-tree-icon{opacity:.72;flex:none;display:inline-flex}
.dsh-notes-sidefoot{padding:9px 12px;border-top:1px solid var(--dsw-border-subtle,#353535);color:var(--dsw-text-secondary,#999);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-notes-main{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0}.dsh-notes-modes{display:flex;border:1px solid var(--dsw-border-subtle,#444);border-radius:5px;padding:2px;gap:1px}
.dsh-notes-modes button{border:0;border-radius:3px;padding:4px 9px;background:transparent;color:inherit;font:inherit;cursor:pointer}.dsh-notes-modes button[aria-pressed="true"]{background:var(--dsw-surface-hover,#3a3a3a)}
.dsh-notes-work{display:flex;flex:1;min-height:0;min-width:0}.dsh-notes-editor,.dsh-notes-preview{flex:1;min-width:0;min-height:0;overflow:auto}
.dsh-notes-editor{resize:none;border:0;outline:0;background:transparent;color:inherit;padding:24px 32px;font:14px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;tab-size:2}
.dsh-notes-preview{padding:20px clamp(22px,5%,66px);font-size:15px;line-height:1.75}.dsh-notes-preview h1,.dsh-notes-preview h2,.dsh-notes-preview h3{line-height:1.3;margin:1.2em 0 .5em}
.dsh-notes-preview h1{font-size:2em}.dsh-notes-preview h2{font-size:1.5em;border-bottom:1px solid var(--dsw-border-subtle,#444);padding-bottom:.25em}.dsh-notes-preview h3{font-size:1.2em}
.dsh-notes-preview p,.dsh-notes-preview ul,.dsh-notes-preview ol{margin:.7em 0}.dsh-notes-preview blockquote{margin:1em 0;padding:1px 16px;border-left:3px solid var(--dsw-accent,#8e79d5);color:var(--dsw-text-secondary,#aaa)}
.dsh-notes-preview pre{overflow:auto;padding:14px;background:var(--dsw-surface-subtle,#242424);border-radius:5px}.dsh-notes-preview :not(pre)>code{padding:2px 4px;background:var(--dsw-surface-subtle,#303030);border-radius:3px}
.dsh-notes-preview img{max-width:100%;height:auto}.dsh-notes-preview table{border-collapse:collapse;display:block;overflow:auto}.dsh-notes-preview th,.dsh-notes-preview td{border:1px solid var(--dsw-border-subtle,#555);padding:5px 9px}
.dsh-notes-preview a{color:var(--dsw-accent,#a58aed)}.dsh-notes-preview hr{border:0;border-top:1px solid var(--dsw-border-subtle,#444)}
.dsh-notes-work[data-mode="split"] .dsh-notes-editor{border-right:1px solid var(--dsw-border-subtle,#353535)}
.dsh-notes-empty{display:flex;flex:1;align-items:center;justify-content:center;color:var(--dsw-text-secondary,#999);padding:24px}.dsh-notes-status{height:28px;min-height:28px;border-top:1px solid var(--dsw-border-subtle,#353535);padding:4px 14px;color:var(--dsw-text-secondary,#999);font-size:11px}
.dsh-notes-status[data-error="true"]{color:#e78579}.dsh-notes-dialog-backdrop{position:absolute;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#0009}.dsh-notes-dialog{width:min(360px,calc(100% - 32px));padding:18px;background:var(--dsw-surface-primary,#292929);border:1px solid var(--dsw-border-subtle,#555);border-radius:7px;box-shadow:0 12px 40px #0007}
.dsh-notes-dialog h2{font-size:15px;margin:0 0 12px}.dsh-notes-dialog input{width:100%;padding:8px 10px;border:1px solid var(--dsw-border-subtle,#555);border-radius:5px;background:var(--dsw-surface-subtle,#222);color:inherit;font:inherit}.dsh-notes-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.dsh-notes-dialog-actions button{padding:6px 12px;border:1px solid var(--dsw-border-subtle,#555);border-radius:5px;color:inherit;background:transparent;cursor:pointer;font:inherit}.dsh-notes-dialog-actions button[type="submit"]{background:var(--dsw-accent,#8264cf);border-color:transparent;color:white}
@media(max-width:700px){.dsh-notes-sidebar{width:190px;min-width:150px}.dsh-notes-head{padding:0 8px}.dsh-notes-editor{padding:16px}.dsh-notes-preview{padding:16px}.dsh-notes-modes button{padding:4px 6px}}
`;

    function Icon({ name, size = 16 }) {
      const Component = Icons[name];
      return Component ? h(Component, { size }) : null;
    }
    function iconButton(name, label, onClick, disabled = false) {
      return h('button', { type: 'button', className: 'dsh-notes-icon', title: label, 'aria-label': label, onClick, disabled }, h(Icon, { name }));
    }
    async function request(action, data) {
      const isRead = action === 'tree' || action === 'read';
      const url = isRead ? `${API}?${new URLSearchParams({ action, ...data })}` : API;
      const response = await fetch(url, isRead ? { credentials: 'same-origin' } : {
        method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, ...data }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || `HTTP ${response.status}`);
      return payload;
    }
    function flatten(items, out = []) {
      for (const item of items) { out.push(item); if (item.children) flatten(item.children, out); }
      return out;
    }
    function parentOf(path) { return path?.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''; }
    function localLink(current, href) {
      if (!href || href.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) return null;
      let decoded;
      try { decoded = decodeURIComponent(href.split('#')[0].split('?')[0]); } catch { return null; }
      if (!decoded.toLowerCase().endsWith('.md')) return null;
      const parts = [...parentOf(current).split('/').filter(Boolean)];
      for (const part of decoded.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') { if (!parts.length) return null; parts.pop(); }
        else parts.push(part);
      }
      return parts.join('/');
    }

    function NotesPanel() {
      const [items, setItems] = useState([]);
      const [root, setRoot] = useState('');
      const [selected, setSelected] = useState(null);
      const [content, setContent] = useState('');
      const [saved, setSaved] = useState('');
      const [version, setVersion] = useState('');
      const [mode, setMode] = useState('edit');
      const [previewHtml, setPreviewHtml] = useState('');
      const [search, setSearch] = useState('');
      const [expanded, setExpanded] = useState(() => new Set());
      const [dialog, setDialog] = useState(null);
      const [message, setMessage] = useState('');
      const [error, setError] = useState(false);
      const savePromise = useRef(null);
      const selectedRef = useRef(null);
      const contentRef = useRef('');
      const savedRef = useRef('');
      const versionRef = useRef('');
      const fileSet = useMemo(() => new Set(flatten(items).filter(item => item.kind === 'note').map(item => item.path)), [items]);
      useEffect(() => { selectedRef.current = selected; }, [selected]);
      useEffect(() => { contentRef.current = content; }, [content]);
      useEffect(() => { savedRef.current = saved; }, [saved]);
      useEffect(() => { versionRef.current = version; }, [version]);

      async function reload() {
        try {
          const result = await request('tree', {});
          setItems(result.items); setRoot(result.root); setError(false);
        } catch (cause) { setMessage(cause.message); setError(true); }
      }
      useEffect(() => { reload(); }, []);
      async function refresh() {
        await reload();
        if (!selectedRef.current) return;
        if (contentRef.current !== savedRef.current) {
          setMessage('有未保存修改，请先保存再重新载入'); setError(true); return;
        }
        try {
          const result = await request('read', { path: selectedRef.current });
          contentRef.current = result.content; savedRef.current = result.content; versionRef.current = result.version;
          setContent(result.content); setSaved(result.content); setVersion(result.version);
          setMessage('已重新载入'); setError(false);
        } catch (cause) { setMessage(cause.message); setError(true); }
      }

      async function save() {
        if (!selectedRef.current || contentRef.current === savedRef.current) return true;
        if (savePromise.current) {
          try { await savePromise.current; } catch { return false; }
          return save();
        }
        const path = selectedRef.current;
        const draft = contentRef.current;
        const expectedVersion = versionRef.current;
        const operation = request('write', { path, content: draft, expectedVersion });
        savePromise.current = operation;
        try {
          const result = await operation;
          savedRef.current = draft; versionRef.current = result.version;
          setSaved(draft); setVersion(result.version); setMessage('已保存'); setError(false);
          return true;
        } catch (cause) { setMessage(cause.message); setError(true); return false; }
        finally { savePromise.current = null; }
      }
      useEffect(() => {
        if (!selected || content === saved) return;
        const timer = setTimeout(() => { void save(); }, 900);
        return () => clearTimeout(timer);
      }, [content, saved, selected]);

      async function open(path) {
        if (path === selectedRef.current) return;
        if (!(await save())) return;
        try {
          const result = await request('read', { path });
          selectedRef.current = path; contentRef.current = result.content; savedRef.current = result.content; versionRef.current = result.version;
          setSelected(path); setContent(result.content); setSaved(result.content); setVersion(result.version);
          setMessage(''); setError(false);
        } catch (cause) { setMessage(cause.message); setError(true); }
      }
      useEffect(() => {
        if (!selected || mode === 'edit') return;
        let cancelled = false;
        const timer = setTimeout(() => { request('preview', { path: selected, content }).then(result => {
          if (!cancelled) setPreviewHtml(result.html);
        }).catch(cause => { if (!cancelled) { setMessage(cause.message); setError(true); } }); }, 150);
        return () => { cancelled = true; clearTimeout(timer); };
      }, [selected, content, mode]);

      function toggle(path) {
        setExpanded(current => { const next = new Set(current); if (next.has(path)) next.delete(path); else next.add(path); return next; });
      }
      function renderTree(list, depth = 0) {
        return list.flatMap(item => {
          const matches = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.children?.some(child => containsMatch(child, search));
          if (!matches) return [];
          const opened = search || expanded.has(item.path);
          const icon = item.kind === 'folder' ? (opened ? 'IconFolderOpenOutlineRegular' : 'IconFolderCloseRegular') : 'IconDeliverDocRegular';
          const row = h('button', {
            key: item.path, type: 'button', className: 'dsh-notes-tree-row', style: { paddingLeft: `${7 + depth * 16}px` },
            'aria-current': selected === item.path ? 'page' : undefined,
            onClick: () => item.kind === 'folder' ? toggle(item.path) : void open(item.path),
            onContextMenu: event => { event.preventDefault(); setDialog({ action: 'manage', item }); },
          }, h('span', { className: 'dsh-notes-arrow' }, item.kind === 'folder' ? h(Icon, { name: opened ? 'IconChevronDownOutlineRegular' : 'IconChevronRightOutlineRegular', size: 12 }) : null),
          h('span', { className: 'dsh-notes-tree-icon' }, h(Icon, { name: icon, size: 16 })), h('span', { title: item.path }, item.name));
          return item.kind === 'folder' && opened ? [row, ...renderTree(item.children || [], depth + 1)] : [row];
        });
      }
      function containsMatch(item, query) {
        return item.name.toLowerCase().includes(query.toLowerCase()) || item.children?.some(child => containsMatch(child, query));
      }
      async function submitDialog(event) {
        event.preventDefault();
        const data = dialog;
        if (!data) return;
        try {
          if (data.action === 'create') {
            const result = await request('create', { parent: data.parent, name: data.name, kind: data.kind });
            if (data.parent) setExpanded(current => new Set([...current, data.parent]));
            await reload(); if (data.kind === 'note') await open(result.path);
          } else if (data.action === 'rename') {
            if (!(await save())) return;
            const result = await request('rename', { path: data.item.path, name: data.name });
            if (selectedRef.current === data.item.path || selectedRef.current?.startsWith(data.item.path + '/')) {
              const nextPath = result.path + selectedRef.current.slice(data.item.path.length);
              selectedRef.current = nextPath; setSelected(nextPath);
            }
            await reload();
          } else if (data.action === 'remove') {
            if (!(await save())) return;
            await request('remove', { path: data.item.path });
            if (selectedRef.current === data.item.path || selectedRef.current?.startsWith(data.item.path + '/')) {
              selectedRef.current = null; setSelected(null); setContent(''); setSaved('');
            }
            await reload();
          }
          setDialog(null); setMessage(''); setError(false);
        } catch (cause) { setMessage(cause.message); setError(true); }
      }
      function beginCreate(kind) {
        const selectedItem = flatten(items).find(item => item.path === selected);
        const parent = selectedItem?.kind === 'folder' ? selected : parentOf(selected);
        setDialog({ action: 'create', kind, parent: parent || '', name: '' });
      }
      const active = flatten(items).find(item => item.path === selected);
      const dirty = content !== saved;

      return h('div', { className: 'dsh-notes-shell' },
        h('aside', { className: 'dsh-notes-sidebar' },
          h('div', { className: 'dsh-notes-sidehead' }, h('strong', null, '笔记'),
            iconButton('IconPlusOutlineRegular', '新建笔记', () => beginCreate('note')),
            iconButton('IconFolderOpenOutlineRegular', '新建文件夹', () => beginCreate('folder')),
            iconButton('IconRefreshOutlineRegular', '刷新列表和笔记', () => void refresh())),
          h('input', { className: 'dsh-notes-search', value: search, onChange: event => setSearch(event.target.value), placeholder: '搜索笔记', 'aria-label': '搜索笔记' }),
          h('nav', { className: 'dsh-notes-tree', 'aria-label': '笔记文件列表' }, renderTree(items)),
          h('div', { className: 'dsh-notes-sidefoot', title: root }, root || '加载中')),
        h('section', { className: 'dsh-notes-main' },
          h('div', { className: 'dsh-notes-head' },
            h('span', { className: 'dsh-notes-title', title: selected || '' }, active?.name || '笔记'),
            selected ? h('div', { className: 'dsh-notes-actions' },
              h('div', { className: 'dsh-notes-modes', role: 'group', 'aria-label': '查看模式' },
                [['edit', '编辑'], ['preview', '预览'], ['split', '分屏']].map(([key, label]) => h('button', { key, type: 'button', 'aria-pressed': mode === key, onClick: () => setMode(key) }, label))),
              iconButton('IconCheckOutlineRegular', '保存笔记', () => void save(), !dirty),
              iconButton('IconEditOutlineRegular', '重命名', () => setDialog({ action: 'rename', item: active, name: active.name })),
              iconButton('IconTrashOutlineRegular', '移到回收区', () => setDialog({ action: 'remove', item: active }))) : null),
          selected ? h('div', { className: 'dsh-notes-work', 'data-mode': mode },
            mode !== 'preview' && h('textarea', { className: 'dsh-notes-editor', value: content, onChange: event => setContent(event.target.value), spellCheck: false, 'aria-label': 'Markdown 编辑器',
              onKeyDown: event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save(); } } }),
            mode !== 'edit' && h('article', { className: 'dsh-notes-preview', onClick: event => {
              const link = event.target.closest('a'); if (!link) return;
              const target = localLink(selected, link.getAttribute('href'));
              if (target && fileSet.has(target)) { event.preventDefault(); void open(target); }
            }, dangerouslySetInnerHTML: { __html: previewHtml } })) : h('div', { className: 'dsh-notes-empty' }, '选择一篇笔记，或新建笔记'),
          h('div', { className: 'dsh-notes-status', 'data-error': error }, message || (dirty ? '尚未保存' : selected ? '已保存' : ''))),
        dialog && h('div', { className: 'dsh-notes-dialog-backdrop', onMouseDown: event => { if (event.target === event.currentTarget) setDialog(null); } },
          h('form', { className: 'dsh-notes-dialog', onSubmit: submitDialog },
            h('h2', null, dialog.action === 'create' ? (dialog.kind === 'note' ? '新建笔记' : '新建文件夹') : dialog.action === 'rename' ? '重命名' : dialog.action === 'remove' ? '移到回收区' : '管理项目'),
            dialog.action === 'manage' ? h('div', { className: 'dsh-notes-dialog-actions' },
              h('button', { type: 'button', onClick: () => setDialog({ action: 'rename', item: dialog.item, name: dialog.item.name }) }, '重命名'),
              h('button', { type: 'button', onClick: () => setDialog({ action: 'remove', item: dialog.item }) }, '移到回收区'))
              : dialog.action === 'remove' ? h('p', null, `“${dialog.item.name}”将移到笔记目录的 .dsh-trash，不会永久删除。`)
              : h('input', { autoFocus: true, value: dialog.name, onChange: event => setDialog({ ...dialog, name: event.target.value }), 'aria-label': '名称', placeholder: '名称' }),
            dialog.action !== 'manage' && h('div', { className: 'dsh-notes-dialog-actions' },
              h('button', { type: 'button', onClick: () => setDialog(null) }, '取消'), h('button', { type: 'submit' }, '确定')))));
    }

    return {
      name: 'dsh-notes-client',
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const element = document.createElement('style');
          element.textContent = style;
          document.head.append(element);
          return () => element.remove();
        }, 'dsh-notes styles');
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, NotesPanel));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, label: '笔记', order: 25 },
          ({ size }) => h(Icon, { name: 'IconDeliverDocRegular', size })));
      },
    };
  },
});
