"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setSending(false);
    if (!response.ok) {
      setError("Invalid username or password.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };
  return <main className="login-shell"><section className="login-card"><p className="eyebrow">PRIVATE DATABASE CONSOLE</p><h1>CirEcon Data Manager</h1><p>View and export game platform data from MongoDB.</p><form onSubmit={submit}><label>Username<input autoComplete="username" onChange={(event) => setUsername(event.target.value)} required value={username} /></label><label>Password<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>{error && <p className="error" role="alert">{error}</p>}<button disabled={sending} type="submit">{sending ? "Signing in..." : "Sign in"}</button></form></section></main>;
}
