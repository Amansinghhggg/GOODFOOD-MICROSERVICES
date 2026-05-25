import axios from "axios";
import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
const Login = () => {
  const[loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"]
      });
      console.log(`result: `+JSON.stringify(result));
      console.log(`token: `+result.data.token);
      console.log(`result.user: `+ JSON.stringify(result.data.user));
      localStorage.setItem("token", result.data.token);
      toast .success("Login successful");
      setLoading(false);
      navigate("/home");
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Login failed");
    }
  }
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
<div className="w-full max-w-sm space-y-6">
<h1 className="text-center text-3x1 font-bold text-[#E23774]">
Tomato
</h1>

<p className="text-center text-sm text-gray-500">
Log in or sign up to continue
</p>

<button onClick={googleLogin} disabled={loading} className="flex w-full items-center
justify-center gap-3 rounded-x1 border border-gray-300 bg-white px-4 py-3">
<FcGoogle size={20} />
{loading ? "Signing in..." : "Continue with Google"}
</button>
 <p className="text-center text-xs text-gray-500">
 By continuing, you agree to our Terms of Service and Privacy Policy.
</p>
</div>
</div>
  )
};

export default Login;
