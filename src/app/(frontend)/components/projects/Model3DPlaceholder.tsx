"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Box } from 'lucide-react';
import { toast } from 'sonner';

interface Model3DPlaceholderProps {
  projectId: string;
  projectName: string;
}

export function Model3DPlaceholder({ projectId, projectName }: Model3DPlaceholderProps) {
  const { t } = useLanguage();
  const { canEdit } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.skp')) {
        toast.success('Model byl úspěšně nahrán');
      } else {
        toast.error('Prosím nahrajte soubor ve formátu .skp');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 3D Model Placeholder */}
      <div className="flex-1 relative bg-gradient-to-br from-[#E9F4F0] via-[#D3E8E1] to-[#ADC9BC] flex items-center justify-center overflow-hidden">

        {/* 3D Icon */}
        <div className="flex flex-col items-center justify-center gap-4">
          <Box className="w-16 h-16 md:w-20 md:h-20 text-primary/60" strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg md:text-xl font-heading text-primary">{projectName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('model.loading')}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Upload Section */}
      {canEdit() && (
        <Card className="m-4 mb-20 md:m-6 md:mb-20 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('model.upload')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="model-file" className="text-sm text-muted-foreground">
                  SketchUp soubor (.skp)
                </Label>
                <Input
                  id="model-file"
                  type="file"
                  accept=".skp"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              <Button onClick={() => toast.info('Funkce bude dostupná po napojení backendu')}>
                {t('model.update')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
