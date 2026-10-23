'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useIsAuthenticated } from '@/features/auth/model/auth.store';

const footerHeading =
  'mb-[11px] font-sans text-[20px] font-normal uppercase leading-[25px] tracking-[0.5px] text-foreground';
const footerLink =
  'font-sans capitalize text-foreground hover:text-muted';

const SOCIALS = [
  { href: 'https://facebook.com', icon: '/facebook.svg', label: 'Facebook' },
  { href: 'https://twitter.com', icon: '/twitter.svg', label: 'Twitter' },
  { href: 'https://instagram.com', icon: '/instagram.svg', label: 'Instagram' },
  { href: 'https://youtube.com', icon: '/youtube.svg', label: 'YouTube' },
];

const INFO_LINKS = [
  { href: '/', label: 'About us' },
  { href: '/', label: 'Our approach' },
  { href: '/', label: 'Contact' },
  { href: '/', label: 'FAQs' },
];

const PAYMENT_ICONS = [
  '/visa.svg',
  '/mastercard.svg',
  '/amex.svg',
  '/paypal.svg',
  '/diners-club.svg',
  '/discover.svg',
];

export function Footer() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <footer className="bg-surface">
      <div className="px-[8.5%] pb-11 pt-9">
        <div className="flex justify-between">
          <div>
            <h3 className={footerHeading}>Beauty store</h3>
            <p className="mb-6 font-sans text-foreground">
              &copy; {new Date().getFullYear()} Beauty store
            </p>

            <div
              className={
                isAuthenticated
                  ? 'mb-[38.5px] mt-[17px] flex'
                  : 'invisible mb-[38.5px] mt-[17px] flex'
              }
            >
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="mr-[17px]"
                  aria-label={social.label}
                >
                  <Image src={social.icon} alt={social.label} width={16} height={16} />
                </a>
              ))}
            </div>

            <div
              className={
                isAuthenticated
                  ? 'flex h-[42px] w-[136px] items-center justify-between rounded-[2px] border border-border bg-background px-4 font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-foreground'
                  : 'invisible flex h-[42px] w-[136px] items-center justify-between rounded-[2px] border border-border bg-background px-4 font-accent text-[14px] uppercase leading-[16px] tracking-[1px] text-foreground'
              }
            >
              USD $<Image src="/arrow_down.svg" alt="" width={10} height={6} />
            </div>
          </div>

          <div className={isAuthenticated ? '' : 'invisible'}>
            <h3 className={footerHeading}>Info</h3>
            <ul className="flex flex-col gap-2">
              {INFO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={isAuthenticated ? '' : 'invisible'}>
            <h3 className={footerHeading}>Subscribe</h3>
            <p className="mb-6 max-w-[220px] font-sans text-foreground">
              Sign up to our emails for VIP offers and new product news
            </p>
            <form className="mt-[11px] flex">
              <input
                type="email"
                placeholder="Your email"
                className="h-[42px] rounded-[2px] border border-border bg-background px-4 font-sans text-foreground outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="ml-[10px] h-[42px] w-[52px] bg-primary font-accent text-[14px] uppercase tracking-[1px] text-primary-foreground"
              >
                Ok
              </button>
            </form>

            <ul className="mt-[38.5px] flex items-center">
              {PAYMENT_ICONS.map((icon) => (
                <li key={icon} className="mr-2">
                  <Image src={icon} alt="" width={38} height={24} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
