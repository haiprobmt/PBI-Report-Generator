import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppLanguage } from './types';
export type { AppLanguage } from './types';

const messages = {
  en: {
    appTitle: 'Power BI Report Generator',
    appSubtitle: 'Turn source files into a grounded BI brief, a report layout, and an agent-ready Power BI build package',
    english: 'English', vietnamese: 'Tiếng Việt',
    sourceKnowledge: 'Source Knowledge', biClarification: 'Requirement Analysis', penLayout: 'Report Layout', agentInstructions: 'Agent Instructions',
    buildingKnowledge: 'Building your knowledge base', extractingKnowledge: 'Extracting text, reading tables, running Vietnamese/English OCR, and asking DeepSeek V4 to identify BI-ready concepts.',
    sourcesAnalyzed: 'Sources analyzed', selectDifferent: 'Select Different Files', uploadSources: 'Upload Sources', dropFiles: 'Drop files here',
    uploadDescription: 'Add data files, business documents, or reference images. DeepSeek V4 will analyze the extracted content as one knowledge base.',
    selectFiles: 'Select Source Files', supportedFiles: 'CSV, TSV, PDF, DOCX, XLSX, PPTX, text, JSON/XML/YAML, PNG, JPEG, WebP, BMP, and TIFF · up to 12 files, 15 MB each / 50 MB total',
    clarifyRequirements: 'Analyze Requirements', knowledgeBase: 'Source knowledge base', domainPending: 'Domain pending', candidateMetrics: 'Candidate metrics', dimensions: 'Dimensions', businessProcesses: 'Business processes', toClarify: 'To clarify',
    tabularDetected: 'Usable tabular data detected', sampleFallback: 'No tabular facts detected; sample data will be generated and clearly labeled.',
    dataPreview: 'Data preview', dataPreviewDescription: 'Review detected columns and sample records before requirements gathering.', sampleData: 'Sample data', table: 'table', tables: 'tables', rows: 'rows', columns: 'columns', showingColumns: 'Showing first {count} columns', noRows: 'No data rows were detected.', previewRows: 'Showing up to {count} preview rows. The full file remains available for export.',
    biAssistant: 'Requirement Analysis', biAssistantDescription: 'DeepSeek V4 automatically finalizes a source-grounded Requirements Summary without an interview.', connecting: 'Connecting', serviceUnavailable: 'AI service unavailable',
    backToUpload: 'Back to Upload', typeMessage: 'Type your message…', typeRefinement: 'Type any refinements…', refine: 'Refine Requirements', reviewSummary: 'Review Requirements Summary', backToChat: 'Back to Chat', startOver: 'Start Over', continueTheme: 'Continue to Theme Selection',
    selectLayout: 'Select Report Layout', layoutDescription: 'Layouts grounded in the uploaded-source knowledge base and analyzed Requirements Summary', regenerate: 'Regenerate', basedOnRequirements: 'Based on your requirements:', visualizations: 'Visualizations:', generateTheme: 'Generate theme and report simulation', themeDescription: 'Describe the desired visual identity. The designer combines it with source knowledge, analyzed requirements, and available fields.', desiredTheme: 'Desired theme', designing: 'Designing…', generateReport: 'Generate theme and report', currentPalette: 'Current generated palette',
    penWorkspace: 'pen.dev workspace', penWorkspaceDescription: 'Edit the embedded canvas, then export a native `.pen` 2.14 workspace for pen.dev.', downloadPen: 'Download .pen', editCanvas: 'Edit Canvas', doneEditing: 'Done Editing', backRequirements: 'Back to Analysis', continueDownload: 'Continue to Instructions',
    exportTitle: 'Export Agent Build Package', exportDescription: 'Download sources, knowledge, sample data when needed, requirements, theme, pen.dev workspace, and Power BI agent instructions', sourceFiles: 'source file(s)', skillRouting: 'BUILD_REPORT.md + skill routing', exportPackage: 'Export Agent Build Package', backLayout: 'Back to Layout',
    requirementsSummary: 'Requirements Summary', reportDescription: 'Report Description', keyMetrics: 'Key Metrics', filtersSlicers: 'Filters & Slicers', customInstructions: 'Custom Instructions', noVisualizations: 'No specific visualizations defined', metricsFromData: 'Metrics will be determined from data', slicerFiltering: '{count} {label} for data filtering', slicer: 'slicer', slicers: 'slicers',
    configSpec: 'Report Configuration Spec', configSpecDescription: 'JSON configuration for precise report generation', download: 'Download', collapse: 'Collapse', expand: 'Expand', pages: 'Pages', pageSize: 'Page Size', complexity: 'Complexity', perPage: 'per page', copied: 'Copied', copy: 'Copy', expandHint: 'Click “Expand” to view the complete JSON configuration specification', configCopied: 'Configuration copied to clipboard', configCopyFailed: 'Failed to copy configuration', configDownloaded: 'Configuration downloaded',
    reportHeader: 'Report header', more: 'more', slicerPlacement: 'Slicer Placement', slicerPlacementHint: 'Choose where to position your {count} {label} on the report page', topHorizontal: 'Top Horizontal', topHorizontalDescription: 'Slicers aligned horizontally at the top of the page', leftVertical: 'Left Vertical', leftVerticalDescription: 'Slicers stacked vertically on the left side', rightVertical: 'Right Vertical', rightVerticalDescription: 'Slicers stacked vertically on the right side', topLeftCorner: 'Top Left Corner', topLeftCornerDescription: 'Compact slicers in the top-left corner', topRightCorner: 'Top Right Corner', topRightCornerDescription: 'Compact slicers in the top-right corner',
    selectSourceError: 'Select at least one source file.', sourcesAnalyzedToast: '{count} source file(s) analyzed by DeepSeek V4', analysisFailed: 'Could not analyze the uploaded files.', requirementsSaved: 'Requirement analysis saved!', requirementsIncomplete: 'Complete requirement analysis before generating a report.', reportGenerated: 'Theme and professional report layout generated with DeepSeek V4', reportGenerationFailed: 'Failed to generate the theme and report simulation.', layoutRequired: 'Generate and select a layout before exporting the pen.dev workspace.', penDownloaded: 'pen.dev workspace downloaded', selectedLayout: 'Selected: {name}', exportIncomplete: 'Complete source analysis, requirement analysis, and layout design before exporting.', packageDownloaded: 'Agent-ready Power BI build package downloaded', zipFailed: 'Failed to generate ZIP file',
  },
  vi: {
    appTitle: 'Trình tạo Báo cáo Power BI',
    appSubtitle: 'Chuyển các tệp nguồn thành bản mô tả BI có căn cứ, bố cục báo cáo và gói hướng dẫn sẵn sàng cho AI agent',
    english: 'English', vietnamese: 'Tiếng Việt',
    sourceKnowledge: 'Kiến thức nguồn', biClarification: 'Phân tích yêu cầu', penLayout: 'Bố cục báo cáo', agentInstructions: 'Hướng dẫn cho Agent',
    buildingKnowledge: 'Đang xây dựng cơ sở kiến thức', extractingKnowledge: 'Đang trích xuất văn bản, đọc bảng dữ liệu, OCR tiếng Việt/Anh và dùng DeepSeek V4 nhận diện nội dung phù hợp cho BI.',
    sourcesAnalyzed: 'Đã phân tích nguồn', selectDifferent: 'Chọn tệp khác', uploadSources: 'Tải nguồn lên', dropFiles: 'Thả tệp vào đây',
    uploadDescription: 'Thêm tệp dữ liệu, tài liệu nghiệp vụ hoặc hình ảnh tham khảo. DeepSeek V4 sẽ phân tích nội dung trích xuất thành một cơ sở kiến thức thống nhất.',
    selectFiles: 'Chọn tệp nguồn', supportedFiles: 'CSV, TSV, PDF, DOCX, XLSX, PPTX, văn bản, JSON/XML/YAML, PNG, JPEG, WebP, BMP và TIFF · tối đa 12 tệp, 15 MB/tệp và 50 MB tổng cộng',
    clarifyRequirements: 'Phân tích yêu cầu', knowledgeBase: 'Cơ sở kiến thức từ nguồn', domainPending: 'Chưa xác định lĩnh vực', candidateMetrics: 'Chỉ số đề xuất', dimensions: 'Chiều phân tích', businessProcesses: 'Quy trình nghiệp vụ', toClarify: 'Cần làm rõ',
    tabularDetected: 'Đã phát hiện dữ liệu dạng bảng có thể sử dụng', sampleFallback: 'Không phát hiện dữ liệu dạng bảng; hệ thống sẽ tạo và ghi nhãn rõ dữ liệu mẫu.',
    dataPreview: 'Xem trước dữ liệu', dataPreviewDescription: 'Kiểm tra các cột và bản ghi mẫu trước khi phân tích yêu cầu.', sampleData: 'Dữ liệu mẫu', table: 'bảng', tables: 'bảng', rows: 'dòng', columns: 'cột', showingColumns: 'Đang hiển thị {count} cột đầu tiên', noRows: 'Không phát hiện dòng dữ liệu.', previewRows: 'Đang hiển thị tối đa {count} dòng mẫu. Tệp đầy đủ vẫn được giữ trong gói xuất.',
    biAssistant: 'Phân tích yêu cầu', biAssistantDescription: 'DeepSeek V4 tự động hoàn thiện Tóm tắt yêu cầu có căn cứ từ nguồn mà không cần phỏng vấn.', connecting: 'Đang kết nối', serviceUnavailable: 'Dịch vụ AI không khả dụng',
    backToUpload: 'Quay lại tải tệp', typeMessage: 'Nhập nội dung…', typeRefinement: 'Nhập nội dung cần điều chỉnh…', refine: 'Tinh chỉnh yêu cầu', reviewSummary: 'Xem tóm tắt yêu cầu', backToChat: 'Quay lại hội thoại', startOver: 'Bắt đầu lại', continueTheme: 'Tiếp tục chọn giao diện',
    selectLayout: 'Chọn bố cục báo cáo', layoutDescription: 'Bố cục dựa trên kiến thức nguồn và Tóm tắt yêu cầu đã phân tích', regenerate: 'Tạo lại', basedOnRequirements: 'Dựa trên yêu cầu của bạn:', visualizations: 'Trực quan:', generateTheme: 'Tạo giao diện và mô phỏng báo cáo', themeDescription: 'Mô tả phong cách mong muốn. Trình thiết kế kết hợp với kiến thức nguồn, yêu cầu đã phân tích và các trường dữ liệu hiện có.', desiredTheme: 'Giao diện mong muốn', designing: 'Đang thiết kế…', generateReport: 'Tạo giao diện và báo cáo', currentPalette: 'Bảng màu hiện tại',
    penWorkspace: 'Không gian làm việc pen.dev', penWorkspaceDescription: 'Chỉnh sửa canvas tích hợp, sau đó xuất tệp `.pen` 2.14 gốc để mở trong pen.dev.', downloadPen: 'Tải tệp .pen', editCanvas: 'Sửa canvas', doneEditing: 'Hoàn tất chỉnh sửa', backRequirements: 'Quay lại phân tích', continueDownload: 'Tiếp tục tới hướng dẫn',
    exportTitle: 'Xuất gói xây dựng cho Agent', exportDescription: 'Tải nguồn, cơ sở kiến thức, dữ liệu mẫu khi cần, yêu cầu, giao diện, tệp pen.dev và hướng dẫn cho AI agent Power BI', sourceFiles: 'tệp nguồn', skillRouting: 'BUILD_REPORT.md + định tuyến kỹ năng', exportPackage: 'Xuất gói xây dựng cho Agent', backLayout: 'Quay lại bố cục',
    requirementsSummary: 'Tóm tắt yêu cầu', reportDescription: 'Mô tả báo cáo', keyMetrics: 'Chỉ số chính', filtersSlicers: 'Bộ lọc và slicer', customInstructions: 'Hướng dẫn tùy chỉnh', noVisualizations: 'Chưa xác định trực quan cụ thể', metricsFromData: 'Các chỉ số sẽ được xác định từ dữ liệu', slicerFiltering: '{count} {label} để lọc dữ liệu', slicer: 'slicer', slicers: 'slicer',
    configSpec: 'Đặc tả cấu hình báo cáo', configSpecDescription: 'Cấu hình JSON để tạo báo cáo chính xác', download: 'Tải xuống', collapse: 'Thu gọn', expand: 'Mở rộng', pages: 'Trang', pageSize: 'Kích thước trang', complexity: 'Độ phức tạp', perPage: 'mỗi trang', copied: 'Đã sao chép', copy: 'Sao chép', expandHint: 'Chọn “Mở rộng” để xem toàn bộ đặc tả cấu hình JSON', configCopied: 'Đã sao chép cấu hình vào bộ nhớ tạm', configCopyFailed: 'Không thể sao chép cấu hình', configDownloaded: 'Đã tải cấu hình xuống',
    reportHeader: 'Tiêu đề báo cáo', more: 'nội dung khác', slicerPlacement: 'Vị trí slicer', slicerPlacementHint: 'Chọn vị trí cho {count} {label} trên trang báo cáo', topHorizontal: 'Ngang phía trên', topHorizontalDescription: 'Các slicer được xếp ngang ở đầu trang', leftVertical: 'Dọc bên trái', leftVerticalDescription: 'Các slicer được xếp dọc ở bên trái', rightVertical: 'Dọc bên phải', rightVerticalDescription: 'Các slicer được xếp dọc ở bên phải', topLeftCorner: 'Góc trên bên trái', topLeftCornerDescription: 'Các slicer thu gọn ở góc trên bên trái', topRightCorner: 'Góc trên bên phải', topRightCornerDescription: 'Các slicer thu gọn ở góc trên bên phải',
    selectSourceError: 'Hãy chọn ít nhất một tệp nguồn.', sourcesAnalyzedToast: 'DeepSeek V4 đã phân tích {count} tệp nguồn', analysisFailed: 'Không thể phân tích các tệp đã tải lên.', requirementsSaved: 'Đã lưu kết quả phân tích yêu cầu!', requirementsIncomplete: 'Hãy hoàn tất bước phân tích yêu cầu trước khi tạo báo cáo.', reportGenerated: 'DeepSeek V4 đã tạo giao diện và bố cục báo cáo chuyên nghiệp', reportGenerationFailed: 'Không thể tạo giao diện và mô phỏng báo cáo.', layoutRequired: 'Hãy tạo và chọn bố cục trước khi xuất không gian làm việc pen.dev.', penDownloaded: 'Đã tải không gian làm việc pen.dev', selectedLayout: 'Đã chọn: {name}', exportIncomplete: 'Hãy hoàn tất phân tích nguồn, phân tích yêu cầu và thiết kế bố cục trước khi xuất.', packageDownloaded: 'Đã tải gói xây dựng Power BI sẵn sàng cho Agent', zipFailed: 'Không thể tạo tệp ZIP',
  },
} as const;

type MessageKey = keyof typeof messages.en;
type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('pbi-generator-language');
    return saved === 'en' || saved === 'vi' ? saved : (navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en');
  });
  useEffect(() => {
    localStorage.setItem('pbi-generator-language', language);
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key, values) => Object.entries(values ?? {}).reduce((text, [name, replacement]) => text.replace(`{${name}}`, String(replacement)), messages[language][key] as string),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.');
  return context;
}
