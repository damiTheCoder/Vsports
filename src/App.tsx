import {
  BadgeDollarSign,
  Bot,
  CheckCircle2,
  Clock3,
  Coins,
  Gavel,
  History,
  Home,
  LogIn,
  Medal,
  MessageSquare,
  Mic,
  Moon,
  Plus,
  Send,
  ShieldCheck,
  Sun,
  Swords,
  Upload,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { formatMoney } from "./lib/mock";
import { routeStateFromPath, useAppStore } from "./store";
import type {
  Challenge,
  EvidenceUpload,
  MatchRoom,
  Page,
  SquadSubmission,
  User,
  VerificationScenario,
} from "./types";

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  { page: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { page: "marketplace", label: "Marketplace", icon: <Swords size={18} /> },
  { page: "create", label: "Create", icon: <Plus size={18} /> },
  { page: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
  { page: "rooms", label: "Match Rooms", icon: <Bot size={18} /> },
  { page: "profile", label: "Profile", icon: <UserRound size={18} /> },
  { page: "history", label: "History", icon: <History size={18} /> },
];

function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "size-28" : size === "sm" ? "size-9" : "size-10";
  return (
    <img
      src="/r1.png"
      alt="Vsports logo"
      className={`${dimensions} rounded-lg object-cover`}
    />
  );
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-lime-400 text-black hover:bg-lime-300",
    ghost: "border border-transparent bg-lime-50 text-black hover:bg-lime-100",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-black/80">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return "min-h-11 rounded-lg border border-transparent bg-lime-50 px-3 text-black outline-none transition focus:bg-lime-50";
}

function TrustScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "text-lime-600 border-transparent" : score >= 75 ? "text-black border-transparent" : "text-red-600 border-transparent";
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${color}`}>Trust {score}</span>;
}

function MatchStatusBadge({ status }: { status: string }) {
  return <span className="rounded-full border border-transparent bg-lime-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">{status.replaceAll("_", " ")}</span>;
}

function WalletCard({ user }: { user: User }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black/60">Available wallet</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(user.walletBalance)}</p>
        </div>
        <Coins className="text-lime-600" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-[#f6f6f2] p-3">
          <p className="text-black/60">Escrow</p>
          <p className="font-bold text-black">{formatMoney(user.escrowBalance)}</p>
        </div>
        <div className="rounded-lg bg-[#f6f6f2] p-3">
          <p className="text-black/60">Record</p>
          <p className="font-bold">{user.wins}W / {user.losses}L</p>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ user, label }: { user?: User; label: string }) {
  return (
    <div className="rounded-xl border border-transparent bg-[#f6f6f2] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-black/50">{label}</p>
          <p className="font-bold">{user?.username ?? "Waiting"}</p>
          <p className="text-sm text-black/60">{user?.country ?? "Opponent slot open"}</p>
        </div>
        {user ? <TrustScoreBadge score={user.trustScore} /> : <Clock3 className="text-black/50" />}
      </div>
    </div>
  );
}

function Sidebar() {
  const page = useAppStore((state) => state.page);
  const setPage = useAppStore((state) => state.setPage);
  return (
    <aside className="hidden border-r border-transparent bg-white p-4 lg:block">
      <button onClick={() => setPage("landing")} className="mb-8 flex items-center gap-3">
        <BrandMark />
        <div className="text-left">
          <p className="text-lg font-black">Vsports</p>
          <p className="text-xs text-black/50">Skill match escrow</p>
        </div>
      </button>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-left text-sm transition ${page === item.page ? "text-lime-600" : "text-black/80 hover:text-lime-600"}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function TopNav() {
  const currentUser = useAppStore((state) => state.currentUser);
  const page = useAppStore((state) => state.page);
  const setPage = useAppStore((state) => state.setPage);
  const logout = useAppStore((state) => state.logout);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return window.localStorage.getItem("vsports-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", isDarkTheme);
    window.localStorage.setItem("vsports-theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  return (
    <header className="border-b border-transparent bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2 font-black lg:hidden">
          <BrandMark size="sm" /> Vsports
        </button>
        <div className="hidden text-sm text-black/60 lg:block">Real-money DLS challenge prototype using mock escrow and AI verification</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkTheme((current) => !current)}
            className="grid size-11 place-items-center rounded-lg bg-lime-50 text-black transition hover:bg-lime-100"
            aria-label={isDarkTheme ? "Switch to white theme" : "Switch to black theme"}
            title={isDarkTheme ? "White theme" : "Black theme"}
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {currentUser ? (
            <>
              <span className="hidden text-sm text-black/80 sm:block">{currentUser.username}</span>
              <TrustScoreBadge score={currentUser.trustScore} />
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button onClick={() => setPage("login")}><LogIn size={16} /> Login</Button>
          )}
        </div>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto lg:hidden">
        {navItems.slice(0, 6).map((item) => (
          <button key={item.page} onClick={() => setPage(item.page)} className={`inline-flex min-w-max items-center gap-2 rounded-full border border-transparent bg-white px-3 py-2 text-xs ${page === item.page ? "text-lime-600" : "text-black/80"}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function TopBanner() {
  const bannerImages = ["/k8.jpeg", "/k9.jpeg", "/K3.jpeg", "/K.jpeg"];
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % bannerImages.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <div className="relative h-20 w-full overflow-hidden sm:h-24 lg:h-28">
      <img
        src={bannerImages[activeBanner]}
        alt="Football banner"
        className="size-full object-cover object-[center_18%]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <div>
        <div className="sticky top-0 z-20 bg-white">
          <TopBanner />
          <TopNav />
        </div>
        <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-5">{children}</main>
      </div>
    </div>
  );
}

function LandingPage() {
  const setPage = useAppStore((state) => state.setPage);
  const features = [
    ["Create", "Set the football game, entry amount, rules, and match deadline."],
    ["Escrow", "Both players lock the same entry before the match starts."],
    ["Verify", "Upload scoreboard screenshots for AI-assisted result checks."],
    ["Settle", "Apply win, refund, or penalty rules from one match room."],
  ];
  return (
    <div className="min-h-screen bg-white">
      <div className="grid gap-0 bg-white">
        <section className="relative mt-0 min-h-screen overflow-hidden bg-sky-500">
          <img src="/k5.jpeg" alt="Football player artwork" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-sky-500/25" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-white/70 to-white" />
          <div className="relative z-10 flex min-h-screen flex-col p-5 sm:p-7 lg:p-9">
            <div className="fixed left-5 right-5 top-5 z-50 flex items-center justify-between rounded-lg bg-sky-400/55 px-4 py-3 text-white backdrop-blur-sm sm:left-7 sm:right-7 lg:left-9 lg:right-9">
              <div className="flex items-center gap-2">
                <BrandMark size="sm" />
                <span className="text-sm font-bold">Vsports</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage("login")} className="bg-white px-4 py-2 text-xs font-bold text-black">
                  Login <span className="ml-2 bg-lime-400 px-2 py-1">›</span>
                </button>
                <button onClick={() => setPage("register")} className="hidden bg-lime-400 px-4 py-2 text-xs font-bold text-black sm:block">
                  Sign up
                </button>
              </div>
            </div>
            <div className="relative mt-28 flex-1 sm:mt-32 lg:mt-36">
              <h1 className="max-w-6xl text-[4.2rem] font-black uppercase leading-[0.82] tracking-tight text-white sm:text-[6.5rem] lg:text-[9.5rem]">
                Challenge. Play. Prove.
              </h1>
              <div className="mt-6 max-w-xs bg-sky-400/50 p-4 text-white backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide">Starting with Dream League Soccer</p>
                <p className="mt-2 text-xl font-bold leading-tight">1v1 DLS challenges with escrow and proof.</p>
              </div>
              <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white">
                Create a proposition, lock equal entries, play the match, upload proof, and let the AI referee guide settlement.
              </p>
            </div>
          </div>
        </section>

        <section className="px-[7%] py-14">
          <div className="flex items-center gap-4 border-t border-black/10 pt-4 text-xs">
            <span className="grid size-7 place-items-center rounded-full border border-black/20">A</span>
            <span>About</span>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <h2 className="text-4xl font-black uppercase leading-none sm:text-5xl">
              The competition layer for trusted 1v1 football gaming
            </h2>
            <p className="text-sm leading-7 text-black/65">
              Football gamers already compete through group chats and DMs, but payments, proof, disputes, and reputation are messy. Vsports gives every challenge a structured flow.
            </p>
            <div className="text-sm leading-7 text-black/65">
              <p>Players create propositions, lock entries in escrow, share match codes, upload scoreboard screenshots, and let an AI-assisted referee explain the settlement path.</p>
              <button onClick={() => setPage("marketplace")} className="mt-5 bg-black px-4 py-3 text-xs font-bold text-white">
                Browse challenges <span className="ml-2 bg-lime-400 px-2 py-1 text-black">›</span>
              </button>
            </div>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden">
              <img src="/K.jpeg" alt="Football player artwork" className="h-[520px] w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[1fr_1fr_64px] bg-sky-950/80 text-white">
                <div className="p-4">
                  <p className="text-2xl font-black text-lime-300">$5+</p>
                  <p className="text-sm">Stake each</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-black text-lime-300">x2</p>
                  <p className="text-sm">Escrow output</p>
                </div>
                <button onClick={() => setPage("marketplace")} className="grid place-items-center bg-sky-900 text-3xl">↗</button>
              </div>
            </div>
            <div className="grid content-between gap-6">
              <img src="/K1.jpeg" alt="Football player artwork" className="h-72 w-full object-cover" />
              <div>
                <div className="flex items-end gap-4">
                  <span className="text-8xl font-black text-lime-400">AI</span>
                  <span className="pb-4 text-xl font-bold leading-tight">Referee<br />Room</span>
                </div>
                <ul className="mt-4 list-disc pl-5 text-sm leading-7 text-black/70">
                  <li>AI-guided private match room</li>
                  <li>Escrow output equals both entries</li>
                  <li>Screenshot proof, trust scores, and fair-play penalties</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="px-[7%] pb-14" id="how">
          <div className="flex items-center gap-4 border-t border-black/10 pt-4 text-xs">
            <span className="grid size-7 place-items-center rounded-full border border-black/20">B</span>
            <span>How It Works</span>
          </div>
          <h2 className="mt-10 max-w-3xl text-4xl font-black uppercase leading-none sm:text-5xl">From challenge to settlement in one flow.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="overflow-hidden bg-[#f6f6f2]">
              <img src="/K3.jpeg" alt="Football player artwork" className="h-72 w-full object-cover" />
              <p className="p-4 text-xl font-bold">Create a challenge</p>
            </div>
            <div className="overflow-hidden bg-[#f6f6f2]">
              <img src="/k4.jpeg" alt="Football player artwork" className="h-72 w-full object-cover" />
              <p className="p-4 text-xl font-bold">Accept and lock escrow</p>
            </div>
            <div className="overflow-hidden bg-[#f6f6f2]">
              <img src="/k7.jpeg" alt="Football player artwork" className="h-72 w-full object-cover" />
              <p className="p-4 text-xl font-bold">Upload proof and settle</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, text]) => (
              <div key={title} className="bg-[#f6f6f2] p-5">
                <p className="text-2xl font-bold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-black/60">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <footer className="bg-black px-[7%] py-8 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <div>
                <p className="text-xl font-black">Vsports</p>
                <p className="text-sm text-white/60">The 1v1 competition layer for virtual sports gamers.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <a href="#how">How It Works</a>
              <button onClick={() => setPage("marketplace")}>Marketplace</button>
              <button onClick={() => setPage("login")}>Login</button>
              <button onClick={() => setPage("register")}>Sign up</button>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-6 text-white/45">
            Prototype only. Real deposits, withdrawals, and prize settlement require payment, legal, and regional compliance before launch.
          </p>
        </footer>
      </div>
    </div>
  );
}

function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const setPage = useAppStore((state) => state.setPage);
  const [form, setForm] = useState({ username: "NeoStriker", email: "neo@vsports.test", password: "password", country: "Nigeria", age: true, terms: true });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") login(form.email);
    else if (form.age && form.terms) register(form);
  };
  const continueWithGoogle = () => {
    if (mode === "login") login(form.email);
    else register({ username: form.username || "GooglePlayer", email: form.email, country: form.country });
  };
  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={submit} className="glass grid gap-4 rounded-xl p-5">
        <h2 className="text-3xl font-black">{mode === "login" ? "Login" : "Register"}</h2>
        <button type="button" onClick={continueWithGoogle} className="flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4 py-4 text-base font-bold text-black">
          <span className="grid size-7 place-items-center rounded-full bg-white text-lg font-black shadow-sm">G</span>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-black/40">
          <span className="h-px flex-1 bg-black/10" />
          or use email
          <span className="h-px flex-1 bg-black/10" />
        </div>
        {mode === "register" && <Field label="Username"><input className={inputClass()} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>}
        <Field label="Email"><input className={inputClass()} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input className={inputClass()} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        {mode === "register" && <Field label="Country"><input className={inputClass()} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>}
        {mode === "register" && (
          <div className="grid gap-3 text-sm text-black/80">
            <label className="flex gap-3"><input type="checkbox" checked={form.age} onChange={(e) => setForm({ ...form, age: e.target.checked })} /> I confirm I meet the age requirement.</label>
            <label className="flex gap-3"><input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} /> I agree to the challenge rules and terms.</label>
          </div>
        )}
        <Button type="submit">{mode === "login" ? "Login" : "Create Account"}</Button>
        <button type="button" onClick={() => setPage(mode === "login" ? "register" : "login")} className="text-sm text-black">
          {mode === "login" ? "Need an account? Register" : "Already registered? Login"}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const user = useAppStore((state) => state.currentUser);
  const rooms = useAppStore((state) => state.rooms);
  const challenges = useAppStore((state) => state.challenges);
  const transactions = useAppStore((state) => state.transactions);
  if (!user) return <AuthGate />;
  const userTx = transactions.filter((tx) => tx.userId === user.id).slice(0, 5);
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="glass rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-black/60">Player profile</p>
              <h2 className="text-3xl font-black">{user.username}</h2>
              <p className="text-black/60">{user.country} · Verification mock-active</p>
            </div>
            <TrustScoreBadge score={user.trustScore} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Stat label="Total matches" value={user.wins + user.losses} />
            <Stat label="Wins" value={user.wins} />
            <Stat label="Losses" value={user.losses} />
            <Stat label="Penalties" value={user.penalties} />
          </div>
        </div>
        <WalletCard user={user} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Active challenges" icon={<Swords size={18} />}>
          {challenges.filter((challenge) => challenge.creatorId === user.id || challenge.opponentId === user.id).slice(0, 4).map((challenge) => <ChallengeRow key={challenge.id} challenge={challenge} />)}
        </Panel>
        <Panel title="Active match rooms" icon={<Bot size={18} />}>
          {rooms.filter((room) => room.playerOneId === user.id || room.playerTwoId === user.id).map((room) => <RoomRow key={room.id} room={room} />)}
          {rooms.length === 0 && <p className="text-sm text-black/60">No active rooms yet. Accept or create a challenge to start.</p>}
        </Panel>
      </div>
      <TransactionTable transactions={userTx} />
    </div>
  );
}

function AuthGate() {
  const setPage = useAppStore((state) => state.setPage);
  return (
    <div className="glass mx-auto max-w-lg rounded-xl p-6 text-center">
      <h2 className="text-2xl font-black">Mock login required</h2>
      <p className="mt-2 text-black/60">Use the auth screen to load a fake player profile and wallet.</p>
      <div className="mt-5"><Button onClick={() => setPage("login")}>Go to Login</Button></div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-lg border border-transparent bg-[#f6f6f2] p-4"><p className="text-sm text-black/60">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="glass rounded-xl p-5"><div className="mb-4 flex items-center gap-2 font-bold">{icon}{title}</div><div className="grid gap-3">{children}</div></section>;
}

function ChallengeRow({ challenge }: { challenge: Challenge }) {
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  return <button onClick={() => selectChallenge(challenge.id)} className="flex items-center justify-between rounded-lg border border-transparent bg-[#f6f6f2] p-3 text-left"><span>{challenge.title}</span><MatchStatusBadge status={challenge.status} /></button>;
}

function RoomRow({ room }: { room: MatchRoom }) {
  const selectRoom = useAppStore((state) => state.selectRoom);
  return <button onClick={() => selectRoom(room.id)} className="flex items-center justify-between rounded-lg border border-transparent bg-[#f6f6f2] p-3 text-left"><span>Room {room.id.slice(-4)}</span><MatchStatusBadge status={room.status} /></button>;
}

function ClubLogoPair() {
  const logos = [
    {
      src: "/Manchester%20United%20Logo%20and%20symbol,%20meaning,%20history,%20PNG,%20brand.jpeg",
      alt: "Manchester United",
    },
    {
      src: "/New%20Manchester%20City%20Crest%20Revealed.jpeg",
      alt: "Manchester City",
    },
  ];
  return (
    <div className="flex -space-x-2">
      {logos.map((logo) => (
        <img
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          className="size-12 rounded-full bg-white object-cover ring-2 ring-[#f6f6f2]"
        />
      ))}
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const users = useAppStore((state) => state.users);
  const currentUser = useAppStore((state) => state.currentUser);
  const acceptChallenge = useAppStore((state) => state.acceptChallenge);
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  const creator = users.find((user) => user.id === challenge.creatorId);
  return (
    <article className="listed-game-card rounded-xl p-5 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClubLogoPair />
          <div>
            <h3 className="text-xl font-black">{creator?.username} 1v1 Proposition</h3>
            <p className="mt-1 text-sm text-black/60">Player offer · Man United vs Man City</p>
          </div>
        </div>
        {creator && <TrustScoreBadge score={creator.trustScore} />}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Stake each" value={formatMoney(challenge.stakeAmount)} />
        <Stat label="Escrow output" value={formatMoney(challenge.prizePool)} />
        <Stat label="Tier rating" value={challenge.squadRatingLimit} />
        <Stat label="Match window" value={challenge.deadline} />
      </div>
      <RulesCard challenge={challenge} />
      <div className="mt-5 flex gap-2">
        <Button onClick={() => currentUser ? acceptChallenge(challenge.id) : selectChallenge(challenge.id)} disabled={challenge.status !== "open" || currentUser?.id === challenge.creatorId}>
          Accept
        </Button>
        <Button variant="ghost" onClick={() => selectChallenge(challenge.id)}>Details</Button>
      </div>
    </article>
  );
}

function RulesCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="mt-4 rounded-lg border border-transparent bg-[#f6f6f2] p-3 text-sm">
      <p className="font-bold text-black">Rules</p>
      <p className="mt-1 text-black/60">{challenge.rules}</p>
      <p className="mt-2 text-black/50">Draw: {challenge.drawRule} · Screenshot deadline: {challenge.screenshotDeadlineMinutes}m · Cancel fee: {formatMoney(challenge.cancellationFee)} · Platform fee: {challenge.platformFeePercentage}%</p>
    </div>
  );
}

function Marketplace() {
  const challenges = useAppStore((state) => state.challenges);
  const [filter, setFilter] = useState({ stake: "all", squad: "all", status: "open", sort: "newest" });
  const filtered = useMemo(() => {
    return challenges
      .filter((challenge) => filter.status === "all" || challenge.status === filter.status)
      .filter((challenge) => filter.stake === "all" || challenge.stakeAmount <= Number(filter.stake))
      .filter((challenge) => filter.squad === "all" || challenge.squadRatingLimit <= Number(filter.squad))
      .sort((a, b) => (filter.sort === "highest" ? b.prizePool - a.prizePool : 0));
  }, [challenges, filter]);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-3xl font-black">Marketplace</h2><p className="text-black/60">Each proposition stake is paid by both players. Escrow output is stake x 2.</p></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select className={inputClass()} value={filter.stake} onChange={(e) => setFilter({ ...filter, stake: e.target.value })}><option value="all">Any stake</option><option value="25">Up to $25</option><option value="50">Up to $50</option></select>
          <select className={inputClass()} value={filter.squad} onChange={(e) => setFilter({ ...filter, squad: e.target.value })}><option value="all">Any tier</option><option value="82">Tier 82</option><option value="85">Tier 85</option></select>
          <select className={inputClass()} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}><option value="open">Open</option><option value="accepted">Accepted</option><option value="all">All</option></select>
          <select className={inputClass()} value={filter.sort} onChange={(e) => setFilter({ ...filter, sort: e.target.value })}><option value="newest">Newest</option><option value="highest">Highest prize</option></select>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{filtered.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>
    </div>
  );
}

function CreateChallenge() {
  const createChallenge = useAppStore((state) => state.createChallenge);
  const user = useAppStore((state) => state.currentUser);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "Open 1v1 Proposition",
    stakeAmount: 20,
    squadRatingLimit: 82,
    deadline: "Tonight 21:00",
    drawRule: "Rematch" as "Rematch" | "Refund",
    screenshotDeadlineMinutes: 10,
    cancellationFee: 2,
    platformFeePercentage: 8,
    rules: "Same tier range only. Upload final scoreboard within the deadline.",
  });
  if (!user) return <AuthGate />;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const ok = createChallenge(form);
    setError(ok ? "" : "Mock wallet balance is too low for this player entry stake.");
  };
  return (
    <form onSubmit={submit} className="glass mx-auto grid max-w-3xl gap-4 rounded-xl p-5">
      <div><h2 className="text-3xl font-black">Create Proposition</h2><p className="text-black/60">Set the stake each player must enter. When accepted, escrow output becomes stake x 2.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Proposition title"><input className={inputClass()} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Stake each player enters"><input className={inputClass()} type="number" value={form.stakeAmount} onChange={(e) => setForm({ ...form, stakeAmount: Number(e.target.value) })} /></Field>
        <Field label="Tier rating"><input className={inputClass()} type="number" value={form.squadRatingLimit} onChange={(e) => setForm({ ...form, squadRatingLimit: Number(e.target.value) })} /></Field>
        <Field label="Match deadline"><input className={inputClass()} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
      </div>
      <div className="rounded-xl bg-[#f6f6f2] p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-black/50">Platform match terms</p>
        <div className="mt-3 grid gap-3 text-sm text-black/70 sm:grid-cols-2">
          <div><span className="text-black/45">Draw rule</span><p className="font-bold text-black">{form.drawRule}</p></div>
          <div><span className="text-black/45">Screenshot deadline</span><p className="font-bold text-black">{form.screenshotDeadlineMinutes} minutes after match</p></div>
          <div><span className="text-black/45">Cancellation fee</span><p className="font-bold text-black">{formatMoney(form.cancellationFee)}</p></div>
          <div><span className="text-black/45">Platform fee</span><p className="font-bold text-black">{form.platformFeePercentage}%</p></div>
        </div>
      </div>
      <Field label="Custom rules"><textarea className={`${inputClass()} min-h-28 py-3`} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></Field>
      {error && <p className="rounded-lg border border-transparent bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="submit"><BadgeDollarSign size={18} /> Lock Stake and Create</Button>
    </form>
  );
}

function ChallengeDetails() {
  const id = useAppStore((state) => state.selectedChallengeId);
  const challenge = useAppStore((state) => state.challenges.find((item) => item.id === id)) ?? useAppStore((state) => state.challenges[0]);
  const users = useAppStore((state) => state.users);
  const currentUser = useAppStore((state) => state.currentUser);
  const acceptChallenge = useAppStore((state) => state.acceptChallenge);
  const creator = users.find((user) => user.id === challenge.creatorId);
  const opponent = users.find((user) => user.id === challenge.opponentId);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="glass rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-3xl font-black">{challenge.title}</h2><p className="text-black/60">Challenge details and mock escrow terms</p></div>
          <MatchStatusBadge status={challenge.status} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Stake each" value={formatMoney(challenge.stakeAmount)} />
          <Stat label="Escrow output" value={formatMoney(challenge.prizePool)} />
          <Stat label="Tier rating" value={challenge.squadRatingLimit} />
        </div>
        <RulesCard challenge={challenge} />
        <div className="mt-5">
          <Button onClick={() => acceptChallenge(challenge.id)} disabled={!currentUser || challenge.status !== "open" || currentUser.id === challenge.creatorId}>Accept Challenge</Button>
        </div>
      </section>
      <aside className="grid gap-3">
        <PlayerCard user={creator} label="Creator" />
        <PlayerCard user={opponent} label="Opponent" />
        <WalletExplainer challenge={challenge} />
      </aside>
    </div>
  );
}

function WalletExplainer({ challenge }: { challenge: Challenge }) {
  return <div className="glass rounded-xl p-4 text-sm text-black/80"><p className="font-bold text-black">Money state</p><p className="mt-2">Stake each: {formatMoney(challenge.stakeAmount)}. Creator locks {formatMoney(challenge.stakeAmount)} now. Opponent locks {formatMoney(challenge.stakeAmount)} on accept. Escrow output becomes {formatMoney(challenge.prizePool)}.</p></div>;
}

function CountdownTimer() {
  return <div className="inline-flex items-center gap-2 rounded-full border border-transparent bg-lime-200/70 px-3 py-1 text-sm text-black"><Clock3 size={16} /> 09:58 evidence window</div>;
}

function AIChatRoom({ room, challenge }: { room: MatchRoom; challenge: Challenge }) {
  const users = useAppStore((state) => state.users);
  const currentUser = useAppStore((state) => state.currentUser);
  const sendRoomMessage = useAppStore((state) => state.sendRoomMessage);
  const submitMatchCode = useAppStore((state) => state.submitMatchCode);
  const uploadEvidence = useAppStore((state) => state.uploadEvidence);
  const sendRoomMoney = useAppStore((state) => state.sendRoomMoney);
  const [message, setMessage] = useState("");
  const [matchCode, setMatchCode] = useState(room.matchCode ?? "DLS-9421");
  const [transferAmount, setTransferAmount] = useState(5);
  const playerOne = users.find((user) => user.id === room.playerOneId);
  const playerTwo = users.find((user) => user.id === room.playerTwoId);
  const currentSlot = currentUser?.id === room.playerOneId ? "one" : "two";
  const opponent = currentUser?.id === room.playerOneId ? playerTwo : playerOne;
  const sendMessage = () => {
    sendRoomMessage(room.id, message);
    setMessage("");
  };
  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-black/60">{challenge.title}</p>
            <h2 className="text-2xl font-black">Match Room</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge status={room.status} />
            <CountdownTimer />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Stake each" value={formatMoney(challenge.stakeAmount)} />
          <Stat label="Escrow output" value={formatMoney(challenge.prizePool)} />
          <Stat label="Tier rating" value={challenge.squadRatingLimit} />
          <Stat label="Match code" value={room.matchCode ?? "Not shared"} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Player A" value={playerOne?.username ?? "Waiting"} />
          <Stat label="Player B" value={playerTwo?.username ?? "Waiting"} />
          <Stat label="Total escrow" value={formatMoney(challenge.prizePool)} />
          <Stat label="Next action" value={nextAction(room.status)} />
        </div>
      </div>
      <div className="max-h-[520px] overflow-y-auto px-3 py-3 sm:px-4">
        <div className="grid gap-3">
          {room.chatMessages.map((chat) => <ChatMessage key={chat.id} message={chat} playerName={users.find((user) => user.id === chat.senderId)?.username} />)}
          {room.evidenceUploads.map((evidence) => <EvidenceCard key={evidence.playerId} evidence={evidence} room={room} />)}
          {room.result && room.settlement && <SettlementSummary room={room} />}
        </div>
      </div>
      <div className="px-3 py-3 sm:px-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input className={inputClass()} value={matchCode} onChange={(e) => setMatchCode(e.target.value)} placeholder="Dream League match code" />
          <Button variant="ghost" onClick={() => submitMatchCode(room.id, matchCode)}>Share Code</Button>
        </div>
        <div className="mt-3 flex w-fit items-center gap-4 rounded-full bg-lime-50 px-5 py-3">
          <Wallet size={24} />
          <input
            className="w-16 bg-transparent text-xl font-bold text-black outline-none"
            type="number"
            min={1}
            value={transferAmount}
            onChange={(e) => setTransferAmount(Number(e.target.value))}
            aria-label="Money amount"
          />
          <button className="text-xl font-bold" onClick={() => sendRoomMoney(room.id, transferAmount)}>Send</button>
        </div>
        <div className="mt-3 rounded-[28px] bg-white p-3 ring-1 ring-black/10 sm:p-4">
          <input
            className="min-h-12 w-full bg-transparent text-xl text-black outline-none placeholder:text-black/45"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask anything"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              className="grid size-11 place-items-center rounded-full text-black transition hover:bg-lime-50"
              onClick={() => uploadEvidence(room.id, currentSlot, `${currentSlot}-scoreboard.png`)}
              aria-label="Upload screenshot"
            >
              <Plus size={30} strokeWidth={1.8} />
            </button>
            <span className="ml-auto text-lg text-black/45">Referee</span>
            <span className="text-lg text-black/45">@refree</span>
            <button className="grid size-11 place-items-center rounded-full text-black transition hover:bg-lime-50" aria-label="Voice message">
              <Mic size={26} />
            </button>
            <button
              className="grid size-14 place-items-center rounded-full bg-black/5 text-black transition hover:bg-lime-200"
              onClick={sendMessage}
              aria-label="Send message"
            >
              <Send size={24} />
            </button>
          </div>
          <p className="mt-2 px-1 text-xs text-black/50">Plus uploads a scoreboard screenshot. Use @refree when replying to the AI.</p>
        </div>
      </div>
    </section>
  );
}

function nextAction(status: MatchRoom["status"]) {
  const actions: Record<MatchRoom["status"], string> = {
    waiting: "Wait for both players",
    squad_submission: "Submit squads",
    squad_confirmed: "Enter match code",
    match_code_ready: "Begin match",
    in_progress: "Upload screenshots",
    awaiting_screenshots: "Upload screenshots",
    verifying_results: "AI verification",
    awaiting_confirmation: "Confirm result",
    completed: "View wallet",
    cancelled: "Review refund",
    penalized: "Review penalty",
    refunded: "Review refund",
  };
  return actions[status];
}

function ChatMessage({ message, playerName }: { message: { senderType: string; text: string; timestamp: string; messageType: string }; playerName?: string }) {
  const color = message.messageType === "warning" ? "border-transparent bg-lime-200/70" : message.messageType === "success" ? "border-transparent bg-lime-400/25" : "border-transparent bg-white";
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-black/50">
        {message.senderType === "ai" ? <Bot size={14} /> : <UserRound size={14} />}
        {message.senderType === "ai" ? "AI Referee" : playerName ?? "System"}
      </div>
      <p className="text-sm text-black">{message.text}</p>
    </div>
  );
}

function MatchChecklist({ room }: { room: MatchRoom }) {
  const steps = [
    ["Squads", room.squadSubmissions.length >= 2],
    ["Match code", Boolean(room.matchCode)],
    ["Screenshots", room.evidenceUploads.length >= 2],
    ["AI result", Boolean(room.result)],
    ["Settlement", room.status === "completed" || room.status === "refunded" || room.status === "penalized"],
  ];
  return <Panel title="Checklist" icon={<CheckCircle2 size={18} />}>{steps.map(([label, done]) => <div key={String(label)} className="flex items-center justify-between rounded-lg bg-[#f6f6f2] p-3 text-sm"><span>{label}</span><span className={done ? "text-lime-600" : "text-black/50"}>{done ? "Done" : "Pending"}</span></div>)}</Panel>;
}

function SquadSubmissionForm({ room, challenge }: { room: MatchRoom; challenge: Challenge }) {
  const submitSquad = useAppStore((state) => state.submitSquad);
  const [slot, setSlot] = useState<"one" | "two">("one");
  const [form, setForm] = useState({ teamName: "Vsports FC", squadRating: challenge.squadRatingLimit, notes: "Balanced squad, no custom players.", confirmed: true });
  const playerId = slot === "one" ? room.playerOneId : room.playerTwoId;
  const error = form.squadRating > challenge.squadRatingLimit ? "Squad rating exceeds this challenge limit." : "";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (error || !form.teamName || !form.confirmed) return;
    submitSquad(room.id, { playerId, ...form, screenshotUrl: "mock://squad.png" });
  };
  return (
    <form onSubmit={submit} className="glass grid gap-3 rounded-xl p-4">
      <div className="flex items-center justify-between"><p className="font-bold">Squad Submission</p><select className={inputClass()} value={slot} onChange={(e) => setSlot(e.target.value as "one" | "two")}><option value="one">Player A</option><option value="two">Player B</option></select></div>
      <Field label="Team name"><input className={inputClass()} value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} /></Field>
      <Field label="Squad rating"><input className={inputClass()} type="number" value={form.squadRating} onChange={(e) => setForm({ ...form, squadRating: Number(e.target.value) })} /></Field>
      <Field label="Captain/player notes"><textarea className={`${inputClass()} min-h-20 py-3`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      <label className="flex gap-3 text-sm text-black/80"><input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} /> Squad follows rules</label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={Boolean(error)}>Submit Squad</Button>
      <div className="grid gap-2">{room.squadSubmissions.map((submission) => <div key={submission.playerId} className="rounded-lg bg-[#f6f6f2] p-3 text-sm"><b>{submission.teamName}</b> · rating {submission.squadRating} · confirmed</div>)}</div>
    </form>
  );
}

function MatchCodeBox({ room }: { room: MatchRoom }) {
  const submitMatchCode = useAppStore((state) => state.submitMatchCode);
  const [code, setCode] = useState("DLS-9421");
  const [time, setTime] = useState("");
  return (
    <div className="glass grid gap-3 rounded-xl p-4">
      <p className="font-bold">Match Code</p>
      <input className={inputClass()} value={code} onChange={(e) => setCode(e.target.value)} />
      <input className={inputClass()} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <Button onClick={() => submitMatchCode(room.id, code, time)} disabled={room.squadSubmissions.length < 2}>Share Code</Button>
      {room.matchCode && <p className="text-sm text-black">Code active: {room.matchCode}</p>}
    </div>
  );
}

function ScreenshotUploader({ room }: { room: MatchRoom }) {
  const uploadEvidence = useAppStore((state) => state.uploadEvidence);
  return (
    <div className="glass grid gap-3 rounded-xl p-4">
      <p className="font-bold">Scoreboard Screenshots</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => uploadEvidence(room.id, "one", "player-a.png")}><Upload size={16} /> Player A</Button>
        <Button variant="ghost" onClick={() => uploadEvidence(room.id, "two", "player-b.png")}><Upload size={16} /> Player B</Button>
      </div>
      <div className="grid gap-2">{room.evidenceUploads.map((evidence) => <EvidenceCard key={evidence.playerId} evidence={evidence} room={room} />)}</div>
    </div>
  );
}

function EvidenceCard({ evidence, room }: { evidence: EvidenceUpload; room: MatchRoom }) {
  const label = evidence.playerId === room.playerOneId ? "Player A" : "Player B";
  return <div className="rounded-lg border border-transparent bg-[#f6f6f2] p-3 text-sm"><div className="flex justify-between gap-2"><b>{label}</b><span className="capitalize text-black">{evidence.status}</span></div><p className="text-black/60">Detected {evidence.detectedScore} · Confidence {evidence.confidenceScore}%</p></div>;
}

function DeveloperPanel({ room }: { room: MatchRoom }) {
  const runScenario = useAppStore((state) => state.runScenario);
  const scenarios: { id: VerificationScenario; label: string }[] = [
    { id: "playerAWin", label: "Player A wins" },
    { id: "playerBWin", label: "Player B wins" },
    { id: "draw", label: "Draw" },
    { id: "match", label: "Both screenshots match" },
    { id: "conflict", label: "Screenshots conflict" },
    { id: "playerASuspicious", label: "Player A suspicious" },
    { id: "playerBSuspicious", label: "Player B suspicious" },
    { id: "bothSuspicious", label: "Both suspicious" },
    { id: "playerAMissing", label: "Player A missing" },
    { id: "playerBMissing", label: "Player B missing" },
    { id: "unknown", label: "AI cannot determine" },
  ];
  return (
    <div className="rounded-xl border border-transparent bg-lime-100 p-4">
      <p className="mb-3 font-bold text-black">Developer Mode</p>
      <div className="grid grid-cols-2 gap-2">
        {scenarios.map((scenario) => <button key={scenario.id} onClick={() => runScenario(room.id, scenario.id)} className="rounded-lg border border-transparent bg-lime-50 px-3 py-2 text-xs text-black transition hover:bg-lime-200">{scenario.label}</button>)}
      </div>
    </div>
  );
}

function SettlementSummary({ room }: { room: MatchRoom }) {
  const confirmSettlement = useAppStore((state) => state.confirmSettlement);
  const reportIssue = useAppStore((state) => state.reportIssue);
  if (!room.result || !room.settlement) return null;
  return (
    <div className="glass grid gap-3 rounded-xl p-4">
      <div className="flex items-center gap-2 font-bold"><Gavel size={18} /> Result Confirmation</div>
      <p className="text-sm text-black/80">{room.result.summary}</p>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between"><span>Detected score</span><b>{room.result.detectedScore ?? "N/A"}</b></div>
        <div className="flex justify-between"><span>Confidence</span><b>{room.result.confidenceScore}%</b></div>
        <div className="flex justify-between"><span>Platform fee</span><b>{formatMoney(room.settlement.platformFee)}</b></div>
        <div className="flex justify-between"><span>Penalty</span><b>{formatMoney(room.settlement.penaltyAmount)}</b></div>
      </div>
      <Button onClick={() => confirmSettlement(room.id)} disabled={room.settlement.finalStatus === "needs_evidence"}>Confirm Result</Button>
      <Button variant="danger" onClick={() => reportIssue(room.id)}>Report Issue</Button>
    </div>
  );
}

function MatchRooms() {
  const rooms = useAppStore((state) => state.rooms);
  const selectedRoomId = useAppStore((state) => state.selectedRoomId);
  const challenges = useAppStore((state) => state.challenges);
  const room = rooms.find((item) => item.id === selectedRoomId) ?? rooms[0];
  if (!room) return <div className="glass rounded-xl p-6"><h2 className="text-2xl font-black">No match rooms</h2><p className="mt-2 text-black/60">Accept a marketplace challenge to create a private AI match room.</p></div>;
  const challenge = challenges.find((item) => item.id === room.challengeId)!;
  return <AIChatRoom room={room} challenge={challenge} />;
}

function WalletPage() {
  const user = useAppStore((state) => state.currentUser);
  const demoUser = useAppStore((state) => state.users[0]);
  const allTransactions = useAppStore((state) => state.transactions);
  const mockDeposit = useAppStore((state) => state.mockDeposit);
  const [fundAmount, setFundAmount] = useState(25);
  useEffect(() => {
    if (!user && demoUser) useAppStore.setState({ currentUser: demoUser });
  }, [demoUser, user]);
  const activeUser = user ?? demoUser;
  const txs = allTransactions.filter((tx) => tx.userId === activeUser?.id);
  if (!activeUser) return <AuthGate />;
  const penalties = txs.filter((tx) => tx.type === "Penalty deducted").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const winnings = txs.filter((tx) => tx.type === "Prize received").reduce((sum, tx) => sum + tx.amount, 0);
  const fees = txs.filter((tx) => tx.type.includes("fee") || tx.type === "Platform fee").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const quickAmounts = [5, 10, 25, 50, 100];
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="brand-panel rounded-xl p-6">
          <p className="text-sm font-bold text-black/60">Available balance</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{formatMoney(activeUser.walletBalance)}</h2>
          <p className="mt-3 max-w-xl text-black/70">Fund your frontend wallet with a mock deposit. No payment provider is connected yet, but the balance and transaction history update immediately.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Escrow locked" value={formatMoney(activeUser.escrowBalance)} />
            <Stat label="Lifetime winnings" value={formatMoney(winnings)} />
            <Stat label="Total fees" value={formatMoney(fees)} />
          </div>
        </section>
        <section className="glass rounded-xl p-5">
          <h3 className="text-2xl font-black">Fund wallet</h3>
          <p className="mt-1 text-sm text-black/60">Mock frontend-only deposit</p>
          <div className="mt-5 grid gap-3">
            <Field label="Amount">
              <input
                className={`${inputClass()} text-xl font-black`}
                type="number"
                min={1}
                value={fundAmount}
                onChange={(event) => setFundAmount(Number(event.target.value))}
              />
            </Field>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${fundAmount === amount ? "bg-lime-400" : "bg-lime-50"}`}
                  onClick={() => setFundAmount(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <Button onClick={() => mockDeposit(fundAmount)} disabled={fundAmount <= 0}><Wallet size={18} /> Fund Wallet</Button>
            <Button variant="ghost" onClick={() => setFundAmount(0)}>Clear</Button>
          </div>
        </section>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Available" value={formatMoney(activeUser.walletBalance)} />
        <Stat label="Escrow" value={formatMoney(activeUser.escrowBalance)} />
        <Stat label="Lifetime penalties" value={formatMoney(penalties)} />
        <Stat label="Platform fees" value={formatMoney(fees)} />
      </div>
      <TransactionTable transactions={txs} />
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: { id: string; type: string; amount: number; status: string; description: string; createdAt: string }[] }) {
  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="border-b border-transparent p-4 font-bold">Recent transactions</div>
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-lime-50 text-black/60"><tr><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Description</th><th className="p-3">Created</th></tr></thead>
          <tbody>{transactions.map((tx) => <tr key={tx.id} className="border-t border-transparent"><td className="p-3">{tx.type}</td><td className={`p-3 font-bold ${tx.amount >= 0 ? "text-lime-600" : "text-red-600"}`}>{formatMoney(tx.amount)}</td><td className="p-3">{tx.status}</td><td className="p-3 text-black/60">{tx.description}</td><td className="p-3 text-black/50">{new Date(tx.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function ProfilePage() {
  const user = useAppStore((state) => state.currentUser);
  const history = useAppStore((state) => state.history);
  if (!user) return <AuthGate />;
  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <section className="glass rounded-xl p-5">
        <UserRound className="mb-4 text-lime-500" size={36} />
        <h2 className="text-3xl font-black">{user.username}</h2>
        <p className="text-black/60">{user.country}</p>
        <div className="mt-4"><TrustScoreBadge score={user.trustScore} /></div>
        <div className="mt-5 grid gap-3">
          <Stat label="Suspicious uploads" value={user.suspiciousUploads} />
          <Stat label="Cancelled matches" value={user.cancelledMatches} />
          <Stat label="Penalties" value={user.penalties} />
          <Stat label="Verification status" value={user.suspiciousUploads >= 3 ? "Restricted" : "Verified"} />
        </div>
      </section>
      <MatchHistory history={history} />
    </div>
  );
}

function MatchHistory({ history }: { history: { id: string; opponent: string; stake: number; result: string; score: string; payout: number; evidenceStatus: string; date: string; trustImpact: number }[] }) {
  return (
    <section className="glass rounded-xl p-5">
      <h2 className="text-2xl font-black">Match History</h2>
      <div className="mt-4 grid gap-3">
        {history.map((item) => (
          <div key={item.id} className="rounded-lg border border-transparent bg-[#f6f6f2] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><b>vs {item.opponent}</b><span className={item.trustImpact >= 0 ? "text-lime-600" : "text-red-600"}>{item.trustImpact >= 0 ? "+" : ""}{item.trustImpact} trust</span></div>
            <p className="mt-2 text-sm text-black/60">{item.result} · {item.score} · stake {formatMoney(item.stake)} · payout {formatMoney(item.payout)}</p>
            <p className="mt-1 text-sm text-black/50">{item.evidenceStatus} · {item.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const page = useAppStore((state) => state.page);
  useEffect(() => {
    const syncRoute = () => {
      useAppStore.setState(routeStateFromPath(window.location.pathname));
    };
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  const content = {
    landing: <LandingPage />,
    login: <AuthScreen mode="login" />,
    register: <AuthScreen mode="register" />,
    dashboard: <Dashboard />,
    marketplace: <Marketplace />,
    create: <CreateChallenge />,
    challenge: <ChallengeDetails />,
    wallet: <WalletPage />,
    rooms: <MatchRooms />,
    profile: <ProfilePage />,
    history: <MatchHistory history={useAppStore.getState().history} />,
  }[page];
  if (page === "landing") return content;
  return <AppLayout>{content}</AppLayout>;
}

export default App;
