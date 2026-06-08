import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Match {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
}

interface GroupTeam {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Group {
  name: string;
  teams: GroupTeam[];
  matches: Match[];
}

export default function GroupSimulator() {
  const [, setLocation] = useLocation();
  const [groups, setGroups] = useState<Record<string, Group>>({});

  // 加载小组数据
  useEffect(() => {
    fetch("/data/world-cup-data.json")
      .then(res => res.json())
      .then(data => {
        initializeGroups(data.groups);
      })
      .catch(err => console.error("Failed to load groups data:", err));
  }, []);

  const initializeGroups = (groupsData: any) => {
    const initialized: Record<string, Group> = {};
    
    Object.entries(groupsData).forEach(([key, groupInfo]: [string, any]) => {
      const teams = groupInfo.teams.map((name: string) => ({
        name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));

      // 生成所有比赛
      const matches: Match[] = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            team1: teams[i].name,
            team2: teams[j].name,
            score1: 0,
            score2: 0
          });
        }
      }

      initialized[key] = {
        name: groupInfo.name,
        teams,
        matches
      };
    });

    setGroups(initialized);
  };

  const updateScore = (groupKey: string, matchIdx: number, team: 1 | 2, score: number) => {
    setGroups(prev => {
      const group = prev[groupKey];
      if (!group) return prev;

      const updatedMatches = [...group.matches];
      const match = { ...updatedMatches[matchIdx] };
      
      if (team === 1) {
        match.score1 = score;
      } else {
        match.score2 = score;
      }
      
      updatedMatches[matchIdx] = match;

      // 重新计算积分
      const updatedTeams = group.teams.map(t => ({
        ...t,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));

      updatedMatches.forEach(m => {
        const team1Idx = updatedTeams.findIndex(t => t.name === m.team1);
        const team2Idx = updatedTeams.findIndex(t => t.name === m.team2);

        if (team1Idx === -1 || team2Idx === -1) return;

        updatedTeams[team1Idx].played++;
        updatedTeams[team2Idx].played++;
        updatedTeams[team1Idx].goalsFor += m.score1;
        updatedTeams[team1Idx].goalsAgainst += m.score2;
        updatedTeams[team2Idx].goalsFor += m.score2;
        updatedTeams[team2Idx].goalsAgainst += m.score1;

        if (m.score1 > m.score2) {
          updatedTeams[team1Idx].wins++;
          updatedTeams[team1Idx].points += 3;
          updatedTeams[team2Idx].losses++;
        } else if (m.score1 < m.score2) {
          updatedTeams[team2Idx].wins++;
          updatedTeams[team2Idx].points += 3;
          updatedTeams[team1Idx].losses++;
        } else {
          updatedTeams[team1Idx].draws++;
          updatedTeams[team1Idx].points += 1;
          updatedTeams[team2Idx].draws++;
          updatedTeams[team2Idx].points += 1;
        }
      });

      updatedTeams.forEach(t => {
        t.goalDifference = t.goalsFor - t.goalsAgainst;
      });

      updatedTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      return {
        ...prev,
        [groupKey]: { ...group, teams: updatedTeams, matches: updatedMatches }
      };
    });
  };

  const resetGroup = (groupKey: string) => {
    setGroups(prev => {
      const group = prev[groupKey];
      if (!group) return prev;

      const resetMatches = group.matches.map(m => ({
        ...m,
        score1: 0,
        score2: 0
      }));

      const resetTeams = group.teams.map(t => ({
        ...t,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));

      return {
        ...prev,
        [groupKey]: { ...group, teams: resetTeams, matches: resetMatches }
      };
    });
  };

  if (Object.keys(groups).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  const groupKeys = Object.keys(groups).sort();

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

        <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">
          小组出线模拟器
        </h1>

        <Tabs defaultValue={groupKeys[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
            {groupKeys.map(key => (
              <TabsTrigger key={key} value={key}>
                {groups[key].name}
              </TabsTrigger>
            ))}
          </TabsList>

          {groupKeys.map(key => {
            const group = groups[key];
            return (
              <TabsContent key={key} value={key} className="space-y-6">
                {/* 比赛输入 */}
                <Card className="p-6 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {group.name}比赛结果
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetGroup(key)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {group.matches.map((match, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-500 dark:text-slate-400 min-w-12">
                          第{idx + 1}场
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white min-w-24 text-right">
                          {match.team1}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={match.score1}
                          onChange={(e) => {
                            const val = e.target.value;
                            const score = val === "" ? 0 : parseInt(val, 10);
                            if (!isNaN(score) && score >= 0 && score <= 9) {
                              updateScore(key, idx, 1, score);
                            }
                          }}
                          className="w-14 p-2 text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white font-semibold"
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-bold">-</span>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={match.score2}
                          onChange={(e) => {
                            const val = e.target.value;
                            const score = val === "" ? 0 : parseInt(val, 10);
                            if (!isNaN(score) && score >= 0 && score <= 9) {
                              updateScore(key, idx, 2, score);
                            }
                          }}
                          className="w-14 p-2 text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white font-semibold"
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-bold">-</span>
                        <span className="font-semibold text-slate-900 dark:text-white min-w-24">
                          {match.team2}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 积分榜 */}
                <Card className="p-6 bg-white dark:bg-slate-800">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                    {group.name}积分榜
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">排名</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">球队</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">场</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">胜</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">平</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">负</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">进</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">失</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">净胜</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">积分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.teams.map((team, idx) => (
                          <tr
                            key={team.name}
                            className={`border-b border-slate-100 dark:border-slate-700 ${
                              idx < 2
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "hover:bg-slate-50 dark:hover:bg-slate-700"
                            } transition`}
                          >
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              {team.name}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.played}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.wins}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.draws}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.losses}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.goalsFor}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.goalsAgainst}
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                              {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                            </td>
                            <td className="text-center py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 出线球队 */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-900 dark:text-green-200 font-semibold">
                      ✓ 出线球队: {group.teams.slice(0, 2).map(t => t.name).join(" / ")}
                    </p>
                  </div>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
