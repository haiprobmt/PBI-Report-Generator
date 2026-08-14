import type { KnowledgeBase, ReportConfigurationSpec, ReportRequirements } from './types';
import type { AppLanguage } from './types';
import { formatRequirementsBrief } from './requirements';

function safeName(value: string, fallback: string) {
  const normalized = value.replace(/[\r\n,]+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function generateSampleCsv(knowledgeBase: KnowledgeBase, language: AppLanguage = 'en') {
  const dateFallback = language === 'vi' ? 'Ngày' : 'Date';
  const categoryFallback = language === 'vi' ? 'Danh mục' : 'Category';
  const metricFallback = language === 'vi' ? ['KPI chính', 'Mục tiêu'] : ['Primary KPI', 'Target'];
  const dateField = safeName(knowledgeBase.dateFields[0] || dateFallback, dateFallback);
  const dimensions = (knowledgeBase.dimensions.length ? knowledgeBase.dimensions : [categoryFallback])
    .slice(0, 2)
    .map((value, index) => safeName(value, `${categoryFallback} ${index + 1}`));
  const metrics = (knowledgeBase.metrics.length ? knowledgeBase.metrics : metricFallback)
    .slice(0, 4)
    .map((value, index) => safeName(value, `Metric ${index + 1}`));
  const headers = [dateField, ...dimensions, ...metrics];
  const categories = ['North', 'South', 'East', 'West'];
  const rows = Array.from({ length: 12 }, (_, index) => [
    `2026-${String(index + 1).padStart(2, '0')}-01`,
    ...dimensions.map((_, dimensionIndex) => categories[(index + dimensionIndex) % categories.length]),
    ...metrics.map((_, metricIndex) => 900 + (index * 137) + (metricIndex * 211)),
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

function textNode(id: string, content: string, x: number, y: number, width: number, fontSize = 14, fill = '#1F2937') {
  return { id, type: 'text', content, x, y, width, height: fontSize * 1.5, fontFamily: 'Inter', fontSize, fill };
}

export function generatePenDocument(config: ReportConfigurationSpec, knowledgeBase: KnowledgeBase, language: AppLanguage = 'en') {
  const page = config.pages[0];
  if (!page) throw new Error('A report page is required to build the pen.dev workspace.');
  const foreground = config.theme.foreground || '#1F2937';
  const background = config.theme.background || '#FFFFFF';
  const accent = config.theme.dataColors[0] || '#4F46E5';
  const children: Record<string, unknown>[] = [
    {
      id: 'report-header',
      type: 'frame',
      name: 'Report Header',
      x: 0,
      y: 0,
      width: page.width,
      height: page.reportHeader.height,
      fill: page.reportHeader.backgroundColor || accent,
      layout: 'none',
      children: [textNode('report-title', page.reportHeader.titleText || config.reportName, 24, 17, page.width - 48, 24, '#FFFFFF')],
    },
  ];

  page.slicers.forEach((slicer, index) => {
    children.push({
      id: `slicer-${index + 1}`,
      type: 'frame',
      name: `Slicer · ${slicer.label}`,
      x: slicer.x,
      y: slicer.y,
      width: slicer.width,
      height: slicer.height,
      fill: '#F8FAFC',
      stroke: { fill: '#CBD5E1', thickness: 1 },
      cornerRadius: 6,
      layout: 'none',
      metadata: { type: 'power-bi-slicer', field: slicer.field || '' },
      children: [textNode(`slicer-label-${index + 1}`, slicer.label, 12, 12, slicer.width - 24, 12, foreground)],
    });
  });

  page.visualizations.forEach((visual, index) => {
    children.push({
      id: `visual-${index + 1}`,
      type: 'frame',
      name: `${visual.type} · ${visual.title}`,
      x: visual.x,
      y: visual.y,
      width: visual.width,
      height: visual.height,
      fill: '#FFFFFF',
      stroke: { fill: '#D8DEE9', thickness: 1 },
      cornerRadius: 8,
      layout: 'none',
      metadata: { type: 'power-bi-visual', visualType: visual.type, dataFields: visual.dataFields || [] },
      children: [
        textNode(`visual-title-${index + 1}`, visual.title, 14, 12, visual.width - 28, 14, foreground),
        textNode(`visual-type-${index + 1}`, `${visual.type.toUpperCase()} · ${(visual.dataFields || []).join(' · ') || (language === 'vi' ? 'chờ liên kết trường' : 'field binding pending')}`, 14, 38, visual.width - 28, 10, accent),
      ],
    });
  });

  return {
    version: '2.14',
    variables: {
      'color.background': { type: 'color', value: background },
      'color.foreground': { type: 'color', value: foreground },
      'color.accent': { type: 'color', value: accent },
    },
    children: [{
      id: 'power-bi-report-page',
      type: 'frame',
      name: `${config.reportName} · ${knowledgeBase.domain || (language === 'vi' ? 'Phân tích nghiệp vụ' : 'Business Intelligence')}`,
      context: language === 'vi' ? 'Được tạo từ kiến thức nguồn đã tải lên, Tóm tắt yêu cầu đã phân tích và bố cục báo cáo đã chọn.' : 'Generated from uploaded-source knowledge, the analyzed Requirements Summary, and the selected report layout.',
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
      fill: background,
      layout: 'none',
      children,
    }],
  };
}

interface BuildInstructionInput {
  config: ReportConfigurationSpec;
  requirements: ReportRequirements;
  knowledgeBase: KnowledgeBase;
  sourceFileNames: string[];
  language?: AppLanguage;
}

export function generateBuildInstructions({ config, requirements, knowledgeBase, sourceFileNames, language = 'en' }: BuildInstructionInput) {
  if (language === 'vi') return generateVietnameseBuildInstructions({ config, requirements, knowledgeBase, sourceFileNames });
  const page = config.pages[0];
  const usesSampleData = !knowledgeBase.hasUsableTabularData;
  const lines = [
    '# Agentic Power BI Build Instructions',
    '',
    '## Mission',
    '',
    `Create a production-quality Power BI report named **${config.reportName}**. Build from the supplied source evidence, analyzed Requirements Summary, theme, and report layout. Do not invent business facts.`,
    '',
    '## Mandatory skill routing',
    '',
    'Invoke the available Power BI authoring skills before editing their respective artifacts:',
    '',
    '1. `pbir-cli` and `pbip` — scaffold, inspect, and validate the PBIP/PBIR project.',
    '2. `semantic-model` and `tmdl` — create or update the semantic model, relationships, measures, and metadata.',
    '3. `power-query` — author ingestion/transformations when source shaping is required.',
    '4. `dax` — author and validate KPI measures; optimize any non-trivial DAX.',
    '5. `pbi-report-design` and `pbir-format` — implement the selected page hierarchy, visual bindings, interactions, and accessibility.',
    '6. `modifying-theme-json` — apply and validate the supplied Power BI theme JSON.',
    '7. Use `deneb-visuals`, `svg-visuals`, `python-visuals`, or `r-visuals` only when the approved layout explicitly needs them.',
    '',
    'If a named skill is unavailable, stop and report the missing capability instead of silently approximating a proprietary format.',
    '',
    '## Inputs',
    '',
    `- Source files: ${sourceFileNames.length ? sourceFileNames.map((name) => `\`${name}\``).join(', ') : 'none'}`,
    '- Knowledge base: `knowledge/knowledge-base.json`',
    '- Requirements: `requirements/report-requirements.md`',
    '- Editable design workspace: `design/report-layout.pen`',
    `- Theme: \`themes/${config.theme.name.replace(/\s+/g, '_')}_theme.json\``,
    ...(usesSampleData ? ['- Sample dataset: `data/sample-data.csv` (generated because no usable tabular source was supplied)'] : []),
    '',
    '## Grounded business context',
    '',
    `- Domain: ${knowledgeBase.domain || 'Not established'}`,
    `- Summary: ${knowledgeBase.summary || 'No summary available'}`,
    `- Business processes: ${knowledgeBase.businessProcesses.join('; ') || 'Not established'}`,
    `- Candidate entities: ${knowledgeBase.entities.join('; ') || 'Not established'}`,
    `- Candidate metrics: ${knowledgeBase.metrics.join('; ') || requirements.keyMetrics.join('; ') || 'Define with the user before production use'}`,
    `- Candidate dimensions: ${knowledgeBase.dimensions.join('; ') || 'Not established'}`,
    `- Candidate relationships: ${knowledgeBase.relationships.join('; ') || 'Infer only after profiling the data'}`,
    '',
    '## Analyzed Requirements Summary', '',
    formatRequirementsBrief(requirements, 'en').replace(/^# .+\n\n/, ''), '',
    '## Report intent',
    '',
    requirements.description,
    '',
    `- KPI priorities: ${requirements.keyMetrics.join('; ') || 'Use the knowledge-base candidates'}`,
    `- Requested visuals: ${requirements.visualizations.join('; ') || 'Choose using the report-design skill'}`,
    `- Slicer count: ${requirements.slicerCount}`,
    `- Additional instructions: ${requirements.customInstructions || 'None'}`,
    '',
    '## Data strategy',
    '',
    ...(usesSampleData ? [
      'No usable tabular data was detected. Import `data/sample-data.csv`, mark every resulting table/column as sample data in descriptions, and make all KPI cards render from it. Keep the model replaceable: isolate ingestion in Power Query and avoid hard-coded values in DAX.',
      'Never present sample values as real business outcomes. Add a visible “Sample data” disclosure on the report page.',
    ] : [
      'Profile the supplied tabular sources, confirm data types and grain, then build the smallest star schema that supports the approved KPIs. Do not generate replacement sample facts.',
    ]),
    '',
    '## Layout contract',
    '',
    `Implement the first page at ${page?.width ?? 1280} × ${page?.height ?? 720}. Treat the \`.pen\` file as the editable visual source of truth and the coordinates below as the PBIR implementation contract.`,
    '',
  ];

  page?.visualizations.forEach((visual, index) => {
    lines.push(`${index + 1}. **${visual.title}** — ${visual.type}; x=${visual.x}, y=${visual.y}, w=${visual.width}, h=${visual.height}; fields: ${(visual.dataFields || []).join(', ') || 'bind after model profiling'}.`);
  });
  if (page?.slicers.length) {
    lines.push('', 'Slicers:');
    page.slicers.forEach((slicer) => lines.push(`- **${slicer.label}** — x=${slicer.x}, y=${slicer.y}, w=${slicer.width}, h=${slicer.height}; field: ${slicer.field || 'bind after model profiling'}.`));
  }

  lines.push(
    '',
    '## Execution order',
    '',
    '1. Inspect every input and record data-quality assumptions.',
    '2. Scaffold a PBIP project and semantic model using the authoring skills.',
    '3. Load and shape data, then define grain, date table, relationships, formats, and hidden technical columns.',
    '4. Create explicit DAX measures for every KPI; do not rely on implicit aggregations.',
    '5. Apply the supplied theme and implement the `.pen` layout in PBIR.',
    '6. Bind visuals only to fields/measures that exist; add alt text, meaningful titles, and deliberate interactions.',
    '7. Run schema validation, BPA checks, and the available PBIR/TMDL validation commands. Fix all errors before handoff.',
    '',
    '## Acceptance criteria',
    '',
    '- The PBIP project opens without repair prompts and passes available validators.',
    '- Every KPI and visual renders a value; no broken fields or empty required visuals remain.',
    '- Measures, tables, and columns have business-readable names and descriptions.',
    '- The page matches the approved hierarchy, spacing, theme, and accessibility intent.',
    `- ${usesSampleData ? 'Sample-data provenance is visible in the model and report.' : 'All displayed facts trace to supplied source data.'}`,
    '- Include a short build log listing skills used, assumptions, validations run, and remaining risks.',
  );

  return lines.join('\n');
}

function generateVietnameseBuildInstructions({ config, requirements, knowledgeBase, sourceFileNames }: Omit<BuildInstructionInput, 'language'>) {
  const page = config.pages[0];
  const usesSampleData = !knowledgeBase.hasUsableTabularData;
  const lines = [
    '# Hướng dẫn AI Agent xây dựng Báo cáo Power BI', '',
    '## Nhiệm vụ', '',
    `Tạo báo cáo Power BI chất lượng production có tên **${config.reportName}**. Xây dựng từ bằng chứng nguồn, Tóm tắt yêu cầu đã phân tích, giao diện và bố cục báo cáo được cung cấp. Không tự tạo ra thông tin nghiệp vụ.`, '',
    '## Định tuyến kỹ năng bắt buộc', '',
    'Phải gọi các kỹ năng Power BI hiện có trước khi chỉnh sửa loại artifact tương ứng:', '',
    '1. `pbir-cli` và `pbip` — khởi tạo, kiểm tra và xác thực dự án PBIP/PBIR.',
    '2. `semantic-model` và `tmdl` — tạo hoặc cập nhật semantic model, quan hệ, measure và metadata.',
    '3. `power-query` — xây dựng bước nạp và biến đổi dữ liệu khi cần.',
    '4. `dax` — tạo và xác thực các measure KPI; tối ưu DAX không tầm thường.',
    '5. `pbi-report-design` và `pbir-format` — triển khai phân cấp trang, liên kết visual, tương tác và accessibility.',
    '6. `modifying-theme-json` — áp dụng và xác thực tệp giao diện Power BI.',
    '7. Chỉ dùng `deneb-visuals`, `svg-visuals`, `python-visuals` hoặc `r-visuals` khi bố cục đã duyệt thực sự cần.', '',
    'Nếu thiếu một kỹ năng được nêu tên, phải dừng và báo rõ capability còn thiếu; không được tự mô phỏng định dạng độc quyền.', '',
    '## Đầu vào', '',
    `- Tệp nguồn: ${sourceFileNames.length ? sourceFileNames.map((name) => `\`${name}\``).join(', ') : 'không có'}`,
    '- Cơ sở kiến thức: `knowledge/knowledge-base.json`',
    '- Yêu cầu: `requirements/report-requirements.md`',
    '- Không gian thiết kế có thể chỉnh sửa: `design/report-layout.pen`',
    `- Giao diện: \`themes/${config.theme.name.replace(/\s+/g, '_')}_theme.json\``,
    ...(usesSampleData ? ['- Bộ dữ liệu mẫu: `data/sample-data.csv` (được tạo vì không có nguồn dạng bảng sử dụng được)'] : []), '',
    '## Bối cảnh nghiệp vụ có căn cứ', '',
    `- Lĩnh vực: ${knowledgeBase.domain || 'Chưa xác định'}`,
    `- Tóm tắt: ${knowledgeBase.summary || 'Chưa có tóm tắt'}`,
    `- Quy trình nghiệp vụ: ${knowledgeBase.businessProcesses.join('; ') || 'Chưa xác định'}`,
    `- Thực thể đề xuất: ${knowledgeBase.entities.join('; ') || 'Chưa xác định'}`,
    `- Chỉ số đề xuất: ${knowledgeBase.metrics.join('; ') || requirements.keyMetrics.join('; ') || 'Cần xác nhận với người dùng trước khi production'}`,
    `- Chiều phân tích đề xuất: ${knowledgeBase.dimensions.join('; ') || 'Chưa xác định'}`,
    `- Quan hệ đề xuất: ${knowledgeBase.relationships.join('; ') || 'Chỉ suy luận sau khi profiling dữ liệu'}`, '',
    '## Tóm tắt yêu cầu đã phân tích', '',
    formatRequirementsBrief(requirements, 'vi').replace(/^# .+\n\n/, ''), '',
    '## Mục tiêu báo cáo', '', requirements.description, '',
    `- KPI ưu tiên: ${requirements.keyMetrics.join('; ') || 'Dùng các chỉ số trong cơ sở kiến thức'}`,
    `- Trực quan yêu cầu: ${requirements.visualizations.join('; ') || 'Lựa chọn bằng kỹ năng thiết kế báo cáo'}`,
    `- Số slicer: ${requirements.slicerCount}`,
    `- Hướng dẫn bổ sung: ${requirements.customInstructions || 'Không có'}`, '',
    '## Chiến lược dữ liệu', '',
    ...(usesSampleData ? [
      'Không phát hiện dữ liệu dạng bảng sử dụng được. Nạp `data/sample-data.csv`, đánh dấu mọi bảng/cột phát sinh là dữ liệu mẫu trong phần mô tả và đảm bảo tất cả thẻ KPI hiển thị từ dữ liệu này. Tách riêng phần nạp trong Power Query để dễ thay thế và không hard-code giá trị trong DAX.',
      'Không được trình bày giá trị mẫu như kết quả nghiệp vụ thật. Thêm thông báo “Dữ liệu mẫu” dễ thấy trên trang báo cáo.',
    ] : ['Profile các nguồn dạng bảng, xác nhận kiểu dữ liệu và grain, sau đó xây dựng star schema nhỏ nhất hỗ trợ các KPI đã duyệt. Không tạo dữ liệu fact mẫu thay thế.']), '',
    '## Hợp đồng bố cục', '',
    `Triển khai trang đầu tiên ở kích thước ${page?.width ?? 1280} × ${page?.height ?? 720}. Xem tệp \`.pen\` là nguồn thiết kế trực quan có thể chỉnh sửa và các tọa độ dưới đây là hợp đồng triển khai PBIR.`, '',
  ];
  page?.visualizations.forEach((visual, index) => lines.push(`${index + 1}. **${visual.title}** — ${visual.type}; x=${visual.x}, y=${visual.y}, w=${visual.width}, h=${visual.height}; trường: ${(visual.dataFields || []).join(', ') || 'liên kết sau khi profiling model'}.`));
  if (page?.slicers.length) {
    lines.push('', 'Slicer:');
    page.slicers.forEach((slicer) => lines.push(`- **${slicer.label}** — x=${slicer.x}, y=${slicer.y}, w=${slicer.width}, h=${slicer.height}; trường: ${slicer.field || 'liên kết sau khi profiling model'}.`));
  }
  lines.push('', '## Thứ tự thực hiện', '',
    '1. Kiểm tra mọi đầu vào và ghi lại các giả định về chất lượng dữ liệu.',
    '2. Khởi tạo dự án PBIP và semantic model bằng các kỹ năng authoring.',
    '3. Nạp và biến đổi dữ liệu; xác định grain, bảng ngày, quan hệ, định dạng và ẩn cột kỹ thuật.',
    '4. Tạo measure DAX tường minh cho mọi KPI; không dùng phép tổng hợp ngầm định.',
    '5. Áp dụng giao diện và triển khai bố cục `.pen` trong PBIR.',
    '6. Chỉ liên kết visual với trường/measure tồn tại; thêm alt text, tiêu đề có ý nghĩa và tương tác có chủ đích.',
    '7. Chạy xác thực schema, BPA và các lệnh kiểm tra PBIR/TMDL hiện có. Sửa mọi lỗi trước khi bàn giao.', '',
    '## Tiêu chí nghiệm thu', '',
    '- Dự án PBIP mở không có yêu cầu sửa chữa và vượt qua các trình xác thực hiện có.',
    '- Mọi KPI và visual đều hiển thị giá trị; không còn trường bị hỏng hoặc visual bắt buộc bị trống.',
    '- Measure, bảng và cột có tên cùng mô tả dễ hiểu theo nghiệp vụ.',
    '- Trang báo cáo khớp với phân cấp, khoảng cách, giao diện và mục tiêu accessibility đã duyệt.',
    `- ${usesSampleData ? 'Nguồn gốc dữ liệu mẫu được hiển thị trong model và báo cáo.' : 'Mọi số liệu hiển thị đều truy vết được về dữ liệu nguồn đã cung cấp.'}`,
    '- Kèm nhật ký xây dựng ngắn nêu các kỹ năng đã dùng, giả định, bước xác thực và rủi ro còn lại.');
  return lines.join('\n');
}
