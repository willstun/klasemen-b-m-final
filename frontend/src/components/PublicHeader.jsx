"use client";
import Link from "next/link";
import { getImageUrl } from "@/lib/config";

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12L12 3L22 12H19V20H14V15H10V20H5V12H2Z" />
    </svg>
  );
}

function IconWhatsapp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.014 8.006C6.128 7.102 7.303 5.874 8.235 6.01C9.14 6.181 9.859 7.743 10.264 8.445C10.55 8.954 10.364 9.47 10.097 9.688C9.736 9.979 9.171 10.38 9.289 10.783C9.5 11.5 12 14 13.23 14.711C13.695 14.98 14.033 14.27 14.321 13.907C14.53 13.627 15.047 13.46 15.555 13.736C16.314 14.178 17.029 14.692 17.69 15.27C18.02 15.546 18.098 15.954 17.869 16.385C17.466 17.144 16.3 18.146 15.454 17.942C13.976 17.587 8 15.27 6.08 8.558C5.972 8.24 6 8.12 6.014 8.006Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.776 23 10.099 22.869 9 22.5L6.894 23.553C5.565 24.218 4 23.251 4 21.764V19.5C1.847 17.492 1 15.177 1 12C1 5.925 5.925 1 12 1C18.075 1 23 5.925 23 12C23 18.075 18.075 23 12 23ZM6 18.63L5.364 18.037C3.691 16.477 3 14.733 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21C11.014 21 10.552 20.911 9.636 20.604L8.848 20.34L6 21.764V18.63Z" />
    </svg>
  );
}

function IconTelegram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.112 4.494C23.43 2.945 21.907 1.657 20.432 2.227L2.343 9.216C0.695 9.853 0.621 12.157 2.225 12.898L6.165 14.716L8.038 21.275C8.136 21.615 8.406 21.879 8.749 21.968C9.092 22.057 9.457 21.958 9.707 21.707L12.594 18.82L16.638 21.853C17.811 22.733 19.502 22.092 19.797 20.655L23.112 4.494ZM3.063 11.082L21.153 4.093L17.838 20.253L13.1 16.7C12.702 16.401 12.145 16.441 11.793 16.793L10.557 18.029L10.928 15.986L18.207 8.707C18.561 8.353 18.599 7.791 18.295 7.393C17.991 6.995 17.439 6.883 17.004 7.132L6.951 12.876L3.063 11.082ZM8.177 14.479L8.783 16.602L9.016 15.321C9.053 15.121 9.149 14.937 9.293 14.793L11.513 12.573L8.177 14.479Z" />
    </svg>
  );
}

function NavLink({ item }) {
  const cls = "text-text-primary text-xs lg:text-sm font-medium no-underline hover:text-gold transition-colors";
  if (item.external) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{item.label}</a>;
  }
  return <Link href={item.href} className={cls}>{item.label}</Link>;
}

function MobileNavLink({ item }) {
  const Icon = item.icon;
  const cls = "flex flex-col items-center gap-0.5 no-underline min-w-16";
  const content = (
    <>
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{item.label}</span>
    </>
  );
  if (item.external) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{content}</a>;
  }
  return <Link href={item.href} className={cls}>{content}</Link>;
}

export default function PublicHeader({ settings, homeHref = "/" }) {
  const s = settings || {};

  const navItems = [
    { href: homeHref, label: "Home", icon: IconHome },
    ...(s.whatsappLink ? [{ href: s.whatsappLink, label: "Whatsapp", icon: IconWhatsapp, external: true }] : []),
    ...(s.telegramLink ? [{ href: s.telegramLink, label: "Telegram", icon: IconTelegram, external: true }] : []),
  ];

  const mobileNavItems = [
    ...(s.whatsappLink ? [{ href: s.whatsappLink, label: "Whatsapp", icon: IconWhatsapp, external: true }] : []),
    { href: homeHref, label: "Home", icon: IconHome },
    ...(s.telegramLink ? [{ href: s.telegramLink, label: "Telegram", icon: IconTelegram, external: true }] : []),
  ];

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-9999 flex items-center py-2 lg:py-4 px-5 lg:px-0">
        <div className="max-w-248.5 mx-auto px-4 lg:px-10 py-1.5 lg:py-2 w-full flex items-center justify-center md:justify-between bg-blur/15 rounded-full backdrop-blur-xs border border-blur/50 lg:border-2">
          <Link href={homeHref} className="no-underline">
            {s.logoUrl ? (
              <img src={getImageUrl(s.logoUrl)} alt="Logo" className="w-20 h-auto lg:w-30" />
            ) : (
              <span className="text-gold font-bold text-sm lg:text-lg">KLASEMEN LOMBA</span>
            )}
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navItems.map((item) => <NavLink key={item.label} item={item} />)}
          </nav>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-9999 mx-5 mb-4">
        <div className="flex items-center justify-around py-2 px-5 bg-blur/15 rounded-full backdrop-blur-xs border border-blur/50">
          {mobileNavItems.map((item) => <MobileNavLink key={item.label} item={item} />)}
        </div>
      </nav>
    </>
  );
}