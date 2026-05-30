import { create } from "zustand";
import type {
  Challenge,
  ChatMessage,
  EvidenceUpload,
  MatchHistoryItem,
  MatchRoom,
  MatchStatus,
  Page,
  SquadSubmission,
  Transaction,
  User,
  VerificationScenario,
} from "./types";
import {
  aiMessage,
  compareEvidence,
  formatMoney,
  initialChallenges,
  now,
  settleMatch,
  stagePrompt,
  uid,
  users,
  verifyScreenshot,
} from "./lib/mock";

type AppState = {
  page: Page;
  selectedChallengeId?: string;
  selectedRoomId?: string;
  currentUser: User | null;
  users: User[];
  challenges: Challenge[];
  rooms: MatchRoom[];
  transactions: Transaction[];
  history: MatchHistoryItem[];
  scenario: VerificationScenario;
  setPage: (page: Page) => void;
  login: (email: string) => void;
  register: (payload: { username: string; email: string; country: string }) => void;
  logout: () => void;
  selectChallenge: (id: string) => void;
  selectRoom: (id: string) => void;
  createChallenge: (payload: Omit<Challenge, "id" | "creatorId" | "prizePool" | "status">) => boolean;
  acceptChallenge: (challengeId: string) => void;
  submitSquad: (roomId: string, submission: SquadSubmission) => void;
  submitMatchCode: (roomId: string, code: string, startTime?: string) => void;
  sendRoomMessage: (roomId: string, text: string) => void;
  sendRoomMoney: (roomId: string, amount: number) => void;
  uploadEvidence: (roomId: string, playerSlot: "one" | "two", fileName: string) => void;
  runScenario: (roomId: string, scenario: VerificationScenario) => void;
  confirmSettlement: (roomId: string) => void;
  reportIssue: (roomId: string) => void;
  mockDeposit: (amount?: number) => void;
};

const pagePaths: Record<Page, string> = {
  landing: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  marketplace: "/marketplace",
  create: "/create-proposition",
  challenge: "/challenges",
  wallet: "/wallet",
  rooms: "/match-rooms",
  profile: "/profile",
  history: "/match-history",
};

export const pageToPath = (page: Page) => pagePaths[page];

export const routeStateFromPath = (pathname: string): Pick<AppState, "page" | "selectedChallengeId" | "selectedRoomId"> => {
  const [, first = "", second] = pathname.split("/");
  if (first === "login") return { page: "login" };
  if (first === "register") return { page: "register" };
  if (first === "dashboard") return { page: "dashboard" };
  if (first === "marketplace") return { page: "marketplace" };
  if (first === "create-proposition") return { page: "create" };
  if (first === "challenges") return { page: "challenge", selectedChallengeId: second };
  if (first === "wallet") return { page: "wallet" };
  if (first === "match-rooms") return { page: "rooms", selectedRoomId: second };
  if (first === "profile") return { page: "profile" };
  if (first === "match-history") return { page: "history" };
  return { page: "landing" };
};

const pushPath = (path: string) => {
  if (typeof window === "undefined" || window.location.pathname === path) return;
  window.history.pushState({}, "", path);
};

const addTx = (userId: string, type: Transaction["type"], amount: number, description: string): Transaction => ({
  id: uid("tx"),
  userId,
  type,
  amount,
  status: "mock",
  description,
  createdAt: now(),
});

const replaceUser = (list: User[], id: string, patch: Partial<User>) =>
  list.map((user) => (user.id === id ? { ...user, ...patch } : user));

const getRoomPlayers = (room: MatchRoom) => [
  { id: room.playerOneId, slot: "one" as const },
  { id: room.playerTwoId, slot: "two" as const },
];

export const useAppStore = create<AppState>((set, get) => ({
  ...routeStateFromPath(typeof window === "undefined" ? "/" : window.location.pathname),
  currentUser: null,
  users,
  challenges: initialChallenges,
  rooms: [],
  transactions: [
    addTx("u_neo", "Deposit", 240, "Mock wallet balance loaded"),
    addTx("u_blaze", "Deposit", 180, "Mock wallet balance loaded"),
    addTx("u_rival", "Deposit", 320, "Mock wallet balance loaded"),
  ],
  history: [
    {
      id: "mh_1",
      opponent: "BlazeFC",
      stake: 15,
      result: "Win",
      score: "2-0",
      payout: 27,
      evidenceStatus: "Valid screenshots",
      date: "May 28",
      trustImpact: 2,
    },
  ],
  scenario: "match",
  setPage: (page) => {
    pushPath(pageToPath(page));
    set({ page, selectedChallengeId: undefined, selectedRoomId: undefined });
  },
  login: (email) => {
    const user = get().users.find((candidate) => candidate.email === email) ?? get().users[0];
    pushPath(pageToPath("dashboard"));
    set({ currentUser: user, page: "dashboard" });
  },
  register: ({ username, email, country }) => {
    const user: User = {
      id: uid("u"),
      username,
      email,
      country,
      walletBalance: 250,
      escrowBalance: 0,
      trustScore: 100,
      wins: 0,
      losses: 0,
      penalties: 0,
      suspiciousUploads: 0,
      cancelledMatches: 0,
    };
    pushPath(pageToPath("dashboard"));
    set((state) => ({
      users: [user, ...state.users],
      currentUser: user,
      page: "dashboard",
      transactions: [addTx(user.id, "Deposit", 250, "Mock signup balance"), ...state.transactions],
    }));
  },
  logout: () => {
    pushPath(pageToPath("landing"));
    set({ currentUser: null, page: "landing", selectedChallengeId: undefined, selectedRoomId: undefined });
  },
  selectChallenge: (id) => {
    pushPath(`/challenges/${id}`);
    set({ selectedChallengeId: id, page: "challenge" });
  },
  selectRoom: (id) => {
    pushPath(`/match-rooms/${id}`);
    set({ selectedRoomId: id, page: "rooms" });
  },
  createChallenge: (payload) => {
    const user = get().currentUser;
    if (!user || user.walletBalance < payload.stakeAmount) return false;
    const challenge: Challenge = {
      ...payload,
      id: uid("ch"),
      creatorId: user.id,
      prizePool: payload.stakeAmount * 2,
      status: "open",
    };
    const updatedUser = {
      ...user,
      walletBalance: user.walletBalance - payload.stakeAmount,
      escrowBalance: user.escrowBalance + payload.stakeAmount,
    };
    pushPath(`/challenges/${challenge.id}`);
    set((state) => ({
      currentUser: updatedUser,
      users: replaceUser(state.users, user.id, updatedUser),
      challenges: [challenge, ...state.challenges],
      transactions: [
        addTx(user.id, "Stake locked", -payload.stakeAmount, `Stake locked for ${payload.title}`),
        ...state.transactions,
      ],
      selectedChallengeId: challenge.id,
      page: "challenge",
    }));
    return true;
  },
  acceptChallenge: (challengeId) => {
    const user = get().currentUser;
    const challenge = get().challenges.find((item) => item.id === challengeId);
    if (!user || !challenge || user.walletBalance < challenge.stakeAmount || user.id === challenge.creatorId) return;
    const room: MatchRoom = {
      id: uid("room"),
      challengeId,
      playerOneId: challenge.creatorId,
      playerTwoId: user.id,
      status: "squad_submission",
      squadSubmissions: [],
      evidenceUploads: [],
      chatMessages: [
        aiMessage(`Welcome to the match room. Each player entry is ${formatMoney(challenge.stakeAmount)}. Total mock escrow output is ${formatMoney(challenge.prizePool)}.`),
        aiMessage(stagePrompt("squad_submission"), "action"),
      ],
    };
    const updatedUser = {
      ...user,
      walletBalance: user.walletBalance - challenge.stakeAmount,
      escrowBalance: user.escrowBalance + challenge.stakeAmount,
    };
    pushPath(`/match-rooms/${room.id}`);
    set((state) => ({
      currentUser: updatedUser,
      users: replaceUser(state.users, user.id, updatedUser),
      challenges: state.challenges.map((item) =>
        item.id === challengeId ? { ...item, opponentId: user.id, status: "accepted" } : item,
      ),
      rooms: [room, ...state.rooms],
      transactions: [
        addTx(user.id, "Stake locked", -challenge.stakeAmount, `Entry locked for ${challenge.title}`),
        ...state.transactions,
      ],
      selectedRoomId: room.id,
      page: "rooms",
    }));
  },
  submitSquad: (roomId, submission) => {
    set((state) => {
      const rooms = state.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const nextSubmissions = [
          ...room.squadSubmissions.filter((item) => item.playerId !== submission.playerId),
          submission,
        ];
        const bothConfirmed = getRoomPlayers(room).every((player) =>
          nextSubmissions.some((item) => item.playerId === player.id && item.confirmed),
        );
        const status: MatchStatus = bothConfirmed ? "squad_confirmed" : "squad_submission";
        const text = bothConfirmed
          ? "Both squads are submitted. Please confirm that the rules are accepted."
          : `${submission.playerId === room.playerOneId ? "Player A" : "Player B"} has submitted squad details. Waiting for the other player.`;
        return {
          ...room,
          status,
          squadSubmissions: nextSubmissions,
          chatMessages: [...room.chatMessages, aiMessage(text, bothConfirmed ? "success" : "info")],
        };
      });
      return { rooms };
    });
  },
  submitMatchCode: (roomId, code, startTime) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "in_progress",
              matchCode: code,
              matchStartTime: startTime,
              chatMessages: [
                ...room.chatMessages,
                aiMessage("Match code submitted. Both players may now begin the game.", "success"),
                aiMessage(stagePrompt("in_progress"), "action"),
              ],
            }
          : room,
      ),
    }));
  },
  sendRoomMessage: (roomId, text) => {
    const user = get().currentUser;
    const clean = text.trim();
    if (!user || !clean) return;
    const playerMessage: ChatMessage = {
      id: uid("msg"),
      senderType: "player",
      senderId: user.id,
      text: clean,
      timestamp: now(),
      messageType: clean.toLowerCase().startsWith("@refree") ? "action" : "info",
    };
    const refereeReply =
      clean.toLowerCase().startsWith("@refree")
        ? [
            aiMessage(
              "Referee noted. I will only decide the match from shared code, uploaded scoreboard evidence, and escrow rules.",
              "info",
            ),
          ]
        : [];
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, chatMessages: [...room.chatMessages, playerMessage, ...refereeReply] }
          : room,
      ),
    }));
  },
  sendRoomMoney: (roomId, amount) => {
    const state = get();
    const sender = state.currentUser;
    const room = state.rooms.find((item) => item.id === roomId);
    if (!sender || !room || amount <= 0 || sender.walletBalance < amount) return;
    const recipientId = sender.id === room.playerOneId ? room.playerTwoId : room.playerOneId;
    const recipient = state.users.find((user) => user.id === recipientId);
    if (!recipient) return;
    const updatedSender = { ...sender, walletBalance: sender.walletBalance - amount };
    const updatedRecipient = { ...recipient, walletBalance: recipient.walletBalance + amount };
    const senderName = sender.username;
    const recipientName = recipient.username;
    set((current) => ({
      currentUser: updatedSender,
      users: replaceUser(replaceUser(current.users, sender.id, updatedSender), recipient.id, updatedRecipient),
      transactions: [
        addTx(sender.id, "Transfer sent", -amount, `Room transfer to ${recipientName}`),
        addTx(recipient.id, "Transfer received", amount, `Room transfer from ${senderName}`),
        ...current.transactions,
      ],
      rooms: current.rooms.map((item) =>
        item.id === roomId
          ? {
              ...item,
              chatMessages: [
                ...item.chatMessages,
                {
                  id: uid("msg"),
                  senderType: "system",
                  text: `${senderName} sent ${formatMoney(amount)} to ${recipientName}. This is a mock room transfer, not escrow settlement.`,
                  timestamp: now(),
                  messageType: "success",
                },
              ],
            }
          : item,
      ),
    }));
  },
  uploadEvidence: (roomId, playerSlot, fileName) => {
    const scenario = get().scenario;
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const playerId = playerSlot === "one" ? room.playerOneId : room.playerTwoId;
        const evidence = verifyScreenshot(`${playerId}_${playerSlot}`, scenario, `mock://${fileName || "scoreboard.png"}`);
        const normalized = { ...evidence, playerId };
        const uploads = [...room.evidenceUploads.filter((item) => item.playerId !== playerId), normalized];
        return {
          ...room,
          status: uploads.length >= 2 ? "verifying_results" : "awaiting_screenshots",
          evidenceUploads: uploads,
          chatMessages: [
            ...room.chatMessages,
            aiMessage(`${playerSlot === "one" ? "Player A" : "Player B"} uploaded evidence. Detected score ${normalized.detectedScore} with ${normalized.confidenceScore}% confidence.`, normalized.status === "valid" ? "info" : "warning"),
          ],
        };
      }),
    }));
  },
  runScenario: (roomId, scenario) => {
    const state = get();
    const room = state.rooms.find((item) => item.id === roomId);
    const challenge = state.challenges.find((item) => item.id === room?.challengeId);
    if (!room || !challenge) return;
    const evA = verifyScreenshot(`${room.playerOneId}_one`, scenario, "mock://player-a-scoreboard.png");
    const evB = verifyScreenshot(`${room.playerTwoId}_two`, scenario, "mock://player-b-scoreboard.png");
    const evidence: EvidenceUpload[] = [
      { ...evA, playerId: room.playerOneId },
      { ...evB, playerId: room.playerTwoId },
    ];
    const simulatedRoom = { ...room, evidenceUploads: evidence };
    const result = compareEvidence(simulatedRoom, challenge, scenario);
    const settlement = settleMatch(result, challenge);
    const nextStatus: MatchStatus =
      settlement.finalStatus === "paid"
        ? "awaiting_confirmation"
        : settlement.finalStatus === "penalized"
          ? "penalized"
          : settlement.finalStatus === "needs_evidence"
            ? "awaiting_confirmation"
            : result.status === "cancelled"
              ? "cancelled"
              : "refunded";
    set((current) => ({
      scenario,
      rooms: current.rooms.map((item) =>
        item.id === roomId
          ? {
              ...item,
              status: nextStatus,
              evidenceUploads: evidence,
              result,
              settlement,
              chatMessages: [
                ...item.chatMessages,
                aiMessage("Developer mode simulation started.", "info"),
                aiMessage(result.summary, result.status === "evidence_conflict" ? "warning" : "success"),
              ],
            }
          : item,
      ),
    }));
  },
  confirmSettlement: (roomId) => {
    const state = get();
    const room = state.rooms.find((item) => item.id === roomId);
    const challenge = state.challenges.find((item) => item.id === room?.challengeId);
    if (!room || !challenge || !room.settlement) return;
    const { settlement } = room;
    const p1 = state.users.find((user) => user.id === room.playerOneId);
    const p2 = state.users.find((user) => user.id === room.playerTwoId);
    if (!p1 || !p2) return;
    let nextUsers = state.users;
    const txs: Transaction[] = [];
    const escrowPatch = (user: User) => ({ escrowBalance: Math.max(0, user.escrowBalance - challenge.stakeAmount) });
    nextUsers = replaceUser(nextUsers, p1.id, escrowPatch(p1));
    nextUsers = replaceUser(nextUsers, p2.id, escrowPatch(p2));
    if (settlement.finalStatus === "paid" && settlement.winnerId) {
      const winner = state.users.find((user) => user.id === settlement.winnerId)!;
      const loser = state.users.find((user) => user.id === settlement.loserId)!;
      const payout = challenge.prizePool - settlement.platformFee;
      nextUsers = replaceUser(nextUsers, winner.id, {
        walletBalance: winner.walletBalance + payout,
        escrowBalance: Math.max(0, winner.escrowBalance - challenge.stakeAmount),
        wins: winner.wins + 1,
        trustScore: Math.min(100, winner.trustScore + 2),
      });
      nextUsers = replaceUser(nextUsers, loser.id, {
        escrowBalance: Math.max(0, loser.escrowBalance - challenge.stakeAmount),
        losses: loser.losses + 1,
      });
      txs.push(addTx(winner.id, "Prize received", payout, `Prize payout for ${challenge.title}`));
      txs.push(addTx(winner.id, "Platform fee", -settlement.platformFee, `${challenge.platformFeePercentage}% platform fee`));
    } else if (settlement.finalStatus === "penalized" && settlement.loserId) {
      const suspicious = state.users.find((user) => user.id === settlement.loserId)!;
      const innocent = state.users.find((user) => user.id === settlement.winnerId)!;
      const refund = challenge.stakeAmount;
      nextUsers = replaceUser(nextUsers, innocent.id, {
        walletBalance: innocent.walletBalance + refund,
        trustScore: Math.min(100, innocent.trustScore + 1),
      });
      nextUsers = replaceUser(nextUsers, suspicious.id, {
        walletBalance: Math.max(0, suspicious.walletBalance + refund - settlement.penaltyAmount),
        penalties: suspicious.penalties + 1,
        suspiciousUploads: suspicious.suspiciousUploads + 1,
        trustScore: Math.max(0, suspicious.trustScore - 10),
      });
      txs.push(addTx(innocent.id, "Stake refunded", refund, "Refund after suspicious opponent evidence"));
      txs.push(addTx(suspicious.id, "Penalty deducted", -settlement.penaltyAmount, "Fair play deduction"));
    } else if (settlement.finalStatus === "refunded") {
      nextUsers = replaceUser(nextUsers, p1.id, {
        walletBalance: p1.walletBalance + settlement.refundPlayerOne,
        cancelledMatches: p1.cancelledMatches + 1,
        trustScore: Math.max(0, p1.trustScore - 3),
      });
      nextUsers = replaceUser(nextUsers, p2.id, {
        walletBalance: p2.walletBalance + settlement.refundPlayerTwo,
        cancelledMatches: p2.cancelledMatches + 1,
        trustScore: Math.max(0, p2.trustScore - 3),
      });
      txs.push(addTx(p1.id, "Stake refunded", settlement.refundPlayerOne, "Refund after automated settlement"));
      txs.push(addTx(p2.id, "Stake refunded", settlement.refundPlayerTwo, "Refund after automated settlement"));
      txs.push(addTx(p1.id, "Cancellation fee", -challenge.cancellationFee, "Mock cancellation fee"));
      txs.push(addTx(p2.id, "Cancellation fee", -challenge.cancellationFee, "Mock cancellation fee"));
    }
    const currentUser = state.currentUser ? nextUsers.find((user) => user.id === state.currentUser?.id) ?? state.currentUser : null;
    set({
      users: nextUsers,
      currentUser,
      transactions: [...txs, ...state.transactions],
      challenges: state.challenges.map((item) => (item.id === challenge.id ? { ...item, status: "completed" } : item)),
      rooms: state.rooms.map((item) =>
        item.id === roomId
          ? {
              ...item,
              status: settlement.finalStatus === "penalized" ? "penalized" : settlement.finalStatus === "refunded" ? "refunded" : "completed",
              chatMessages: [...item.chatMessages, aiMessage(`Settlement complete. Escrow is now ${formatMoney(0)}.`, "success")],
            }
          : item,
      ),
      history: [
        {
          id: uid("mh"),
          opponent: state.users.find((user) => user.id !== state.currentUser?.id && [room.playerOneId, room.playerTwoId].includes(user.id))?.username ?? "Opponent",
          stake: challenge.stakeAmount,
          result: settlement.finalStatus === "paid" ? "Settled" : settlement.finalStatus,
          score: room.result?.detectedScore ?? "N/A",
          payout: settlement.finalStatus === "paid" ? challenge.prizePool - settlement.platformFee : settlement.refundPlayerOne,
          evidenceStatus: room.result?.summary ?? "Automated result",
          date: "Today",
          trustImpact: settlement.finalStatus === "paid" ? 2 : settlement.finalStatus === "penalized" ? -10 : -3,
        },
        ...state.history,
      ],
    });
  },
  reportIssue: (roomId) => {
    const state = get();
    const room = state.rooms.find((item) => item.id === roomId);
    if (!room) return;
    set({
      rooms: state.rooms.map((item) =>
        item.id === roomId
          ? {
              ...item,
              status: "penalized",
              chatMessages: [
                ...item.chatMessages,
                aiMessage("Issue reported. Automated fair play deduction system has been triggered for suspicious or incomplete evidence.", "warning"),
              ],
            }
          : item,
      ),
    });
  },
  mockDeposit: (amount = 100) => {
    const user = get().currentUser;
    if (!user || amount <= 0) return;
    const updated = { ...user, walletBalance: user.walletBalance + amount };
    set((state) => ({
      currentUser: updated,
      users: replaceUser(state.users, user.id, updated),
      transactions: [addTx(user.id, "Deposit", amount, "Wallet funded from mock payment flow"), ...state.transactions],
    }));
  },
}));
