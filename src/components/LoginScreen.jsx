import { useState } from 'react';
import { Button } from './catalyst';
import GoogleIcon from './GoogleIcon.jsx';
import GithubIcon from './GithubIcon.jsx';
import TrackurWordmark from './TrackurWordmark.jsx';

export default function LoginScreen({ signInWithGoogle, signInWithGithub }) {
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleGithub = async () => {
    setError('');
    const { error } = await signInWithGithub();
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-200 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="mb-6 flex justify-center">
          <TrackurWordmark size="lg" />
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold text-zinc-950 dark:text-white">
          Sign in to Trackur
        </h2>

        <div className="flex flex-col gap-3">
          <Button outline className="w-full" onClick={handleGoogle}>
            <GoogleIcon />
            Continue with Google
          </Button>
          <Button outline className="w-full" onClick={handleGithub}>
            <GithubIcon />
            Continue with GitHub
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
          By proceeding, you agree to the{' '}
          <a
            href="https://trackur.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-mauve-600 hover:text-mauve-700 dark:text-mauve-400 dark:hover:text-mauve-300"
          >
            terms of service
          </a>{' '}
          and{' '}
          <a
            href="https://trackur.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-mauve-600 hover:text-mauve-700 dark:text-mauve-400 dark:hover:text-mauve-300"
          >
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
