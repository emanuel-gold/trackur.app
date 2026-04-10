import { useState } from 'react';
import { Button } from './catalyst';
import GoogleIcon from './GoogleIcon.jsx';
import TrackurWordmark from './TrackurWordmark.jsx';

export default function LoginScreen({ signInWithGoogle }) {
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle();
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

        <Button outline className="w-full" onClick={handleGoogle}>
          <GoogleIcon />
          Continue with Google
        </Button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
