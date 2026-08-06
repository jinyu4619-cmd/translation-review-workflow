# Output Schema

Before exporting the two workbooks, assemble a JSON object that follows this structure.

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
    "pending_count": 12,
    "estimated_completion": "约 35 分钟"
  },
  "ledger_rows": [
    {
      "sequence": 1,
      "preview_row": 3,
      "cn_image_id": "101",
      "target_image_id": "102",
      "template_name": "新房交接检查表",
      "language": "英文",
      "status": "通过",
      "issue_category": "无",
      "remark": "宽标准通过"
    }
  ],
  "fail_rows": [
    {
      "sequence": 1,
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
      "problem_description": "1. 分类：词语翻译错误。...\\n2. 分类：词语翻译错误。...",
      "fix_suggestion": "1. 分类：词语翻译错误。原文 -> 建议改为...\\n2. 分类：词语翻译错误。原文 -> 建议改为..."
    }
  ]
}
```

## Rules

- `pending_count` must be the number of templates actually reviewed in this batch.
- `estimated_completion` should be the estimate announced before the detailed review.
- `ledger_rows` must include every reviewed template, including pass items and fail items.
- `fail_rows` must include only templates marked `未通过`.
- If there are no failures, keep `fail_rows` as an empty array.
- `problem_description` and `fix_suggestion` must use the same numbering.
- Every item in `problem_description` must have a matching item in `fix_suggestion`.
- `cn_image_path` and `target_image_path` should be absolute local file paths whenever possible.
