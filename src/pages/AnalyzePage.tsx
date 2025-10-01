import { useState, useEffect } from 'react';
import { useMockAuth } from '@/context/MockAuthContext';
import { uploadFile, getUserFiles, FileData } from '@/services/fileService';
import FileUploader from '@/components/FileUploader';
import { formatFileSize } from '@/utils/fileUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const AnalyzePage = () => {
  const { user } = useMockAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [uploadStatus, setUploadStatus] = useState<{success: boolean; message: string} | null>(null);
  const loadUserFiles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userFiles = await getUserFiles(user.uid);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = async (result: any) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setUploadStatus(null);
      
      // If we received a file object, upload it
      if (result?.file) {
        await uploadFile(result.file, user.uid);
        setUploadStatus({
          success: true,
          message: 'File uploaded successfully!'
        });
        await loadUserFiles();
      } else if (result?.data) {
        // If we received analysis data, just update the files list
        await loadUserFiles();
        setUploadStatus({
          success: true,
          message: 'File processed successfully!'
        });
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to process file. Please try again.'
      });
    } finally {
      setIsLoading(false);
      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Excel Analytics</h1>
        <div className="flex space-x-4">
          <Button 
            variant={activeTab === 'upload' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('history');
              loadUserFiles();
            }}
          >
            My Files
          </Button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Excel Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FileUploader onFileAnalyzed={handleFileUploaded} showAnalysisButton={false} />
                {uploadStatus && (
                  <div className={`p-4 rounded-md ${
                    uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {uploadStatus.message}
                  </div>
                )}
                {isLoading && (
                  <div className="p-4 text-blue-600">
                    Processing your file...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>My Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No files found. Upload your first file to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        {file.uploadedAt ? format(new Date(file.uploadedAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyzePage;
