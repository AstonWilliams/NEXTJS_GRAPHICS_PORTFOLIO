"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Filter } from "lucide-react"

interface Project {
  id: number
  title: string
  category: string
  description?: string
  images: {
    id: number
    image: string
    is_main: boolean
  }[]
}

export default function TypographyPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("All")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects?category=Typography", {
          cache: "no-store", // Disable caching
        })

        if (!response.ok) {
          throw new Error("Failed to fetch typography projects")
        }

        const data = await response.json()
        console.log("Fetched typography projects:", data)

        // Handle both paginated and non-paginated responses
        const projectsArray = data.results || data
        if (Array.isArray(projectsArray)) {
          setProjects(projectsArray)
        } else {
          console.error("Unexpected data format:", data)
          setProjects([])
        }
      } catch (error) {
        console.error("Error fetching typography projects:", error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects based on the active filter
  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) => {
          // You can add more specific filters here based on project properties
          return (
            project.title.includes(activeFilter) || (project.description && project.description.includes(activeFilter))
          )
        })

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Typography</h1>
          <p className="text-zinc-400 max-w-2xl mb-12">
            Exploring the art of type design, lettering, and typographic compositions across various mediums and styles.
          </p>
        </motion.div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", "Lettering", "Type Design", "Editorial"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeFilter === filter ? "bg-orange-500 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full">
            <Filter size={16} />
            <span className="hidden md:inline">Filter</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-zinc-900 rounded-xl aspect-square animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filteredProjects.map((project, index) => {
              // Get the main image or the first image
              const mainImage = project.images?.find((img) => img.is_main) || project.images?.[0]
              const imageUrl = mainImage?.image || `/placeholder.svg?height=600&width=600&text=Typography+${index + 1}`

              return (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="block group relative overflow-hidden rounded-xl aspect-square bg-zinc-900"
                  >
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div>
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="text-zinc-400">{project.category}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4">No Typography Projects Found</h3>
            <p className="text-zinc-400 mb-8">
              There are currently no typography projects available. Check back later or explore other categories.
            </p>
            <Link
              href="/projects"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors"
            >
              View All Projects
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
