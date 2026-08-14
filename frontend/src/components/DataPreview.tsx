import { DataFileContext } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Table as TableIcon } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n';

interface DataPreviewProps {
  files: DataFileContext[];
}

export function DataPreview({ files }: DataPreviewProps) {
  const { t } = useLanguage();
  if (files.length === 0) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Eye size={22} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{t('dataPreview')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dataPreviewDescription')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {files.some((file) => file.isSampleData) && <Badge variant="outline" className="border-amber-300 text-amber-700">{t('sampleData')}</Badge>}
          <Badge variant="secondary">{files.length} {files.length === 1 ? t('table') : t('tables')}</Badge>
        </div>
      </div>

      <Tabs defaultValue="file-0">
        <TabsList className="w-full justify-start overflow-x-auto">
          {files.map((file, index) => (
            <TabsTrigger key={`${file.fileName}-${file.sheetName || index}`} value={`file-${index}`} className="max-w-52 truncate">
              {file.fileName}
              {file.sheetName ? ` · ${file.sheetName}` : ''}
            </TabsTrigger>
          ))}
        </TabsList>

        {files.map((file, index) => {
          const visibleHeaders = file.headers.slice(0, 12);
          return (
            <TabsContent key={`${file.fileName}-${file.sheetName || index}`} value={`file-${index}`} className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1 font-normal">
                  <TableIcon size={13} /> {file.rowCount.toLocaleString()} {t('rows')}
                </Badge>
                <Badge variant="outline" className="font-normal">{file.headers.length} {t('columns')}</Badge>
                {file.headers.length > visibleHeaders.length && (
                  <Badge variant="outline" className="font-normal">{t('showingColumns', { count: visibleHeaders.length })}</Badge>
                )}
              </div>

              <ScrollArea className="w-full rounded-md border">
                <div className="min-w-max max-h-[360px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="w-12 border-b border-r px-3 py-2 text-right font-medium text-muted-foreground">#</th>
                        {visibleHeaders.map((header, headerIndex) => (
                          <th key={`${header}-${headerIndex}`} className="min-w-36 border-b border-r px-3 py-2 text-left font-semibold last:border-r-0">
                            {header || `Column ${headerIndex + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {file.sampleRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="odd:bg-background even:bg-muted/30">
                          <td className="border-r px-3 py-2 text-right text-xs text-muted-foreground">{rowIndex + 1}</td>
                          {visibleHeaders.map((_, cellIndex) => (
                            <td key={cellIndex} className="max-w-64 truncate border-r px-3 py-2 last:border-r-0" title={row[cellIndex] || ''}>
                              {row[cellIndex] || <span className="text-muted-foreground">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {file.sampleRows.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">{t('noRows')}</div>
                  )}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">{t('previewRows', { count: file.sampleRows.length })}</p>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
