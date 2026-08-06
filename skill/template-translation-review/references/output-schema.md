# Output Schema

Before exporting the two workbooks, assemble one JSON object that follows this structure.

## Required output files

- `检验进度台账.xlsx`
- `未通过项.xlsx`

Both files must be written into the same folder that the user provided.

## JSON shape

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

## Rules

- `run_mode` should be `first_batch` when no prior ledger exists, otherwise `followup_batch`.
- `current_batch_label` should be the batch label assigned to newly added templates in this run, such as `第1批` or `第2批`.
- `current_batch_count` must be the number of rows actually reviewed in this run.
- `estimated_completion` should be the estimate announced before the detailed review.
- `ledger_rows` must be the full final ledger state after merging old rows, newly accepted overview rows, and this run's review results.
- Every ledger row must include `review_batch`.
- `ledger_rows` may contain `未审核`, `通过`, and `未通过`.
- `fail_rows` should be the full final fail workbook state after merging old failures and this run's new failures.
- Every fail row must include `review_batch`.
- If there are no failures, keep `fail_rows` as an empty array.
- `problem_description` and `fix_suggestion` must use the same numbering.
- Every item in `problem_description` must have a matching item in `fix_suggestion`.
- `cn_image_path` and `target_image_path` should be absolute local file paths whenever possible.
- If a pending row remains in the ledger because the current folder snapshot does not contain the needed images, keep that row in `ledger_rows` with status `未审核`.
