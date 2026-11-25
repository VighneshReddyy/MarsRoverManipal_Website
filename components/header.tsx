"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "HOME", href: "/" },
  { label: "THE TEAM", href: "/team" },
  { label: "COMPETITIONS", href: "/competitions" },
  { label: "ALUMNI", href: "/alumni" },
  { label: "RESEARCH", href: "/research" },
  { label: "SPONSORSHIP", href: "/sponsorship" },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-3 py-4 md:p-8">
      <nav aria-label="Main navigation" className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-1.5 rounded-[1.5rem] border border-neutral-800/80 bg-[#06040a]/70 p-2 shadow-lg backdrop-blur-md md:gap-2 md:rounded-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`liquid-nav-link ${isActive ? "liquid-nav-link-active" : ""}`}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
