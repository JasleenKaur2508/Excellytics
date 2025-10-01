import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import { useMockAuth } from "@/context/MockAuthContext";
import { useEffect, useState } from "react";
import { getAnalysisInsights, Insight } from "@/services/mockFirebaseService";

export const AIInsights = () => {
  const { user } = useMockAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (user) {
        try {
          const allInsights = await getAnalysisInsights('recent');
          setInsights(allInsights);
        } catch (error) {
          console.error('Error fetching insights:', error);
        }
      }
      setLoading(false);
    };

    fetchInsights();
  }, [user]);

  const summaryStats = [
    { label: "Insights Generated", value: String(insights.length) },
    { label: "High Priority", value: String(insights.filter(i => i.priority === 'high').length) },
    { label: "Avg Confidence", value: insights.length > 0 ? `${Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%` : "0%" },
    { label: "Actions Taken", value: String(insights.length) }
  ];

  return (
    <section id="ai-insights" className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Data Insights
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover patterns and trends from your Excel data.
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="shadow-data text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-full mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Insights List */}
          <div className="lg:col-span-3">
            <Card className="shadow-data">
              <CardHeader>
                <CardTitle>Data Insights</CardTitle>
                <CardDescription>Key findings from your data</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : insights.length > 0 ? (
                  <div className="space-y-6">
                    {insights.map((insight) => (
                      <div key={insight.id} className="p-4 rounded-lg border">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                            {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {insight.type === 'recommendation' && <Lightbulb className="w-5 h-5 text-purple-500" />}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">{insight.title}</h4>
                              <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'} className="ml-2">
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-2">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">Upload and analyze your data to see insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};