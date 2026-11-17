'use client';
import { AuthStatus, useAuthStore } from '@/features/auth/model/auth.store';

export function Profile() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  if (status === AuthStatus.Idle) {
    return null;
  }

  if (!user) {
    return (
      <p className="font-accent text-sm uppercase tracking-[1px] text-muted">
        Not logged in
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <h2 className="mb-8 text-center font-sans text-[20px] font-normal uppercase leading-[25px] tracking-[0.5px] text-foreground">
        My account
      </h2>

      <dl className="flex flex-col gap-4">
        <div>
          <dt className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-muted">
            Name
          </dt>
          <dd className="mt-1 font-sans text-foreground">
            {user.firstName} {user.lastName}
          </dd>
        </div>

        <div>
          <dt className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-muted">
            Email
          </dt>
          <dd className="mt-1 font-sans text-foreground">{user.email}</dd>
        </div>

        <div>
          <dt className="font-accent text-[13px] uppercase leading-[15px] tracking-[1px] text-muted">
            Role
          </dt>
          <dd className="mt-1 font-sans text-foreground">{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}
