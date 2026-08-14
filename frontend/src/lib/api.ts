/**
 * Backend API Service
 * Connects the frontend to the FastAPI backend for report generation
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UploadModelResponse {
  session_id: string;
  model_summary: string;
  tables: string[];
  file_count: number;
  data_source_type: 'tmdl' | 'csv';
  original_csv_files?: string[];
  transformed_tables?: TransformedTable[];
  identified_domain?: string;
}

export interface TransformedTable {
  name: string;
  type: 'dimension' | 'fact';
  columns: string[];
  rowCount: number;
  description?: string;
}

export interface ThemeColors {
  name: string;
  dataColors: string[];
  background?: string;
  foreground?: string;
  tableAccent?: string;
}

export interface ReportRequirements {
  description: string;
  visualizations: string[];
  keyMetrics: string[];
  customInstructions?: string;
  slicerCount: number;
}

export interface LayoutConfiguration {
  reportName: string;
  description: string;
  theme: ThemeColors;
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

export interface PageConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  reportHeader: {
    enabled: boolean;
    height: number;
    backgroundColor: string;
    titleText: string;
    includeLogo: boolean;
    includeDate: boolean;
  };
  slicers: SlicerConfig[];
  visualizations: VisualizationConfig[];
}

export interface SlicerConfig {
  id: string;
  type: string;
  field?: string;
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface VisualizationConfig {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataFields?: string[];
}

export interface GenerateReportRequest {
  requirements: ReportRequirements;
  theme: ThemeColors;
  layoutConfig?: LayoutConfiguration;
}

export interface GenerationStartResponse {
  generation_id: string;
  status: string;
}

export interface ProgressEvent {
  step: string;
  message: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  agent?: string;
  details?: string;
  timestamp: string;
  node_id?: string;
  node_status?: string;
  attempt?: number;
  dag_nodes?: DAGNode[];
}

export interface DAGNode {
  id: string;
  label: string;
  description: string;
  dependencies: string[];
  status?: 'pending' | 'in-progress' | 'complete' | 'error' | 'retry';
}

export interface GenerationStatus {
  session_id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: ProgressEvent[];
  result_path?: string;
  error?: string;
}

export interface CompleteEvent {
  status: 'complete' | 'error';
  result_path?: string;
  error?: string;
}

class BackendAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check if the backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the DAG structure for pipeline visualization
   */
  async getDAGStructure(dataSourceType: 'tmdl' | 'csv' = 'tmdl'): Promise<{ nodes: DAGNode[]; data_source_type: string }> {
    const response = await fetch(`${this.baseUrl}/api/dag-structure?data_source_type=${dataSourceType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch DAG structure');
    }
    return response.json();
  }

  /**
   * Upload semantic model files to the backend
   */
  async uploadModel(files: File[], dataSourceType: 'tmdl' | 'csv' = 'tmdl'): Promise<UploadModelResponse> {
    const formData = new FormData();
    
    for (const file of files) {
      // Use webkitRelativePath if available (for folder uploads), otherwise just filename
      const path = (file as any).webkitRelativePath || file.name;
      formData.append('files', file, path);
    }

    const response = await fetch(
      `${this.baseUrl}/api/upload-model?data_source_type=${dataSourceType}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload model');
    }

    return response.json();
  }

  /**
   * Get information about an uploaded model
   */
  async getModelInfo(sessionId: string): Promise<{
    session_id: string;
    model_summary: string;
    tables: string[];
    uploaded_at: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/model/${sessionId}`);
    if (!response.ok) {
      throw new Error('Model not found');
    }
    return response.json();
  }

  /**
   * Start the report generation process
   */
  async startGeneration(sessionId: string, request: GenerateReportRequest): Promise<GenerationStartResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Generation failed' }));
      throw new Error(error.detail || 'Failed to start generation');
    }

    return response.json();
  }

  /**
   * Subscribe to generation progress via Server-Sent Events
   */
  subscribeToProgress(
    generationId: string,
    onProgress: (event: ProgressEvent) => void,
    onComplete: (event: CompleteEvent) => void,
    onError: (error: Error) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/generate/${generationId}/stream`);

    eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data) as ProgressEvent;
        onProgress(data);
      } catch (e) {
        console.error('Failed to parse progress event:', e);
      }
    });

    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data) as CompleteEvent;
        onComplete(data);
        eventSource.close();
      } catch (e) {
        console.error('Failed to parse complete event:', e);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      onError(new Error('Connection to server lost'));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Get current generation status
   */
  async getGenerationStatus(generationId: string): Promise<GenerationStatus> {
    const response = await fetch(`${this.baseUrl}/api/generate/${generationId}/status`);
    if (!response.ok) {
      throw new Error('Generation session not found');
    }
    return response.json();
  }

  /**
   * Open the generated report (triggers system open on backend)
   */
  async openReport(generationId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/open-report/${generationId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to open report' }));
      throw new Error(error.detail || 'Failed to open report');
    }

    return response.json();
  }

  /**
   * Download the generated report as a zip file
   */
  async downloadReport(generationId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/download/${generationId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || 'Failed to download report');
    }

    return response.blob();
  }

  /**
   * Get the download URL for a report
   */
  getDownloadUrl(generationId: string): string {
    return `${this.baseUrl}/api/download/${generationId}`;
  }
}

export const backendAPI = new BackendAPI();
export default backendAPI;
