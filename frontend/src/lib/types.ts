export interface PowerBITheme {
  name: string;
  dataColors: string[];
  background?: string;
  foreground?: string;
  tableAccent?: string;
  good?: string;
  neutral?: string;
  bad?: string;
  maximum?: string;
  center?: string;
  minimum?: string;
  null?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: PowerBITheme;
  tags: string[];
  category: 'business' | 'creative' | 'nature' | 'minimal' | 'bold';
}

export interface SemanticModel {
  id: string;
  name: string;
  files: File[];
  uploadedAt: Date;
  size: number;
}

export interface ProgressStep {
  id: string;
  message: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  timestamp: Date;
}

export interface GenerationResult {
  reportFile: Blob;
  reportName: string;
  generatedAt: Date;
  theme: PowerBITheme;
}

export interface DataFileContext {
  fileName: string;
  headers: string[];
  sampleRows: string[][];
  rowCount: number;
  sheetName?: string;
  isSampleData?: boolean;
}

export type AppLanguage = 'en' | 'vi';

export interface KnowledgeSource {
  fileName: string;
  fileType: string;
  mimeType: string;
  extractionStatus: 'analyzed' | 'partial' | 'failed';
  summary: string;
  characterCount: number;
  warnings: string[];
}

export interface KnowledgeBase {
  summary: string;
  domain: string;
  businessProcesses: string[];
  entities: string[];
  metrics: string[];
  dimensions: string[];
  dateFields: string[];
  relationships: string[];
  sourceInsights: string[];
  suggestedReportQuestions: string[];
  warnings: string[];
  hasUsableTabularData: boolean;
  sources: KnowledgeSource[];
  generatedAt: string;
  provider: string;
}

export type WorkflowStep = 'upload' | 'requirements' | 'layout' | 'download';

export interface ReportRequirements {
  description: string;
  audience: string;
  decisions: string[];
  businessQuestions: string[];
  visualizations: string[];
  keyMetrics: string[];
  metricDefinitions: MetricDefinition[];
  analysisDimensions: string[];
  timeContext: TimeContext;
  pageRequirements: ReportPageRequirement[];
  visualRequirements: VisualRequirement[];
  filters: FilterRequirement[];
  filterStrategy: string;
  interactions: string[];
  drillthrough: string[];
  tooltips: string[];
  design: ReportDesignRequirement;
  dataRequirements: ReportDataRequirement;
  security: ReportSecurityRequirement;
  acceptanceCriteria: string[];
  assumptions: string[];
  slicerCount: number;
  customInstructions?: string;
}

export interface MetricDefinition {
  name: string;
  definition: string;
  calculation: string;
  target: string;
  comparison: string;
  format: string;
  favorableDirection: 'higher' | 'lower' | 'neutral';
}

export interface TimeContext {
  dateField: string;
  grain: string;
  defaultPeriod: string;
  comparisonPeriod: string;
}

export interface ReportPageRequirement {
  name: string;
  purpose: string;
  businessQuestions: string[];
  visualTitles: string[];
  pageShape: 'summary' | 'monitoring' | 'exploration' | 'comparison' | 'narrative';
}

export interface VisualRequirement {
  title: string;
  visualType: string;
  purpose: string;
  fields: string[];
  encoding: string;
  sort: string;
}

export interface FilterRequirement {
  field: string;
  control: string;
  defaultSelection: string;
  scope: string;
}

export interface ReportDesignRequirement {
  tone: 'restrained' | 'corporate' | 'editorial' | 'technical';
  signature: string;
  canvas: string;
  brandGuidance: string;
  accessibility: string;
}

export interface ReportDataRequirement {
  grain: string;
  sourceStrategy: string;
  requiredFields: string[];
  relationships: string[];
  refreshCadence: string;
  dataQualityRules: string[];
  sampleDataPolicy: string;
}

export interface ReportSecurityRequirement {
  rowLevelSecurity: string;
  sensitivity: string;
}

export interface RequirementsCoverage {
  complete: boolean;
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  nextQuestion: string;
}

export type SlicerPlacement = 'top-horizontal' | 'left-vertical' | 'right-vertical' | 'top-left-corner' | 'top-right-corner';

export interface ReportLayout {
  id: string;
  name: string;
  description: string;
  structure: string;
  visualizationCount: number;
  pageCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  thumbnail?: string;
  features: string[];
  slicerCount: number;
  hasReportHeader: boolean;
  slicerPlacement?: SlicerPlacement;
}

export interface ReportHeaderConfig {
  enabled: boolean;
  height: number;
  backgroundColor: string;
  titleText: string;
  includeLogo: boolean;
  includeDate: boolean;
}

export interface SlicerConfig {
  id: string;
  type: 'date' | 'category' | 'numeric' | 'text';
  field?: string;
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface VisualizationConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'card' | 'table' | 'matrix' | 'area' | 'scatter' | 'gauge' | 'map';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataFields?: string[];
  altText?: string;
}

export interface PageConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  reportHeader: ReportHeaderConfig;
  slicers: SlicerConfig[];
  visualizations: VisualizationConfig[];
}

export interface ReportConfigurationSpec {
  reportName: string;
  description: string;
  theme: PowerBITheme;
  layout: {
    id: string;
    name: string;
    complexity: string;
  };
  pages: PageConfig[];
  requirements: {
    description: string;
    visualizations: string[];
    keyMetrics: string[];
    customInstructions?: string;
  };
  metadata: {
    generatedAt: string;
    version: string;
  };
}

export interface ReportSimulation {
  theme: PowerBITheme;
  layouts: ReportLayout[];
  recommendedLayoutId: string;
  rationale: string;
  page: PageConfig;
  provider: string;
}

export type PenDocument = Record<string, unknown>;

export interface PenCanvasSession {
  fileName: string;
  absolutePath: string;
  vscodeUrl: string;
  cursorUrl: string;
  threadId?: string | null;
  model?: string;
  reasoningEffort?: 'high';
  canvasConnected?: boolean;
  canvasReadable?: boolean;
  canvasEdited?: boolean;
  executeAttempted?: boolean;
  requiresOpenFile?: boolean;
  editorAccess?: 'ready' | 'file-not-open' | 'editor-endpoint-mismatch';
  editorConflictLikely?: boolean;
  documentChanged?: boolean;
  failureMessage?: string;
  mcpCallCount?: number;
  screenshotDataUrl?: string;
  summary?: string;
  penDocument?: PenDocument;
  usage?: {
    input_tokens: number;
    cached_input_tokens: number;
    cache_write_input_tokens: number;
    output_tokens: number;
    reasoning_output_tokens: number;
  } | null;
}

export interface CodexAuthStatus {
  authenticated: boolean;
  mode: 'chatgpt' | 'api-key' | 'access-token' | 'unknown';
  message: string;
}

export interface CodexDeviceLoginState {
  state: 'idle' | 'starting' | 'waiting' | 'complete' | 'error';
  verificationUrl?: string;
  userCode?: string;
  message: string;
}

export type CodexWorkspaceStatus = 'starting' | 'ready' | 'running' | 'waiting-approval' | 'completed' | 'failed';

export interface CodexWorkspaceEvent {
  sequence: number;
  type: 'status' | 'user' | 'assistant' | 'tool' | 'error';
  text: string;
  status?: string;
  itemId?: string;
}

export interface CodexWorkspaceApproval {
  id: string;
  method: string;
  title: string;
  reason: string;
  command?: string;
  options: Array<'accept' | 'acceptForSession' | 'decline'>;
}

export interface CodexWorkspaceSession {
  workspaceId: string;
  threadId: string;
  activeTurnId?: string;
  status: CodexWorkspaceStatus;
  model: string;
  reasoningEffort: 'high';
  events: CodexWorkspaceEvent[];
  approvals: CodexWorkspaceApproval[];
  summary?: string;
  canvasReadable: boolean;
  canvasEdited: boolean;
  executeAttempted: boolean;
  documentChanged: boolean;
  mcpCallCount: number;
  failureMessage?: string;
  screenshotDataUrl?: string;
  penDocument?: PenDocument;
}
