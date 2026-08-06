---
name: template-translation-review
description: Review a local folder that contains template translation images plus one or more overview images, then automatically produce the workflow's two final Excel outputs back into that same folder. Use when a user gives a folder path and wants Codex to apply the established multilingual template-translation review workflow, detect whether a prior ledger already exists, continue across multiple batches, perform a lenient translation audit against the Chinese baseline, and export the final ledger workbook plus the final fail workbook.
---

# Template Translation Review

Review a user-provided local folder of template images and overview images, then save the two final Excel outputs back into that same folder.

Read [references/review-standards.md](references/review-standards.md) at the start of every run.
Read [references/output-schema.md](references/output-schema.md) before assembling the export JSON.

## Current-folder rule

Treat the user folder as one language's ongoing review workspace.

- The user may replace the overview image and the PNG image set before every new batch.
- The current folder therefore represents the latest batch snapshot, not a permanent archive of all older images.
- The ledger workbook and the fail workbook are the long-term history.
- Review only templates whose current Chinese and target-language images can both be found in the current folder.
- If an older pending ledger row does not have matching current images in the current folder, keep it pending and do not force a review result.
- Track a persistent per-language batch label on every ledger row and every fail row, such as `第1批`, `第2批`, and `第3批`.
- If the current language has no prior ledger rows, newly accepted templates enter the ledger as `第1批`.
- If the current language already has ledger rows, add newly accepted templates that are missing from the ledger as the next batch for that language.
- Before the detailed review starts, explicitly tell the user which batch this run is for that language, such as `英文第2批审核`.

## Workflow

1. Confirm the folder path exists and is a local directory.
2. Run `scripts/scan_review_folder.py <folder>` first.
3. Inspect the overview-candidate images before inspecting individual template images.
4. Use the scan result to determine batch mode:
   - no existing ledger workbook -> first-batch mode,
   - existing ledger workbook -> follow-up batch mode.
5. Inspect the overview image and identify templates clearly marked as accepted.
6. Build or update the ledger:
   - in first-batch mode, create ledger rows for accepted templates,
   - in follow-up batch mode, read old ledger rows and add any newly accepted template that is missing from the ledger as `未审核`.
7. Define the current batch scope as ledger rows still marked `未审核`.
8. Build a working mapping between Chinese images and target-language images.
9. Use image content, image order, and overview context together. Do not pair purely by odd or even numbering.
10. Before the detailed review, tell the user:
    - how many templates will be reviewed in this batch,
    - and the estimated completion time.
11. Review each pending template against the Chinese baseline using the lenient standard in `references/review-standards.md`.
12. Update current-batch ledger rows from `未审核` to either `通过` or `未通过`.
13. Merge this run's new failures with any existing fail workbook rows.
14. Assemble one JSON object that follows `references/output-schema.md`.
15. Run `scripts/export_review_workbooks.py <json> <folder>` to write the two final Excel files.
16. Save both files into the same folder the user originally provided.

## Review Rules

- Treat the Chinese template image as the baseline.
- Use a lenient review standard.
- Fail the template only for materially wrong translation, obvious language residue, sensitive or political content, or similar high-signal issues.
- Accept one-to-many translation variants if they remain readable and basically correct.
- Allow small amounts of English inside other foreign-language templates when they are common terms and do not affect reading.
- Do not fail templates for style-only polish suggestions.

## Output Rules

- The ledger workbook is cumulative and should preserve old rows plus this batch's updated rows.
- The fail workbook is cumulative and should preserve old fail rows plus this batch's new fail rows.
- Every ledger row and every fail row must include the template's original review batch label for that language.
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

Run this at the start to inventory the folder, identify likely overview images, and inspect any existing ledger and fail workbooks.

### `scripts/export_review_workbooks.py`

Run this only after you have assembled the final merged review JSON.

## Expected User Request Pattern

Typical trigger examples:

- `Check this folder: C:\...\English-Test`
- `Use this workflow to review C:\...\some-language-folder`
- `Apply the template translation review workflow to this folder and save the result back into the same folder`

If the user only provides a folder path and the task context is template translation review, use this skill.
