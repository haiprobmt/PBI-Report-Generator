import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { PowerBITheme, WorkflowStep, SemanticModel, ReportRequirements, ReportLayout, ReportConfigurationSpec, DataFileContext, KnowledgeBase, PenDocument } from '@/lib/types';
import { analyzeFiles } from '@/lib/openAI';
import { DEFAULT_THEME } from '@/lib/themes';
import { createPenDevBaselineLayout, generateReportConfiguration } from '@/lib/configGenerator';
import { generateBuildInstructions, generatePenDocument, generateSampleCsv } from '@/lib/reportArtifacts';
import { formatRequirementsBrief } from '@/lib/requirements';
import { FileUploadZone } from '@/components/FileUploadZone';
import { DataPreview } from '@/components/DataPreview';
import { KnowledgeBasePreview } from '@/components/KnowledgeBasePreview';
import { SourceKnowledgeChat } from '@/components/SourceKnowledgeChat';
import { StepIndicator } from '@/components/StepIndicator';
import { RequirementAnalysis } from '@/components/RequirementAnalysis';
import { TemplateLayoutSelector } from '@/components/TemplateLayoutSelector';
import { ConfigurationSpecViewer } from '@/components/ConfigurationSpecViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkle, DownloadSimple, ArrowRight, FileText, Palette, FileArrowDown, Database } from '@phosphor-icons/react';
import JSZip from 'jszip';
import { useLanguage } from '@/lib/i18n';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [semanticModel, setSemanticModel] = useState<SemanticModel | null>(null);
  const [reportRequirements, setReportRequirements] = useKV<ReportRequirements | null>('report-requirements', null);
  const [selectedLayout, setSelectedLayout] = useKV<ReportLayout | null>('selected-layout', null);
  const [reportConfig, setReportConfig] = useState<ReportConfigurationSpec | null>(null);
  const [codexPenDocument, setCodexPenDocument] = useState<PenDocument | null>(null);
  const [dataContext, setDataContext] = useState<DataFileContext[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<PowerBITheme>(DEFAULT_THEME);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isAnalyzingFiles, setIsAnalyzingFiles] = useState(false);

  useEffect(() => {
    if (selectedLayout && semanticModel && reportRequirements) {
      const reportName = semanticModel.name.replace(/\.[^/.]+$/, '');
      const config = generateReportConfiguration(reportName, selectedTheme, selectedLayout, reportRequirements);
      setReportConfig(config);
      setCodexPenDocument(null);
    }
  }, [selectedLayout, semanticModel, reportRequirements, selectedTheme]);

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) {
      toast.error(t('selectSourceError'));
      return;
    }
    setIsAnalyzingFiles(true);
    setSemanticModel(null);
    setKnowledgeBase(null);
    setDataContext([]);
    setReportConfig(null);
    setCodexPenDocument(null);
    try {
      const analysis = await analyzeFiles(fileArray, language);
      const model: SemanticModel = {
        id: Date.now().toString(),
        name: fileArray.map((file) => file.name).join(', '),
        files: fileArray,
        uploadedAt: new Date(),
        size: fileArray.reduce((sum, file) => sum + file.size, 0),
      };
      setSemanticModel(model);
      setKnowledgeBase(analysis.knowledgeBase);
      setDataContext(analysis.dataContext);
      toast.success(t('sourcesAnalyzedToast', { count: fileArray.length }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('analysisFailed'));
    } finally {
      setIsAnalyzingFiles(false);
    }
  };

  const handleRequirementsSave = (requirements: ReportRequirements) => {
    setReportRequirements(() => requirements);
    setSelectedLayout(() => createPenDevBaselineLayout(requirements));
    toast.success(t('requirementsSaved'));
    setCurrentStep('layout');
  };

  const handleKnowledgeBaseApply = (nextKnowledgeBase: KnowledgeBase) => {
    setKnowledgeBase(nextKnowledgeBase);
    setReportRequirements(() => null);
    setSelectedLayout(() => null);
    setReportConfig(null);
    setCodexPenDocument(null);
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPen = () => {
    if (!reportConfig || !knowledgeBase) {
      toast.error(t('layoutRequired'));
      return;
    }
    const document = codexPenDocument ?? generatePenDocument(reportConfig, knowledgeBase, language);
    downloadBlob(new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }), `${reportConfig.reportName.replace(/[^a-z0-9-_]+/gi, '-')}.pen`);
    toast.success(t('penDownloaded'));
  };

  // Build a compact human-readable requirements companion to the agent instructions.
  const buildRequirementsMd = () => {
    if (!reportRequirements) return '';
    const mdSections = [formatRequirementsBrief(reportRequirements, language)];

    if (knowledgeBase) mdSections.push(
      ``, language === 'vi' ? `## Kiến thức nguồn` : `## Source Knowledge`,
      knowledgeBase.summary, ``, `${language === 'vi' ? 'Lĩnh vực' : 'Domain'}: ${knowledgeBase.domain}`,
    );

    if (reportConfig && reportConfig.pages.length > 0) {
      const page = reportConfig.pages[0];
      mdSections.push(
        ``,
        language === 'vi' ? `## Chi tiết Bố cục trang` : `## Page Layout Details`,
        ``,
        `${language === 'vi' ? 'Kích thước trang' : 'Page size'}: ${page.width} x ${page.height}`,
        ``,
        language === 'vi' ? `### Trực quan` : `### Visualizations`,
      );
      page.visualizations.forEach((vis, i) => {
        mdSections.push(
          `${i + 1}. **${vis.title}** (${vis.type})`,
          `   - ${language === 'vi' ? 'Vị trí' : 'Position'}: x=${vis.x}, y=${vis.y}`,
          `   - ${language === 'vi' ? 'Kích thước' : 'Size'}: ${vis.width} x ${vis.height}`,
          ...(vis.dataFields?.length ? [`   - ${language === 'vi' ? 'Trường dữ liệu' : 'Data fields'}: ${vis.dataFields.join(', ')}`] : []),
        );
      });
      if (page.slicers.length > 0) {
        mdSections.push(``, language === 'vi' ? `### Bộ lọc (Slicer)` : `### Slicers`);
        page.slicers.forEach((slicer, i) => {
          mdSections.push(
            `${i + 1}. **${slicer.label}** (${slicer.type})`,
            `   - ${language === 'vi' ? 'Vị trí' : 'Position'}: x=${slicer.x}, y=${slicer.y}`,
            `   - ${language === 'vi' ? 'Kích thước' : 'Size'}: ${slicer.width} x ${slicer.height}`,
            ...(slicer.field ? [`   - ${language === 'vi' ? 'Trường' : 'Field'}: ${slicer.field}`] : []),
          );
        });
      }
    }

    return mdSections.join('\n');
  };

  const handleExportZip = async () => {
    if (!semanticModel || !reportRequirements || !reportConfig || !knowledgeBase) {
      toast.error(t('exportIncomplete'));
      return;
    }
    const zip = new JSZip();

    const sourceFolder = zip.folder('sources')!;
    for (const file of semanticModel.files) {
      sourceFolder.file(file.name, file);
    }

    const dataFolder = zip.folder('data')!;
    const tabularFiles = semanticModel.files.filter((file) => /\.(csv|tsv|xlsx)$/i.test(file.name));
    tabularFiles.forEach((file) => dataFolder.file(file.name, file));
    if (!knowledgeBase.hasUsableTabularData) {
      dataFolder.file('sample-data.csv', generateSampleCsv(knowledgeBase, language));
    }

    const reqFolder = zip.folder('requirements')!;
      reqFolder.file('report-requirements.md', buildRequirementsMd());

    zip.folder('knowledge')!.file('knowledge-base.json', JSON.stringify(knowledgeBase, null, 2));
    zip.folder('design')!.file('report-layout.pen', JSON.stringify(codexPenDocument ?? generatePenDocument(reportConfig, knowledgeBase, language), null, 2));
    zip.folder('instructions')!.file('BUILD_REPORT.md', generateBuildInstructions({
      config: reportConfig,
      requirements: reportRequirements,
      knowledgeBase,
      sourceFileNames: semanticModel.files.map((file) => file.name),
      language,
    }));

    // themes/ folder — theme JSON
    const themesFolder = zip.folder('themes')!;
    const themeFileName = `${selectedTheme.name.replace(/\s+/g, '_')}_theme.json`;
    themesFolder.file(themeFileName, JSON.stringify(selectedTheme, null, 2));

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, 'power-bi-agent-build-package.zip');
      toast.success(t('packageDownloaded'));
    } catch (error) {
      console.error('Failed to generate ZIP:', error);
      toast.error(t('zipFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,78,219,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(45,184,216,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="mb-4 flex justify-end">
            <div className="inline-flex rounded-lg border bg-background p-1" aria-label="Language / Ngôn ngữ">
              <Button size="sm" variant={language === 'en' ? 'default' : 'ghost'} onClick={() => setLanguage('en')}>{t('english')}</Button>
              <Button size="sm" variant={language === 'vi' ? 'default' : 'ghost'} onClick={() => setLanguage('vi')}>{t('vietnamese')}</Button>
            </div>
          </div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkle size={36} weight="fill" className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              {t('appTitle')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('appSubtitle')}
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
                uploadedFileNames={semanticModel?.files.map(f => f.name)}
                isAnalyzing={isAnalyzingFiles}
              />

              {knowledgeBase && <KnowledgeBasePreview knowledgeBase={knowledgeBase} />}
              {knowledgeBase && semanticModel && (
                <SourceKnowledgeChat
                  key={semanticModel.id}
                  files={semanticModel.files}
                  knowledgeBase={knowledgeBase}
                  onApply={handleKnowledgeBaseApply}
                />
              )}
              {dataContext.length > 0 && <DataPreview files={dataContext} />}
              
              {semanticModel && (
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep('requirements')}
                    className="gap-2"
                  >
                    {t('clarifyRequirements')}
                    <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'requirements' && (
            <RequirementAnalysis
              onComplete={handleRequirementsSave}
              onBack={() => setCurrentStep('upload')}
              dataContext={dataContext}
              knowledgeBase={knowledgeBase}
            />
          )}

          {currentStep === 'layout' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <TemplateLayoutSelector
                requirements={reportRequirements ?? null}
                dataContext={dataContext}
                knowledgeBase={knowledgeBase}
                reportConfig={reportConfig}
                penDocument={reportConfig && knowledgeBase ? codexPenDocument ?? generatePenDocument(reportConfig, knowledgeBase, language) : null}
                onDownloadPen={handleDownloadPen}
                onPenDocumentUpdated={setCodexPenDocument}
              />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep('requirements')}
                >
                  {t('backRequirements')}
                </Button>
                <Button
                  size="lg"
                  onClick={() => setCurrentStep('download')}
                  disabled={!reportConfig || !codexPenDocument}
                  className="gap-2"
                >
                  {t('continueDownload')}
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'download' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                    <FileArrowDown size={28} weight="duotone" className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{t('exportTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('exportDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 flex items-start gap-3 border">
                    <div className="rounded-lg bg-blue-100 p-2.5">
                      <Database size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">data/</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {semanticModel ? `${semanticModel.files.length} ${t('sourceFiles')}` : '—'}
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-start gap-3 border">
                    <div className="rounded-lg bg-purple-100 p-2.5">
                      <FileText size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">instructions/</h3>
                      <p className="text-xs text-muted-foreground">
                        {reportRequirements ? t('skillRouting') : '—'}
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-start gap-3 border">
                    <div className="rounded-lg bg-pink-100 p-2.5">
                      <Palette size={20} className="text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">design/ + themes/</h3>
                      <p className="text-xs text-muted-foreground">
                        report-layout.pen + {selectedTheme.name}
                      </p>
                    </div>
                  </Card>
                </div>

                <Button
                  size="lg"
                  onClick={handleExportZip}
                  className="w-full gap-2"
                  disabled={!semanticModel || !reportRequirements || !reportConfig || !codexPenDocument}
                >
                  <DownloadSimple size={20} weight="bold" />
                  {t('exportPackage')}
                </Button>
              </Card>

              {reportConfig && (
                <ConfigurationSpecViewer config={reportConfig} />
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep('layout')}
                >
                  {t('backLayout')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep('upload');
                    setSemanticModel(null);
                    setDataContext([]);
                    setKnowledgeBase(null);
                    setReportRequirements(() => null);
                    setSelectedLayout(() => null);
                    setReportConfig(null);
                    setCodexPenDocument(null);
                    setSelectedTheme(DEFAULT_THEME);
                  }}
                >
                  {t('startOver')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
