import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Download, Eye, Calendar, BarChart3 } from "lucide-react";
import { useMockAuth } from "@/context/MockAuthContext";
import { useEffect, useState } from "react";
import { getUserAnalyses, AnalysisRecord } from "@/services/mockFirebaseService";

export const Dashboard = () => {
  const { user } = useMockAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (user) {
        try {
          const userAnalyses = await getUserAnalyses(user.uid);
          setAnalyses(userAnalyses);
        } catch (error) {
          console.error('Error fetching analyses:', error);
        }
      }
      setLoading(false);
    };

    fetchAnalyses();
  }, [user]);

  const stats = [
    { label: "Total Analyses", value: String(analyses.length), trend: analyses.length > 0 ? "+12%" : "0%", icon: BarChart3 },
    { label: "Files Processed", value: String(analyses.length), trend: analyses.length > 0 ? "+8%" : "0%", icon: FileText },
    { label: "Charts Generated", value: String(analyses.length * 2), trend: analyses.length > 0 ? "+15%" : "0%", icon: TrendingUp },
    { label: "AI Insights", value: String(analyses.length * 6), trend: analyses.length > 0 ? "+23%" : "0%", icon: Eye }
  ];

  return (
    <section id="dashboard" className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Analytics Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your data analysis progress and manage your Excel file insights.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="shadow-data">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className={`text-sm font-medium ${
                        stat.trend.startsWith('+') ? 'text-success' : 
                        stat.trend.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {stat.trend}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis History */}
          <div id="history" className="lg:col-span-2">
            <Card className="shadow-data">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Analysis History
                </CardTitle>
                <CardDescription>
                  {user ? "Your saved analyses" : "Sign in to save your analysis history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Loading...</h3>
                    <p className="text-muted-foreground">Fetching your analysis history</p>
                  </div>
                ) : analyses.length > 0 ? (
                  <div className="space-y-4">
                    {analyses.map((item) => (
                      <div key={item.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{item.fileName}</h3>
                              <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={item.status === "completed" ? "default" : "secondary"}
                            className={item.status === "completed" ? "bg-success" : ""}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Chart: {item.chartType}</span>
                            <span>Insights: {item.insights}</span>
                            <span>Columns: {item.columns.length}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis History</h3>
                    <p className="text-muted-foreground mb-4">
                      {user ? "Upload and analyze your first Excel file to see your history here." : "Please sign in to save your analysis history."}
                    </p>
                    {user && (
                      <Button variant="analytics" asChild>
                        <a href="#upload">Upload Your First File</a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Preview */}
          <div className="space-y-6">
            <Card className="shadow-data">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Fast access to common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="analytics" className="w-full" asChild>
                  <a href="#upload">Upload New File</a>
                </Button>
                <Button variant="outline" className="w-full">
                  View All Charts
                </Button>
                <Button variant="outline" className="w-full">
                  Export Report
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#analytics">AI Insights Summary</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-data">
              <CardHeader>
                <CardTitle className="text-lg">Latest Visualization</CardTitle>
                <CardDescription>Preview of your most recent chart</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-subtle rounded-lg flex items-center justify-center">
                    {analyses.length > 0 ? (
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Chart visualization will appear here</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No charts yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};