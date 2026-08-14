import type {
  AppLanguage,
  DataFileContext,
  FilterRequirement,
  KnowledgeBase,
  MetricDefinition,
  ReportPageRequirement,
  ReportRequirements,
  RequirementsCoverage,
  VisualRequirement,
} from './types.ts';

const text = (value: unknown, fallback = '') => typeof value === 'string' ? value.trim() : fallback;
const list = (value: unknown) => Array.isArray(value)
  ? [...new Set(value.map((item) => text(item)).filter(Boolean))]
  : [];
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Record<string, unknown>
  : {};

function metricDefinition(value: unknown): MetricDefinition {
  const item = record(value);
  const direction = text(item.favorableDirection).toLowerCase();
  return {
    name: text(item.name),
    definition: text(item.definition),
    calculation: text(item.calculation),
    target: text(item.target),
    comparison: text(item.comparison),
    format: text(item.format),
    favorableDirection: direction === 'lower' || direction === 'neutral' ? direction : 'higher',
  };
}

function pageRequirement(value: unknown): ReportPageRequirement {
  const item = record(value);
  const shape = text(item.pageShape).toLowerCase();
  const pageShape = ['summary', 'monitoring', 'exploration', 'comparison', 'narrative'].includes(shape)
    ? shape as ReportPageRequirement['pageShape']
    : 'summary';
  return {
    name: text(item.name),
    purpose: text(item.purpose),
    businessQuestions: list(item.businessQuestions),
    visualTitles: list(item.visualTitles),
    pageShape,
  };
}

function visualRequirement(value: unknown): VisualRequirement {
  const item = record(value);
  return {
    title: text(item.title),
    visualType: text(item.visualType),
    purpose: text(item.purpose),
    fields: list(item.fields),
    encoding: text(item.encoding),
    sort: text(item.sort),
  };
}

function filterRequirement(value: unknown): FilterRequirement {
  const item = record(value);
  return {
    field: text(item.field),
    control: text(item.control),
    defaultSelection: text(item.defaultSelection),
    scope: text(item.scope),
  };
}

export function normalizeReportRequirements(value: unknown): ReportRequirements {
  const item = record(value);
  const time = record(item.timeContext);
  const design = record(item.design);
  const data = record(item.dataRequirements);
  const security = record(item.security);
  const keyMetrics = list(item.keyMetrics).slice(0, 6);
  const visualRequirements = Array.isArray(item.visualRequirements)
    ? item.visualRequirements.map(visualRequirement).filter((visual) => visual.title && visual.purpose).slice(0, 12)
    : [];
  const visualizations = list(item.visualizations).slice(0, 12);
  return {
    description: text(item.description),
    audience: text(item.audience),
    decisions: list(item.decisions).slice(0, 8),
    businessQuestions: list(item.businessQuestions).slice(0, 10),
    visualizations: visualizations.length ? visualizations : visualRequirements.map((visual) => visual.title),
    keyMetrics,
    metricDefinitions: (Array.isArray(item.metricDefinitions) ? item.metricDefinitions : [])
      .map(metricDefinition).filter((metric) => metric.name).slice(0, 6),
    analysisDimensions: list(item.analysisDimensions).slice(0, 12),
    timeContext: {
      dateField: text(time.dateField),
      grain: text(time.grain),
      defaultPeriod: text(time.defaultPeriod),
      comparisonPeriod: text(time.comparisonPeriod),
    },
    pageRequirements: (Array.isArray(item.pageRequirements) ? item.pageRequirements : [])
      .map(pageRequirement).filter((page) => page.name && page.purpose).slice(0, 8),
    visualRequirements,
    filters: (Array.isArray(item.filters) ? item.filters : [])
      .map(filterRequirement).filter((filter) => filter.field).slice(0, 6),
    filterStrategy: text(item.filterStrategy),
    interactions: list(item.interactions).slice(0, 10),
    drillthrough: list(item.drillthrough).slice(0, 6),
    tooltips: list(item.tooltips).slice(0, 8),
    design: {
      tone: ['corporate', 'editorial', 'technical'].includes(text(design.tone))
        ? text(design.tone) as ReportRequirements['design']['tone']
        : 'restrained',
      signature: text(design.signature),
      canvas: text(design.canvas),
      brandGuidance: text(design.brandGuidance),
      accessibility: text(design.accessibility),
    },
    dataRequirements: {
      grain: text(data.grain),
      sourceStrategy: text(data.sourceStrategy),
      requiredFields: list(data.requiredFields).slice(0, 20),
      relationships: list(data.relationships).slice(0, 12),
      refreshCadence: text(data.refreshCadence),
      dataQualityRules: list(data.dataQualityRules).slice(0, 12),
      sampleDataPolicy: text(data.sampleDataPolicy),
    },
    security: {
      rowLevelSecurity: text(security.rowLevelSecurity),
      sensitivity: text(security.sensitivity),
    },
    acceptanceCriteria: list(item.acceptanceCriteria).slice(0, 15),
    assumptions: list(item.assumptions).slice(0, 12),
    slicerCount: Math.min(3, Math.max(0, Number.isFinite(Number(item.slicerCount)) ? Math.round(Number(item.slicerCount)) : 0)),
    customInstructions: text(item.customInstructions),
  };
}

function mergeUnique(...values: string[][]) {
  return [...new Set(values.flat().map((value) => value.trim()).filter(Boolean))];
}

export function finalizeAutomaticRequirements(
  value: unknown,
  knowledgeBase: Pick<KnowledgeBase, 'summary' | 'metrics' | 'dimensions' | 'dateFields' | 'relationships' | 'suggestedReportQuestions' | 'hasUsableTabularData'> | null,
  dataContext: DataFileContext[] = [],
  language: AppLanguage = 'en',
): ReportRequirements {
  const r = normalizeReportRequirements(value);
  const vi = language === 'vi';
  const detectedHeaders = [...new Set(dataContext.flatMap((file) => file.headers).filter(Boolean))];
  const detectedMetrics = mergeUnique(r.keyMetrics, knowledgeBase?.metrics ?? []).slice(0, 5);
  const keyMetrics = detectedMetrics.length ? detectedMetrics : [vi ? 'KPI chính' : 'Primary KPI'];
  const detectedDimensions = mergeUnique(r.analysisDimensions, knowledgeBase?.dimensions ?? []).slice(0, 8);
  const analysisDimensions = detectedDimensions.length ? detectedDimensions : [vi ? 'Danh mục' : 'Category'];
  const detectedDateHeader = detectedHeaders.find((header) => /date|time|day|week|month|quarter|year|ngày|tháng|tuần|quý|năm/i.test(header));
  const dateField = r.timeContext.dateField || knowledgeBase?.dateFields[0] || detectedDateHeader || (vi ? 'Không phát hiện trường ngày' : 'No date field detected');
  const hasDateField = !/^(no date field|không phát hiện trường ngày)/i.test(dateField);
  const questions = mergeUnique(r.businessQuestions, knowledgeBase?.suggestedReportQuestions ?? []).slice(0, 8);
  const businessQuestions = questions.length ? questions : [vi ? 'Hiệu suất hiện tại như thế nào và khu vực nào cần chú ý?' : 'What is current performance and which area requires attention?'];
  const assumptions = [...r.assumptions];
  const addAssumption = (en: string, viText: string) => {
    const assumption = vi ? viText : en;
    if (!assumptions.includes(assumption)) assumptions.push(assumption);
  };

  if (!r.audience) addAssumption('Assumption: the primary audience is business managers and analysts reviewing operational performance.', 'Giả định: đối tượng chính là quản lý nghiệp vụ và chuyên viên phân tích theo dõi hiệu suất vận hành.');
  if (!r.decisions.length) addAssumption('Assumption: readers use the report to identify exceptions, prioritize follow-up, and monitor change over time.', 'Giả định: người đọc dùng báo cáo để nhận diện ngoại lệ, ưu tiên xử lý và theo dõi thay đổi theo thời gian.');
  if (!r.design.signature) addAssumption('Assumption: use a restrained corporate identity with a single deep-blue accent and consistent KPI-card silhouette.', 'Giả định: dùng phong cách doanh nghiệp tiết chế với một màu nhấn xanh đậm và hình dáng KPI card nhất quán.');
  if (!r.security.rowLevelSecurity) addAssumption('Assumption: no row-level security rule was found in the sources; validate access rules before deployment.', 'Giả định: không tìm thấy quy tắc bảo mật theo dòng trong nguồn; cần xác thực quyền truy cập trước khi triển khai.');
  if (!r.dataRequirements.refreshCadence) addAssumption('Assumption: refresh before the normal management review cadence; confirm the exact schedule before deployment.', 'Giả định: refresh trước kỳ đánh giá quản trị thông thường; cần xác nhận lịch chính xác trước khi triển khai.');

  const existingMetrics = new Map(r.metricDefinitions.map((metric) => [metric.name.toLocaleLowerCase(), metric]));
  const metricDefinitions = keyMetrics.map((name) => {
    const existing = existingMetrics.get(name.toLocaleLowerCase());
    const missingTarget = !existing?.target;
    if (missingTarget) addAssumption(
      `Assumption: no verified target was found for ${name}; use prior-period context as a layout placeholder until a business target is supplied.`,
      `Giả định: không phát hiện mục tiêu đã xác thực cho ${name}; dùng kỳ trước làm ngữ cảnh bố cục cho tới khi có mục tiêu nghiệp vụ.`,
    );
    return {
      name,
      definition: existing?.definition || (vi ? `Chỉ số ${name} được phát hiện từ nguồn; cần xác thực định nghĩa nghiệp vụ chính xác trước khi triển khai.` : `${name} was detected from the sources; validate the exact business definition before deployment.`),
      calculation: existing?.calculation || (vi ? `Tổng hợp trường hoặc khái niệm ${name} theo grain nguồn; không tự tạo công thức chưa được hỗ trợ.` : `Aggregate the ${name} source field or concept at the detected grain; do not invent an unsupported formula.`),
      target: existing?.target || (vi ? 'Không phát hiện mục tiêu; tạm dùng so sánh kỳ trước và ghi rõ đây là giả định.' : 'No target detected; use prior-period comparison as a clearly labeled assumption.'),
      comparison: existing?.comparison || (vi ? 'Kỳ trước' : 'Prior period'),
      format: existing?.format || (vi ? 'Theo định dạng số được phát hiện trong nguồn' : 'Use the numeric format detected in the source'),
      favorableDirection: existing?.favorableDirection || 'neutral' as const,
    };
  });

  const visualRequirements = r.visualRequirements.length ? r.visualRequirements : [
    ...keyMetrics.slice(0, 4).map((metric) => ({
      title: metric,
      visualType: 'KPI',
      purpose: vi ? `Hiển thị ${metric} cùng ngữ cảnh mục tiêu hoặc kỳ trước.` : `Show ${metric} with target or prior-period context.`,
      fields: hasDateField ? [metric, dateField] : [metric],
      encoding: vi ? 'Giá trị chính, chênh lệch và xu hướng' : 'Primary value, variance, and trend',
      sort: vi ? 'Không áp dụng' : 'Not applicable',
    })),
    ...(hasDateField ? [{
      title: vi ? 'Xu hướng hiệu suất theo thời gian' : 'Performance trend over time',
      visualType: 'Line chart',
      purpose: vi ? 'Cho thấy hướng thay đổi của KPI ưu tiên theo thời gian.' : 'Show how the priority KPI changes over time.',
      fields: [dateField, keyMetrics[0]],
      encoding: vi ? `${dateField} trên trục X và ${keyMetrics[0]} trên trục Y` : `${dateField} on X and ${keyMetrics[0]} on Y`,
      sort: vi ? 'Theo thời gian tăng dần' : 'Chronological ascending',
    }] : []),
    {
      title: vi ? `Phân tích theo ${analysisDimensions[0]}` : `Analysis by ${analysisDimensions[0]}`,
      visualType: 'Horizontal bar chart',
      purpose: vi ? 'Xếp hạng các nhóm để nhận diện khu vực cần chú ý.' : 'Rank groups to identify areas requiring attention.',
      fields: [analysisDimensions[0], keyMetrics[0]],
      encoding: vi ? `${analysisDimensions[0]} theo danh mục và ${keyMetrics[0]} theo độ dài thanh` : `${analysisDimensions[0]} as category and ${keyMetrics[0]} as bar length`,
      sort: vi ? `${keyMetrics[0]} giảm dần` : `${keyMetrics[0]} descending`,
    },
  ].slice(0, 10);
  const visualizations = r.visualizations.length ? r.visualizations : visualRequirements.map((visual) => visual.title);
  const filters = r.filters.length ? r.filters : [...(hasDateField ? [dateField] : []), ...analysisDimensions].slice(0, 3).map((field, index) => ({
    field,
    control: index === 0 ? (vi ? 'Slicer khoảng thời gian' : 'Date-range slicer') : (vi ? 'Slicer dropdown' : 'Dropdown slicer'),
    defaultSelection: vi ? 'Tất cả dữ liệu khả dụng' : 'All available data',
    scope: vi ? 'Toàn báo cáo' : 'Report',
  }));
  const sourceStrategy = r.dataRequirements.sourceStrategy || (knowledgeBase?.hasUsableTabularData
    ? (vi ? 'Profile và dùng trực tiếp dữ liệu bảng đã tải lên.' : 'Profile and use the uploaded tabular data directly.')
    : (vi ? 'Không có bảng khả dụng; tạo dữ liệu mẫu được ghi nhãn rõ và có thể thay thế.' : 'No usable table was detected; create clearly labeled, replaceable sample data.'));
  const requiredFields = mergeUnique(r.dataRequirements.requiredFields, detectedHeaders, hasDateField ? [dateField] : [], analysisDimensions, keyMetrics).slice(0, 20);

  return normalizeReportRequirements({
    ...r,
    description: r.description || knowledgeBase?.summary || (vi ? 'Tạo báo cáo BI tổng quan dựa trên nội dung và dữ liệu đã tải lên để theo dõi hiệu suất và nhận diện ngoại lệ.' : 'Create a source-grounded BI overview that monitors performance and identifies exceptions from the uploaded evidence.'),
    audience: r.audience || (vi ? 'Giả định: quản lý nghiệp vụ và chuyên viên phân tích trong kỳ đánh giá hiệu suất định kỳ.' : 'Assumption: business managers and analysts in a recurring performance review.'),
    decisions: r.decisions.length ? r.decisions : [vi ? 'Nhận diện khu vực lệch chuẩn và ưu tiên hành động tiếp theo.' : 'Identify exceptions and prioritize the next action.'],
    businessQuestions,
    keyMetrics,
    metricDefinitions,
    analysisDimensions,
    timeContext: {
      dateField,
      grain: r.timeContext.grain || (hasDateField
        ? (vi ? 'Theo cấp thời gian được phát hiện từ trường ngày; mặc định theo tháng.' : 'Use the detected date grain; default to monthly.')
        : (vi ? 'Không áp dụng cho đến khi có trường ngày.' : 'Not applicable until a date field is available.')),
      defaultPeriod: r.timeContext.defaultPeriod || (vi ? 'Toàn bộ kỳ dữ liệu khả dụng' : 'All available periods'),
      comparisonPeriod: r.timeContext.comparisonPeriod || (hasDateField ? (vi ? 'Kỳ trước' : 'Prior period') : (vi ? 'Không áp dụng' : 'Not applicable')),
    },
    pageRequirements: r.pageRequirements.length ? r.pageRequirements : [{
      name: vi ? 'Tổng quan' : 'Overview',
      purpose: vi ? 'Theo dõi KPI, xu hướng, ngoại lệ và chi tiết hỗ trợ hành động.' : 'Monitor KPIs, trends, exceptions, and action-supporting detail.',
      businessQuestions,
      visualTitles: visualizations,
      pageShape: 'monitoring',
    }],
    visualRequirements,
    visualizations,
    filters,
    filterStrategy: r.filterStrategy || (vi ? 'Hiển thị tối đa ba slicer quan trọng; chuyển các bộ lọc phụ vào filter pane.' : 'Show at most three priority slicers and place secondary filters in the filter pane.'),
    interactions: r.interactions.length ? r.interactions : [vi ? 'Các chart cross-filter những visual còn lại trên trang.' : 'Charts cross-filter the remaining visuals on the page.'],
    tooltips: r.tooltips.length ? r.tooltips : [vi ? 'Hiển thị giá trị, kỳ, chênh lệch và chiều phân tích hiện tại.' : 'Show value, period, variance, and current analysis dimension.'],
    drillthrough: r.drillthrough.length ? r.drillthrough : [vi ? 'Không tự động yêu cầu drillthrough; Codex có thể thêm trong bước bố cục nếu người dùng điều chỉnh.' : 'No automatic drillthrough requirement; Codex can add it during layout adjustment.'],
    design: {
      tone: r.design.tone || 'restrained',
      signature: r.design.signature || (vi ? 'Một màu nhấn xanh đậm và hàng KPI nhất quán' : 'Single deep-blue accent and consistent KPI row'),
      canvas: r.design.canvas || '1280x720',
      brandGuidance: r.design.brandGuidance || (vi ? 'Dùng màu thương hiệu nếu được phát hiện; nếu không dùng theme doanh nghiệp tiết chế.' : 'Use detected brand colors; otherwise use a restrained corporate theme.'),
      accessibility: r.design.accessibility || (vi ? 'Độ tương phản WCAG, nhãn dễ đọc và không truyền đạt ý nghĩa chỉ bằng màu.' : 'WCAG contrast, readable labels, and no color-only meaning.'),
    },
    dataRequirements: {
      grain: r.dataRequirements.grain || (vi ? 'Dùng grain của từng dòng nguồn; phải profile và xác nhận trước khi tạo measure.' : 'Use the source-row grain; profile and validate it before creating measures.'),
      sourceStrategy,
      requiredFields,
      relationships: r.dataRequirements.relationships.length ? r.dataRequirements.relationships : (knowledgeBase?.relationships ?? []),
      refreshCadence: r.dataRequirements.refreshCadence || (vi ? 'Giả định: refresh trước kỳ đánh giá quản trị; xác nhận trước khi triển khai.' : 'Assumption: refresh before the management review; confirm before deployment.'),
      dataQualityRules: r.dataRequirements.dataQualityRules.length ? r.dataRequirements.dataQualityRules : [vi ? 'Kiểm tra kiểu dữ liệu, giá trị trống, khóa trùng và phạm vi ngày trước khi dựng model.' : 'Check data types, blanks, duplicate keys, and date coverage before modeling.'],
      sampleDataPolicy: r.dataRequirements.sampleDataPolicy || (knowledgeBase?.hasUsableTabularData
        ? (vi ? 'Không tạo fact mẫu thay thế khi dữ liệu bảng khả dụng.' : 'Do not create replacement sample facts when usable tabular data exists.')
        : (vi ? 'Tạo dữ liệu mẫu có nhãn rõ; không trình bày như kết quả thật.' : 'Create clearly labeled sample data and never present it as real results.')),
    },
    security: {
      rowLevelSecurity: r.security.rowLevelSecurity || (vi ? 'Không phát hiện yêu cầu RLS; phải xác nhận trước khi triển khai.' : 'No RLS requirement detected; validate before deployment.'),
      sensitivity: r.security.sensitivity || (vi ? 'Giả định dữ liệu nội bộ; xác nhận phân loại với chủ sở hữu dữ liệu.' : 'Assume internal data; confirm classification with the data owner.'),
    },
    acceptanceCriteria: r.acceptanceCriteria.length >= 4 ? r.acceptanceCriteria : [
      vi ? 'Mọi KPI và visual dùng trường hoặc khái niệm có trong nguồn.' : 'Every KPI and visual uses source-supported fields or concepts.',
      vi ? 'KPI nêu rõ mục tiêu hoặc ngữ cảnh so sánh và mọi giả định đều được ghi nhãn.' : 'KPIs state target or comparison context and every assumption is labeled.',
      vi ? 'Bố cục nằm trong canvas, không chồng lấn hoặc cắt chữ.' : 'The layout stays inside the canvas with no overlaps or clipped text.',
      vi ? 'Trang tuân theo thứ bậc KPI đến xu hướng, phân tích và chi tiết.' : 'The page follows a KPI-to-trend-to-analysis-to-detail hierarchy.',
      vi ? 'Màu sắc, nhãn và độ tương phản đáp ứng yêu cầu accessibility.' : 'Colors, labels, and contrast meet accessibility expectations.',
      vi ? 'Thiết kế có thể triển khai bằng visual Power BI đã nêu.' : 'The design maps to the specified implementable Power BI visuals.',
    ],
    assumptions,
    slicerCount: Math.min(3, filters.length),
  });
}

const sectionOrder = [
  'purposeAndQuestions', 'audienceAndDecisions', 'metricDefinitions', 'analysisContext',
  'pageAndVisualPlan', 'filtersAndInteractions', 'designIdentity', 'dataContract',
  'securityAndGovernance', 'acceptanceCriteria',
] as const;

const sectionQuestions: Record<(typeof sectionOrder)[number], { en: string; vi: string }> = {
  purposeAndQuestions: { en: 'What exact business problem should the report solve, and which questions must it answer?', vi: 'Báo cáo cần giải quyết chính xác vấn đề nghiệp vụ nào và phải trả lời những câu hỏi nào?' },
  audienceAndDecisions: { en: 'Who will use the report, in what review cadence, and which decisions or actions must it support?', vi: 'Ai sẽ sử dụng báo cáo, trong nhịp xem xét nào, và báo cáo phải hỗ trợ những quyết định hoặc hành động gì?' },
  metricDefinitions: { en: 'For each priority KPI, what is its business definition, calculation, target, comparison basis, display format, and favorable direction?', vi: 'Với từng KPI ưu tiên, hãy xác nhận định nghĩa nghiệp vụ, cách tính, mục tiêu, kỳ so sánh, định dạng và chiều hướng được xem là tốt.' },
  analysisContext: { en: 'Which dimensions and date field should users analyze by, at what time grain and default comparison period?', vi: 'Người dùng cần phân tích theo các chiều và trường ngày nào, với cấp thời gian và kỳ so sánh mặc định nào?' },
  pageAndVisualPlan: { en: 'Which report pages and visuals are required, and what question, fields, encoding, and sort order should each visual use?', vi: 'Cần những trang và visual nào; mỗi visual trả lời câu hỏi gì, dùng trường, mã hóa và thứ tự sắp xếp nào?' },
  filtersAndInteractions: { en: 'Which filters, cross-filter interactions, tooltips, and drillthrough paths are required? State explicitly if any are not needed.', vi: 'Cần bộ lọc, tương tác cross-filter, tooltip và đường drillthrough nào? Hãy nêu rõ nếu mục nào không cần.' },
  designIdentity: { en: 'Confirm the report tone, recurring visual signature, canvas size, brand constraints, and accessibility expectations.', vi: 'Hãy xác nhận phong cách, dấu hiệu thiết kế lặp lại, kích thước canvas, ràng buộc thương hiệu và yêu cầu accessibility.' },
  dataContract: { en: 'Confirm the data grain, required fields and relationships, refresh cadence, data-quality rules, and sample-data policy.', vi: 'Hãy xác nhận grain dữ liệu, trường và quan hệ bắt buộc, tần suất refresh, quy tắc chất lượng và chính sách dữ liệu mẫu.' },
  securityAndGovernance: { en: 'What row-level security and data-sensitivity rules apply? State explicitly if none apply.', vi: 'Có yêu cầu bảo mật theo dòng và phân loại độ nhạy dữ liệu nào? Hãy nêu rõ nếu không có.' },
  acceptanceCriteria: { en: 'What objective checks must be true before the layout and final Power BI report can be accepted?', vi: 'Những kiểm tra khách quan nào phải đạt trước khi chấp nhận bố cục và báo cáo Power BI cuối cùng?' },
};

export function assessRequirementsCoverage(value: unknown, language: AppLanguage = 'en'): RequirementsCoverage {
  const r = normalizeReportRequirements(value);
  const metricNames = new Set(r.metricDefinitions.filter((metric) => metric.definition && metric.calculation && metric.target && metric.comparison && metric.format).map((metric) => metric.name.toLowerCase()));
  const checks: Record<(typeof sectionOrder)[number], boolean> = {
    purposeAndQuestions: r.description.length >= 40 && r.businessQuestions.length >= 1,
    audienceAndDecisions: r.audience.length >= 10 && r.decisions.length >= 1,
    metricDefinitions: r.keyMetrics.length >= 1 && r.keyMetrics.every((metric) => metricNames.has(metric.toLowerCase())),
    analysisContext: r.analysisDimensions.length >= 1 && Boolean(r.timeContext.dateField && r.timeContext.grain && r.timeContext.defaultPeriod && r.timeContext.comparisonPeriod),
    pageAndVisualPlan: r.pageRequirements.length >= 1 && r.visualRequirements.length >= 1 && r.visualRequirements.every((visual) => visual.visualType && visual.fields.length && visual.encoding && visual.sort),
    filtersAndInteractions: Boolean(r.filterStrategy && r.interactions.length && r.tooltips.length),
    designIdentity: Boolean(r.design.signature && r.design.canvas && r.design.brandGuidance && r.design.accessibility),
    dataContract: Boolean(r.dataRequirements.grain && r.dataRequirements.sourceStrategy && r.dataRequirements.requiredFields.length && r.dataRequirements.refreshCadence && r.dataRequirements.sampleDataPolicy),
    securityAndGovernance: Boolean(r.security.rowLevelSecurity && r.security.sensitivity),
    acceptanceCriteria: r.acceptanceCriteria.length >= 4,
  };
  const completedSections = sectionOrder.filter((section) => checks[section]);
  const missingSections = sectionOrder.filter((section) => !checks[section]);
  return {
    complete: missingSections.length === 0,
    percentage: Math.round((completedSections.length / sectionOrder.length) * 100),
    completedSections: [...completedSections],
    missingSections: [...missingSections],
    nextQuestion: missingSections.length ? sectionQuestions[missingSections[0]][language] : '',
  };
}

const bullets = (values: string[], empty: string) => values.length ? values.map((value) => `- ${value}`) : [`- ${empty}`];

export function formatRequirementsBrief(value: unknown, language: AppLanguage = 'en') {
  const r = normalizeReportRequirements(value);
  const vi = language === 'vi';
  const lines = [
    vi ? '# Tóm tắt yêu cầu' : '# Requirements Summary', '',
    vi ? '## Mục đích và câu hỏi nghiệp vụ' : '## Purpose and business questions', '', r.description,
    ...bullets(r.businessQuestions, vi ? 'Chưa xác định' : 'Not established'), '',
    vi ? '## Đối tượng và quyết định' : '## Audience and decisions', '', `- ${vi ? 'Đối tượng' : 'Audience'}: ${r.audience}`,
    ...bullets(r.decisions, vi ? 'Chưa xác định quyết định' : 'No decisions established'), '',
    vi ? '## Hợp đồng KPI và measure' : '## KPI and measure contract', '',
  ];
  r.metricDefinitions.forEach((metric) => lines.push(
    `### ${metric.name}`, `- ${vi ? 'Định nghĩa' : 'Definition'}: ${metric.definition}`,
    `- ${vi ? 'Cách tính' : 'Calculation'}: ${metric.calculation}`,
    `- ${vi ? 'Mục tiêu' : 'Target'}: ${metric.target}`,
    `- ${vi ? 'So sánh' : 'Comparison'}: ${metric.comparison}`,
    `- ${vi ? 'Định dạng' : 'Format'}: ${metric.format}`,
    `- ${vi ? 'Chiều tốt' : 'Favorable direction'}: ${metric.favorableDirection}`, '',
  ));
  lines.push(
    vi ? '## Ngữ cảnh phân tích và thời gian' : '## Analysis and time context', '',
    `- ${vi ? 'Chiều phân tích' : 'Dimensions'}: ${r.analysisDimensions.join('; ')}`,
    `- ${vi ? 'Trường ngày' : 'Date field'}: ${r.timeContext.dateField}`,
    `- ${vi ? 'Cấp thời gian' : 'Time grain'}: ${r.timeContext.grain}`,
    `- ${vi ? 'Kỳ mặc định' : 'Default period'}: ${r.timeContext.defaultPeriod}`,
    `- ${vi ? 'Kỳ so sánh' : 'Comparison period'}: ${r.timeContext.comparisonPeriod}`, '',
    vi ? '## Kiến trúc trang' : '## Page architecture', '',
  );
  r.pageRequirements.forEach((page) => lines.push(`- **${page.name}** [${page.pageShape}] — ${page.purpose}; ${page.businessQuestions.join('; ')}; ${page.visualTitles.join('; ')}`));
  lines.push('', vi ? '## Đặc tả visual' : '## Visual specifications', '');
  r.visualRequirements.forEach((visual) => lines.push(`- **${visual.title}** (${visual.visualType}) — ${visual.purpose}; ${vi ? 'trường' : 'fields'}: ${visual.fields.join(', ')}; ${vi ? 'mã hóa' : 'encoding'}: ${visual.encoding}; ${vi ? 'sắp xếp' : 'sort'}: ${visual.sort}`));
  lines.push('', vi ? '## Bộ lọc và tương tác' : '## Filters and interactions', '', `- ${r.filterStrategy}`);
  r.filters.forEach((filter) => lines.push(`- ${filter.field}: ${filter.control}; ${filter.defaultSelection}; ${filter.scope}`));
  lines.push(...bullets(r.interactions, vi ? 'Không yêu cầu' : 'Not required'), ...bullets(r.tooltips, vi ? 'Không yêu cầu tooltip' : 'No tooltips required'), ...bullets(r.drillthrough, vi ? 'Không yêu cầu drillthrough' : 'No drillthrough required'), '',
    vi ? '## Định hướng thiết kế' : '## Design direction', '',
    `- Tone: ${r.design.tone}; signature: ${r.design.signature}; canvas: ${r.design.canvas}`,
    `- Brand: ${r.design.brandGuidance}`, `- Accessibility: ${r.design.accessibility}`, '',
    vi ? '## Hợp đồng dữ liệu và quản trị' : '## Data and governance contract', '',
    `- Grain: ${r.dataRequirements.grain}`, `- ${vi ? 'Chiến lược nguồn' : 'Source strategy'}: ${r.dataRequirements.sourceStrategy}`,
    `- ${vi ? 'Trường bắt buộc' : 'Required fields'}: ${r.dataRequirements.requiredFields.join('; ')}`,
    `- ${vi ? 'Quan hệ' : 'Relationships'}: ${r.dataRequirements.relationships.join('; ') || (vi ? 'Chưa xác định' : 'Not established')}`,
    `- Refresh: ${r.dataRequirements.refreshCadence}`, `- ${vi ? 'Quy tắc chất lượng' : 'Data-quality rules'}: ${r.dataRequirements.dataQualityRules.join('; ') || (vi ? 'Chưa xác định' : 'Not established')}`,
    `- ${vi ? 'Dữ liệu mẫu' : 'Sample data'}: ${r.dataRequirements.sampleDataPolicy}`,
    `- RLS: ${r.security.rowLevelSecurity}`, `- ${vi ? 'Độ nhạy' : 'Sensitivity'}: ${r.security.sensitivity}`, '',
    vi ? '## Tiêu chí nghiệm thu' : '## Acceptance criteria', '', ...bullets(r.acceptanceCriteria, vi ? 'Chưa xác định' : 'Not established'), '',
    vi ? '## Giả định và hướng dẫn bổ sung' : '## Assumptions and additional direction', '', ...bullets(r.assumptions, vi ? 'Không có giả định được ghi nhận' : 'No recorded assumptions'),
    ...(r.customInstructions ? [`- ${r.customInstructions}`] : []),
  );
  return lines.join('\n');
}
