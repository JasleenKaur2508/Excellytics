import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, ScatterChart, Settings, Play, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  ScatterChart as RScatterChart,
  Scatter,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DataAnalysisProps {
  data?: any[];
  columns?: string[];
}

export const DataAnalysis = ({ data = [], columns = [] }: DataAnalysisProps) => {
  const [selectedX, setSelectedX] = useState<string>("");
  const [selectedY, setSelectedY] = useState<string>(""); // State for chart data and configuration
  const [chartType, setChartType] = useState<string>("");
  const [showChart, setShowChart] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    // Filter out any rows that don't have the selected X and Y values
    return data.filter(row => {
      return row[selectedX] !== undefined && row[selectedY] !== undefined;
    });
  }, [data, selectedX, selectedY]);

  // Set default values when data is available
  useEffect(() => {
    if (columns && columns.length > 0) {
      if (!selectedX && columns[0]) setSelectedX(columns[0]);
      if (!selectedY && columns.length > 1) setSelectedY(columns[1]);
      if (!chartType) setChartType('bar');
      
      // If we have data and selections, show the chart
      if (selectedX && selectedY && chartType && data && data.length > 0) {
        setShowChart(true);
      }
    }
  }, [columns, selectedX, selectedY, chartType, data]);

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "scatter", label: "Scatter Plot", icon: ScatterChart },
  ];

  const onGenerate = () => {
    if (!selectedX || !selectedY || !chartType) return;
    setShowChart(true);
    // Scroll to the chart section
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const downloadCSV = () => {
    if (!chartData.length) return;
    const headers = [selectedX, selectedY];
    const rows = chartData
      .filter((r: any) => r[selectedX] != null && r[selectedY] != null)
      .map((r: any) => `${r[selectedX]},${r[selectedY]}`);
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${chartType}-${selectedX}-vs-${selectedY}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const payload = {
      type: chartType,
      x: selectedX,
      y: selectedY,
      data: chartData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${chartType}-${selectedX}-vs-${selectedY}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!chartContainerRef.current) return;
    const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: '#0b0b0b' });
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `chart-${chartType}-${selectedX}-vs-${selectedY}.png`;
    a.click();
  };

  const downloadPDF = async () => {
    if (!chartContainerRef.current) return;
    try {
      const canvas = await html2canvas(chartContainerRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
      pdf.save(`chart-${chartType}-${selectedX}-vs-${selectedY}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"]; // tailwind primary-like palette

  return (
    <section id="analytics" className="py-16" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Data Analysis & Visualization
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your data columns and chart type to create powerful visualizations from your Excel data.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-data">
              <CardHeader>
                {(!data || data.length === 0 || !columns || columns.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Upload and analyze a file to see data visualizations</p>
                  </div>
                )}
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Chart Configuration
                </CardTitle>
                <CardDescription>
                  Configure your chart settings and data mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">X-Axis Column</label>
                  <Select value={selectedX} onValueChange={setSelectedX}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select X-axis data" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.length > 0 ? (
                        columns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          No data available - Upload a file first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Y-Axis Column</label>
                  <Select value={selectedY} onValueChange={setSelectedY}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Y-axis data" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.length > 0 ? (
                        columns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          No data available - Upload a file first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Chart Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {chartTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setChartType(type.value)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            chartType === type.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  variant="analytics" 
                  className="w-full"
                  disabled={!selectedX || !selectedY || !chartType}
                  onClick={onGenerate}
                >
                  <Play className="w-4 h-4" />
                  Generate Visualization
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Preview</CardTitle>
                <CardDescription>Column statistics from your Excel file</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                ) : columns.length > 0 ? (
                  <div className="space-y-3">
                    {columns.slice(0, 5).map((column) => (
                      <div key={column} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{column}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 1000)} rows</Badge>
                      </div>
                    ))}
                    {columns.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{columns.length - 5} more columns
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center mb-3">
                      <BarChart3 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">No Data Available</h3>
                    <p className="text-sm text-muted-foreground">Upload an Excel file to see column preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Display Area */}
          <div className="lg:col-span-2" >
            <Card className="shadow-data h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Chart Visualization
                </CardTitle>
                <CardDescription>
                  Your generated chart will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-subtle rounded-lg flex items-center justify-center p-4">
                  {selectedX && selectedY && chartType && chartData.length > 0 ? (
                    <div className="w-full h-full">
                      <div className="w-full h-5/6" ref={chartContainerRef}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <RBarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={selectedX} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey={selectedY} fill="#6366f1" />
                            </RBarChart>
                          ) : chartType === 'line' ? (
                            <RLineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={selectedX} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey={selectedY} stroke="#22c55e" strokeWidth={2} dot={false} />
                            </RLineChart>
                          ) : chartType === 'pie' ? (
                            <RPieChart>
                              <Tooltip />
                              <Legend />
                              <Pie data={chartData} dataKey={selectedY} nameKey={selectedX} outerRadius={120} label>
                                {chartData.slice(0, 12).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                            </RPieChart>
                          ) : (
                            <RScatterChart>
                              <CartesianGrid />
                              <XAxis dataKey={selectedX} name={selectedX} />
                              <YAxis dataKey={selectedY} name={selectedY} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              <Scatter data={chartData} fill="#06b6d4" />
                            </RScatterChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button variant="outline" size="sm" onClick={downloadCSV}>Download CSV</Button>
                        <Button variant="outline" size="sm" onClick={downloadJSON}>Download JSON</Button>
                        <Button variant="outline" size="sm" onClick={downloadPNG}>Download PNG</Button>
                        <Button variant="outline" size="sm" onClick={downloadPDF}>Download PDF</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      {data.length > 0 && columns.length > 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Click "Generate Visualization" to see your chart
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Selected: {selectedX} vs {selectedY} ({chartType})
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Configure Your Chart
                          </h3>
                          <p className="text-muted-foreground">
                            Select X-axis, Y-axis, and chart type to generate visualization
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};