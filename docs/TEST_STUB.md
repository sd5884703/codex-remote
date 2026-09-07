# 测试用假桥（可选）

默认启动只会找电脑上真正的 `codex` 命令。

没有装 Codex、又想先测「网页能否连上、发消息有没有回音」时，可以开假桥：

```bash
CODEX_REMOTE_STUB=1 npm start
```

或：

```bash
npm run start:stub
```

假桥是项目自带的一小段脚本，用 `node` 启动即可，不必单独给脚本加「可执行」权限。仓库里的 `scripts/codex-stub.mjs` 也会标成可执行，方便直接跑。假桥只回测试话，不能代替真 Codex。
