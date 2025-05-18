"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Briefcase, GraduationCap, Award } from "lucide-react"

interface TimelineItem {
  id: number
  title: string
  subtitle: string
  date: string
  description: string
  icon: "work" | "education" | "award"
}

const timelineItems: TimelineItem[] = [
  {
    id: 1,
    title: "Senior Designer",
    subtitle: "CreativeStudio",
    date: "2020 - Present",
    description:
      "Leading design projects for major clients, overseeing junior designers, and establishing design systems.",
    icon: "work",
  },
  {
    id: 2,
    title: "Design Excellence Award",
    subtitle: "International Design Association",
    date: "2019",
    description: "Recognized for outstanding contributions to digital design innovation.",
    icon: "award",
  },
  {
    id: 3,
    title: "Designer",
    subtitle: "DigitalWorks",
    date: "2017 - 2020",
    description: "Developed brand identities, marketing materials, and digital assets for a diverse range of clients.",
    icon: "work",
  },
  {
    id: 4,
    title: "BFA in Graphic Design",
    subtitle: "School of Visual Arts",
    date: "2013 - 2017",
    description: "Graduated with honors, specializing in typography and brand identity.",
    icon: "education",
  },
]

export default function JourneyTimeline() {
  const controls = useAnimation()
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "work":
        return <Briefcase className="text-orange-500" />
      case "education":
        return <GraduationCap className="text-orange-500" />
      case "award":
        return <Award className="text-orange-500" />
      default:
        return <Briefcase className="text-orange-500" />
    }
  }

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-orange-500/20 via-orange-500 to-orange-500/20"></div>

      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.3 } },
        }}
      >
        {timelineItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="relative mb-24 last:mb-0"
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
          >
            {/* Timeline node */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 border-4 border-black flex items-center justify-center z-10">
              {getIcon(item.icon)}
            </div>

            {/* Timeline content */}
            <div className={`w-5/12 ${index % 2 === 0 ? "ml-auto pr-16" : "mr-auto pl-16"}`}>
              <div className="bg-zinc-800 p-6 rounded-xl backdrop-blur-sm shadow-xl">
                <div className="flex flex-col">
                  <span className="text-orange-500 text-sm mb-1">{item.date}</span>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <span className="text-zinc-400 mb-4">{item.subtitle}</span>
                  <p className="text-zinc-300">{item.description}</p>
                </div>
              </div>

              {/* Connection line */}
              <div
                className={`absolute top-0 w-16 h-1 bg-gradient-to-r ${
                  index % 2 === 0
                    ? "from-transparent to-orange-500 left-[calc(50%-1rem)]"
                    : "from-orange-500 to-transparent right-[calc(50%-1rem)]"
                }`}
              ></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
