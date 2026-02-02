"use client";

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimelineMilestone } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  milestones: TimelineMilestone[];
  projectName: string;
}

// Parse quarter format (Q1 2025) to Date
function parseQuarterDate(quarter: string): Date {
  const match = quarter.match(/Q(\d)\s*(\d{4})/);
  if (!match) return new Date();

  const q = parseInt(match[1]);
  const year = parseInt(match[2]);
  const month = (q - 1) * 3; // Q1 = 0, Q2 = 3, Q3 = 6, Q4 = 9

  return new Date(year, month, 1);
}

// Get current progress position
function getCurrentProgress(milestones: TimelineMilestone[]): number {
  const now = new Date();

  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i];
    const dateStr = milestone.dateTo || milestone.dateFrom;
    if (!dateStr) continue;

    const milestoneDate = parseQuarterDate(dateStr);

    if (now < milestoneDate) {
      // We're before this milestone
      if (i === 0) return 0;

      // Calculate progress between previous and current milestone
      const prevMilestone = milestones[i - 1];
      const prevDateStr = prevMilestone.dateTo || prevMilestone.dateFrom;
      if (!prevDateStr) return i - 1;

      const prevDate = parseQuarterDate(prevDateStr);
      const totalTime = milestoneDate.getTime() - prevDate.getTime();
      const elapsedTime = now.getTime() - prevDate.getTime();

      return (i - 1) + (elapsedTime / totalTime);
    }
  }

  // All milestones completed
  return milestones.length;
}

export function Timeline({ milestones, projectName }: TimelineProps) {
  const { t } = useLanguage();

  // Sort by order
  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.order - b.order),
    [milestones]
  );

  const currentProgress = useMemo(
    () => getCurrentProgress(sortedMilestones),
    [sortedMilestones]
  );

  if (milestones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl md:text-3xl font-heading text-foreground">
          {t('section.timeline')}
        </h1>
        <p className="text-muted-foreground mt-1">{projectName}</p>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 pb-20 max-w-2xl mx-auto">
          <div className="relative">
            {/* Milestones */}
            <div className="space-y-8">
              {sortedMilestones.map((milestone, index) => {
                const isCompleted = index < Math.floor(currentProgress);
                const isCurrentPhase =
                  index >= Math.floor(currentProgress) &&
                  index < Math.ceil(currentProgress);
                const isUpcoming = index >= Math.ceil(currentProgress);
                const isLast = index === sortedMilestones.length - 1;

                const formatDate = () => {
                  if (milestone.dateFrom && milestone.dateTo) {
                    return `${milestone.dateFrom} – ${milestone.dateTo}`;
                  }
                  return milestone.dateTo || milestone.dateFrom || '';
                };

                return (
                  <div
                    key={milestone.id}
                    className="relative pl-12 md:pl-16"
                  >
                    {/* Connecting Line (not for last item) */}
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-4 md:left-6 top-8 md:top-12 -bottom-8 w-0.5 -translate-x-1/2",
                          index < Math.floor(currentProgress) ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}

                    {/* Milestone Dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all z-10",
                        isCompleted && "bg-primary text-primary-foreground",
                        isCurrentPhase && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                        isUpcoming && "bg-muted border-2 border-border"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" />
                      ) : isCurrentPhase ? (
                        <Clock className="h-4 w-4 md:h-6 md:w-6 animate-pulse" />
                      ) : (
                        <Circle className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "pb-8 transition-opacity",
                        isUpcoming && "opacity-60"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3
                          className={cn(
                            "font-bold",
                            isCurrentPhase && "text-primary"
                          )}
                          style={{ fontSize: '30px' }}
                        >
                          {milestone.name}
                        </h3>
                        {isCurrentPhase && (
                          <Badge className="bg-primary text-primary-foreground">
                            {t('timeline.currentPhase')}
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="secondary" className="bg-daramis-green-100 text-daramis-green">
                            {t('timeline.completed')}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        {formatDate()}
                      </div>

                      {milestone.description && (
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
