"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
      <Link href="/" className="font-[family-name:var(--font-display)] text-xl font-bold"
        style={{ background: "linear-gradient(135deg,#a78bfa,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Leo Lee
      </Link>
      <ul className="flex gap-8 list-none">
        {[
          { href: "/", label: "Portfolio" },
          { href: "/job-watch", label: "Job Watch" },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link href={href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: path === href ? "#a78bfa" : "#94a3b8" }}>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <a href="#contact" className="text-sm font-medium transition-colors duration-200"
            style={{ color: "#94a3b8" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#a78bfa")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}
