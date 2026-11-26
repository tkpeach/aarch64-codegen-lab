# AArch64 CodeGen Lab

- 有已知正常版本时，以其行为链路为基线。新增兜底逻辑不得替代或绕过既有主路径，除非目标明确要求改变主路径。
- 新会话先读 [学习目标](notes/README.md#学习目标) 和 [当前状态](notes/README.md#当前状态)，若本地事件库尚未建立，按 [Work 历史](notes/README.md#work-历史) 恢复，再运行 `.venv/bin/repofoundry context --project .`，按 Work 中的待答路径读取学习记录。
- 用 `.venv/bin/repofoundry plugins resolve-work --project .` 发现插件，先读 `profile-learning` 的 `entry`，再从已安装包按当前任务读取相关插件和模板。
- 工程证据和验证进度写入 Work。答题交互在 [学习检查点目录](learning/checkpoints/) 使用 HTML，每节围绕一个机制提供先修讲解、可复验的实测对照或边界反例和源码阅读任务，再提供可集中填写的多题表单。后续课程可复用 `tools/vscode-learning-editor/`，从 VS Code 文件树打开网页答题并用普通保存写回同一个教学 HTML。浏览器入口可复用 `learning/serve.py` 和 `learning/answers.js`。每题用带唯一 `name` 的文本框，允许用要点、代码或短文自由表达。独立推理题的实测输出留待作答后核对。Markdown 检查点记录待答状态、学习者原回答和评估。按 [笔记索引](notes/README.md#笔记索引) 查找项目资料。

- 教学复验命令从项目根目录运行，工具通过 PATH 或环境变量选择，实验输入和脚本放在仓库可跟踪的路径下。生成的汇编、MIR、日志和目标文件统一写入 Git 忽略的 `evidence/`。RepoFoundry 的 SQLite 事件库保留在本地。更新 Work 后按 [Work 历史](notes/README.md#work-历史) 刷新 JSONL，并随相关项目变更纳入 Git。

- 学习者提出与课程有关的知识性问题后，把核对过的解释直接融入最相关的讲解、示例或对照，沿原有教学顺序组织。

- 题目默认提供可以直接使用的完整输入，以及预期的作答形式。若构造输入本身是学习目标，在题目中显式标明「自行构造输入」，并给出起点、允许的改动和需要提交的内容。

- 出题前先公开一条统领整组题的机制问题和预期综合产出。每个小问注明它为总问题提供哪部分证据，以及可从哪里查找。把源码符号作为可查的证据线索；评估重点是因果解释、阶段证据和能区分假设的有效对照。
