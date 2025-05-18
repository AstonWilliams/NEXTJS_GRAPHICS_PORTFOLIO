"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Hero from "@/components/hero"
import FeaturedWorks from "@/components/featured-works"

interface Project {
  id: number
  title: string
  category: string
  images: {
    id: number
    image: string
    is_main: boolean
  }[]
}

export default function Home() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects?limit=3", {
          cache: "no-store", // Disable caching
        })

        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        console.log("Fetched recent projects:", data)

        // Handle both paginated and non-paginated responses
        const projectsArray = data.results || data
        if (Array.isArray(projectsArray) && projectsArray.length > 0) {
          setRecentProjects(projectsArray)
        }
      } catch (error) {
        console.error("Error fetching recent projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <FeaturedWorks />

      <section className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Explore My Work</h2>
          <div className="flex gap-4">
            <Link
              href="/typography"
              className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
            >
              Typography <ArrowRight size={16} />
            </Link>
            <Link
              href="/print"
              className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
            >
              Print <ArrowRight size={16} />
            </Link>
            <Link
              href="/digital"
              className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
            >
              Digital <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? // Loading state
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl aspect-square bg-zinc-900 animate-pulse"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-zinc-700">Loading...</span>
                    </div>
                  </div>
                ))
            : recentProjects.length > 0
              ? // Display real projects
                recentProjects.map((project) => {
                  // Get the main image or the first image
                  const mainImage = project.images?.find((img) => img.is_main) || project.images?.[0]
                  const imageUrl =
                    mainImage?.image || `/placeholder.svg?height=600&width=600&text=Project+${project.id}`

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group relative overflow-hidden rounded-xl aspect-square bg-zinc-900 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div>
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          <p className="text-zinc-400">{project.category}</p>
                        </div>
                      </div>
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  )
                })
              : // Fallback to placeholder projects if none are found
                [1, 2, 3].map((item) => (
                  <Link
                    key={item}
                    href={`/projects/project-${item}`}
                    className="group relative overflow-hidden rounded-xl aspect-square bg-zinc-900 hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div>
                        <h3 className="text-xl font-bold">Project Title {item}</h3>
                        <p className="text-zinc-400">Digital Design</p>
                      </div>
                    </div>
                    <img
                      src={`/placeholder.svg?height=600&width=600&text=Project+${item}`}
                      alt={`Project ${item}`}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/projects" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors">
            View All Projects
          </Link>
        </div>
      </section>
    </main>
  )
}
