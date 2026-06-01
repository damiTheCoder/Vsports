import type {
  Challenge,
  EvidenceStatus,
  EvidenceUpload,
  MatchResult,
  MatchRoom,
  Settlement,
  User,
  VerificationScenario,
} from "../types";

export const now = () => new Date().toISOString();
export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const users: User[] = [
  {
    id: "u_neo",
    username: "NeoStriker",
    email: "neo@vsports.test",
    country: "Nigeria",
    walletBalance: 240,
    escrowBalance: 0,
    trustScore: 96,
    wins: 18,
    losses: 7,
    penalties: 0,
    suspiciousUploads: 0,
    cancelledMatches: 1,
  },
  {
    id: "u_blaze",
    username: "BlazeFC",
    email: "blaze@vsports.test",
    country: "Ghana",
    walletBalance: 180,
    escrowBalance: 0,
    trustScore: 91,
    wins: 12,
    losses: 9,
    penalties: 1,
    suspiciousUploads: 1,
    cancelledMatches: 2,
  },
  {
    id: "u_rival",
    username: "RivalKing",
    email: "rival@vsports.test",
    country: "Kenya",
    walletBalance: 320,
    escrowBalance: 0,
    trustScore: 88,
    wins: 22,
    losses: 15,
    penalties: 1,
    suspiciousUploads: 2,
    cancelledMatches: 0,
  },
  {
    id: "u_madrid",
    username: "MadridAce",
    email: "madrid@vsports.test",
    country: "South Africa",
    walletBalance: 260,
    escrowBalance: 0,
    trustScore: 94,
    wins: 16,
    losses: 6,
    penalties: 0,
    suspiciousUploads: 0,
    cancelledMatches: 1,
  },
  {
    id: "u_barca",
    username: "BarcaBoss",
    email: "barca@vsports.test",
    country: "Nigeria",
    walletBalance: 210,
    escrowBalance: 0,
    trustScore: 89,
    wins: 14,
    losses: 8,
    penalties: 1,
    suspiciousUploads: 1,
    cancelledMatches: 0,
  },
  {
    id: "u_bayern",
    username: "BayernPro",
    email: "bayern@vsports.test",
    country: "Ghana",
    walletBalance: 290,
    escrowBalance: 0,
    trustScore: 92,
    wins: 19,
    losses: 10,
    penalties: 0,
    suspiciousUploads: 0,
    cancelledMatches: 2,
  },
  {
    id: "u_liverpool",
    username: "KopMaster",
    email: "kop@vsports.test",
    country: "Kenya",
    walletBalance: 225,
    escrowBalance: 0,
    trustScore: 87,
    wins: 11,
    losses: 7,
    penalties: 1,
    suspiciousUploads: 1,
    cancelledMatches: 1,
  },
  {
    id: "u_chelsea",
    username: "BlueBridge",
    email: "chelsea@vsports.test",
    country: "Nigeria",
    walletBalance: 245,
    escrowBalance: 0,
    trustScore: 90,
    wins: 15,
    losses: 11,
    penalties: 0,
    suspiciousUploads: 0,
    cancelledMatches: 1,
  },
];

export const initialChallenges: Challenge[] = [
  {
    id: "ch_1",
    creatorId: "u_blaze",
    title: "BlazeFC 1v1 Proposition",
    stakeAmount: 20,
    prizePool: 40,
    squadRatingLimit: 82,
    rules: "1v1 skill match. Tier rating must be respected. Final scoreboard required.",
    drawRule: "Rematch",
    status: "open",
    deadline: "Tonight 21:00",
    screenshotDeadlineMinutes: 10,
    cancellationFee: 2,
    platformFeePercentage: 8,
  },
  {
    id: "ch_2",
    creatorId: "u_rival",
    title: "RivalKing 1v1 Proposition",
    stakeAmount: 35,
    prizePool: 70,
    squadRatingLimit: 85,
    rules: "1v1 skill match. Same tier range only. No paused rematches without agreement.",
    drawRule: "Refund",
    status: "open",
    deadline: "Saturday 18:30",
    screenshotDeadlineMinutes: 12,
    cancellationFee: 3,
    platformFeePercentage: 7,
  },
  {
    id: "ch_3",
    creatorId: "u_madrid",
    title: "MadridAce 1v1 Proposition",
    stakeAmount: 50,
    prizePool: 100,
    squadRatingLimit: 88,
    rules: "Elite 1v1 match. No custom players. Final scoreboard required.",
    drawRule: "Rematch",
    status: "open",
    deadline: "Tonight 22:30",
    screenshotDeadlineMinutes: 10,
    cancellationFee: 4,
    platformFeePercentage: 8,
  },
  {
    id: "ch_4",
    creatorId: "u_barca",
    title: "BarcaBoss 1v1 Proposition",
    stakeAmount: 15,
    prizePool: 30,
    squadRatingLimit: 80,
    rules: "Fast 1v1 challenge. Same squad tier only.",
    drawRule: "Refund",
    status: "open",
    deadline: "Friday 20:00",
    screenshotDeadlineMinutes: 8,
    cancellationFee: 2,
    platformFeePercentage: 6,
  },
  {
    id: "ch_5",
    creatorId: "u_bayern",
    title: "BayernPro 1v1 Proposition",
    stakeAmount: 25,
    prizePool: 50,
    squadRatingLimit: 84,
    rules: "Balanced squads. Upload scoreboard within the evidence window.",
    drawRule: "Rematch",
    status: "open",
    deadline: "Saturday 16:00",
    screenshotDeadlineMinutes: 10,
    cancellationFee: 2,
    platformFeePercentage: 7,
  },
  {
    id: "ch_6",
    creatorId: "u_liverpool",
    title: "KopMaster 1v1 Proposition",
    stakeAmount: 10,
    prizePool: 20,
    squadRatingLimit: 78,
    rules: "Entry-level match. No exploits or pausing without agreement.",
    drawRule: "Refund",
    status: "open",
    deadline: "Sunday 19:30",
    screenshotDeadlineMinutes: 12,
    cancellationFee: 1,
    platformFeePercentage: 5,
  },
  {
    id: "ch_7",
    creatorId: "u_chelsea",
    title: "BlueBridge 1v1 Proposition",
    stakeAmount: 30,
    prizePool: 60,
    squadRatingLimit: 86,
    rules: "Competitive 1v1. Final whistle screenshot required from both players.",
    drawRule: "Rematch",
    status: "open",
    deadline: "Monday 21:15",
    screenshotDeadlineMinutes: 10,
    cancellationFee: 3,
    platformFeePercentage: 8,
  },
];

export function aiMessage(text: string, messageType: "info" | "action" | "warning" | "success" = "info") {
  return {
    id: uid("msg"),
    senderType: "ai" as const,
    text,
    timestamp: now(),
    messageType,
  };
}

export function stagePrompt(status: MatchRoom["status"]) {
  const prompts: Record<MatchRoom["status"], string> = {
    waiting: "Welcome to the match room. Both players must be present before the match begins.",
    squad_submission: "Both players must submit squad details and confirm they follow the rules.",
    squad_confirmed: "Both squads are submitted. Please confirm the match rules before sharing the code.",
    match_code_ready: "Share your Dream League match code here. Both players may begin once the code is posted.",
    in_progress: "Match in progress. After the final whistle, upload a clear scoreboard screenshot.",
    awaiting_screenshots: "After the match, both players must upload a clear scoreboard screenshot.",
    verifying_results: "I am checking screenshot clarity, detected score, and consistency between both players.",
    awaiting_confirmation: "Review the detected result, payout calculation, and evidence summary.",
    completed: "Match settled. Wallet, escrow, and transaction history have been updated.",
    cancelled: "Match cancelled. Refund and cancellation fee rules have been applied.",
    penalized: "Suspicious evidence detected. A fair play deduction has been applied.",
    refunded: "AI could not determine a winner. Refund rules have been applied.",
  };
  return prompts[status];
}

export function verifyScreenshot(playerId: string, scenario: VerificationScenario, imageUrl: string): EvidenceUpload {
  const statusByScenario: Partial<Record<VerificationScenario, EvidenceStatus>> = {
    playerASuspicious: playerId.includes("one") ? "suspicious" : "valid",
    playerBSuspicious: playerId.includes("two") ? "suspicious" : "valid",
    bothSuspicious: "suspicious",
    playerAMissing: playerId.includes("one") ? "missing" : "valid",
    playerBMissing: playerId.includes("two") ? "missing" : "valid",
    unknown: "unreadable",
  };
  const scoreByScenario: Partial<Record<VerificationScenario, string>> = {
    playerAWin: playerId.includes("one") ? "3-1" : "1-3",
    playerBWin: playerId.includes("one") ? "0-2" : "2-0",
    draw: "2-2",
    match: playerId.includes("one") ? "3-1" : "1-3",
    conflict: playerId.includes("one") ? "3-1" : "2-2",
    playerASuspicious: playerId.includes("one") ? "4-0" : "0-4",
    playerBSuspicious: playerId.includes("one") ? "1-0" : "0-1",
    bothSuspicious: "5-5",
  };
  const status = statusByScenario[scenario] ?? "valid";
  return {
    playerId,
    imageUrl,
    detectedScore: scoreByScenario[scenario] ?? "1-1",
    confidenceScore: status === "valid" ? 92 : status === "suspicious" ? 47 : 22,
    status,
    uploadedAt: now(),
  };
}

const inverseScore = (score: string) => {
  const [a, b] = score.split("-").map(Number);
  return `${b}-${a}`;
};

export function compareEvidence(
  room: MatchRoom,
  challenge: Challenge,
  scenario: VerificationScenario = "match",
): MatchResult {
  const [a, b] = room.evidenceUploads;
  const p1 = room.playerOneId;
  const p2 = room.playerTwoId;
  if (scenario === "unknown" || (!a && !b)) {
    return { confidenceScore: 20, status: "refund", summary: "No reliable evidence was available. Refund minus system fee is recommended." };
  }
  if (a?.status === "suspicious" && b?.status === "suspicious") {
    return { confidenceScore: 35, status: "cancelled", summary: "Both screenshots appear suspicious. Match cancelled with cancellation fees." };
  }
  if (a?.status === "suspicious" || b?.status === "suspicious") {
    const suspicious = a?.status === "suspicious" ? p1 : p2;
    const innocent = suspicious === p1 ? p2 : p1;
    return {
      winnerId: innocent,
      loserId: suspicious,
      detectedScore: a?.detectedScore ?? b?.detectedScore,
      confidenceScore: 78,
      status: "penalty",
      summary: "One screenshot was marked suspicious while the other was usable. Fair play deduction is recommended.",
    };
  }
  if (a?.status === "missing" && b?.status === "valid") {
    return { winnerId: p2, loserId: p1, detectedScore: b.detectedScore, confidenceScore: b.confidenceScore, status: "winner_detected", summary: "Player A missed the screenshot deadline. Player B evidence is accepted." };
  }
  if (b?.status === "missing" && a?.status === "valid") {
    return { winnerId: p1, loserId: p2, detectedScore: a.detectedScore, confidenceScore: a.confidenceScore, status: "winner_detected", summary: "Player B missed the screenshot deadline. Player A evidence is accepted." };
  }
  if (!a || !b || a.status === "unreadable" || b.status === "unreadable") {
    return { confidenceScore: 28, status: "refund", summary: "Evidence was unreadable or incomplete. Refund minus system fee is recommended." };
  }
  if (a.detectedScore !== inverseScore(b.detectedScore)) {
    return { confidenceScore: 56, status: "evidence_conflict", summary: "Screenshots conflict. Additional evidence is required before settlement." };
  }
  const [goalsA, goalsB] = a.detectedScore.split("-").map(Number);
  if (goalsA === goalsB) {
    return { detectedScore: a.detectedScore, confidenceScore: 90, status: "refund", summary: `Draw detected. Draw rule is ${challenge.drawRule}.` };
  }
  const winnerId = goalsA > goalsB ? p1 : p2;
  return {
    winnerId,
    loserId: winnerId === p1 ? p2 : p1,
    detectedScore: a.detectedScore,
    confidenceScore: Math.round((a.confidenceScore + b.confidenceScore) / 2),
    status: "winner_detected",
    summary: `Both screenshots match. ${winnerId === p1 ? "Player A" : "Player B"} is the detected winner.`,
  };
}

export function settleMatch(result: MatchResult, challenge: Challenge): Settlement {
  const platformFee = Math.round(challenge.prizePool * (challenge.platformFeePercentage / 100));
  if (result.status === "winner_detected" && result.winnerId) {
    return {
      winnerId: result.winnerId,
      loserId: result.loserId,
      prizePool: challenge.prizePool,
      platformFee,
      cancellationFee: 0,
      penaltyAmount: 0,
      refundPlayerOne: 0,
      refundPlayerTwo: 0,
      finalStatus: "paid",
    };
  }
  if (result.status === "penalty") {
    return {
      winnerId: result.winnerId,
      loserId: result.loserId,
      prizePool: challenge.prizePool,
      platformFee,
      cancellationFee: 0,
      penaltyAmount: Math.max(5, Math.round(challenge.stakeAmount * 0.35)),
      refundPlayerOne: result.winnerId ? challenge.stakeAmount : 0,
      refundPlayerTwo: result.winnerId ? challenge.stakeAmount : 0,
      finalStatus: "penalized",
    };
  }
  if (result.status === "evidence_conflict") {
    return {
      prizePool: challenge.prizePool,
      platformFee: 0,
      cancellationFee: 0,
      penaltyAmount: 0,
      refundPlayerOne: 0,
      refundPlayerTwo: 0,
      finalStatus: "needs_evidence",
    };
  }
  const refund = Math.max(0, challenge.stakeAmount - challenge.cancellationFee);
  return {
    prizePool: challenge.prizePool,
    platformFee: 0,
    cancellationFee: challenge.cancellationFee,
    penaltyAmount: 0,
    refundPlayerOne: refund,
    refundPlayerTwo: refund,
    finalStatus: result.status === "cancelled" ? "refunded" : "refunded",
  };
}
