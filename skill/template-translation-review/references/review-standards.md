# Review Standards

Use these rules every time this skill reviews template translation images.

## Scope filter

Only review templates that satisfy both conditions:

1. The overview image clearly marks the template as `审核通过`, `验收通过`, or an equivalent accepted status.
2. The overview/ledger status still shows `未审核`.

Do not review templates outside that scope.

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
- If the template only has category 3 suggestions, mark it as `通过`.
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

- include the Chinese template image,
- include the target-language template image,
- include the assignee,
- include the template name,
- and keep `问题说明` and `修改意见` numbered one-to-one.

`修改意见` must always be explicit and directly actionable in the form:

`原文 -> 建议改为`
