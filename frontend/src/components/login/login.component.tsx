import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import SSInput from "../ui-component/ss-input/ss-input";
import SSButton from "../ui-component/ss-button/ss-button";
import {
  useLoginUserMutation,
  useGoogleLoginMutation,
} from "../../redux/apis/auth.api";
import { storeUserInfo, getUserInfo } from "../../services/auth.service";
import { USER_ROLE } from "../../constants/role";
import RedirectComponent from "../redirect.component";
import toast, { Toaster } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { WandSparkles, BookOpen, UsersRound } from "lucide-react";

type Inputs = {
  email: string;
  password: string;
};

const LoginComponent = () => {
  const [loginUser] = useLoginUserMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: "onChange" });

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsBusy(true);
    try {
      const res = await loginUser({ ...data }).unwrap();
      if (res.data.accessToken) {
        toast.success("User logged in successfully!");
        storeUserInfo({ accessToken: res.data.accessToken });
        setIsLoggedIn(true);
      }
    } catch {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setIsBusy(true);
    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      }).unwrap();
      if (res.data.accessToken) {
        toast.success("User logged in successfully with Google!");
        storeUserInfo({
          accessToken: res.data.accessToken,
        });
        setIsLoggedIn(true);
      }
    } catch {
      toast.error("Failed to login with Google. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (isLoggedIn) {
    const userInfo = getUserInfo();
    const isDashboardUser =
      userInfo?.role === USER_ROLE.ADMIN ||
      userInfo?.role === USER_ROLE.SUPER_ADMIN;
    return (
      <RedirectComponent
        defaultPath={isDashboardUser ? "/dashboard" : "/explore"}
      />
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex items-center justify-center relative overflow-hidden px-4 box-border py-12">
=======
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex items-center justify-center relative overflow-hidden px-4 box-border">
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

<<<<<<< HEAD
      <div className="flex w-full max-w-6xl flex-col lg:flex-row items-center justify-center gap-10 xl:gap-20 relative z-10 box-border">

        {/* Left Side: Features */}
        <div className="hidden lg:flex flex-col gap-6 max-w-md">
          <h2 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-sm mb-2">
            STORY SPARK AI
          </h2>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent leading-tight">
            Turns Ideas into <br />
            unforgettable stories
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            AI powered storytelling that helps you create, connect, and inspire.
          </p>

          <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <WandSparkles className="text-violet-600 shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Smart writing</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">AI that understands your ideas</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <BookOpen className="text-violet-600 shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Endless Creativity</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Stories that captivate and inspire</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <UsersRound className="text-violet-600 shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Built for everyone</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Writers, Creators and dreamers</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden relative">

          <button
            onClick={() => window.location.href = "/"}
            className="mb-8 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
=======
      <div className="flex w-full max-w-5xl flex-row justify-center gap-16 py-12 relative z-10 box-border items-center">
        {/* Left side — feature highlights */}
        <div className="hidden lg:flex flex-col gap-5 max-w-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent">
            Turns Ideas into
            <br />
            unforgettable stories
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            AI powered storytelling that helps you
            <br />
            create, connect &amp; inspire.
          </p>

          <div className="flex justify-center items-center gap-6 border border-gray-300 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 dark:text-gray-400">
            <WandSparkles className="text-violet-600 shrink-0" />
            <div>
              <h2 className="font-bold">Smart writing</h2>
              <p>AI that understands your ideas</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 border border-gray-300 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 dark:text-gray-400">
            <BookOpen className="text-violet-600 shrink-0" />
            <div>
              <h2 className="font-bold">Endless Creativity</h2>
              <p>Stories that captivate and inspire</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 border border-gray-300 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 dark:text-gray-400">
            <UsersRound className="text-violet-600 shrink-0" />
            <div>
              <h2 className="font-bold">Built for everyone</h2>
              <p>Writers, Creators and dreamers</p>
            </div>
          </div>

          <div className="border border-gray-300 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-gray-400 text-sm">
            Create, edit, and generate engaging multiple story variations from a
            single prompt. Perfect for writers, creators, and enthusiasts
            exploring the future of fiction.
          </div>
        </div>

        {/* Right side — login form card */}
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
          {/* Back to Home */}
          <button
            onClick={() => (window.location.href = "/")}
            className="mb-4 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
          >
            ← Back to Home
          </button>

<<<<<<< HEAD
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome Back</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sign in to continue your creative journey.</p>

          <form className="space-y-5 w-full" onSubmit={handleSubmit(onSubmit)}>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fi fi-rr-envelope"></i>
                </div>
                <input
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-[#131c2f] text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                  placeholder="Enter your email"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fi fi-rr-lock"></i>
                </div>
                <input
                  type="password"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-[#131c2f] text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.password ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end -mt-2 mb-4">
              <a
                href="/forgot-password"
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
=======
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your Story Spark AI account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <SSInput
              label="Email address"
              name="email"
              type="email"
              placeholder="Enter your email"
              required={true}
              icon="fi fi-rr-envelope"
              register={register}
              validation={{ required: "Email is required" }}
              error={errors.email}
              autoComplete="email"
              />

            {/* Password field — eye icon toggle is provided by SSInput when type="password" */}
            <SSInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required={true}
              icon="fi fi-rr-lock"
              register={register}
              validation={{ required: "Password is required" }}
              error={errors.password}
              autoComplete="password"
            />

            <div className="flex justify-end -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
              >
                Forgot Password?
              </Link>
            </div>

<<<<<<< HEAD
            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isBusy ? "Signing in..." : "Sign In"}
            </button>
=======
            <SSButton text="Sign In" type="submit" isLoading={isBusy} />
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
          </form>

          <div className="mt-8 relative w-full">
            <div className="absolute inset-0 flex items-center w-full">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm w-full">
<<<<<<< HEAD
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                OR CONTINUE WITH
=======
              <span className="px-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                OR
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
              </span>
            </div>
          </div>

<<<<<<< HEAD
          <div className="mt-8 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
=======
          <div className="mt-6 flex justify-center list-none w-full">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default LoginComponent;
