import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const adminEmail = "sibabeauty27@gmail.com";

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        toast.error("Please enter your email above first");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const map: Record<string, string> = {
        "auth/missing-email": "Please enter your email above.",
        "auth/invalid-email": "Invalid email address.",
        "auth/user-not-found": "No account found for this email.",
        "auth/network-request-failed": "Network error. Please try again.",
      };
      toast.error(map[code ?? ""] ?? (err?.message || "Failed to send reset email"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully");
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created and logged in");
      }

      if (email.toLowerCase() === adminEmail) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const map: Record<string, string> = {
        "auth/operation-not-allowed": "Email/Password sign-in is not enabled for this Firebase project. Please enable it in Authentication > Sign-in method.",
        "auth/user-not-found": "No account found for this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "auth/invalid-api-key": "Invalid Firebase API key in configuration.",
      };
      toast.error(map[code ?? ""] ?? (err?.message || "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{mode === "login" ? "Login" : "Sign Up"}</h1>
          <p className="text-sm text-muted-foreground">Access your account to manage orders and products</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === "login" && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:underline" onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          {mode === "login" ? (
            <button className="text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button>
          ) : (
            <button className="text-primary hover:underline" onClick={() => setMode("login")}>Already have an account? Login</button>
          )}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>Back to Shop</Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;