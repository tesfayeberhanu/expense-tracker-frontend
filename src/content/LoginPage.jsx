import lpLogo from "../assets/lp-logo.png";
import { useFinance } from "../context";

export default function LoginPage() {
  const { handleSignIn, loginError, loginForm, setLoginForm } = useFinance();

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand login-brand">
          <img className="brand-mark" src={lpLogo} alt="" />
          <span>LP Finance</span>
        </div>
        <p className="eyebrow">Operator access</p>
        <h1>Sign in</h1>
        <p className="subtitle">Enter your account credentials to continue.</p>
        {loginError && (
          <div className="alert login-alert" role="alert">
            <span>!</span>
            {loginError}
          </div>
        )}
        <form className="login-form" onSubmit={handleSignIn}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            required
            value={loginForm.username}
            onChange={(event) =>
              setLoginForm({ ...loginForm, username: event.target.value })
            }
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm({ ...loginForm, password: event.target.value })
            }
          />
          <button className="submit-button" type="submit">
            Sign in <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
