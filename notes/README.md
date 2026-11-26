# AArch64 CodeGen Lab

## 学习目标

以最小 IR 和受控反例解释 LLVM AArch64 指令选择，并能将源码定位和验证方法迁移到陌生输入。当前以 SelectionDAG 建立基线，之后用 GlobalISel 做对照。Agent 执行环境准备、实验实现和证据采集，学习者独立解释、审查关键设计并决定方向。

## 当前状态

- 工程 Work `b8a5d8d5-19f1-4743-bd8c-8ad6b8edfa26`。用 `.venv/bin/repofoundry work resume b8a5d8d5-19f1-4743-bd8c-8ad6b8edfa26 --project .` 读取最近检查点。
- 当前阶段是 P2 · GlobalISel 对照。[P2-C1](../learning/checkpoints/P2-C1.md) 为 needs_review，已归档部分作答和综合题讲解。P1-C1 保留 needs_review，P1-C2 的待答练习暂缓。
- 七天材料已齐备。第 4–7 天的学习记录依次为 [P2-C2](../learning/checkpoints/P2-C2.md)、[P2-C3](../learning/checkpoints/P2-C3.md)、[P3-C1](../learning/checkpoints/P3-C1.md)、[P3-C2](../learning/checkpoints/P3-C2.md)，均待答。第 5、6 天先保存预测，再运行课件中的复验命令。

## 专题学习入口

现在每次围绕一个机制问题，连续完成源码阅读、已测案例、独立预测与综合作答。已有第 3 天作答的学习者可直接从[专题一的双路径对照](../learning/checkpoints/Unit-1.html#chapter-2)续学，随后做右移方向的新实验。

| 一次学习 | 时间参考 | 本次完成的综合产出 |
| --- | --- | --- |
| [基础专题 · ARM64 主要指令与实例](../learning/checkpoints/Unit-4.html) | 90–120 分钟 | 用寄存器、访存地址和 NZCV 逐步恢复一个数组循环，再追踪函数调用与返回 |
| [专题一 · 从 IR 到两条选择路径](../learning/checkpoints/Unit-1.html) | 2–3 小时 | 用 DAG、GlobalISel 和最终汇编解释相同指令怎样形成，预测改变移位量来源的影响 |
| [专题二 · 加数的表示与编码边界](../learning/checkpoints/Unit-2.html) | 90–120 分钟 | 在 W/X 形式间对齐立即数字段，用两组反例分别检验对齐和容量 |
| [专题三 · 从陌生算式到复验报告](../learning/checkpoints/Unit-3.html) | 约 2 小时 | 从消费者追踪改写首次发生的位置，给出独立预测、相邻阶段证据和交接记录 |

[基础专题](../learning/checkpoints/Unit-4.md)、[专题一](../learning/checkpoints/Unit-1.md)、[专题二](../learning/checkpoints/Unit-2.md)、[专题三](../learning/checkpoints/Unit-3.md)综合作答记录均为待答。原日课供回看具体讲解和原答。

## 笔记索引

| 天 | 教学与答题页 | 应当能交付什么 |
| --- | --- | --- |
| 1 | [SelectionDAG 基线](../learning/checkpoints/P1-C1.html) | 从 IR 构图追到目标指令 |
| 2 | [相邻输入盲预测](../learning/checkpoints/P1-C2.html) | 解释移位量来源影响哪项匹配条件 |
| 3 | [GlobalISel 对照](../learning/checkpoints/P2-C1.html) | 用两条管线的阶段证据评审结论 |
| 4 | [加法立即数的受控变体](../learning/checkpoints/P2-C2.html) | 对齐相邻常量的 MIR 与汇编 |
| 5 | [对齐与容量的边界反例](../learning/checkpoints/P2-C3.html) | 用两组正反例区分两个编码条件 |
| 6 | [乘积消费者的迁移练习](../learning/checkpoints/P3-C1.html) | 独立定位源码并预测首次出现的阶段 |
| 7 | [复验、短报告与交接](../learning/checkpoints/P3-C2.html) | 写出可复验的结论和未解决问题 |

- [第 1 天环境和复验命令](day1.md)
- [窄、宽减法对照 IR](../experiments/day1-sub.ll)
- [最小 IR](../experiments/add-shift.ll)

## 打开可保存的课程

整节课可在 VS Code 中以 **Learning Checkpoint** 自定义编辑器打开。安装 [项目扩展](../tools/vscode-learning-editor/) 后，从资源管理器打开当前课程 HTML。在渲染后的答题框填写，按 `Cmd+S`（Windows/Linux 用 `Ctrl+S`）保存原 HTML。已打开的标签页可用 **Reopen Editor With… → Learning Checkpoint** 切换。该方式无需启动 HTTP 服务。

在 VS Code 的 Text Editor 中，直接打开 [教学 HTML 源文件](../learning/checkpoints/Unit-1.html)，搜索「作答区」，在对应的 `<textarea ...>` 和 `</textarea>` 之间写入答案，再正常保存。无需启动服务。写到字面量 `</textarea>` 时，用 `&lt;/textarea&gt;` 表示它。

在 VS Code 的终端里从项目根目录运行 `python3 learning/serve.py`，在命令面板运行 **Browser: Open Integrated Browser**，粘贴终端显示的完整 `http://127.0.0.1:8765/...` 地址。作答会自动保存到当前教学 HTML，重新打开可以接着写。以后可从同一个地址下打开其他 `learning/checkpoints/` 页面。直接打开 HTML 文件适合阅读，从可写页面作答时以「已写入原 HTML」状态为准。服务暂时不可用时，同一浏览器、同一地址下可恢复草稿并自动重试。

## Work 历史

`.foundation/events.jsonl` 是 RepoFoundry 工程事件的 Git 归档，包含 Work、验证条件、检查点和证据引用。学习作答和评估继续保存在 `learning/checkpoints/`。SQLite 运行库和实验生成物由 Git 忽略。

写入 Work 后，在项目根目录刷新归档，然后将 JSONL 与相关项目变更一起提交。先写临时文件，导出成功后再替换归档。

```sh
snapshot_tmp=$(mktemp .foundation/events.jsonl.XXXXXX) &&
  if .venv/bin/repofoundry events export --project . > "$snapshot_tmp"; then
    mv "$snapshot_tmp" .foundation/events.jsonl
  else
    rm -f "$snapshot_tmp"
    false
  fi
```

新检出的工作区安装好 RepoFoundry 后，可从归档恢复本地事件库，再读取当前 Work。重复导入同一批事件会按事件 ID 去重。

```sh
.venv/bin/repofoundry events import .foundation/events.jsonl --project .
.venv/bin/repofoundry context --project .
```
