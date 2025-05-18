"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Tag, Share2, User, ExternalLink } from "lucide-react"

interface Project {
  id: number
  title: string
  category: string
  date: string
  client?: string
  description: string
  tags: string[]
  images: {
    id: number
    image: string
    is_main: boolean
    alt_text: string
  }[]
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<any[]>([])

  useEffect(() => {
    async function fetchProject() {
      if (!params.id) return

      try {
        const response = await fetch(`/api/project/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data = await response.json()
        setProject(data)

        // Set the main image as selected, or the first image if no main image
        const mainImage = data.images.find((img: any) => img.is_main)
        setSelectedImage(mainImage ? mainImage.image : data.images[0]?.image)

        // Fetch related projects
        fetchRelatedProjects(data.category)
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchRelatedProjects(category: string) {
      try {
        const response = await fetch(`/api/projects?category=${category}&limit=3`)
        if (response.ok) {
          const data = await response.json()
          // Filter out the current project
          setRelatedProjects(data.filter((p: any) => p.id.toString() !== params.id))
        }
      } catch (error) {
        console.error("Error fetching related projects:", error)
      }
    }

    fetchProject()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative z-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white relative z-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-zinc-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-20 relative">
      <div className="absolute inset-0 z-0">
        <div id="stars-container" className="absolute inset-0 overflow-hidden"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <img
                src={selectedImage || project.images[0]?.image || "/placeholder.svg?text=No+Image"}
                alt={project.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </motion.div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {project.images.map((image, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  key={image.id}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image.image
                      ? "border-orange-500 shadow-lg shadow-orange-500/20"
                      : "border-transparent hover:border-orange-500/50"
                  }`}
                  onClick={() => setSelectedImage(image.image)}
                >
                  <img
                    src={image.image || "/placeholder.svg"}
                    alt={image.alt_text || `${project.title} thumbnail ${index + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-900/40 backdrop-blur-sm rounded-xl p-6 sticky top-24"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>

              <div className="flex flex-wrap gap-4 text-zinc-400 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-orange-500" />
                  <span>{project.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={16} className="text-orange-500" />
                  <span>{project.category}</span>
                </div>
                {project.client && (
                  <div className="flex items-center gap-1">
                    <User size={16} className="text-orange-500" />
                    <span>{project.client}</span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                {project.description.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-zinc-400 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-zinc-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Share</h3>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                View Live Project <ExternalLink size={16} />
              </a>
            </motion.div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.length > 0 ? (
              relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  href={`/projects/${relatedProject.id}`}
                  className="group relative overflow-hidden rounded-xl aspect-video bg-zinc-900/40 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold">{relatedProject.title}</h3>
                      <p className="text-zinc-400">{relatedProject.category}</p>
                    </div>
                  </div>
                  <img
                    src={
                      relatedProject.images && relatedProject.images.length > 0
                        ? relatedProject.images[0].image
                        : "/placeholder.svg?height=600&width=800&text=Related+Project"
                    }
                    alt={relatedProject.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))
            ) : (
              // Fallback if no related projects
              <div className="col-span-3 text-center py-10">
                <p className="text-zinc-400">No related projects found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
