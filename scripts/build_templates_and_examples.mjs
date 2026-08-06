import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repoRoot = "C:/Users/ws/Desktop/翻译核对工作流_GitHub版";
const templatesDir = path.join(repoRoot, "templates");
const examplesDir = path.join(repoRoot, "examples");
const sampleImages = {
  cn105: path.join(examplesDir, "sample_cn", "sample_cn_105.png"),
  en106: path.join(examplesDir, "sample_target", "sample_en_106.png"),
  cn201: path.join(examplesDir, "sample_cn", "sample_cn_201.png"),
  en202: path.join(examplesDir, "sample_target", "sample_en_202.png"),
};

function mergeTitle(sheet, rangeA1, title, subtitle) {
  const range = sheet.getRange(rangeA1);
  range.merge();
  range.values = [[`${title}\n${subtitle}`]];
  range.format = {
    fill: "#1F4E78",
    font: { bold: true, color: "#FFFFFF", size: 15 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#1F4E78" },
  };
  range.format.rowHeight = 42;
}

function styleHeader(range) {
  range.format = {
    fill: "#D9EAF7",
    font: { bold: true, color: "#16324F" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#AFC6D9" },
  };
}

function styleBody(range) {
  range.format = {
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function colorStatusCells(sheet, startRow, rowCount, statusCol, categoryCol) {
  for (let row = 0; row < rowCount; row += 1) {
    const statusCell = sheet.getCell(startRow + row, statusCol);
    const categoryCell = sheet.getCell(startRow + row, categoryCol);
    const status = statusCell.values?.[0]?.[0];
    const category = categoryCell.values?.[0]?.[0];

    if (status === "未通过") {
      statusCell.format = {
        fill: "#FDE2E1",
        font: { bold: true, color: "#A61B1B" },
        horizontalAlignment: "center",
        verticalAlignment: "center",
        borders: { preset: "all", style: "thin", color: "#D9D9D9" },
      };
      categoryCell.format = {
        fill: "#FDECEC",
        font: { color: "#7F1D1D" },
        verticalAlignment: "center",
        wrapText: true,
        borders: { preset: "all", style: "thin", color: "#D9D9D9" },
      };
    } else if (category === "③可改可不改，建议修改") {
      statusCell.format = {
        fill: "#FFF3CD",
        font: { bold: true, color: "#8A5A00" },
        horizontalAlignment: "center",
        verticalAlignment: "center",
        borders: { preset: "all", style: "thin", color: "#D9D9D9" },
      };
      categoryCell.format = {
        fill: "#FFF8E5",
        font: { color: "#8A5A00" },
        verticalAlignment: "center",
        wrapText: true,
        borders: { preset: "all", style: "thin", color: "#D9D9D9" },
      };
    } else if (status === "通过") {
      statusCell.format = {
        fill: "#E7F4EA",
        font: { bold: true, color: "#1F6B3A" },
        horizontalAlignment: "center",
        verticalAlignment: "center",
        borders: { preset: "all", style: "thin", color: "#D9D9D9" },
      };
    }
  }
}

function addMetaSheet(workbook, title, notes) {
  const sheet = workbook.worksheets.add("填写说明");
  sheet.showGridLines = false;
  mergeTitle(sheet, "A1:D1", title, "先看说明，再开始填写");
  sheet.getRange("A3:B3").values = [["项目", "说明"]];
  styleHeader(sheet.getRange("A3:B3"));
  sheet.getRangeByIndexes(3, 0, notes.length, 2).values = notes;
  styleBody(sheet.getRangeByIndexes(3, 0, notes.length, 2));
  sheet.getRange(`A4:A${3 + notes.length}`).format.font = { bold: true, color: "#16324F" };
  sheet.getRange(`A3:B${3 + notes.length}`).format.rowHeight = 32;
  setWidths(sheet, [20, 72]);
  return sheet;
}

function styleImagePlaceholderCell(sheet, cellA1, text) {
  const range = sheet.getRange(cellA1);
  range.values = [[text]];
  range.format = {
    fill: "#F7F9FC",
    font: { color: "#5B6575", italic: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "dashed", color: "#B8C4D2" },
  };
}

async function fileToDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";
  const buffer = await fs.readFile(filePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function addEmbeddedImage(sheet, row, col, filePath, widthPx = 180, heightPx = 108) {
  const dataUrl = await fileToDataUrl(filePath);
  sheet.images.add({
    dataUrl,
    anchor: {
      from: { row, col, rowOffsetPx: 6, colOffsetPx: 6 },
      extent: { widthPx, heightPx },
    },
  });
}

async function ensureSampleImages() {
  for (const filePath of Object.values(sampleImages)) {
    await fs.access(filePath);
  }
}

async function exportWorkbook(workbook, filePath) {
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(filePath);
}

async function buildLedgerTemplate() {
  const workbook = Workbook.create();

  addMetaSheet(workbook, "检验进度台账模板", [
    ["用途", "记录本轮待审模板的审核状态和总体备注。"],
    ["审核前必填", "先填写本次待审模板数量和预计完成时间。"],
    ["状态规则", "只要有①中文/其他语言残留或②词语翻译错误，即判未通过。"],
    ["通过规则", "仅存在③可改可不改，建议修改时，按通过处理。"],
    ["交付要求", "通过项只更新台账；未通过项再同步写入未通过项模板。"],
  ]);

  const sheet = workbook.worksheets.add("检验进度台账");
  sheet.showGridLines = false;
  mergeTitle(sheet, "A1:I1", "检验进度台账", "用于记录每一组模板的审核状态");
  sheet.freezePanes.freezeRows(4);

  sheet.getRange("A3:D3").values = [["本次待审数量", "", "预计完成时间", ""]];
  styleHeader(sheet.getRange("A3:D3"));
  styleBody(sheet.getRange("A4:D4"));
  sheet.getRange("A4:D4").values = [["请填写", "", "请填写", ""]];

  sheet.getRange("A6:I6").values = [[
    "序号",
    "预览行号",
    "中文图编号",
    "外文图编号",
    "模板名称",
    "对应语种",
    "审核状态",
    "问题分类",
    "备注",
  ]];
  styleHeader(sheet.getRange("A6:I6"));

  const blankRows = Array.from({ length: 12 }, (_, index) => [
    index + 1,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  sheet.getRangeByIndexes(6, 0, blankRows.length, 9).values = blankRows;
  styleBody(sheet.getRangeByIndexes(6, 0, blankRows.length, 9));
  sheet.getRange("A7:A18").format.horizontalAlignment = "center";
  sheet.getRange("B7:D18").format.horizontalAlignment = "center";
  sheet.getRange("G7:G18").format.horizontalAlignment = "center";
  sheet.getRange("G7:G18").dataValidation = {
    rule: { type: "list", values: ["通过", "未通过"] },
  };
  sheet.getRange("H7:H18").dataValidation = {
    rule: {
      type: "list",
      values: ["无", "①中文没翻译干净 / 其他语言残留", "②词语翻译错误", "③可改可不改，建议修改"],
    },
  };

  setWidths(sheet, [8, 10, 10, 10, 34, 12, 12, 28, 42]);
  sheet.getRange("A6:I18").format.rowHeight = 28;

  await exportWorkbook(workbook, path.join(templatesDir, "检验进度台账.xlsx"));
}

async function buildFailTemplate() {
  const workbook = Workbook.create();

  addMetaSheet(workbook, "未通过项模板", [
    ["用途", "仅记录判定为未通过的模板。"],
    ["必须贴图", "中文模板图和外文模板图列必须直接粘贴或插入实际图片，不能只写图片编号。"],
    ["编号说明", "中文图编号和外文图编号仅用于快速定位原图，不能替代图片列。"],
    ["问题说明", "必须编号，且每条只写一个具体问题。"],
    ["修改意见", "必须与问题说明同编号，一一对应，并直接写“原文 -> 建议改为”。"],
  ]);

  const sheet = workbook.worksheets.add("未通过项");
  sheet.showGridLines = false;
  mergeTitle(sheet, "A1:M1", "未通过项", "问题说明和修改意见必须按编号一一对应");
  sheet.freezePanes.freezeRows(3);

  sheet.getRange("A3:M3").values = [[
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
  ]];
  styleHeader(sheet.getRange("A3:M3"));

  const blankRows = Array.from({ length: 6 }, (_, index) => [
    index + 1,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "未通过",
    "",
    "",
    "",
  ]);
  sheet.getRangeByIndexes(3, 0, blankRows.length, 13).values = blankRows;
  styleBody(sheet.getRangeByIndexes(3, 0, blankRows.length, 13));
  sheet.getRange("A4:A9").format.horizontalAlignment = "center";
  sheet.getRange("C4:E9").format.horizontalAlignment = "center";
  sheet.getRange("J4:J9").format.horizontalAlignment = "center";
  sheet.getRange("J4:J9").dataValidation = {
    rule: { type: "list", values: ["未通过"] },
  };
  sheet.getRange("K4:K9").dataValidation = {
    rule: {
      type: "list",
      values: [
        "①中文没翻译干净 / 其他语言残留",
        "②词语翻译错误",
        "①中文没翻译干净 / 其他语言残留 + ②词语翻译错误",
      ],
    },
  };
  sheet.getRange("J4:J9").format = {
    fill: "#FDE2E1",
    font: { bold: true, color: "#A61B1B" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };
  sheet.getRange("K4:K9").format = {
    fill: "#FDECEC",
    font: { color: "#7F1D1D" },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };

  for (let row = 4; row <= 9; row += 1) {
    styleImagePlaceholderCell(sheet, `H${row}`, "在此粘贴中文模板图");
    styleImagePlaceholderCell(sheet, `I${row}`, "在此粘贴外文模板图");
  }

  setWidths(sheet, [8, 12, 10, 10, 10, 24, 12, 24, 24, 12, 30, 42, 46]);
  sheet.getRange("A3:M9").format.rowHeight = 118;

  await exportWorkbook(workbook, path.join(templatesDir, "未通过项.xlsx"));
}

async function buildLedgerExample() {
  const workbook = Workbook.create();

  addMetaSheet(workbook, "检验进度台账示例", [
    ["说明", "这是一份脱敏示例，仅用于演示填写方式。"],
    ["待审数量", "本示例为 3 组模板。"],
    ["预计完成时间", "示例填写为 30 分钟。"],
    ["提醒", "仅存在第③类建议项时，台账内仍判为通过。"],
  ]);

  const sheet = workbook.worksheets.add("检验进度台账");
  sheet.showGridLines = false;
  mergeTitle(sheet, "A1:I1", "检验进度台账示例", "展示通过、建议项通过和未通过三种写法");
  sheet.freezePanes.freezeRows(4);

  sheet.getRange("A3:D3").values = [["本次待审数量", 3, "预计完成时间", "30 分钟"]];
  styleHeader(sheet.getRange("A3:D3"));
  styleBody(sheet.getRange("A4:D4"));
  sheet.getRange("A4:D4").values = [["审核批次", "示例批次", "目标语种", "英文"]];

  sheet.getRange("A6:I6").values = [[
    "序号",
    "预览行号",
    "中文图编号",
    "外文图编号",
    "模板名称",
    "对应语种",
    "审核状态",
    "问题分类",
    "备注",
  ]];
  styleHeader(sheet.getRange("A6:I6"));

  const rows = [
    [1, 3, 101, 102, "新房交接检查表", "英文", "通过", "无", "宽标准通过"],
    [2, 4, 103, 104, "感冒 VS 流感护理对比", "英文", "通过", "③可改可不改，建议修改", "个别表达可更自然，但不影响阅读，按通过处理"],
    [3, 5, 105, 106, "夏季皮肤防晒全攻略", "英文", "未通过", "②词语翻译错误", "详见 sample_未通过项.xlsx"],
  ];
  sheet.getRangeByIndexes(6, 0, rows.length, 9).values = rows;
  styleBody(sheet.getRangeByIndexes(6, 0, rows.length, 9));
  sheet.getRange("A7:A9").format.horizontalAlignment = "center";
  sheet.getRange("B7:D9").format.horizontalAlignment = "center";
  sheet.getRange("G7:G9").format.horizontalAlignment = "center";
  setWidths(sheet, [8, 10, 10, 10, 34, 12, 12, 28, 42]);
  sheet.getRange("A6:I9").format.rowHeight = 32;
  colorStatusCells(sheet, 6, rows.length, 6, 7);

  await exportWorkbook(workbook, path.join(examplesDir, "sample_检验进度台账.xlsx"));
}

async function buildFailExample() {
  await ensureSampleImages();

  const workbook = Workbook.create();

  addMetaSheet(workbook, "未通过项示例", [
    ["说明", "这是一份脱敏示例，仅用于演示未通过项如何填写。"],
    ["图片要求", "示例表中已嵌入中文模板图和外文模板图；真实使用时也必须直接贴图。"],
    ["编号关系", "问题说明与修改意见必须编号且一一对应。"],
    ["领取人", "建议填写实际接手修改的人，方便分发和回查。"],
  ]);

  const sheet = workbook.worksheets.add("未通过项");
  sheet.showGridLines = false;
  mergeTitle(sheet, "A1:M1", "未通过项示例", "示例中已直接放入对应图片，不能只写编号");
  sheet.freezePanes.freezeRows(3);

  sheet.getRange("A3:M3").values = [[
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
  ]];
  styleHeader(sheet.getRange("A3:M3"));

  const rows = [
    [
      1,
      "张三",
      5,
      105,
      106,
      "夏季皮肤防晒全攻略",
      "英文",
      "",
      "",
      "未通过",
      "②词语翻译错误",
      "1. 分类：词语翻译错误。文案“Penetrating genuine leather”与防晒语境不符，属于明显错翻。\n2. 分类：词语翻译错误。文案“Dimension C, Dimension E, etc.”用词错误，应表达维生素成分。",
      "1. 分类：词语翻译错误。Penetrating genuine leather -> Penetrating deeper skin layers。\n2. 分类：词语翻译错误。Dimension C, Dimension E, etc. -> Vitamin C, Vitamin E, etc.",
    ],
    [
      2,
      "李四",
      9,
      201,
      202,
      "角色塑造：主角成长路线图",
      "英文",
      "",
      "",
      "未通过",
      "①中文没翻译干净 / 其他语言残留",
      "1. 分类：中文没翻译干净 / 其他语言残留。外文图顶部仍保留中文工具栏文字，属于明显中文残留。\n2. 分类：中文没翻译干净 / 其他语言残留。外文图底部仍保留中文状态栏文字，不属于模板正文内容。",
      "1. 分类：中文没翻译干净 / 其他语言残留。文件 / 编辑 / 视图 / 插入 -> 删除该工具栏区域后重新导出，仅保留模板正文画布。\n2. 分类：中文没翻译干净 / 其他语言残留。第 1 页 / 缩放 100% -> 裁掉底部状态栏，仅保留正文内容区域。",
    ],
  ];
  sheet.getRangeByIndexes(3, 0, rows.length, 13).values = rows;
  styleBody(sheet.getRangeByIndexes(3, 0, rows.length, 13));
  sheet.getRange("A4:A5").format.horizontalAlignment = "center";
  sheet.getRange("C4:E5").format.horizontalAlignment = "center";
  sheet.getRange("J4:J5").format.horizontalAlignment = "center";
  sheet.getRange("J4:J5").format = {
    fill: "#FDE2E1",
    font: { bold: true, color: "#A61B1B" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };
  sheet.getRange("K4:K5").format = {
    fill: "#FDECEC",
    font: { color: "#7F1D1D" },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };

  setWidths(sheet, [8, 12, 10, 10, 10, 24, 12, 24, 24, 12, 30, 44, 50]);
  sheet.getRange("A3:M5").format.rowHeight = 118;

  await addEmbeddedImage(sheet, 3, 7, sampleImages.cn105);
  await addEmbeddedImage(sheet, 3, 8, sampleImages.en106);
  await addEmbeddedImage(sheet, 4, 7, sampleImages.cn201);
  await addEmbeddedImage(sheet, 4, 8, sampleImages.en202);

  await exportWorkbook(workbook, path.join(examplesDir, "sample_未通过项.xlsx"));
}

async function cleanupInspectArtifacts() {
  const targets = [templatesDir, examplesDir];
  for (const dir of targets) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isFile() && item.name.endsWith(".inspect.ndjson")) {
        await fs.unlink(path.join(dir, item.name));
      }
    }
  }
}

async function main() {
  await fs.mkdir(templatesDir, { recursive: true });
  await fs.mkdir(examplesDir, { recursive: true });

  await buildLedgerTemplate();
  await buildFailTemplate();
  await buildLedgerExample();
  await buildFailExample();
  await cleanupInspectArtifacts();

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
