"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const initial = (
    user.firstName?.[0] ??
    user.emailAddresses[0]?.emailAddress[0] ??
    "?"
  ).toUpperCase();

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.emailAddresses[0]?.emailAddress ||
    "User";

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={open}
        className={`w-7 h-7 flex items-center justify-center font-black text-[0.7rem] text-black bg-brand-500 border-2 transition-colors overflow-hidden ${
          open ? "border-brand-500" : "border-transparent hover:border-brand-500"
        }`}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] w-56 border-2 border-[#2A2A2A] bg-[#0A0A0A] z-50 shadow-none">
          {/* Identity */}
          <div className="border-b-2 border-[#1A1A1A] px-4 py-3">
            <p className="text-[0.75rem] font-black uppercase tracking-wide text-[#EEEEEE] truncate">
              {displayName}
            </p>
            <p className="text-[0.65rem] text-[#444] mt-0.5 truncate font-normal normal-case tracking-normal">
              {email}
            </p>
          </div>

          {/* Nav links */}
          <div className="p-1">
            {[
              { href: "/select-role", label: "Practice" },
              { href: "/dashboard", label: "Dashboard" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-[#555] hover:text-[#EEEEEE] hover:bg-[#141414] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <div className="border-t-2 border-[#1A1A1A] p-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ redirectUrl: "/" });
              }}
              className="flex items-center w-full px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-[#444] hover:text-red-400 hover:bg-[#141414] transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/select-role", label: "Practice" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="border-b-2 border-[#1A1A1A] bg-[#060606] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link href="/select-role" className="font-black text-sm tracking-tight uppercase">
          Interview<span className="text-brand-500">OS</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`btn-ghost text-[0.7rem] ${
                pathname.startsWith(link.href) ? "text-[#EEEEEE] border-[#222]" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <UserMenu />
      </div>
    </nav>
  );
}
