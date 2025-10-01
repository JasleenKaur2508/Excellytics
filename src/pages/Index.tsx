import { useState } from 'react';
import { analyzeExcel } from '@/services/fileService';
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import FileUploader from "@/components/FileUploader";
import { DataAnalysis } from "@/components/DataAnalysis";
import { AIInsights } from "@/components/AIInsights";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [analysisData, setAnalysisData] = useState<{data: any[], columns: string[]} | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileAnalyzed = async (analysis: any) => {
    // If we receive a file object, analyze it
    if (analysis?.file) {
      try {
        const result = await analyzeExcel(analysis.file);
        // Transform the data for the DataAnalysis component
        const transformedData = {
          data: result.sampleData.map((row: any[]) => {
            const obj: Record<string, any> = {};
            result.headers.forEach((header: string, index: number) => {
              obj[header] = row[index];
            });
            return obj;
          }),
          columns: result.headers
        };
        
        setAnalysisData(transformedData);
        setFileUploaded(true);
      } catch (error) {
        console.error('Error analyzing file:', error);
      }
    } else if (analysis?.data && analysis?.columns) {
      // Handle case where we already have the processed data
      setAnalysisData({
        data: Array.isArray(analysis.data) ? analysis.data : [],
        columns: Array.isArray(analysis.columns) ? analysis.columns : []
      });
      setFileUploaded(true);
    } else {
      console.error('Invalid analysis data format:', analysis);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="space-y-12 pb-12">
        <HeroSection />
        
        {/* File Upload Section */}
        <section id="upload" className="container mx-auto px-4 pt-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Upload Your Excel File</h2>
            <FileUploader onFileAnalyzed={handleFileAnalyzed} showAnalysisButton={true} />
          </div>
        </section>

        {/* Data Analysis Section */}
        {fileUploaded && analysisData && (
          <section className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Data Analysis Dashboard</h2>
              <div className="w-full">
                <DataAnalysis 
                  data={analysisData?.data || []}
                  columns={analysisData?.columns || []}
                />
              </div>
            </div>
          </section>
        )}

        {/* AI Insights Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <AIInsights />
          </div>
        </section>
        
        {/* Creator Credit */}
        <section className="py-8 bg-gradient-subtle/50 border-t border-border/50 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ This platform was crafted with passion and precision by{" "}
              <span className="font-semibold text-foreground">Jasleen Kaur</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Transforming data into insights, one Excel file at a time
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
