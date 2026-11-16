# dsh-skills-cn

[中文](README.md) | **English**

[![ci](https://github.com/GoForIt-2026/dsh-skills-cn/actions/workflows/ci.yml/badge.svg)](https://github.com/GoForIt-2026/dsh-skills-cn/actions/workflows/ci.yml)
[![release](https://img.shields.io/github/v/release/GoForIt-2026/dsh-skills-cn)](https://github.com/GoForIt-2026/dsh-skills-cn/releases)
[![license](https://img.shields.io/github/license/GoForIt-2026/dsh-skills-cn)](./LICENSE)
[![node](https://img.shields.io/badge/node-20%2B-3c873a)](https://nodejs.org)
[![DeepSeek Harness plugin](https://img.shields.io/badge/DSH-plugin-4f46e5)](https://github.com/deepseek-ai/deepseek-harness)

Read skills in Chinese, invoke them by their English id. A **Skills** view for DeepSeek Harness that lists every installed skill as *Chinese name + English id + Chinese description*, and writes the chosen `/skill-name` command into the composer — without sending it.

![The Skills view](docs/screenshot-wide.png)

## Why

Once you collect a few skill packs, both `name` and `description` are English, and two things break:

- **Recall** — dozens of skills, irregular English ids; you cannot type the one you want.
- **Comprehension** — the English description does not tell you whether the skill fits your task.

This plugin puts Chinese and English side by side: Chinese name on the left, the untouched English `name` beside it, one command away. It never modifies a skill file and does not install anything.

## Features

- **Bilingual rows**: Chinese name (bold), English `name` (monospace, grey), one-line Chinese description, usage count and source tag.
- **Source groups**: the left column lists All skills / User folders / DSH bundled / Plugin provided / Other with counts, and a click filters the list. The group comes from the registry's `source` field (never guessed from the path), and the five counts add up to All skills.
- **Provider and directory columns**: each row shows the registering provider (`agent-skills`, `office`, …) and where the skill lives on disk; runtime-registered skills without a path read “no directory (runtime)”.
- **Draggable column widths**: every column edge resizes, widths persist locally, and a `⟲` button in the last header restores the defaults. Columns that no longer fit scroll horizontally.
- **Three sort orders**: most used (default, ties by most recent), name A→Z, by source.
- **Paging**: 25 rows per page with numbered page buttons, total and page indicator; changing the search, group or sort returns to page 1 while the selection survives.
- **Usage counters**: a manual insert counts once and so does a **model-driven load of the skill**; the row shows the total and its tooltip splits manual vs automatic. “Clear usage records” clears both sides behind a confirmation, and automatic counting costs no tokens (see below).
- **Chinese overrides**: edit the Chinese name and description of any row; the manual entry always wins over the bundled dictionary and can be restored.
- **Expandable rows**: English source description, `whenToUse` and the skill path.
- **Instant search** across Chinese name, Chinese description, English id and the original English description.
- **One-click insert**: double-click, `Enter`, or the row's **Insert** button appends `/skill-name ` to the composer; the caret stays at the end and **nothing is sent**. The same command is not written twice.
- **Remembered view state**: group, sort and page survive a reload; the selected skill does not, so nothing is inserted by accident.- **Read-only browsing**: normal mode creates, edits and deletes nothing.
- **Batch deletion**: the toolbar's *Delete skills* button enters selection mode; tick rows, confirm with a typed word, and the skill directories are really removed — together with their `~/.agents/.skill-lock.json` registrations (see below).
- **Offline**: Chinese text comes from the bundled dictionary plus your own edits — no network, no model call.
- **Theme and locale aware**, with a stacked layout on narrow views.

## Deleting skills (trash first)

![Delete confirmation](docs/screenshot-delete.png)

There is **no per-row delete button**. Deletion only happens like this:

1. Click **Delete skills** in the toolbar — rows turn into checkboxes, and double-click / `Enter` / `↑` `↓` / *Insert* / edit are disabled for the duration.
2. Tick the skills. Only skills inside a user-owned root can be ticked: `~/.agents/skills`, `~/.dsh/skills`, `~/.dsh/agent-skills`. Skills provided by npm, the DSH market or a preset are greyed out — deleting a `node_modules` folder by hand breaks the package, so the panel refuses.
3. Click **Delete selected…**; the dialog lists every target with its Chinese name, English id, full path, file count/size and lock status.
4. Type **DELETE** (删除 in Chinese) before the confirm button enables. While a dialog is open it owns the keyboard: typing there — including `Enter` — never writes into the composer, and `Esc` closes it.

### Trash (default, recoverable)

![Trash](docs/screenshot-trash.png)

The dialog's **“先移到回收站（可恢复）” checkbox is checked by default**: the directory moves to `<skills root>/../.skill-trash/<id>/` and the pruned `.skill-lock.json` record travels with it in that entry's `meta.json`.

The toolbar's **Trash (N)** entry opens the trash panel, where each item shows its name, original path, file count, size and removal time, with **Restore**, **Delete forever** and **Empty the trash** (behind a confirmation).

Unchecking the box performs the permanent deletion described above, with a red warning.

### How the lock file is handled

- Both modes remove registered names from `~/.agents/.skill-lock.json`, written atomically while keeping `version`, `dismissed` and unknown fields.
- **A record only belongs to a skill in the same root as the lock**: the lock governs `~/.agents/skills`. Deleting a same-named skill in `~/.dsh/skills` or `~/.dsh/agent-skills` never touches the `~/.agents` registration, and the trash entry does not carry someone else's record either (restore re-checks ownership, including entries written by 1.4.0–1.4.2).
- Skills that were never registered leave the lock file **byte-identical**.
- Restoring writes the record back when the skill is absent from the lock; an existing record is never duplicated.
- If the lock cannot be parsed (including a `skills` field that is not an object), the whole request aborts before any file is moved — so you never end up with files gone and a stale registration.
- A directory that is **already gone** while the lock still registers it only has that record cleaned; it is not reported as a failed deletion.
- Symlinked directories and names containing path separators are skipped per item with a reason.

Deletion needs the plugin's **host half** (the browser cannot touch the filesystem). Without it the button reports that deletion is unavailable and everything else keeps working.

## How it differs from similar plugins

| | This plugin | Floating-ball browsers | Composer-button pickers |
|---|---|---|---|
| Chinese name + description | ✅ bundled dictionary | partial / none | none (English only) |
| Entry point | a view tab in the conversation header | floating ball + multi-tab panel | a button beside the composer |
| Insert semantics | `inputActions`, insert without sending | implementation-specific | insert without sending |
| Network / model quota | none | implementation-specific | implementation-specific |
| Footprint | one `client.js`, no build, no dependencies | heavier | medium |

Each plugin makes a different trade-off; this one does a single thing — **let a Chinese reader understand a skill and invoke it**.

## Install

Requires **DeepSeek Harness 0.2.x** (verified on `0.2.2-rc.3`, both Desktop and Web) and Node ≥ 20.

### From GitHub (recommended — one line)

```bash
dsh plugin --profile desktop add github:GoForIt-2026/dsh-skills-cn
```

DSH hands that spec to pnpm, which packs the repository according to `package.json`'s `files` and installs it into the profile — no clone, no build step, no dependencies.

You can also grab the [latest release `.tgz`](https://github.com/GoForIt-2026/dsh-skills-cn/releases/latest):

```bash
dsh plugin --profile desktop add ./dsh-skills-cn-1.4.4.tgz
```

### From npm (once published)

```bash
dsh plugin --profile desktop add dsh-skills-cn
```

### From a local checkout

Settings → **Plugins** → **Add plugin** → pick the cloned directory, or:

```bash
dsh plugin --profile desktop add /path/to/dsh-skills-cn
```

Replace `desktop` with your profile name (`web` for the web profile). Restart DSH, then check the enablement step below.

### Enable and verify

Open **Settings → Plugins** and make sure the “Skill manager (Chinese)” row is enabled. Back in a conversation, the header tab row should show **Skills** between *Workflow* and *Stats*. If it is missing, reload the page (`Ctrl+R`).

## Usage

1. Open any conversation and click the **Skills** tab.
2. Filter with the left column, or search in Chinese (“视频”, “表格”) or English (`sheet`, `test`).
3. Switch the sort order in the toolbar; page through the list at the bottom when there are more than 25 rows.
4. `↑` / `↓` to move, `Enter` to insert — or double-click a row, or click **Insert**.
5. The composer now holds `/api-and-interface-design`; write your request after it and press Enter yourself.
6. To edit the Chinese text, use ✎ on the row (or the button in the expanded area). Clear usage records from the footer.
7. `Esc` clears the search (or closes the open dialog first); `▸` expands the English source and the skill path.

## Where the skill entries come from

The plugin **scans no directory**: it calls the session's `skills/list` (the same catalog the `/` menu uses) and receives `name` / `description` / `whenToUse` / `path` for each entry. On this machine the 43 entries come from:

| Source | Count | Location on disk |
|---|---|---|
| Skills you installed from GitHub | 34 | `~/.agents/skills/<name>/SKILL.md` |
| DSH preset skill | 1 | inside the app bundle: `…/app.asar/dsh/node_modules/@deepseek-ai/dsh-agent-preset/skills/` |
| Skills registered by bundled plugins (no file path) | 8 | office ×4, diagnose-windows-sandbox-acl, workflow-* ×3 |

The four groups in the sidebar therefore read **34 user folders + 6 DSH bundled + 3 plugin provided + 0 other**.

`~/.dsh/skills`, `~/.dsh/agent-skills`, `~/.claude/skills` and similar roots are empty here, so nothing comes from them.

### How the source tag is decided

The group comes from the `source` the Host skill registry reports, never from the path:

| `source` | Group | Typical origin |
|---|---|---|
| `user-agents` / `user-dsh` / any other `user-*` | User folders | skills you installed into `~/.agents/skills` or `~/.dsh/skills` yourself |
| `bundled` | DSH bundled | skills shipped inside the app or a bundled plugin (`office` ×4, `diagnose-windows-sandbox-acl`, …) |
| `custom` | DSH bundled | a directory DSH was configured with (`customSkillDirs`); on this machine it points at the preset folder inside the app bundle, which is `dsh-doc` |
| `runtime` | Plugin provided | registered at runtime by an installed plugin (`workflow-*`, …) |
| `project-dsh` / `project-agents` / anything else | Other | project-local skill folders and unrecognised entries (empty here) |

Only when the registry is unavailable does the panel fall back to the path heuristic (`.agents/skills` → user folders, `app.asar` → DSH bundled, `node_modules` → plugin provided). The tag is display-only and **never grants deletion**: deletion requires the directory to sit inside `~/.agents/skills`, `~/.dsh/skills` or `~/.dsh/agent-skills`, and only when the registry reports a path there.

## Where the Chinese comes from

`client.js` ships a **TERMS** dictionary (46 entries today) keyed by the skill's English `name`, each mapping to `[Chinese name, Chinese description]`. Skills that are not in the dictionary do not disappear: they render their English name and description with a small “no Chinese entry” marker — use ✎ to add one, and that manual entry wins from then on.

Adding an entry to the dictionary itself is one line — edit `TERMS` in `client.js` and open a PR:

```js
'markdown-export': ['Markdown 导出', '把会话导出成 Markdown 文件'],
```

## Where the data lives

Three `localStorage` keys in the browser, never the skill directories:

| Key | Contents |
|---|---|
| `dsh-skills-cn/cache/v1` | Your manual Chinese name/description overrides |
| `dsh-skills-cn/usage/v1` | **Manual** usage counts and last-used times |
| `dsh-skills-cn/ui/v1` | Last group, sort order and page |

The Host half also writes one small file, holding automatic counts only:

```
~/.dsh/skills-cn/usage.json      # {"version":1,"entries":{"<skill>":{"auto":3,"lastAt":1731…}}}
```

It contains nothing but skill names, counts and timestamps — **never skill content** — and is written
debounced (800 ms) with a temp-file-plus-rename replacement, plus a flush on plugin unload. Deleting the
file zeroes the automatic counts; no skill file is touched.

## How usage is counted (manual / automatic)

| Source | Trigger | Stored in | Cleared by |
|---|---|---|---|
| Manual | you click **Insert** (the moment the command enters the composer) | browser `localStorage` | “Clear usage records” / OS reinstall |
| Automatic | the model loads the skill through the `skill` tool (subagents included) | `~/.dsh/skills-cn/usage.json` | “Clear usage records” / deleting the skill / removing the file |

Automatic counting is a **passive listener** on the Host: DSH already emits `tools/result` for every tool
call, and the plugin only checks `exec.name === 'skill'`, reads the skill name from the arguments and
adds one. It **does not touch the prompt, register a tool, or make a model request** — the model sees
exactly the same context, so it **costs no tokens**; the real cost is one in-memory counter and a few KB
of JSON on flush.

The two numbers mean different things: manual is “you put it in the composer” (even if you never sent
it), automatic is “the model actually loaded it”. The row shows the total and the tooltip shows the split,
so the number never pretends to have a single source.

## Compatibility

| | |
|---|---|
| DSH | `>=0.2.0-rc.1 <0.3.0` (verified `0.2.2-rc.3`) |
| Platforms | Web and Desktop (the Electron shell loads the same web UI) |
| Theme | follows light and dark (all colours are `--dsw-alias-*` tokens) |
| Locale | UI in Chinese and English; skill ids stay English |

The DSH internals it depends on are **`skills/list`** — the same catalog the `/` slash menu uses — probed as `skills` → `sessionSkillCatalog` → `skillCatalog`. Insertion uses the composer's `inputActions`, degrading from `insertText` to `setDraft` to the clipboard. If any layer is unavailable the panel still mounts and shows a “catalog unavailable / retry” state instead of a blank slot.

## Privacy and boundaries

- Browsing reads the skill catalog DSH already loaded; it does not walk the disk or parse `SKILL.md`.
- Nothing is uploaded. Apart from the loopback routes on this machine, no network request is made.
- Writes exist in exactly two places: the **batch deletion you explicitly confirm** (directories + `.skill-lock.json`, gated by a same-origin check, an intent header and a typed confirmation word), and the **automatic counter file** `~/.dsh/skills-cn/usage.json` (skill names, counts, timestamps only).
- Automatic counting never asks the model for another request and never adds context — **zero token cost**.

## Reinstalling on a new machine

The plugin has no configuration to back up; one line brings it back:

```bash
dsh plugin --profile desktop add github:GoForIt-2026/dsh-skills-cn
```

Restart DSH, confirm the row is enabled in **Settings → Plugins**, reload the page.

## Development

```bash
npm test            # self check + 18 host unit tests (node --test)
npm run validate    # manifest, files, locales, detail image, icon
npm run test:host   # host unit tests only
npm run pack:check  # preview the published file list
```

Layout:

```
package.json            # dsh.bundle + dsh.client manifest
index.js                # host half: loopback routes (/roots /catalog /preview /delete /trash-*)
host/skills-core.js     # host core: locate, trash, atomic .skill-lock.json (pure, unit tested)
client.js               # client half: tab, table, search, insert, delete/trash dialogs (__ModuleLoader__, no build)
cordis.patch.yml        # inserts the bundle row with id skill-manager
locale/{en,zh}.json     # plugin page title/description/detail
icon.svg                # plugin icon
docs/                   # detail image and README screenshots
scripts/validate.mjs    # pre-publish self check
scripts/test-host.mjs   # host unit tests (node:test)
```

Local iteration:

```bash
dsh plugin --profile desktop add /absolute/path/dsh-skills-cn
```

Client-side edits apply on page reload; `package.json` or `cordis.patch.yml` changes need a reinstall and restart.

## FAQ

**The tab is missing.** View tabs belong to a session — open one first, confirm the plugin is enabled, then reload.

**The list is empty.** This DSH build does not expose a skill catalog; the panel shows a retry button instead. Check the supported DSH range.

**Insert does nothing.** It falls back from the composer API to the draft API to the clipboard; if all fail it reports the failure and keeps the panel state rather than pretending.

**It shows 43 skills but I installed 29.** The number is the *session-visible* catalog, which includes skills contributed by the agent preset, not just `~/.agents/skills`.

## Contributing

- Found a bug → [open an issue](https://github.com/GoForIt-2026/dsh-skills-cn/issues/new/choose) (the form asks for versions and reproduction steps)
- Want to change code → [CONTRIBUTING.md](CONTRIBUTING.md); there is no build step and `npm test` is the whole check
- Security problem → [report privately](SECURITY.md), please not in a public issue
- Version history → [CHANGELOG](CHANGELOG.md); 中文说明见 [README.md](README.md)

## License

[MIT](./LICENSE)
