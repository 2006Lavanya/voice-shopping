import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Loads the Google Identity Services script once and reuses it across mounts.
let gsiScriptPromise = null;
const loadGoogleScript = () => {
  if (gsiScriptPromise) return gsiScriptPromise;
  gsiScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return gsiScriptPromise;
};

// Real OAuth 2.0 "Sign in with Google" button. The user authenticates directly on
// accounts.google.com - we only ever receive a signed ID token, never their password.
// If VITE_GOOGLE_CLIENT_ID isn't set, this renders nothing, so the rest of the app
// (email/password auth) keeps working with zero setup required.
const GoogleSignInButton = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
              toast.success("Signed in with Google!");
              navigate("/");
            } catch (err) {
              toast.error(err.response?.data?.message || "Google sign-in failed");
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
        });
        setReady(true);
      })
      .catch(() => {
        toast.error("Could not load Google sign-in (check your internet / ad-blocker).");
      });

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate]);

  if (!GOOGLE_CLIENT_ID) {
    // Not configured yet: show a visible button that explains exactly what to do (instead of hiding it).
    return (
      <div className="flex flex-col items-center gap-3 my-4">
        <button
          type="button"
          onClick={() =>
            toast.error(
              `Google login needs a Client ID. Put it in frontend/.env as VITE_GOOGLE_CLIENT_ID (and backend/.env as GOOGLE_CLIENT_ID), then restart. Authorized origin to add in Google Console: ${window.location.origin}. See GOOGLE_LOGIN_SETUP.md`,
              { duration: 9000 }
            )
          }
          className="w-80 max-w-full flex items-center justify-center gap-3 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
          Sign in with Google
        </button>
        <p className="text-[11px] text-zinc-400 text-center">Google login is not configured yet - email login below works.</p>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400">OR</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <div ref={buttonRef} />
      {!ready && <p className="text-xs text-zinc-400">Loading Google sign-in...</p>}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">OR</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
};

export default GoogleSignInButton;
