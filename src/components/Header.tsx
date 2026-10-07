'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { LimeButton } from './LimeButton';
import { Icon } from './Icon';
import { site } from '@/lib/site';
import { useTranslations, localizePath, parsePath } from '@/i18n/ui';

/**
 * Site header. Derives lang/path from the current URL itself (usePathname),
 * so no props are needed. Internal links are plain <a> tags on purpose: every
 * navigation is a full page load, matching the previous Astro MPA exactly,
 * which is what the reveal/lake-water/motion scripts assume.
 */
export function Header() {
  const pathname = usePathname();
  const { lang, path } = parsePath(pathname);
  const overlay = path === '/';
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);

  const nav = [
    { href: '/about', label: t('nav.about') },
    { href: '/speakers', label: t('nav.speakers') },
    { href: '/visit', label: t('nav.visit') },
  ];
  const more = [
    { href: '/get-involved', label: t('nav.involved') },
    { href: '/youth', label: t('nav.youth') },
    { href: '/partners', label: t('nav.partners') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
  ];
  // Malayalam labels are longer, so the full nav needs more room.
  const wide = lang === 'ml';
  const isCurrent = (href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));

  const headerRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!header) return undefined;

    let cleanupScroll: (() => void) | undefined;
    if (header.hasAttribute('data-overlay')) {
      const solid = () => header.toggleAttribute('data-solid', window.scrollY > 24);
      solid();
      window.addEventListener('scroll', solid, { passive: true });
      cleanupScroll = () => window.removeEventListener('scroll', solid);
    }

    let cleanupMenu: (() => void) | undefined;
    if (header && btn && menu) {
      const set = (open: boolean) => {
        btn.setAttribute('aria-expanded', String(open));
        menu.toggleAttribute('data-open', open);
        header.toggleAttribute('data-menu-open', open);
        btn.querySelector('.menu-icon')?.classList.toggle('hidden', open);
        btn.querySelector('.close-icon')?.classList.toggle('hidden', !open);
        btn.querySelector('[data-open-label]')?.classList.toggle('hidden', open);
        btn.querySelector('[data-close-label]')?.classList.toggle('hidden', !open);
        document.documentElement.classList.toggle('overflow-hidden', open);
        if (open) setTimeout(() => menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true }), 250);
      };
      const onBtnClick = () => set(btn.getAttribute('aria-expanded') !== 'true');
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
          set(false);
          btn.focus();
        }
      };
      const onMenuClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('a')) set(false);
      };
      const mq = matchMedia(menu.hasAttribute('data-wide') ? '(min-width: 1280px)' : '(min-width: 1024px)');
      const onMqChange = (e: MediaQueryListEvent) => e.matches && set(false);

      btn.addEventListener('click', onBtnClick);
      document.addEventListener('keydown', onKeydown);
      menu.addEventListener('click', onMenuClick);
      mq.addEventListener('change', onMqChange);
      cleanupMenu = () => {
        btn.removeEventListener('click', onBtnClick);
        document.removeEventListener('keydown', onKeydown);
        menu.removeEventListener('click', onMenuClick);
        mq.removeEventListener('change', onMqChange);
      };
    }

    return () => {
      cleanupScroll?.();
      cleanupMenu?.();
    };
  }, []);

  return (
    <header ref={headerRef} className="site-header" data-header data-overlay={overlay ? '' : undefined}>
      <div className="bar">
        <div className="flex h-[var(--hh)] w-full px-4 md:px-6 items-center justify-between gap-4">
          <a href={lp('/')} className="-ml-1 flex min-h-11 items-center gap-3.5 px-1">
            {/* No `src`: Header is a Client Component, so it can't resolve a real
                logo file off disk (see the note in Logo.tsx) — it always gets the
                inline SVG stand-in. Deliberate simplification. */}
            <Logo decorative className="h-9 lg:h-10" />
            <span
              className={`desc hidden whitespace-nowrap text-[0.62rem] font-bold uppercase leading-[1.45] tracking-[0.14em] ${wide ? '2xl:block' : 'xl:block'}`}
              lang="en"
            >
              Kollam International
              <br />
              Literature Festival
            </span>
            <span className="sr-only">KILF 2027 — {t('nav.home')}</span>
          </a>

          <nav aria-label={t('nav.primary')} className={`hidden ${wide ? 'xl:block' : 'lg:block'}`}>
            <ul className="flex items-center gap-0.5 xl:gap-1.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={lp(item.href)} aria-current={isCurrent(item.href) ? 'page' : undefined} className="nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:contents">
              <LimeButton href={lp('/get-involved#register')} label={t('cta.register')} size="sm" className="hdr-cta min-w-[8.5rem] justify-between !gap-6" />
            </span>
            <button
              ref={btnRef}
              type="button"
              className={`menu-btn inline-grid size-11 place-items-center ring-1 ring-inset ${wide ? 'xl:hidden' : 'lg:hidden'}`}
              aria-controls="mobile-menu"
              aria-expanded="false"
              data-menu-toggle
            >
              <span className="sr-only" data-open-label>
                {t('nav.menu')}
              </span>
              <span className="sr-only hidden" data-close-label>
                {t('nav.close')}
              </span>
              <Icon name="menu" size={22} className="menu-icon" />
              <Icon name="close" size={22} className="close-icon hidden" />
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`menu on-dark ${wide ? 'xl:hidden' : 'lg:hidden'}`}
        data-menu
        data-wide={wide ? '' : undefined}
      >
        <nav aria-label={t('nav.primary')} className="container-kilf flex min-h-full flex-col pb-10 pt-[calc(var(--hh)+1.25rem)]">
          <div style={{ '--i': 0 } as React.CSSProperties}>
            <LimeButton href={lp('/get-involved#register')} label={t('cta.register')} className="w-full" />
          </div>
          <ul className="mt-6 flex-1">
            {[...nav, ...more].map((item, i) => (
              <li key={item.href} style={{ '--i': i + 1 } as React.CSSProperties}>
                <a
                  href={lp(item.href)}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className="menu-link flex min-h-12 items-center justify-between border-b border-white/15 py-2.5 font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-white aria-[current=page]:text-lime"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-[1.05rem] text-lime">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${site.email}`} className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 text-sm text-mist">
            <Icon name="mail" size={18} className="text-lime" />
            {site.email}
          </a>
        </nav>
      </div>

      <style jsx>{`
        .site-header {
          --fg: var(--color-navy);
          --bg: color-mix(in oklab, var(--color-cream) 93%, transparent);
          --edge: var(--color-line);
          position: sticky;
          top: 0;
          z-index: 50;
          color: var(--fg);
        }
        .site-header[data-overlay] {
          position: fixed;
          inset-inline: 0;
        }
        /* Over the hero illustration: no bar, the sky shows through */
        :global(.has-js) .site-header[data-overlay]:not([data-solid]) {
          --bg: transparent;
          --edge: transparent;
        }
        .site-header[data-menu-open] {
          --fg: #fff;
          --bg: transparent;
          --edge: rgb(255 255 255 / 0.16);
        }
        .bar {
          position: relative;
          z-index: 2;
          background: var(--bg);
          border-bottom: 1px solid var(--edge);
          backdrop-filter: blur(14px) saturate(1.3);
          -webkit-backdrop-filter: blur(14px) saturate(1.3);
          transition: background-color 0.5s var(--ease-calm), border-color 0.5s var(--ease-calm), color 0.5s var(--ease-calm);
        }
        :global(.has-js) .site-header[data-overlay]:not([data-solid]) .bar,
        .site-header[data-menu-open] .bar {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        .nav-link {
          position: relative;
          display: inline-flex;
          min-height: 2.75rem;
          align-items: center;
          padding-inline: 0.7rem;
          font-size: 0.94rem;
          font-weight: 500;
          transition: opacity 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0.7rem;
          right: 0.7rem;
          bottom: 0.5rem;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s var(--ease-calm);
        }
        .nav-link:hover {
          opacity: 1;
        }
        .nav-link:hover::after,
        .nav-link[aria-current='page']::after {
          transform: scaleX(1);
        }
        .lang,
        .menu-btn {
          --tw-ring-color: color-mix(in oklab, currentColor 35%, transparent);
        }
        /* Volunteer: an outline button in the header's own colour */
        .hdr-ghost {
          --tw-ring-color: color-mix(in oklab, currentColor 40%, transparent);
          --ring: currentColor;
        }
        .hdr-ghost:hover {
          background: color-mix(in oklab, currentColor 9%, transparent);
        }
        .site-header[data-menu-open] :global(.hdr-cta) {
          background: var(--color-lime);
          color: var(--color-ink);
        }
        .lang:hover,
        .menu-btn:hover {
          background: color-mix(in oklab, currentColor 8%, transparent);
        }

        /* Mobile menu opens like a ripple from the menu button */
        .menu {
          position: fixed;
          inset: 0;
          z-index: 1;
          overflow-y: auto;
          background: var(--color-footer);
          clip-path: circle(0% at calc(100% - 2.6rem) 2.1rem);
          visibility: hidden;
          transition: clip-path 0.7s var(--ease-calm), visibility 0s linear 0.7s;
        }
        .menu[data-open] {
          clip-path: circle(150% at calc(100% - 2.6rem) 2.1rem);
          visibility: visible;
          transition: clip-path 0.9s var(--ease-calm);
        }
        .menu li {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease, transform 0.6s var(--ease-calm);
        }
        .menu[data-open] li {
          opacity: 1;
          transform: none;
          transition-delay: calc(0.12s + var(--i) * 0.035s);
        }
      `}</style>
    </header>
  );
}
