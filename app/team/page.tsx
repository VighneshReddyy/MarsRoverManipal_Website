"use client"

import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { TiltCard } from "@/components/ui/tilt-card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Linkedin, Github, Globe, GraduationCap, Building2, Calendar, Award } from "lucide-react"
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

// Google Sheet ID and sheet names
const SPREADSHEET_ID = "1URxCnU98YvX7dtyJWE7PzLhrqQKdVDpI7y0C1bQt9H4"

const SHEET_NAMES = {
  rover: "Rover team",
  research: "Research",
}

// Convert Google Drive view link to direct image URL
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

function findColumnIndex(headers: string[], ...keywords: string[]): number {
  for (const keyword of keywords) {
    const index = headers.findIndex((h) => h.includes(keyword))
    if (index !== -1) return index
  }
  return -1
}

function getValue(row: string[], index: number): string {
  if (index === -1 || index >= row.length) return ""
  return row[index]?.trim() || ""
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentField)
        currentField = ""
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentField)
        rows.push(currentRow)
        currentRow = []
        currentField = ""
        if (char === "\r") i++
      } else if (char !== "\r") {
        currentField += char
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows
}

async function fetchSheetData(sheetName: string): Promise<TeamMember[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetName
    )}`
    const response = await fetch(url)
    const csvText = await response.text()

    const rows = parseCSV(csvText)
    if (rows.length < 2) return []

    const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/\s+/g, " "))

    const nameIdx = findColumnIndex(headers, "name")
    const imageIdx = findColumnIndex(headers, "link to image", "image", "photo")
    const yearIdx = findColumnIndex(headers, "year")
    const positionIdx = findColumnIndex(headers, "position", "role")
    const domainIdx = findColumnIndex(headers, "domain")
    const descriptionIdx = findColumnIndex(headers, "description")
    const expertiseIdx = findColumnIndex(headers, "expertise")
    const linkedinIdx = findColumnIndex(headers, "linkedin")
    const githubIdx = findColumnIndex(headers, "github")
    const websiteIdx = findColumnIndex(headers, "website", "others")

    const data: TeamMember[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const name = getValue(row, nameIdx)
      if (!name) continue

      const imageUrl = getValue(row, imageIdx)

      const member: TeamMember = {
        name,
        image: convertDriveUrl(imageUrl),
        year: getValue(row, yearIdx),
        position: getValue(row, positionIdx),
        domain: getValue(row, domainIdx),
        description: getValue(row, descriptionIdx),
        expertise: getValue(row, expertiseIdx),
        linkedin: getValue(row, linkedinIdx),
        github: getValue(row, githubIdx),
        website: getValue(row, websiteIdx),
      }

      data.push(member)
    }

    return data
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error)
    return []
  }
}

function getFallbackMembers(key: "Rover team" | "Research"): TeamMember[] {
  const items = cachedSheets[key] || []
  return items.map((m: any) => ({
    name: m.name || "",
    image: convertDriveUrl(m["link to image"] || ""),
    year: m.year || "",
    position: m.position || "",
    domain: m.domain || "",
    description: m.description || "",
    expertise: m.expertise || "",
    linkedin: m.linkedin || "",
    github: m.github || "",
    website: m["website ( others )"] || "",
  }))
}

interface TeamSectionProps {
  title: string
  subtitle?: string
  members: TeamMember[]
  showDetails?: boolean
}

function TeamSection({ title, subtitle, members, showDetails = false }: TeamSectionProps) {
  if (members.length === 0) return null

  return (
    <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-200 uppercase tracking-wider">
            {title}
          </h2>
          {subtitle && (
            <p className="text-neutral-400 text-sm mt-2 max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {members.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
              className="w-full max-w-sm h-full flex flex-col"
            >
              <TiltCard
                effect="gravitate"
                tiltLimit={14}
                scale={1.03}
                className="group relative w-full h-full min-h-[380px] rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-xl p-6 flex flex-col items-center text-center justify-between hover:border-neutral-700 transition-colors"
              >
                {/* Circular Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 aspect-square rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[#ff8a4c]/70 transition-colors duration-300 bg-neutral-850 shrink-0 shadow-md mt-1">
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

                  {/* Fallback avatar if no image */}
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
                  {member.position && (
                    <p className="text-xs text-neutral-300 font-medium tracking-wide uppercase line-clamp-2">
                      {member.position}
                    </p>
                  )}
                  {showDetails && member.expertise && (
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {member.expertise}
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
          <p className="text-neutral-400 text-sm mt-2 max-w-xl mx-auto">
            Guiding Mars Rover Manipal with technical expertise and academic mentorship at MAHE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
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
                tiltLimit={14}
                scale={1.03}
                className="group relative w-full h-full min-h-[380px] rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-xl p-6 flex flex-col items-center text-center justify-between hover:border-neutral-700 transition-colors"
              >
                {/* Circular Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 aspect-square rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[#ff8a4c]/70 transition-colors duration-300 bg-neutral-850 shrink-0 shadow-md mt-1">
                  <Image
                    src={advisor.img}
                    alt={advisor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Content Info */}
                <div className="flex-1 flex flex-col items-center justify-center my-2 w-full z-20">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-mono uppercase tracking-wider text-[#ff8a4c] mb-2 backdrop-blur-sm">
                    <Calendar size={12} />
                    {advisor.year}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 leading-snug group-hover:text-[#ff8a4c] transition-colors">
                    {advisor.name}
                  </h3>
                  <p className="text-xs text-neutral-300 font-medium tracking-wide uppercase mb-1">
                    {advisor.pos}
                  </p>
                  <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 leading-relaxed text-center">
                    <Building2 size={13} className="shrink-0 text-neutral-500" />
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
  const [boardMembers, setBoardMembers] = useState<TeamMember[]>([])
  const [researchMembers, setResearchMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeamData() {
      setLoading(true)

      // The current team (Rover team) has stepped up as the new Board
      const [rover, research] = await Promise.all([
        fetchSheetData(SHEET_NAMES.rover),
        fetchSheetData(SHEET_NAMES.research),
      ])

      setBoardMembers(rover.length > 0 ? rover : getFallbackMembers("Rover team"))
      setResearchMembers(research.length > 0 ? research : getFallbackMembers("Research"))
      setLoading(false)
    }

    loadTeamData()
  }, [])

  return (
    <main className="bg-neutral-950 min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
        >
          The Team
        </motion.h1>
        <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg mb-6">
          Meet the engineers, designers, and innovators building next-generation rovers for
          extraterrestrial exploration.
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Active Board (formerly Rover Team) */}
          <TeamSection
            title="Board"
            subtitle="The executive leadership driving our current mission and rover engineering."
            members={boardMembers}
            showDetails
          />

          {/* Research Section */}
          <TeamSection
            title="Research Team"
            subtitle="Pioneering interplanetary scientific analysis, biosensing, and autonomous systems."
            members={researchMembers}
          />

          {/* Faculty Advisors Section */}
          <FacultyAdvisorsSection advisors={facultyAdvisors} />
        </>
      )}

      <Footer />
    </main>
  )
}
