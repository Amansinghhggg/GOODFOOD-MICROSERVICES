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

  const title = useMemo(
    () => (isLogin ? "Welcome back" : "Create your account"),
    [isLogin]
  );

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);
      setUser(result.data.user);
      setIsAuth(true);
      toast.success(`Login successful, Welcome back! ${result.data.user.name}`);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Login failed,Please try again");
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
      })
      localStorage.setItem("token", result.data.token);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/", { replace: true });
      toast.success(`Login successful, Welcome back! ${result.data.user.name}`);
      } catch (error) {
        toast.error("Login failed,Please Check Your Credentials");
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
      toast.success("Account created successfully");
      setMode("login");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create account");
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#120f17] via-[#1b1220] to-[#2d1624] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
              GOODFOOD
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Good food, great mood.
            </p>
            <p className="max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Crave it. Discover it. Enjoy it.
            </p>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isLogin ? "bg-white text-[#E23774] shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                !isLogin ? "bg-white text-[#E23774] shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6c9e]"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Your password"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6c9e]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#ff5f8d] px-4 py-3 font-semibold text-white transition hover:bg-[#ff4a7d]"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-username" className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6c9e]"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6c9e]"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Create password"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6c9e]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#ff5f8d] px-4 py-3 font-semibold text-white transition hover:bg-[#ff4a7d]"
              >
                Create account
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-4 text-white/45">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.25em]">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={googleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FcGoogle size={20} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-5 text-center text-xs leading-6 text-white/50">Taste first. Tap later.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
