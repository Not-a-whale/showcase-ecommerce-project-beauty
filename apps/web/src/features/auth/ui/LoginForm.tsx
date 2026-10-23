'use client';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';

type FormState = { error: string | null };

export function LoginForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get('email'));
      const password = String(formData.get('password'));
      try {
        const res = await login({ email, password });
        useAuthStore.getState().setAuth(res.user, res.accessToken);
        router.push('/');
        return { error: null };
      } catch {
        return { error: 'Invalid email or password' };
      }
    },
    { error: null },
  );

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <h2 className="mb-8 text-center font-sans text-[20px] font-normal uppercase leading-[25px] tracking-[0.5px] text-foreground">
        Login
      </h2>

      <form action={formAction} className="flex flex-col">
        <div className="mb-2 flex flex-col gap-2.5">
          <label
            htmlFor="email"
            className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter valid email"
            className="h-[46px] w-full min-w-0 rounded-[2px] border border-border bg-surface px-4 font-sans text-foreground outline-none placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-6 flex flex-col gap-2.5">
          <label
            htmlFor="password"
            className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter password"
            className="h-[46px] w-full min-w-0 rounded-[2px] border border-border bg-surface px-4 font-sans text-foreground outline-none placeholder:text-muted focus:border-primary"
          />
        </div>

        {state.error && (
          <p role="alert" className="mb-6 text-sm text-red-500">
            {state.error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="h-[46px] w-[130px] border-2 border-foreground bg-background font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? '…' : 'Login'}
            </button>

            <Link
              href="/register"
              className="flex h-[46px] w-[130px] items-center justify-center bg-primary font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-primary-foreground"
            >
              Sign up
            </Link>
          </div>

          <Link
            href="/forgot-password"
            className="font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-muted underline hover:text-foreground"
          >
            Forgot password
          </Link>
        </div>
      </form>
    </div>
  );
}
