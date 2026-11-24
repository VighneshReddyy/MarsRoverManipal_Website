"use client"

import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { TiltCard } from "@/components/ui/tilt-card"
import { motion } from "framer-motion"
import { Award, Building2, Calendar } from "lucide-react"
import { facultyAdvisors } from "@/lib/faculty-advisors-data"

export default function FacultyAdvisorsPage() {
  return (
    <main className="bg-neutral-950 min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm text-xs font-mono tracking-widest text-[#ff8a4c] uppercase mb-4">
            <Award size={16} />
            Academic Mentorship
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Faculty Advisors
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">
            Guiding Mars Rover Manipal through cutting-edge research, engineering excellence, and
            interdisciplinary innovation at Manipal Academy of Higher Education (MAHE).
          </p>
        </motion.div>
      </section>

      {/* Faculty Advisors Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {facultyAdvisors.map((advisor, index) => (
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
      </section>

      <Footer />
    </main>
  )
}
