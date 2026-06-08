import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Match {
  id: number;
  date: string;
  beijing_time: string;
  group: string;
  home: string;
  away: string;
  stadium: string;
}

interface Group {
  name: string;
  teams: Array<{
    name: string;
    flag: string;
  }>;
}

interface ScheduleData {
  groups: Record<string, Group>;
  group_stage_matches: Match[];
}

export default function Schedule() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/world-cup-schedule.json");
        const scheduleData = await response.json();
        setData(scheduleData);
      } catch (error) {
        console.error("Failed to load schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">加载赛程中...</p>
      </div>
    );
  }

  const groupMatches = data.group_stage_matches.filter(
    (m) => m.group === selectedGroup
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              2026 FIFA 世界杯赛程
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              小组赛和淘汰赛完整日程
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 小组列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">选择小组</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(data.groups).map((groupId) => (
                    <Button
                      key={groupId}
                      variant={selectedGroup === groupId ? "default" : "outline"}
                      onClick={() => setSelectedGroup(groupId)}
                      className="font-semibold"
                    >
                      {groupId}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 小组信息 */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {data.groups[selectedGroup]?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.groups[selectedGroup]?.teams.map((team) => (
                    <div
                      key={team.name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span className="text-2xl">{team.flag}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {team.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 比赛列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {data.groups[selectedGroup]?.name} - 比赛日程
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    暂无比赛
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groupMatches.map((match) => (
                      <div
                        key={match.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {match.beijing_time} (北京时间)
                          </div>
                          <Badge variant="secondary">{match.stadium}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-right pr-4">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {match.home}
                            </p>
                          </div>

                          <div className="text-center px-4">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                              vs
                            </p>
                          </div>

                          <div className="flex-1 text-left pl-4">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {match.away}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            查看预测分析
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
