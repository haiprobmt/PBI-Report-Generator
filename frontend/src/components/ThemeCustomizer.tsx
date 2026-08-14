import { useState, useMemo } from 'react';
import { PowerBITheme } from '@/lib/types';
import { DEFAULT_THEME, PRESET_THEMES } from '@/lib/themes';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Palette, MagnifyingGlass, Check } from '@phosphor-icons/react';

interface ThemeCustomizerProps {
  initialTheme: PowerBITheme;
  onSave: (theme: PowerBITheme) => void;
  onCancel: () => void;
}

export function ThemeCustomizer({ initialTheme, onSave, onCancel }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState<PowerBITheme>(initialTheme);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Themes', count: PRESET_THEMES.length },
    { id: 'business', label: 'Business', count: PRESET_THEMES.filter(p => p.category === 'business').length },
    { id: 'creative', label: 'Creative', count: PRESET_THEMES.filter(p => p.category === 'creative').length },
    { id: 'nature', label: 'Nature', count: PRESET_THEMES.filter(p => p.category === 'nature').length },
    { id: 'minimal', label: 'Minimal', count: PRESET_THEMES.filter(p => p.category === 'minimal').length },
    { id: 'bold', label: 'Bold', count: PRESET_THEMES.filter(p => p.category === 'bold').length },
  ];

  const filteredPresets = useMemo(() => {
    return PRESET_THEMES.filter(preset => {
      const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const updateThemeField = <K extends keyof PowerBITheme>(
    field: K,
    value: PowerBITheme[K]
  ) => {
    setTheme((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateDataColor = (index: number, color: string) => {
    setTheme((current) => {
      const newDataColors = [...current.dataColors];
      newDataColors[index] = color;
      return { ...current, dataColors: newDataColors };
    });
  };

  const addDataColor = () => {
    setTheme((current) => ({
      ...current,
      dataColors: [...current.dataColors, '#118DFF'],
    }));
    toast.success('Data color added');
  };

  const removeDataColor = (index: number) => {
    setTheme((current) => ({
      ...current,
      dataColors: current.dataColors.filter((_, i) => i !== index),
    }));
    toast.success('Data color removed');
  };

  const applyPreset = (preset: PowerBITheme) => {
    setTheme(preset);
    setPresetDialogOpen(false);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const handleSave = () => {
    onSave(theme);
    toast.success('Theme saved successfully!');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Button variant="ghost" onClick={onCancel} className="gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Generator
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Customize Theme</h2>
          <p className="text-muted-foreground mt-2">
            Design your perfect Power BI theme with live preview
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
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
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <Input
                        id="preset-search"
                        placeholder="Search themes by name, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <Badge
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-accent/50 transition-colors px-3 py-1.5"
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          {cat.label} ({cat.count})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <ScrollArea className="h-[50vh] pr-4">
                    {filteredPresets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Palette size={48} weight="light" className="text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">No themes found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {filteredPresets.map((preset) => (
                          <PresetCard
                            key={preset.id}
                            preset={preset}
                            onSelect={() => applyPreset(preset.theme)}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              
              <Button
                size="lg"
                onClick={handleSave}
                className="gap-2 ml-auto"
              >
                <Check size={20} weight="bold" />
                Save & Apply Theme
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
                        value={theme.name}
                        onChange={(e) => updateThemeField('name', e.target.value)}
                        placeholder="My Custom Theme"
                        className="text-base"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        label="Background"
                        value={theme.background ?? '#FFFFFF'}
                        onChange={(value) => updateThemeField('background', value)}
                        description="Report background color"
                      />
                      <ColorPicker
                        label="Foreground"
                        value={theme.foreground ?? '#000000'}
                        onChange={(value) => updateThemeField('foreground', value)}
                        description="Primary text color"
                      />
                      <ColorPicker
                        label="Table Accent"
                        value={theme.tableAccent ?? '#118DFF'}
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
                    {theme.dataColors.map((color, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ColorPicker
                            label={`Color ${index + 1}`}
                            value={color}
                            onChange={(value) => updateDataColor(index, value)}
                          />
                        </div>
                        {theme.dataColors.length > 1 && (
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
                      value={theme.good ?? '#00B050'}
                      onChange={(value) => updateThemeField('good', value)}
                      description="Positive metrics"
                    />
                    <ColorPicker
                      label="Neutral"
                      value={theme.neutral ?? '#FFC000'}
                      onChange={(value) => updateThemeField('neutral', value)}
                      description="Neutral metrics"
                    />
                    <ColorPicker
                      label="Bad"
                      value={theme.bad ?? '#FF0000'}
                      onChange={(value) => updateThemeField('bad', value)}
                      description="Negative metrics"
                    />
                    <ColorPicker
                      label="Maximum"
                      value={theme.maximum ?? '#118DFF'}
                      onChange={(value) => updateThemeField('maximum', value)}
                      description="Maximum value in range"
                    />
                    <ColorPicker
                      label="Center"
                      value={theme.center ?? '#FFC000'}
                      onChange={(value) => updateThemeField('center', value)}
                      description="Center value in range"
                    />
                    <ColorPicker
                      label="Minimum"
                      value={theme.minimum ?? '#DEEFFF'}
                      onChange={(value) => updateThemeField('minimum', value)}
                      description="Minimum value in range"
                    />
                    <ColorPicker
                      label="Null"
                      value={theme.null ?? '#FF7F48'}
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
              <ThemePreview theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
