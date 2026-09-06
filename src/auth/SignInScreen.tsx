import { ListTodo } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './useAuth';

/** Full-page gate shown whenever there is no session. */
export function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setPending(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On success the browser navigates to Google; nothing more to do here.
    } catch {
      setError('Could not start sign-in. Check your connection and try again.');
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <ListTodo className="size-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Task &amp; Note Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your tasks and notes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <GoogleMark />
          {pending ? 'Redirecting…' : 'Continue with Google'}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}
