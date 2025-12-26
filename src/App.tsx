import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { PowerBITheme } from '@/lib/types';
import { DEFAULT_THEME, PRESET_THEMES } from '@/lib/themes';
import { downloadTheme } from '@/lib/themeUtils';
import { ColorPicker } from '@/components/ColorPicker';
import { ThemePreview } from '@/components/ThemePreview';
import { PresetCard } from '@/components/PresetCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DownloadSimple, ArrowCounterClockwise, Palette, Sparkle } from '@phosphor-icons/react';

function App() {
  const [theme, setTheme] = useKV<PowerBITheme>('powerbi-theme', DEFAULT_THEME);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);

  const currentTheme: PowerBITheme = theme ?? DEFAULT_THEME;

  const updateThemeField = <K extends keyof PowerBITheme>(
    field: K,
    value: PowerBITheme[K]
  ) => {
    setTheme((current) => ({
      ...(current ?? DEFAULT_THEME),
      [field]: value,
    }));
  };

  const updateDataColor = (index: number, color: string) => {
    setTheme((current) => {
      const base = current ?? DEFAULT_THEME;
      const newDataColors = [...base.dataColors];
      newDataColors[index] = color;
      return { ...base, dataColors: newDataColors };
    });
  };

  const addDataColor = () => {
    setTheme((current) => {
      const base = current ?? DEFAULT_THEME;
      return {
        ...base,
        dataColors: [...base.dataColors, '#118DFF'],
      };
    });
    toast.success('Data color added');
  };

  const removeDataColor = (index: number) => {
    setTheme((current) => {
      const base = current ?? DEFAULT_THEME;
      return {
        ...base,
        dataColors: base.dataColors.filter((_, i) => i !== index),
      };
    });
    toast.success('Data color removed');
  };

  const handleExport = () => {
    downloadTheme(currentTheme);
    toast.success('Theme exported successfully!');
  };

  const handleReset = () => {
    setTheme(() => DEFAULT_THEME);
    toast.success('Theme reset to default');
  };

  const applyPreset = (preset: PowerBITheme) => {
    setTheme(() => preset);
    setPresetDialogOpen(false);
    toast.success(`Applied "${preset.name}" preset`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,78,219,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(45,184,216,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkle size={32} weight="fill" className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Power BI Theme Generator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create beautiful, professional Power BI themes with live preview and instant export
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Palette size={20} />
                      Browse Presets
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Theme Presets</DialogTitle>
                      <DialogDescription>
                        Choose from professionally designed presets to get started quickly
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {PRESET_THEMES.map((preset) => (
                          <PresetCard
                            key={preset.id}
                            preset={preset}
                            onSelect={() => applyPreset(preset.theme)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <ArrowCounterClockwise size={20} />
                  Reset
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleExport}
                  className="gap-2 ml-auto"
                >
                  <DownloadSimple size={20} weight="bold" />
                  Export Theme
                </Button>
              </div>

              <Card className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="data">Data Colors</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme-name" className="text-sm font-medium mb-2 block">
                          Theme Name
                        </Label>
                        <Input
                          id="theme-name"
                          value={currentTheme.name}
                          onChange={(e) => updateThemeField('name', e.target.value)}
                          placeholder="My Custom Theme"
                          className="text-base"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ColorPicker
                          label="Background"
                          value={currentTheme.background ?? '#FFFFFF'}
                          onChange={(value) => updateThemeField('background', value)}
                          description="Report background color"
                        />
                        <ColorPicker
                          label="Foreground"
                          value={currentTheme.foreground ?? '#000000'}
                          onChange={(value) => updateThemeField('foreground', value)}
                          description="Primary text color"
                        />
                        <ColorPicker
                          label="Table Accent"
                          value={currentTheme.tableAccent ?? '#118DFF'}
                          onChange={(value) => updateThemeField('tableAccent', value)}
                          description="Table header highlight"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-6 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Data Colors</h3>
                        <p className="text-sm text-muted-foreground">
                          Colors used for chart series and data points
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addDataColor}>
                        Add Color
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentTheme.dataColors.map((color, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <ColorPicker
                              label={`Color ${index + 1}`}
                              value={color}
                              onChange={(value) => updateDataColor(index, value)}
                            />
                          </div>
                          {currentTheme.dataColors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDataColor(index)}
                              className="mt-7 text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="sentiment" className="space-y-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-2">Sentiment Colors</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Colors for KPIs, indicators, and conditional formatting
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        label="Good"
                        value={currentTheme.good ?? '#00B050'}
                        onChange={(value) => updateThemeField('good', value)}
                        description="Positive metrics"
                      />
                      <ColorPicker
                        label="Neutral"
                        value={currentTheme.neutral ?? '#FFC000'}
                        onChange={(value) => updateThemeField('neutral', value)}
                        description="Neutral metrics"
                      />
                      <ColorPicker
                        label="Bad"
                        value={currentTheme.bad ?? '#FF0000'}
                        onChange={(value) => updateThemeField('bad', value)}
                        description="Negative metrics"
                      />
                      <ColorPicker
                        label="Maximum"
                        value={currentTheme.maximum ?? '#118DFF'}
                        onChange={(value) => updateThemeField('maximum', value)}
                        description="Maximum value in range"
                      />
                      <ColorPicker
                        label="Center"
                        value={currentTheme.center ?? '#FFC000'}
                        onChange={(value) => updateThemeField('center', value)}
                        description="Center value in range"
                      />
                      <ColorPicker
                        label="Minimum"
                        value={currentTheme.minimum ?? '#DEEFFF'}
                        onChange={(value) => updateThemeField('minimum', value)}
                        description="Minimum value in range"
                      />
                      <ColorPicker
                        label="Null"
                        value={currentTheme.null ?? '#FF7F48'}
                        onChange={(value) => updateThemeField('null', value)}
                        description="Null or missing data"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            <div className="lg:w-96">
              <div className="lg:sticky lg:top-6">
                <ThemePreview theme={currentTheme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App