'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthStatus,
  useAuthStore,
  useIsAuthenticated,
} from '@/features/auth/model/auth.store';
import { logout } from '@/features/auth/api/auth.api';
import { AnimatePresence, m } from 'framer-motion';
import { dropdownMotion } from '@/shared/lib/motion';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { CrossIcon } from '@/shared/ui/icons/CrossIcon';
import { useCartCount } from '@/entities/cart/model/cart.store';
import { useFlyToCartStore } from '@/features/cart/model/fly-to-cart.store';
import { SearchOverlay } from '@/features/search/ui/SearchOverlay';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { PersonIcon } from '@/shared/ui/icons/PersonIcon';
import styles from './Header.module.scss';

type MenuNode = { label: string; href?: string; children?: MenuNode[] };

const MENU: MenuNode[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop beauty',
    href: '/collection',
    children: [
      {
        label: 'Shop by type',
        href: '/collection',
        children: [
          { label: 'Shop all', href: '/collection' },
          { label: 'Skin care', href: '/collection?category=skin-care' },
          { label: 'Make up', href: '/collection?category=make-up' },
          { label: 'Hair care', href: '/collection?category=hair-care' },
          { label: 'Fragrance', href: '/collection?category=fragrance' },
          { label: 'Body care', href: '/collection?category=body-care' },
        ],
      },
      {
        label: 'Shop the edit',
        href: '/collection?sort=popular',
        children: [
          { label: 'Home beauty essentials', href: '/collection?category=body-care&sort=popular' },
          { label: 'Skincare super sellers', href: '/collection?category=skin-care&sort=popular' },
        ],
      },
      {
        label: 'Sale',
        href: '/collection?sale=1',
        children: [
          { label: 'Final reductions', href: '/collection?sale=1&sort=price_asc' },
          { label: 'Fragrance sale', href: '/collection?category=fragrance&sale=1' },
        ],
      },
      { label: 'Our picks', href: '/collection?sort=popular' },
      { label: 'Gift cards', href: '/gift-cards' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'About us', href: '/about' },
  { label: 'Sale', href: '/collection?sale=1' },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const COMPACT_COLLAPSE_AT = 84;
const COMPACT_EXPAND_AT = 56;
const headerLayout = { layout: 'position' as const, transition: { duration: 0.35, ease: EASE } };

const megaMenu = {
  panel: {
    hidden: { opacity: 0, transition: { duration: 0.15, when: 'afterChildren' as const } },
    visible: {
      opacity: 1,
      transition: { duration: 0.15, ease: EASE, when: 'beforeChildren' as const, delayChildren: 0.12, staggerChildren: 0.03 },
    },
  },
  divider: {
    hidden: { scaleY: 0, transition: { duration: 0.15 } },
    visible: { scaleY: 1, transition: { duration: 0.4, ease: EASE, delay: 0 } },
  },
  item: {
    hidden: { opacity: 0, y: -14, transition: { duration: 0.1 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  },
};

function Chevron({ className }: { className?: string }) {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className={className} aria-hidden>
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none" aria-hidden>
      <path d="M1 1h28M1 11h28M1 21h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.account} ref={ref}>
      <button
        type="button"
        className={styles.accountBtn}
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <PersonIcon className="h-5 w-5" />
        <Image src="/arrow_down.svg" alt="" width={10} height={6} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div className={styles.accountMenu} role="menu" {...dropdownMotion()}>
            <Link href="/profile" role="menuitem" className={styles.accountItem} onClick={() => setOpen(false)}>
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              className={styles.accountItem}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartButton() {
  const count = useCartCount();
  const setTarget = useFlyToCartStore((s) => s.setTarget);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTarget(ref.current);
    return () => setTarget(null);
  }, [setTarget]);

  return (
    <button type="button" className={styles.cart} aria-label="Cart" ref={ref}>
      <Image src="/shopping_cart_icon.svg" alt="" width={22} height={20} />
      <AnimatePresence>
        {count > 0 && (
          <m.span
            key={count}
            className={styles.cartNum}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1.5, 1], opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {count}
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function Header() {
  const isAuthenticated = useIsAuthenticated();
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)');
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setCompact((prev) => {
        if (!desktop.matches) return false;
        return prev ? y > COMPACT_EXPAND_AT : y > COMPACT_COLLAPSE_AT;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    desktop.addEventListener('change', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      desktop.removeEventListener('change', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuPath([]);
  };

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clear();
      closeMenu();
      router.push('/');
    }
  };

  const shop = MENU[1];
  const picks = shop.children!.filter((n) => !n.children);
  const groups = shop.children!.filter((n) => n.children);

  const currentNode = menuPath.reduce<MenuNode | null>(
    (node, idx) => (node ? node.children![idx] : MENU[idx]) ?? null,
    null,
  );
  const currentList = currentNode ? currentNode.children! : MENU;

  const guestLinks = (
    <>
      <Link href="/login" className={styles.loginLink} onClick={closeMenu}>
        Login
      </Link>
      <span className={styles.slash}>/</span>
      <Link href="/register" className={styles.signupLink} onClick={closeMenu}>
        Sign up
      </Link>
    </>
  );

  const logging =
    status === AuthStatus.Idle ? (
      <>
        <span className={styles.idleAccount}>
          <Skeleton circle width={20} height={20} />
          <Skeleton width={10} height={6} />
        </span>
        <span className={styles.idleGuest}>{guestLinks}</span>
      </>
    ) : isAuthenticated ? (
      <AccountMenu onLogout={handleLogout} />
    ) : (
      guestLinks
    );

  const flag = (
    <>
      <Image src="/UAE_flag.png" alt="" width={28} height={20} className={styles.flagImg} />
      <span className={styles.flagTxt}>UAE</span>
    </>
  );

  const currency = (
    <div className={styles.disclosure} role="button" tabIndex={0}>
      <span>USD $</span>
      <Image src="/arrow_down.svg" alt="" width={10} height={6} />
    </div>
  );

  const trigger = (extra: string) => (
    <button
      type="button"
      className={`${styles.trigger} ${extra}`}
      aria-label="Open menu"
      aria-expanded={menuOpen}
      onClick={() => setMenuOpen(true)}
    >
      <BurgerIcon />
    </button>
  );

  return (
    <header
      className={compact ? `${styles.root} ${styles.compact}` : styles.root}
      data-compact={compact || undefined}
      onMouseLeave={() => setShopOpen(false)}
    >
      <div className={styles.top}>
        {trigger(styles.triggerTop)}

        <m.div className={styles.left} {...headerLayout}>
          {currency}
          <m.button
            type="button"
            className={styles.search}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            {...headerLayout}
          >
            <Image src="/search_icon.svg" alt="" width={21} height={21} />
          </m.button>
          <m.div className={styles.themeSlot} {...headerLayout}>
            <ThemeToggle />
          </m.div>
        </m.div>

        <m.div className={styles.center} {...headerLayout}>
          <Link href="/" className={styles.logo}>
            <Image src="/main_logo.png" alt="Beauty store" width={144} height={35} priority />
          </Link>
        </m.div>

        <nav className={styles.nav} aria-label="Main">
          <m.ul className={styles.menu} {...headerLayout}>
            {MENU.map((item) => (
              <li
                key={item.label}
                className={styles.menuItem}
                onMouseEnter={() => setShopOpen(Boolean(item.children))}
              >
                {item.children ? (
                  <span className={styles.link} aria-haspopup="true" aria-expanded={shopOpen}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href ?? '/'} className={styles.link}>
                    {item.label}
                  </Link>
                )}
                {item.children && (
                  <Image src="/arrow_down.svg" alt="" width={10} height={6} className={styles.menuArrow} />
                )}
              </li>
            ))}
          </m.ul>
        </nav>

        <m.div className={styles.right} {...headerLayout}>
          <m.div className={styles.flag} {...headerLayout}>
            {flag}
          </m.div>
          <div className={styles.group}>
            <div className={styles.logging}>{logging}</div>
            <CartButton />
          </div>
        </m.div>
      </div>

      <div className={styles.bottom}>
        {trigger(styles.triggerBottom)}
        <div className={styles.loggingMobile}>{logging}</div>
        <div className={styles.flagMobile}>{flag}</div>
      </div>

      <AnimatePresence>
        {shopOpen && (
          <m.div
            className={styles.dropdown}
            variants={megaMenu.panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
          <nav className={styles.dropdownWrap} aria-label="Shop beauty">
            <div className={`${styles.dropdownItem} ${styles.dropdownItemPicks}`}>
              <ul className={`${styles.dropdownList} ${styles.dropdownListPicks}`}>
                <m.span className={styles.dropdownDivider} variants={megaMenu.divider} aria-hidden />
                {picks.map((n) => (
                  <m.li key={n.label} variants={megaMenu.item}>
                    <Link href={n.href ?? '/'} className={styles.dropdownHeading} onClick={() => setShopOpen(false)}>
                      {n.label}
                    </Link>
                  </m.li>
                ))}
              </ul>
            </div>
            {groups.map((g, i) => (
              <div
                key={g.label}
                className={`${styles.dropdownItem} ${i === 0 ? styles.dropdownItemSecond : ''}`}
              >
                <m.div variants={megaMenu.item}>
                  <Link href={g.href ?? '/'} className={styles.dropdownHeading} onClick={() => setShopOpen(false)}>
                    {g.label}
                  </Link>
                </m.div>
                <ul className={styles.dropdownList}>
                  {g.children!.map((n) => (
                    <m.li key={n.label} variants={megaMenu.item}>
                      <Link href={n.href ?? '/'} className={styles.dropdownSmall} onClick={() => setShopOpen(false)}>
                        {n.label}
                      </Link>
                    </m.li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          </m.div>
        )}
      </AnimatePresence>

      <div className={styles.searchRow}>
        <button type="button" className={styles.search} aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Image src="/search_icon.svg" alt="" width={21} height={21} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelTop}>
              <button
                type="button"
                className={styles.panelTopLink}
                onClick={() => {
                  closeMenu();
                  setSearchOpen(true);
                }}
              >
                Search
              </button>
              <Link
                href={isAuthenticated ? '/profile' : '/login'}
                className={styles.panelTopLink}
                onClick={closeMenu}
              >
                {isAuthenticated ? 'View account' : 'Login'}
              </Link>
            </div>

            <ul className={styles.panelList}>
              {currentNode && (
                <>
                  <li>
                    <button
                      type="button"
                      className={styles.panelLink}
                      onClick={() => setMenuPath((p) => p.slice(0, -1))}
                    >
                      back
                      <Chevron className={`${styles.chev} ${styles.chevBack}`} />
                    </button>
                  </li>
                  <li>
                    <Link href={currentNode.href ?? '/'} className={styles.panelLink} onClick={closeMenu}>
                      {currentNode.label}
                    </Link>
                  </li>
                </>
              )}
              {currentList.map((node, idx) => (
                <li key={node.label}>
                  {node.children ? (
                    <button
                      type="button"
                      className={styles.panelLink}
                      onClick={() => setMenuPath((p) => [...p, idx])}
                    >
                      {node.label}
                      <Chevron className={styles.chev} />
                    </button>
                  ) : (
                    <Link href={node.href ?? '/'} className={styles.panelLink} onClick={closeMenu}>
                      {node.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className={styles.panelBottom}>
              {currency}
              <ThemeToggle />
            </div>
          </div>

          <button type="button" className={styles.cross} aria-label="Close menu" onClick={closeMenu}>
            <CrossIcon />
          </button>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
