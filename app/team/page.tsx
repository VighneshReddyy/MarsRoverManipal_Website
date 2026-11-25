"use client"

import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { TiltCard } from "@/components/ui/tilt-card"
import { motion } from "framer-motion"
import { useState } from "react"
import { Linkedin, Github, Globe, GraduationCap, Building2, Calendar, Award, Shield, Users } from "lucide-react"
import { facultyAdvisors, type FacultyAdvisor } from "@/lib/faculty-advisors-data"
import cachedSheets from "@/cached_sheets.json"

interface TeamMember {
  name: string
  image: string
  year?: string
  position?: string
  domain?: string
  description?: string
  expertise?: string
  linkedin?: string
  github?: string
  website?: string
}

// Convert Google Drive view link to direct thumbnail URL
function convertDriveUrl(url: string): string {
  if (!url) return ""
  const trimmedUrl = url.trim()
  const driveMatch = trimmedUrl.match(/(?:\/d\/|\/file\/d\/|id=)([a-zA-Z0-9_-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`
  }
  if (!trimmedUrl.startsWith("http") && !trimmedUrl.startsWith("/")) {
    return `/team/${trimmedUrl}`
  }
  return trimmedUrl
}

function getMembersFromList(list: any[]): TeamMember[] {
  if (!list) return []
  return list.map((m: any) => ({
    name: m.name || "",
    image: convertDriveUrl(m["link to image"] || m.image || ""),
    year: m.year || "",
    position: m.position || "",
    domain: m.domain || "",
    description: m.description || "",
    expertise: "", // deliberately omitted to satisfy specialization removal
    linkedin: m.linkedin || "",
    github: m.github || "",
    website: m["website ( others )"] || m.website || "",
  }))
}

interface TeamSectionProps {
  title: string
  subtitle?: string
  members: TeamMember[]
  isBoard?: boolean
  badgeText?: string
}

function TeamSection({ title, subtitle, members, isBoard = false, badgeText }: TeamSectionProps) {
  if (members.length === 0) return null

  return (
    <section className="px-6 md:px-12 pb-20 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          {badgeText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 text-xs font-mono tracking-widest text-[#ff8a4c] uppercase mb-3">
              {isBoard ? <Shield size={13} /> : <Users size={13} />}
              {badgeText}
            </div>
          )}
          <h2 className={`font-bold tracking-wider uppercase ${isBoard ? "text-3xl md:text-4xl text-white" : "text-2xl md:text-3xl text-neutral-200"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-neutral-400 text-xs md:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`grid gap-6 md:gap-8 justify-items-center ${
            isBoard
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {members.map((member, index) => (
            <motion.div
              key={`${member.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
              className="w-full max-w-sm h-full flex flex-col"
            >
              <TiltCard
                effect="gravitate"
                tiltLimit={12}
                scale={1.03}
                className={`group relative w-full h-full min-h-[350px] rounded-2xl bg-neutral-900/90 border shadow-xl p-6 flex flex-col items-center text-center justify-between transition-all duration-300 ${
                  isBoard
                    ? "border-neutral-800 hover:border-[#ff8a4c] shadow-[#ff8a4c]/5 hover:shadow-2xl hover:shadow-[#ff8a4c]/10"
                    : "border-neutral-800/80 hover:border-neutral-700 hover:shadow-xl"
                }`}
              >
                {/* Board distinction indicator */}
                {isBoard && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#ff8a4c]/10 border border-[#ff8a4c]/30 text-[10px] font-mono tracking-wider text-[#ff8a4c] uppercase">
                    Board
                  </div>
                )}

                {/* Circular Avatar Frame */}
                <div
                  className={`relative aspect-square rounded-full overflow-hidden border-2 transition-colors duration-300 bg-neutral-850 shrink-0 shadow-lg mt-2 ${
                    isBoard
                      ? "w-32 h-32 sm:w-36 sm:h-36 border-[#ff8a4c]/40 group-hover:border-[#ff8a4c]"
                      : "w-28 h-28 sm:w-32 sm:h-32 border-neutral-800 group-hover:border-[#ff8a4c]/60"
                  }`}
                >
                  {member.image ? (
                    member.image.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    )
                  ) : null}

                  {/* Fallback avatar with initial */}
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900 flex items-center justify-center -z-10 absolute inset-0">
                    <span className="text-4xl font-bold text-neutral-600 group-hover:text-[#ff8a4c]/70 transition-colors">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Member Info (Name and Designation ONLY, NO specializations or batch tags) */}
                <div className="flex-1 flex flex-col items-center justify-center my-3 w-full z-20">
                  <h3
                    className={`font-bold text-white mb-1.5 leading-snug group-hover:text-[#ff8a4c] transition-colors ${
                      isBoard ? "text-xl" : "text-lg"
                    }`}
                  >
                    {member.name}
                  </h3>
                  {member.position && (
                    <p className="text-xs text-neutral-300 font-medium tracking-wide uppercase leading-relaxed max-w-[240px]">
                      {member.position}
                    </p>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 pt-3 border-t border-white/10 w-full justify-center z-20 min-h-[42px] items-center shrink-0 mt-auto">
                  {member.linkedin ? (
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
                  ) : (
                    <span className="w-5" />
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
                  {member.website && (
                    <a
                      href={
                        member.website.startsWith("http")
                          ? member.website
                          : `https://${member.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white transition-colors p-1"
                      title="Personal Website"
                    >
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FacultyAdvisorsSection({ advisors }: { advisors: FacultyAdvisor[] }) {
  return (
    <section id="advisors" className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono tracking-widest text-[#ff8a4c] uppercase mb-3">
            <Award size={14} /> Academic Mentorship
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-200 uppercase tracking-wider">
            Faculty Advisors
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm mt-2 max-w-xl mx-auto">
            Guiding Mars Rover Manipal with technical expertise and academic mentorship at MAHE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="w-full max-w-sm h-full flex flex-col"
            >
              <TiltCard
                effect="gravitate"
                tiltLimit={12}
                scale={1.03}
                className="group relative w-full h-full min-h-[350px] rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl p-6 flex flex-col items-center text-center justify-between hover:border-neutral-700 transition-colors"
              >
                {/* Circular Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 aspect-square rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[#ff8a4c]/70 transition-colors duration-300 bg-neutral-850 shrink-0 shadow-md mt-2">
                  <Image
                    src={advisor.img}
                    alt={advisor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Content Info */}
                <div className="flex-1 flex flex-col items-center justify-center my-3 w-full z-20">
                  <h3 className="text-lg font-bold text-white mb-1.5 leading-snug group-hover:text-[#ff8a4c] transition-colors">
                    {advisor.name}
                  </h3>
                  <p className="text-xs text-neutral-300 font-medium tracking-wide uppercase mb-1.5">
                    {advisor.pos}
                  </p>
                  <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 leading-relaxed text-center">
                    <Building2 size={13} className="shrink-0 text-[#ff8a4c]" />
                    <span>{advisor.dept}</span>
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default function TeamPage() {
  // Read directly from cached_sheets.json to guarantee updated Board, Senior Team, and Senior Researchers
  const boardMembers = getMembersFromList((cachedSheets as any).Board || [])
  const seniorTeamMembers = getMembersFromList((cachedSheets as any)["Senior team"] || [])
  const seniorResearchers = getMembersFromList((cachedSheets as any).Research || [])

  return (
    <main className="bg-[#06040a] min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono tracking-widest text-[#ff8a4c] uppercase mb-4">
            <Users size={14} /> Active Team Roster
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Meet the Team
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg mb-6">
            Meet the engineers, designers, researchers, and innovators building next-generation rovers
            for extraterrestrial exploration.
          </p>

          {/* Link banner to 2026 Alumni */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/80 text-xs font-mono text-neutral-300">
            <span>Looking for former Board & Senior members?</span>
            <Link
              href="/alumni"
              className="text-[#ff8a4c] hover:underline flex items-center gap-1 font-semibold"
            >
              <GraduationCap size={14} />
              View 2026 Alumni &rarr;
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 1. Executive Board Section */}
      <TeamSection
        title="Executive Board"
        subtitle="The executive leadership driving our current planetary exploration mission, mechanical design, AI & automation, life sciences, operations, and research."
        members={boardMembers}
        isBoard
        badgeText="Executive Leadership"
      />

      {/* 2. Senior Team Members Section */}
      <TeamSection
        title="Senior Team Members"
        subtitle="Experienced engineers spearheading subsystem execution, hardware integration, and mentorship across the team."
        members={seniorTeamMembers}
        badgeText="Senior Engineering"
      />

      {/* 3. Research Team Section: Category 'Senior Researchers' */}
      <TeamSection
        title="Senior Researchers"
        subtitle="Pioneering interplanetary scientific analysis, biosensing payloads, astrobiological assays, and autonomous planetary instrumentation."
        members={seniorResearchers}
        badgeText="Research Division"
      />

      {/* 4. Faculty Advisors Section */}
      <FacultyAdvisorsSection advisors={facultyAdvisors} />

      <Footer />
    </main>
  )
}
