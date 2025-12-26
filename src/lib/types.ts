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

export type WorkflowStep = 'upload' | 'requirements' | 'theme' | 'generate' | 'complete';

export interface ReportRequirements {
  description: string;
  visualizations: string[];
  keyMetrics: string[];
  customInstructions?: string;
}
