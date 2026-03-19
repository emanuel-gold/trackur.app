import { useState, useRef } from 'react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button, Input, InputGroup, Field, Label, FieldGroup } from './catalyst';
import GoogleIcon from './GoogleIcon.jsx';
import TrackurWordmark from './TrackurWordmark.jsx';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function SignUpScreen({ signUpWithEmail, signInWithGoogle, onBack, onSignUpSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const turnstileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await signUpWithEmail(email, password, captchaToken || undefined);
      if (error) {
        setError(error.message);
        // Reset Turnstile on error
        turnstileRef.current?.reset();
        setCaptchaToken('');
      } else {
        onSignUpSuccess(email);
      }
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
          Create your account
        </h2>

        {/* Google OAuth */}
        <Button outline className="w-full" onClick={handleGoogle}>
          <GoogleIcon />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-950/10 dark:bg-white/10" />
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">OR</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </InputGroup>
            </Field>
            <Field>
              <Label>Password</Label>
              <InputGroup>
                <LockClosedIcon data-slot="icon" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </InputGroup>
            </Field>
            <Field>
              <Label>Confirm Password</Label>
              <InputGroup>
                <LockClosedIcon data-slot="icon" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </InputGroup>
            </Field>
          </FieldGroup>

          {/* Turnstile CAPTCHA */}
          {TURNSTILE_SITE_KEY && (
            <div className="mt-4 flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                options={{ theme: 'auto', size: 'normal' }}
              />
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            color="mauve"
            className="mt-5 w-full"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        {/* Back to sign in */}
        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-mauve-600 hover:text-mauve-700 dark:text-mauve-400 dark:hover:text-mauve-300"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
