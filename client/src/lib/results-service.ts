interface MatchResult {
  match_id: number;
  home_score: number;
  away_score: number;
  status: "finished" | "live" | "scheduled";
  finished_at?: string;
}

interface MatchPrediction {
  match_id: number;
  home_team: string;
  away_team: string;
  home_win_probability: number;
  away_win_probability: number;
  prediction: string;
  confidence: number;
}

interface PredictionAccuracy {
  match_id: number;
  predicted_winner: "home" | "away" | "draw";
  actual_winner: "home" | "away" | "draw";
  is_correct: boolean;
  home_score: number;
  away_score: number;
  pending: boolean;
}

const API_BASE = "https://api.football-data.org/v4";
const API_TOKEN = import.meta.env.VITE_FOOTBALL_DATA_TOKEN;

async function fetchFromFootballData(endpoint: string): Promise<any> {
  if (!API_TOKEN) {
    console.warn("VITE_FOOTBALL_DATA_TOKEN not set, using local data");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "X-Auth-Token": API_TOKEN },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Football Data API error:", error);
    return null;
  }
}

async function fetchLocalResults(): Promise<MatchResult[]> {
  try {
    const response = await fetch("/data/match-results.json");
    if (!response.ok) throw new Error("Failed to load local results");
    return await response.json();
  } catch {
    return [];
  }
}

function determineWinner(homeScore: number, awayScore: number): "home" | "away" | "draw" {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

function determinePredictedWinner(prediction: MatchPrediction): "home" | "away" | "draw" {
  if (prediction.home_win_probability > prediction.away_win_probability) return "home";
  if (prediction.away_win_probability > prediction.home_win_probability) return "away";
  return "draw";
}

export async function getMatchResults(): Promise<MatchResult[]> {
  const apiResults = await fetchFromFootballData("/competitions/WC/matches?status=FINISHED");
  if (apiResults?.matches) {
    return apiResults.matches.map((m: any) => ({
      match_id: m.id,
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      status: "finished",
      finished_at: m.utcDate,
    }));
  }

  return fetchLocalResults();
}

export async function calculatePredictionAccuracy(
  predictions: MatchPrediction[]
): Promise<PredictionAccuracy[]> {
  const results = await getMatchResults();
  const resultsMap = new Map(results.map((r) => [r.match_id, r]));

  return predictions.map((pred) => {
    const result = resultsMap.get(pred.match_id);
    if (!result || result.status !== "finished") {
      return {
        match_id: pred.match_id,
        predicted_winner: determinePredictedWinner(pred),
        actual_winner: "draw",
        is_correct: false,
        home_score: 0,
        away_score: 0,
        pending: true,
      };
    }

    const actualWinner = determineWinner(result.home_score, result.away_score);
    const predictedWinner = determinePredictedWinner(pred);

    return {
      match_id: pred.match_id,
      predicted_winner: predictedWinner,
      actual_winner: actualWinner,
      is_correct: predictedWinner === actualWinner,
      home_score: result.home_score,
      away_score: result.away_score,
      pending: false,
    };
  });
}

export function getAccuracyStats(accuracies: PredictionAccuracy[]) {
  const finished = accuracies.filter((a) => !a.pending);
  const correct = finished.filter((a) => a.is_correct);
  return {
    total: finished.length,
    correct: correct.length,
    accuracy: finished.length > 0 ? (correct.length / finished.length) * 100 : 0,
    pending: accuracies.filter((a) => a.pending).length,
  };
}

export async function fetchWorldCupMatches(): Promise<any[]> {
  const data = await fetchFromFootballData("/competitions/WC/matches");
  return data?.matches || [];
}