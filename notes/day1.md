# 第 1 天 · 环境与复验

2026-11-20，Darwin arm64，`llc` 报告 host CPU 为 Apple M4。启动时目录为空，`git status --short --branch` 返回非 Git 仓库。尝试初始化时沙箱拒绝写入 `.git`，项目文件已保留在当前目录。

## 工具链

- 首次运行的环境记录（仅用于追溯）。复用 Homebrew LLVM 22.1.8 Optimized build。`llc` 为 `/opt/homebrew/opt/llvm@22/bin/llc`，实际安装目录为 `/opt/homebrew/Cellar/llvm@22/22.1.8`。
- Homebrew 安装附带的 formula 指向 `llvmorg-22.1.8` release tarball。固定的上游源码 commit 为 [ca7933e47d3a3451d81e72ac174dcb5aa28b59d1](https://github.com/llvm/llvm-project/commit/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1)。这是上游源码版本锚点，实验二进制沿用 Homebrew 构建。
- 在本地项目和 Homebrew 目录查找 AArch64 selector 源文件时发现 CJMP 内嵌的 LLVM 10 源码，版本与实验不匹配。未定位到可复用的 22.1.8 源码树。沙箱内 `git ls-remote` 因 GitHub DNS 失败，release 到 commit 的对应关系经 GitHub release 页面核对。目前本地约有 25 GiB 可用，未拉取完整源码或启动构建。今天用网页上的固定版本源码和本机二进制。
- 当前从相邻 RepoFoundry 仓库的 `dist/a377d0201af83dfcbbca5c21bcd157474156980f/repofoundry-0.1.0-py3-none-any.whl` 直接安装到项目独立 `.venv`（CPython 3.14.5）。用同目录的 `SHA256SUMS` 校验通过，SHA-256 为 `e6933cb03c7dbda17797e86806cb531131354e00df3e98fcc4e20a73ee0f7d9a`。wheel 解包后 33 个条目均与从固定提交构建的初始 wheel 一致。
- 在项目根目录复装时，若环境尚未创建，先运行 `uv venv --python 3.14 .venv`。用 `uv pip install --python .venv/bin/python --reinstall ../RepoFoundry/dist/a377d0201af83dfcbbca5c21bcd157474156980f/repofoundry-0.1.0-py3-none-any.whl` 安装。此次切换沿用已有依赖，安装额外使用 `--offline --no-deps` 和可写的 `UV_CACHE_DIR`，随后 `uv pip check --python .venv/bin/python` 通过。
- 初次启动时没有可核实的既有 wheel，用 `git -C ../RepoFoundry archive a377d0201af83dfcbbca5c21bcd157474156980f` 导出到临时目录后运行 `uv build --wheel`，初始 wheel 的 SHA-256 为 `7c92bd8112e74508eb8ffd0f0ca144b207e3f19bbf556f09f684ac7fe107b4e3`。初始构建和安装所缺依赖通过联网取得。
- `.venv/bin/repofoundry doctor .` 返回 `Manifest valid`（协议 0.1）。`.venv/bin/repofoundry plugins resolve-work --project .` 成功解析 learning profile，按返回的 entry 读取插件。Work 的持久化由实际写入和重读单独验证。

## 复验命令

在项目根目录执行。默认从 PATH 使用 `llc`，也可通过环境变量 `LLC` 指定其他命令名或可执行文件路径。对照留档时，先用 `"${LLC:-llc}" --version` 确认 LLVM 22.1.8 和 AArch64 目标支持。命令会生成供 P1-C1 作答后使用的结果。

```sh
mkdir -p evidence/day1
llvm_tool=${LLC:-llc}
"$llvm_tool" --version > evidence/day1/llc-version.txt
"$llvm_tool" -mtriple=aarch64-unknown-linux-gnu -mcpu=generic -O2 \
  -verify-machineinstrs -debug-pass=Structure experiments/add-shift.ll \
  -o evidence/day1/add-shift.s 2> evidence/day1/pipeline.txt
"$llvm_tool" -mtriple=aarch64-unknown-linux-gnu -mcpu=generic -O2 \
  -verify-machineinstrs -print-before=aarch64-isel -print-after=aarch64-isel \
  experiments/add-shift.ll -o /dev/null 2> evidence/day1/isel.txt
```

两个 CodeGen 命令都成功退出。默认 selector 配置下，pass 日志含 `aarch64-isel` / `AArch64 Instruction Selection`，并检查了 GlobalISel pass 名称。选择前后的日志也已落盘。本轮确认的是这组 triple、CPU、优化级别和输入的 SelectionDAG 路径，以及机器指令 verifier 下的汇编生成。

## 源码入口

- 从 `AArch64PassConfig::addInstSelector` 找到后端接入点。[AArch64TargetMachine.cpp](https://github.com/llvm/llvm-project/blob/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/llvm/lib/Target/AArch64/AArch64TargetMachine.cpp#L649)
- 沿共用的 IR 到 DAG 入口和 DAG pass 阅读。[SelectionDAGBuilder.cpp](https://github.com/llvm/llvm-project/blob/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/llvm/lib/CodeGen/SelectionDAG/SelectionDAGBuilder.cpp) · [SelectionDAGISel.cpp](https://github.com/llvm/llvm-project/blob/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/llvm/lib/CodeGen/SelectionDAG/SelectionDAGISel.cpp)
- 在目标 selector 和 TableGen 定义中定位具体匹配条件。[AArch64ISelDAGToDAG.cpp](https://github.com/llvm/llvm-project/blob/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/llvm/lib/Target/AArch64/AArch64ISelDAGToDAG.cpp) · [AArch64InstrInfo.td](https://github.com/llvm/llvm-project/blob/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/llvm/lib/Target/AArch64/AArch64InstrInfo.td)
