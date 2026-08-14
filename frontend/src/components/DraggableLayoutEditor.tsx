import { useState, DragEvent, MouseEvent, useEffect, useRef } from 'react';
import { VisualizationConfig, SlicerConfig, ReportHeaderConfig, ReportRequirements, PowerBITheme } from '@/lib/types';
import { optimizeLayoutWithAI, calculateLayoutScore, detectOverlaps } from '@/lib/layoutOptimizer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import {
  ChartBar,
  ChartLine,
  ChartPie,
  Table,
  Hash,
  MapPin,
  ChartScatter,
  Gauge,
  GridFour,
  Calendar,
  Funnel,
  TextAa,
  Trash,
  Copy,
  Sparkle,
  Warning,
  ArrowCounterClockwise,
  ArrowClockwise,
  FloppyDisk,
  FolderOpen,
  ArrowsOut,
  GridNine
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DraggableLayoutEditorProps {
  initialVisualizations: VisualizationConfig[];
  initialSlicers: SlicerConfig[];
  reportHeader: ReportHeaderConfig;
  requirements?: ReportRequirements;
  theme?: PowerBITheme;
  onUpdate: (visualizations: VisualizationConfig[], slicers: SlicerConfig[]) => void;
}

interface VisualIconConfig {
  type: VisualizationConfig['type'];
  icon: typeof ChartBar;
  label: string;
  color: string;
}

interface LayoutHistoryState {
  visualizations: VisualizationConfig[];
  slicers: SlicerConfig[];
}

interface SavedLayout {
  name: string;
  visualizations: VisualizationConfig[];
  slicers: SlicerConfig[];
  canvasWidth: number;
  canvasHeight: number;
  savedAt: string;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

const VISUAL_ICONS: VisualIconConfig[] = [
  { type: 'card', icon: Hash, label: 'KPI Card', color: 'text-blue-600' },
  { type: 'bar', icon: ChartBar, label: 'Bar Chart', color: 'text-purple-600' },
  { type: 'line', icon: ChartLine, label: 'Line Chart', color: 'text-green-600' },
  { type: 'pie', icon: ChartPie, label: 'Pie Chart', color: 'text-orange-600' },
  { type: 'table', icon: Table, label: 'Table', color: 'text-gray-600' },
  { type: 'matrix', icon: GridFour, label: 'Matrix', color: 'text-indigo-600' },
  { type: 'area', icon: ChartLine, label: 'Area Chart', color: 'text-teal-600' },
  { type: 'scatter', icon: ChartScatter, label: 'Scatter', color: 'text-pink-600' },
  { type: 'gauge', icon: Gauge, label: 'Gauge', color: 'text-red-600' },
  { type: 'map', icon: MapPin, label: 'Map', color: 'text-cyan-600' },
];

const SLICER_ICONS = [
  { type: 'date' as const, icon: Calendar, label: 'Date Slicer', color: 'text-blue-600' },
  { type: 'category' as const, icon: Funnel, label: 'Category', color: 'text-purple-600' },
  { type: 'numeric' as const, icon: Hash, label: 'Numeric', color: 'text-green-600' },
  { type: 'text' as const, icon: TextAa, label: 'Text', color: 'text-orange-600' },
];

export function DraggableLayoutEditor({
  initialVisualizations,
  initialSlicers,
  reportHeader,
  requirements,
  theme,
  onUpdate,
}: DraggableLayoutEditorProps) {
  const [visualizations, setVisualizations] = useState<VisualizationConfig[]>(initialVisualizations);
  const [slicers, setSlicers] = useState<SlicerConfig[]>(initialSlicers);
  const [draggedVisual, setDraggedVisual] = useState<VisualizationConfig | null>(null);
  const [draggedSlicer, setDraggedSlicer] = useState<SlicerConfig | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [newVisualType, setNewVisualType] = useState<VisualizationConfig['type'] | null>(null);
  const [newSlicerType, setNewSlicerType] = useState<SlicerConfig['type'] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [layoutScore, setLayoutScore] = useState<number | null>(null);
  
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number } | null>(null);
  
  const [history, setHistory] = useState<LayoutHistoryState[]>([{
    visualizations: initialVisualizations,
    slicers: initialSlicers,
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [savedLayouts, setSavedLayouts] = useKV<SavedLayout[]>('saved-layouts', []);
  
  const [resizingItem, setResizingItem] = useState<{ id: string; type: 'visual' | 'slicer'; handle: ResizeHandle } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; itemX: number; itemY: number } | null>(null);
  
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 });
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);
  const [canvasResizeStart, setCanvasResizeStart] = useState<{ width: number; height: number; mouseX: number; mouseY: number } | null>(null);
  
  const [snapToGrid, setSnapToGrid] = useKV<boolean>('snap-to-grid-enabled', true);
  const [gridSize, setGridSize] = useKV<number>('grid-size', 20);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const PAGE_WIDTH = canvasSize.width;
  const PAGE_HEIGHT = canvasSize.height;
  const HEADER_HEIGHT = reportHeader.enabled ? reportHeader.height : 0;

  const snapToGridFn = (value: number, grid: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / grid) * grid;
  };

  const currentGridSize = gridSize ?? 20;

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (resizingItem && resizeStart && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = PAGE_WIDTH / rect.width;
        const scaleY = PAGE_HEIGHT / rect.height;
        
        const deltaX = (e.clientX - resizeStart.x) * scaleX;
        const deltaY = (e.clientY - resizeStart.y) * scaleY;

        if (resizingItem.type === 'visual') {
          setVisualizations((prev) => prev.map((item) => {
            if (item.id !== resizingItem.id) return item;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = resizeStart.itemX;
            let newY = resizeStart.itemY;

            const handle = resizingItem.handle;
            
            if (handle === 'se' || handle === 'e' || handle === 'ne') {
              newWidth = Math.max(100, resizeStart.width + deltaX);
            }
            if (handle === 'sw' || handle === 'w' || handle === 'nw') {
              newWidth = Math.max(100, resizeStart.width - deltaX);
              newX = resizeStart.itemX + (resizeStart.width - newWidth);
            }
            if (handle === 'se' || handle === 's' || handle === 'sw') {
              newHeight = Math.max(80, resizeStart.height + deltaY);
            }
            if (handle === 'ne' || handle === 'n' || handle === 'nw') {
              newHeight = Math.max(80, resizeStart.height - deltaY);
              newY = resizeStart.itemY + (resizeStart.height - newHeight);
            }

            newWidth = snapToGridFn(newWidth, currentGridSize);
            newHeight = snapToGridFn(newHeight, currentGridSize);
            newX = snapToGridFn(newX, currentGridSize);
            newY = snapToGridFn(newY, currentGridSize);

            newX = Math.max(0, Math.min(newX, PAGE_WIDTH - newWidth));
            newY = Math.max(HEADER_HEIGHT, Math.min(newY, PAGE_HEIGHT - newHeight));
            newWidth = Math.min(newWidth, PAGE_WIDTH - newX);
            newHeight = Math.min(newHeight, PAGE_HEIGHT - newY);

            return { ...item, width: newWidth, height: newHeight, x: newX, y: newY };
          }));
        } else {
          setSlicers((prev) => prev.map((item) => {
            if (item.id !== resizingItem.id) return item;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = resizeStart.itemX;
            let newY = resizeStart.itemY;

            const handle = resizingItem.handle;
            
            if (handle === 'se' || handle === 'e' || handle === 'ne') {
              newWidth = Math.max(100, resizeStart.width + deltaX);
            }
            if (handle === 'sw' || handle === 'w' || handle === 'nw') {
              newWidth = Math.max(100, resizeStart.width - deltaX);
              newX = resizeStart.itemX + (resizeStart.width - newWidth);
            }
            if (handle === 'se' || handle === 's' || handle === 'sw') {
              newHeight = Math.max(80, resizeStart.height + deltaY);
            }
            if (handle === 'ne' || handle === 'n' || handle === 'nw') {
              newHeight = Math.max(80, resizeStart.height - deltaY);
              newY = resizeStart.itemY + (resizeStart.height - newHeight);
            }

            newWidth = snapToGridFn(newWidth, currentGridSize);
            newHeight = snapToGridFn(newHeight, currentGridSize);
            newX = snapToGridFn(newX, currentGridSize);
            newY = snapToGridFn(newY, currentGridSize);

            newX = Math.max(0, Math.min(newX, PAGE_WIDTH - newWidth));
            newY = Math.max(HEADER_HEIGHT, Math.min(newY, PAGE_HEIGHT - newHeight));
            newWidth = Math.min(newWidth, PAGE_WIDTH - newX);
            newHeight = Math.min(newHeight, PAGE_HEIGHT - newY);

            return { ...item, width: newWidth, height: newHeight, x: newX, y: newY };
          }));
        }
      }

      if (isResizingCanvas && canvasResizeStart) {
        const deltaX = e.clientX - canvasResizeStart.mouseX;
        const deltaY = e.clientY - canvasResizeStart.mouseY;
        
        const newWidth = Math.max(800, Math.min(2560, canvasResizeStart.width + deltaX));
        const newHeight = Math.max(600, Math.min(1440, canvasResizeStart.height + deltaY));
        
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (resizingItem) {
        addToHistory(visualizations, slicers);
        onUpdate(visualizations, slicers);
        setResizingItem(null);
        setResizeStart(null);
      }
      if (isResizingCanvas) {
        setIsResizingCanvas(false);
        setCanvasResizeStart(null);
      }
    };

    if (resizingItem || isResizingCanvas) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingItem, resizeStart, visualizations, slicers, isResizingCanvas, canvasResizeStart, PAGE_WIDTH, PAGE_HEIGHT, HEADER_HEIGHT, snapToGrid, currentGridSize]);

  const addToHistory = (newVisualizations: VisualizationConfig[], newSlicers: SlicerConfig[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      visualizations: JSON.parse(JSON.stringify(newVisualizations)),
      slicers: JSON.parse(JSON.stringify(newSlicers)),
    });
    
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex((prev) => prev + 1);
    }
    
    setHistory(newHistory);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setVisualizations(JSON.parse(JSON.stringify(state.visualizations)));
      setSlicers(JSON.parse(JSON.stringify(state.slicers)));
      onUpdate(state.visualizations, state.slicers);
      toast.success('Undo');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setVisualizations(JSON.parse(JSON.stringify(state.visualizations)));
      setSlicers(JSON.parse(JSON.stringify(state.slicers)));
      onUpdate(state.visualizations, state.slicers);
      toast.success('Redo');
    }
  };

  const saveLayout = () => {
    const layoutName = prompt('Enter a name for this layout:');
    if (!layoutName) return;

    const newLayout: SavedLayout = {
      name: layoutName,
      visualizations: JSON.parse(JSON.stringify(visualizations)),
      slicers: JSON.parse(JSON.stringify(slicers)),
      canvasWidth: PAGE_WIDTH,
      canvasHeight: PAGE_HEIGHT,
      savedAt: new Date().toISOString(),
    };

    setSavedLayouts((prev) => [...(prev || []), newLayout]);
    toast.success(`Layout "${layoutName}" saved!`);
  };

  const loadLayout = () => {
    if (!savedLayouts || savedLayouts.length === 0) {
      toast.error('No saved layouts found');
      return;
    }

    const layoutOptions = savedLayouts
      .map((layout, index) => `${index + 1}. ${layout.name} (${new Date(layout.savedAt).toLocaleDateString()})`)
      .join('\n');

    const selection = prompt(`Select a layout to load:\n\n${layoutOptions}\n\nEnter the number:`);
    if (!selection) return;

    const index = parseInt(selection) - 1;
    if (isNaN(index) || index < 0 || index >= savedLayouts.length) {
      toast.error('Invalid selection');
      return;
    }

    const layout = savedLayouts[index];
    setVisualizations(JSON.parse(JSON.stringify(layout.visualizations)));
    setSlicers(JSON.parse(JSON.stringify(layout.slicers)));
    setCanvasSize({ width: layout.canvasWidth, height: layout.canvasHeight });
    addToHistory(layout.visualizations, layout.slicers);
    onUpdate(layout.visualizations, layout.slicers);
    toast.success(`Layout "${layout.name}" loaded!`);
  };

  const handleResizeStart = (e: MouseEvent, id: string, type: 'visual' | 'slicer', handle: ResizeHandle) => {
    e.stopPropagation();
    
    const item = type === 'visual' 
      ? visualizations.find(v => v.id === id)
      : slicers.find(s => s.id === id);
    
    if (!item) return;

    setResizingItem({ id, type, handle });
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.width,
      height: item.height,
      itemX: item.x,
      itemY: item.y,
    });
  };

  const handleCanvasResizeStart = (e: MouseEvent) => {
    e.stopPropagation();
    setIsResizingCanvas(true);
    setCanvasResizeStart({
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, visual: VisualizationConfig) => {
    if (resizingItem) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const scaleX = visual.width / rect.width;
    const scaleY = visual.height / rect.height;
    
    setDragStartOffset({
      x: offsetX * scaleX,
      y: offsetY * scaleY,
    });
    setDraggedVisual(visual);
  };

  const handleSlicerDragStart = (e: DragEvent<HTMLDivElement>, slicer: SlicerConfig) => {
    if (resizingItem) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const scaleX = slicer.width / rect.width;
    const scaleY = slicer.height / rect.height;
    
    setDragStartOffset({
      x: offsetX * scaleX,
      y: offsetY * scaleY,
    });
    setDraggedSlicer(slicer);
  };

  const handleNewVisualDragStart = (type: VisualizationConfig['type']) => {
    setIsDraggingNew(true);
    setNewVisualType(type);
  };

  const handleNewSlicerDragStart = (type: SlicerConfig['type']) => {
    setIsDraggingNew(true);
    setNewSlicerType(type);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = PAGE_WIDTH / rect.width;
    const scaleY = PAGE_HEIGHT / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (isDraggingNew && newVisualType) {
      const rawX = Math.max(0, Math.min(mouseX - 100, PAGE_WIDTH - 200));
      const rawY = Math.max(HEADER_HEIGHT, Math.min(mouseY - 75, PAGE_HEIGHT - 150));
      
      const newVisual: VisualizationConfig = {
        id: `visual-${Date.now()}`,
        type: newVisualType,
        title: `New ${newVisualType}`,
        x: snapToGridFn(rawX, currentGridSize),
        y: snapToGridFn(rawY, currentGridSize),
        width: snapToGridFn(200, currentGridSize),
        height: snapToGridFn(150, currentGridSize),
      };
      const updated = [...visualizations, newVisual];
      setVisualizations(updated);
      addToHistory(updated, slicers);
      onUpdate(updated, slicers);
      setIsDraggingNew(false);
      setNewVisualType(null);
    } else if (isDraggingNew && newSlicerType) {
      const rawX = Math.max(0, Math.min(mouseX - 90, PAGE_WIDTH - 180));
      const rawY = Math.max(HEADER_HEIGHT, Math.min(mouseY - 50, PAGE_HEIGHT - 100));
      
      const newSlicer: SlicerConfig = {
        id: `slicer-${Date.now()}`,
        type: newSlicerType,
        label: `${newSlicerType} Filter`,
        x: snapToGridFn(rawX, currentGridSize),
        y: snapToGridFn(rawY, currentGridSize),
        width: snapToGridFn(180, currentGridSize),
        height: snapToGridFn(100, currentGridSize),
      };
      const updated = [...slicers, newSlicer];
      setSlicers(updated);
      addToHistory(visualizations, updated);
      onUpdate(visualizations, updated);
      setIsDraggingNew(false);
      setNewSlicerType(null);
    } else if (draggedVisual && dragStartOffset) {
      const x = mouseX - dragStartOffset.x;
      const y = mouseY - dragStartOffset.y;
      
      const updated = visualizations.map((v) =>
        v.id === draggedVisual.id
          ? {
              ...v,
              x: snapToGridFn(Math.max(0, Math.min(x, PAGE_WIDTH - v.width)), currentGridSize),
              y: snapToGridFn(Math.max(HEADER_HEIGHT, Math.min(y, PAGE_HEIGHT - v.height)), currentGridSize),
            }
          : v
      );
      setVisualizations(updated);
      addToHistory(updated, slicers);
      onUpdate(updated, slicers);
      setDraggedVisual(null);
      setDragStartOffset(null);
    } else if (draggedSlicer && dragStartOffset) {
      const x = mouseX - dragStartOffset.x;
      const y = mouseY - dragStartOffset.y;
      
      const updated = slicers.map((s) =>
        s.id === draggedSlicer.id
          ? {
              ...s,
              x: snapToGridFn(Math.max(0, Math.min(x, PAGE_WIDTH - s.width)), currentGridSize),
              y: snapToGridFn(Math.max(HEADER_HEIGHT, Math.min(y, PAGE_HEIGHT - s.height)), currentGridSize),
            }
          : s
      );
      setSlicers(updated);
      addToHistory(visualizations, updated);
      onUpdate(visualizations, updated);
      setDraggedSlicer(null);
      setDragStartOffset(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const deleteVisual = (id: string) => {
    const updated = visualizations.filter((v) => v.id !== id);
    setVisualizations(updated);
    addToHistory(updated, slicers);
    onUpdate(updated, slicers);
    setSelectedId(null);
  };

  const deleteSlicer = (id: string) => {
    const updated = slicers.filter((s) => s.id !== id);
    setSlicers(updated);
    addToHistory(visualizations, updated);
    onUpdate(visualizations, updated);
    setSelectedId(null);
  };

  const duplicateVisual = (visual: VisualizationConfig) => {
    const newVisual: VisualizationConfig = {
      ...visual,
      id: `visual-${Date.now()}`,
      x: visual.x + 20,
      y: visual.y + 20,
    };
    const updated = [...visualizations, newVisual];
    setVisualizations(updated);
    addToHistory(updated, slicers);
    onUpdate(updated, slicers);
  };

  const handleOptimizeLayout = async () => {
    if (!requirements || !theme) {
      toast.error('Requirements and theme are needed for AI optimization');
      return;
    }

    if (visualizations.length === 0 && slicers.length === 0) {
      toast.error('Add some visuals to the canvas first');
      return;
    }

    setIsOptimizing(true);
    toast.info('AI is optimizing your layout...', {
      description: 'This may take a few moments',
    });

    try {
      const result = await optimizeLayoutWithAI(
        visualizations,
        slicers,
        reportHeader,
        requirements,
        theme,
        {
          pageWidth: PAGE_WIDTH,
          pageHeight: PAGE_HEIGHT,
          reportHeaderHeight: HEADER_HEIGHT,
        }
      );

      setVisualizations(result.visualizations);
      setSlicers(result.slicers);
      setLayoutScore(result.score);
      onUpdate(result.visualizations, result.slicers);

      toast.success(`Layout optimized! Score: ${result.score}/100`, {
        description: result.improvements.slice(0, 2).join(', '),
      });
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize layout');
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateLayoutScore = () => {
    const score = calculateLayoutScore(visualizations, slicers, {
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      reportHeaderHeight: HEADER_HEIGHT,
      slicerAreaHeight: 120,
      minSpacing: 10,
      preferredSpacing: 20,
    });
    setLayoutScore(score);
  };

  const overlaps = detectOverlaps(visualizations, slicers);

  const getVisualIcon = (type: VisualizationConfig['type']) => {
    return VISUAL_ICONS.find((v) => v.type === type) || VISUAL_ICONS[0];
  };

  const getSlicerIcon = (type: SlicerConfig['type']) => {
    return SLICER_ICONS.find((s) => s.type === type) || SLICER_ICONS[0];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Visual Gallery</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {VISUAL_ICONS.map((visual) => (
                <div
                  key={visual.type}
                  draggable
                  onDragStart={() => handleNewVisualDragStart(visual.type)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-move transition-colors"
                >
                  <visual.icon size={20} weight="duotone" className={visual.color} />
                  <span className="text-sm font-medium">{visual.label}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Slicers</h3>
          <div className="space-y-2">
            {SLICER_ICONS.map((slicer) => (
              <div
                key={slicer.type}
                draggable
                onDragStart={() => handleNewSlicerDragStart(slicer.type)}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-move transition-colors"
              >
                <slicer.icon size={20} weight="duotone" className={slicer.color} />
                <span className="text-sm font-medium">{slicer.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkle size={20} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">AI Layout Optimizer</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Let AI automatically arrange your visuals for optimal readability and visual hierarchy. It ensures no overlaps, proper spacing, and follows Power BI best practices.
              </p>
            </div>
          </div>
        </Card>

        <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <p className="font-semibold mb-2">How to use:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Drag visuals from gallery to canvas</li>
            <li>Drag existing items to reposition</li>
            <li>Click to select and resize/delete/duplicate</li>
            <li>Drag canvas corner to resize canvas</li>
            <li>Toggle snap-to-grid for precise alignment</li>
            <li>Use AI Optimize for automatic arrangement</li>
            <li>Save/Load custom layouts</li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold">Layout Canvas</h3>
              <p className="text-xs text-muted-foreground">
                {PAGE_WIDTH} x {PAGE_HEIGHT}px
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {overlaps.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Warning size={14} weight="fill" />
                  {overlaps.length} Overlap{overlaps.length > 1 ? 's' : ''}
                </Badge>
              )}
              {layoutScore !== null && (
                <Badge 
                  variant={layoutScore >= 80 ? 'default' : layoutScore >= 60 ? 'secondary' : 'destructive'}
                  className="gap-1"
                >
                  Score: {layoutScore}/100
                </Badge>
              )}
              <Badge variant="secondary">
                {visualizations.length} Visuals
              </Badge>
              <Badge variant="secondary">
                {slicers.length} Slicers
              </Badge>
              
              <div className="h-4 w-px bg-border" />
              
              <Button
                onClick={undo}
                variant="outline"
                size="sm"
                disabled={historyIndex === 0}
                title="Undo"
                className="gap-1"
              >
                <ArrowCounterClockwise size={16} />
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                size="sm"
                disabled={historyIndex === history.length - 1}
                title="Redo"
                className="gap-1"
              >
                <ArrowClockwise size={16} />
              </Button>
              
              <div className="h-4 w-px bg-border" />
              
              <Button
                onClick={saveLayout}
                variant="outline"
                size="sm"
                disabled={visualizations.length === 0 && slicers.length === 0}
                className="gap-1"
              >
                <FloppyDisk size={16} />
                Save
              </Button>
              <Button
                onClick={loadLayout}
                variant="outline"
                size="sm"
                disabled={!savedLayouts || savedLayouts.length === 0}
                className="gap-1"
              >
                <FolderOpen size={16} />
                Load
              </Button>
              
              <div className="h-4 w-px bg-border" />
              
              <Button
                onClick={updateLayoutScore}
                variant="outline"
                size="sm"
                disabled={visualizations.length === 0 && slicers.length === 0}
                className="gap-1"
              >
                Calculate Score
              </Button>
              <Button
                onClick={handleOptimizeLayout}
                disabled={isOptimizing || (visualizations.length === 0 && slicers.length === 0) || !requirements || !theme}
                size="sm"
                className="gap-2"
              >
                <Sparkle size={16} weight="fill" />
                {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <GridNine size={20} weight="duotone" className="text-primary" />
              <Label htmlFor="snap-to-grid" className="font-semibold text-sm">
                Snap to Grid
              </Label>
              <Switch
                id="snap-to-grid"
                checked={snapToGrid ?? true}
                onCheckedChange={(checked) => setSnapToGrid(() => checked)}
              />
            </div>
            
            <div className="h-4 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <Label htmlFor="grid-size" className="text-sm text-muted-foreground whitespace-nowrap">
                Grid Size:
              </Label>
              <select
                id="grid-size"
                value={currentGridSize}
                onChange={(e) => setGridSize(() => Number(e.target.value))}
                disabled={!snapToGrid}
                className="h-8 px-2 text-sm border border-border rounded-md bg-background disabled:opacity-50"
              >
                <option value="10">10px</option>
                <option value="20">20px</option>
                <option value="40">40px</option>
                <option value="80">80px</option>
              </select>
            </div>
            
            {snapToGrid && (
              <p className="text-xs text-muted-foreground ml-auto">
                Visuals will align to {currentGridSize}px grid for precise positioning
              </p>
            )}
          </div>

          <div
            ref={canvasRef}
            className="relative bg-white border-2 border-border rounded-lg overflow-hidden"
            style={{
              aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
              backgroundImage: snapToGrid 
                ? `repeating-linear-gradient(0deg, transparent, transparent ${currentGridSize - 1}px, #e5e7eb ${currentGridSize - 1}px, #e5e7eb ${currentGridSize}px), repeating-linear-gradient(90deg, transparent, transparent ${currentGridSize - 1}px, #e5e7eb ${currentGridSize - 1}px, #e5e7eb ${currentGridSize}px)`
                : 'none',
              backgroundSize: snapToGrid ? `${currentGridSize}px ${currentGridSize}px` : 'auto',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {reportHeader.enabled && (
              <div
                className="absolute top-0 left-0 right-0 flex items-center justify-center text-white font-semibold"
                style={{
                  height: `${(HEADER_HEIGHT / PAGE_HEIGHT) * 100}%`,
                  backgroundColor: reportHeader.backgroundColor,
                }}
              >
                {reportHeader.titleText}
              </div>
            )}

            {slicers.map((slicer) => {
              const slicerIcon = getSlicerIcon(slicer.type);
              return (
                <div
                  key={slicer.id}
                  draggable
                  onDragStart={(e) => handleSlicerDragStart(e, slicer)}
                  onClick={() => setSelectedId(slicer.id)}
                  className={cn(
                    'absolute border-2 rounded-md flex flex-col items-center justify-center cursor-move transition-all',
                    selectedId === slicer.id
                      ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
                      : 'border-purple-300 bg-purple-50 hover:border-purple-400'
                  )}
                  style={{
                    left: `${(slicer.x / PAGE_WIDTH) * 100}%`,
                    top: `${(slicer.y / PAGE_HEIGHT) * 100}%`,
                    width: `${(slicer.width / PAGE_WIDTH) * 100}%`,
                    height: `${(slicer.height / PAGE_HEIGHT) * 100}%`,
                  }}
                >
                  <slicerIcon.icon size={16} weight="duotone" className={slicerIcon.color} />
                  <span className="text-xs font-medium mt-1">{slicer.label}</span>
                  {selectedId === slicer.id && (
                    <>
                      <div className="absolute -top-8 right-0 flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlicer(slicer.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                      {/* Resize handles */}
                      <div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(e, slicer.id, 'slicer', 'nw')}
                      />
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, slicer.id, 'slicer', 'ne')}
                      />
                      <div
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, slicer.id, 'slicer', 'sw')}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, slicer.id, 'slicer', 'se')}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {visualizations.map((visual) => {
              const visualIcon = getVisualIcon(visual.type);
              return (
                <div
                  key={visual.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, visual)}
                  onClick={() => setSelectedId(visual.id)}
                  className={cn(
                    'absolute border-2 rounded-md flex flex-col items-center justify-center cursor-move transition-all',
                    selectedId === visual.id
                      ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  )}
                  style={{
                    left: `${(visual.x / PAGE_WIDTH) * 100}%`,
                    top: `${(visual.y / PAGE_HEIGHT) * 100}%`,
                    width: `${(visual.width / PAGE_WIDTH) * 100}%`,
                    height: `${(visual.height / PAGE_HEIGHT) * 100}%`,
                  }}
                >
                  <visualIcon.icon size={20} weight="duotone" className={visualIcon.color} />
                  <span className="text-xs font-medium mt-1">{visual.title}</span>
                  {selectedId === visual.id && (
                    <>
                      <div className="absolute -top-8 right-0 flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateVisual(visual);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVisual(visual.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                      {/* Resize handles */}
                      <div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(e, visual.id, 'visual', 'nw')}
                      />
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, visual.id, 'visual', 'ne')}
                      />
                      <div
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, visual.id, 'visual', 'sw')}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, visual.id, 'visual', 'se')}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {/* Canvas resize handle */}
            <div
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full cursor-se-resize flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              onMouseDown={handleCanvasResizeStart}
              title="Resize canvas"
            >
              <ArrowsOut size={14} weight="bold" className="text-primary-foreground" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
