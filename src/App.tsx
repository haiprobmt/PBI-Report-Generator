import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { PowerBITheme, WorkflowStep, ProgressStep, SemanticModel } from '@/lib/types';
import { DEFAULT_THEME } from '@/lib/themes';
import { FileUploadZone } from '@/components/FileUploadZone';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ProgressStream } from '@/components/ProgressStream';
import { StepIndicator } from '@/components/StepIndicator';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkle, DownloadSimple, ArrowSquareOut, ArrowRight } from '@phosphor-icons/react';

function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [theme, setTheme] = useKV<PowerBITheme>('powerbi-theme', DEFAULT_THEME);
  const [semanticModel, setSemanticModel] = useState<SemanticModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [generatedReport, setGeneratedReport] = useState<Blob | null>(null);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

  const currentTheme: PowerBITheme = theme ?? DEFAULT_THEME;

  const handleFilesSelected = (files: FileList) => {
    const fileArray = Array.from(files);
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    
    const model: SemanticModel = {
      id: Date.now().toString(),
      name: fileArray[0].name,
      files: fileArray,
      uploadedAt: new Date(),
      size: totalSize,
    };
    
    setSemanticModel(model);
    toast.success('Semantic model uploaded successfully!');
  };

  const handleThemeSave = (newTheme: PowerBITheme) => {
    setTheme(() => newTheme);
    setShowThemeCustomizer(false);
  };

  const addProgressStep = (message: string, status: ProgressStep['status'] = 'in-progress') => {
    const step: ProgressStep = {
      id: Date.now().toString() + Math.random(),
      message,
      status,
      timestamp: new Date(),
    };
    setProgressSteps((prev) => [...prev, step]);
    return step.id;
  };

  const updateProgressStep = (id: string, status: ProgressStep['status']) => {
    setProgressSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, status } : step))
    );
  };

  const simulateReportGeneration = async () => {
    setIsGenerating(true);
    setProgressSteps([]);

    const steps = [
      { message: 'Initializing AI agent...', delay: 800 },
      { message: 'Analyzing semantic model structure...', delay: 1500 },
      { message: 'Identifying key measures and dimensions...', delay: 1200 },
      { message: 'Determining optimal visualizations...', delay: 1800 },
      { message: 'Creating report layout...', delay: 1000 },
      { message: 'Applying custom theme...', delay: 900 },
      { message: 'Generating visualizations...', delay: 2000 },
      { message: 'Optimizing report performance...', delay: 1100 },
      { message: 'Finalizing Power BI report file...', delay: 1300 },
    ];

    for (const step of steps) {
      const stepId = addProgressStep(step.message, 'in-progress');
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      updateProgressStep(stepId, 'complete');
    }

    const mockReportBlob = new Blob(['Mock PBIX content'], { type: 'application/octet-stream' });
    setGeneratedReport(mockReportBlob);
    setIsGenerating(false);
    setCurrentStep('complete');
    toast.success('Report generated successfully!');
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const url = URL.createObjectURL(generatedReport);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${semanticModel?.name.replace(/\.[^/.]+$/, '')}-report.pbix`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  const handleOpenInPowerBI = () => {
    toast.info('Opening in Power BI Service...', {
      description: 'This would redirect to Power BI web service in production',
    });
  };

  if (showThemeCustomizer) {
    return (
      <ThemeCustomizer
        initialTheme={currentTheme}
        onSave={handleThemeSave}
        onCancel={() => setShowThemeCustomizer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,78,219,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(45,184,216,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkle size={36} weight="fill" className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Power BI Report Generator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your semantic model, customize your theme, and let AI generate a professional Power BI report
            </p>
          </div>

          <div className="mb-12">
            <StepIndicator currentStep={currentStep} />
          </div>

          {currentStep === 'upload' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                isUploaded={!!semanticModel}
                uploadedFileName={semanticModel?.name}
              />
              
              {semanticModel && (
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep('theme')}
                    className="gap-2"
                  >
                    Continue to Theme Selection
                    <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'theme' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <ThemeSelector
                selectedTheme={currentTheme}
                onCustomize={() => setShowThemeCustomizer(true)}
              />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep('upload')}
                >
                  Back to Upload
                </Button>
                <Button
                  size="lg"
                  onClick={() => setCurrentStep('generate')}
                  className="gap-2"
                >
                  Continue to Generation
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'generate' && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Generation Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Semantic Model</p>
                      <p className="font-medium">{semanticModel?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Theme</p>
                      <p className="font-medium">{currentTheme.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">File Size</p>
                      <p className="font-medium">
                        {((semanticModel?.size ?? 0) / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 flex flex-col items-center justify-center text-center">
                  <Sparkle size={48} weight="duotone" className="text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Generate</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    AI will analyze your model and create a comprehensive report
                  </p>
                  <Button
                    size="lg"
                    onClick={simulateReportGeneration}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    <Sparkle size={20} weight="fill" />
                    Generate Report
                  </Button>
                </Card>
              </div>

              <ProgressStream steps={progressSteps} isGenerating={isGenerating} />

              {!isGenerating && progressSteps.length > 0 && (
                <div className="flex justify-start mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('theme')}
                  >
                    Back to Theme
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="max-w-3xl mx-auto">
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                    <Sparkle size={32} weight="fill" className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Report Generated Successfully!</h2>
                  <p className="text-muted-foreground">
                    Your Power BI report is ready to download and use
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Report Name</p>
                    <p className="font-medium">{semanticModel?.name.replace(/\.[^/.]+$/, '')}-report.pbix</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Theme Applied</p>
                    <p className="font-medium">{currentTheme.name}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={handleDownloadReport}
                    className="gap-2 flex-1"
                  >
                    <DownloadSimple size={20} weight="bold" />
                    Download Report
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleOpenInPowerBI}
                    className="gap-2 flex-1"
                  >
                    <ArrowSquareOut size={20} />
                    Open in Power BI
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentStep('upload');
                      setSemanticModel(null);
                      setProgressSteps([]);
                      setGeneratedReport(null);
                    }}
                    className="w-full"
                  >
                    Generate Another Report
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App