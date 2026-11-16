# 贡献指南

欢迎提 issue 和 PR。这个插件的目标很小：**让中文用户看懂并叫得出一个技能**。改动只要能服务这个目标、不扩大写操作的范围，通常都会合并。

## 提 issue 前

先确认这三件事，能省掉一轮来回：

1. **DSH 版本**：`设置 → 关于`（或 `dsh --version`），本文实测 `0.2.2-rc.3`。
2. **插件版本**：`设置 → 插件` 里「技能管理」那一行的版本号。
3. **复现步骤 + 截图**：界面问题请附截图；「读不到技能列表」请附页面控制台报错（`Ctrl+Shift+I`）。

## 本地开发

```bash
git clone https://github.com/GoForIt-2026/dsh-skills-cn.git
cd dsh-skills-cn
npm test            # 发布前自检 + 18 个 Host 单测
```

没有依赖、没有构建步骤。把本地目录装进 profile 联调：

```bash
dsh plugin --profile desktop add /absolute/path/to/dsh-skills-cn
```

改完重启 DSH（或页面 `Ctrl+R`）就能看到效果。

## 代码约定

| 文件 | 约定 |
|---|---|
| `client.js` | 单文件、`window.__ModuleLoader__.load({ id: '<包名>', factory(require){…} })` 格式，**模块 id 必须等于包名**（`scripts/validate.mjs` 会校验）；不引入构建工具，不新增运行时依赖 |
| `index.js` | Host 半边只做浏览器做不到的事：读注册表、删目录、维护 `.skill-lock.json`；每个路由都要过同源检查 + `x-dsh-skills-cn` 意图头 |
| `host/skills-core.js` | 纯 Node 函数、无 Cordis 依赖，便于单测；破坏性操作要先校验再动手，失败要能回滚 |
| `locale/{en,zh}.json` | 插件页标题/描述/详情，两个文件的键必须一致 |
| `docs/` | `DETAIL.md` / `DETAIL.zh.md` 各只有一行图片（插件页详情图），别加正文 |

界面文案同时写在 `client.js` 顶部的 `zh` / `en` 两个字典里，**新增键必须两边都加**。

## 补中文词典

`client.js` 里的 `TERMS` 是内置对照表，格式一行一条：

```js
'markdown-export': ['Markdown 导出', '把会话导出成 Markdown 文件'],
```

键是 `SKILL.md` 的 `name`（小写、连字符）。补词条不需要改别的文件。

取名的规矩（大白话版，评审会按这个看）：

- **2–8 个字，说清"干什么"**；用平时说话的词，不堆缩写、不用生僻字；
- **不音译**：品牌/工具名保留原文（`Codex 命令行调用`），功能名按语义写；
- 说明一句话，动词开头，写"什么时候用它"。

个人的、第三方的技能不要往 `TERMS` 里塞——写进本机词典 `~/.dsh/skills-cn/zh.json` 就行（见 README「给自己的技能补中文」），既不用发版也不会污染公共词典。

## 发布规则

- 版本遵守 [SemVer](https://semver.org/lang/zh-CN/)：行为变化升 minor/patch，破坏兼容升 major。
- 每版都要写 `CHANGELOG.md`；`package.json` 的 `version` 与 tag 必须一致。
- 发布方式：打 tag（`git tag vX.Y.Z && git push origin vX.Y.Z`）。CI 会跑自检；仓库配了 `NPM_TOKEN` secret 时才会顺带 `npm publish --provenance`。

## 不要提交的东西

`work/`、`tools/`、`local/`、`demo/`、`*.tgz`、`*.pdf` 都在 `.gitignore` 里——这些是本机验证产物和 PRD，不属于插件包。提交前跑一遍 `git status` 确认。
