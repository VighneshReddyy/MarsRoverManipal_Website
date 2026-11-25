"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { label: "HOME", href: "/" },
    { label: "THE TEAM", href: "/team" },
    { label: "COMPETITIONS", href: "/competitions" },
    { label: "ALUMNI", href: "/alumni" },
    { label: "RESEARCH", href: "/research" },
    { label: "SPONSORSHIP", href: "/sponsorship" },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#") {
      e.preventDefault()
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 md:p-8 pointer-events-auto">
      <nav className="flex items-center justify-center">
        <div className="flex gap-4 md:gap-6 lg:gap-8 flex-wrap justify-center pointer-events-auto bg-[#06040a]/70 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-800/80 shadow-lg">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`transition-colors duration-300 uppercase text-xs md:text-sm font-medium tracking-wide cursor-pointer ${
                  isActive
                    ? "text-[#ff8a4c] font-semibold"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
