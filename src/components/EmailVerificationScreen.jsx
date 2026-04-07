import { useEffect, useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from './catalyst';
import TrackurWordmark from './TrackurWordmark.jsx';
import { supabase } from '../services/supabase.js';

export default function EmailVerificationScreen({ email, onBack }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Poll for session every 5 seconds (same-browser confirmation)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(interval);
        // onAuthStateChange in useAuth will pick up the session automatically
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await supabase.auth.resend({ type: 'signup', email });
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-200 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        {/* Branding */}
        <div className="mb-6 flex justify-center">
          <TrackurWordmark size="lg" />
        </div>

        <div className="text-center">
          <EnvelopeIcon className="mx-auto mb-3 size-10 text-mauve-500" />
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Check your email</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We sent a verification link to{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>.
            Click the link to activate your account.
          </p>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Once verified, you can sign in to your account.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button color="violet" className="w-full" onClick={onBack}>
              Back to sign in
            </Button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-mauve-600 hover:text-mauve-700 dark:text-mauve-400 dark:hover:text-mauve-300 disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend verification email'}
            </button>
            {resent && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Verification email resent!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
