"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PDFDocument } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Maximize2, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFStandardsProps {
  pdfs: PDFDocument[];
  projectName: string;
}

export function PDFStandards({ pdfs, projectName }: PDFStandardsProps) {
  const [selectedPdf, setSelectedPdf] = useState<PDFDocument | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useLanguage();

  // Sort by order
  const sortedPdfs = [...pdfs].sort((a, b) => a.order - b.order);

  if (pdfs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  // If only one PDF, show it directly
  if (pdfs.length === 1) {
    const pdf = pdfs[0];
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 md:p-6 border-b border-border bg-card flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-heading">{pdf.name}</h1>
            <p className="text-muted-foreground text-sm">{projectName}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 bg-muted">
          <iframe
            src={pdf.file}
            className="w-full h-full"
            title={pdf.name}
          />
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <iframe
              src={pdf.file}
              className="w-full h-full"
              title={pdf.name}
            />
          </div>
        )}
      </div>
    );
  }

  // Grid view for multiple PDFs
  if (!selectedPdf) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border bg-card">
          <h1 className="text-2xl md:text-3xl font-heading text-foreground">
            {t('section.standards')}
          </h1>
          <p className="text-muted-foreground mt-1">{projectName}</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedPdfs.map((pdf) => (
                <Card
                  key={pdf.id}
                  className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden p-0 gap-1"
                  onClick={() => setSelectedPdf(pdf)}
                >
                  {/* Image with no top padding */}
                  <AspectRatio ratio={4 / 3} className="bg-muted rounded-t-lg overflow-hidden">
                    {pdf.thumbnail ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${pdf.thumbnail})`,
                          backgroundColor: '#E9F4F0',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-daramis-green-100 to-daramis-green-200">
                        <FileText className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                  </AspectRatio>
                  {/* Title with 12px padding top (from image) and 12px padding bottom */}
                  <CardContent className="px-3 pt-3 pb-3">
                    <h3 className="font-medium text-lg">{pdf.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Selected PDF view
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPdf(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-heading">{selectedPdf.name}</h1>
            <p className="text-muted-foreground text-sm">{projectName}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 bg-muted">
        <iframe
          src={selectedPdf.file}
          className="w-full h-full"
          title={selectedPdf.name}
        />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <iframe
            src={selectedPdf.file}
            className="w-full h-full"
            title={selectedPdf.name}
          />
        </div>
      )}
    </div>
  );
}
