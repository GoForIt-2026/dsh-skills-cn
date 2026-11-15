# dsh-skills-cn

[![npm](https://img.shields.io/npm/v/dsh-skills-cn)](https://www.npmjs.com/package/dsh-skills-cn)
[![npm downloads](https://img.shields.io/npm/dm/dsh-skills-cn)](https://www.npmjs.com/package/dsh-skills-cn)
[![license](https://img.shields.io/npm/l/dsh-skills-cn)](./LICENSE)
[![DeepSeek Harness plugin](https://img.shields.io/badge/DSH-plugin-4f46e5)](https://github.com/deepseek-ai/deepseek-harness)

看中文，叫得出英文。给 DeepSeek Harness 加一个「技能管理」页签：把本机已装的技能按 **中文名 + 英文标识 + 中文说明** 列出来，选中一个就把 `/skill-name` 写进输入框——只写不发送。

![技能管理页签](docs/screenshot-wide.png)

## 它解决什么问题

技能包装多了以后，`name` 和 `description` 全是英文，常见两个卡点：

- **记不住**：几十个技能，英文标识没规律，想调用时拼不出名字；
- **看不懂**：英文描述读完也判断不出这个技能能不能干自己的活。

这个插件把「看懂」和「叫得出」放在同一个面板里：左边中文，右边英文原名，选中即写命令。它**不修改任何技能文件**，也不负责下载安装。

## 功能

- **中英对照**：每行是中文名（粗体）、英文 `name`（等宽灰字）、一行中文说明、来源标签。
- **即时搜索**：中文名、中文说明、英文标识、英文原描述都能命中，输入即时过滤。
- **一键写入**：双击、`Enter`、或点行内的「插入」，把 `/skill-name ` 追加到输入框，光标停在末尾，**不会自动发送**。
- **只读**：不创建、不修改、不删除技能目录与 `SKILL.md`，也不改英文 `name`。
- **离线**：中文对照来自内置词典，不联网、不调用模型、不消耗额度。
- **跟随主题与语言**：颜色走 DSH 主题 token，文案走 locale（中/英）。
- **窄屏自适应**：右侧栏展开把面板压窄时，自动从四列切成「名称 / 英文 / 说明」叠三行。

## 和同类插件的区别

| | 本插件 | 悬浮球类（如 dsh-skill-browser） | 输入框按钮类（如 dsh-skill-picker） |
|---|---|---|---|
| 中文名 + 中文说明 | ✅ 内置词典 | 部分/无 | 无（只显示英文） |
| 入口位置 | 对话区顶部页签（和其它视图并列） | 悬浮球 + 多 Tab 面板 | 输入框旁按钮 |
| 写入方式 | `inputActions`，只写不发 | 视实现 | 只写不发 |
| 联网 / 模型额度 | 完全不使用 | 视实现 | 视实现 |
| 代码体量 | 单文件 `client.js`，无构建、无依赖 | 较重 | 中等 |

同类插件各有取舍，本插件只做一件事：**让中文用户看懂并叫得出一个技能**。

## 安装

需要 **DeepSeek Harness 0.2.x**（实测 `0.2.2-rc.3`，Desktop 与 Web 均可）。

### 方式一：npm 包（推荐）

```bash
dsh plugin --profile desktop add dsh-skills-cn
```

把 `desktop` 换成你自己的 profile 名（Web 版一般是 `web`）。装完重启 DSH，再按下面的「启用」确认。

### 方式二：GitHub 源码

```bash
dsh plugin --profile desktop add github:YOUR_GITHUB/dsh-skills-cn
```

### 方式三：本地目录

插件管理页 → **添加插件** → 选择克隆下来的目录；或：

```bash
dsh plugin --profile desktop add /path/to/dsh-skills-cn
```

### 启用与验证

打开 **设置 → 插件**，确认「技能管理」这一行是启用状态；回到对话页，顶部视图条应出现 **技能管理** 页签，位置在「工作流」与「统计」之间。没出现时先刷新页面（`Ctrl+R`）。

## 使用

1. 打开任一会话，点顶部 **技能管理**。
2. 搜索框输入中文（「视频」「表格」）或英文（`sheet`、`test`）。
3. `↑` / `↓` 移动，`Enter` 插入；也可以双击某行，或点行内「插入」。
4. 输入框里出现 `/api-and-interface-design`，后面接着写你的需求，自己按回车发送。
5. `Esc` 清空搜索；再点一次技能名可回到列表继续挑。

## 中文对照是怎么来的

`client.js` 里有一份 **TERMS** 词典（当前 46 条），键是技能的英文 `name`，值是 `[中文名, 中文说明]`。词典里没有的技能不会消失：它会照常显示英文名与英文描述，并在名字后标「未收录中文」。

想补词条，改 `client.js` 的 `TERMS` 再提 PR 即可，一条一行：

```js
'markdown-export': ['Markdown 导出', '把会话导出成 Markdown 文件'],
```

## 兼容性

| 项 | 状态 |
|---|---|
| DSH | `>=0.2.0-rc.1 <0.3.0`（实测 `0.2.2-rc.3`） |
| 平台 | Web / Desktop（Electron 窗口同样加载 Web 界面） |
| 主题 | 跟随明暗主题（全部用 `--dsw-alias-*` token） |
| 语言 | 界面中/英，技能名保英文 |

插件对 DSH 内部接口的依赖是 **`skills/list`**（就是 `/` 斜杠菜单用的同一个技能目录接口），并按 `skills` → `sessionSkillCatalog` → `skillCatalog` 依次探测；写入走输入框的 `inputActions`，按 `insertText` → `setDraft` → 复制到剪贴板三级降级。任一环节不可用时面板仍会挂载，并给出「读不到技能列表 + 重试」而不是白屏。

## 隐私与只读

- 只读 DSH 自己已经加载的技能目录，**不扫盘、不解析 `SKILL.md`**。
- 不上传任何技能内容，不发起网络请求。
- 不写任何技能文件；插件自身也不落盘。

## 重装系统 / 换机器怎么装回来

只要仓库和 npm 包还在，三条命令即可回到可用状态：

```bash
# 1. 装 DSH 后，先装插件（二选一）
dsh plugin --profile desktop add dsh-skills-cn
# 或从源码
dsh plugin --profile desktop add github:YOUR_GITHUB/dsh-skills-cn

# 2. 重启 DSH
# 3. 设置 → 插件 里确认「技能管理」已启用，刷新页面
```

本插件的配置为零，不需要备份任何数据文件。

## 开发

```bash
npm test            # = node scripts/validate.mjs，检查 manifest/资源/语言包/详情图/图标
npm run pack:check  # 预览将要发布的文件清单
```

目录结构：

```
package.json          # dsh.bundle + dsh.client 清单
index.js              # Host 半边（本插件无 Host 逻辑）
client.js             # Client 半边：页签、列表、搜索、写入（__ModuleLoader__ 格式，无构建）
cordis.patch.yml      # 插入 id 为 skill-manager 的 bundle 行
locale/{en,zh}.json   # 插件页标题/描述/详情
icon.svg              # 插件图标
docs/                 # 详情图与 README 截图
scripts/validate.mjs  # 发布前自检
```

本地联调（不发布也能装）：

```bash
dsh plugin --profile desktop add /绝对路径/dsh-skills-cn
```

client 侧改动刷新页面即生效；改 `package.json` 或 `cordis.patch.yml` 需要重装并重启。

## 常见问题

**页签没出现？** 视图页签属于会话，先打开一个会话；再确认「设置 → 插件」里已启用，然后刷新页面。

**列表是空的？** 说明当前 DSH 版本没有暴露技能目录接口，面板会显示重试按钮；请确认 DSH 版本在兼容范围内。

**点插入没反应？** 会依次尝试写入输入框、设置草稿、复制到剪贴板；如果都不可用会提示失败并保留面板状态，不会假装成功。

**显示 43 个技能，但我只装了 29 个？** 这里的数字是**当前会话可见的技能目录**（含预设自带的技能），不是 `~/.agents/skills` 的目录数。

## License

[MIT](./LICENSE)
