import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, Target, Calendar } from "lucide-react";
import { useLocation } from "wouter";

const teamToCountryCode: Record<string, string> = {
  "墨西哥": "mx", "南非": "za", "韩国": "kr", "捷克": "cz",
  "加拿大": "ca", "瑞士": "ch", "卡塔尔": "qa", "波黑": "ba",
  "巴西": "br", "摩洛哥": "ma", "苏格兰": "gb-sct", "海地": "ht",
  "美国": "us", "巴拉圭": "py", "澳大利亚": "au", "乌拉圭": "uy",
  "德国": "de", "库拉索": "cw", "科特迪瓦": "ci", "厄瓜多尔": "ec",
  "荷兰": "nl", "日本": "jp", "突尼斯": "tn", "乌兹别克斯坦": "uz",
  "比利时": "be", "埃及": "eg", "伊朗": "ir", "新西兰": "nz",
  "西班牙": "es", "沙特阿拉伯": "sa", "圣文森特和格林纳丁斯": "vc",
  "法国": "fr", "塞内加尔": "sn", "挪威": "no", "欧洲附加赛2": "eu",
  "阿根廷": "ar", "阿尔及利亚": "dz", "奥地利": "at", "约旦": "jo",
  "葡萄牙": "pt", "哥伦比亚": "co", "欧洲附加赛1": "eu",
  "英格兰": "gb-eng", "克罗地亚": "hr", "加纳": "gh", "巴拿马": "pa",
};

function getFlagUrl(teamName: string): string {
  const code = teamToCountryCode[teamName]?.toLowerCase() || "un";
  return `https://flagcdn.com/w40/${code}.png`;
}

interface TeamData {
  rank: number;
  name: string;
  flag: string;
  overall_score: number;
  fifa_ranking: number;
  squad_value: number;
  qualification_points: number;
  confederation: string;
}

export default function Home() {
  const [teamsData, setTeamsData] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/world-cup-data.json');
        const data = await response.json();
        setTeamsData(data.top_teams);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4"><Trophy className="w-12 h-12 mx-auto" /></div>
          <p className="text-lg text-muted-foreground">加载数据中...</p>
        </div>
      </div>
    );
  }

  const confederationData = [
    { name: 'UEFA', value: 16, color: '#3b82f6' },
    { name: 'CONMEBOL', value: 6, color: '#ef4444' },
    { name: 'AFC', value: 9, color: '#f59e0b' },
    { name: 'CAF', value: 10, color: '#10b981' },
    { name: 'CONCACAF', value: 6, color: '#8b5cf6' },
    { name: 'OFC', value: 1, color: '#06b6d4' }
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">2026年世界杯欢乐预测系统</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">基于数据驱动的胜率分析</p>
        </div>
      </header>

      <main className="container py-12">
        {/* Navigation to Schedule and Simulator */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => navigate("/schedule")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            查看完整赛程与比赛预测
          </button>
          <button
            onClick={() => navigate("/simulator")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition shadow-lg"
          >
            <Target className="w-5 h-5" />
            小组出线模拟器
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">参赛球队</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">48</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">来自6个大洲</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">总比赛数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">104</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">小组赛72场 + 淘汰赛32场</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">比赛时间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">39</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">2026年6月11日-7月19日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">东道主</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">3</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">加拿大、墨西哥、美国</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="rankings">球队排名</TabsTrigger>
            <TabsTrigger value="methodology">算法说明</TabsTrigger>
          </TabsList>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  球队综合实力排名
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamsData.map((team) => (
                    <div key={team.rank} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer" onClick={() => navigate(`/team/${encodeURIComponent(team.name)}`)}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                          {team.rank}
                        </div>
                        <img src={getFlagUrl(team.name)} alt={team.name} className="w-6 h-4 rounded" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{team.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">综合排名: 第{team.rank}位 | 身价: {(team.squad_value / 100000000).toFixed(1)}亿美元</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.overall_score.toFixed(2)}</div>
                        <Badge variant="outline" className="mt-1">{team.confederation}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Methodology Tab */}
          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>预测算法说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">算法原理</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    该系统采用多因素加权评分模型，综合考虑球队的多个维度数据，为每支球队生成综合实力评分，进而预测比赛胜率。
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">核心指标</h3>
                  <div className="space-y-2">
                     {[
                       { name: 'FIFA排名', weight: '25%', desc: '反映球队在国际足坛的整体实力排名' },
                       { name: '球队身价', weight: '25%', desc: '根据球队所有球员的市场价值总和计算' },
                       { name: '预选赛成绩', weight: '25%', desc: '基于球队在世界杯预选赛中的积分表现' },
                       { name: '核心球员实力', weight: '15%', desc: '评估球队中关键球员的个人能力水平' },
                       { name: '近期状态', weight: '10%', desc: '基于球队近期热身赛及友谊赛的表现趋势' }
                     ].map((factor, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-900 dark:text-white">{factor.name}</p>
                          <Badge variant="secondary">{factor.weight}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{factor.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">数据来源</h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• FIFA官方网站 - 最新排名数据</li>
                    <li>• Transfermarkt - 球员身价数据</li>
                    <li>• 各足协官方数据 - 预选赛成绩</li>
                    <li>• 专业分析机构 - 球员实力评估</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
