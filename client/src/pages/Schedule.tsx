import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const teamToCountryCode: Record<string, string> = {
  "墨西哥": "mx", "南非": "za", "韩国": "kr", "捷克": "cz",
  "加拿大": "ca", "波黑": "ba", "卡塔尔": "qa", "瑞士": "ch",
  "美国": "us", "巴拉圭": "py", "海地": "ht", "苏格兰": "gb-sct",
  "澳大利亚": "au", "土耳其": "tr", "巴西": "br", "摩洛哥": "ma",
  "科特迪瓦": "ci", "厄瓜多尔": "ec", "德国": "de", "库拉索": "cw",
  "荷兰": "nl", "日本": "jp", "瑞典": "se", "突尼斯": "tn",
  "沙特阿拉伯": "sa", "乌拉圭": "uy", "西班牙": "es", "佛得角": "cv",
  "伊朗": "ir", "新西兰": "nz", "比利时": "be", "埃及": "eg",
  "法国": "fr", "塞内加尔": "sn", "伊拉克": "iq", "挪威": "no",
  "阿根廷": "ar", "阿尔及利亚": "dz", "奥地利": "at", "约旦": "jo",
  "加纳": "gh", "巴拿马": "pa", "英格兰": "gb-eng", "克罗地亚": "hr",
  "葡萄牙": "pt", "刚果民主共和国": "cd", "乌兹别克斯坦": "uz", "哥伦比亚": "co",
};

function getFlagUrl(teamName: string): string {
  const code = teamToCountryCode[teamName]?.toLowerCase() || "un";
  return `https://flagcdn.com/w40/${code}.png`;
}

interface Match {
  id: number;
  date: string;
  beijing_time: string;
  group?: string;
  home: string;
  away: string;
  stadium: string;
  stage: string;
  stage_label: string;
}

interface Group {
  name: string;
  teams: Array<{
    name: string;
    flag: string;
  }>;
}

interface KnockoutStage {
  id: string;
  label: string;
  count: number;
}

interface ScheduleData {
  groups: Record<string, Group>;
  group_stage_matches: Match[];
  all_matches: Match[];
  knockout_stages: KnockoutStage[];
}

const isRealTeam = (name: string) => teamToCountryCode[name] !== undefined;

export default function Schedule() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"group" | "knockout">("group");
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [selectedStage, setSelectedStage] = useState("round_of_32");
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

  const stageMatches = data.all_matches.filter(
    (m) => tab === "group" ? m.stage === "group" && m.group === selectedGroup : m.stage === selectedStage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              2026 FIFA 世界杯赛程
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              小组赛和淘汰赛完整日程（共104场比赛）
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 阶段选择侧边栏 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">阶段选择</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={tab === "group" ? "default" : "outline"}
                  onClick={() => setTab("group")}
                  className="w-full justify-start font-semibold mb-2"
                >
                  小组赛（72场）
                </Button>
                {data.knockout_stages.map((s) => (
                  <Button
                    key={s.id}
                    variant={selectedStage === s.id && tab === "knockout" ? "default" : "outline"}
                    onClick={() => { setTab("knockout"); setSelectedStage(s.id); }}
                    className="w-full justify-start text-sm"
                  >
                    {s.label}（{s.count}场）
                  </Button>
                ))}
              </CardContent>
            </Card>

            {tab === "group" && (
              <>
                <Card className="mt-4">
                  <CardHeader className="pb-3">
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
                <Card className="mt-4">
                  <CardHeader className="pb-3">
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
                          <img src={getFlagUrl(team.name)} alt={team.name} className="w-6 h-4 rounded" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {team.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* 比赛列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {tab === "group"
                    ? `${data.groups[selectedGroup]?.name} - 比赛日程`
                    : `${stageMatches[0]?.stage_label || ""} - 比赛日程`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stageMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">暂无比赛</p>
                ) : (
                  <div className="space-y-4">
                    {stageMatches.map((match) => (
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
                          <div className="flex-1 text-right pr-4 flex items-center justify-end gap-2">
                            {isRealTeam(match.home) ? (
                              <img src={getFlagUrl(match.home)} alt={match.home} className="w-5 h-3 rounded" />
                            ) : null}
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {match.home}
                            </p>
                          </div>

                          <div className="text-center px-4">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">vs</p>
                          </div>

                          <div className="flex-1 text-left pl-4 flex items-center gap-2">
                            {isRealTeam(match.away) ? (
                              <img src={getFlagUrl(match.away)} alt={match.away} className="w-5 h-3 rounded" />
                            ) : null}
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {match.away}
                            </p>
                          </div>
                        </div>

                        {tab === "group" && (
                          <div className="mt-3 text-center">
                            <Button variant="outline" size="sm" className="w-full">
                              查看预测分析
                            </Button>
                          </div>
                        )}
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
