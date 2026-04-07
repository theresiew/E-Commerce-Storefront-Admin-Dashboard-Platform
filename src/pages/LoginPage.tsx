import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import {
  eyebrowClass,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../utils/constants";
import { loginSchema, registerSchema } from "../validation/schemas";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { authLoading, isAuthenticated, userRole, login, register } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const redirectAfterAuth = (session: any) => {
    const fallback =
      location.state?.from || (session.user.role === "ADMIN" ? "/admin" : "/");
    navigate(fallback, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(userRole === "ADMIN" ? "/admin" : "/", { replace: true });
    }
  }, [isAuthenticated, navigate, userRole]);

  const handleLogin = loginForm.handleSubmit(async (values) => {
    const session = await login(values);
    redirectAfterAuth(session);
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    const session = await register(values);
    redirectAfterAuth(session);
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className={`${sectionClass} grid gap-5`}>
        <span className={eyebrowClass}>Secure access</span>
        <div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
            Sign in as a shopper or jump straight into the admin dashboard.
          </h1>
          <p className={`mt-4 max-w-2xl ${mutedTextClass}`}>
            The platform persists sessions in local storage, protects routes by role,
            and keeps the admin and shopper experiences clearly separated.
          </p>
        </div>
        <div className="rounded-[28px] border border-ink-900/8 bg-white/75 p-5">
          <h3 className="text-xl font-semibold text-ink-900">Admin mock credentials</h3>
          <p className="mt-3 text-sm text-ink-500">Email: {ADMIN_EMAIL}</p>
          <p className="mt-1 text-sm text-ink-500">Password: {ADMIN_PASSWORD}</p>
          <button
            type="button"
            className={`${secondaryButtonClass} mt-4`}
            onClick={() => {
              setMode("login");
              loginForm.reset({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
              });
            }}
          >
            Use admin credentials
          </button>
        </div>
      </section>

      <section className={`${sectionClass} grid gap-5`}>
        <div className="inline-flex w-fit rounded-full bg-sand-100 p-1">
          <button
            type="button"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${mode === "login" ? "bg-white text-mint-600 shadow-sm" : "text-ink-500"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${mode === "register" ? "bg-white text-mint-600 shadow-sm" : "text-ink-500"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form className="grid gap-4" onSubmit={handleLogin}>
            <FormField label="Email" htmlFor="login-email" error={loginForm.formState.errors.email?.message}>
              <input id="login-email" type="email" {...loginForm.register("email")} />
            </FormField>
            <FormField
              label="Password"
              htmlFor="login-password"
              error={loginForm.formState.errors.password?.message}
            >
              <input id="login-password" type="password" {...loginForm.register("password")} />
            </FormField>
            <button type="submit" className={primaryButtonClass} disabled={authLoading}>
              {authLoading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleRegister}>
            <FormField
              label="Full Name"
              htmlFor="register-full-name"
              error={registerForm.formState.errors.fullName?.message}
            >
              <input id="register-full-name" type="text" {...registerForm.register("fullName")} />
            </FormField>
            <FormField
              label="Email"
              htmlFor="register-email"
              error={registerForm.formState.errors.email?.message}
            >
              <input id="register-email" type="email" {...registerForm.register("email")} />
            </FormField>
            <FormField
              label="Password"
              htmlFor="register-password"
              error={registerForm.formState.errors.password?.message}
            >
              <input id="register-password" type="password" {...registerForm.register("password")} />
            </FormField>
            <button type="submit" className={primaryButtonClass} disabled={authLoading}>
              {authLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
