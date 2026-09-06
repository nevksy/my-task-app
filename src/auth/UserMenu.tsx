import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

/** Header control: shows who's signed in, with a sign-out action. */
export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const name = (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? user.email ?? 'Account';
  const avatarUrl = (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-gray-300 bg-white py-1 pl-1 pr-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-32 truncate">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="truncate px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
