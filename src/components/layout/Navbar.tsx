"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  PencilSquareIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ActiveUsers } from "@/components/ui/ActiveUsers";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "❤ Donate" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 h-16 sm:h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition"
        >
          <Image
            src="/logo-light.png"
            alt="nextLesson"
            width={32}
            height={32}
            priority
            className="object-contain rounded-md"
          />

          <span className="font-semibold text-base sm:text-xl text-gray-900">
            nextLesson
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === link.href
                  ? "text-brand-600 font-medium bg-brand-50"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ActiveUsers />

          {session ? (
            <>
              <Link href="/write" className="btn-primary hidden sm:inline-flex">
                <PencilSquareIcon className="w-4 h-4" />
                <span>Write</span>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={36}
                      height={36}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <UserCircleIcon className="w-9 h-9 text-gray-500" />
                  )}

                  <span className="text-sm text-gray-700 hidden md:block max-w-[100px] truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50"
                  >
                    <Link
                      href={`/profile/${session.user?.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </Link>

                    <div className="sm:hidden">
                      <hr className="my-1 border-gray-100" />

                      <Link
                        href="/write"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Write
                      </Link>

                      <Link
                        href="/contact"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Contact
                      </Link>

                      <Link
                        href="/donate"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        ❤ Donate
                      </Link>
                    </div>

                    <hr className="my-1 border-gray-100" />

                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="sm:hidden btn-ghost p-1.5"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>

              <Link
                href="/auth/signin"
                className="btn-primary hidden sm:inline-flex"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen && !session && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-gray-700 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/auth/signin"
            className="block py-2 text-sm font-medium text-brand-600"
          >
            Sign In →
          </Link>
        </div>
      )}
    </nav>
  );
}
