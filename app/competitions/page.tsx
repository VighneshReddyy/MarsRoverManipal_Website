"use client"

import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { useState } from "react"
import { ExternalLink, Trophy, Medal, Award, Images } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Competition {
  id: number
  name: string
  year: string
  position: string
  info: string
  image: string
  website?: string
  video?: string
  photos?: string[]
}

interface CompetitionCategory {
  id: string
  name: string
  fullName: string
  logo: string
  description: string
  competitions: Competition[]
}

const competitionData: CompetitionCategory[] = [
  {
    id: "erc",
    name: "ERC",
    fullName: "European Rover Challenge",
    logo: "/comp_logo/ERC_Logo.png",
    description:
      "The European Rover Challenge is an international robotics competition where academic teams from around the world present their mobile robot designs, competing in planetary challenges based on real ESA and NASA missions. The competition takes place on the world's largest artificial Martian track in Poland.",
    competitions: [
      {
        id: 1,
        name: "ERC 2026",
        year: "2026",
        position: "10th Worldwide",
        info: "At the European Rover Challenge 2026 hosted in Poland, Mars Rover Manipal achieved 10th place worldwide among elite collegiate robotics teams, showcasing an advanced five-bar suspension rover with autonomous waypoint navigation, astrobiology life-detection, and precision manipulator servicing.",
        image: "/photos/erc2022-team-poland.webp",
        website: "https://roverchallenge.eu/en/main-page/",
        photos: ["/photos/erc2022-team-poland.webp", "/photos/erc2021-podium.webp", "/comp/ercteam22.webp"],
      },
      {
        id: 2,
        name: "ERC 2025",
        year: "2025",
        position: "10th Worldwide",
        info: "Mars Rover Manipal secured 10th place globally at the European Rover Challenge 2025. Competing against international robotics institutions, the team demonstrated robust telemetry, modular electronics architecture, and specialized astrobiology payloads.",
        image: "/photos/erc2021-podium.webp",
        website: "https://roverchallenge.eu/en/main-page/",
        photos: ["/photos/erc2021-podium.webp", "/comp/ERC_TEAM.webp"],
      },
      {
        id: 3,
        name: "ERC 2022",
        year: "2022",
        position: "2nd Position",
        info: "Mars Rover Manipal finished 2nd out of 28 teams from around the world in the remote edition of the European Rover Challenge (ERC) 2022. In addition, we were awarded The Best Performing Team in the Science, Maintenance and Presentation Tasks.",
        image: "/comp/ercteam22.webp",
        website: "https://roverchallenge.eu/en/main-page/",
        photos: ["/comp/ercteam22.webp", "/photos/erc2022-team-poland.webp"],
      },
      {
        id: 4,
        name: "ERC 2021",
        year: "2021",
        position: "4th Position",
        info: "Mars Rover Manipal finished 4th out of 34 teams from around the world in the remote edition of the European Rover Challenge (ERC). In addition, we received an honourable mention as the best performing team in the presentation task.",
        image: "/comp/ERC_TEAM.webp",
        website: "https://roverchallenge.eu/en/main-page/",
        photos: ["/comp/ERC_TEAM.webp", "/photos/erc2021-podium.webp"],
      },
    ],
  },
  {
    id: "irc",
    name: "IRC",
    fullName: "International Rover Challenge",
    logo: "/comp_logo/SPROS_IRC_logo.png",
    description:
      "The International Rover Challenge (formerly Indian Rover Challenge), organized by the Space Robotics Society, is a premier annual robotics competition designed to challenge university teams in autonomous navigation, biosensing, and mechanical durability in extreme terrestrial analog sites.",
    competitions: [
      {
        id: 1,
        name: "IRC 2026",
        year: "2026",
        position: "7th Place",
        info: "In the International Rover Challenge 2026, Mars Rover Manipal competed against premier collegiate teams in intense field maneuvers, securing 7th place overall with strong showings in autonomous traversal and manipulation tasks.",
        image: "/placeholder.jpg",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: [],
      },
      {
        id: 2,
        name: "IRC 2025",
        year: "2025",
        position: "1st Place",
        info: "Mars Rover Manipal clinched 1st Place at the International Rover Challenge 2025, outperforming international teams across all four operational challenges including autonomous navigation, science sample collection, and extreme terrain traversal.",
        image: "/placeholder.jpg",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: [],
      },
      {
        id: 3,
        name: "IRC 2024",
        year: "2024",
        position: "1st Position",
        info: "Mars Rover Manipal secured 1st place among 25 global qualifiers at the International Rover Challenge 2024, held at PSG College of Technology in Coimbatore from January 24th to 29th. Organized by SproS, this accomplishment underscores the team's technical prowess and positions them prominently in the global space exploration community.",
        image: "/irc/irc2024.jpg",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: ["/irc/irc2024.jpg"],
      },
      {
        id: 6,
        name: "IRC 2023",
        year: "2023",
        position: "Participation",
        info: "Mars Rover Manipal at the International Rover Challenge 2023.",
        image: "/irc/irc2023.jpg",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: ["/irc/irc2023.jpg"],
      },
      {
        id: 4,
        name: "IRC 2019",
        year: "2019",
        position: "Host",
        info: "Indian Rover Challenge (IRC) 2019, the second edition, featured design challenges and technicalities, encouraging students from all over the world to provide solutions and move closer towards the next phases of space exploration. It was organized by the students of Mars Rover Manipal in association with Manipal Academy of Higher Education and the Mars Society.",
        image: "/irc/image1.jpg",
        website: "https://southasia.marssociety.org/indianroverchallenge/irc-2019/",
        photos: ["/irc/image1.jpg"],
      },
      {
        id: 5,
        name: "IRC 2018",
        year: "2018",
        position: "1st Position",
        info: "Mars Rover Manipal participated in IRC 2018 along with teams from all over Asia. The event was organized by ISTE VIT and Creative Labs at Vellore Institute of Technology. Mars Rover Manipal performed very well and were declared winners with a final score of 616 points out of 760, beating the second closest opponent by a margin of 129 points.",
        image: "/irc/image3.webp",
        website: "https://southasia.marssociety.org/irdc/",
        photos: ["/irc/image3.webp"],
      },
    ],
  },
  {
    id: "urc",
    name: "URC",
    fullName: "University Rover Challenge",
    logo: "/comp_logo/URC_Logo.webp",
    description:
      "The University Rover Challenge is a premier robotics competition organized annually by the Mars Society USA during summer at Mars Desert Research Station (MDRS) in Hanksville, Utah. The challenge is to build a next-generation Mars Rover capable of working alongside astronauts in future Martian colonies.",
    competitions: [
      {
        id: 1,
        name: "URC 2024",
        year: "2024",
        position: "18th Worldwide",
        info: "The 18th edition of University Rover Challenge was held at the Mars Desert Research Station in Hanksville, Utah from 29th May to June 1st 2024. Mars Rover Manipal was able to maintain its streak of being the best rover team from India for its 7th consecutive year.",
        image: "/urc2024/team.jpg",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/CnRiPZGofaw",
        photos: ["/urc2024/team.jpg", "/urc2024/urc2024.jpg", "/urc2024/rdo1.jpg", "/urc2024/rdo2.jpg", "/urc2024/esm1.jpg", "/urc2024/esm2.jpg", "/urc2024/esm3.jpg", "/urc2024/sm.jpg", "/urc2024/bike.jpg"],
      },
      {
        id: 2,
        name: "URC 2022",
        year: "2022",
        position: "21st Worldwide",
        info: "The 16th edition of University Rover Challenge was held at the Mars Desert Research Station in Hanksville, Utah from June 1st to June 4th 2022. MRM was also the recipient of the prestigious John Barainca award for the best science team in the competition, securing an 85/100 in this challenging mission.",
        image: "/urc2022/urc2022-5.webp",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/tgAOEiIUJ5k",
        photos: ["/urc2022/urc2022-5.webp", "/urc2022/urc2022-1.webp", "/urc2022/urc2022-2.webp", "/urc2022/urc2022-3.webp", "/urc2022/urc2022-4.webp", "/urc2022/urc2022-6.webp"],
      },
      {
        id: 8,
        name: "URC 2021",
        year: "2021",
        position: "91.17 SAR Score",
        info: "The 2021 University Rover Challenge was cancelled due to the pandemic. Mars Rover Manipal scored 91.17 in the System Acceptance Review.",
        image: "/photos-urc2021/grp_1.jpg",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/rbkrRSdEiOA",
        photos: ["/photos-urc2021/grp_1.jpg", "/photos-urc2021/board_1.jpg", "/photos-urc2021/mem_1.jpg", "/photos-urc2021/rover_1.jpg", "/photos-urc2021/rover1_1.jpg"],
      },
      {
        id: 3,
        name: "URC 2020",
        year: "2020",
        position: "7th Worldwide",
        info: "The 14th edition of University Rover Challenge was cancelled due to the Corona virus Pandemic. MRM stood 1st in India, 2nd in Asia and 7th worldwide based on SAR results. We also continued our run of being the best Indian Rover Team for the fourth consecutive year.",
        image: "/photos20/team.webp",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/V22SHOJQx4I",
        photos: ["/photos20/team.webp", "/photos20/Rover 2020.webp", "/photos20/Rover autonomous.webp", "/photos20/robo.webp", "/photos20/PCB Power.webp"],
      },
      {
        id: 4,
        name: "URC 2019",
        year: "2019",
        position: "8th Worldwide",
        info: "MRM secured the 8th rank globally which placed us as the best rover team in Asia. MRM was the recipient of the prestigious Barainca award for the best science team in the competition, securing a 95/100 in this challenging mission.",
        image: "/comp/urc2019.webp",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/vY86gCyUFQ8",
        photos: ["/comp/urc2019.webp", "/Photos19/1.jpg", "/Photos19/2.webp", "/Photos19/3.jpg", "/Photos19/4.jpg", "/Photos19/5.jpg", "/Photos19/6.jpg", "/Photos19/7.jpg", "/Photos19/8.jpg", "/Photos19/9.jpg"],
      },
      {
        id: 5,
        name: "URC 2018",
        year: "2018",
        position: "7th Worldwide",
        info: "MRM secured a world rank of 7 in URC 2018. Our rover Airawat once again placed us as India's best and Asia's second best rover team at URC.",
        image: "/comp/urc2018.webp",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/8QmRq4NSOIg",
        photos: ["/comp/urc2018.webp", "/urc2017/rover18a.webp", "/urc2017/rover18b.webp", "/urc2017/rover18c.webp", "/urc2017/rover18d.webp", "/urc2017/rover18e.webp"],
      },
      {
        id: 6,
        name: "URC 2017",
        year: "2017",
        position: "8th Worldwide",
        info: "We achieved 8th position all over the world. Our rover was the best performer from India and Asia. Our biggest highlight was the score of 100 out of 100 in the Science Cache Task.",
        image: "/comp/rover17.jpeg",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/6Mr8owXfWoc",
        photos: ["/comp/rover17.jpeg", "/urc2017/image1.webp", "/urc2017/image2.webp", "/urc2017/image3.webp", "/urc2017/image4.webp", "/urc2017/image5.jpg"],
      },
      {
        id: 7,
        name: "URC 2016",
        year: "2016",
        position: "13th Worldwide",
        info: "This was the first time we were participating in URC. 63 teams registered for the competition and 28 were selected. We stood 13th all over the world. Our rover was ranked second best in India and Asia.",
        image: "/comp/rover16.webp",
        website: "https://urc.marssociety.org/",
        video: "https://www.youtube.com/embed/cG70pC12jTU",
        photos: ["/comp/rover16.webp", "/urc2016/image1.webp", "/urc2016/image2.webp", "/urc2016/image3.jpg", "/urc2016/image4.webp", "/urc2016/image5.webp"],
      },
    ],
  },
  {
    id: "irdc",
    name: "IRDC",
    fullName: "International Rover Design Challenge",
    logo: "/comp_logo/MSSA_Logo.png",
    description:
      "The International Rover Design Challenge is a design engineering competition that challenges students to design Mars rovers equipped and mission-ready for Martian conditions. Teams carefully plan each subsystem considering extreme extraterrestrial parameters.",
    competitions: [
      {
        id: 1,
        name: "IRDC 2023",
        year: "2023",
        position: "4th Position",
        info: "Mars Rover Manipal bagged the 4th position out of 20 teams from four countries in the fourth edition of the International Rover Design Challenge (IRDC), hosted by the Space Robotics Society (SPROS).",
        image: "/comp/irdc2024.jpg",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: ["/comp/irdc2024.jpg", "/comp/irdc2022render.webp"],
      },
      {
        id: 2,
        name: "IRDC 2022",
        year: "2022",
        position: "2nd Position",
        info: "Mars Rover Manipal bagged the 2nd position out of 24 teams from four countries in the third edition of the International Rover Design Challenge (IRDC), hosted by the Space Robotics Society (SPROS).",
        image: "/comp/irdc2022render.webp",
        website: "https://www.spaceroboticssociety.org/events/international-rover-challenge/",
        photos: ["/comp/irdc2022render.webp", "/comp/irdc2024.jpg"],
      },
      {
        id: 3,
        name: "IRDC 2021",
        year: "2021",
        position: "3rd Position",
        info: "Mars Rover Manipal bagged the 3rd position out of 32 teams from four countries in the second edition of the International Rover Design Challenge (IRDC), hosted by Mars Society South Asia (MSSA).",
        image: "/comp/IRDC_20211.webp",
        website: "https://southasia.marssociety.org/irdc/",
        photos: ["/comp/IRDC_20211.webp", "/comp/IRDCrover1.webp"],
      },
      {
        id: 4,
        name: "IRDC 2020",
        year: "2020",
        position: "1st Position",
        info: "Mars Rover Manipal bagged the 1st position in IRDC 2020. 28 teams from 7 countries had taken part. MRM scored 816.5 points for the submission, securing the first position by a margin of 15 points.",
        image: "/comp/IRDCrover1.webp",
        website: "https://southasia.marssociety.org/irdc/",
        photos: ["/comp/IRDCrover1.webp", "/comp/IRDC_20211.webp"],
      },
    ],
  },
  {
    id: "imh",
    name: "IMH",
    fullName: "International Mars Hackathon",
    logo: "/comp_logo/MSSA_Logo.png",
    description:
      "International Mars Hackathon challenges teams from diverse disciplines to come up with insightful solutions to mind-boggling Space Exploration problems in a rapid 48hr intense hackathon format.",
    competitions: [
      {
        id: 1,
        name: "IMH 2020",
        year: "2020",
        position: "3rd Worldwide",
        info: "Mars Rover Manipal bagged the 3rd position worldwide in IMH 2020.",
        image: "/irc/IMH.webp",
        website: "https://southasia.marssociety.org/irdc/",
        photos: ["/irc/IMH.webp"],
      },
    ],
  },
]

function getPositionBadge(position: string) {
  const lower = position.toLowerCase()
  if (lower.includes("1st") || lower.includes("first")) {
    return {
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      color: "border-yellow-500/40 bg-yellow-950/60 text-yellow-300",
    }
  } else if (lower.includes("2nd") || lower.includes("second")) {
    return {
      icon: <Medal className="w-4 h-4 text-slate-300" />,
      color: "border-slate-500/40 bg-slate-900/70 text-slate-200",
    }
  } else if (lower.includes("3rd") || lower.includes("third")) {
    return {
      icon: <Medal className="w-4 h-4 text-amber-500" />,
      color: "border-amber-600/40 bg-amber-950/60 text-amber-300",
    }
  }
  return {
    icon: <Award className="w-4 h-4 text-[#ff8a4c]" />,
    color: "border-[#ff8a4c]/40 bg-[#ff8a4c]/10 text-[#ff8a4c]",
  }
}

function CompetitionCard({ competition, index }: { competition: Competition; index: number }) {
  const badge = getPositionBadge(competition.position)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      className="group relative bg-neutral-900/80 rounded-xl overflow-hidden border border-neutral-800 hover:border-[#ff8a4c]/60 transition-all duration-300 flex flex-col justify-between shadow-lg"
    >
      {/* Top Image */}
      <div className="relative h-52 overflow-hidden bg-neutral-950">
        <Image
          src={competition.image}
          alt={competition.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

        {/* Position Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1.5 backdrop-blur-md px-3 py-1 rounded-full border text-xs font-mono font-medium shadow-md ${badge.color}`}
        >
          {badge.icon}
          <span>{competition.position}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-[#ff8a4c] transition-colors">
              {competition.name}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
              {competition.year}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-4">
            {competition.info}
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-4 pt-3 border-t border-white/5 items-center">
          {competition.website && (
            <a
              href={competition.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-[#ff8a4c] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ff8a4c]" />
              Official Portal
            </a>
          )}
          {competition.photos && competition.photos.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-[#ff8a4c]/40 px-3 py-1.5 text-xs font-mono text-[#ff8a4c] transition-colors hover:bg-[#ff8a4c]/10">
                  <Images className="w-3.5 h-3.5" /> Photos
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto border-neutral-800 bg-neutral-950 text-white">
                <DialogHeader><DialogTitle>{competition.name} Photos</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {competition.photos.map((photo, i) => (
                    <a key={photo} href={photo} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900">
                      <Image src={photo} alt={`${competition.name} photo ${i + 1}`} fill className="object-contain" sizes="(max-width: 640px) 90vw, 40vw" />
                    </a>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          {competition.video && (
            <a
              href={competition.video}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-[#ff8a4c] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ff8a4c]" />
              SAR Video
            </a>
          )}
        </div>


      </div>
    </motion.div>
  )
}

function CompetitionSection({ category }: { category: CompetitionCategory }) {
  return (
    <section id={category.id} className="mb-24 scroll-mt-28">
      {/* Header with Logo and Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 items-center bg-neutral-900/40 border border-neutral-800/80 p-6 md:p-8 rounded-2xl backdrop-blur-sm"
      >
        <div className="w-24 h-24 md:w-32 md:h-32 relative flex-shrink-0 bg-white/95 rounded-xl p-3 shadow-inner flex items-center justify-center">
          <Image
            src={category.logo}
            alt={category.name}
            fill
            className="object-contain p-2"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {category.fullName} ({category.name})
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-3xl">
            {category.description}
          </p>
        </div>
      </motion.div>

      {/* Competition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.competitions.map((comp, index) => (
          <CompetitionCard key={comp.id} competition={comp} index={index} />
        ))}
      </div>
    </section>
  )
}

export default function CompetitionsPage() {
  const [activeTab, setActiveTab] = useState<string>("all")

  const filteredCategories =
    activeTab === "all"
      ? competitionData
      : competitionData.filter((cat) => cat.id === activeTab)

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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Competitions
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">
            Mars Rover Manipal represents India and Asia across premier planetary robotics challenges,
            holding top-10 global standings in ERC Poland and championship titles in IRC.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#ff8a4c] text-black font-semibold shadow-lg shadow-[#ff8a4c]/20"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            All Competitions
          </button>
          {competitionData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === cat.id
                  ? "bg-[#ff8a4c] text-black font-semibold shadow-lg shadow-[#ff8a4c]/20"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Competitions Content */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto pb-32">
        {filteredCategories.map((category) => (
          <CompetitionSection key={category.id} category={category} />
        ))}
      </div>

      <Footer />
    </main>
  )
}
