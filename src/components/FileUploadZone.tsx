import { useState, useRef, DragEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudArrowUp, Folder, CheckCircle } from '@phosphor-icons/react';
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
      <div className="p-16 text-center">
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".bim,.json,.pbix,.tmdl"
          id="file-upload-input"
        />
        
        <div className="flex flex-col items-center gap-6">
          {isUploaded ? (
            <>
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle size={56} weight="fill" className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Model Uploaded</h3>
                <p className="text-sm text-muted-foreground">{uploadedFileName}</p>
              </div>
              <Button variant="outline" onClick={handleClick} size="lg" className="gap-2">
                <Folder size={20} />
                Select Different Folder
              </Button>
            </>
          ) : (
            <>
              <div className={cn(
                'rounded-full bg-primary/10 p-6 transition-transform',
                isDragging && 'scale-110'
              )}>
                <CloudArrowUp size={56} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragging ? 'Drop files here' : 'Upload Semantic Model'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select your TMDL folder containing the semantic model definition files (.tmdl)
                </p>
              </div>
              <Button onClick={handleClick} size="lg" className="gap-2">
                <Folder size={20} />
                Select TMDL Folder
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
