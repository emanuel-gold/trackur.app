import { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button, Input, InputGroup, Field, Label, FieldGroup } from './catalyst';
import { CHAR_LIMITS } from '../constants.js';
import GoogleIcon from './GoogleIcon.jsx';
import TrackurWordmark from './TrackurWordmark.jsx';

export default function LoginScreen({ signInWithEmail, signInWithGoogle, onCreateAccount }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-200 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        {/* Branding */}
        <div className="mb-6 flex justify-center">
          <TrackurWordmark size="lg" />
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold text-zinc-950 dark:text-white">
          Sign in to your account
        </h2>

        {/* Google OAuth */}
        <Button outline className="w-full" onClick={handleGoogle}>
          <GoogleIcon />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-950/10 dark:bg-white/10" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">OR</span>
          <div className="h-px flex-1 bg-zinc-950/10 dark:bg-white/10" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label>Email</Label>
              <InputGroup>
                <EnvelopeIcon data-slot="icon" />
                <Input
                  type="email"
                  required
                  maxLength={CHAR_LIMITS.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </InputGroup>
              {email.length >= CHAR_LIMITS.email && (
                <span className="text-[11px] text-red-500 dark:text-red-400">Max {CHAR_LIMITS.email} characters.</span>
              )}
            </Field>
            <Field>
              <Label>Password</Label>
              <InputGroup>
                <LockClosedIcon data-slot="icon" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  maxLength={CHAR_LIMITS.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </InputGroup>
              {password.length >= CHAR_LIMITS.password && (
                <span className="text-[11px] text-red-500 dark:text-red-400">Max {CHAR_LIMITS.password} characters.</span>
              )}
            </Field>
          </FieldGroup>

          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            color="violet"
            className="mt-5 w-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Create account link */}
        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onCreateAccount}
            className="font-medium text-mauve-600 hover:text-mauve-700 dark:text-mauve-400 dark:hover:text-mauve-300"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
