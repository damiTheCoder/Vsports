export type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "marketplace"
  | "create"
  | "challenge"
  | "wallet"
  | "rooms"
  | "profile"
  | "history";

export type ChallengeStatus = "open" | "accepted" | "completed" | "cancelled";

export type MatchStatus =
  | "waiting"
  | "squad_submission"
  | "squad_confirmed"
  | "match_code_ready"
  | "in_progress"
  | "awaiting_screenshots"
  | "verifying_results"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "penalized"
  | "refunded";

export type EvidenceStatus = "valid" | "suspicious" | "unreadable" | "missing";

export type TransactionType =
  | "Deposit"
  | "Stake locked"
  | "Prize received"
  | "Stake refunded"
  | "Penalty deducted"
  | "Platform fee"
  | "Cancellation fee"
  | "Transfer sent"
  | "Transfer received";

export interface User {
  id: string;
  username: string;
  email: string;
  country: string;
  bio?: string;
  walletBalance: number;
  escrowBalance: number;
  trustScore: number;
  wins: number;
  losses: number;
  penalties: number;
  suspiciousUploads: number;
  cancelledMatches: number;
}

export interface Challenge {
  id: string;
  creatorId: string;
  opponentId?: string;
  title: string;
  stakeAmount: number;
  prizePool: number;
  squadRatingLimit: number;
  rules: string;
  drawRule: "Rematch" | "Refund";
  status: ChallengeStatus;
  deadline: string;
  screenshotDeadlineMinutes: number;
  cancellationFee: number;
  platformFeePercentage: number;
}

export interface MatchRoom {
  id: string;
  challengeId: string;
  playerOneId: string;
  playerTwoId: string;
  status: MatchStatus;
  matchCode?: string;
  matchStartTime?: string;
  squadSubmissions: SquadSubmission[];
  evidenceUploads: EvidenceUpload[];
  chatMessages: ChatMessage[];
  result?: MatchResult;
  settlement?: Settlement;
}

export interface SquadSubmission {
  playerId: string;
  teamName: string;
  squadRating: number;
  notes: string;
  screenshotUrl?: string;
  confirmed: boolean;
}

export interface EvidenceUpload {
  playerId: string;
  imageUrl: string;
  detectedScore: string;
  confidenceScore: number;
  status: EvidenceStatus;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  senderType: "ai" | "player" | "system";
  senderId?: string;
  text: string;
  timestamp: string;
  messageType: "info" | "action" | "warning" | "success";
}

export interface MatchResult {
  winnerId?: string;
  loserId?: string;
  detectedScore?: string;
  confidenceScore: number;
  status:
    | "winner_detected"
    | "evidence_conflict"
    | "cancelled"
    | "penalty"
    | "refund";
  summary: string;
}

export interface Settlement {
  winnerId?: string;
  loserId?: string;
  prizePool: number;
  platformFee: number;
  cancellationFee: number;
  penaltyAmount: number;
  refundPlayerOne: number;
  refundPlayerTwo: number;
  finalStatus: "paid" | "refunded" | "penalized" | "needs_evidence";
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: "completed" | "pending" | "mock";
  description: string;
  createdAt: string;
}

export interface MatchHistoryItem {
  id: string;
  opponent: string;
  stake: number;
  result: string;
  score: string;
  payout: number;
  evidenceStatus: string;
  date: string;
  trustImpact: number;
}

export type VerificationScenario =
  | "playerAWin"
  | "playerBWin"
  | "draw"
  | "match"
  | "conflict"
  | "playerASuspicious"
  | "playerBSuspicious"
  | "bothSuspicious"
  | "playerAMissing"
  | "playerBMissing"
  | "unknown";
