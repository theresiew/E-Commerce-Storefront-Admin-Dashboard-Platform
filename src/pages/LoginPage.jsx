import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../utils/constants";
import { loginSchema, registerSchema } from "../validation/schemas";

export function LoginPage() {
  const [mode, setMode] = useState("login");
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

  const redirectAfterAuth = (session) => {
    const fallback = location.state?.from || (session.user.role === "ADMIN" ? "/admin" : "/");
    navigate(fallback, { replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigate(userRole === "ADMIN" ? "/admin" : "/", { replace: true });
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
    <div className="auth-grid">
      <section className="panel auth-copy">
        <span className="eyebrow">Secure access</span>
        <h1>Sign in as a shopper or jump into the admin dashboard.</h1>
        <p>
          The platform stores authenticated sessions in local storage so the user
          experience survives refreshes, while still supporting role-based route protection.
        </p>
        <div className="credentials-card">
          <h3>Admin mock credentials</h3>
          <p>Email: {ADMIN_EMAIL}</p>
          <p>Password: {ADMIN_PASSWORD}</p>
          <div className="button-row">
            <button
              type="button"
              className="ghost-button"
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
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="tab-row">
          <button
            type="button"
            className={`tab-button ${mode === "login" ? "tab-button-active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-button ${mode === "register" ? "tab-button-active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
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
            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegister}>
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
            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
