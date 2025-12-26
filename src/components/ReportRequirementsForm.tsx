import { useState } from 'react';
import { ReportRequirements } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Lightbulb } from '@phosphor-icons/react';

interface ReportRequirementsFormProps {
  initialRequirements?: ReportRequirements;
  onSave: (requirements: ReportRequirements) => void;
}

const SUGGESTED_VISUALIZATIONS = [
  'Bar Chart',
  'Line Chart',
  'Pie Chart',
  'Table',
  'Matrix',
  'Card',
  'KPI',
  'Map',
  'Scatter Chart',
  'Waterfall',
  'Treemap',
  'Gauge'
];

const SUGGESTED_METRICS = [
  'Total Sales',
  'Revenue',
  'Profit Margin',
  'Growth Rate',
  'Customer Count',
  'Average Order Value',
  'Conversion Rate',
  'Market Share'
];

export function ReportRequirementsForm({
  initialRequirements,
  onSave
}: ReportRequirementsFormProps) {
  const [description, setDescription] = useState(initialRequirements?.description || '');
  const [visualizations, setVisualizations] = useState<string[]>(
    initialRequirements?.visualizations || []
  );
  const [keyMetrics, setKeyMetrics] = useState<string[]>(
    initialRequirements?.keyMetrics || []
  );
  const [customInstructions, setCustomInstructions] = useState(
    initialRequirements?.customInstructions || ''
  );
  const [newVisualization, setNewVisualization] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [showVisualizationSuggestions, setShowVisualizationSuggestions] = useState(false);
  const [showMetricSuggestions, setShowMetricSuggestions] = useState(false);

  const addVisualization = (viz: string) => {
    if (viz.trim() && !visualizations.includes(viz.trim())) {
      setVisualizations([...visualizations, viz.trim()]);
      setNewVisualization('');
      setShowVisualizationSuggestions(false);
    }
  };

  const removeVisualization = (viz: string) => {
    setVisualizations(visualizations.filter((v) => v !== viz));
  };

  const addMetric = (metric: string) => {
    if (metric.trim() && !keyMetrics.includes(metric.trim())) {
      setKeyMetrics([...keyMetrics, metric.trim()]);
      setNewMetric('');
      setShowMetricSuggestions(false);
    }
  };

  const removeMetric = (metric: string) => {
    setKeyMetrics(keyMetrics.filter((m) => m !== metric));
  };

  const handleSubmit = () => {
    if (!description.trim()) return;

    const requirements: ReportRequirements = {
      description: description.trim(),
      visualizations,
      keyMetrics,
      customInstructions: customInstructions.trim() || undefined
    };

    onSave(requirements);
  };

  const isValid = description.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <Lightbulb size={24} weight="duotone" className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Report Requirements</h3>
            <p className="text-sm text-muted-foreground">
              Describe what you want in your Power BI report. The AI will use this to generate the perfect layout.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Report Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this report... (e.g., 'A sales dashboard showing monthly revenue trends, top products, and regional performance')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear description of what insights you want to show
            </p>
          </div>

          <div className="space-y-3">
            <Label>Desired Visualizations</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add visualization type..."
                value={newVisualization}
                onChange={(e) => setNewVisualization(e.target.value)}
                onFocus={() => setShowVisualizationSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addVisualization(newVisualization);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addVisualization(newVisualization)}
                disabled={!newVisualization.trim()}
              >
                <Plus size={20} />
              </Button>
            </div>

            {showVisualizationSuggestions && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {SUGGESTED_VISUALIZATIONS.filter(
                  (viz) => !visualizations.includes(viz)
                ).map((viz) => (
                  <Badge
                    key={viz}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent/10"
                    onClick={() => addVisualization(viz)}
                  >
                    {viz}
                  </Badge>
                ))}
              </div>
            )}

            {visualizations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visualizations.map((viz) => (
                  <Badge key={viz} className="gap-1 pr-1">
                    {viz}
                    <button
                      onClick={() => removeVisualization(viz)}
                      className="ml-1 hover:bg-primary-foreground/20 rounded-sm p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Key Metrics</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add key metric..."
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                onFocus={() => setShowMetricSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMetric(newMetric);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addMetric(newMetric)}
                disabled={!newMetric.trim()}
              >
                <Plus size={20} />
              </Button>
            </div>

            {showMetricSuggestions && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {SUGGESTED_METRICS.filter(
                  (metric) => !keyMetrics.includes(metric)
                ).map((metric) => (
                  <Badge
                    key={metric}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent/10"
                    onClick={() => addMetric(metric)}
                  >
                    {metric}
                  </Badge>
                ))}
              </div>
            )}

            {keyMetrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keyMetrics.map((metric) => (
                  <Badge key={metric} className="gap-1 pr-1">
                    {metric}
                    <button
                      onClick={() => removeMetric(metric)}
                      className="ml-1 hover:bg-primary-foreground/20 rounded-sm p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customInstructions">Additional Instructions (Optional)</Label>
            <Textarea
              id="customInstructions"
              placeholder="Any specific layout preferences, filters, or special requirements..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isValid}
          className="gap-2"
        >
          Save Requirements
        </Button>
      </div>
    </div>
  );
}
