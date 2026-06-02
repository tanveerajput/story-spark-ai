import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { storeUserInfo } from "../../services/auth.service";
import toast, { Toaster } from "react-hot-toast";
import {
  useEmailVerifyMutation,
  useVerifyOtpMutation,
} from "../../redux/apis/otp.verify.api";
import { useRegisterUserMutation } from "../../redux/apis/auth.api";
import { WandSparkles, BookOpen, UsersRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface IRegisterInfo {
  name: string;
  email: string;
  password: string;
}

interface Inputs extends IRegisterInfo {
  confirmPassword: string;
  otp: string;
}

const getPasswordError = (password: string) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
  return "";
};

type StrengthLevel = "weak" | "medium" | "strong";

const PASSWORD_STRENGTH_CONFIG: Record<StrengthLevel, { label: string; barColor: string; barWidth: string; textColor: string }> = {
  weak: { label: "Weak", barColor: "bg-red-500", barWidth: "w-1/3", textColor: "text-red-400" },
  medium: { label: "Medium", barColor: "bg-yellow-400", barWidth: "w-2/3", textColor: "text-yellow-300" },
  strong: { label: "Strong", barColor: "bg-green-500", barWidth: "w-full", textColor: "text-green-400" },
};

const getStrengthLevel = (passedChecks: number): StrengthLevel => {
  if (passedChecks <= 2) return "weak";
  if (passedChecks <= 4) return "medium";
  return "strong";
};

const PASSWORD_REQUIREMENTS = [
  { key: "length" as const, label: "Minimum 8 characters" },
  { key: "uppercase" as const, label: "One uppercase letter" },
  { key: "lowercase" as const, label: "One lowercase letter" },
  { key: "number" as const, label: "One number" },
  { key: "special" as const, label: "One special character" },
];

const SignUpComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailVerify] = useEmailVerifyMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [registerUser] = useRegisterUserMutation();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>({ mode: "onChange" });

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [showOtpField, setShowOtpField] = useState<boolean>(false);
  const [registerInfo, setRegisterInfo] = useState<IRegisterInfo>();
  const [expiredAt, setExpiredAt] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const otp = watch("otp");

  const passwordChecks = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ""),
    lowercase: /[a-z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
    special: /[^A-Za-z0-9]/.test(password || ""),
  };

  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLevel = getStrengthLevel(passedChecks);
  const { label: strengthLabel, barColor, barWidth, textColor } = PASSWORD_STRENGTH_CONFIG[strengthLevel];

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (password !== confirmPassword) return toast.error("Passwords do not match!");
    const passwordError = getPasswordError(data.password);
    if (passwordError) return toast.error(passwordError);

    setIsBusy(true);
    try {
      const res = await emailVerify({ name: data.name, email: data.email }).unwrap();
      if (res?.data) {
        setExpiredAt(new Date(res.data.expiresAt).getTime());
        toast.success("OTP sent to your email");
        setRegisterInfo({ name: data.name, email: data.email, password: data.password });
        setShowOtpField(true);
        setCooldown(60);
      }
    } catch (error: any) {
      toast.error(error?.data?.[0]?.message || "Failed to send OTP.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-white dark:bg-[#050816] text-black dark:text-white transition-all duration-300">
      <main className="auth-container flex flex-col md:flex-row overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] w-full max-w-6xl bg-white dark:bg-[#0b1020]">

        {/* LEFT SIDE - Features & Branding */}
        <section className="w-full md:w-[52%] flex flex-col justify-center p-8 md:p-14 relative z-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0b1020] dark:to-[#131c2f]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="fi fi-rr-sparkles text-white text-sm"></span>
            </div>
            <span className="text-slate-900 dark:text-white text-sm tracking-[0.25em] font-bold uppercase">Story Spark AI</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 dark:text-white drop-shadow-xl mb-8">
            Turns Ideas into <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">unforgettable stories</span>
          </h1>

          <div className="space-y-4">
            <div className="flex items-center gap-6 border border-gray-300 rounded-2xl bg-white dark:bg-slate-800 p-4">
              <WandSparkles className="text-violet-600" />
              <div>
                <h1 className="font-bold">Smart writing</h1>
                <p className="text-sm text-gray-500">AI that understands your ideas</p>
              </div>
            </div>
            <div className="flex items-center gap-6 border border-gray-300 rounded-2xl bg-white dark:bg-slate-800 p-4">
              <BookOpen className="text-violet-600" />
              <div>
                <h1 className="font-bold">Endless Creativity</h1>
                <p className="text-sm text-gray-500">Stories that captivate and inspire</p>
              </div>
            </div>
            <div className="flex items-center gap-6 border border-gray-300 rounded-2xl bg-white dark:bg-slate-800 p-4">
              <UsersRound className="text-violet-600" />
              <div>
                <h1 className="font-bold">Built for everyone</h1>
                <p className="text-sm text-gray-500">Writers, Creators and dreamers</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE - Auth Form */}
        <section className="w-full md:w-[48%] flex items-center justify-center p-6 bg-white dark:bg-[#050816]">
          <div className="w-full max-w-[470px] rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#09111f] p-7 md:p-9 shadow-xl">
            <h2 className="text-3xl font-black mb-2">{showOtpField ? "Verify Email" : "Create Account"}</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Join StorySparkAI and begin your creative journey.</p>

            {!showOtpField ? (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Full Name</label>
                  <input type="text" placeholder="Enter your full name" className="w-full h-[52px] rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131c2f] px-5 outline-none focus:border-purple-500" {...register("name", { required: "Name is required" })} />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Email Address</label>
                  <input type="email" placeholder="name@storyspark.ai" className="w-full h-[52px] rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131c2f] px-5 outline-none focus:border-purple-500" {...register("email", { required: "Email is required" })} />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Password</label>
                  <input type="password" placeholder="Enter password" className="w-full h-[52px] rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131c2f] px-5 outline-none focus:border-purple-500" {...register("password", { required: "Password is required" })} />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Confirm Password</label>
                  <input type="password" placeholder="Confirm password" className="w-full h-[52px] rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131c2f] px-5 outline-none focus:border-purple-500" {...register("confirmPassword", { required: "Please confirm password" })} />
                </div>

                {password && (
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${barColor} ${barWidth}`} />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Strength: {strengthLabel}</p>
                  </div>
                )}

                <button type="submit" disabled={isBusy} className="w-full h-[52px] rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition">
                  {isBusy ? "Processing..." : "Sign Up"}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <label className="block mb-2 text-sm font-semibold">OTP Code</label>
                <input type="text" placeholder="Enter OTP" className="w-full h-[52px] rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131c2f] px-5 outline-none focus:border-purple-500" {...register("otp")} />
                <button type="button" disabled={isBusy} className="w-full h-[52px] rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition">
                  {isBusy ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {!showOtpField && (
              <p className="mt-8 text-center text-sm">
                Already have an account? <a href="/login" className="font-semibold text-purple-500 hover:text-purple-400">Sign In</a>
              </p>
            )}
          </div>
        </section>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default SignUpComponent;