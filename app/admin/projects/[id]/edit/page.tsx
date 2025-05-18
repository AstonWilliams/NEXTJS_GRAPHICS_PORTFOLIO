"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Loader2, Trash2 } from "lucide-react"

interface ProjectImage {
  id: number
  image: string
  is_main: boolean
  alt_text?: string
}

interface Project {
  id: number
  title: string
  category: string
  description: string
  client?: string
  date: string
  featured: boolean
  tags: string[]
  images: ProjectImage[]
}

export default function EditProjectPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "Typography",
    description: "",
    client: "",
    date: "",
    featured: false,
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()

  // Check authentication and fetch project data
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data = await response.json()
        setProject(data)
        setFormData({
          title: data.title,
          category: data.category,
          description: data.description,
          client: data.client || "",
          date: data.date,
          featured: data.featured,
        })
        setTags(data.tags || [])
        setExistingImages(data.images || [])
      } catch (error) {
        console.error("Error fetching project:", error)
        setError("Failed to load project data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [router, params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)

      // Create preview URLs
      const newImagePreviewUrls = filesArray.map((file) => URL.createObjectURL(file))

      setSelectedImages((prev) => [...prev, ...filesArray])
      setImagePreviewUrls((prev) => [...prev, ...newImagePreviewUrls])
    }
  }

  const handleRemoveNewImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleSetMainImage = (imageId: number) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_main: img.id === imageId,
      })),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Not authenticated")
      }

      // Create form data
      const projectFormData = new FormData()

      // Add project details
      Object.entries(formData).forEach(([key, value]) => {
        projectFormData.append(key, value.toString())
      })

      // Add tags
      tags.forEach((tag) => {
        projectFormData.append("tags", tag)
      })

      // Add existing image IDs to keep
      const existingImageIds = existingImages.map((img) => img.id)
      projectFormData.append("existing_images", JSON.stringify(existingImageIds))

      // Set main image
      const mainImage = existingImages.find((img) => img.is_main)
      if (mainImage) {
        projectFormData.append("main_image_id", mainImage.id.toString())
      }

      // Add new images
      selectedImages.forEach((image) => {
        projectFormData.append("images", image)
      })

      // Send data to API
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: projectFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update project")
      }

      // Redirect to dashboard on success
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error updating project:", error)
      setError(error instanceof Error ? error.message : "An error occurred while updating the project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete project")
      }

      // Redirect to dashboard on success
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error deleting project:", error)
      setError(error instanceof Error ? error.message : "An error occurred while deleting the project")
    }
  }

  const categories = ["Typography", "Print", "Digital", "Branding", "UI/UX"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading project data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">Edit Project</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium mb-2">
                Client
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                placeholder="e.g., 2023 or Jan 2023"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-zinc-800 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Existing Images</label>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                      <img
                        src={image.image || "/placeholder.svg"}
                        alt={image.alt_text || "Project image"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(image.id)}
                          className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 flex justify-between items-center px-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(image.id)}
                          className={`text-xs ${image.is_main ? "text-orange-500" : "text-white"}`}
                        >
                          {image.is_main ? "Main Image" : "Set as Main"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 mb-4">No existing images</p>
              )}

              <label className="block text-sm font-medium mb-2">Add New Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700/50 transition-colors">
                  <Upload size={24} className="mb-2 text-zinc-500" />
                  <span className="text-sm text-zinc-500">Add Image</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded focus:ring-orange-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm">
                  Featured Project
                </label>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Featured projects will be displayed prominently on the homepage.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete Project
            </button>

            <div className="flex gap-4">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
