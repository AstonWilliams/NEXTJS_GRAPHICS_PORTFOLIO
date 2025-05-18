"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

interface Project {
  id: number
  title: string
  category: string
  description?: string
  tags?: string[]
  images: {
    id: number
    image: string
    is_main: boolean
  }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log(`Fetching projects with category: ${selectedCategory}`)
        const response = await fetch(`/api/projects?category=${selectedCategory}`, {
          cache: "no-store", // Disable caching
        })

        if (!response.ok) {
          console.error(`API error: ${response.status}`)
          const errorText = await response.text()
          console.error(`Error response: ${errorText}`)
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        console.log(`Fetched ${Array.isArray(data) ? data.length : 0} projects:`, data)
        setProjects(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        setLoading(false)
      }
    }

    fetchProjects()
  }, [selectedCategory])

  useEffect(() => {
    // Filter projects based on search query
    let filtered = [...projects]

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setVisibleProjects(filtered.slice(0, visibleCount))
  }, [projects, searchQuery, visibleCount])

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12)
  }

  const categories = ["All", "Typography", "Print", "Digital", "Branding", "UI/UX"]

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div id="stars-container" className="absolute inset-0 overflow-hidden"></div>
      </div>

      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Projects</h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore my complete portfolio of work across typography, print, and digital design.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg w-full md:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {visibleProjects.length > 0
                  ? visibleProjects.map((project, index) => {
                      // Get the main image or the first image
                      const mainImage = project.images?.find((img) => img.is_main) || project.images?.[0]
                      const imageUrl = mainImage?.image || "/placeholder.svg?height=600&width=600&text=No+Image"

                      return (
                        <motion.div
                          key={project.id}
                          className="bg-zinc-900/40 backdrop-blur-sm rounded-xl overflow-hidden"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                          }}
                        >
                          <Link href={`/projects/${project.id}`} className="group block relative">
                            <div className="relative h-64 overflow-hidden">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute top-2 right-2 bg-black/50 rounded-full px-3 py-1 text-xs">
                                {project.category}
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-zinc-400 line-clamp-2">
                                {project.description || "A creative project showcasing innovative design solutions."}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-4">
                                {project.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                                  <span key={tagIndex} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })
                  : // Fallback to placeholder projects if none are found
                    Array(8)
                      .fill(0)
                      .map((_, index) => (
                        <motion.div
                          key={index}
                          className="bg-zinc-900/40 backdrop-blur-sm rounded-xl overflow-hidden"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                          }}
                        >
                          <div className="relative h-64 overflow-hidden">
                            <img
                              src={`/placeholder.svg?height=600&width=600&text=Project+${index + 1}`}
                              alt={`Project ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/50 rounded-full px-3 py-1 text-xs">
                              {categories[Math.floor(Math.random() * (categories.length - 1)) + 1]}
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">Sample Project {index + 1}</h3>
                            <p className="text-zinc-400 line-clamp-2">
                              This is a sample project to demonstrate the layout. Create real projects in the admin
                              panel.
                            </p>
                          </div>
                        </motion.div>
                      ))}
              </motion.div>

              {visibleProjects.length === 0 && !loading && searchQuery && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-4">No projects found</h3>
                  <p className="text-zinc-400">Try changing your filter or search criteria</p>
                </div>
              )}

              {visibleCount <
                projects.filter(
                  (project) =>
                    !searchQuery ||
                    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                ).length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
