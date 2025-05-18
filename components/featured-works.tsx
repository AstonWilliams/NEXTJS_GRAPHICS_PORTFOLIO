"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Project {
  id: number
  title: string
  category: string
  description: string
  images: {
    id: number
    image: string
    is_main: boolean
  }[]
}

export default function FeaturedWorks() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await fetch("/api/projects?featured=true", {
          cache: "no-store", // Disable caching
        })

        if (!response.ok) {
          throw new Error("Failed to fetch featured projects")
        }

        const data = await response.json()
        console.log("Fetched featured projects:", data)

        // Handle both paginated and non-paginated responses
        const projectsArray = data.results || data
        if (Array.isArray(projectsArray) && projectsArray.length > 0) {
          setFeaturedProjects(projectsArray)
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProjects()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              A selection of my most notable projects across various design disciplines.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProjects.length === 0) {
    return null // Don't show the section if there are no featured projects
  }

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            A selection of my most notable projects across various design disciplines.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 mt-16">
          {featuredProjects.map((project, index) => {
            // Get the main image or the first image
            const mainImage = project.images?.find((img) => img.is_main) || project.images?.[0]
            const imageUrl = mainImage?.image || `/placeholder.svg?height=600&width=1200&text=Project+${project.id}`

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 items-center`}
              >
                <div className="w-full md:w-1/2">
                  <Link href={`/projects/${project.id}`} className="block overflow-hidden rounded-xl group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-orange-500 font-medium">{project.category}</span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{project.title}</h3>
                  <p className="text-zinc-400 mb-6">
                    {project.description?.substring(0, 200)}
                    {project.description?.length > 200 ? "..." : ""}
                  </p>
                  <Link
                    href={`/projects/${project.id}`}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors inline-block"
                  >
                    View Project
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
