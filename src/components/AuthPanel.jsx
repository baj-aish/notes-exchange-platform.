import { useState } from "react";

const defaultForm = {
  name: "",
  email: "",
  password: ""
};

export default function AuthPanel({ onLogin, onSignup, disabled }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultForm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "login") {
      await onLogin({ email: form.email, password: form.password });
      return;
    }

    await onSignup(form);
  };

  return (
    <section className="card auth-card">
      <p className="eyebrow">Semester Project Build</p>
      <h1>Smart Student Notes</h1>
      <p className="muted">
        Start with authentication, then build notes, AI tools, and the student social graph.
      </p>

      <div className="segment">
        <button
          className={mode === "login" ? "segment-active" : ""}
          onClick={() => setMode("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={mode === "signup" ? "segment-active" : ""}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label className="field">
            <span>Full name</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </label>

        <button className="primary-btn" disabled={disabled} type="submit">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </section>
  );
}
