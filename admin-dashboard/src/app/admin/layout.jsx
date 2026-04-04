"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authApi } from "@/lib/api";
import { FRONTEND_URLS } from "@/lib/config";
import {
  IconDashboard, IconCalendar, IconWeekly, IconHome, IconUsers,
  IconEye, IconSettings, IconLogout, IconGift, IconChevronDown,
} from "@/components/Icons";

// ─── Sidebar Menu Config ──────────────────────────────────

const MENU_ITEMS = [
  { type: "section", label: "Menu" },
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/admin/monthly", label: "Lomba Bulanan", icon: IconCalendar },
  { href: "/admin/weekly", label: "Lomba Mingguan", icon: IconWeekly },
  {
    label: "Hadiah", icon: IconGift,
    children: [
      { href: "/admin/prizes/monthly", label: "Hadiah Bulanan" },
      { href: "/admin/prizes/weekly", label: "Hadiah Mingguan" },
    ],
  },
  { type: "section", label: "Pengaturan" },
  { href: "/admin/homepage", label: "Home Page", icon: IconHome },
  { href: "/admin/theme", label: "Theme Settings", icon: IconSettings },
  { href: "/admin/users", label: "Kelola Akun", icon: IconUsers },
  { type: "section", label: "Preview" },
  { href: FRONTEND_URLS.bulanan, label: "Bulanan", icon: IconEye, external: true },
  { href: FRONTEND_URLS.mingguan, label: "Mingguan", icon: IconEye, external: true },
];

// ─── Sidebar Nav Item ─────────────────────────────────────

function NavItem({ item, pathname, closeSidebar }) {
  const Icon = item.icon;
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const cls = active
    ? "bg-sidebar-active-bg text-brand font-medium"
    : "text-text-muted hover:bg-sidebar-hover hover:text-text-primary";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm no-underline transition-colors ${cls}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span>{item.label}</span>
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={closeSidebar}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm no-underline transition-colors ${cls}`}>
      <Icon className={`w-5 h-5 shrink-0 ${active ? "text-brand" : ""}`} />
      <span>{item.label}</span>
    </Link>
  );
}

// ─── Sidebar Dropdown ─────────────────────────────────────

function NavDropdown({ item, pathname, closeSidebar }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const childActive = item.children.some((c) => pathname.startsWith(c.href));

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const parentCls = childActive
    ? "bg-sidebar-active-bg text-brand font-medium"
    : "text-text-muted hover:bg-sidebar-hover hover:text-text-primary";

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors bg-transparent ${parentCls}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 shrink-0 ${childActive ? "text-brand" : ""}`} />
          <span>{item.label}</span>
        </div>
        <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-0.5">
          {item.children.map((child) => {
            const cActive = pathname === child.href;
            return (
              <Link key={child.href} href={child.href} onClick={closeSidebar}
                className={`block px-3 py-2 rounded-lg text-[0.8rem] no-underline transition-colors ${
                  cActive ? "text-brand bg-brand-muted" : "text-text-muted hover:text-text-primary hover:bg-sidebar-hover"
                }`}>
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Header Profile Dropdown ──────────────────────────────

function HeaderProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0">
        <div className="w-9 h-9 rounded-full bg-brand-muted flex items-center justify-center overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-brand font-semibold text-sm">{user.username?.[0]?.toUpperCase() || "A"}</span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-white m-0 leading-tight">{user.username}</p>
          <p className="text-[0.65rem] text-text-muted m-0">{user.email || "Admin"}</p>
        </div>
        <IconChevronDown className={`w-4 h-4 text-text-muted hidden md:block transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-popup-bg border border-popup-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-popup-border">
            <p className="text-sm font-medium text-text-white m-0">{user.username}</p>
            <p className="text-xs text-text-muted m-0">{user.email || "admin"}</p>
          </div>
          <Link href="/admin/profile" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm no-underline text-popup-text hover:bg-white/5 transition-colors">
            <IconSettings className="w-4 h-4" /> Profil Saya
          </Link>
          <Link href="/admin/theme" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm no-underline text-popup-text hover:bg-white/5 transition-colors">
            <IconSettings className="w-4 h-4" /> Theme Settings
          </Link>
          <div className="border-t border-popup-border">
            <button onClick={onLogout}
              className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-400 bg-transparent border-none cursor-pointer hover:bg-white/5 transition-colors">
              <IconLogout className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.me();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setAuthChecked(true);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  if (!authChecked || !user) {
    return (
      <div className="flex min-h-screen bg-main-bg items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <p className="text-xs text-text-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    router.replace("/login");
  }

  const closeSidebar = () => setSidebarOpen(false);

  // Build page title from path
  const pathSegments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const pageTitle = pathSegments.length === 0 ? "Dashboard" :
    pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);

  return (
    <div className="flex min-h-screen bg-main-bg">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs" onClick={closeSidebar} />
      )}

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar-bg border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Link href="/admin" className="no-underline">
            <div className="flex gap-3 mb-2">
              <svg viewBox="0 0 1024 1024" className="icon w-7 h-7" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M469.572424 567.833954c-10.976147-6.337475-27.610249-7.026433-37.11882-1.53836L122.346765 745.339871c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.463521z" fill="#4762AF"></path><path d="M453.301677 881.79141c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 903.677641c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 925.563871c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 627.905475s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198-109.303742-63.563502zM907.273438 699.986581v127.395981l-80.225917 46.660424-41.34695-98.26153 121.572867-75.794875z" fill="#4762AF"></path><path d="M469.572424 440.400221c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 617.901419c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521z" fill="#6D8ACA"></path><path d="M511.443171 825.155244s48.736737 34.849032 78.069382 18.64435c29.332645-16.209401 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.637198v52.856332z" fill="#5D7BC1"></path><path d="M199.175078 592.008848v52.856332l312.423816 180.379723V772.388571l-312.423816-180.379723z" fill="#5D7BC1"></path><path d="M373.3353 846.55071c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 710.934415c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729l207.782341 119.959005c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M469.572424 567.833954c-10.976147-6.337475-27.610249-7.026433-37.11882-1.53836L122.346765 745.339871c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.463521z" fill="#4762AF"></path><path d="M453.301677 881.79141c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 903.677641c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 925.563871c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 627.905475s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198-109.303742-63.563502zM907.273438 699.986581v127.395981l-80.225917 46.660424-41.34695-98.26153 121.572867-75.794875z" fill="#4762AF"></path><path d="M469.572424 440.400221c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 617.901419c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521z" fill="#6D8ACA"></path><path d="M511.443171 825.155244s48.736737 34.849032 78.069382 18.64435c29.332645-16.209401 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.637198v52.856332z" fill="#5D7BC1"></path><path d="M199.175078 592.008848v52.856332l312.423816 180.379723V772.388571l-312.423816-180.379723z" fill="#5D7BC1"></path><path d="M373.3353 846.55071c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 710.934415c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729l207.782341 119.959005c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M469.572424 350.259908c-10.976147-6.342194-27.610249-7.031152-37.11882-1.543079L122.346765 527.761106c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.458802z" fill="#4762AF"></path><path d="M453.301677 664.212645c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 686.098876c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 707.985106c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 410.32671s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198L116.004571 410.32671zM907.273438 482.412535v127.391262l-80.225917 46.660424-41.34695-98.26153 121.572867-75.790156z" fill="#4762AF"></path><path d="M469.572424 222.821456c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 400.322654c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521zM373.3353 628.971945c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 493.35565c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729L365.1433 635.163134c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M511.443171 607.897364s48.736737 34.853751 78.069382 18.64435c29.332645-16.204682 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.641917v52.851613z" fill="#5D7BC1"></path><path d="M199.175078 374.755687v52.856331l312.423816 180.379724v-52.856332L199.175078 374.755687z" fill="#5D7BC1"></path><path d="M469.572424 132.681143c-10.976147-6.342194-27.610249-7.031152-37.11882-1.543078L122.346765 310.182341c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.031152 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.458802z" fill="#4762AF"></path><path d="M453.301677 446.63388c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 468.520111c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 490.406341c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 192.747945s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198L116.004571 192.747945zM907.273438 264.83377v127.391262l-80.225917 46.660424-41.34695-98.26153 121.572867-75.790156z" fill="#4762AF"></path><path d="M469.572424 5.242691C458.596276-1.094783 441.962175-1.783742 432.453604 3.704332L122.346765 182.743889c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217L469.572424 5.242691zM373.3353 411.39318c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 275.776885c-4.5207-2.614267-8.192 0.165161-8.192 6.191189 0 6.030747 3.6713 13.047742 8.192 15.65729l207.782341 119.963724c4.5207 2.609548 8.192-0.165161 8.192-6.195908z" fill="#6D8ACA"></path></g></svg>
              <h2 className="text-lg font-bold text-text-white">Klasemen Devs</h2>
            </div>
          </Link>
          {/* Mobile close */}
          <button onClick={closeSidebar} className="lg:hidden ml-auto bg-transparent border-none cursor-pointer text-text-muted p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item, i) => {
            if (item.type === "section") {
              return (
                <p key={i} className="text-[0.65rem] uppercase tracking-widest font-medium text-sidebar-section px-4 pt-4 pb-2 m-0">
                  {item.label}
                </p>
              );
            }
            if (item.children) {
              return <NavDropdown key={item.label} item={item} pathname={pathname} closeSidebar={closeSidebar} />;
            }
            return <NavItem key={item.href} item={item} pathname={pathname} closeSidebar={closeSidebar} />;
          })}
        </nav>
      </aside>

      {/* ─── Main Area ───────────────────────────────────── */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-header-bg border-b border-header-border flex items-center px-4 lg:px-8 gap-4 shrink-0">
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden bg-transparent border-none cursor-pointer text-text-muted p-1.5 -ml-1.5 rounded-lg hover:bg-sidebar-hover">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin" className="text-text-muted no-underline hover:text-text-primary transition-colors">Dashboard</Link>
            {pathSegments.length > 0 && (
              <>
                <span className="text-text-muted">/</span>
                <span className="text-text-primary font-medium capitalize">{pathSegments[0]}</span>
              </>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Profile */}
          <HeaderProfileDropdown user={user} onLogout={handleLogout} />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
