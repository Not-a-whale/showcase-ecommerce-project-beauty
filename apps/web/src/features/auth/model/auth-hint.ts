export const AUTH_HINT_COOKIE = 'auth_hint';

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function setAuthHint(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.cookie = on
    ? `${AUTH_HINT_COOKIE}=1; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`
    : `${AUTH_HINT_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.documentElement.setAttribute('data-auth', on ? '1' : '0');
}
