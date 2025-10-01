import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react";
import { useMockAuth } from "@/context/MockAuthContext";
import { uploadFile, processExcelFile, saveAnalysis, generateInsights, saveInsights } from "@/services/mockFirebaseService";

export const FileUpload = () => {
  const { user } = useMockAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !user) return;
    setProcessing(true);
    setMessage(null);
    setProgress(0);
    setStatus('Uploading file...');

    try {
      const fileUrl = await uploadFile(uploadedFile, user.uid, (pct) => setProgress(pct));

      setStatus('Processing Excel...');
      const { columns, data } = await processExcelFile(fileUrl);
      setProgress(100);

      setStatus('Generating insights...');
      const insights = await generateInsights(data, columns);

      setStatus('Saving analysis...');
      const analysisId = await saveAnalysis({
        userId: user.uid,
        fileName: uploadedFile.name,
        fileUrl,
        date: new Date().toISOString(),
        chartType: "Bar Chart",
        status: "completed",
        insights: insights.length,
        columns,
        data: data.slice(0, 100),
      });

      setStatus('Saving insights...');
      if (insights.length > 0) {
        await saveInsights(insights.map(insight => ({
          ...insight,
          analysisId,
          createdAt: new Date().toISOString(),
        })));
      }

      setMessage("File analyzed successfully! Check your dashboard for insights.");
      setUploadedFile(null);
      setStatus('');
      setProgress(0);
      window.location.reload();
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      setMessage(`Error: ${error.message}`);
      setStatus('');
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section id="upload" className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Upload Your Excel File
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Drag and drop your Excel file or click to browse. We support .xls and .xlsx formats up to 10MB.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-data">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload your Excel file to get started with data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : uploadedFile
                    ? "border-success bg-success/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={processing}
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-success rounded-full mx-auto flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">File Uploaded Successfully!</h3>
                      <p className="text-muted-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {processing && (
                      <div className="space-y-1">
                        <div className="w-full bg-muted h-2 rounded">
                          <div className="bg-primary h-2 rounded" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{status} {progress > 0 && `${progress}%`}</p>
                      </div>
                    )}
                    <Button 
                      variant="analytics" 
                      className="mt-4" 
                      onClick={handleAnalyze}
                      disabled={processing || !user}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Analyze Data"
                      )}
                    </Button>
                    {!user && (
                      <p className="text-sm text-destructive">Please sign in to analyze files</p>
                    )}
                    {message && (
                      <p className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-success'}`}>
                        {message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Drop your Excel file here
                      </h3>
                      <p className="text-muted-foreground">
                        or click to browse from your computer
                      </p>
                    </div>
                    <Button variant="outline" disabled={processing}>
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Excel files (.xls, .xlsx)</li>
                      <li>Maximum file size: 10MB</li>
                      <li>Files are processed securely and stored in Firebase</li>
                      <li>AI insights are generated automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};