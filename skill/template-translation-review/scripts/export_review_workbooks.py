#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from copy import copy
from pathlib import Path

from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from PIL import Image as PILImage


THIN_GREY = Side(style="thin", color="D9D9D9")
HEADER_FILL = PatternFill("solid", fgColor="D9EAF7")
TITLE_FILL = PatternFill("solid", fgColor="1F4E78")
FAIL_FILL = PatternFill("solid", fgColor="FDE2E1")
FAIL_CATEGORY_FILL = PatternFill("solid", fgColor="FDECEC")
PASS_FILL = PatternFill("solid", fgColor="E7F4EA")
SUGGEST_FILL = PatternFill("solid", fgColor="FFF3CD")
PLACEHOLDER_FILL = PatternFill("solid", fgColor="F7F9FC")


def border_all() -> Border:
    return Border(left=THIN_GREY, right=THIN_GREY, top=THIN_GREY, bottom=THIN_GREY)


def merge_title(sheet, cell_range: str, title: str, subtitle: str) -> None:
    sheet.merge_cells(cell_range)
    cell = sheet[cell_range.split(":")[0]]
    cell.value = f"{title}\n{subtitle}"
    cell.fill = TITLE_FILL
    cell.font = Font(bold=True, color="FFFFFF", size=15)
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = border_all()


def style_header_row(sheet, row_index: int, end_col: int) -> None:
    for column in range(1, end_col + 1):
        cell = sheet.cell(row=row_index, column=column)
        cell.fill = HEADER_FILL
        cell.font = Font(bold=True, color="16324F")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_all()


def style_table_range(sheet, start_row: int, end_row: int, end_col: int) -> None:
    for row in range(start_row, end_row + 1):
        for column in range(1, end_col + 1):
            cell = sheet.cell(row=row, column=column)
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            cell.border = border_all()


def set_widths(sheet, widths: list[float]) -> None:
    for index, width in enumerate(widths, start=1):
        sheet.column_dimensions[get_column_letter(index)].width = width


def add_meta_sheet(workbook: Workbook, title: str, notes: list[tuple[str, str]]) -> None:
    sheet = workbook.create_sheet("填写说明")
    merge_title(sheet, "A1:D1", title, "先看说明，再开始填写")
    sheet["A3"] = "项目"
    sheet["B3"] = "说明"
    style_header_row(sheet, 3, 2)
    set_widths(sheet, [20, 72, 10, 10])

    for row_offset, (item, description) in enumerate(notes, start=4):
        sheet[f"A{row_offset}"] = item
        sheet[f"B{row_offset}"] = description
        sheet[f"A{row_offset}"].font = Font(bold=True, color="16324F")
        sheet[f"A{row_offset}"].alignment = Alignment(vertical="center", wrap_text=True)
        sheet[f"B{row_offset}"].alignment = Alignment(vertical="center", wrap_text=True)
        sheet[f"A{row_offset}"].border = border_all()
        sheet[f"B{row_offset}"].border = border_all()
        sheet.row_dimensions[row_offset].height = 32


def resize_for_excel(image_path: Path, max_width: int = 180, max_height: int = 110) -> XLImage:
    image = XLImage(str(image_path))
    with PILImage.open(image_path) as original:
        width, height = original.size
    ratio = min(max_width / width, max_height / height, 1)
    image.width = int(width * ratio)
    image.height = int(height * ratio)
    return image


def populate_ledger(workbook: Workbook, payload: dict[str, object]) -> None:
    summary = payload.get("batch_summary", {})
    rows = payload.get("ledger_rows", [])

    sheet = workbook.create_sheet("检验进度台账")
    merge_title(sheet, "A1:I1", "检验进度台账", "用于记录每一组模板的审核状态")
    sheet.freeze_panes = "A5"
    sheet["A3"] = "本次待审数量"
    sheet["C3"] = "预计完成时间"
    style_header_row(sheet, 3, 4)
    sheet["A4"] = summary.get("pending_count", "")
    sheet["C4"] = summary.get("estimated_completion", "")
    sheet["B4"] = ""
    sheet["D4"] = ""
    style_table_range(sheet, 4, 4, 4)

    headers = [
        "序号",
        "预览行号",
        "中文图编号",
        "外文图编号",
        "模板名称",
        "对应语种",
        "审核状态",
        "问题分类",
        "备注",
    ]
    for column, header in enumerate(headers, start=1):
        sheet.cell(row=6, column=column, value=header)
    style_header_row(sheet, 6, 9)

    start_row = 7
    for row_index, item in enumerate(rows, start=start_row):
        values = [
            item.get("sequence", ""),
            item.get("preview_row", ""),
            item.get("cn_image_id", ""),
            item.get("target_image_id", ""),
            item.get("template_name", ""),
            item.get("language", ""),
            item.get("status", ""),
            item.get("issue_category", ""),
            item.get("remark", ""),
        ]
        for column, value in enumerate(values, start=1):
            sheet.cell(row=row_index, column=column, value=value)
    end_row = max(start_row, start_row + len(rows) - 1)
    style_table_range(sheet, start_row, end_row, 9)

    status_validation = DataValidation(type="list", formula1='"通过,未通过"', allow_blank=True)
    category_validation = DataValidation(
        type="list",
        formula1='"无,①中文没翻译干净 / 其他语言残留,②词语翻译错误,③可改可不改，建议修改"',
        allow_blank=True,
    )
    sheet.add_data_validation(status_validation)
    sheet.add_data_validation(category_validation)
    if end_row >= start_row:
        status_validation.add(f"G{start_row}:G{end_row}")
        category_validation.add(f"H{start_row}:H{end_row}")

    set_widths(sheet, [8, 10, 10, 10, 34, 12, 12, 28, 42])
    for row_index in range(1, max(end_row, 18) + 1):
        if row_index >= 6:
            sheet.row_dimensions[row_index].height = 28
    sheet.row_dimensions[1].height = 42

    for row_index in range(start_row, end_row + 1):
        status = sheet[f"G{row_index}"].value
        category = sheet[f"H{row_index}"].value
        if status == "未通过":
            sheet[f"G{row_index}"].fill = FAIL_FILL
            sheet[f"G{row_index}"].font = Font(bold=True, color="A61B1B")
            sheet[f"H{row_index}"].fill = FAIL_CATEGORY_FILL
            sheet[f"H{row_index}"].font = Font(color="7F1D1D")
        elif category == "③可改可不改，建议修改":
            sheet[f"G{row_index}"].fill = SUGGEST_FILL
            sheet[f"G{row_index}"].font = Font(bold=True, color="8A5A00")
            sheet[f"H{row_index}"].fill = PatternFill("solid", fgColor="FFF8E5")
            sheet[f"H{row_index}"].font = Font(color="8A5A00")
        elif status == "通过":
            sheet[f"G{row_index}"].fill = PASS_FILL
            sheet[f"G{row_index}"].font = Font(bold=True, color="1F6B3A")


def populate_failures(workbook: Workbook, payload: dict[str, object]) -> None:
    rows = payload.get("fail_rows", [])
    sheet = workbook.create_sheet("未通过项")
    merge_title(sheet, "A1:M1", "未通过项", "问题说明和修改意见必须按编号一一对应")
    sheet.freeze_panes = "A4"

    headers = [
        "序号",
        "领取人",
        "预览行号",
        "中文图编号",
        "外文图编号",
        "模板名称",
        "对应语种",
        "中文模板图（粘贴实际图片）",
        "外文模板图（粘贴实际图片）",
        "审核结论",
        "问题分类",
        "问题说明",
        "修改意见",
    ]
    for column, header in enumerate(headers, start=1):
        sheet.cell(row=3, column=column, value=header)
    style_header_row(sheet, 3, 13)

    start_row = 4
    for row_index, item in enumerate(rows, start=start_row):
        values = [
            item.get("sequence", ""),
            item.get("assignee", ""),
            item.get("preview_row", ""),
            item.get("cn_image_id", ""),
            item.get("target_image_id", ""),
            item.get("template_name", ""),
            item.get("language", ""),
            "",
            "",
            item.get("review_conclusion", "未通过"),
            item.get("issue_category", ""),
            item.get("problem_description", ""),
            item.get("fix_suggestion", ""),
        ]
        for column, value in enumerate(values, start=1):
            sheet.cell(row=row_index, column=column, value=value)
    end_row = max(start_row, start_row + len(rows) - 1)
    style_table_range(sheet, start_row, end_row, 13)

    conclusion_validation = DataValidation(type="list", formula1='"未通过"', allow_blank=False)
    category_validation = DataValidation(
        type="list",
        formula1='"①中文没翻译干净 / 其他语言残留,②词语翻译错误,①中文没翻译干净 / 其他语言残留 + ②词语翻译错误"',
        allow_blank=True,
    )
    sheet.add_data_validation(conclusion_validation)
    sheet.add_data_validation(category_validation)
    if end_row >= start_row:
        conclusion_validation.add(f"J{start_row}:J{end_row}")
        category_validation.add(f"K{start_row}:K{end_row}")

    set_widths(sheet, [8, 12, 10, 10, 10, 24, 12, 24, 24, 12, 30, 44, 50])
    sheet.row_dimensions[1].height = 42
    for row_index in range(start_row, max(end_row, 9) + 1):
        sheet.row_dimensions[row_index].height = 90
        for col in ("H", "I"):
            sheet[f"{col}{row_index}"].fill = PLACEHOLDER_FILL
            sheet[f"{col}{row_index}"].alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            sheet[f"{col}{row_index}"].border = border_all()
            if not sheet[f"{col}{row_index}"].value:
                sheet[f"{col}{row_index}"] = "图片嵌入后显示"
        sheet[f"J{row_index}"].fill = FAIL_FILL
        sheet[f"J{row_index}"].font = Font(bold=True, color="A61B1B")
        sheet[f"K{row_index}"].fill = FAIL_CATEGORY_FILL
        sheet[f"K{row_index}"].font = Font(color="7F1D1D")

    for row_index, item in enumerate(rows, start=start_row):
        cn_path = item.get("cn_image_path")
        if cn_path and Path(cn_path).exists():
            image = resize_for_excel(Path(cn_path))
            sheet.add_image(image, f"H{row_index}")
            sheet[f"H{row_index}"] = ""
        target_path = item.get("target_image_path")
        if target_path and Path(target_path).exists():
            image = resize_for_excel(Path(target_path))
            sheet.add_image(image, f"I{row_index}")
            sheet[f"I{row_index}"] = ""


def build_workbook(payload: dict[str, object], kind: str) -> Workbook:
    workbook = Workbook()
    default_sheet = workbook.active
    workbook.remove(default_sheet)

    if kind == "ledger":
        add_meta_sheet(
            workbook,
            "检验进度台账模板",
            [
                ("用途", "记录本轮待审模板的审核状态和总体备注。"),
                ("审核前必填", "先填写本次待审模板数量和预计完成时间。"),
                ("状态规则", "只要有①中文/其他语言残留或②词语翻译错误，即判未通过。"),
                ("通过规则", "仅存在③可改可不改，建议修改时，按通过处理。"),
                ("交付要求", "通过项只更新台账；未通过项再同步写入未通过项。"),
            ],
        )
        populate_ledger(workbook, payload)
    else:
        add_meta_sheet(
            workbook,
            "未通过项模板",
            [
                ("用途", "仅记录判定为未通过的模板。"),
                ("必须贴图", "中文模板图和外文模板图列必须直接粘贴或插入实际图片，不能只写图片编号。"),
                ("编号说明", "中文图编号和外文图编号仅用于快速定位原图，不能替代图片列。"),
                ("问题说明", "必须编号，且每条只写一个具体问题。"),
                ("修改意见", "必须与问题说明同编号，一一对应，并直接写“原文 -> 建议改为”。"),
            ],
        )
        populate_failures(workbook, payload)
    return workbook


def load_payload(json_path: Path) -> dict[str, object]:
    return json.loads(json_path.read_text(encoding="utf-8-sig"))


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export translation review results into 检验进度台账.xlsx and 未通过项.xlsx."
    )
    parser.add_argument("input_json", help="JSON file that follows references/output-schema.md")
    parser.add_argument("output_dir", help="Folder where the two workbooks should be saved")
    args = parser.parse_args()

    input_json = Path(args.input_json).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    payload = load_payload(input_json)

    ledger_workbook = build_workbook(payload, "ledger")
    fail_workbook = build_workbook(payload, "fail")

    ledger_path = output_dir / "检验进度台账.xlsx"
    fail_path = output_dir / "未通过项.xlsx"
    ledger_workbook.save(ledger_path)
    fail_workbook.save(fail_path)

    print(str(ledger_path))
    print(str(fail_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
