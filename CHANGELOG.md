# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-11-16

### Fixed

- Restoring a trashed skill writes its `.skill-lock.json` record back **before** the trash entry is
  discarded. If that write fails, the restored directory is moved back into the trash entry instead of
  being left on disk with a missing registration, and the failure is reported per skill
  (`lock-write-failed`) so the operation can be retried. Unregistered skills still never touch the lock.
- The restore toast now distinguishes “restored with skill-lock record” from a plain restore, and names
  the failing skill with its reason (`target-exists`, `lock-write-failed`, `not-found`).
- New host test covers the rollback: a read-only lock makes restore fail, the files return to the trash,
  and a retry after the lock is writable succeeds.

## [1.4.0] - 2026-11-15

### Changed

- **Grouping is now based on the Host registry's real `source` field** instead of guessing from the
  path: 全部技能 / 用户目录 (`user-*`) / DSH 内置 (`bundled`) / 插件提供 (`runtime`, `custom`) /
  其他. On this machine that is 43 = 34 + 5 + 4 + 0, and the five counts always sum to the total.
- The **提供方 (providers)** column shows the registry provider of each skill (`agent-skills`,
  `office`, …) so the eight path-less, runtime-registered skills finally say who provides them.
- A new **目录 (directory)** column shows where the skill lives, shortened to `~/.agents/skills/<name>`
  for user roots and `无目录（运行时注册）` when the registry reports no file path.
- The table is tighter (smaller gaps and paddings) and **every column edge is draggable**; widths are
  persisted in `localStorage` and a `⟲` button in the last header restores the defaults. Columns that
  no longer fit scroll horizontally instead of being clipped.

### Fixed

- Sorting by source ranked `user` last because `order[group] || 3` treated the rank `0` as missing.

## [1.3.1] - 2026-11-15

### Fixed

- The group counts did not add up: skills whose source matched nothing were dropped from every group
  while still counted in “All skills”. A fifth group **其他来源 / Other sources** now holds both the
  preset-bundled skills and the unrecognised ones, so the five counts always sum to the total.
- Skills bundled inside the app (`…/app.asar/…`) were tagged **npm** because their path contains
  `node_modules`; they are now tagged **预设 / preset** and grouped under 其他来源. Preset detection runs
  before the npm rule.

### Changed

- The source rules are documented in both READMEs, with the real per-source breakdown of the 43 entries
  on a typical machine (34 hand-installed + 1 preset + 8 bundled/plugin-provided).

## [1.3.0] - 2026-11-15

### Added

- **Trash-first deletion**: by default the batch delete dialog now moves skill directories into
  `<skills-root>/../.skill-trash/<id>/` instead of destroying them, so a mis-click is recoverable.
  A checkbox in the dialog (“先移到回收站（可恢复）”, checked by default) switches to permanent
  deletion, which shows an explicit irreversible warning.
- **Trash panel**: a toolbar entry with a live count lists every trashed skill with its original path,
  file count, size and removal time, and offers 恢复 / 彻底删除 per item plus 清空回收站 behind a
  confirmation.
- Each trash entry keeps a `meta.json` with the original root, path and the pruned `.skill-lock.json`
  record; restoring puts the directory back **and** writes the lock record back, so the registry stays
  consistent in both directions.
- Restoring refuses to overwrite an existing directory (`target-exists`) and re-adds a lock record only
  when it is missing.
- Four new host tests (trash default, restore + lock write-back, restore-over-existing refusal, purge,
  purge mode) — 12 cases total.

### Changed

- `POST /__dsh-skills-cn/delete` takes `mode: 'trash' | 'purge'` (default `trash`).
- New routes: `/trash-list`, `/trash-restore`, `/trash-purge`.
- README and plugin description document the trash flow, its location and how to empty it.

## [1.2.0] - 2026-11-15

### Added

- **Batch deletion** behind an explicit selection mode: the toolbar's 批量删除 button turns rows into
  checkboxes (no per-row delete button anywhere), and blocks insertion and editing while it is on.
- Deletion is real: the skill directory and every file under it are removed from disk through a new
  **host half** (`host/skills-core.js`), which the panel reaches over two loopback routes
  (`POST /__dsh-skills-cn/preview`, `POST /__dsh-skills-cn/delete`) gated by an intent header,
  a same-origin check and a literal confirmation token.
- **`.skill-lock.json` stays in step**: registered names are pruned from `~/.agents/.skill-lock.json`
  in the same request, atomically (temp file + rename), preserving `version`, `dismissed` and unknown
  fields. Manually installed skills that were never registered leave the lock file byte-identical.
- A confirmation dialog lists every target with its full path, file count, size and lock status, and
  requires typing 删除 / DELETE before the confirm button enables.
- `node --test` suite (`scripts/test-host.mjs`, 8 cases): pruning, untouched lock, invalid names,
  symlinked skill directories, unreadable lock aborts, missing-directory cleanup, explicit
  confirmation, missing lock.

### Changed

- `npm test` now runs the manifest validator plus the host unit tests.
- `files` ships `host/`; the read-only badge became “只读浏览 · 删除需在批量模式二次确认”.

## [1.1.1] - 2026-11-15

### Changed

- The install-source dropdown is now always available in the toolbar and stays in sync with the left
  group column, as the PRD asks for both controls side by side (previously it only appeared on narrow
  layouts).

## [1.1.0] - 2026-11-15

### Added

- **Source grouping**: a left column with 全部技能 / npm 安装 / GitHub 手动安装 / DSH 内部市场安装 and
  the count of each; clicking a group filters the list, and the same choice is mirrored by a dropdown
  on narrow layouts.
- **Sorting**: 常用优先 (most used first, ties by most recent), 名称字母序, 按安装方式分组.
- **Paging**: 25 rows per page with numbered page buttons, total count and page indicator; search,
  group change and sort change return to page 1; the selection survives paging.
- **Usage counters**: every successful insert records a count and a last-used time, shown per row and
  clearable from the footer behind a confirmation dialog.
- **Chinese overrides**: any row can be edited in place (Chinese name and description), stored as a
  manual entry that always wins over the bundled dictionary, and restorable to the built-in entry.
- **Expandable rows**: the English source description, `whenToUse` and the skill path, plus the edit
  action.
- **Refresh** button to re-read the catalog without reloading the page.
- View state (group, sort, page) is remembered across reloads.
- Empty-selection guard: `Enter` with nothing selected selects the first row instead of writing a
  command.

### Changed

- Rebuilt the panel layout around a grouped table with a persistent footer (selection, usage reset,
  pager).

## [1.0.0] - 2026-11-15


### Added

- A **Skills** view tab in the conversation header (`conversation.view`, id `skill-manager`, order 30),
  placed between Workflow and Stats.
- Bilingual list: Chinese name, untouched English `name`, one-line Chinese description, source tag
  (`npm` / `GitHub` / `市场` / `其他`, derived from the skill path).
- Instant client-side search over Chinese name, Chinese description, English id and English description.
- Insert-by-gesture: double-click, `Enter`, or the row's **Insert** button writes `/skill-name `
  through the composer's `inputActions` and never sends the message.
- Bundled offline Chinese dictionary (46 common skill packs); unknown skills still render in English
  with a "no Chinese entry" marker.
- Keyboard support (`↑` `↓` `Enter` `Esc`) and a responsive layout that collapses the table when the
  view is narrow.
- Read-only catalog access through DSH's `skills/list` Remote, probed as `skills` →
  `sessionSkillCatalog` → `skillCatalog`; three-step insertion fallback (`insertText` → `setDraft` →
  clipboard); a retry state instead of a blank slot when the catalog is unavailable.
- Publish-time validation (`npm test`), locale-complete plugin metadata, feature image, icon,
  CI and tag-driven npm release workflows.

[1.0.0]: https://github.com/YOUR_GITHUB/dsh-skills-cn/releases/tag/v1.0.0
