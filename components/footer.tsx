"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Force reflow on mount to fix sticky positioning issues
    const forceReflow = () => {
      if (footerRef.current) {
        const currentOpacity = footerRef.current.style.opacity
        footerRef.current.style.opacity = '0'
        void footerRef.current.offsetHeight // Force reflow
        footerRef.current.style.opacity = currentOpacity || '1'
      }
    }
    
    // Initial reflow
    requestAnimationFrame(() => {
      forceReflow()
      setTimeout(forceReflow, 150)
    })
    
    // Handle window resize to recalculate positioning
    const handleResize = () => forceReflow()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      ref={footerRef}
      className="relative h-[420px] sm:h-[580px] lg:h-[720px] max-h-[720px] transition-opacity duration-200"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="relative h-[calc(100vh+420px)] sm:h-[calc(100vh+580px)] lg:h-[calc(100vh+720px)] -top-[100vh]">
        <div className="h-[420px] sm:h-[580px] lg:h-[720px] sticky top-[calc(100vh-420px)] sm:top-[calc(100vh-580px)] lg:top-[calc(100vh-720px)]">
          <div className="bg-[#06040a] border-t border-neutral-800/80 py-8 sm:py-12 px-6 sm:px-10 lg:px-16 h-full w-full flex flex-col justify-between text-neutral-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              {/* CONTACT US */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="mb-1 uppercase text-white text-xs sm:text-sm font-mono font-bold tracking-widest text-[#ff8a4c]">
                  CONTACT US
                </h3>
                <a
                  href="mailto:marsrovermanipal@gmail.com"
                  className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                >
                  <Mail className="w-4 h-4 text-[#ff8a4c]" />
                  marsrovermanipal@gmail.com
                </a>
                <div className="flex flex-col gap-2.5 text-neutral-300 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>Sanjana Puranik (Team Lead)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>Sanchit (Team Manager)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>Dhruv Shankar Banerjee (Head of Operations)</span>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="mb-1 uppercase text-white text-xs sm:text-sm font-mono font-bold tracking-widest text-[#ff8a4c]">
                  HEADQUARTERS
                </h3>
                <a
                  href="https://maps.app.goo.gl/gqBbFr8yTVhM9Ccz7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-neutral-300 hover:text-white transition-colors text-xs sm:text-sm leading-relaxed"
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#ff8a4c]" />
                  <span>Mars Rover Manipal, MAHE Automobile Workshop, MIT, Manipal, Karnataka, India - 576104</span>
                </a>
              </div>

              {/* SOCIAL & QUICK LINKS */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="mb-1 uppercase text-white text-xs sm:text-sm font-mono font-bold tracking-widest text-[#ff8a4c]">
                  CONNECT
                </h3>
                <div className="flex flex-col gap-2 text-neutral-300 text-xs sm:text-sm">
                  <a 
                    href="https://in.linkedin.com/company/marsrovermanipal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#ff8a4c] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a 
                    href="https://www.instagram.com/marsrovermanipal/?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#ff8a4c] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                  <a 
                    href="https://www.youtube.com/channel/UCaK6pI3w9U-5bK9gO2K0tYw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#ff8a4c] transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
              <p>&copy; {new Date().getFullYear()} Mars Rover Manipal. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-neutral-300 transition-colors">Home</Link>
                <Link href="/team" className="hover:text-neutral-300 transition-colors">Team</Link>
                <Link href="/competitions" className="hover:text-neutral-300 transition-colors">Competitions</Link>
                <Link href="/alumni" className="hover:text-neutral-300 transition-colors">Alumni</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
