window.__ModuleLoader__.load({
  id: 'dsh-skills-cn',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useMemo, useRef } = React;

    const NS = 'skillManager';
    const MONO = 'ui-monospace, SFMono-Regular, Consolas, "Courier New", monospace';

    const zh = {
      tab: '技能管理',
      title: '技能管理',
      subtitle: '本机已安装的技能都在这里。选中一个，把它的斜杠命令写进输入框，不会自动发送。',
      search: '搜索技能：中文名、中文说明、英文标识都能搜',
      colName: '中文名称',
      colEn: '英文标识',
      colDesc: '中文说明',
      colSource: '来源',
      insert: '插入',
      inserted: '已插入 {cmd}',
      insertedClipboard: '已复制 {cmd}，粘贴到输入框即可',
      insertFailed: '插入失败，请重试',
      loading: '正在读取技能…',
      errorTitle: '读不到技能列表',
      errorBody: '当前会话还没连上，或这个 DSH 版本没有暴露技能目录。',
      retry: '重试',
      emptyNone: '本机还没有安装技能',
      emptyNoneBody: '把技能包装到 ~/.agents/skills 后重新打开本页。',
      emptySearch: '没有匹配的技能',
      emptySearchBody: '换个关键词，或者清空搜索。',
      clear: '清空搜索',
      total: '共 {n} 个技能',
      readonly: '只读 · 不会修改任何技能文件',
      untranslated: '未收录中文',
      hint: '↑↓ 选择 · Enter 插入 · / 搜索'
    };

    const en = {
      tab: 'Skills',
      title: 'Skills',
      subtitle: 'Every skill installed on this machine. Pick one to write its slash command into the composer; nothing is sent.',
      search: 'Search by Chinese name, English name, or description',
      colName: 'Chinese name',
      colEn: 'English name',
      colDesc: 'Description',
      colSource: 'Source',
      insert: 'Insert',
      inserted: 'Inserted {cmd}',
      insertedClipboard: 'Copied {cmd} — paste it into the composer',
      insertFailed: 'Insert failed, please retry',
      loading: 'Reading skills…',
      errorTitle: 'Skill list unavailable',
      errorBody: 'The session is not connected yet, or this DSH build exposes no skill catalog.',
      retry: 'Retry',
      emptyNone: 'No skills installed yet',
      emptyNoneBody: 'Add a skill pack under ~/.agents/skills, then reopen this page.',
      emptySearch: 'No matching skill',
      emptySearchBody: 'Try another keyword, or clear the search.',
      clear: 'Clear search',
      total: '{n} skills',
      readonly: 'Read-only · no skill file is modified',
      untranslated: 'no Chinese entry',
      hint: '↑↓ select · Enter insert · / search'
    };

    // Bundled Chinese index for common skill packs: SKILL.md `name` -> [中文名, 中文说明].
    const TERMS = {
      'ab-testing': ['A/B 测试与增长实验', '设计实验假设、变体、样本量与时长，排实验待办'],
      'api-and-interface-design': ['接口与 API 设计', '设计稳定的 API、模块边界与类型契约'],
      'book-to-skill': ['书籍转技能', '把 PDF、EPUB、DOCX 等文档提炼成可复用技能'],
      'browser-testing-with-devtools': ['浏览器真机调试', '用 DevTools 查 DOM、控制台报错与网络请求'],
      'ci-cd-and-automation': ['CI/CD 自动化', '搭构建与部署流水线、质量门禁与发布策略'],
      'code-review-and-quality': ['代码评审与质量', '多维度评审改动，合并前挡住质量问题'],
      'code-simplification': ['代码简化', '在不改变行为的前提下把代码改得更清晰'],
      'codex-cli-calling': ['Codex 命令行调用', '在终端非交互调用 Codex，可脚本化与结构化输出'],
      'constraint-driven-development': ['约束驱动开发', '把质量标尺写成契约，防止标准被悄悄降低'],
      'context-engineering': ['上下文工程', '配置规则文件与项目上下文，稳住输出质量'],
      'debugging-and-error-recovery': ['调试与错误恢复', '系统化定位根因，而不是靠猜和乱改'],
      'deprecation-and-migration': ['废弃与迁移', '安全下线旧系统、按阶段迁移用户'],
      'diagnose-windows-sandbox-acl': ['Windows 沙箱排障', '排查并修复 DSH 沙箱的路径访问拒绝'],
      'documentation-and-adrs': ['文档与架构决策', '记录 ADR，自动发现文档与代码脱节'],
      'doubt-driven-development': ['质疑驱动开发', '每个关键决定先过一遍对抗性复核'],
      'dsh-doc': ['DSH 文档查询', '查 DSH 的功能、插件、配置与 Cordis 接口'],
      'find-skills': ['技能发现与安装', '帮你找到需要的能力，并从市场装进来'],
      'frontend-ui-engineering': ['前端界面工程', '构建生产级、可访问、响应式的界面'],
      'git-workflow-and-versioning': ['Git 工作流与版本', '分支、提交、冲突、发布与变更日志'],
      'grok-cli-calling': ['Grok 命令行调用', '在终端非交互调用 Grok，一次性提问与脚本化'],
      'gz-quaiwei': ['中文真人化润色', '清除 AI 痕迹，重写表达节奏与语气'],
      'hermes-cli-calling': ['Hermes 命令行调用', '在终端非交互调用 Hermes Agent'],
      'idea-refine': ['想法打磨', '用发散与收敛把模糊点子磨成可执行概念'],
      'incremental-implementation': ['增量实现', '用可验证的小步交付，避免大爆炸改动'],
      'interview-me': ['需求访谈', '一次一个问题，逼出用户真正想要的'],
      'kimi-cli-calling': ['Kimi 命令行调用', '在终端非交互调用 Kimi Code CLI'],
      'memory-consolidate': ['记忆整理合并', '去重、合并、归档长期记忆与用户档案'],
      'observability-and-instrumentation': ['可观测性与埋点', '加日志、指标、追踪与告警，让线上可见'],
      office: ['Office 文件处理', '创建、编辑、渲染与转换 Word、Excel、PPT'],
      'office-docx': ['Word 文档处理', '创建、读取、编辑与校验 .docx'],
      'office-pptx': ['PPT 演示文稿', '创建、读取、编辑与校验 .pptx'],
      'office-xlsx': ['Excel 表格处理', '读写表格、公式与数据，并做重算校验'],
      'performance-optimization': ['性能优化', '定位并修复前后端、查询与数据库瓶颈'],
      'planning-and-task-breakdown': ['任务拆解规划', '把规格拆成可执行的实现任务清单'],
      'security-and-hardening': ['安全加固', '按 OWASP Top 10 审计输入、鉴权与会话'],
      'shipping-and-launch': ['上线发布', '发布前检查清单、分期放量与回滚方案'],
      'source-driven-development': ['源码驱动开发', '以官方文档为依据，避免过时写法'],
      'spec-driven-development': ['规格驱动开发', '先写规格再动手，拆解能力地图'],
      'test-driven-development': ['测试驱动开发', '红-绿-重构循环，先写失败测试'],
      'using-agent-skills': ['技能使用指南', '判断该用哪个技能、怎么调用它'],
      'workflow-authoring': ['工作流图设计', '拆分步骤、定义产出与资源说明'],
      'workflow-board': ['看板卡片设计', '在画布上展示的 HTML 看板'],
      'workflow-run-state': ['工作流运行状态', '记录并恢复工作流实例的执行进度']
    };

    const SOURCES = { npm: 'npm', github: 'GitHub', market: '市场', other: '其他' };

    function sourceOf(path) {
      if (!path) return 'other';
      const p = String(path).toLowerCase().replace(/\\/g, '/');
      if (p.indexOf('node_modules') >= 0 || p.indexOf('appdata/roaming/npm') >= 0) return 'npm';
      if (p.indexOf('.agents/skills') >= 0) return 'github';
      if (p.indexOf('dsh-market') >= 0 || p.indexOf('plugin-market') >= 0 || p.indexOf('/market/') >= 0) return 'market';
      return 'other';
    }

    function normalize(entry) {
      if (!entry || typeof entry !== 'object') return null;
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      if (!name) return null;
      const term = TERMS[name] || TERMS[name.toLowerCase()] || null;
      return {
        name: name,
        description: typeof entry.description === 'string' ? entry.description : '',
        path: typeof entry.path === 'string' ? entry.path : '',
        zhName: term ? term[0] : '',
        zhDesc: term ? term[1] : '',
        source: sourceOf(entry.path)
      };
    }

    /** Resolve the skill catalog endpoint without tripping the `remote` inject guard. */
    function resolveEndpoint(ctx) {
      const names = ['remote.skills', 'remote.sessionSkillCatalog', 'remote.skillCatalog'];
      for (let i = 0; i < names.length; i++) {
        let service;
        try { service = ctx.get(names[i]); } catch (error) { service = undefined; }
        if (service && typeof service.list === 'function') return service;
      }
      let remote;
      try { remote = ctx.get('remote'); } catch (error) { remote = undefined; }
      const keys = ['skills', 'sessionSkillCatalog', 'skillCatalog'];
      for (let i = 0; i < keys.length; i++) {
        try {
          const service = remote && remote[keys[i]];
          if (service && typeof service.list === 'function') return service;
        } catch (error) { /* the guard rejected this key; try the next */ }
      }
      return undefined;
    }

    /** Accept a Result envelope, a bare array, or `{ skills }` from any build. */
    function unwrapCatalog(raw) {
      if (raw && raw.ok === false) {
        const error = raw.error || {};
        throw new Error(String(error.code || 'error') + ': ' + String(error.message || 'skill list failed'));
      }
      if (raw && raw.ok === true) raw = raw.value;
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.skills)) return raw.skills;
      throw new Error('unexpected skill list payload');
    }

    async function listSkills(ctx, sessions, sessionId) {
      const call = async function () {
        const endpoint = resolveEndpoint(ctx);
        if (!endpoint) throw new Error('no skill catalog endpoint');
        return unwrapCatalog(await endpoint.list({ sessionId: sessionId }));
      };
      // The shipped / menu retains the session before reading its catalog; do the
      // same when the service is present, and keep the direct call as a fallback.
      if (sessions && typeof sessions.using === 'function') {
        try {
          return await sessions.using(sessionId, { source: 'skillCatalog' }, call);
        } catch (error) { /* fall back to the plain call */ }
      }
      return call();
    }

    /** Write the command through InputActions, degrading to the clipboard. */
    function insertCommand(inputActions, name) {
      const text = '/' + name + ' ';
      if (inputActions) {
        try {
          if (typeof inputActions.captureInsertion === 'function' && typeof inputActions.insertText === 'function') {
            const span = inputActions.captureInsertion();
            if (inputActions.insertText(text, span)) return 'composer';
          }
        } catch (error) { /* try the next capability */ }
        try {
          if (typeof inputActions.setDraft === 'function') {
            inputActions.setDraft(text);
            return 'composer';
          }
        } catch (error) { /* fall through */ }
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof name === 'string') {
          navigator.clipboard.writeText('/' + name);
          return 'clipboard';
        }
      } catch (error) { /* reported as failure */ }
      return 'failed';
    }

    const ROW_COLS = 'minmax(0,1.05fr) minmax(0,1fr) minmax(0,1.5fr) 96px';
    const NARROW_COLS = 'minmax(0,1fr) 84px';

    const S = {
      root: {
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: '16px 20px 12px', gap: '12px', boxSizing: 'border-box',
        color: 'var(--dsw-alias-label-primary)', fontFamily: 'inherit'
      },
      head: { display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '0 0 auto' },
      titles: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
      h1: { margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '0.2px' },
      sub: { margin: 0, fontSize: '12px', lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' },
      count: {
        marginLeft: 'auto', flex: '0 0 auto', fontSize: '12px', padding: '3px 10px',
        whiteSpace: 'nowrap', borderRadius: '999px',
        color: 'var(--dsw-alias-label-secondary)',
        background: 'var(--dsw-alias-bg-layer-2)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      chip: {
        flex: '0 0 auto', fontSize: '11.5px', padding: '3px 9px', whiteSpace: 'nowrap',
        borderRadius: '999px', color: 'var(--dsw-alias-label-secondary)',
        background: 'transparent', border: '1px solid var(--dsw-alias-border-l1)'
      },
      searchWrap: {
        display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto', height: '36px',
        padding: '0 11px', borderRadius: '10px',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      input: {
        flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent',
        fontSize: '13px', fontFamily: 'inherit', color: 'var(--dsw-alias-label-primary)'
      },
      slash: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', fontFamily: MONO },
      card: {
        flex: '0 1 auto', minHeight: '0px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRadius: '12px',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      thead: function (narrow) {
        return {
          display: 'grid', gridTemplateColumns: narrow ? NARROW_COLS : ROW_COLS,
          gap: '14px', alignItems: 'center',
          flex: '0 0 auto', height: '32px', padding: '0 14px', fontSize: '11.5px',
          color: 'var(--dsw-alias-label-secondary)',
          borderBottom: '1px solid var(--dsw-alias-border-l1)'
        };
      },
      list: { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' },
      row: function (selected, hovered, narrow) {
        return {
          display: 'grid', gridTemplateColumns: narrow ? NARROW_COLS : ROW_COLS,
          gap: '14px', alignItems: 'center',
          minHeight: '54px', padding: narrow ? '8px 14px' : '0 14px',
          position: 'relative', cursor: 'pointer',
          borderBottom: '1px solid var(--dsw-alias-border-l1)',
          background: selected ? 'var(--dsw-alias-bg-layer-2)'
            : hovered ? 'var(--dsw-alias-bg-base)' : 'transparent'
        };
      },
      accent: {
        position: 'absolute', left: 0, top: '9px', bottom: '9px', width: '3px',
        borderRadius: '0 3px 3px 0', background: 'var(--dsw-alias-brand-primary)'
      },
      zhName: {
        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      },
      badge: { fontSize: '10.5px', fontWeight: 400, color: 'var(--dsw-alias-label-secondary)' },
      enName: {
        fontSize: '11.5px', fontFamily: MONO, whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', color: 'var(--dsw-alias-label-secondary)'
      },
      desc: {
        fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        color: 'var(--dsw-alias-label-secondary)'
      },
      tag: function (market) {
        return {
          justifySelf: 'start', fontSize: '11px', lineHeight: 1, padding: '4px 8px',
          borderRadius: '999px', whiteSpace: 'nowrap',
          color: market ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)',
          background: 'var(--dsw-alias-bg-layer-2)',
          border: '1px solid var(--dsw-alias-border-l1)'
        };
      },
      insertBtn: {
        justifySelf: 'start', fontSize: '11.5px', padding: '4px 10px', cursor: 'pointer',
        borderRadius: '999px', fontFamily: 'inherit',
        color: 'var(--dsw-alias-brand-primary)',
        background: 'transparent',
        border: '1px solid var(--dsw-alias-brand-primary)'
      },
      footer: {
        display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto', padding: '0 2px',
        fontSize: '11.5px', color: 'var(--dsw-alias-label-secondary)'
      },
      state: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '8px', padding: '40px 24px', textAlign: 'center'
      },
      stateTitle: { fontSize: '13px', fontWeight: 600 },
      stateBody: {
        fontSize: '12.5px', lineHeight: 1.6, maxWidth: '380px',
        color: 'var(--dsw-alias-label-secondary)'
      },
      button: {
        marginTop: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '12.5px',
        cursor: 'pointer', fontFamily: 'inherit',
        color: 'var(--dsw-alias-label-primary)',
        background: 'transparent',
        border: '1px solid var(--dsw-alias-border-l2)'
      },
      toast: function (ok) {
        return {
          position: 'absolute', right: '18px', bottom: '16px', maxWidth: '72%',
          display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px',
          fontSize: '12px', borderRadius: '9px',
          color: 'var(--dsw-alias-label-primary)',
          background: 'var(--dsw-alias-bg-overlay)',
          border: '1px solid ' + (ok ? 'var(--dsw-alias-border-l1)' : 'var(--dsw-alias-state-error-primary)'),
          boxShadow: '0 8px 24px rgba(16,24,40,0.14)'
        };
      }
    };

    function makeT(bind) {
      return function (key, vars) {
        let text;
        try { text = bind(key); } catch (error) { text = undefined; }
        if (typeof text !== 'string') text = en[key] || zh[key] || key;
        if (vars) {
          text = text.replace(/\{(\w+)\}/g, function (match, token) {
            return vars[token] == null ? match : String(vars[token]);
          });
        }
        return text;
      };
    }

    function Panel(props) {
      const t = props.t;
      const sessionId = props.sessionId;
      const inputActions = props.inputActions;
      const ctx = props.ctx;
      const getSessions = props.getSessions;

      const [rows, setRows] = useState(null);
      const [failure, setFailure] = useState(null);
      const [query, setQuery] = useState('');
      const [selected, setSelected] = useState('');
      const [hover, setHover] = useState('');
      const [toast, setToast] = useState(null);
      const [attempt, setAttempt] = useState(0);
      const inputRef = useRef(null);
      const rootRef = useRef(null);
      const cardRef = useRef(null);
      const toastTimer = useRef(0);
      const lastInsert = useRef(null);
      const [cardMax, setCardMax] = useState(0);
      const [narrow, setNarrow] = useState(false);

      // The conversation view does not guarantee a flex-bounded height, so measure
      // the room the view actually has and cap the list to it.
      useEffect(function () {
        const measure = function () {
          const el = cardRef.current;
          if (!el) return;
          const top = el.getBoundingClientRect().top;
          if (!top) return;
          const room = window.innerHeight - top - 176;
          setCardMax(Math.max(200, Math.min(room, Math.round(window.innerHeight * 0.72))));
          const width = el.getBoundingClientRect().width;
          if (width) setNarrow(width < 560);
        };
        measure();
        const later = setTimeout(measure, 350);
        window.addEventListener('resize', measure);
        const el = cardRef.current;
        let observer = null;
        if (el && typeof ResizeObserver === 'function') {
          observer = new ResizeObserver(measure);
          observer.observe(el);
        }
        return function () {
          clearTimeout(later);
          window.removeEventListener('resize', measure);
          if (observer) observer.disconnect();
        };
      }, []);

      useEffect(() => {
        let alive = true;
        let timer = 0;
        setRows(null);
        setFailure(null);

        const run = async function (tries) {
          if (!resolveEndpoint(ctx) && tries > 0) {
            timer = setTimeout(function () { run(tries - 1); }, 250);
            return;
          }
          try {
            const entries = await listSkills(ctx, getSessions(), sessionId);
            if (!alive) return;
            const next = [];
            for (let i = 0; i < entries.length; i++) {
              const row = normalize(entries[i]);
              if (row) next.push(row);
            }
            next.sort(function (a, b) { return a.name.localeCompare(b.name); });
            setRows(next);
          } catch (error) {
            if (!alive) return;
            setFailure(error && error.message ? error.message : 'unknown error');
          }
        };

        run(8);
        return function () { alive = false; if (timer) clearTimeout(timer); };
      }, [ctx, getSessions, sessionId, attempt]);

      useEffect(function () {
        return function () { if (toastTimer.current) clearTimeout(toastTimer.current); };
      }, []);

      const filtered = useMemo(function () {
        if (!rows) return [];
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(function (row) {
          return (row.zhName && row.zhName.toLowerCase().indexOf(q) >= 0)
            || (row.zhDesc && row.zhDesc.toLowerCase().indexOf(q) >= 0)
            || row.name.toLowerCase().indexOf(q) >= 0
            || (row.description && row.description.toLowerCase().indexOf(q) >= 0);
        });
      }, [rows, query]);

      const flash = function (message, ok) {
        setToast({ message: message, ok: ok });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(function () { setToast(null); }, 2400);
      };

      const doInsert = function (row) {
        if (!row) return;
        // The same row must not insert twice from one gesture (wheel + Enter, double
        // click + bubbling keydown, and so on).
        const now = Date.now();
        if (lastInsert.current && lastInsert.current.name === row.name && now - lastInsert.current.at < 600) return;
        lastInsert.current = { name: row.name, at: now };
        const how = insertCommand(inputActions, row.name);
        const cmd = '/' + row.name;
        if (how === 'composer') flash(t('inserted', { cmd: cmd }), true);
        else if (how === 'clipboard') flash(t('insertedClipboard', { cmd: cmd }), true);
        else flash(t('insertFailed'), false);
      };

      const onKeyDown = function (event) {
        if (!filtered.length) return;
        const index = filtered.findIndex(function (row) { return row.name === selected; });
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelected(filtered[Math.min(index + 1, filtered.length - 1)].name);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelected(filtered[Math.max(index - 1, 0)].name);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          doInsert(filtered[index >= 0 ? index : 0]);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setQuery('');
        }
      };

      let body;
      if (failure) {
        body = h('div', { style: S.state },
          h('div', { style: S.stateTitle }, t('errorTitle')),
          h('div', { style: S.stateBody }, t('errorBody') + ' (' + failure + ')'),
          h('button', {
            type: 'button', style: S.button,
            onClick: function () { setAttempt(attempt + 1); }
          }, t('retry'))
        );
      } else if (rows === null) {
        body = h('div', { style: S.state }, h('div', { style: S.stateBody }, t('loading')));
      } else if (!rows.length) {
        body = h('div', { style: S.state },
          h('div', { style: S.stateTitle }, t('emptyNone')),
          h('div', { style: S.stateBody }, t('emptyNoneBody'))
        );
      } else if (!filtered.length) {
        body = h('div', { style: S.state },
          h('div', { style: S.stateTitle }, t('emptySearch')),
          h('div', { style: S.stateBody }, t('emptySearchBody')),
          h('button', {
            type: 'button', style: S.button,
            onClick: function () { setQuery(''); }
          }, t('clear'))
        );
      } else {
        body = h('div', { style: { display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' } },
          h('div', { style: S.thead(narrow) },
            h('div', null, t('colName')),
            narrow ? h('div', null, t('colSource')) : h('div', null, t('colEn')),
            narrow ? null : h('div', null, t('colDesc')),
            narrow ? null : h('div', null, t('colSource'))
          ),
          h('div', { style: S.list, role: 'listbox', 'aria-label': t('title') },
            filtered.map(function (row) {
              const isSelected = row.name === selected;
              const isHover = row.name === hover;
              const action = (isHover || isSelected)
                ? h('button', {
                    type: 'button', style: S.insertBtn,
                    onClick: function (event) { event.stopPropagation(); setSelected(row.name); doInsert(row); },
                    title: '/' + row.name
                  }, t('insert'))
                : h('span', { style: S.tag(row.source === 'market') }, SOURCES[row.source] || SOURCES.other);
              return h('div', {
                key: row.name,
                role: 'option',
                'aria-selected': isSelected,
                style: S.row(isSelected, isHover, narrow),
                onMouseEnter: function () { setHover(row.name); },
                onMouseLeave: function () { setHover(''); },
                onClick: function () {
                  setSelected(row.name);
                  if (inputRef.current) inputRef.current.focus();
                },
                onDoubleClick: function () { setSelected(row.name); doInsert(row); },
                title: row.description || row.name
              },
                isSelected ? h('span', { style: S.accent }) : null,
                narrow
                  ? h('div', { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
                      h('div', { style: S.zhName },
                        row.zhName || row.name,
                        row.zhName ? null : h('span', { style: S.badge }, t('untranslated'))
                      ),
                      h('div', { style: S.enName }, row.name),
                      h('div', { style: S.desc }, row.zhDesc || row.description || '—')
                    )
                  : h('div', { style: S.zhName },
                      row.zhName || row.name,
                      row.zhName ? null : h('span', { style: S.badge }, t('untranslated'))
                    ),
                narrow ? action : h('div', { style: S.enName }, row.name),
                narrow ? null : h('div', { style: S.desc }, row.zhDesc || row.description || '—'),
                narrow ? null : action
              );
            })
          )
        );
      }

      return h('div', { ref: rootRef, style: S.root, tabIndex: -1, onKeyDown: onKeyDown },
        h('div', { style: S.head },
          h('div', {
            'aria-hidden': true,
            style: {
              flex: '0 0 auto', width: '26px', height: '26px', marginTop: '1px',
              borderRadius: '8px', display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: '13px', fontWeight: 600,
              background: 'var(--dsw-alias-brand-primary)'
            }
          }, '技'),
          h('div', { style: S.titles },
            h('h1', { style: S.h1 }, t('title')),
            narrow ? null : h('p', { style: S.sub }, t('subtitle'))
          ),
          rows && rows.length ? h('div', { style: S.count }, t('total', { n: rows.length })) : null,
          narrow ? null : h('div', { style: S.chip }, t('readonly'))
        ),
        h('div', { style: S.searchWrap },
          h('svg', {
            width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true,
            style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-secondary)' }
          }, h('circle', { cx: 7, cy: 7, r: 4.3 }), h('path', { d: 'M10.4 10.4L14 14' })),
          h('input', {
            ref: inputRef, style: S.input, value: query, spellCheck: false,
            placeholder: t('search'), 'aria-label': t('search'),
            title: t('hint'),
            onChange: function (event) { setQuery(event.target.value); }
          }),
          h('span', { style: S.slash }, '/')
        ),
        h('div', { ref: cardRef, style: Object.assign({}, S.card, cardMax ? { maxHeight: cardMax + 'px' } : { maxHeight: '58vh' }) }, body),
        toast
          ? h('div', { style: S.toast(toast.ok) },
              h('span', {
                style: { color: toast.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)' }
              }, toast.ok ? '✓' : '!'),
              h('span', null, toast.message)
            )
          : null
      );
    }

    const name = 'skill-manager';
    const inject = ['slots', 'locale'];

    function apply(ctx) {
      const t = makeT(ctx.locale.bind(NS));
      const getSessions = function () { return ctx.get('sessions'); };

      ctx.effect(function () { return ctx.locale.register(NS, { zh: zh, en: en }); }, 'skill-manager: dictionaries');
      ctx.slots.inject('conversation.view', function () {
        return ctx.slots.register({
          name: 'conversation.view',
          id: 'skill-manager',
          order: 30,
          label: function () { return t('tab'); },
          locale: NS
        }, function (props) {
          return h(Panel, Object.assign({}, props, { t: t, ctx: ctx, getSessions: getSessions }));
        });
      });
    }

    return { name: name, inject: inject, apply: apply };
  }
});
