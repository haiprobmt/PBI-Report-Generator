import { useState, useRef, DragEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudArrowUp, FileArrowUp, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  isUploaded: boolean;
  uploadedFileName?: string;
}

export function FileUploadZone({ onFilesSelected, isUploaded, uploadedFileName }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isDragging && 'border-primary bg-primary/5 shadow-lg',
        isUploaded && 'border-accent bg-accent/5'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".bim,.json,.pbix"
          id="file-upload-input"
        />
        
        <div className="flex flex-col items-center gap-4">
          {isUploaded ? (
            <>
              <div className="rounded-full bg-accent/10 p-4">
                <CheckCircle size={48} weight="fill" className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Model Uploaded</h3>
                <p className="text-sm text-muted-foreground">{uploadedFileName}</p>
              </div>
              <Button variant="outline" onClick={handleClick}>
                <FileArrowUp size={20} className="mr-2" />
                Upload Different Model
              </Button>
            </>
          ) : (
            <>
              <div className={cn(
                'rounded-full bg-primary/10 p-4 transition-transform',
                isDragging && 'scale-110'
              )}>
                <CloudArrowUp size={48} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {isDragging ? 'Drop files here' : 'Upload Semantic Model'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Drag and drop your semantic model files (.bim, .json, .pbix) or click to browse
                </p>
              </div>
              <Button onClick={handleClick} size="lg">
                <FileArrowUp size={20} className="mr-2" />
                Browse Files
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
