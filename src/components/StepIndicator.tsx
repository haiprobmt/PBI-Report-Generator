import { WorkflowStep } from '@/lib/types';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

const steps: { id: WorkflowStep; label: string; number: number }[] = [
  { id: 'upload', label: 'Upload Model', number: 1 },
  { id: 'requirements', label: 'Requirements', number: 2 },
  { id: 'theme', label: 'Select Theme', number: 3 },
  { id: 'generate', label: 'Generate Report', number: 4 },
  { id: 'complete', label: 'Result', number: 5 },
];

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const isStepComplete = (stepIndex: number) => stepIndex < currentStepIndex;
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStepIndex;
  const isStepClickable = (stepIndex: number) => stepIndex <= currentStepIndex;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={cn(
                'flex flex-col items-center gap-2 relative',
                isStepClickable(index) && onStepClick && 'cursor-pointer'
              )}
              onClick={() => isStepClickable(index) && onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 bg-white',
                  isStepComplete(index) &&
                    'shadow-md',
                  isStepCurrent(index) &&
                    'shadow-lg scale-110'
                )}
              >
                {isStepComplete(index) ? (
                  <CheckCircle size={32} weight="fill" className="text-green-500" />
                ) : (
                  <span className={cn(
                    "font-semibold text-lg",
                    isStepCurrent(index) ? "text-primary" : "text-muted-foreground"
                  )}>{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium text-center whitespace-nowrap transition-colors',
                  isStepCurrent(index) && 'text-primary',
                  isStepComplete(index) && 'text-green-600',
                  !isStepComplete(index) &&
                    !isStepCurrent(index) &&
                    'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-border relative">
                <div
                  className={cn(
                    'absolute inset-0 bg-green-500 transition-all duration-300',
                    isStepComplete(index) ? 'w-full' : 'w-0'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
