"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "signout" | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error) {
      const messages: Record<string, string> = {
        missing_code: "That sign-in link is invalid. Request another one.",
        auth_failed: "The sign-in link expired or could not be verified. Request a fresh link.",
        unauthorized: "This Google account is not allowed to access the workspace.",
        setup: "Workspace owner email is not configured. Contact the administrator."
      };
      setIsError(true);
      setMessage(messages[error] ?? "Sign-in failed. Please try again.");
    }
  }, []);

  async function emailSignIn() {
    if (!email.trim()) return;
    setBusy("email");
    setIsError(false);
    setMessage("");
    try {
      const { error } = await getClient().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
          shouldCreateUser: false
        }
      });
      if (error) throw error;
      setMessage("Sign-in link sent. Open the latest email in Gmail, then return here.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not send the sign-in link.");
    } finally {
      setBusy(null);
    }
  }

  async function googleSignIn() {
    setBusy("google");
    setIsError(false);
    setMessage("");
    try {
      const { data, error } = await getClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" }
      });
      if (error) throw error;
      if (!data.url) throw new Error("Google sign-in is unavailable. Use the email link instead.");
      window.location.assign(data.url);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not start Google sign-in.");
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("signout");
    try {
      await getClient().auth.signOut();
      setIsError(false);
      setMessage("Previous session cleared. Sign in with your authorized Gmail.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 520, margin: "48px auto" }}>
      <h1>Access your Growth OS</h1>
      <p className="muted">
        Sign in using your approved Gmail account. No Supabase dashboard invitation or Vercel login needed.
      </p>
      {GOOGLE_ENABLED && (
        <p>
          <button onClick={googleSignIn} disabled={busy !== null}>
            {busy === "google" ? "Opening Google…" : "Continue with Google"}
          </button>
        </p>
      )}
      <label htmlFor="email">Gmail address</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@gmail.com"
        onKeyDown={e => { if (e.key === "Enter") void emailSignIn(); }}
      />
      <p>
        <button onClick={emailSignIn} disabled={busy !== null || !email.includes("@")}>
          {busy === "email" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </p>
      {message && (
        <p role={isError ? "alert" : "status"} style={{ color: isError ? "#b42318" : "inherit" }}>
          {message}
        </p>
      )}
      <p className="muted">
        Signed in with the wrong account?{" "}
        <button className="secondary" onClick={signOut} disabled={busy !== null}>
          Clear session
        </button>
      </p>
    </section>
  );
}