# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
