import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="auth-page">
      <div className="auth-loading">
        <img className="auth-logo" src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
        <strong>Connecting to BeatsVibe One</strong>
        <span>Preparing your secure workspace session…</span>
      </div>
    </main>
  );
}

export function BackendGate({ onRetry }) {
  return (
    <main className="auth-page">
      <section className="auth-card backend-gate">
        <div className="auth-brand">
          <img className="auth-brand-logo" src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
          <span className="auth-platform">ONE</span>
        </div>
        <div className="auth-icon"><ShieldCheck size={23} /></div>
        <h1>Backend connection needed</h1>
        <p>The live Firebase API is currently offline. Retry the connection to continue.</p>
        <div className="auth-callout">
          <LockKeyhole size={15} />
          <span>Sign in with your assigned BeatsVibe One employee credentials once connected.</span>
        </div>
        <button className="auth-submit" onClick={onRetry}>Retry connection <RefreshCw size={15} /></button>
      </section>
    </main>
  );
}

export function LoginScreen({ onLogin, error, busy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  return (
    <main className="auth-page">
      <section className="auth-card auth-single-card">
        <div className="auth-brand">
          <img className="auth-brand-logo" src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
          <span className="auth-platform">ONE</span>
        </div>
        <div className="auth-icon"><LockKeyhole size={22} /></div>
        <h1>Sign in to your workspace</h1>
        <p>Enter your BeatsVibe One ID and password to access your workspace.</p>
        <form onSubmit={submit}>
          <label>
            Work email ID
            <input
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@beatsvibe.com"
            />
          </label>
          <label>
            Password
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={15} />
          </button>
        </form>
        <div className="auth-security-note">
          <ShieldCheck size={14} /> BeatsVibe Technologies · Role-Based Access Control
        </div>
      </section>
    </main>
  );
}
