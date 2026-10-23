'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useAuthStore,
  useIsAuthenticated,
} from '@/features/auth/model/auth.store';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { PersonIcon } from '@/shared/ui/icons/PersonIcon';
import styles from './Header.module.scss';

type MenuNode = { label: string; href?: string; children?: MenuNode[] };

const MENU: MenuNode[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop beauty',
    children: [
      {
        label: 'Shop by type',
        children: [
          { label: 'Shop all', href: '/' },
          { label: 'Skin care', href: '/' },
          { label: 'Make up', href: '/' },
          { label: 'Hair care', href: '/' },
        ],
      },
      {
        label: 'Shop the edit',
        children: [
          { label: 'Home beauty essentials', href: '/' },
          { label: 'Skincare Super Sellers', href: '/' },
        ],
      },
      {
        label: 'Sale',
        children: [
          { label: 'Final Reductions', href: '/' },
          { label: 'Fragrance sale', href: '/' },
        ],
      },
      { label: 'Our pics', href: '/' },
      { label: 'Gift cards', href: '/' },
    ],
  },
  { label: 'Blog', href: '/' },
  { label: 'About us', href: '/' },
  { label: 'Theme features', href: '/' },
];

const CART_COUNT_PLACEHOLDER = 2;

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

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M2 2l16 16M18 2L2 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
      {open && (
        <div className={styles.accountMenu} role="menu">
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
        </div>
      )}
    </div>
  );
}

export function Header() {
  const isAuthenticated = useIsAuthenticated();
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const handleLogout = () => {
    clear();
    closeMenu();
    router.push('/');
  };

  const shop = MENU[1];
  const picks = shop.children!.filter((n) => !n.children);
  const groups = shop.children!.filter((n) => n.children);

  const currentNode = menuPath.reduce<MenuNode | null>(
    (node, idx) => (node ? node.children![idx] : MENU[idx]) ?? null,
    null,
  );
  const currentList = currentNode ? currentNode.children! : MENU;

  const logging = isAuthenticated ? (
    <AccountMenu onLogout={handleLogout} />
  ) : (
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
    <header className={styles.root}>
      <div className={styles.top}>
        {trigger(styles.triggerTop)}

        <div className={styles.left}>
          {currency}
          <button type="button" className={styles.search} aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Image src="/search_icon.svg" alt="" width={21} height={21} />
          </button>
          <div className={styles.themeSlot}>
            <ThemeToggle />
          </div>
        </div>

        <div className={styles.center}>
          <Link href="/" className={styles.logo}>
            <Image src="/main_logo.png" alt="Beauty store" width={144} height={35} priority />
          </Link>
        </div>

        <div className={styles.right}>
          <div className={styles.flag}>{flag}</div>
          <div className={styles.group}>
            <div className={styles.logging}>{logging}</div>
            <button type="button" className={styles.cart} aria-label="Cart">
              <Image src="/shopping_cart_icon.svg" alt="" width={22} height={20} />
              {CART_COUNT_PLACEHOLDER > 0 && (
                <span className={styles.cartNum}>{CART_COUNT_PLACEHOLDER}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bottom} onMouseLeave={() => setShopOpen(false)}>
        {trigger(styles.triggerBottom)}
        <div className={styles.loggingMobile}>{logging}</div>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.menu}>
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
          </ul>
        </nav>

        <div className={styles.flagMobile}>{flag}</div>
      </div>

      {shopOpen && (
        <div className={styles.dropdown} onMouseLeave={() => setShopOpen(false)}>
          <nav className={styles.dropdownWrap} aria-label="Shop beauty">
            <div className={`${styles.dropdownItem} ${styles.dropdownItemPicks}`}>
              <ul className={`${styles.dropdownList} ${styles.dropdownListPicks}`}>
                {picks.map((n) => (
                  <li key={n.label}>
                    <Link href={n.href ?? '/'} className={styles.dropdownHeading}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {groups.map((g, i) => (
              <div
                key={g.label}
                className={`${styles.dropdownItem} ${i === 0 ? styles.dropdownItemSecond : ''}`}
              >
                <Link href={g.href ?? '/'} className={styles.dropdownHeading}>
                  {g.label}
                </Link>
                <ul className={styles.dropdownList}>
                  {g.children!.map((n) => (
                    <li key={n.label}>
                      <Link href={n.href ?? '/'} className={styles.dropdownSmall}>
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}

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

      {searchOpen && (
        <div className={styles.searchScreen} role="dialog" aria-label="Search">
          <div className={styles.searchBlock}>
            <input type="search" className={styles.searchInput} placeholder="Search" autoFocus />
            <button type="button" className={styles.searchClose} aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <CrossIcon />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
