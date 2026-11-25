"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { TiltCard } from "@/components/ui/tilt-card"
import { motion, AnimatePresence } from "framer-motion"
import { Linkedin, Github, Users } from "lucide-react"
import rawAlumniData from "@/lib/alumni.json"

interface AlumniMember {
  id: number | string
  name: string
  img?: string
  pos?: string
  linkedin?: string
  github?: string
  domain?: string
  description?: string
  year: string
}

const alumniByYear: Record<string, AlumniMember[]> = rawAlumniData as Record<string, AlumniMember[]>

function convertImageUrl(url?: string): string {
  if (!url) return ""
  const trimmed = url.trim()
  const driveMatch = trimmed.match(/(?:\/d\/|\/file\/d\/|id=)([a-zA-Z0-9_-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`
  }
  if (!trimmed.startsWith("http") && !trimmed.startsWith("/")) {
    return `/${trimmed}`
  }
  return trimmed
}

export default function AlumniPage() {
  const years = useMemo(() => {
    return Object.keys(alumniByYear).sort((a, b) => Number(b) - Number(a))
  }, [])

  const [selectedYear, setSelectedYear] = useState<string>("2026")

  const displayedMembers = alumniByYear[selectedYear] || []


  return (
    <main className="bg-neutral-950 min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 md:px-12 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Our Alumni
          </h1>
        </motion.div>

        {/* Year Selector Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {years.map((year) => {
            const count = alumniByYear[year]?.length || 0
            const isSelected = selectedYear === year
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#ff8a4c] text-black font-semibold shadow-lg shadow-[#ff8a4c]/20"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                {year}
                <span className="ml-1.5 opacity-60">[{count}]</span>
              </button>
            )
          })}
        </div>

      </section>

      {/* Alumni Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        {displayedMembers.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            <Users className="mx-auto mb-3 opacity-40" size={48} />
            <p>No alumni found matching your criteria.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center"
          >
            <AnimatePresence>
              {displayedMembers.map((member, idx) => {
                const imgUrl = convertImageUrl(member.img)
                return (
                  <motion.div
                    key={`${member.year}-${member.name}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.5) }}
                    className="w-full max-w-sm h-full flex flex-col"
                  >
                    <TiltCard
                      effect="gravitate"
                      tiltLimit={14}
                      scale={1.03}
                      className="group relative w-full h-full min-h-[420px] rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-xl p-6 flex flex-col items-center text-center justify-between hover:border-neutral-700 transition-colors"
                    >
                      {/* Circular Avatar */}
                      <div className="relative w-40 h-40 sm:w-44 sm:h-44 aspect-square rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[#ff8a4c]/70 transition-colors duration-300 bg-neutral-850 shrink-0 shadow-md mt-1">
                        {imgUrl ? (
                          imgUrl.startsWith("http") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgUrl}
                              alt={member.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback on image error
                                (e.target as HTMLElement).style.display = "none"
                              }}
                            />
                          ) : (
                            <Image
                              src={imgUrl}
                              alt={member.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          )
                        ) : null}

                        {/* Fallback avatar if no image or image fails */}
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900 flex items-center justify-center -z-10 absolute inset-0">
                          <span className="text-4xl font-bold text-neutral-600 group-hover:text-[#ff8a4c]/60 transition-colors">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 flex flex-col items-center justify-center my-2 w-full z-20">
                        <h3 className="text-lg font-bold text-white mb-1 leading-snug line-clamp-2 group-hover:text-[#ff8a4c] transition-colors">
                          {member.name}
                        </h3>
                        {member.pos && (
                          <p className="text-xs text-neutral-300 font-medium tracking-wide uppercase line-clamp-2">
                            {member.pos}
                          </p>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-3 pt-3 border-t border-white/10 w-full justify-center z-20 min-h-[42px] items-center shrink-0 mt-auto">
                        {member.linkedin && (
                          <a
                            href={
                              member.linkedin.startsWith("http")
                                ? member.linkedin
                                : `https://${member.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-[#ff8a4c] transition-colors p-1"
                            title="LinkedIn Profile"
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={
                              member.github.startsWith("http")
                                ? member.github
                                : `https://${member.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-white transition-colors p-1"
                            title="GitHub Profile"
                          >
                            <Github size={18} />
                          </a>
                        )}
                      </div>
                    </TiltCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Footer />
    </main>
  )
}
