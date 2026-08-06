# Review Standards

Use these rules every time this skill reviews template translation images.

## Batch logic

The user will only provide one folder. The skill must determine the batch mode on its own.

Important operational detail:

- The user may replace the overview image and the PNG image set before every new batch.
- The current folder should therefore be treated as the latest batch snapshot.
- Do not assume older image files are still present.
- The workbooks carry the history across batches.

### First-batch mode

If no existing ledger workbook is present in the folder:

1. Inspect the overview image.
2. Identify templates clearly marked as accepted.
3. Build ledger rows for those accepted templates.
4. Treat those newly created rows as the current review batch.

### Follow-up batch mode

If an existing ledger workbook is present in the folder:

1. Read the existing ledger workbook.
2. Inspect the overview image.
3. Find templates clearly marked as accepted in the overview image.
4. Add any accepted template that is missing from the ledger as a new ledger row with pending status.
5. Review only ledger rows that are still pending.

In other words:

- no ledger -> create one from overview-accepted templates,
- existing ledger -> reuse it, add newly accepted templates, and review only pending rows.

## Per-language batch tracking

- Each language keeps its own running batch labels in the ledger.
- When a language enters the ledger for the first time, assign the newly added rows to `第1批`.
- On later runs for that language, read the existing ledger, find the highest existing batch number for that language, and assign newly accepted templates that are still missing from the ledger to `第N+1批`.
- Keep the original batch label on old rows even when they are reviewed later.
- Before the detailed review starts, state clearly which batch this run is for that language, for example `英文第2批审核`.

## Scope filter

Only review templates that satisfy the workflow scope for the current batch:

1. The overview image clearly marks the template as accepted.
2. The template is pending in the ledger, or it is newly accepted and not yet present in the ledger.
3. The template's current Chinese image and current target-language image can both be found in the current folder.

Do not review templates outside that scope.

If a ledger row is still pending but the current folder no longer contains the images needed to review it, keep that row as pending and do not force a result.

## Ledger status meanings

- `未审核`: pending review in the current or a future batch
- `通过`: reviewed and passed
- `未通过`: reviewed and failed

## Review baseline

- Use the Chinese template image as the baseline.
- Apply a lenient review standard.
- Focus only on issues that materially affect correctness, safety, or readability.
- Do not fail a template for minor phrasing polish or native-speaker style preferences.

## Allowed issue categories

1. `①中文没翻译干净 / 其他语言残留`
2. `②词语翻译错误`
3. `③可改可不改，建议修改`

## Pass / fail rule

- If category 1 or category 2 appears anywhere in the template, mark the template as `未通过`.
- If the template only has category 3 suggestions, mark the template as `通过`.
- Category 3 items stay in the ledger remarks only and do not enter `未通过项.xlsx`.

## Language rules

- Each target-language template should contain one primary language.
- Small amounts of English are acceptable inside other foreign-language templates when they are common product names, software names, abbreviations, or internationally common terms.
- Do not fail a template for a small amount of acceptable English if reading is unaffected.

## Ambiguous translation rule

- Different translation tools may produce different valid wording.
- If wording is ambiguous, check whether the target-language expression is acceptable and readable.
- Accept one-to-many translation variants if meaning remains correct enough for reading.
- Do not overcall a failure for style-only differences.

## Sensitive content rule

Fail the template if it clearly introduces:

- politically sensitive wording,
- country-specific sensitive topics,
- or other content that obviously conflicts with the target-language market context.

## UI residue rule

Ignore purely visual borders or non-text decorative UI elements.

Fail the template under category 1 if the delivered image still contains visible non-target-language UI text such as:

- Chinese toolbars,
- Chinese tabs,
- Chinese status bars,
- Chinese buttons,
- or other obvious non-target-language interface text.

## Fail workbook requirements

For every failed template:

- include the batch label,
- include the Chinese template image,
- include the target-language template image,
- include the assignee,
- include the template name,
- and keep `问题说明` and `修改意见` numbered one-to-one.

`修改意见` must always be explicit and directly actionable in the form:

`原文 -> 建议改为`
