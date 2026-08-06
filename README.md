# 多语言翻译核对 Skill

这个仓库现在的主要用途，不再只是“放规则和模板”，而是提供一个可安装的 Codex skill。

同事安装后，在 AI 对话框里输入一个待检文件夹路径，skill 会按既定宽审核标准自动执行翻译核对，并把两个最终结果表直接输出回原文件夹：

- `检验进度台账.xlsx`
- `未通过项.xlsx`

## 现在的正确使用方式

1. 先安装 skill
2. 在对话框里输入待检文件夹路径
3. skill 自动扫描文件夹中的总览图和模板图
4. skill 自动筛出“总览中已通过、但状态仍未审核”的模板
5. skill 自动开始核对
6. skill 完成后把两个 Excel 写回原文件夹

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

如果你只想先知道审核标准，再看：

- [审核标准与流程](./docs/审核标准与流程.md)

## 输入文件夹要求

为了让 skill 稳定工作，建议待检文件夹满足这些条件：

- 文件夹顶层直接放本轮待检图片，不要再套子文件夹
- 同一个文件夹里同时放总览图和待检模板图
- 总览图文件名最好包含 `总览`、`预览`、`overview`、`ledger`、`台账`、`汇总` 这类关键词
- 文件夹里只放本轮需要审核的图片，避免混入历史批次

## 最终输出规则

skill 完成后会把结果写回原文件夹：

- `检验进度台账.xlsx`
- `未通过项.xlsx`

其中：

- 所有审核项都会进入 `检验进度台账.xlsx`
- 只有 `未通过` 项会进入 `未通过项.xlsx`
- `未通过项.xlsx` 里必须直接带中文图和外文图，不能只放图片编号

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
- 如果输入文件夹里缺少总览图，或总览图无法识别审核范围，skill 会停下来提示补信息。
