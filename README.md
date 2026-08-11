# 多语言翻译核对 Skill

这个仓库提供的是一个可安装的 Codex skill，不只是规则文档。

同事安装后，只要在 AI 对话框里输入一个待审文件夹路径，skill 就会直接按既定宽审核标准执行翻译核对，并把两个结果表输出回原文件夹：

- `检验进度台账.xlsx`
- `未通过项.xlsx`

## 现在的正确使用方式

1. 先安装 skill。
2. 准备一个“当前批次待审模板”文件夹。
3. 如果是后续批次，把上一次生成的 `检验进度台账.xlsx` 和 `未通过项.xlsx` 一起保留在该文件夹内。
4. 在对话框里输入文件夹路径。
5. skill 直接把当前文件夹中的模板图作为本批待审范围开始核对，不再依赖总览图筛选“审核通过”模板。
6. skill 完成后把两个 Excel 写回原文件夹。

## skill 入口

真正需要安装的内容在：

- [skill/template-translation-review](./skill/template-translation-review)

其中最核心的文件是：

- [SKILL.md](./skill/template-translation-review/SKILL.md)
- [scan_review_folder.py](./skill/template-translation-review/scripts/scan_review_folder.py)
- [export_review_workbooks.py](./skill/template-translation-review/scripts/export_review_workbooks.py)

## 安装与使用

先看：

- [安装与使用](./docs/安装与使用.md)
- [快速开始](./docs/快速开始.md)

如果你只想先看审核标准，再看：

- [审核标准与流程](./docs/审核标准与流程.md)

## 输入文件夹要求

为了让 skill 稳定工作，建议待审文件夹满足这些条件：

- 一个文件夹只放一个语种的内容。
- 文件夹里以本批次待审模板图为主，不要混入无关截图或其他语种图片。
- 文件夹顶层直接放图片即可，也允许递归扫描子文件夹里的图片。
- 总览图可以有，但现在只作为辅助参考，不再决定审核范围。
- 如果是后续批次，尽量保留上一次生成的 `检验进度台账.xlsx` 和 `未通过项.xlsx`。

## 最终输出规则

skill 完成后会把结果写回原文件夹：

- `检验进度台账.xlsx`
- `未通过项.xlsx`

其中：

- 所有审核项都会进入 `检验进度台账.xlsx`。
- 只有 `未通过` 项会进入 `未通过项.xlsx`。
- `未通过项.xlsx` 里必须直接带中文图和外文图，不能只放图片编号。
- 后续批次新增的未通过项，会继续追加在旧的 `未通过项.xlsx` 下面，不删除历史未通过记录。

## 当前仓库结构

```text
translation-review-workflow/
├─ README.md
├─ docs/
├─ examples/
├─ templates/
├─ scripts/
├─ outputs/
└─ skill/
   └─ template-translation-review/
```

## 目录说明

- `skill/`
  - 真正要安装的 skill
- `docs/`
  - 安装说明、使用说明、审核标准
- `examples/`
  - 脱敏示例图和示例 Excel
- `templates/`
  - 参考模板
- `scripts/`
  - 仓库级辅助脚本

## 补充说明

- 当前 skill 骨架、扫描脚本、Excel 导出脚本都已补好并通过本地验证。
- 审核结论仍然由 Codex 按 skill 规则判断，不是纯脚本死判断。
- 现在即使没有总览图，只要当前文件夹里有可配对的中文图和外文图，也可以直接开始审核。
