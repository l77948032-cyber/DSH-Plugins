# DSH Plugins

DeepSeek Harness 的独立插件集合。每个插件位于仓库根目录下的单独文件夹，可分别安装和维护。

| 插件 | 用途 | DSH 版本 |
| --- | --- | --- |
| [DSH Notes](./dsh-notes/) | 本地 Markdown 笔记，左侧文件树、编辑与预览 | `>=0.2.0-rc.2 <0.3.0` |
| [DSH Web Providers](./dsh-web-providers/) | WorkBuddy 与豆包网页模型接入 | `>=0.1.5-rc.1 <0.2.0` |

插件代码在这个仓库；笔记内容保存在本机的 `~/Documents/DSH Notes`，不会自动提交到 GitHub。各插件的安装、配置与兼容性说明见对应目录的 README。

## 开发

```sh
cd dsh-notes && npm ci --ignore-scripts && npm run check
cd ../dsh-web-providers && npm ci --ignore-scripts && npm run check
```

本仓库采用 [MIT 许可证](./LICENSE)。
