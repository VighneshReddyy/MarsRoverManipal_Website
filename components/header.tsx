"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "Home", href: "/" },
  { label: "The Team", href: "/team" },
  { label: "Competition", href: "/competitions" },
  { label: "Alumni", href: "/alumni" },
  { label: "Research", href: "/research" },
  { label: "Sponsorships", href: "/sponsorship" },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <nav className="site-header-nav" aria-label="Main navigation">
        <Link href="/" className="site-header-brand">
          <img src="/logo.png" alt="MRM logo" />
          <span>Mars Rover Manipal</span>
        </Link>
        <ul className="site-header-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <button type="button" className="site-header-menu" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {menuOpen && (
        <div id="site-mobile-navigation" className="site-mobile-navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
