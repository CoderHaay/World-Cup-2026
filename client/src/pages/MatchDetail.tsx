import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useLocation, useRoute } from "wouter";

interface TeamStats {
  name: string;
  flag: string;
  fifa_ranking: number;
  squad_value: number;
  qualification_points: number;
  attack_strength: number;
  defense_strength: number;
  midfield_control: number;
  injury_status: number;
  overall_score: number;
}

interface Match {
  id: number;
  date: string;
  beijing_time: string;
  group: string;
  home: string;
  away: string;
  stadium: string;
}

interface ScheduleData {
  group_stage_matches: Match[];
}

interface TeamsData {
  teams: Record<string, TeamStats>;
}

export default function MatchDetail() {
  const [, params] = useRoute("/match/:matchId");
  const [, navigate] = useLocation();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<TeamStats | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamStats | null>(null);
  const [teamRanks, setTeamRanks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleRes, teamsRes, cupDataRes] = await Promise.all([
          fetch("/data/world-cup-schedule.json"),
          fetch("/data/teams-data.json"),
          fetch("/data/world-cup-data.json"),
        ]);

        const scheduleData: ScheduleData = await scheduleRes.json();
        const teamsData: TeamsData = await teamsRes.json();
        const cupData = await cupDataRes.json();

        // Build team rank lookup from top_teams
        const ranks: Record<string, number> = {};
        for (const team of cupData.top_teams) {
          ranks[team.name] = team.rank;
        }
        setTeamRanks(ranks);

        const foundMatch = scheduleData.group_stage_matches.find(
          (m) => m.id === parseInt(params?.matchId || "0")
        );
        setMatch(foundMatch || null);

        if (foundMatch) {
          setHomeTeam(teamsData.teams[foundMatch.home] || null);
          setAwayTeam(teamsData.teams[foundMatch.away] || null);
        }
      } catch (error) {
        console.error("Failed to load match data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params?.matchId]);

  if (loading || !match || !homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">加载比赛数据中...</p>
      </div>
    );
  }

  // 计算胜率
  const totalScore = homeTeam.overall_score + awayTeam.overall_score;
  const homeWinProb = ((homeTeam.overall_score / totalScore) * 100).toFixed(2);
  const awayWinProb = ((awayTeam.overall_score / totalScore) * 100).toFixed(2);

  // 准备雷达图数据
  const radarData = [
    {
      category: "进攻能力",
      home: homeTeam.attack_strength,
      away: awayTeam.attack_strength,
    },
    {
      category: "防守稳定性",
      home: homeTeam.defense_strength,
      away: awayTeam.defense_strength,
    },
    {
      category: "中场控制",
      home: homeTeam.midfield_control,
      away: awayTeam.midfield_control,
    },
    {
      category: "伤病状况",
      home: homeTeam.injury_status,
      away: awayTeam.injury_status,
    },
    {
      category: "综合实力",
      home: homeTeam.overall_score,
      away: awayTeam.overall_score,
    },
  ];

  // 准备对比数据
  const comparisonData = [
    {
      name: "进攻能力",
      [match.home]: homeTeam.attack_strength,
      [match.away]: awayTeam.attack_strength,
    },
    {
      name: "防守稳定性",
      [match.home]: homeTeam.defense_strength,
      [match.away]: awayTeam.defense_strength,
    },
    {
      name: "中场控制",
      [match.home]: homeTeam.midfield_control,
      [match.away]: awayTeam.midfield_control,
    },
    {
      name: "伤病状况",
      [match.home]: homeTeam.injury_status,
      客队: awayTeam.injury_status,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/schedule")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              比赛预测分析
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {match.beijing_time} (北京时间) - {match.stadium}
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* 比赛概览 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 球队1 */}
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{homeTeam.flag} {match.home}</div>
                <Badge variant="default" className="mb-4">
                  {match.home}
                </Badge>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {homeWinProb}%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    胜率
                  </p>
                </div>
              </div>

              {/* 中间 对阵 */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-slate-400 dark:text-slate-600 mb-4">
                  对阵
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
              </div>

              {/* 球队2 */}
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{awayTeam.flag} {match.away}</div>
                <Badge variant="secondary" className="mb-4">
                  {match.away}
                </Badge>
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {awayWinProb}%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    胜率
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 详细数据对比 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 柱状图对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">各项能力对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={match.home} fill="#3b82f6" />
                  <Bar dataKey={match.away} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 雷达图对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">综合实力评估</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name={homeTeam.name}
                    dataKey="home"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name={awayTeam.name}
                    dataKey="away"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 详细数据表格 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">详细数据对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      指标
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {match.home}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {match.away}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      FIFA排名
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      #{teamRanks[match.home] || "-"}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      #{teamRanks[match.away] || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      球队身价
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {(homeTeam.squad_value / 100000000).toFixed(1)}亿美元
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {(awayTeam.squad_value / 100000000).toFixed(1)}亿美元
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      预选赛积分
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {homeTeam.qualification_points}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {awayTeam.qualification_points}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      进攻能力
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {homeTeam.attack_strength}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {awayTeam.attack_strength}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      防守稳定性
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {homeTeam.defense_strength}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {awayTeam.defense_strength}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      中场控制
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {homeTeam.midfield_control}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {awayTeam.midfield_control}
                    </td>
                  </tr>
                   <tr>
                     <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                       伤病状况
                     </td>
                     <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                       {homeTeam.injury_status}
                     </td>
                     <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">
                       {awayTeam.injury_status}
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 预测结论 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">预测结论</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                基于多维度数据分析，本场比赛预测如下：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    {match.home} 获胜概率
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {homeWinProb}%
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                    {match.away} 获胜概率
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {awayWinProb}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                本预测基于FIFA排名(15%)、球队身价(15%)、预选赛成绩(15%)、核心球员实力(10%)、进攻能力(12%)、防守稳定性(12%)、中场控制(10%)、伤病状况(6%)等多个因素综合计算得出。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
