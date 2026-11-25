"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, MapPin, Calendar, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { galleryPhotos, type PhotoItem } from "@/lib/photos-data"

type CategoryFilter = "All" | "Competitions" | "Field Testing" | "Rover Engineering" | "Team"

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Competitions",
  "Field Testing",
  "Rover Engineering",
  "Team",
]

export default function PhotosPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "All") return galleryPhotos
    return galleryPhotos.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const prevPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  const nextPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
  }

  return (
    <main className="bg-[#06040a] min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 md:px-12 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm text-xs font-mono tracking-widest text-[#ff8a4c] uppercase mb-4">
            <Camera size={15} />
            Visual Archive
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Photos & Field Missions
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">
            High-resolution captures from international competitions, Utah analog desert trials,
            rover hardware fabrication, and our multidisciplinary engineering team.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? galleryPhotos.length
                : galleryPhotos.filter((p) => p.category === cat).length
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#ff8a4c] text-black font-semibold shadow-lg shadow-[#ff8a4c]/20"
                    : "bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                {cat}
                <span className="ml-1.5 opacity-60">[{count}]</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}
                onClick={() => openLightbox(idx)}
                className="group relative bg-neutral-900/80 rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-[#ff8a4c]/60 transition-all duration-300 shadow-xl cursor-pointer flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Category & Year badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/10 text-[#ff8a4c]">
                      {photo.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 flex items-center gap-1">
                      <Calendar size={11} />
                      {photo.year}
                    </span>
                  </div>

                  {/* Expand icon hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#ff8a4c]/90 text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 size={20} />
                    </div>
                  </div>
                </div>

                {/* Photo Description details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#ff8a4c] transition-colors line-clamp-1">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#ff8a4c]" />
                      {photo.location}
                    </span>
                    <span className="text-[#ff8a4c] group-hover:underline">View photo &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-white hover:text-[#ff8a4c] hover:border-[#ff8a4c] transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-neutral-900/80 border border-neutral-700 text-white hover:text-[#ff8a4c] hover:border-[#ff8a4c] transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
              className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-neutral-900/80 border border-neutral-700 text-white hover:text-[#ff8a4c] hover:border-[#ff8a4c] transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>

            {/* Active Photo Container */}
            <div
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[60vh] md:h-[70vh]">
                <Image
                  src={filteredPhotos[lightboxIndex].src}
                  alt={filteredPhotos[lightboxIndex].title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Photo Caption */}
              <div className="mt-4 text-center max-w-2xl px-4">
                <div className="inline-flex items-center gap-3 text-xs font-mono text-[#ff8a4c] uppercase tracking-wider mb-1.5">
                  <span>{filteredPhotos[lightboxIndex].category}</span>
                  <span>•</span>
                  <span>{filteredPhotos[lightboxIndex].year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {filteredPhotos[lightboxIndex].location}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                  {filteredPhotos[lightboxIndex].title}
                </h2>
                <p className="text-xs md:text-sm text-neutral-400">
                  {filteredPhotos[lightboxIndex].description}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 mt-2">
                  {lightboxIndex + 1} of {filteredPhotos.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
