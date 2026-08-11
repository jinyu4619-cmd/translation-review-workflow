# 输出结构

在导出两个 Excel 结果表之前，需要先组装一个符合本结构的 JSON 对象。

## 必须输出的文件

- `检验进度台账.xlsx`
- `未通过项.xlsx`

这两个文件都必须保存到用户最初提供的同一个文件夹中。

## JSON 结构示例

```json
{
  "batch_summary": {
    "source_folder": "C:/path/to/review-folder",
    "language": "英文",
    "run_mode": "first_batch",
    "current_batch_label": "第1批",
    "current_batch_count": 12,
    "estimated_completion": "约35分钟"
  },
  "ledger_rows": [
    {
      "sequence": 1,
      "review_batch": "第1批",
      "preview_row": 3,
      "cn_image_id": "101",
      "target_image_id": "102",
      "template_name": "新房交接检查表",
      "language": "英文",
      "status": "通过",
      "issue_category": "无",
      "remark": "宽标准通过"
    },
    {
      "sequence": 2,
      "review_batch": "第1批",
      "preview_row": 4,
      "cn_image_id": "103",
      "target_image_id": "104",
      "template_name": "下一批待审模板",
      "language": "英文",
      "status": "未审核",
      "issue_category": "无",
      "remark": "等待当前文件夹补齐图片"
    }
  ],
  "fail_rows": [
    {
      "sequence": 1,
      "review_batch": "第1批",
      "assignee": "张三",
      "preview_row": 5,
      "cn_image_id": "105",
      "target_image_id": "106",
      "template_name": "夏季皮肤防晒全攻略",
      "language": "英文",
      "cn_image_path": "C:/path/to/sample_cn_105.png",
      "target_image_path": "C:/path/to/sample_en_106.png",
      "review_conclusion": "未通过",
      "issue_category": "②词语翻译错误",
      "problem_description": "1. 分类：词语翻译错误。将“防晒”翻成了错误含义。",
      "fix_suggestion": "1. 分类：词语翻译错误。原文 `...` -> 建议改为 `...`。"
    }
  ]
}
```

## 字段规则

- `run_mode`：
  - 没有历史台账时填 `first_batch`
  - 有历史台账时填 `followup_batch`
- `current_batch_label`：
  - 本次新增进入台账的模板属于哪一批，就填哪一批，例如 `第1批`、`第2批`
- `current_batch_count`：
  - 必须是本次实际审核的模板数量
- `estimated_completion`：
  - 必须与正式细审前告知用户的预计完成时间一致

## 台账数据规则

- `ledger_rows` 必须是最终完整台账，不是只放本次新增行。
- 它应包含：
  - 历史台账保留下来的旧行；
  - 本次根据当前文件夹新增进入台账的行；
  - 本次审核后更新状态的行。
- 每一条 `ledger_rows` 记录都必须带 `review_batch`。
- `status` 允许的值只有：
  - `未审核`
  - `通过`
  - `未通过`

## 未通过数据规则

- `fail_rows` 必须是最终完整未通过表，不是只放本次新增未通过项。
- 它应包含：
  - 历史未通过项；
  - 本次新增未通过项。
- `fail_rows` 的顺序必须保持“旧记录在前，新记录在后”。
- 也就是说，历史未通过项要先按原顺序保留，再把本次新增未通过项追加在最后，导出后才能体现在旧表下面继续续写。
- 如果同一个模板在后续批次里再次审核未通过，不要删除旧记录；要保留旧记录，并把新一批未通过记录继续追加在后面。
- 每一条 `fail_rows` 记录都必须带 `review_batch`。
- 每一条 `fail_rows` 记录都必须完整填写，不允许关键字段留空。
- 其中以下字段必须非空：
  - `review_batch`
  - `assignee`
  - `template_name`
  - `cn_image_path`
  - `target_image_path`
  - `review_conclusion`
  - `issue_category`
  - `problem_description`
  - `fix_suggestion`
- 如果本次和历史累计后都没有未通过项，就保持空数组 `[]`。

## 文案规则

- `problem_description` 和 `fix_suggestion` 必须使用相同编号。
- `problem_description` 里有几条问题，`fix_suggestion` 里就必须有几条对应修改意见。
- `fix_suggestion` 必须写成可直接执行的明确修改，尽量使用：
  - `原文 -> 建议改为`

## 图片路径规则

- `cn_image_path` 和 `target_image_path` 尽量使用绝对本地路径。
- 如果某条记录进入 `fail_rows`，应尽量保证后续导出时能把真实图片嵌入 Excel。

## 导出后自检规则

- 导出 `未通过项.xlsx` 后，必须再自行检查一遍未通过表。
- 重点检查表中每条记录的必填字段是否完整，尤其是 `领取人` 这类容易漏填的信息。
- 如果发现空白单元格、漏填项、明显缺项或缺图，不能直接交付。
- 必须先回补数据，再重新导出或覆盖原结果文件，直到表头信息和记录信息完整为止。

## 保留未审核的情况

如果某条记录仍保留在台账里，但当前文件夹快照中已找不到本次审核所需图片，则该记录可以继续保留在 `ledger_rows` 中，且 `status` 维持为 `未审核`。
