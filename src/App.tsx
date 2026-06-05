import {
  BadgeDollarSign,
  Bot,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  CircleUserRound,
  Clock3,
  Gavel,
  Gamepad2,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  Mic,
  Moon,
  Plus,
  Send,
  ShieldCheck,
  SquareMenu,
  Store,
  Sun,
  Swords,
  Upload,
  UserRound,
  Wallet,
  WalletCards,
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
  { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={2.4} /> },
  { page: "marketplace", label: "Marketplace", icon: <Store size={18} strokeWidth={2.4} /> },
  { page: "create", label: "Create", icon: <CirclePlus size={18} strokeWidth={2.4} /> },
  { page: "wallet", label: "Wallet", icon: <WalletCards size={18} strokeWidth={2.4} /> },
  { page: "rooms", label: "Match Rooms", icon: <Gamepad2 size={18} strokeWidth={2.4} /> },
  { page: "profile", label: "Profile", icon: <CircleUserRound size={18} strokeWidth={2.4} /> },
  { page: "history", label: "History", icon: <Clock3 size={18} strokeWidth={2.4} /> },
];

const navIconClass =
  "grid size-9 place-items-center rounded-xl bg-sky-50 text-black/70 transition group-hover:bg-sky-100 group-hover:text-black";
const navIconActiveClass = "bg-sky-200 text-black";
const navIconCompactClass =
  "grid size-7 place-items-center rounded-full bg-sky-50 text-black/70 transition group-hover:bg-sky-100 group-hover:text-black";

const propositionTeams: Record<string, { logoSrc: string; teamName: string }> = {
  ch_1: {
    logoSrc: "/New%20Manchester%20City%20Crest%20Revealed.jpeg",
    teamName: "Manchester City",
  },
  ch_2: {
    logoSrc: "/Manchester%20United%20Logo%20and%20symbol,%20meaning,%20history,%20PNG,%20brand.jpeg",
    teamName: "Manchester United",
  },
  ch_3: {
    logoSrc: "/Real%20Madrid%20_.jpeg",
    teamName: "Real Madrid",
  },
  ch_4: {
    logoSrc: "/Barca.jpeg",
    teamName: "Barcelona",
  },
  ch_5: {
    logoSrc: "/FC%20Bayern%20Munich.jpeg",
    teamName: "Bayern Munich",
  },
  ch_6: {
    logoSrc: "/Liverpool%20Football%20Club.jpeg",
    teamName: "Liverpool",
  },
  ch_7: {
    logoSrc: "/chelsea%20fc%20logo%20-%20Google%20Search.jpeg",
    teamName: "Chelsea",
  },
};

function propositionTeamFor(challengeId: string) {
  return propositionTeams[challengeId] ?? propositionTeams.ch_2;
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "size-28" : size === "sm" ? "size-9" : "size-10";
  return (
    <img
      src="/r1.png"
      alt="Astro logo"
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
    primary: "bg-sky-600 text-white hover:bg-sky-500",
    ghost: "border border-transparent bg-sky-50 text-black hover:bg-sky-100",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition disabled:opacity-50 sm:min-h-11 sm:px-4 ${styles[variant]}`}
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
  return "min-h-11 rounded-lg border border-transparent bg-sky-50 px-3 text-black outline-none transition focus:bg-sky-50";
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative block min-w-0">
      <select
        className="min-h-11 w-full appearance-none rounded-xl border border-transparent bg-sky-50 py-2 pl-3 pr-10 text-black outline-none transition focus:bg-sky-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-black">
        <ChevronDown size={16} strokeWidth={2.5} />
      </span>
    </label>
  );
}

function TrustScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "text-sky-600 border-transparent" : score >= 75 ? "text-black border-transparent" : "text-red-600 border-transparent";
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${color}`}>Trust {score}</span>;
}

function MatchStatusBadge({ status }: { status: string }) {
  return <span className="rounded-full border border-transparent bg-sky-600/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">{status.replaceAll("_", " ")}</span>;
}

function WalletCard({ user }: { user: User }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm text-black/60">Available wallet</p>
          <p className="mt-1 truncate text-2xl font-black">{formatMoney(user.walletBalance)}</p>
        </div>
        <div className="relative size-12 shrink-0">
          <img src="/usdc.png" alt="USDC" className="size-12 rounded-full object-cover" />
          <img
            src="/z3.png"
            alt=""
            className="absolute -bottom-1 -right-1 size-6 rounded-full object-cover ring-2 ring-white"
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="wallet-mini-stat rounded-lg bg-[#f6f6f2] p-3">
          <p className="text-black/60">Escrow</p>
          <p className="font-bold text-black">{formatMoney(user.escrowBalance)}</p>
        </div>
        <div className="wallet-mini-stat rounded-lg bg-[#f6f6f2] p-3">
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
    <aside className="sidebar-panel hidden border-r border-transparent bg-white p-4 lg:block">
      <button onClick={() => setPage("landing")} className="mb-8 flex items-center gap-3">
        <BrandMark />
        <div className="text-left">
          <p className="text-lg font-black">Astro</p>
          <p className="text-xs text-black/50">Skill match escrow</p>
        </div>
      </button>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`group flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-left text-sm transition ${page === item.page ? "text-sky-600" : "text-black/80 hover:text-sky-600"}`}
          >
            <span className={`${navIconClass} ${page === item.page ? navIconActiveClass : ""}`}>{item.icon}</span>
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
    return window.localStorage.getItem("astro-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", isDarkTheme);
    window.localStorage.setItem("astro-theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  return (
    <header className="top-nav-bar border-b border-transparent bg-white/95 px-0 pb-1 pt-2 backdrop-blur sm:py-3">
      <div className="flex items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <button onClick={() => setPage("landing")} className="flex min-w-0 items-center gap-2 font-black">
          <BrandMark size="sm" /> Astro
        </button>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsDarkTheme((current) => !current)}
            className="grid size-10 place-items-center rounded-lg bg-sky-50 text-black transition hover:bg-sky-100 sm:size-11"
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
      <div className="mt-2">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 sm:gap-2 sm:px-4">
          {navItems.slice(0, 6).map((item) => (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className={`group inline-flex min-w-max items-center gap-2 rounded-full border border-transparent bg-white px-2.5 py-1.5 text-xs ${page === item.page ? "text-sky-600" : "text-black/80"}`}
            >
              <span className={`${navIconCompactClass} ${page === item.page ? navIconActiveClass : ""}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function TopBanner() {
  const bannerImages = ["/k5.png", "/Z1.jpeg", "/Z2.png", "/Z4.jpeg", "/Z5.png"];
  const [activeBanner, setActiveBanner] = useState(0);
  const activeBannerSrc = bannerImages[activeBanner];
  const bannerObjectPosition = activeBannerSrc === "/k5.png" || activeBannerSrc === "/Z5.png" ? "object-center" : "object-[center_18%]";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % bannerImages.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <div className="relative h-20 w-full overflow-hidden sm:h-24 lg:h-28">
      <img
        src={activeBannerSrc}
        alt="Football banner"
        className={`size-full object-cover ${bannerObjectPosition}`}
      />
      <div className="banner-fade pointer-events-none absolute inset-x-0 bottom-0 h-12" />
    </div>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-screen">
      <div className="app-content min-w-0">
        <div className="app-header-stack sticky top-0 z-20 bg-white">
          <TopBanner />
          <TopNav />
        </div>
        <main className="mx-auto min-w-0 max-w-7xl px-3 py-4 sm:px-4 lg:px-5">{children}</main>
      </div>
    </div>
  );
}

function LandingPage() {
  const setPage = useAppStore((state) => state.setPage);
  const features = [
    ["Create", "Set the virtual game, entry amount, rules, and match deadline."],
    ["Escrow", "Both players lock the same entry before the match starts."],
    ["Verify", "Upload scoreboard screenshots for AI-assisted result checks."],
    ["Settle", "Apply win, refund, or penalty rules from one match room."],
  ];
  return (
    <div className="landing-page min-h-screen bg-white">
      <div className="grid gap-0 bg-white">
        <section className="landing-hero relative mt-0 min-h-screen overflow-hidden bg-sky-500">
          <img src="/k5.png" alt="Virtual game artwork" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-sky-500/25" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-white/70 to-white" />
          <div className="relative z-10 flex min-h-screen flex-col p-5 sm:p-7 lg:p-9">
            <div className="fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center justify-center text-white">
              <div className="flex items-center gap-2 rounded-xl bg-white/18 px-3 py-2 backdrop-blur-sm">
                <BrandMark size="sm" />
                <span className="text-base font-bold">Astro</span>
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
            <div className="fixed bottom-6 left-1/2 z-50 grid w-[min(92vw,440px)] -translate-x-1/2 grid-cols-2 gap-2 rounded-2xl bg-white/18 p-2 text-white backdrop-blur-md">
              <button onClick={() => setPage("login")} className="min-h-14 rounded-xl bg-white/72 px-3 text-sm font-bold text-black backdrop-blur-md sm:px-5 sm:text-base">
                Login
              </button>
              <button onClick={() => setPage("register")} className="min-h-14 rounded-xl bg-sky-600/82 px-3 text-sm font-bold text-white backdrop-blur-md sm:px-5 sm:text-base">
                Sign up
              </button>
            </div>
          </div>
        </section>

        <section className="px-[7%] py-14" id="about">
          <div className="flex items-center gap-4 border-t border-black/10 pt-4 text-xs">
            <span className="grid size-7 place-items-center rounded-full border border-black/20">A</span>
            <span>About</span>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <h2 className="text-4xl font-black uppercase leading-none sm:text-5xl">
              The competition layer for trusted 1v1 virtual gaming
            </h2>
            <p className="text-sm leading-7 text-black/65">
              Virtual gamers already compete through group chats and DMs, but payments, proof, disputes, and reputation are messy. Astro gives every challenge a structured flow.
            </p>
            <div className="text-sm leading-7 text-black/65">
              <p>Players create propositions, lock entries in escrow, share match codes, upload scoreboard screenshots, and let an AI-assisted referee explain the settlement path.</p>
              <button onClick={() => setPage("marketplace")} className="mt-5 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white">
                Browse challenges <span className="ml-2 rounded-lg bg-sky-600 px-2 py-1 text-white">›</span>
              </button>
            </div>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-xl border border-black/15">
              <img src="/Z5.png" alt="Virtual game artwork" className="h-[520px] w-full object-cover object-center" />
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[1fr_1fr_64px] bg-sky-950/80 text-white">
                <div className="p-4">
                  <p className="text-2xl font-black text-sky-200">$5+</p>
                  <p className="text-sm">Stake each</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-black text-sky-200">x2</p>
                  <p className="text-sm">Escrow output</p>
                </div>
                <button onClick={() => setPage("marketplace")} className="grid place-items-center rounded-r-[10px] bg-sky-900 text-3xl">↗</button>
              </div>
            </div>
            <div className="grid content-between gap-6">
              <img src="/Z2.png" alt="Virtual game artwork" className="h-72 w-full rounded-xl border border-black/15 object-cover object-center" />
              <div>
                <div className="flex items-end gap-4">
                  <span className="text-8xl font-black text-sky-500">AI</span>
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

        <section className="px-[7%] py-14">
          <div>
            <picture className="block overflow-hidden rounded-xl shadow-[0_22px_60px_rgba(15,23,42,0.18)] ring-1 ring-black/10">
              <source media="(max-width: 767px)" srcSet="/R3.png" />
              <img
                src="/R4.png"
                alt="Astro match preview"
                className="w-full object-cover"
              />
            </picture>
          </div>
        </section>

        <section className="px-[7%] pb-14" id="how">
          <div className="flex items-center gap-4 border-t border-black/10 pt-4 text-xs">
            <span className="grid size-7 place-items-center rounded-full border border-black/20">B</span>
            <span>How It Works</span>
          </div>
          <h2 className="mt-10 max-w-3xl text-4xl font-black uppercase leading-none sm:text-5xl">From challenge to settlement in one flow.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-black/15 bg-[#f6f6f2]">
              <img src="/Z5.png" alt="Virtual game artwork" className="h-72 w-full object-cover object-center" />
              <p className="p-4 text-xl font-bold">Create a challenge</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-black/15 bg-[#f6f6f2]">
              <img src="/Z4.jpeg" alt="Virtual game artwork" className="h-72 w-full object-cover object-center" />
              <p className="p-4 text-xl font-bold">Accept and lock escrow</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-black/15 bg-[#f6f6f2]">
              <img src="/Z1.jpeg" alt="Virtual game artwork" className="h-72 w-full object-cover object-center" />
              <p className="p-4 text-xl font-bold">Upload proof and settle</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, text]) => (
              <div key={title} className="rounded-xl border border-black/15 bg-[#f6f6f2] p-5">
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
                <p className="text-xl font-black">Astro</p>
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
  const [form, setForm] = useState({ username: "NeoStriker", email: "neo@astro.test", password: "password", country: "Nigeria", age: true, terms: true });
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
    <div className="marketplace-page grid min-w-0 gap-5">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="glass rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-black/60">Player profile</p>
              <h2 className="flex min-w-0 items-center gap-2 text-[clamp(2rem,11vw,3rem)] font-black leading-none sm:text-3xl">
                <span className="truncate">{user.username}</span>
                <img src="/checklist.png" alt="Verified" className="size-6 rounded-full object-cover" />
              </h2>
              <p className="text-black/60">{user.country} · Verification mock-active</p>
            </div>
            <TrustScoreBadge score={user.trustScore} />
          </div>
          <DashboardStatStrip
            stats={[
              ["Total matches", user.wins + user.losses],
              ["Wins", user.wins],
              ["Losses", user.losses],
              ["Penalties", user.penalties],
            ]}
          />
        </div>
        <WalletCard user={user} />
      </div>
      <TransactionTable transactions={userTx} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Active challenges" icon={<Swords size={18} />}>
          {challenges.filter((challenge) => challenge.creatorId === user.id || challenge.opponentId === user.id).slice(0, 4).map((challenge) => <ChallengeRow key={challenge.id} challenge={challenge} />)}
        </Panel>
        <Panel title="Active match rooms" icon={<Bot size={18} />}>
          {rooms.filter((room) => room.playerOneId === user.id || room.playerTwoId === user.id).map((room) => <RoomRow key={room.id} room={room} />)}
          {rooms.length === 0 && <p className="text-sm text-black/60">No active rooms yet. Accept or create a challenge to start.</p>}
        </Panel>
      </div>
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
  return <div className="stat-card rounded-lg border border-transparent bg-[#f6f6f2] p-4"><p className="text-sm text-black/60">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function DashboardStatStrip({ stats }: { stats: [string, ReactNode][] }) {
  return (
    <div className="dashboard-stat-strip dashboard-overview-stat-strip mt-6 grid grid-cols-4 overflow-hidden rounded-xl bg-[#f6f6f2]">
      {stats.map(([label, value], index) => (
        <div
          key={label}
          className={`dashboard-stat-item min-w-0 px-1.5 py-3 text-center sm:p-4 ${index > 0 ? "border-l border-black/20" : ""}`}
        >
          <p className="truncate text-[9px] leading-tight text-black/60 min-[380px]:text-[10px] sm:text-sm">{label}</p>
          <p className="mt-1 text-base font-black leading-none min-[380px]:text-lg sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
}

function WalletStatStrip({ stats }: { stats: [string, ReactNode][] }) {
  return (
    <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl bg-[#f6f6f2] sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:rounded-none sm:bg-transparent">
      {stats.map(([label, value], index) => (
        <div
          key={label}
          className={`dashboard-stat-item min-w-0 px-2 py-3 text-center sm:rounded-lg sm:border sm:border-transparent sm:bg-[#f6f6f2] sm:p-4 sm:text-left ${index > 0 ? "border-l border-black/20" : ""}`}
        >
          <p className="truncate text-[10px] leading-tight text-black/60 sm:text-sm">{label}</p>
          <p className="mt-1 text-base font-black leading-none min-[380px]:text-lg sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
}

function WalletMoneyRows({ stats }: { stats: [string, ReactNode][] }) {
  return (
    <div className="wallet-money-panel grid grid-cols-3 overflow-hidden rounded-xl bg-[#f6f6f2]">
      {stats.map(([label, value], index) => (
        <div
          key={label}
          className={`wallet-money-row min-w-0 px-3 py-4 text-center sm:px-4 sm:text-left ${index === 0 ? "" : "border-l"}`}
        >
          <p className="truncate text-[10px] text-black/60 sm:text-sm">{label}</p>
          <p className="mt-1 truncate text-lg font-black sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
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
  return (
    <button
      onClick={() => selectRoom(room.id)}
      className="flex items-center justify-between rounded-lg border border-transparent bg-[#f6f6f2] p-3 text-left"
    >
      <span className="flex items-center gap-3">
        <img
          src="/Manchester%20United%20Logo%20and%20symbol,%20meaning,%20history,%20PNG,%20brand.jpeg"
          alt="Proposition squad"
          className="size-9 rounded-full bg-white object-cover ring-2 ring-white"
        />
        <span>Room {room.id.slice(-4)}</span>
      </span>
      <MatchStatusBadge status={room.status} />
    </button>
  );
}

function PropositionIcon({ logoSrc, teamName }: { logoSrc: string; teamName: string }) {
  return (
    <img
      src={logoSrc}
      alt={teamName}
      className="size-12 rounded-full bg-white object-cover ring-2 ring-[#f6f6f2]"
    />
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const users = useAppStore((state) => state.users);
  const currentUser = useAppStore((state) => state.currentUser);
  const acceptChallenge = useAppStore((state) => state.acceptChallenge);
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  const creator = users.find((user) => user.id === challenge.creatorId);
  const team = propositionTeamFor(challenge.id);
  return (
    <article className="listed-game-card rounded-xl p-5 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PropositionIcon logoSrc={team.logoSrc} teamName={team.teamName} />
          <div>
            <h3 className="flex items-center gap-2 text-[clamp(1rem,4.8vw,1.25rem)] font-black leading-tight break-words">
              {creator?.username ?? "Player"} 1v1 Proposition
              <img src="/checklist.png" alt="Verified" className="size-5 rounded-full object-cover" />
            </h3>
            <p className="mt-1 text-sm text-black/60">Player offer · {team.teamName}</p>
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

function ChallengeListFixedCell({ challenge, isLast = false }: { challenge: Challenge; isLast?: boolean }) {
  const users = useAppStore((state) => state.users);
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  const creator = users.find((user) => user.id === challenge.creatorId);
  const team = propositionTeamFor(challenge.id);

  return (
    <button
      onClick={() => selectChallenge(challenge.id)}
      className={`marketplace-list-row flex h-24 w-full min-w-0 items-center gap-3 px-5 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5 ${isLast ? "" : "border-b"}`}
    >
      <img
        src={team.logoSrc}
        alt={team.teamName}
        className="size-9 rounded-full bg-white object-cover ring-2 ring-[#f6f6f2]"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-bold leading-tight">
          <span className="truncate">{creator?.username ?? "Player"}</span>
          <img src="/checklist.png" alt="Verified" className="size-4 rounded-full object-cover" />
        </span>
        <span className="mt-0.5 block truncate text-xs text-black/60">Player offer · {team.teamName}</span>
      </span>
    </button>
  );
}

function ChallengeListMetricsRow({ challenge, isLast = false }: { challenge: Challenge; isLast?: boolean }) {
  const selectChallenge = useAppStore((state) => state.selectChallenge);

  return (
    <button
      onClick={() => selectChallenge(challenge.id)}
      className={`marketplace-list-row grid h-24 w-full grid-cols-[96px_104px_150px] items-center gap-3 px-5 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5 lg:grid-cols-3 ${isLast ? "" : "border-b"}`}
    >
      <span className="whitespace-nowrap font-black">{formatMoney(challenge.stakeAmount)}</span>
      <span className="whitespace-nowrap font-black">{formatMoney(challenge.prizePool)}</span>
      <span className="whitespace-nowrap font-black">{challenge.deadline}</span>
    </button>
  );
}

function RulesCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="challenge-rules-card mt-4 rounded-lg border border-transparent bg-white p-3 text-sm">
      <p className="font-bold text-black">Rules</p>
      <p className="mt-1 text-black/60">{challenge.rules}</p>
      <p className="mt-2 text-black/50">Draw: {challenge.drawRule} · Screenshot deadline: {challenge.screenshotDeadlineMinutes}m · Cancel fee: {formatMoney(challenge.cancellationFee)} · Platform fee: {challenge.platformFeePercentage}%</p>
    </div>
  );
}

function Marketplace() {
  const challenges = useAppStore((state) => state.challenges);
  const [filter, setFilter] = useState({ stake: "all", squad: "all", status: "open", sort: "newest" });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const filtered = useMemo(() => {
    return challenges
      .filter((challenge) => filter.status === "all" || challenge.status === filter.status)
      .filter((challenge) => filter.stake === "all" || challenge.stakeAmount <= Number(filter.stake))
      .filter((challenge) => filter.squad === "all" || challenge.squadRatingLimit <= Number(filter.squad))
      .sort((a, b) => (filter.sort === "highest" ? b.prizePool - a.prizePool : 0));
  }, [challenges, filter]);
  return (
    <div className="dashboard-page grid gap-5">
      <div className="px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-3xl font-black">Marketplace</h2>
            <p className="text-black/60">Each proposition stake is paid by both players. Escrow output is stake x 2.</p>
          </div>
          <button
            type="button"
            onClick={() => setViewMode((mode) => (mode === "grid" ? "list" : "grid"))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-black/20 text-black transition hover:border-sky-500 hover:text-sky-600"
            aria-label={viewMode === "grid" ? "Show propositions as list" : "Show propositions as grid"}
            title={viewMode === "grid" ? "List view" : "Grid view"}
          >
            {viewMode === "grid" ? (
              <SquareMenu size={25} strokeWidth={2.8} />
            ) : (
              <LayoutGrid size={23} strokeWidth={2.2} />
            )}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SelectControl
            value={filter.stake}
            onChange={(stake) => setFilter({ ...filter, stake })}
            options={[
              { value: "all", label: "Any stake" },
              { value: "25", label: "Up to $25" },
              { value: "50", label: "Up to $50" },
            ]}
          />
          <SelectControl
            value={filter.squad}
            onChange={(squad) => setFilter({ ...filter, squad })}
            options={[
              { value: "all", label: "Any tier" },
              { value: "82", label: "Tier 82" },
              { value: "85", label: "Tier 85" },
            ]}
          />
          <SelectControl
            value={filter.status}
            onChange={(status) => setFilter({ ...filter, status })}
            options={[
              { value: "open", label: "Open" },
              { value: "accepted", label: "Accepted" },
              { value: "all", label: "All" },
            ]}
          />
          <SelectControl
            value={filter.sort}
            onChange={(sort) => setFilter({ ...filter, sort })}
            options={[
              { value: "newest", label: "Newest" },
              { value: "highest", label: "Highest prize" },
            ]}
          />
        </div>
      </div>
      {viewMode === "grid" ? (
        <div className="grid gap-4 lg:grid-cols-2">{filtered.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>
      ) : (
        <div className="-mx-3 grid grid-cols-[240px_minmax(0,1fr)] sm:-mx-4 sm:grid-cols-[280px_minmax(0,1fr)] lg:-mx-5 lg:grid-cols-4">
          <div className="min-w-0">
            <div className="marketplace-list-header px-5 py-2 text-xs font-bold uppercase tracking-wide text-black/50">
              1v1 Proposition
            </div>
            {filtered.map((challenge, index) => (
              <ChallengeListFixedCell key={challenge.id} challenge={challenge} isLast={index === filtered.length - 1} />
            ))}
          </div>
          <div className="no-scrollbar min-w-0 overflow-x-auto lg:col-span-3 lg:overflow-visible">
            <div className="min-w-[410px] lg:min-w-0">
              <div className="marketplace-list-header grid grid-cols-[96px_104px_150px] items-center gap-3 px-5 py-2 text-xs font-bold uppercase tracking-wide text-black/50 lg:grid-cols-3">
                <span>Stake</span>
                <span>Escrow</span>
                <span>Window</span>
              </div>
              {filtered.map((challenge, index) => (
                <ChallengeListMetricsRow key={challenge.id} challenge={challenge} isLast={index === filtered.length - 1} />
              ))}
            </div>
          </div>
        </div>
      )}
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
  return <div className="inline-flex items-center gap-2 rounded-full border border-transparent bg-sky-200/70 px-3 py-1 text-sm text-black"><Clock3 size={16} /> 09:58 evidence window</div>;
}

function MatchRoomStatStrip({ stats }: { stats: [string, ReactNode][] }) {
  return (
    <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-xl bg-[#f6f6f2]">
      {stats.map(([label, value], index) => (
        <div
          key={label}
          className={`dashboard-stat-item min-w-0 px-1.5 py-3 text-center sm:p-4 ${index > 0 ? "border-l border-black/20" : ""}`}
        >
          <p className="truncate text-[9px] leading-tight text-black/60 min-[380px]:text-[10px] sm:text-sm">{label}</p>
          <p className="mt-1 truncate text-base font-black leading-none min-[380px]:text-lg sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
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
        <MatchRoomStatStrip
          stats={[
            ["Stake each", formatMoney(challenge.stakeAmount)],
            ["Escrow output", formatMoney(challenge.prizePool)],
            ["Tier rating", challenge.squadRatingLimit],
            ["Match code", room.matchCode ?? "Not shared"],
          ]}
        />
        <MatchRoomStatStrip
          stats={[
            ["Player A", playerOne?.username ?? "Waiting"],
            ["Player B", playerTwo?.username ?? "Waiting"],
            ["Total escrow", formatMoney(challenge.prizePool)],
            ["Next action", nextAction(room.status)],
          ]}
        />
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
        <div className="mt-3 flex w-fit items-center gap-4 rounded-full bg-sky-50 px-5 py-3">
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
              className="grid size-11 place-items-center rounded-full text-black transition hover:bg-sky-50"
              onClick={() => uploadEvidence(room.id, currentSlot, `${currentSlot}-scoreboard.png`)}
              aria-label="Upload screenshot"
            >
              <Plus size={30} strokeWidth={1.8} />
            </button>
            <span className="ml-auto text-lg text-black/45">Referee</span>
            <span className="text-lg text-black/45">@refree</span>
            <button className="grid size-11 place-items-center rounded-full text-black transition hover:bg-sky-50" aria-label="Voice message">
              <Mic size={26} />
            </button>
            <button
              className="grid size-14 place-items-center rounded-full bg-black/5 text-black transition hover:bg-sky-200"
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
  const color = message.messageType === "warning" ? "border-transparent bg-sky-200/70" : message.messageType === "success" ? "border-transparent bg-sky-600/25" : "border-transparent bg-white";
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
  return <Panel title="Checklist" icon={<CheckCircle2 size={18} />}>{steps.map(([label, done]) => <div key={String(label)} className="flex items-center justify-between rounded-lg bg-[#f6f6f2] p-3 text-sm"><span>{label}</span><span className={done ? "text-sky-600" : "text-black/50"}>{done ? "Done" : "Pending"}</span></div>)}</Panel>;
}

function SquadSubmissionForm({ room, challenge }: { room: MatchRoom; challenge: Challenge }) {
  const submitSquad = useAppStore((state) => state.submitSquad);
  const [slot, setSlot] = useState<"one" | "two">("one");
  const [form, setForm] = useState({ teamName: "Astro FC", squadRating: challenge.squadRatingLimit, notes: "Balanced squad, no custom players.", confirmed: true });
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
    <div className="rounded-xl border border-transparent bg-sky-100 p-4">
      <p className="mb-3 font-bold text-black">Developer Mode</p>
      <div className="grid grid-cols-2 gap-2">
        {scenarios.map((scenario) => <button key={scenario.id} onClick={() => runScenario(room.id, scenario.id)} className="rounded-lg border border-transparent bg-sky-50 px-3 py-2 text-xs text-black transition hover:bg-sky-200">{scenario.label}</button>)}
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
  const selectRoom = useAppStore((state) => state.selectRoom);
  const room = rooms.find((item) => item.id === selectedRoomId);
  if (rooms.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-black">No match rooms</h2>
        <p className="mt-2 text-black/60">Accept a marketplace challenge to create a private AI match room.</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="glass rounded-xl p-4">
          <h3 className="text-lg font-black">Your match rooms</h3>
          <p className="mt-1 text-sm text-black/60">Select a room to enter.</p>
          <div className="mt-4 grid gap-2">
            {rooms.map((item) => (
              <RoomRow key={item.id} room={item} />
            ))}
          </div>
        </section>
        <section className="glass grid place-items-center rounded-xl p-6 text-center">
          <div>
            <p className="text-lg font-black">Choose a match room</p>
            <p className="mt-2 text-sm text-black/60">Pick one from the list to open the AI match room view.</p>
          </div>
        </section>
      </div>
    );
  }

  const challenge = challenges.find((item) => item.id === room.challengeId)!;
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <section className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black">Your match rooms</h3>
          <button
            className="text-xs font-bold text-black/60"
            onClick={() => selectRoom("")}
          >
            Clear
          </button>
        </div>
        <p className="mt-1 text-sm text-black/60">Select a room to enter.</p>
        <div className="mt-4 grid gap-2">
          {rooms.map((item) => (
            <button
              key={item.id}
              onClick={() => selectRoom(item.id)}
              className={`flex items-center justify-between rounded-lg border border-transparent px-3 py-3 text-left text-sm ${item.id === room.id ? "bg-sky-50" : "bg-[#f6f6f2]"}`}
            >
              <span>Room {item.id.slice(-4)}</span>
              <MatchStatusBadge status={item.status} />
            </button>
          ))}
        </div>
      </section>
      <AIChatRoom room={room} challenge={challenge} />
    </div>
  );
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
  const lossValue = txs
    .filter((tx) => tx.type === "Penalty deducted" || tx.type === "Cancellation fee")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const amountPaid = txs.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const quickAmounts = [5, 10, 25, 50, 100];
  return (
    <div className="grid min-w-0 gap-5">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[340px_1fr]">
        <WalletCard user={activeUser} />
        <div className="px-4 sm:px-0">
          <WalletMoneyRows
            stats={[
              ["Winnings", formatMoney(winnings)],
              ["Loss value", formatMoney(lossValue)],
              ["Amount paid", formatMoney(amountPaid || fees || penalties)],
            ]}
          />
        </div>
      </div>
      <Panel title="Fund wallet" icon={<Wallet size={18} />}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Amount">
            <input
              className={`${inputClass()} text-xl font-black`}
              type="number"
              min={1}
              value={fundAmount}
              onChange={(event) => setFundAmount(Number(event.target.value))}
            />
          </Field>
          <div className="grid grid-cols-5 gap-2 sm:self-end">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${fundAmount === amount ? "bg-sky-600 text-white" : "bg-sky-50"}`}
                onClick={() => setFundAmount(amount)}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => mockDeposit(fundAmount)} disabled={fundAmount <= 0}><Wallet size={18} /> Fund Wallet</Button>
          <Button variant="ghost" onClick={() => setFundAmount(0)}>Clear</Button>
        </div>
        <p className="text-sm text-black/60">Mock frontend-only deposit. No payment provider is connected yet.</p>
      </Panel>
      <TransactionTable transactions={txs} />
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: { id: string; type: string; amount: number; status: string; description: string; createdAt: string }[] }) {
  return (
    <section className="min-w-0 max-w-full px-4">
      <div className="py-4 font-bold">Recent transactions</div>
      <div className="transactions-panel no-scrollbar max-w-full overflow-x-auto rounded-xl">
        <table className="min-w-[680px] text-left text-sm sm:text-base">
          <thead className="transactions-table-head text-black/60"><tr><th className="px-4 py-4">Type</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Description</th><th className="px-4 py-4">Created</th></tr></thead>
          <tbody>{transactions.map((tx) => <tr key={tx.id} className="border-t border-transparent"><td className="whitespace-nowrap px-4 py-4">{tx.type}</td><td className={`whitespace-nowrap px-4 py-4 font-bold ${tx.amount >= 0 ? "text-sky-600" : "text-red-600"}`}>{formatMoney(tx.amount)}</td><td className="whitespace-nowrap px-4 py-4">{tx.status}</td><td className="max-w-[260px] truncate px-4 py-4 text-black/60">{tx.description}</td><td className="whitespace-nowrap px-4 py-4 text-black/50">{new Date(tx.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
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
        <UserRound className="mb-4 text-sky-500" size={36} />
        <h2 className="text-3xl font-black">{user.username}</h2>
        <p className="text-black/60">{user.country}</p>
        <div className="mt-4"><TrustScoreBadge score={user.trustScore} /></div>
        <div className="profile-stat-strip mt-5 grid grid-cols-2 overflow-hidden rounded-xl bg-[#f6f6f2]">
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
            <div className="flex flex-wrap items-center justify-between gap-3"><b>vs {item.opponent}</b><span className={item.trustImpact >= 0 ? "text-sky-600" : "text-red-600"}>{item.trustImpact >= 0 ? "+" : ""}{item.trustImpact} trust</span></div>
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
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const revealSelector = [
      ".landing-page section:not(:first-child)",
      ".landing-page footer",
      "main > div > *",
      "main section",
      "main article",
      "main form",
      "main .glass",
      "main .listed-game-card",
      "main .transactions-panel",
    ].join(", ");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    revealElements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--scroll-reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      revealElements.forEach((element) => {
        element.classList.remove("scroll-reveal", "scroll-reveal-visible");
        element.style.removeProperty("--scroll-reveal-delay");
      });
    };
  }, [page]);
  useEffect(() => {
    if (page === "landing") {
      document.documentElement.classList.remove("dark-theme");
    }
  }, [page]);
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
