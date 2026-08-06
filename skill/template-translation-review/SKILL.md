---
name: template-translation-review
description: Review a local folder that contains template translation images plus one or more overview images, then automatically produce the workflow's two final Excel outputs back into that same folder. Use when a user gives a folder path and wants Codex to apply the established multilingual template-translation review workflow, filter only accepted-but-still-unreviewed templates from the overview image, perform a lenient translation audit against the Chinese baseline, and export the final ledger workbook plus the final fail workbook.
---

# Template Translation Review

Review a user-provided local folder of template images and overview images, then save the two final Excel outputs back into that same folder.

Read [references/review-standards.md](references/review-standards.md) at the start of every run.
Read [references/output-schema.md](references/output-schema.md) before assembling the export JSON.

## Workflow

1. Confirm the folder path exists and is a local directory.
2. Run `scripts/scan_review_folder.py <folder>` first.
3. Inspect the overview-candidate images before inspecting individual template images.
4. Filter the scope strictly:
   - only review templates clearly marked as accepted in the overview image,
   - and only when the overview or ledger status still shows the Chinese pending-review label.
5. Build a working mapping between Chinese images and target-language images.
6. Use image content, image order, and overview context together. Do not pair purely by odd or even numbering.
7. Before the detailed review, tell the user:
   - how many templates will be reviewed in this batch,
   - and the estimated completion time.
8. Review each template against the Chinese baseline using the lenient standard in `references/review-standards.md`.
9. If a translation is ambiguous, prefer an acceptability check over overcalling a failure.
10. Assemble one JSON object that follows `references/output-schema.md`.
11. Run `scripts/export_review_workbooks.py <json> <folder>` to write the two final Excel files.
12. Save both files into the same folder the user originally provided.

## Review Rules

- Treat the Chinese template image as the baseline.
- Use a lenient review standard.
- Fail the template only for materially wrong translation, obvious language residue, sensitive or political content, or similar high-signal issues.
- Accept one-to-many translation variants if they remain readable and basically correct.
- Allow small amounts of English inside other foreign-language templates when they are common terms and do not affect reading.
- Do not fail templates for style-only polish suggestions.

## Output Rules

- Put every reviewed template into the ledger workbook.
- Put only failed templates into the fail workbook.
- Always embed the actual Chinese and target-language images into the fail workbook. Never leave only image IDs.
- Keep the problem notes and fix suggestions numbered one-to-one.
- Write every fix suggestion as a direct actionable replacement in the form `original -> replace with`.

## When To Pause And Ask The User

Pause only when one of these blockers occurs:

- no overview image can be identified,
- the folder is missing the target-language image for a template,
- the image pairing is genuinely ambiguous after inspection,
- or the user-provided folder lacks enough information to determine the review scope.

When blocked, tell the user exactly what is missing.

## Scripts

### `scripts/scan_review_folder.py`

Run this at the start to inventory the folder and identify likely overview images.

### `scripts/export_review_workbooks.py`

Run this only after you have assembled the final review JSON.

## Expected User Request Pattern

Typical trigger examples:

- `Check this folder: C:\...\English-Test`
- `Use this workflow to review C:\...\some-language-folder`
- `Apply the template translation review workflow to this folder and save the result back into the same folder`

If the user only provides a folder path and the task context is template translation review, use this skill.
