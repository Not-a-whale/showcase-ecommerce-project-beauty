'use client';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { ApiError } from '@/shared/api/fetch-client';

type FormState = { error: string | null };

export function RegisterForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get('email'));
      const password = String(formData.get('password'));
      const firstName = String(formData.get('firstName'));
      const lastName = String(formData.get('lastName'));
      try {
        const res = await signup({ email, password, firstName, lastName });
        useAuthStore.getState().setAuth(res.user, res.accessToken);
        router.push('/');
        return { error: null };
      } catch (err) {
        if (err instanceof ApiError) {
          const body = err.body as { message?: string; errors?: string[] } | undefined;
          return {
            error: body?.errors?.join(', ') ?? body?.message ?? 'Could not create account',
          };
        }
        return { error: 'Could not create account' };
      }
    },
    { error: null },
  );

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <h2 className="mb-8 text-center font-sans text-[20px] font-normal uppercase leading-[25px] tracking-[0.5px] text-foreground">
        Sign up
      </h2>

      <form action={formAction} className="flex flex-col">
        <div className="mb-2 flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <label
              htmlFor="firstName"
              className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-foreground"
            >
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Jane"
              className="h-[46px] w-full min-w-0 rounded-[2px] border border-border bg-surface px-4 font-sans text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <label
              htmlFor="lastName"
              className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-foreground"
            >
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Doe"
              className="h-[46px] w-full min-w-0 rounded-[2px] border border-border bg-surface px-4 font-sans text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
        </div>

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
            autoComplete="new-password"
            required
            minLength={6}
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
          <button
            type="submit"
            disabled={isPending}
            className="h-[46px] w-[160px] bg-primary font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? '…' : 'Sign up'}
          </button>

          <Link
            href="/login"
            className="font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-muted underline hover:text-foreground"
          >
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}
