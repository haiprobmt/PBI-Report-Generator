import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CircleNotch, CheckCircle, Warning } from '@phosphor-icons/react';
import { ProgressStep } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProgressStreamProps {
  steps: ProgressStep[];
  isGenerating: boolean;
}

export function ProgressStream({ steps, isGenerating }: ProgressStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const getStatusIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'in-progress':
        return <CircleNotch size={20} className="text-primary animate-spin" />;
      case 'complete':
        return <CheckCircle size={20} weight="fill" className="text-accent" />;
      case 'error':
        return <Warning size={20} weight="fill" className="text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: ProgressStep['status']) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="default" className="bg-primary">Processing</Badge>;
      case 'complete':
        return <Badge variant="default" className="bg-accent">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Generation Progress</h3>
        {isGenerating && (
          <Badge variant="default" className="bg-primary gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Generating...
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CircleNotch size={48} weight="light" className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Waiting to start generation...</p>
            </div>
          ) : (
            steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors',
                  step.status === 'in-progress' && 'bg-primary/5',
                  step.status === 'complete' && 'bg-accent/5',
                  step.status === 'error' && 'bg-destructive/5'
                )}
              >
                <div className="mt-0.5">{getStatusIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">{step.message}</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(step.status)}
                    <span className="text-xs text-muted-foreground">
                      {step.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
