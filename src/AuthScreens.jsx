import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Laptop, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";

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
        <div className="auth-top-accent" aria-hidden="true" />
        <div className="auth-brand">
          <img className="auth-brand-logo" src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
          <span className="auth-platform">ONE · SUITE</span>
        </div>

        <div className="auth-heading-block">
          <div className="auth-icon"><LockKeyhole size={20} /></div>
          <div>
            <span className="auth-eyebrow">ENTERPRISE WORKSPACE PORTAL</span>
            <h1>Sign in to BeatsVibe One</h1>
          </div>
        </div>
        <p>Authenticate with your official ID and password. Permissions adapt automatically across all 7 corporate tiers.</p>

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
            {busy ? "Verifying session…" : "Access Workspace"} <ArrowRight size={15} />
          </button>
        </form>

        <div className="auth-trust-strip">
          <span><ShieldCheck size={13} /> 7-Tier RBAC Enforced</span>
          <span><Laptop size={13} /> Workstation Guarded</span>
        </div>
        <div className="auth-security-note">
          BeatsVibe Technologies · Founder: Suyash Rathod · CTO: Pavan Londhe
        </div>
      </section>
    </main>
  );
}
