import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  rows?: number;
  columns?: number;
}

export function DatasetUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const simulateUpload = (file: File) => {
    const uploadFile: UploadedFile = {
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    };
    setUploadedFile(uploadFile);

    const uploadInterval = setInterval(() => {
      setUploadedFile(prev => {
        if (!prev) return null;
        const newProgress = Math.min(prev.progress + 15, 100);
        if (newProgress === 100) {
          clearInterval(uploadInterval);
          setTimeout(() => {
            setUploadedFile(p => p ? { ...p, status: 'processing' } : null);
            setTimeout(() => {
              const completeFile: UploadedFile = {
                ...uploadFile,
                status: 'complete',
                progress: 100,
                rows: Math.floor(Math.random() * 5000) + 500,
                columns: Math.floor(Math.random() * 20) + 5,
              };
              setUploadedFile(completeFile);
            }, 1500);
          }, 500);
        }
        return { ...prev, progress: newProgress };
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.json'))) {
      simulateUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Area */}
      <div className="bg-card border border-border rounded-xl p-6">
        {!uploadedFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Upload className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-lg sm:text-xl font-medium mb-2">
              {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports CSV, XLSX, and JSON files up to 50MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </div>
              {uploadedFile.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {uploadedFile.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
            </div>

            {/* Progress */}
            {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadedFile.status === 'uploading' ? 'Uploading...' : 'Processing data...'}
                  </span>
                  <span>{uploadedFile.progress}%</span>
                </div>
                <Progress value={uploadedFile.progress} className="h-2" />
              </div>
            )}

            {/* Complete Stats */}
            {uploadedFile.status === 'complete' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-2xl font-bold text-primary">{uploadedFile.rows?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Rows</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-2xl font-bold text-accent">{uploadedFile.columns}</p>
                  <p className="text-sm text-muted-foreground">Columns</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preprocessing Options */}
      {uploadedFile?.status === 'complete' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Preprocessing Options</h3>
          <div className="grid gap-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-border w-4 h-4" />
              <span>Remove duplicates</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-border w-4 h-4" />
              <span>Handle missing values (mean imputation)</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
              <input type="checkbox" className="rounded border-border w-4 h-4" />
              <span>Normalize numeric features</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
              <input type="checkbox" className="rounded border-border w-4 h-4" />
              <span>Encode categorical variables</span>
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={resetUpload} className="flex-1">
              Upload Another
            </Button>
            <Button className="flex-1">
              Start Preprocessing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}