# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
