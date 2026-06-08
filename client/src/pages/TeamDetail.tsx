import { useParams, useLocation } from "wouter";
import { ArrowLeft, Users, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface KeyPlayer {
  name: string;
  position: string;
  club: string;
  number: number;
}

interface Injury {
  player: string;
  status: string;
  return_date: string;
}

interface RecentMatch {
  opponent: string;
  score: string;
  date: string;
  result: string;
}

interface TeamDetailData {
  name: string;
  flag: string;
  coach: string;
  key_players: KeyPlayer[];
  injuries: Injury[];
  recent_matches: RecentMatch[];
}

export default function TeamDetail() {
  const { teamName } = useParams<{ teamName: string }>();
  const [, setLocation] = useLocation();
  const [teamData, setTeamData] = useState<TeamDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        const response = await fetch("/data/team-details.json");
        const data = await response.json();
        const decodedTeamName = decodeURIComponent(teamName || "");
        setTeamData(data[decodedTeamName] || null);
      } catch (error) {
        console.error("Failed to load team details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamDetails();
  }, [teamName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container py-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              未找到球队信息
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        {/* 返回按钮 */}
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        {/* 球队头部 */}
        <Card className="p-8 mb-8 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{teamData.flag}</span>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                {teamData.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                主教练: {teamData.coach}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 核心球员 */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  核心球员
                </h2>
              </div>

              <div className="space-y-4">
                {teamData.key_players.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {player.number}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {player.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {player.club}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{player.position}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 伤病情况 */}
          <div>
            <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  伤病情况
                </h2>
              </div>

              {teamData.injuries.length === 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    ✓ 暂无伤病报告
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamData.injuries.map((injury, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <p className="font-semibold text-red-900 dark:text-red-200 text-sm">
                        {injury.player}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        状态: {injury.status}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        预计复出: {injury.return_date}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 近期战绩 */}
        <Card className="p-6 bg-white dark:bg-slate-800 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              近期战绩
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamData.recent_matches.map((match, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {match.date}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {teamData.name}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {match.score}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {match.opponent}
                  </span>
                </div>
                <Badge
                  variant={
                    match.result === "胜"
                      ? "default"
                      : match.result === "负"
                        ? "destructive"
                        : "outline"
                  }
                  className="w-full text-center justify-center"
                >
                  {match.result === "胜"
                    ? "胜利"
                    : match.result === "负"
                      ? "失败"
                      : "平局"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
