import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBar, Sliders, Database, Palette, Layout, CheckCircle, Sparkle, Table, ChartLine, ChartPie, Funnel, TreeStructure } from '@phosphor-icons/react';

interface ReportBuildingAnimationProps {
  isGenerating: boolean;
  isComplete: boolean;
  onGenerate?: () => void;
  disabled?: boolean;
}

const buildSteps = [
  { icon: Database, label: 'Loading Data Model', color: 'from-blue-500 to-blue-600', duration: 15 },
  { icon: Layout, label: 'Creating Layout', color: 'from-purple-500 to-purple-600', duration: 20 },
  { icon: Palette, label: 'Applying Theme', color: 'from-pink-500 to-pink-600', duration: 15 },
  { icon: ChartBar, label: 'Building Visuals', color: 'from-green-500 to-green-600', duration: 30 },
  { icon: Sliders, label: 'Adding Slicers', color: 'from-orange-500 to-orange-600', duration: 15 },
  { icon: CheckCircle, label: 'Finalizing Report', color: 'from-teal-500 to-teal-600', duration: 5 },
];

const visualTypes = [
  { icon: ChartBar, label: 'Bar Chart', color: 'bg-blue-500' },
  { icon: ChartLine, label: 'Line Chart', color: 'bg-green-500' },
  { icon: ChartPie, label: 'Pie Chart', color: 'bg-purple-500' },
  { icon: Table, label: 'Table', color: 'bg-gray-500' },
  { icon: Funnel, label: 'Funnel', color: 'bg-orange-500' },
  { icon: TreeStructure, label: 'Hierarchy', color: 'bg-teal-500' },
];

interface FloatingVisual {
  id: number;
  icon: typeof ChartBar;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  delay: number;
}

export function ReportBuildingAnimation({ isGenerating, isComplete, onGenerate, disabled }: ReportBuildingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [floatingVisuals, setFloatingVisuals] = useState<FloatingVisual[]>([]);
  const [pulseRings, setPulseRings] = useState<number[]>([]);

  // Generate dashboard layout visuals
  const dashboardLayout = useMemo(() => [
    { id: 1, x: 10, y: 50, width: 80, height: 35, color: 'bg-blue-400', icon: ChartBar },
    { id: 2, x: 100, y: 50, width: 80, height: 35, color: 'bg-green-400', icon: ChartLine },
    { id: 3, x: 190, y: 50, width: 80, height: 35, color: 'bg-purple-400', icon: ChartPie },
    { id: 4, x: 280, y: 50, width: 80, height: 35, color: 'bg-orange-400', icon: Table },
    { id: 5, x: 10, y: 95, width: 170, height: 70, color: 'bg-teal-400', icon: ChartBar },
    { id: 6, x: 190, y: 95, width: 170, height: 70, color: 'bg-indigo-400', icon: ChartLine },
    { id: 7, x: 10, y: 175, width: 115, height: 50, color: 'bg-pink-400', icon: Table },
    { id: 8, x: 135, y: 175, width: 115, height: 50, color: 'bg-amber-400', icon: ChartPie },
    { id: 9, x: 260, y: 175, width: 100, height: 50, color: 'bg-cyan-400', icon: Funnel },
  ], []);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setProgress(0);
      setFloatingVisuals([]);
      setPulseRings([]);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.5;
      });
    }, 50);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= buildSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    // Add floating visuals progressively
    dashboardLayout.forEach((visual, index) => {
      setTimeout(() => {
        setFloatingVisuals((prev) => [...prev, { ...visual, delay: index * 0.1 }]);
      }, 800 + index * 300);
    });

    // Pulse rings
    const pulseInterval = setInterval(() => {
      setPulseRings((prev) => [...prev, Date.now()]);
      setTimeout(() => {
        setPulseRings((prev) => prev.slice(1));
      }, 2000);
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(pulseInterval);
    };
  }, [isGenerating, dashboardLayout]);

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      setCurrentStep(buildSteps.length - 1);
    }
  }, [isComplete]);

  const CurrentStepIcon = buildSteps[currentStep]?.icon || Database;

  return (
    <Card className="p-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: isGenerating 
            ? [
                'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 50%, rgba(168,85,247,0.05) 100%)',
                'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, transparent 50%, rgba(34,197,94,0.05) 100%)',
                'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, transparent 50%, rgba(59,130,246,0.05) 100%)',
              ]
            : 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 50%, rgba(168,85,247,0.03) 100%)'
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={false}
            animate={{ scale: isGenerating ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: isGenerating ? Infinity : 0 }}
          >
            <h3 className="text-2xl font-bold mb-2">
              {isComplete ? '🎉 Dashboard Built Successfully!' : isGenerating ? 'Building Your Dashboard' : 'Ready to Build'}
            </h3>
          </motion.div>
          
          <p className="text-muted-foreground mb-4">
            {isComplete 
              ? 'Your Power BI report is ready to download' 
              : isGenerating 
              ? buildSteps[currentStep]?.label || 'Processing...'
              : 'Click Generate Report to start building'}
          </p>

          {/* Generate Button */}
          {!isGenerating && !isComplete && onGenerate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                onClick={onGenerate}
                disabled={disabled}
                className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Sparkle size={20} weight="fill" />
                Generate Report
              </Button>
            </motion.div>
          )}

          {/* Progress bar */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-4"
            >
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
            </motion.div>
          )}
        </div>

        {/* Main Animation Area */}
        <div className="relative max-w-2xl mx-auto h-[320px] flex items-center justify-center">
          {/* Pulse rings behind dashboard */}
          <AnimatePresence>
            {isGenerating && pulseRings.map((id) => (
              <motion.div
                key={id}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-[380px] h-[240px] rounded-xl border-2 border-primary/30" />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Dashboard Frame */}
          <motion.div
            animate={{
              scale: isComplete ? 1.02 : 1,
              boxShadow: isComplete 
                ? '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 4px rgba(34,197,94,0.3)'
                : '0 25px 50px -12px rgba(0,0,0,0.15)',
            }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative w-[380px] h-[240px] rounded-xl border-2 border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Title Bar */}
            <div className="h-8 bg-muted/50 border-b border-border flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 ml-3 h-4 bg-muted rounded text-[10px] flex items-center px-2 text-muted-foreground">
                Power BI Report
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="relative h-[208px] p-2 bg-gradient-to-br from-muted/20 to-muted/40">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />

              {/* Animated visuals */}
              <AnimatePresence>
                {floatingVisuals.map((visual) => {
                  const Icon = visual.icon;
                  return (
                    <motion.div
                      key={visual.id}
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        delay: visual.delay 
                      }}
                      className="absolute"
                      style={{
                        left: visual.x,
                        top: visual.y - 32,
                        width: visual.width,
                        height: visual.height,
                      }}
                    >
                      <motion.div
                        animate={isGenerating && !isComplete ? { 
                          boxShadow: ['0 2px 8px rgba(0,0,0,0.1)', '0 4px 12px rgba(0,0,0,0.15)', '0 2px 8px rgba(0,0,0,0.1)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`w-full h-full ${visual.color} rounded-md flex items-center justify-center border border-white/20 shadow-sm`}
                      >
                        <Icon size={Math.min(visual.width, visual.height) * 0.4} weight="fill" className="text-white/90" />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Completion overlay */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="bg-green-100 dark:bg-green-900/50 border-4 border-green-500 rounded-full p-4 shadow-2xl"
                  >
                    <CheckCircle size={48} weight="fill" className="text-green-600 dark:text-green-400" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Floating current step indicator */}
          {isGenerating && !isComplete && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -right-4 top-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${buildSteps[currentStep]?.color} flex items-center justify-center shadow-lg border-2 border-white/20`}
              >
                <CurrentStepIcon size={28} weight="fill" className="text-white" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Build Steps Progress */}
        <div className="mt-8">
          <div className="flex justify-center gap-2 flex-wrap max-w-xl mx-auto">
            {buildSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index || isComplete;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.1, 1] : 1,
                      opacity: isCompleted || isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? `bg-gradient-to-br ${step.color}` 
                        : isActive 
                        ? `bg-gradient-to-br ${step.color} ring-2 ring-offset-2 ring-primary/50` 
                        : 'bg-muted'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle size={18} weight="fill" className="text-white" />
                    ) : (
                      <Icon size={18} weight="fill" className={isCompleted || isActive ? 'text-white' : 'text-muted-foreground'} />
                    )}
                  </motion.div>
                  <span className={`text-[10px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.label.split(' ').slice(-1)[0]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Visual Types Legend */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center gap-4 flex-wrap"
        >
          {visualTypes.slice(0, 4).map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-1.5">
                <div className={`${item.color} w-5 h-5 rounded flex items-center justify-center`}>
                  <Icon size={12} weight="fill" className="text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
}
