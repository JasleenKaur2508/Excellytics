import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp, X, BarChart2 } from 'lucide-react';
import { analyzeExcel } from '@/services/fileService';
import { formatFileSize } from '@/utils/fileUtils';

interface FileUploaderProps {
  onFileAnalyzed: (analysis: any) => void;
  showAnalysisButton?: boolean;
}

export default function FileUploader({ onFileAnalyzed, showAnalysisButton = true }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'text/csv' ||
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls') ||
          selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: isUploading
  });


  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // If we're not showing the analysis button, just upload the file
      if (!showAnalysisButton) {
        // Call the callback with file info immediately
        onFileAnalyzed({ 
          file,
          fileName: file.name,
          size: file.size
        });
        return;
      }
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Analyze the file
      const analysis = await analyzeExcel(file);
      clearInterval(interval);
      setProgress(100);
      
      // Prepare the transformed data
      const transformedData = {
        data: analysis.sampleData.map((row: any[]) => {
          const obj: Record<string, any> = {};
          analysis.headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        }),
        columns: analysis.headers
      };
      
      // Update preview if we're showing the analysis UI
      if (showAnalysisButton) {
        setPreview({
          fileName: file.name,
          size: formatFileSize(file.size),
          analysis: transformedData
        });
      }
      
      // Notify parent component with transformed data
      onFileAnalyzed(showAnalysisButton ? transformedData : { 
        file,
        data: transformedData.data,
        columns: transformedData.columns,
        fileName: file.name,
        size: file.size
      });
    } catch (err) {
      console.error('Error analyzing file:', err);
      setError('Failed to analyze the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Excel or CSV File</CardTitle>
        <CardDescription>
          Drag and drop your file here, or click to select a file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileUp className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop your file here, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .xlsx, .xls, .csv (Max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Analyzing file...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {!isUploading && !preview && (
              <Button
                className="w-full"
                onClick={handleAnalyze}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analyze File
              </Button>
            )}
          </div>
        )}

        {preview && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Analysis Results</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">File Information</p>
                <div className="rounded-lg border p-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Name:</div>
                    <div className="truncate">{preview.fileName}</div>
                    <div className="text-muted-foreground">Size:</div>
                    <div>{preview.size}</div>
                    <div className="text-muted-foreground">Total Rows:</div>
                    <div>{preview.analysis.totalRows}</div>
                    <div className="text-muted-foreground">Total Columns:</div>
                    <div>{preview.analysis.totalColumns}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Columns</p>
                <div className="rounded-lg border p-4 space-y-2 max-h-60 overflow-y-auto">
                  {preview.analysis.headers.map((header: string, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{header}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        ({preview.analysis.columnStats[header]?.type || 'unknown'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
