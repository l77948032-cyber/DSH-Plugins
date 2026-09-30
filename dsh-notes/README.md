# DSH Notes

DeepSeek Harness 的本地 Markdown 笔记插件。左侧是文件夹和笔记列表，中间可编辑、预览或分屏查看；支持搜索文件名、新建、重命名、自动保存和移到隐藏回收区。笔记是普通 `.md` 文件，代理和其他本地工具可以直接读写。

## 安装

需要 DSH `0.2.0-rc.2` 或兼容的 `0.2.x`、Node.js `>=22.19.0`。克隆 [DSH-Plugins](https://github.com/l77948032-cyber/DSH-Plugins) 后，在仓库目录运行：

```sh
npm --prefix ./dsh-notes ci --ignore-scripts
dsh plugin --profile desktop add ./dsh-notes
```

重启 DSH 后，左侧全局导航中会出现“笔记”。Web/Headless profile 可将 `desktop` 换为对应名称。

默认笔记目录为 `~/Documents/DSH Notes`。启动 DSH 前设置 `DSH_NOTES_DIR` 可改用其他目录，也可在插件配置中设置 `rootDir`。目录会在首次访问时创建。插件只列出 Markdown 文件和文件夹；图片等附件可以与笔记放在同一目录，在预览中用相对路径引用。

删除操作会移动到笔记目录内的 `.dsh-trash`，不会永久删除。若文件在插件外被修改，保存时会提示冲突，不会覆盖外部改动。

## 安全边界

写入 API 使用 DSH 的连接认证和同源请求检查。所有文件操作限定在配置的笔记目录内，拒绝路径穿越与符号链接；Markdown 预览经过 HTML 净化。远程 DSH Host 使用时，笔记目录位于 Host 所在机器。

## 验证

```sh
cd dsh-notes
npm ci --ignore-scripts
npm run check
```

插件代码采用仓库根目录的 [MIT 许可证](../LICENSE)。笔记数据不在本仓库中。
