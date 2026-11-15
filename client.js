window.__ModuleLoader__.load({
  id: 'dsh-skills-cn',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useMemo, useRef } = React;

    const NS = 'skillManager';
    const MONO = 'ui-monospace, SFMono-Regular, Consolas, "Courier New", monospace';
    const PAGE_SIZE = 25;
    const STORE = {
      cache: 'dsh-skills-cn/cache/v1',
      usage: 'dsh-skills-cn/usage/v1',
      ui: 'dsh-skills-cn/ui/v1'
    };
    const GROUPS = ['all', 'user', 'bundled', 'runtime', 'other'];
    const SORTS = ['usage', 'name', 'source'];

    const zh = {
      tab: '技能管理',
      title: '技能管理',
      subtitle: '本机已安装的技能都在这里。选中一个，把它的斜杠命令写进输入框，不会自动发送。',
      search: '搜索技能：中文名、中文说明、英文标识都能搜',
      groupAll: '全部技能',
      groupUser: '用户目录',
      groupBundled: 'DSH 内置',
      groupRuntime: '插件提供',
      groupOther: '其他',
      sourceAll: '全部来源',
      filterSource: '按来源分组',
      sortLabel: '排序',
      sortUsage: '常用优先',
      sortName: '名称字母序',
      sortSource: '按来源分组',
      refresh: '刷新',
      colName: '中文名称',
      colEn: '英文标识',
      colDesc: '中文说明',
      colDir: '目录',
      colProvider: '提供方',
      colUsage: '使用',
      noDir: '无目录（运行时注册）',
      noProvider: '—',
      resetWidths: '重置列宽',
      dragHint: '拖动调整列宽',
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
      emptySearchBody: '换个关键词，或者清空搜索与筛选。',
      clear: '清空搜索与筛选',
      total: '共 {n} 个技能',
      countInGroup: '共 {n} 个',
      readonly: '只读浏览 · 删除需在批量模式二次确认',
      untranslated: '未收录中文',
      hint: '↑↓ 选择 · Enter 插入 · / 搜索',
      usedN: '已用 {n} 次',
      neverUsed: '未使用',
      lastAt: '最近 {time}',
      selected: '已选中：{name} / {id}',
      clearSelection: '取消选择',
      more: '展开英文原文',
      less: '收起',
      whenToUse: '适用场景',
      pathLabel: '路径',
      edit: '编辑中文对照',
      editTitle: '编辑「{name}」的中文对照',
      editName: '中文名称',
      editDesc: '中文说明',
      editPlaceholderName: '例如：剪映视频剪辑',
      editPlaceholderDesc: '例如：剪映专业版剪辑、字幕、配乐与导出',
      save: '保存',
      cancel: '取消',
      restore: '恢复自动',
      saved: '已保存中文对照',
      restored: '已恢复为内置对照',
      resetUsage: '清空使用记录',
      resetTitle: '清空全部使用记录？',
      resetBody: '会删除所有技能的使用次数与最近使用时间，列表将回到默认顺序。该操作不可撤销。',
      resetOk: '确认清空',
      resetDone: '使用记录已清空',
      pagerPrev: '上一页',
      pagerNext: '下一页',
      pagerInfo: '共 {n} 项 · 第 {page}/{pages} 页',
      noDesc: '暂无描述',
      other: '其他',
      batch: '批量删除',
      batchTip: '进入批量模式：勾选技能后一次性真实删除',
      exitBatch: '退出批量',
      pickedN: '已选 {n} 个',
      pickedDeletable: '可删除 {m} 个',
      selectPage: '全选本页可删除',
      clearPicked: '清空选择',
      deleteSelected: '删除选中…',
      notDeletable: '由 npm / 市场 / 预设提供，请用对应包管理器卸载',
      deleteTitle: '删除 {n} 个技能？',
      deleteBody: '以下目录与文件会被永久删除，无法撤销。',
      deleteBodyTrash: '以下技能会先移入回收站，之后可以恢复或彻底删除。',
      deleteLockNote: '其中 {n} 个在 .skill-lock.json 里注册，删除时会同步移除这些记录。',
      deleteNoLockNote: '这 {n} 个都不在 .skill-lock.json 里注册，删除时不会改动锁文件。',
      deleteTypeHint: '输入「{word}」以启用确认按钮',
      deleteTypeWord: '删除',
      deleteGo: '确认删除',
      deleting: '正在删除…',
      deleteCancel: '取消',
      deletedOk: '已删除 {n} 个技能',
      deletedLockPart: '，skill-lock 移除 {m} 条',
      deletedFailPart: '，失败 {k} 个',
      deleteUnavailable: '删除服务不可用：需要插件的 Host 半边生效并重启 DSH',
      deleteNoSelection: '先勾选要删除的技能',
      deletePreviewFailed: '读取删除预览失败',
      reasonMissing: '目录已不存在（仅清理锁记录）',
      reasonManaged: '托管安装，不能在此删除',
      reasonSymlink: '符号链接，已跳过',
      reasonOutside: '不在允许的技能目录内',
      reasonInvalid: '名称不合法',
      reasonLockUnreadable: 'skill-lock 无法解析，已中止（未删除任何文件）',
      lockRegistered: '已注册 skill-lock',
      lockNotRegistered: '未注册 skill-lock',
      filesN: '{n} 个文件 · {size}',
      deleteHint: '删除入口只在批量模式里，行内没有删除按钮',
      trash: '回收站',
      trashTitle: '回收站（{n} 项）',
      trashEmpty: '回收站是空的',
      trashRestore: '恢复',
      trashPurge: '彻底删除',
      trashPurgeAll: '清空回收站',
      trashPurgeAllConfirm: '彻底删除回收站里的 {n} 项？删除后无法恢复。',
      trashRestored: '已恢复 {n} 个技能',
      trashRestoredLock: '已恢复 {n} 个技能（含 skill-lock 记录）',
      reasonTargetExists: '目标目录已存在，未覆盖',
      reasonLockWrite: 'skill-lock 写入失败，文件已退回回收站',
      reasonEntryGone: '回收站条目已不存在',
      trashPurged: '已彻底删除 {n} 项',
      trashFailed: '操作失败',
      trashAt: '{time} 移除',
      trashKeep: '先移到回收站（可恢复）',
      trashHardWarn: '取消勾选将永久删除技能文件，无法恢复。',
      trashedOk: '已移入回收站 {n} 个技能',
      trashedLockPart: '，skill-lock 移除 {m} 条（恢复时会写回）',
      trashLoadFailed: '读取回收站失败'
    };

    const en = {
      tab: 'Skills',
      title: 'Skills',
      subtitle: 'Every skill installed on this machine. Pick one to write its slash command into the composer; nothing is sent.',
      search: 'Search by Chinese name, English name, or description',
      groupAll: 'All skills',
      groupUser: 'User folders',
      groupBundled: 'DSH bundled',
      groupRuntime: 'Plugin provided',
      groupOther: 'Other',
      sourceAll: 'All sources',
      filterSource: 'Group by source',
      sortLabel: 'Sort',
      sortUsage: 'Most used',
      sortName: 'Name A→Z',
      sortSource: 'Group by source',
      refresh: 'Refresh',
      colName: 'Chinese name',
      colEn: 'English name',
      colDesc: 'Description',
      colDir: 'Directory',
      colProvider: 'Provider',
      colUsage: 'Usage',
      noDir: 'no directory (runtime)',
      noProvider: '—',
      resetWidths: 'Reset widths',
      dragHint: 'Drag to resize',
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
      emptySearchBody: 'Try another keyword, or clear the search and filters.',
      clear: 'Clear search and filters',
      total: '{n} skills',
      countInGroup: '{n} in total',
      readonly: 'Read-only browsing · deletion needs explicit confirmation',
      untranslated: 'no Chinese entry',
      hint: '↑↓ select · Enter insert · / search',
      usedN: 'used {n}×',
      neverUsed: 'unused',
      lastAt: 'last {time}',
      selected: 'Selected: {name} / {id}',
      clearSelection: 'Clear selection',
      more: 'Show English source',
      less: 'Hide',
      whenToUse: 'When to use',
      pathLabel: 'Path',
      edit: 'Edit Chinese entry',
      editTitle: 'Edit the Chinese entry of “{name}”',
      editName: 'Chinese name',
      editDesc: 'Chinese description',
      editPlaceholderName: 'e.g. 剪映视频剪辑',
      editPlaceholderDesc: 'e.g. 剪映专业版剪辑、字幕、配乐与导出',
      save: 'Save',
      cancel: 'Cancel',
      restore: 'Restore built-in',
      saved: 'Chinese entry saved',
      restored: 'Restored the built-in entry',
      resetUsage: 'Clear usage records',
      resetTitle: 'Clear all usage records?',
      resetBody: 'Every usage count and last-used time is deleted and the list returns to its default order. This cannot be undone.',
      resetOk: 'Clear',
      resetDone: 'Usage records cleared',
      pagerPrev: 'Previous',
      pagerNext: 'Next',
      pagerInfo: '{n} items · page {page}/{pages}',
      noDesc: 'No description',
      other: 'Other',
      batch: 'Delete skills',
      batchTip: 'Selection mode: tick skills to delete them from disk',
      exitBatch: 'Exit selection',
      pickedN: '{n} selected',
      pickedDeletable: '{m} deletable',
      selectPage: 'Select deletable on this page',
      clearPicked: 'Clear selection',
      deleteSelected: 'Delete selected…',
      notDeletable: 'Provided by npm / the market / a preset — uninstall it there',
      deleteTitle: 'Delete {n} skills?',
      deleteBody: 'These directories and files are removed permanently. This cannot be undone.',
      deleteBodyTrash: 'These skills move to the trash first; you can restore or purge them afterwards.',
      deleteLockNote: '{n} of them are registered in .skill-lock.json; those entries are removed too.',
      deleteNoLockNote: 'None of them are registered in .skill-lock.json, so the lock file is left untouched.',
      deleteTypeHint: 'Type “{word}” to enable the confirm button',
      deleteTypeWord: 'DELETE',
      deleteGo: 'Delete permanently',
      deleting: 'Deleting…',
      deleteCancel: 'Cancel',
      deletedOk: '{n} skills deleted',
      deletedLockPart: ', {m} lock entries removed',
      deletedFailPart: ', {k} failed',
      deleteUnavailable: 'Deletion unavailable: the plugin host half must be active — reinstall and restart DSH',
      deleteNoSelection: 'Tick the skills to delete first',
      deletePreviewFailed: 'Could not read the deletion preview',
      reasonMissing: 'Directory is already gone (lock cleaned only)',
      reasonManaged: 'Managed install — delete it through its package manager',
      reasonSymlink: 'Symlink skipped',
      reasonOutside: 'Outside the allowed skill roots',
      reasonInvalid: 'Invalid name',
      reasonLockUnreadable: '.skill-lock.json is unreadable, aborted — nothing was deleted',
      lockRegistered: 'registered in skill-lock',
      lockNotRegistered: 'not registered',
      filesN: '{n} files · {size}',
      deleteHint: 'Deletion only exists in selection mode; there is no per-row delete button',
      trash: 'Trash',
      trashTitle: 'Trash ({n} items)',
      trashEmpty: 'The trash is empty',
      trashRestore: 'Restore',
      trashPurge: 'Delete forever',
      trashPurgeAll: 'Empty the trash',
      trashPurgeAllConfirm: 'Permanently delete all {n} items in the trash? This cannot be undone.',
      trashRestored: 'Restored {n} skills',
      trashRestoredLock: 'Restored {n} skills with their skill-lock records',
      reasonTargetExists: 'the target directory already exists — nothing was overwritten',
      reasonLockWrite: 'skill-lock write failed; the files went back to the trash',
      reasonEntryGone: 'the trash entry no longer exists',
      trashPurged: 'Permanently deleted {n} items',
      trashFailed: 'The action failed',
      trashAt: 'removed {time}',
      trashKeep: 'Move to the trash first (recoverable)',
      trashHardWarn: 'Unchecking deletes the skill files permanently.',
      trashedOk: 'Moved {n} skills to the trash',
      trashedLockPart: ', {m} lock entries removed (restored with the skill)',
      trashLoadFailed: 'Could not read the trash'
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

    const SOURCE_LABEL = { npm: 'npm', github: 'GitHub', market: '市场', preset: '预设', other: '其他' };
    const SOURCE_ORDER = { npm: 0, github: 1, market: 2, preset: 3, other: 4 };

    // ---------------------------------------------------------------- helpers
    function sourceOf(path) {
      if (!path) return 'other';
      const p = String(path).toLowerCase().replace(/\\/g, '/');
      // Skills bundled inside the app or a bundled package: read-only preset content.
      if (p.indexOf('app.asar') >= 0 || p.indexOf('/resources/app/') >= 0) return 'preset';
      if (p.indexOf('node_modules') >= 0 || p.indexOf('appdata/roaming/npm') >= 0) return 'npm';
      if (p.indexOf('.agents/skills') >= 0) return 'github';
      if (p.indexOf('dsh-market') >= 0 || p.indexOf('plugin-market') >= 0 || p.indexOf('/market/') >= 0) return 'market';
      return 'other';
    }

    function dirOf(target) {
      if (!target) return '';
      const cut = Math.max(String(target).lastIndexOf('\\'), String(target).lastIndexOf('/'));
      return cut > 0 ? String(target).slice(0, cut) : '';
    }

    /** Shorten a directory under one of the allowed roots to a `~/…` form. */
    function prettyDir(dir, roots) {
      if (!dir) return '';
      if (!Array.isArray(roots)) return dir;
      const normalized = String(dir).replace(/\\/g, '/');
      for (let i = 0; i < roots.length; i++) {
        const root = String(roots[i].dir || '').replace(/\\/g, '/').replace(/\/+$/, '');
        if (!root) continue;
        const lower = normalized.toLowerCase();
        if (lower !== root.toLowerCase() && lower.indexOf(root.toLowerCase() + '/') !== 0) continue;
        const markers = [root.indexOf('/.agents/'), root.indexOf('/.dsh/')].filter(function (idx) { return idx >= 0; });
        if (markers.length > 0) return '~' + normalized.slice(Math.min.apply(null, markers));
        return normalized;
      }
      return dir;
    }

    /**
     * Which fact-based group a skill belongs to.
     * The Host registry reports `source` ('user-agents' / 'bundled' / 'runtime' /
     * 'project-dsh' / ...); without it we fall back to the path heuristic.
     */
    function groupFor(source, path) {
      if (source === 'bundled') return 'bundled';
      if (source === 'runtime' || source === 'custom') return 'runtime';
      if (source && source.indexOf('user-') === 0) return 'user';
      if (!source || source === 'unknown') {
        const legacy = sourceOf(path);
        if (legacy === 'preset') return 'bundled';
        if (legacy === 'npm' || legacy === 'market') return 'runtime';
        if (legacy === 'github') return 'user';
        return 'other';
      }
      return 'other';
    }

    function normalize(entry) {
      if (!entry || typeof entry !== 'object') return null;
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      if (!name) return null;
      const term = TERMS[name] || TERMS[name.toLowerCase()] || null;
      const path = typeof entry.path === 'string' ? entry.path : '';
      const provider = typeof entry.provider === 'string' ? entry.provider : '';
      const source = typeof entry.source === 'string' ? entry.source : '';
      return {
        name: name,
        description: typeof entry.description === 'string' ? entry.description : '',
        whenToUse: typeof entry.whenToUse === 'string' ? entry.whenToUse : '',
        path: path,
        dir: dirOf(path),
        provider: provider,
        source: source,
        group: groupFor(source, path),
        dictName: term ? term[0] : '',
        dictDesc: term ? term[1] : ''
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
            if (inputActions.insertText(text, span)) return { how: 'composer', rev: span && span.draftRev };
          }
        } catch (error) { /* try the next capability */ }
        try {
          if (typeof inputActions.setDraft === 'function') {
            inputActions.setDraft(text);
            return { how: 'composer' };
          }
        } catch (error) { /* fall through */ }
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof name === 'string') {
          navigator.clipboard.writeText('/' + name);
          return { how: 'clipboard' };
        }
      } catch (error) { /* reported as failure */ }
      return { how: 'failed' };
    }

    function loadStore(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const value = JSON.parse(raw);
        return value && typeof value === 'object' ? value : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function saveStore(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage unavailable */ }
    }

    function relTime(at, locale) {
      if (!at) return '';
      const diff = Date.now() - at;
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      if (diff < minute) return '<1m';
      if (diff < hour) return Math.floor(diff / minute) + 'm';
      if (diff < day) return Math.floor(diff / hour) + 'h';
      if (diff < 30 * day) return Math.floor(diff / day) + 'd';
      return new Date(at).toISOString().slice(0, 10);
    }

    // ----------------------------------------------------------------- styles
    const ROW_COLS = 'minmax(140px,1.1fr) minmax(110px,1fr) minmax(0,1.4fr) 64px 84px';
    const NARROW_COLS = 'minmax(0,1fr) 84px';

    // Column model for the wide table: the widths are user-resizable and persisted.
    // `flex` columns may absorb leftover width, so the table fits without scrolling.
    const COLUMNS = [
      { key: 'name', label: 'colName', min: 96, def: 110, flex: false },
      { key: 'en', label: 'colEn', min: 84, def: 96, flex: false },
      { key: 'desc', label: 'colDesc', min: 96, def: 130, flex: true },
      { key: 'dir', label: 'colDir', min: 90, def: 130, flex: true },
      { key: 'provider', label: 'colProvider', min: 60, def: 70, flex: false },
      { key: 'usage', label: 'colUsage', min: 42, def: 46, flex: false }
    ];
    const DEFAULT_WIDTHS = COLUMNS.map(function (column) { return column.def; });
    const WIDTHS_VERSION = 2;

    const S = {
      root: {
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: '16px 20px 12px', gap: '12px', boxSizing: 'border-box',
        color: 'var(--dsw-alias-label-primary)', fontFamily: 'inherit'
      },
      head: { display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '0 0 auto' },
      avatar: {
        flex: '0 0 auto', width: '26px', height: '26px', marginTop: '1px',
        borderRadius: '8px', display: 'grid', placeItems: 'center',
        color: '#fff', fontSize: '13px', fontWeight: 600,
        background: 'var(--dsw-alias-brand-primary)'
      },
      titles: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
      h1: { margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '0.2px' },
      sub: { margin: 0, fontSize: '12px', lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' },
      chip: {
        flex: '0 0 auto', fontSize: '11.5px', padding: '3px 9px', whiteSpace: 'nowrap',
        borderRadius: '999px', color: 'var(--dsw-alias-label-secondary)',
        background: 'transparent', border: '1px solid var(--dsw-alias-border-l1)'
      },
      countChip: {
        marginLeft: 'auto', flex: '0 0 auto', fontSize: '12px', padding: '3px 10px',
        whiteSpace: 'nowrap', borderRadius: '999px',
        color: 'var(--dsw-alias-label-secondary)',
        background: 'var(--dsw-alias-bg-layer-2)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      card: {
        flex: '0 1 auto', minHeight: '0px', display: 'flex', flexDirection: 'row',
        overflow: 'hidden', borderRadius: '12px',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      groups: {
        flex: '0 0 auto', width: '188px', display: 'flex', flexDirection: 'column',
        gap: '2px', padding: '10px 8px', boxSizing: 'border-box',
        borderRight: '1px solid var(--dsw-alias-border-l1)',
        overflowY: 'auto'
      },
      groupTitle: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', padding: '2px 8px 6px' },
      groupItem: function (active) {
        return {
          display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
          padding: '7px 9px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '12.5px', textAlign: 'left', fontFamily: 'inherit',
          color: active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-primary)',
          background: active ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
          border: '1px solid ' + (active ? 'var(--dsw-alias-border-l1)' : 'transparent')
        };
      },
      groupLabel: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      groupCount: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', fontVariantNumeric: 'tabular-nums' },
      main: { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' },
      toolbar: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
        borderBottom: '1px solid var(--dsw-alias-border-l1)', flex: '0 0 auto'
      },
      searchWrap: {
        display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', minWidth: '120px',
        height: '32px', padding: '0 10px', borderRadius: '9px',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      input: {
        flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent',
        fontSize: '12.5px', fontFamily: 'inherit', color: 'var(--dsw-alias-label-primary)'
      },
      select: {
        height: '32px', padding: '0 8px', borderRadius: '9px', fontSize: '12px',
        fontFamily: 'inherit', color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      iconBtn: {
        flex: '0 0 auto', height: '32px', padding: '0 10px', borderRadius: '9px',
        fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        color: 'var(--dsw-alias-label-primary)', background: 'transparent',
        border: '1px solid var(--dsw-alias-border-l1)', display: 'flex', alignItems: 'center', gap: '6px'
      },
      thead: function (narrow, template) {
        return {
          display: 'grid', gridTemplateColumns: template || (narrow ? NARROW_COLS : ROW_COLS),
          gap: '10px', alignItems: 'center', flex: '0 0 auto', height: '30px',
          padding: '0 10px', fontSize: '11px',
          color: 'var(--dsw-alias-label-secondary)',
          borderBottom: '1px solid var(--dsw-alias-border-l1)'
        };
      },
      list: { flex: '1 1 auto', minHeight: '0', overflowY: 'auto', overflowX: 'visible' },
      row: function (active, hovered, narrow, template) {
        return {
          display: 'grid', gridTemplateColumns: template || (narrow ? NARROW_COLS : ROW_COLS),
          gap: '10px', alignItems: 'center',
          minHeight: narrow ? '0px' : '52px', padding: narrow ? '8px 14px' : '0 10px',
          position: 'relative', cursor: 'pointer',
          borderBottom: '1px solid var(--dsw-alias-border-l1)',
          background: active ? 'var(--dsw-alias-bg-layer-2)'
            : hovered ? 'var(--dsw-alias-bg-base)' : 'transparent'
        };
      },
      accent: {
        position: 'absolute', left: 0, top: '8px', bottom: '8px', width: '3px',
        borderRadius: '0 3px 3px 0', background: 'var(--dsw-alias-brand-primary)'
      },
      nameCell: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 },
      chevron: {
        flex: '0 0 auto', width: '16px', height: '16px', display: 'grid', placeItems: 'center',
        borderRadius: '4px', cursor: 'pointer', fontSize: '10px', lineHeight: 1,
        color: 'var(--dsw-alias-label-secondary)', background: 'transparent', border: 0
      },
      zhName: {
        fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', minWidth: 0
      },
      badge: { fontSize: '10.5px', fontWeight: 400, color: 'var(--dsw-alias-label-secondary)', marginLeft: '4px' },
      enName: {
        fontSize: '11.5px', fontFamily: MONO, whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', color: 'var(--dsw-alias-label-secondary)', minWidth: 0
      },
      desc: {
        fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        color: 'var(--dsw-alias-label-secondary)', minWidth: 0
      },
      usage: {
        fontSize: '11.5px', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums'
      },
      dirCell: {
        fontSize: '10.5px', fontFamily: MONO, color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
      },
      providerCell: {
        fontSize: '11px', color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
      },
      headerCell: {
        position: 'relative', display: 'flex', alignItems: 'center', gap: '4px',
        minWidth: 0, height: '100%', userSelect: 'none'
      },
      headerReset: {
        padding: 0, border: 0, background: 'transparent', cursor: 'pointer',
        color: 'var(--dsw-alias-brand-primary)', fontSize: '10.5px', fontFamily: 'inherit'
      },
      resizeHandle: function (active) {
        return {
          position: 'absolute', right: '-6px', top: 0, bottom: 0, width: '10px',
          cursor: 'col-resize', zIndex: 2,
          background: active ? 'var(--dsw-alias-brand-primary)' : 'transparent',
          opacity: active ? 0.35 : 1
        };
      },
      tag: function (market) {
        return {
          justifySelf: 'start', fontSize: '10.5px', lineHeight: 1, padding: '4px 7px',
          borderRadius: '999px', whiteSpace: 'nowrap',
          color: market ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)',
          background: 'var(--dsw-alias-bg-layer-2)',
          border: '1px solid var(--dsw-alias-border-l1)'
        };
      },
      actions: { display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' },
      actBtn: {
        fontSize: '11px', padding: '3px 8px', cursor: 'pointer', borderRadius: '999px',
        fontFamily: 'inherit', color: 'var(--dsw-alias-brand-primary)',
        background: 'transparent', border: '1px solid var(--dsw-alias-brand-primary)'
      },
      actIcon: {
        fontSize: '11px', width: '22px', height: '22px', display: 'grid', placeItems: 'center',
        cursor: 'pointer', borderRadius: '999px', fontFamily: 'inherit',
        color: 'var(--dsw-alias-label-secondary)', background: 'transparent',
        border: '1px solid var(--dsw-alias-border-l1)'
      },
      expanded: {
        padding: '10px 14px 12px 34px', borderBottom: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-base)', display: 'flex', flexDirection: 'column', gap: '6px',
        fontSize: '12px', color: 'var(--dsw-alias-label-secondary)'
      },
      kv: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
      kvKey: { flex: '0 0 64px', color: 'var(--dsw-alias-label-secondary)', fontSize: '11px', paddingTop: '1px' },
      kvVal: { flex: '1 1 auto', minWidth: 0, color: 'var(--dsw-alias-label-primary)', wordBreak: 'break-word' },
      monoVal: { flex: '1 1 auto', minWidth: 0, fontFamily: MONO, fontSize: '11.5px', wordBreak: 'break-all' },
      footer: {
        display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto',
        padding: '8px 14px', borderTop: '1px solid var(--dsw-alias-border-l1)',
        fontSize: '11.5px', color: 'var(--dsw-alias-label-secondary)', minHeight: '38px'
      },
      pager: { display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' },
      pageBtn: function (active) {
        return {
          minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '6px',
          fontSize: '11.5px', cursor: 'pointer', fontFamily: 'inherit',
          color: active ? '#fff' : 'var(--dsw-alias-label-primary)',
          background: active ? 'var(--dsw-alias-brand-primary)' : 'transparent',
          border: '1px solid ' + (active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l1)')
        };
      },
      linkBtn: {
        padding: 0, border: 0, background: 'transparent', cursor: 'pointer',
        color: 'var(--dsw-alias-brand-primary)', fontFamily: 'inherit', fontSize: 'inherit'
      },
      dangerLink: {
        padding: 0, border: 0, background: 'transparent', cursor: 'pointer',
        color: 'var(--dsw-alias-state-error-primary)', fontFamily: 'inherit', fontSize: '12px',
        whiteSpace: 'nowrap'
      },
      batchToggle: {
        flex: '0 0 auto', height: '32px', padding: '0 10px', borderRadius: '9px',
        fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        color: 'var(--dsw-alias-state-error-primary)', background: 'transparent',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        display: 'flex', alignItems: 'center', gap: '6px'
      },
      batchToggleOn: {
        flex: '0 0 auto', height: '32px', padding: '0 10px', borderRadius: '9px',
        fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        color: '#fff', background: 'var(--dsw-alias-state-error-primary)',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        display: 'flex', alignItems: 'center', gap: '6px'
      },
      checkbox: {
        flex: '0 0 auto', width: '14px', height: '14px', margin: '0 2px 0 0',
        accentColor: 'var(--dsw-alias-brand-primary)', cursor: 'pointer'
      },
      batchBar: {
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        padding: '8px 14px', borderTop: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-base)', fontSize: '11.5px',
        color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto'
      },
      modalList: {
        maxHeight: '190px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: '6px', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '8px',
        padding: '8px'
      },
      modalItem: {
        display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px',
        color: 'var(--dsw-alias-label-secondary)'
      },
      modalItemName: { fontSize: '12.5px', color: 'var(--dsw-alias-label-primary)', fontWeight: 600 },
      modalItemPath: { fontFamily: MONO, fontSize: '11px', wordBreak: 'break-all' },
      warn: {
        fontSize: '12px', lineHeight: 1.55, padding: '8px 10px', borderRadius: '8px',
        color: 'var(--dsw-alias-state-error-primary)',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-state-error-primary)'
      },
      resultLine: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' },
      state: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '8px', padding: '44px 24px', textAlign: 'center', flex: '1 1 auto'
      },
      stateTitle: { fontSize: '13px', fontWeight: 600 },
      stateBody: { fontSize: '12.5px', lineHeight: 1.6, maxWidth: '380px', color: 'var(--dsw-alias-label-secondary)' },
      button: {
        marginTop: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '12.5px',
        cursor: 'pointer', fontFamily: 'inherit', color: 'var(--dsw-alias-label-primary)',
        background: 'transparent', border: '1px solid var(--dsw-alias-border-l2)'
      },
      primary: {
        marginTop: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '12.5px',
        cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
        background: 'var(--dsw-alias-brand-primary)', border: '1px solid var(--dsw-alias-brand-primary)'
      },
      scrim: {
        position: 'absolute', inset: 0, background: 'rgba(16,24,40,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, borderRadius: '12px'
      },
      modal: {
        width: '420px', maxWidth: 'calc(100% - 40px)', boxSizing: 'border-box',
        background: 'var(--dsw-alias-bg-overlay)', color: 'var(--dsw-alias-label-primary)',
        border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px',
        boxShadow: '0 18px 48px rgba(16,24,40,0.24)', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: '10px'
      },
      modalTitle: { fontSize: '13.5px', fontWeight: 600 },
      modalBody: { fontSize: '12.5px', lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary)' },
      field: { display: 'flex', flexDirection: 'column', gap: '4px' },
      fieldLabel: { fontSize: '11.5px', color: 'var(--dsw-alias-label-secondary)' },
      fieldInput: {
        height: '32px', padding: '0 10px', borderRadius: '8px', fontFamily: 'inherit',
        fontSize: '12.5px', color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)'
      },
      modalRow: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '2px' },
      ghostBtn: {
        padding: '5px 10px', borderRadius: '8px', fontSize: '12.5px', cursor: 'pointer',
        fontFamily: 'inherit', color: 'var(--dsw-alias-label-secondary)',
        background: 'transparent', border: '1px solid var(--dsw-alias-border-l1)',
        whiteSpace: 'nowrap'
      },
      toast: function (ok) {
        return {
          position: 'absolute', right: '18px', bottom: '14px', maxWidth: '72%', zIndex: 6,
          display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px',
          fontSize: '12px', borderRadius: '9px', color: 'var(--dsw-alias-label-primary)',
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

    // -------------------------------------------------------------- host bridge
    const HOST_ROUTE = '/__dsh-skills-cn';
    const HOST_HEADERS = { 'content-type': 'application/json', 'x-dsh-skills-cn': 'delete' };

    async function hostCall(path, body) {
      let response;
      try {
        response = await fetch(HOST_ROUTE + path, {
          method: 'POST',
          headers: HOST_HEADERS,
          body: JSON.stringify(body || {})
        });
      } catch (error) {
        return { ok: false, reason: 'network' };
      }
      let data = null;
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }
      if (!response.ok || !data || data.ok === false) {
        return { ok: false, reason: (data && (data.reason || data.aborted)) || ('http-' + response.status) };
      }
      return data;
    }

    /** Which allowed root owns this skill path, or null when it is not deletable here. */
    function ownerRoot(roots, target) {
      if (!Array.isArray(roots) || !target) return null;
      const normalized = String(target).toLowerCase().replace(/\\/g, '/');
      for (let i = 0; i < roots.length; i++) {
        const dir = String(roots[i].dir || '').toLowerCase().replace(/\\/g, '/').replace(/\/+$/, '');
        if (dir && normalized.indexOf(dir + '/') === 0) return roots[i];
      }
      return null;
    }

    function formatBytes(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ------------------------------------------------------------------ panel
    function Panel(props) {
      const t = props.t;
      const sessionId = props.sessionId;
      const inputActions = props.inputActions;
      const ctx = props.ctx;
      const getSessions = props.getSessions;

      const [rows, setRows] = useState(null);
      const [failure, setFailure] = useState(null);
      const [query, setQuery] = useState('');
      const [group, setGroup] = useState('all');
      const [sort, setSort] = useState('usage');
      const [page, setPage] = useState(1);
      const [selected, setSelected] = useState('');
      const [expanded, setExpanded] = useState('');
      const [hover, setHover] = useState('');
      const [toast, setToast] = useState(null);
      const [attempt, setAttempt] = useState(0);
      const [editing, setEditing] = useState(null);
      const [confirmReset, setConfirmReset] = useState(false);
      const [cache, setCache] = useState({});
      const [usage, setUsage] = useState({});
      const [narrow, setNarrow] = useState(false);
      const [cardMax, setCardMax] = useState(0);
      const [batch, setBatch] = useState(false);
      const [picked, setPicked] = useState([]);
      const [roots, setRoots] = useState(null);
      const [deleteState, setDeleteState] = useState(null);
      const [trash, setTrash] = useState([]);
      const [trashOpen, setTrashOpen] = useState(false);
      const [trashBusy, setTrashBusy] = useState(false);
      const [trashConfirmAll, setTrashConfirmAll] = useState(false);
      const [widths, setWidths] = useState(DEFAULT_WIDTHS);
      const widthsRef = useRef(DEFAULT_WIDTHS);
      const [resizing, setResizing] = useState(false);

      const inputRef = useRef(null);
      const cardRef = useRef(null);
      const rootRef = useRef(null);
      const toastTimer = useRef(0);
      const lastInsert = useRef(null);

      // Restore the persisted Chinese overrides, usage counters and view state.
      useEffect(function () {
        const storedCache = loadStore(STORE.cache, {});
        const storedUsage = loadStore(STORE.usage, {});
        const storedUi = loadStore(STORE.ui, {});
        setCache(storedCache.entries || {});
        setUsage(storedUsage.entries || {});
        if (GROUPS.indexOf(storedUi.group) >= 0) setGroup(storedUi.group);
        if (SORTS.indexOf(storedUi.sort) >= 0) setSort(storedUi.sort);
        if (typeof storedUi.page === 'number' && storedUi.page >= 1) setPage(storedUi.page);
        if (Array.isArray(storedUi.widths) && storedUi.widths.length === COLUMNS.length
          && storedUi.widthsVersion === WIDTHS_VERSION) {
          const next = storedUi.widths.map(function (width, index) {
            const value = Number(width);
            return Number.isFinite(value)
              ? Math.max(COLUMNS[index].min, Math.round(value))
              : COLUMNS[index].def;
          });
          setWidths(next);
          widthsRef.current = next;
        }
      }, []);

      // Measure the room the view really has and the width that decides the layout.
      useEffect(function () {
        const measure = function () {
          const el = cardRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.top) {
            const room = window.innerHeight - rect.top - 176;
            setCardMax(Math.max(240, Math.min(room, Math.round(window.innerHeight * 0.78))));
          }
          if (rect.width) setNarrow(rect.width < 640);
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

      useEffect(function () {
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
            // Enrich with the Host registry's source/provider/resourceBase, which
            // the session-scoped Remote does not expose.
            try {
              const rich = await hostCall('/catalog', { sessionId: sessionId });
              if (rich && rich.ok && Array.isArray(rich.items)) {
                const byName = {};
                for (let i = 0; i < rich.items.length; i++) byName[rich.items[i].name] = rich.items[i];
                for (let i = 0; i < next.length; i++) {
                  const meta = byName[next[i].name];
                  if (!meta) continue;
                  if (typeof meta.provider === 'string' && meta.provider) next[i].provider = meta.provider;
                  if (typeof meta.source === 'string' && meta.source) next[i].source = meta.source;
                  const base = meta.resourceBase;
                  if (base && base.kind === 'directory' && base.path) next[i].dir = base.path;
                  else if (typeof meta.path === 'string' && meta.path) next[i].dir = dirOf(meta.path);
                  next[i].group = groupFor(next[i].source, meta.path || next[i].path);
                }
              }
            } catch (error) { /* the rich catalog is optional */ }
            if (!alive) return;
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

      const flash = function (message, ok) {
        setToast({ message: message, ok: ok });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(function () { setToast(null); }, 2400);
      };

      // Know which roots the host will delete inside, so rows can be enabled per row.
      useEffect(function () {
        let alive = true;
        hostCall('/roots', {}).then(function (data) {
          if (!alive) return;
          setRoots(Array.isArray(data.roots) ? data.roots : []);
        }).catch(function () {
          if (alive) setRoots([]);
        });
        return function () { alive = false; };
      }, []);

      const rowDeletable = function (row) {
        return ownerRoot(roots, row && row.path) !== null;
      };

      const refreshTrash = function () {
        hostCall('/trash-list', {}).then(function (data) {
          setTrash(Array.isArray(data.items) ? data.items : []);
        }).catch(function () {
          setTrash([]);
        });
      };

      useEffect(function () {
        refreshTrash();
      }, []);

      const restoreTrash = async function (id) {
        if (trashBusy) return;
        setTrashBusy(true);
        const result = await hostCall('/trash-restore', { ids: [id] });
        setTrashBusy(false);
        if (result.ok === false) {
          flash(result.aborted === 'lock-unreadable' ? t('reasonLockUnreadable') : t('trashFailed'), false);
          return;
        }
        const rows = result.results || [];
        const done = rows.filter(function (item) { return item.ok; });
        const failed = rows.filter(function (item) { return !item.ok; });
        if (failed.length > 0) {
          const first = failed[0];
          const reason = first.reason === 'target-exists' ? t('reasonTargetExists')
            : first.reason === 'lock-write-failed' ? t('reasonLockWrite')
              : first.reason === 'not-found' ? t('reasonEntryGone')
                : String(first.reason || '');
          flash(t('trashFailed') + '：' + (first.name || '') + ' · ' + reason, false);
        } else {
          const lockWritten = done.some(function (item) { return item.lockRestored; });
          flash(lockWritten ? t('trashRestoredLock', { n: done.length }) : t('trashRestored', { n: done.length }), true);
        }
        refreshTrash();
        setAttempt(attempt + 1);
      };

      const purgeTrashEntry = async function (id) {
        if (trashBusy) return;
        setTrashBusy(true);
        const result = await hostCall('/trash-purge', { ids: [id] });
        setTrashBusy(false);
        if (result.ok === false) {
          flash(t('trashFailed'), false);
          return;
        }
        flash(t('trashPurged', { n: 1 }), true);
        refreshTrash();
      };

      const purgeAllTrash = async function () {
        if (trashBusy || trash.length === 0) return;
        setTrashBusy(true);
        const result = await hostCall('/trash-purge', {
          ids: trash.map(function (item) { return item.id; })
        });
        setTrashBusy(false);
        setTrashConfirmAll(false);
        if (result.ok === false) {
          flash(t('trashFailed'), false);
          return;
        }
        flash(t('trashPurged', { n: trash.length }), true);
        refreshTrash();
      };

      const toggleBatch = function () {
        if (!batch && Array.isArray(roots) && roots.length === 0) {
          flash(t('deleteUnavailable'), false);
          return;
        }
        setBatch(!batch);
        setPicked([]);
        setExpanded('');
      };

      const togglePick = function (row) {
        if (!rowDeletable(row)) {
          flash(t('notDeletable'), false);
          return;
        }
        setPicked(function (previous) {
          if (previous.indexOf(row.name) >= 0) {
            return previous.filter(function (name) { return name !== row.name; });
          }
          return previous.concat([row.name]);
        });
      };

      const selectDeletableOnPage = function () {
        const names = paged.filter(rowDeletable).map(function (row) { return row.name; });
        setPicked(function (previous) {
          const next = previous.slice();
          for (let i = 0; i < names.length; i++) {
            if (next.indexOf(names[i]) < 0) next.push(names[i]);
          }
          return next;
        });
      };

      const openDelete = async function () {
        if (picked.length === 0) {
          flash(t('deleteNoSelection'), false);
          return;
        }
        setDeleteState({ items: null, lock: null, text: '', busy: true, error: null, results: null, mode: 'trash' });
        const result = await hostCall('/preview', { names: picked });
        if (result.ok === false) {
          setDeleteState({
            items: null, lock: null, text: '', busy: false, results: null, mode: 'trash',
            error: result.reason === 'network' ? 'network' : result.reason
          });
          return;
        }
        setDeleteState({
          items: result.items || [], lock: result.lock || null,
          text: '', busy: false, error: null, results: null, mode: 'trash'
        });
      };

      const closeDelete = function () {
        setDeleteState(null);
      };

      const runDelete = async function () {
        const state = deleteState;
        if (!state || !state.items || state.busy) return;
        const allowed = state.items.filter(function (item) { return item.allowed; }).map(function (item) { return item.name; });
        if (allowed.length === 0) return;
        setDeleteState(Object.assign({}, state, { busy: true, error: null }));
        const mode = state.mode === 'purge' ? 'purge' : 'trash';
        const result = await hostCall('/delete', { names: allowed, confirm: 'DELETE', mode: mode });
        if (result.ok === false) {
          setDeleteState(Object.assign({}, state, {
            busy: false,
            error: result.reason === 'network' ? 'network' : result.reason,
            results: result.results || null
          }));
          return;
        }

        // Clean the local caches of the names that are really gone.
        const removedNames = (result.results || [])
          .filter(function (item) { return item.ok; })
          .map(function (item) { return item.name; });
        if (removedNames.length > 0) {
          const nextCache = Object.assign({}, cache);
          const nextUsage = Object.assign({}, usage);
          for (let i = 0; i < removedNames.length; i++) {
            delete nextCache[removedNames[i]];
            delete nextUsage[removedNames[i]];
          }
          persistCache(nextCache);
          persistUsage(nextUsage);
          setSelected(function (current) { return removedNames.indexOf(current) >= 0 ? '' : current; });
        }

        const failed = (result.results || []).filter(function (item) { return !item.ok; }).length;
        const lockCount = (result.lockRemoved || []).length;
        const trashedCount = (result.trashed || []).length;
        let message = mode === 'trash'
          ? t('trashedOk', { n: trashedCount })
          : t('deletedOk', { n: removedNames.length });
        if (lockCount > 0) {
          message += mode === 'trash'
            ? t('trashedLockPart', { m: lockCount })
            : t('deletedLockPart', { m: lockCount });
        }
        if (failed > 0) message += t('deletedFailPart', { k: failed });
        flash(message, failed === 0);

        setBatch(false);
        setPicked([]);
        setDeleteState(null);
        refreshTrash();
        setAttempt(attempt + 1);
      };

      const deleteWord = t('deleteTypeWord');
      const deleteReady = !!deleteState
        && !deleteState.busy
        && !!deleteState.items
        && deleteState.text.trim() === deleteWord
        && deleteState.items.some(function (item) { return item.allowed; });

      const persistCache = function (next) {
        setCache(next);
        saveStore(STORE.cache, { version: 1, entries: next });
      };
      const persistUsage = function (next) {
        setUsage(next);
        saveStore(STORE.usage, { version: 1, entries: next });
      };
      const persistUi = function (patch) {
        saveStore(STORE.ui, {
          version: 1,
          group: patch.group !== undefined ? patch.group : group,
          sort: patch.sort !== undefined ? patch.sort : sort,
          page: patch.page !== undefined ? patch.page : page,
          widths: patch.widths !== undefined ? patch.widths : widthsRef.current,
          widthsVersion: WIDTHS_VERSION
        });
      };

      /** Drag one column's right edge; widths are clamped to the column minimum. */
      const startResize = function (index, event) {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = widthsRef.current[index];
        setResizing(true);
        const onMove = function (moveEvent) {
          const next = widthsRef.current.slice();
          next[index] = Math.max(COLUMNS[index].min, Math.round(startWidth + (moveEvent.clientX - startX)));
          widthsRef.current = next;
          setWidths(next);
        };
        const onUp = function () {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          setResizing(false);
          persistUi({ widths: widthsRef.current });
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };

      const resetWidths = function () {
        widthsRef.current = DEFAULT_WIDTHS;
        setWidths(DEFAULT_WIDTHS);
        persistUi({ widths: DEFAULT_WIDTHS });
      };

      // Merge the bundled dictionary with the user's manual overrides and usage.
      const decorated = useMemo(function () {
        if (!rows) return [];
        return rows.map(function (row) {
          const manual = cache[row.name] || null;
          return Object.assign({}, row, {
            zhName: (manual && manual.zhName) || row.dictName || '',
            zhDesc: (manual && manual.zhDesc) || row.dictDesc || '',
            manual: !!manual,
            count: usage[row.name] ? usage[row.name].count || 0 : 0,
            lastAt: usage[row.name] ? usage[row.name].lastAt || 0 : 0
          });
        });
      }, [rows, cache, usage]);

      const counts = useMemo(function () {
        const total = { all: decorated.length, user: 0, bundled: 0, runtime: 0, other: 0 };
        for (let i = 0; i < decorated.length; i++) {
          const group = decorated[i].group || 'other';
          total[group] = (total[group] || 0) + 1;
        }
        return total;
      }, [decorated]);

      const filtered = useMemo(function () {
        const q = query.trim().toLowerCase();
        return decorated.filter(function (row) {
          if (group !== 'all' && (row.group || 'other') !== group) return false;
          if (!q) return true;
          return (row.zhName && row.zhName.toLowerCase().indexOf(q) >= 0)
            || (row.zhDesc && row.zhDesc.toLowerCase().indexOf(q) >= 0)
            || row.name.toLowerCase().indexOf(q) >= 0
            || (row.description && row.description.toLowerCase().indexOf(q) >= 0);
        });
      }, [decorated, group, query]);

      const sorted = useMemo(function () {
        const list = filtered.slice();
        if (sort === 'name') {
          list.sort(function (a, b) { return a.name.localeCompare(b.name); });
        } else if (sort === 'source') {
          const order = { user: 0, bundled: 1, runtime: 2, other: 3 };
          const rank = function (row) {
            return order[row.group] === undefined ? 3 : order[row.group];
          };
          list.sort(function (a, b) {
            const byGroup = rank(a) - rank(b);
            return byGroup !== 0 ? byGroup : a.name.localeCompare(b.name);
          });
        } else {
          list.sort(function (a, b) {
            if (b.count !== a.count) return b.count - a.count;
            if (b.lastAt !== a.lastAt) return b.lastAt - a.lastAt;
            return a.name.localeCompare(b.name);
          });
        }
        return list;
      }, [filtered, sort]);

      const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
      const currentPage = Math.min(Math.max(1, page), pageCount);
      const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
      const selectedRow = decorated.find(function (row) { return row.name === selected; }) || null;

      useEffect(function () {
        if (page !== currentPage) setPage(currentPage);
      }, [page, currentPage]);

      const goPage = function (next) {
        const value = Math.min(Math.max(1, next), pageCount);
        setPage(value);
        persistUi({ page: value });
      };

      const changeGroup = function (value) {
        setGroup(value);
        setPage(1);
        persistUi({ group: value, page: 1 });
      };

      const changeSort = function (value) {
        setSort(value);
        setPage(1);
        persistUi({ sort: value, page: 1 });
      };

      const changeQuery = function (value) {
        setQuery(value);
        setPage(1);
      };

      const recordUsage = function (name) {
        const previous = usage[name] || { count: 0, lastAt: 0 };
        const next = Object.assign({}, usage);
        next[name] = { count: (previous.count || 0) + 1, lastAt: Date.now() };
        persistUsage(next);
      };

      const doInsert = function (row) {
        if (!row) return;
        const now = Date.now();
        // Nothing changed in the draft since the last insert of the same row: skip,
        // so a double gesture never writes the same command twice.
        const last = lastInsert.current;
        if (last && last.name === row.name && now - last.at < 600) return;
        if (last && last.name === row.name && inputActions
          && typeof inputActions.captureInsertion === 'function') {
          try {
            const span = inputActions.captureInsertion();
            if (span && last.rev !== undefined && span.draftRev === last.rev) return;
          } catch (error) { /* fall through to a normal insert */ }
        }
        const result = insertCommand(inputActions, row.name);
        const cmd = '/' + row.name;
        if (result.how === 'composer') {
          lastInsert.current = { name: row.name, at: now, rev: result.rev };
          recordUsage(row.name);
          flash(t('inserted', { cmd: cmd }), true);
        } else if (result.how === 'clipboard') {
          lastInsert.current = { name: row.name, at: now };
          recordUsage(row.name);
          flash(t('insertedClipboard', { cmd: cmd }), true);
        } else {
          flash(t('insertFailed'), false);
        }
      };

      const saveEdit = function () {
        if (!editing) return;
        const next = Object.assign({}, cache);
        const zhName = (editing.zhName || '').trim();
        const zhDesc = (editing.zhDesc || '').trim();
        if (!zhName && !zhDesc) delete next[editing.name];
        else {
          next[editing.name] = {
            zhName: zhName, zhDesc: zhDesc, origin: 'manual', updatedAt: Date.now()
          };
        }
        persistCache(next);
        setEditing(null);
        flash(t('saved'), true);
      };

      const restoreEdit = function () {
        if (!editing) return;
        const next = Object.assign({}, cache);
        delete next[editing.name];
        persistCache(next);
        setEditing(null);
        flash(t('restored'), true);
      };

      const clearUsage = function () {
        persistUsage({});
        setConfirmReset(false);
        flash(t('resetDone'), true);
      };

      const onKeyDown = function (event) {
        if (!paged.length) return;
        const index = paged.findIndex(function (row) { return row.name === selected; });
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelected(paged[Math.min(index + 1, paged.length - 1)].name);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelected(paged[Math.max(index - 1, 0)].name);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          // Nothing selected yet: select the first row instead of writing a command
          // the user never chose (empty-selection guard).
          if (index < 0) setSelected(paged[0].name);
          else doInsert(paged[index]);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          changeQuery('');
        }
      };

      // ------------------------------------------------------------- render
      const groupLabel = function (key) {
        if (key === 'user') return t('groupUser');
        if (key === 'bundled') return t('groupBundled');
        if (key === 'runtime') return t('groupRuntime');
        if (key === 'other') return t('groupOther');
        return t('groupAll');
      };

      const groupList = narrow ? null : h('div', { style: S.groups },
        h('div', { style: S.groupTitle }, t('filterSource')),
        GROUPS.map(function (key) {
          return h('button', {
            key: key,
            type: 'button',
            style: S.groupItem(group === key),
            onClick: function () { changeGroup(key); }
          },
            h('span', { style: S.groupLabel }, groupLabel(key)),
            h('span', { style: S.groupCount }, counts[key] || 0)
          );
        })
      );

      const toolbar = h('div', { style: S.toolbar },
        h('div', { style: S.searchWrap },
          h('svg', {
            width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true,
            style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-secondary)' }
          }, h('circle', { cx: 7, cy: 7, r: 4.3 }), h('path', { d: 'M10.4 10.4L14 14' })),
          h('input', {
            ref: inputRef, style: S.input, value: query, spellCheck: false,
            placeholder: t('search'), 'aria-label': t('search'), title: t('hint'),
            onChange: function (event) { changeQuery(event.target.value); }
          })
        ),
        h('select', {
          style: S.select, value: group, 'aria-label': t('filterSource'),
          onChange: function (event) { changeGroup(event.target.value); }
        }, GROUPS.map(function (key) {
          return h('option', { key: key, value: key }, groupLabel(key) + ' (' + (counts[key] || 0) + ')');
        })),
        h('select', {
          style: S.select, value: sort, 'aria-label': t('sortLabel'),
          onChange: function (event) { changeSort(event.target.value); }
        },
          h('option', { value: 'usage' }, t('sortUsage')),
          h('option', { value: 'name' }, t('sortName')),
          h('option', { value: 'source' }, t('sortSource'))
        ),
        h('button', {
          type: 'button', style: S.iconBtn, title: t('refresh'),
          onClick: function () { setAttempt(attempt + 1); }
        },
          h('svg', {
            width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.6, strokeLinecap: 'round'
          }, h('path', { d: 'M13 8a5 5 0 1 1-1.6-3.7' }), h('path', { d: 'M13 2.5V5h-2.5' })),
          t('refresh')
        ),
        h('button', {
          type: 'button',
          style: batch ? S.batchToggleOn : S.batchToggle,
          title: t('batchTip'),
          'aria-pressed': batch,
          onClick: toggleBatch
        },
          h('svg', {
            width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.6, strokeLinecap: 'round'
          },
            h('path', { d: 'M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.6 8.2h5.8l.6-8.2' }),
            h('path', { d: 'M6.6 7v3.4M9.4 7v3.4' })
          ),
          batch ? t('exitBatch') : t('batch')
        ),
        h('button', {
          type: 'button', style: S.iconBtn, title: t('trash'),
          onClick: function () { setTrashOpen(true); refreshTrash(); }
        },
          h('svg', {
            width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.6, strokeLinecap: 'round'
          },
            h('path', { d: 'M2.5 4.5h11l-.9 8.2a1 1 0 0 1-1 .8H4.4a1 1 0 0 1-1-.8z' }),
            h('path', { d: 'M6.2 2.6h3.6M6.6 7v4M9.4 7v4' })
          ),
          t('trash') + (trash.length ? ' (' + trash.length + ')' : '')
        )
      );

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
      } else if (!decorated.length) {
        body = h('div', { style: S.state },
          h('div', { style: S.stateTitle }, t('emptyNone')),
          h('div', { style: S.stateBody }, t('emptyNoneBody'))
        );
      } else if (!sorted.length) {
        body = h('div', { style: S.state },
          h('div', { style: S.stateTitle }, t('emptySearch')),
          h('div', { style: S.stateBody }, t('emptySearchBody')),
          h('button', {
            type: 'button', style: S.button,
            onClick: function () { changeQuery(''); changeGroup('all'); }
          }, t('clear'))
        );
      } else {
        const gridTemplate = narrow
          ? NARROW_COLS
          : widths.map(function (width, index) {
              return COLUMNS[index].flex ? 'minmax(' + width + 'px,1fr)' : width + 'px';
            }).join(' ');
        const totalWidth = widths.reduce(function (sum, width) { return sum + width; }, 0)
          + 10 * (widths.length - 1) + 20;
        const items = [];
        paged.forEach(function (row) {
          const isSelected = row.name === selected;
          const isHover = row.name === hover;
          const isOpen = row.name === expanded;
          const deletable = rowDeletable(row);
          const isPicked = picked.indexOf(row.name) >= 0;
          const checkbox = h('input', {
            type: 'checkbox',
            style: S.checkbox,
            checked: isPicked,
            disabled: !deletable,
            title: deletable ? row.name : t('notDeletable'),
            'aria-label': row.name,
            onClick: function (event) { event.stopPropagation(); },
            onChange: function () { togglePick(row); }
          });
          const cells = [];
          cells.push(isSelected ? h('span', { key: 'a', style: S.accent }) : null);

          if (narrow) {
            cells.push(h('div', { key: 'n', style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
              h('div', { style: S.zhName },
                batch ? checkbox : null,
                row.zhName || row.name,
                row.zhName ? null : h('span', { style: S.badge }, t('untranslated'))
              ),
              h('div', { style: S.enName }, row.name),
              h('div', { style: S.desc }, row.zhDesc || row.description || t('noDesc'))
            ));
          } else {
            cells.push(h('div', { key: 'n', style: S.nameCell },
              batch ? checkbox : h('button', {
                type: 'button', style: S.chevron, title: isOpen ? t('less') : t('more'),
                'aria-expanded': isOpen, 'aria-label': isOpen ? t('less') : t('more'),
                onClick: function (event) { event.stopPropagation(); setExpanded(isOpen ? '' : row.name); }
              }, h('svg', {
                width: 8, height: 8, viewBox: '0 0 8 8', fill: 'none',
                stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round'
              }, h('path', { d: isOpen ? 'M1 3l3 3 3-3' : 'M3 1l3 3-3 3' }))),
              h('span', { style: S.zhName }, row.zhName || row.name),
              row.zhName ? null : h('span', { style: S.badge }, t('untranslated'))
            ));
            cells.push(h('div', { key: 'e', style: S.enName }, row.name));
            cells.push(h('div', { key: 'd', style: S.desc }, row.zhDesc || row.description || t('noDesc')));
            cells.push(h('div', {
              key: 'dir',
              style: S.dirCell,
              title: row.dir || t('noDir')
            }, row.dir ? prettyDir(row.dir, roots) : t('noDir')));
            cells.push((isHover || isSelected) && !batch
              ? h('div', { key: 'p', style: S.actions },
                  h('button', {
                    type: 'button', style: S.actBtn, title: '/' + row.name,
                    onClick: function (event) { event.stopPropagation(); setSelected(row.name); doInsert(row); }
                  }, t('insert')),
                  h('button', {
                    type: 'button', style: S.actIcon, title: t('edit'),
                    onClick: function (event) {
                      event.stopPropagation();
                      setEditing({ name: row.name, zhName: row.zhName, zhDesc: row.zhDesc, manual: row.manual });
                    }
                  }, '✎')
                )
              : h('span', {
                  key: 'p',
                  style: S.providerCell,
                  title: [row.provider, row.source].filter(Boolean).join(' · ')
                }, row.provider || row.source || t('noProvider')));
            cells.push(h('div', {
              key: 'u', style: S.usage,
              title: row.lastAt ? t('lastAt', { time: relTime(row.lastAt) }) : t('neverUsed')
            }, row.count ? t('usedN', { n: row.count }) : t('neverUsed')));
          }

          if (narrow) {
            cells.push(batch
              ? h('span', {
                  key: 'x',
                  style: S.tag(deletable === false),
                  title: deletable ? undefined : t('notDeletable')
                }, t('batch'))
              : (isHover || isSelected)
                ? h('div', { key: 'x', style: S.actions },
                    h('button', {
                      type: 'button', style: S.actBtn, title: '/' + row.name,
                      onClick: function (event) { event.stopPropagation(); setSelected(row.name); doInsert(row); }
                    }, t('insert')),
                    h('button', {
                      type: 'button', style: S.actIcon, title: t('edit'),
                      onClick: function (event) {
                        event.stopPropagation();
                        setEditing({ name: row.name, zhName: row.zhName, zhDesc: row.zhDesc, manual: row.manual });
                      }
                    }, '✎')
                  )
                : h('span', { key: 'x', style: S.tag(false) }, row.provider || t('noProvider')));
          }

          items.push(h('div', {
            key: row.name,
            role: 'option',
            'aria-selected': batch ? isPicked : isSelected,
            style: S.row(batch ? isPicked : isSelected, isHover, narrow, gridTemplate),
            onMouseEnter: function () { setHover(row.name); },
            onMouseLeave: function () { setHover(''); },
            onClick: function () {
              if (batch) {
                togglePick(row);
                return;
              }
              setSelected(row.name);
              if (inputRef.current) inputRef.current.focus();
            },
            onDoubleClick: function () {
              if (batch) return;
              setSelected(row.name);
              doInsert(row);
            },
            title: batch && !deletable ? t('notDeletable') : (row.description || row.name)
          }, cells));

          if (isOpen) {
            items.push(h('div', { key: row.name + ':x', style: S.expanded },
              h('div', { style: S.kv },
                h('span', { style: S.kvKey }, t('colEn')),
                h('span', { style: S.monoVal }, row.name)
              ),
              h('div', { style: S.kv },
                h('span', { style: S.kvKey }, t('colDesc')),
                h('span', { style: S.kvVal }, row.description || t('noDesc'))
              ),
              row.whenToUse ? h('div', { style: S.kv },
                h('span', { style: S.kvKey }, t('whenToUse')),
                h('span', { style: S.kvVal }, row.whenToUse)
              ) : null,
              row.path ? h('div', { style: S.kv },
                h('span', { style: S.kvKey }, t('pathLabel')),
                h('span', { style: S.monoVal }, row.path)
              ) : null,
              h('div', { style: { display: 'flex', gap: '8px', marginTop: '2px' } },
                h('button', {
                  type: 'button', style: S.ghostBtn,
                  onClick: function (event) {
                    event.stopPropagation();
                    setEditing({ name: row.name, zhName: row.zhName, zhDesc: row.zhDesc, manual: row.manual });
                  }
                }, t('edit'))
              )
            ));
          }
        });

        const headerCells = narrow
          ? [h('div', { key: 'h0' }, t('colName')), h('div', { key: 'h1' }, t('colProvider'))]
          : COLUMNS.map(function (column, index) {
              return h('div', { key: column.key, style: S.headerCell },
                h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t(column.label)),
                index === COLUMNS.length - 1
                  ? h('button', {
                      type: 'button', style: S.headerReset, title: t('resetWidths'),
                      onClick: function (event) { event.stopPropagation(); resetWidths(); }
                    }, '⟲')
                  : null,
                h('span', {
                  style: S.resizeHandle(resizing),
                  title: t('dragHint'),
                  onPointerDown: function (event) { startResize(index, event); }
                })
              );
            });

        body = h('div', { style: { display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' } },
          h('div', {
            style: {
              flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column',
              overflowX: narrow ? 'hidden' : 'auto', overflowY: 'hidden'
            }
          },
            h('div', {
              style: {
                minWidth: narrow ? 'auto' : totalWidth + 'px',
                flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column'
              }
            },
              h('div', { style: S.thead(narrow, gridTemplate) }, headerCells),
              h('div', { style: S.list, role: 'listbox', 'aria-label': t('title') }, items)
            )
          )
        );
      }

      const footer = batch
        ? h('div', { style: S.batchBar },
            h('span', null, t('pickedN', { n: picked.length })),
            h('span', null, '·'),
            h('span', null, t('pickedDeletable', { m: picked.filter(function (name) {
              const row = decorated.find(function (item) { return item.name === name; });
              return !!row && rowDeletable(row);
            }).length })),
            h('button', {
              type: 'button', style: S.linkBtn,
              onClick: selectDeletableOnPage
            }, t('selectPage')),
            picked.length
              ? h('button', { type: 'button', style: S.linkBtn, onClick: function () { setPicked([]); } }, t('clearPicked'))
              : null,
            h('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' } },
              h('button', {
                type: 'button', style: S.batchToggleOn,
                disabled: picked.length === 0,
                onClick: openDelete
              }, t('deleteSelected')),
              h('button', { type: 'button', style: S.ghostBtn, onClick: toggleBatch }, t('exitBatch'))
            )
          )
        : h('div', { style: S.footer },
        selectedRow
          ? h('span', null,
              t('selected', {
                name: selectedRow.zhName || selectedRow.name,
                id: selectedRow.name
              }),
              ' ',
              h('button', {
                type: 'button', style: S.linkBtn,
                onClick: function () { setSelected(''); }
              }, t('clearSelection'))
            )
          : h('span', null, t('readonly')),
        sorted.length
          ? h('span', { style: { marginLeft: '8px' } },
              h('button', {
                type: 'button', style: S.linkBtn,
                onClick: function () { setConfirmReset(true); }
              }, t('resetUsage'))
            )
          : null,
        h('div', { style: S.pager },
          sorted.length ? h('span', { style: { marginRight: '8px' } },
            t('pagerInfo', { n: sorted.length, page: currentPage, pages: pageCount })) : null,
          pageCount > 1 ? h('button', {
            type: 'button', style: S.pageBtn(false), disabled: currentPage <= 1,
            onClick: function () { goPage(currentPage - 1); }
          }, '‹') : null,
          pageCount > 1 ? (function () {
            const buttons = [];
            const windowStart = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
            const windowEnd = Math.min(pageCount, windowStart + 4);
            for (let p = windowStart; p <= windowEnd; p += 1) {
              buttons.push(h('button', {
                key: p, type: 'button', style: S.pageBtn(p === currentPage),
                onClick: (function (target) { return function () { goPage(target); }; })(p)
              }, p));
            }
            return buttons;
          })() : null,
          pageCount > 1 ? h('button', {
            type: 'button', style: S.pageBtn(false), disabled: currentPage >= pageCount,
            onClick: function () { goPage(currentPage + 1); }
          }, '›') : null
        )
      );

      const editModal = editing ? h('div', { style: S.scrim, onClick: function () { setEditing(null); } },
        h('div', { style: S.modal, onClick: function (event) { event.stopPropagation(); } },
          h('div', { style: S.modalTitle }, t('editTitle', { name: editing.name })),
          h('div', { style: S.field },
            h('span', { style: S.fieldLabel }, t('editName')),
            h('input', {
              style: S.fieldInput, value: editing.zhName || '',
              placeholder: t('editPlaceholderName'),
              onChange: function (event) { setEditing(Object.assign({}, editing, { zhName: event.target.value })); }
            })
          ),
          h('div', { style: S.field },
            h('span', { style: S.fieldLabel }, t('editDesc')),
            h('input', {
              style: S.fieldInput, value: editing.zhDesc || '',
              placeholder: t('editPlaceholderDesc'),
              onChange: function (event) { setEditing(Object.assign({}, editing, { zhDesc: event.target.value })); }
            })
          ),
          h('div', { style: S.modalRow },
            editing.manual ? h('button', { type: 'button', style: S.ghostBtn, onClick: restoreEdit }, t('restore')) : null,
            h('button', { type: 'button', style: S.ghostBtn, onClick: function () { setEditing(null); } }, t('cancel')),
            h('button', { type: 'button', style: S.primary, onClick: saveEdit }, t('save'))
          )
        )
      ) : null;

      const resetModal = confirmReset ? h('div', { style: S.scrim, onClick: function () { setConfirmReset(false); } },
        h('div', { style: S.modal, onClick: function (event) { event.stopPropagation(); } },
          h('div', { style: S.modalTitle }, t('resetTitle')),
          h('div', { style: S.modalBody }, t('resetBody')),
          h('div', { style: S.modalRow },
            h('button', { type: 'button', style: S.ghostBtn, onClick: function () { setConfirmReset(false); } }, t('cancel')),
            h('button', { type: 'button', style: S.primary, onClick: clearUsage }, t('resetOk'))
          )
        )
      ) : null;

      const deleteAllowed = deleteState && deleteState.items
        ? deleteState.items.filter(function (item) { return item.allowed; })
        : [];
      const deleteLocked = deleteAllowed.filter(function (item) { return item.lockRegistered; }).length;

      const deleteModal = deleteState ? h('div', { style: S.scrim, onClick: function () { if (!deleteState.busy) closeDelete(); } },
        h('div', { style: S.modal, onClick: function (event) { event.stopPropagation(); } },
          h('div', { style: S.modalTitle }, t('deleteTitle', { n: deleteAllowed.length || picked.length })),
          h('div', { style: S.modalBody },
            deleteState.mode === 'purge' ? t('deleteBody') : t('deleteBodyTrash')),
          deleteState.busy && !deleteState.items
            ? h('div', { style: S.resultLine }, t('loading'))
            : null,
          deleteState.error
            ? h('div', { style: S.warn },
                deleteState.error === 'network'
                  ? t('deleteUnavailable')
                  : deleteState.error === 'lock-unreadable'
                    ? t('reasonLockUnreadable')
                    : t('deletePreviewFailed'))
            : null,
          deleteState.items && deleteState.items.length > 0
            ? h('div', { style: S.modalList },
                deleteState.items.map(function (item) {
                  const failed = deleteState.results && deleteState.results.find(function (result) { return result.name === item.name; });
                  const reason = failed && failed.ok === false
                    ? (failed.reason === 'missing' ? t('reasonMissing')
                      : failed.reason === 'symlink' ? t('reasonSymlink')
                        : failed.reason === 'outside-root' ? t('reasonOutside')
                          : String(failed.reason))
                    : (!item.allowed
                      ? (item.reason === 'missing' ? t('reasonMissing') : t('reasonManaged'))
                      : null);
                  return h('div', { key: item.name, style: S.modalItem },
                    h('span', { style: S.modalItemName }, (item.allowed ? '' : '⛔ ') + item.name),
                    item.allowed
                      ? h('span', { style: S.modalItemPath }, item.dir)
                      : null,
                    h('span', null,
                      item.allowed
                        ? t('filesN', { n: item.files, size: formatBytes(item.bytes) }) + ' · '
                          + (item.lockRegistered ? t('lockRegistered') : t('lockNotRegistered'))
                        : reason),
                    reason && item.allowed ? h('span', { style: { color: 'var(--dsw-alias-state-error-primary)' } }, reason) : null
                  );
                })
              )
            : null,
          deleteState.items && deleteState.items.length > 0
            ? h('div', { style: S.resultLine },
                deleteLocked > 0 ? t('deleteLockNote', { n: deleteLocked }) : t('deleteNoLockNote', { n: deleteAllowed.length }))
            : null,
          deleteState.items && deleteState.items.length > 0
            ? h('label', {
                style: {
                  display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--dsw-alias-label-primary)'
                }
              },
                h('input', {
                  type: 'checkbox',
                  style: S.checkbox,
                  checked: deleteState.mode !== 'purge',
                  disabled: deleteState.busy,
                  onChange: function (event) {
                    setDeleteState(Object.assign({}, deleteState, { mode: event.target.checked ? 'trash' : 'purge' }));
                  }
                }),
                h('span', null, t('trashKeep'))
              )
            : null,
          deleteState.mode === 'purge'
            ? h('div', { style: S.warn }, t('trashHardWarn'))
            : null,
          deleteAllowed.length > 0
            ? h('div', { style: S.field },
                h('span', { style: S.fieldLabel }, t('deleteTypeHint', { word: deleteWord })),
                h('input', {
                  style: S.fieldInput,
                  value: deleteState.text,
                  autoFocus: true,
                  disabled: deleteState.busy,
                  placeholder: deleteWord,
                  onChange: function (event) {
                    setDeleteState(Object.assign({}, deleteState, { text: event.target.value }));
                  }
                })
              )
            : null,
          h('div', { style: S.modalRow },
            h('button', {
              type: 'button', style: S.ghostBtn,
              disabled: deleteState.busy,
              onClick: closeDelete
            }, t('deleteCancel')),
            h('button', {
              type: 'button',
              style: deleteReady ? S.primary : Object.assign({}, S.primary, { opacity: 0.45, cursor: 'not-allowed' }),
              disabled: !deleteReady,
              onClick: runDelete
            }, deleteState.busy ? t('deleting') : t('deleteGo'))
          )
        )
      ) : null;

      const trashModal = trashOpen ? h('div', {
        style: S.scrim,
        onClick: function () { setTrashOpen(false); setTrashConfirmAll(false); }
      },
        h('div', {
          style: Object.assign({}, S.modal, { width: '580px' }),
          onClick: function (event) { event.stopPropagation(); }
        },
          h('div', { style: S.modalTitle }, t('trashTitle', { n: trash.length })),
          trash.length === 0
            ? h('div', { style: S.stateBody }, t('trashEmpty'))
            : h('div', { style: S.modalList },
                trash.map(function (item) {
                  return h('div', {
                    key: item.id,
                    style: { display: 'flex', alignItems: 'center', gap: '8px' }
                  },
                    h('div', { style: { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
                      h('span', { style: S.modalItemName }, item.name),
                      h('span', { style: S.modalItemPath }, item.originalDir),
                      h('span', { style: S.resultLine },
                        t('filesN', { n: item.files, size: formatBytes(item.bytes) }) + ' · '
                          + t('trashAt', { time: relTime(item.trashedAt) }))
                    ),
                    h('button', {
                      type: 'button', style: S.ghostBtn,
                      disabled: trashBusy,
                      onClick: function () { restoreTrash(item.id); }
                    }, t('trashRestore')),
                    h('button', {
                      type: 'button', style: S.dangerLink,
                      disabled: trashBusy,
                      onClick: function () { purgeTrashEntry(item.id); }
                    }, t('trashPurge'))
                  );
                })
              ),
          trashConfirmAll ? h('div', { style: S.warn }, t('trashPurgeAllConfirm', { n: trash.length })) : null,
          h('div', { style: S.modalRow },
            trash.length > 0 && !trashConfirmAll
              ? h('button', {
                  type: 'button', style: S.ghostBtn,
                  onClick: function () { setTrashConfirmAll(true); }
                }, t('trashPurgeAll'))
              : null,
            trashConfirmAll
              ? h('button', {
                  type: 'button', style: S.ghostBtn,
                  onClick: function () { setTrashConfirmAll(false); }
                }, t('deleteCancel'))
              : null,
            trashConfirmAll
              ? h('button', {
                  type: 'button',
                  style: Object.assign({}, S.primary, { background: 'var(--dsw-alias-state-error-primary)', borderColor: 'var(--dsw-alias-state-error-primary)' }),
                  disabled: trashBusy,
                  onClick: purgeAllTrash
                }, t('trashPurgeAll'))
              : null,
            h('button', {
              type: 'button', style: S.ghostBtn,
              onClick: function () { setTrashOpen(false); setTrashConfirmAll(false); }
            }, t('deleteCancel'))
          )
        )
      ) : null;

      return h('div', { ref: rootRef, style: S.root, tabIndex: -1, onKeyDown: onKeyDown },
        h('div', { style: S.head },
          h('div', { 'aria-hidden': true, style: S.avatar }, '技'),
          h('div', { style: S.titles },
            h('h1', { style: S.h1 }, t('title')),
            narrow ? null : h('p', { style: S.sub }, t('subtitle'))
          ),
          decorated.length ? h('div', { style: S.countChip }, t('total', { n: decorated.length })) : null,
          narrow ? null : h('div', { style: S.chip }, t('readonly'))
        ),
        h('div', { ref: cardRef, style: Object.assign({}, S.card, cardMax ? { maxHeight: cardMax + 'px', minHeight: Math.min(cardMax, 320) + 'px' } : { maxHeight: '58vh' }) },
          groupList,
          h('div', { style: S.main },
            toolbar,
            body,
            footer
          )
        ),
        toast
          ? h('div', { style: S.toast(toast.ok) },
              h('span', {
                style: { color: toast.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)' }
              }, toast.ok ? '✓' : '!'),
              h('span', null, toast.message)
            )
          : null,
        editModal,
        resetModal,
        deleteModal,
        trashModal
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
