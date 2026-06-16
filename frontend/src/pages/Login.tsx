import axios from "axios";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppContext } from "../context/context";

type Mode = "login" | "signup";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "" });

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppContext();

  const isLogin = mode === "login";
  const title = useMemo(() => (isLogin ? "Welcome back" : "Create account"), [isLogin]);

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);
      setUser(result.data.user);
      setIsAuth(true);
      toast.success(`Welcome back, ${result.data.user.name}!`);
      navigate("/", { replace: true });
    } catch {
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const result = await axios.post(`${authService}/api/auth/user/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });
      localStorage.setItem("token", result.data.token);
      setUser(result.data.user);
      setIsAuth(true);

      navigate("/", { replace: true });
      toast.success(`Welcome back, ${result.data.user.name}!`);
    } catch {
      toast.error("Invalid credentials. Please check and try again.");
    }
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const result = await axios.post(`${authService}/api/auth/user/signup`, {
        name: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
      });
      localStorage.setItem("token", result.data.token);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/", { replace: true });
      toast.success("Account created successfully!");
    } catch {
      toast.error("Failed to create account. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream px-4 py-8 text-brand-charcoal sm:px-6 lg:px-8">
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — Brand */}
        <div className="space-y-6 hidden lg:block">
          <div>
            <p className="font-serif text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">Food delivery</p>
            <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-brand-charcoal">
              GOOD
              <span className="text-brand-primary">FOOD</span>
            </h1>
          </div>
          <p className="max-w-sm font-serif text-lg leading-relaxed text-brand-muted">
            Crave it. Discover it. Enjoy it — delivered right to your door.
          </p>

          {/* Floating feature pills */}
          <div className="flex flex-wrap gap-3 pt-4">
            {["🍕 1000+ restaurants", "⚡ 30 min delivery", "🎯 Live tracking"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-brand-border bg-brand-cream-dark/40 px-4 py-2 text-xs font-semibold text-brand-muted shadow-premium-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Auth card */}
        <div className="rounded-3xl border border-brand-border/60 bg-brand-card p-6 shadow-premium-lg sm:p-8">
          {/* Mobile logo */}
          <div className="mb-6 lg:hidden text-center">
            <h1 className="font-serif text-3xl font-black text-brand-charcoal">GOOD<span className="text-brand-primary">FOOD</span></h1>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-2xl font-black text-brand-charcoal">{title}</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {isLogin ? "Sign in to your account" : "Join GOODFOOD today"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-2xl border border-brand-border bg-brand-cream-dark/50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${isLogin
                  ? "bg-brand-primary text-white shadow-premium-sm"
                  : "text-brand-muted hover:text-brand-charcoal"
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${!isLogin
                  ? "bg-brand-primary text-white shadow-premium-sm"
                  : "text-brand-muted hover:text-brand-charcoal"
                }`}
            >
              Sign up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Field
                id="login-email"
                label="Email"
                type="email"
                value={loginForm.email}
                placeholder="you@example.com"
                onChange={(v) => setLoginForm((p) => ({ ...p, email: v }))}
              />
              <Field
                id="login-password"
                label="Password"
                type="password"
                value={loginForm.password}
                placeholder="Your password"
                onChange={(v) => setLoginForm((p) => ({ ...p, password: v }))}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-premium transition hover:bg-brand-primary-hover hover:-translate-y-0.5"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <Field
                id="signup-username"
                label="Username"
                type="text"
                value={signupForm.username}
                placeholder="Your name"
                onChange={(v) => setSignupForm((p) => ({ ...p, username: v }))}
              />
              <Field
                id="signup-email"
                label="Email"
                type="email"
                value={signupForm.email}
                placeholder="you@example.com"
                onChange={(v) => setSignupForm((p) => ({ ...p, email: v }))}
              />
              <Field
                id="signup-password"
                label="Password"
                type="password"
                value={signupForm.password}
                placeholder="Create a strong password"
                onChange={(v) => setSignupForm((p) => ({ ...p, password: v }))}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-premium transition hover:bg-brand-primary-hover hover:-translate-y-0.5"
              >
                Create account
              </button>
            </form>
          )}

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-brand-border/60" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">or</span>
            <span className="h-px flex-1 bg-brand-border/60" />
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-brand-charcoal shadow-premium-sm transition hover:bg-brand-cream-dark/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FcGoogle size={18} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-5 text-center font-serif text-xs text-brand-muted italic">
            Taste first. Tap later.
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  id,
  label,
  type,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-brand-border bg-brand-cream/20 px-4 py-2.5 text-sm text-brand-charcoal outline-none placeholder:text-brand-muted/40 focus:border-brand-primary/50 focus:bg-white focus:ring-1 focus:ring-brand-primary/20 transition duration-155"
    />
  </div>
);

export default Login;
