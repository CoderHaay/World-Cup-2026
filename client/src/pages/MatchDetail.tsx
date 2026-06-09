import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useLocation, useRoute } from "wouter";

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
  group?: string;
  home: string;
  away: string;
  stadium: string;
  stage: string;
  stage_label: string;
  city?: string;
  country?: string;
}

interface ScheduleData {
  all_matches: Match[];
}

interface TeamsData {
  teams: Record<string, TeamStats>;
}

const isRealTeam = (name: string) => teamToCountryCode[name] !== undefined;

export default function MatchDetail() {
  const [, params] = useRoute("/match/:matchId");
  const [, navigate] = useLocation();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<TeamStats | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamStats | null>(null);
  const [teamRanks, setTeamRanks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isKnockout, setIsKnockout] = useState(false);

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

        const ranks: Record<string, number> = {};
        for (const team of cupData.top_teams) {
          ranks[team.name] = team.rank;
        }
        setTeamRanks(ranks);

        const foundMatch = scheduleData.all_matches?.find(
          (m) => m.id === parseInt(params?.matchId || "0")
        );
        setMatch(foundMatch || null);

        if (foundMatch) {
          const isKO = foundMatch.stage !== "group";
          setIsKnockout(isKO);
          if (!isKO) {
            setHomeTeam(teamsData.teams[foundMatch.home] || null);
            setAwayTeam(teamsData.teams[foundMatch.away] || null);
          }
        }
      } catch (error) {
        console.error("Failed to load match data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params?.matchId]);

  if (loading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">加载比赛数据中...</p>
      </div>
    );
  }

  if (isKnockout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
          <div className="container py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/schedule")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{match.stage_label}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{match.beijing_time} (北京时间) - {match.stadium}</p>
            </div>
          </div>
        </header>
        <main className="container py-8">
          <Card>
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <p className="text-lg text-slate-500 dark:text-slate-400">淘汰赛对阵（待小组赛结束后确定）</p>
                <div className="flex items-center justify-center gap-8 py-8">
                  <div className="text-xl font-bold text-slate-900 dark:text-white px-6 py-4 bg-blue-50 dark:bg-blue-950 rounded-lg">{match.home}</div>
                  <div className="text-3xl font-bold text-slate-400">VS</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white px-6 py-4 bg-orange-50 dark:bg-orange-950 rounded-lg">{match.away}</div>
                </div>
                <Badge variant="secondary" className="text-sm px-4 py-2">{match.stadium}</Badge>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">加载球队数据中...</p>
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
      [match.away]: awayTeam.injury_status,
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
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <img src={getFlagUrl(match.home)} alt={match.home} className="w-8 h-6 rounded" />
                  {match.home}
                </div>
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
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <img src={getFlagUrl(match.away)} alt={match.away} className="w-8 h-6 rounded" />
                  {match.away}
                </div>
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
                    name={match.home}
                    dataKey="home"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name={match.away}
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
                本预测基于FIFA排名(25%)、球队身价(25%)、预选赛成绩(25%)、核心球员实力(15%)、近期状态(10%)等多个因素综合计算得出。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
