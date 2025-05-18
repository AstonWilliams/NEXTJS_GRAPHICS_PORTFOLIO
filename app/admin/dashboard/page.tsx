"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ImageIcon,
  Type,
  Printer,
  Monitor,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Check,
  X,
} from "lucide-react"

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Use refs to track token verification state
  const tokenVerified = useRef(false)
  const tokenRefreshInProgress = useRef(false)
  const lastTokenRefresh = useRef(0)
  const fetchTimeoutRef = useRef(null)

  // Update the useEffect hook to prevent the infinite loop with multiple devices
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/admin")
      return
    }

    // Prevent multiple simultaneous verification attempts
    if (tokenVerified.current || tokenRefreshInProgress.current) {
      return
    }

    // Verify token validity only once when the component mounts
    const verifyToken = async () => {
      try {
        tokenRefreshInProgress.current = true
        setError(null)

        console.log("Verifying token...")

        // First check if token is valid
        const verifyResponse = await fetch(`/api/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          cache: "no-store",
        })

        if (verifyResponse.ok) {
          // Token is valid
          tokenVerified.current = true
          lastTokenRefresh.current = Date.now()
          fetchData() // Fetch data after token verification
        } else {
          // Token is invalid, try to refresh
          const refreshToken = localStorage.getItem("refreshToken")
          if (!refreshToken) {
            // No refresh token, redirect to login
            localStorage.removeItem("authToken")
            router.push("/admin")
            return
          }

          try {
            const refreshResponse = await fetch(`/api/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refresh: refreshToken }),
              cache: "no-store",
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem("authToken", data.access)
              lastTokenRefresh.current = Date.now()
              tokenVerified.current = true
              fetchData() // Fetch data after token refresh
            } else {
              // Refresh failed, redirect to login
              localStorage.removeItem("authToken")
              localStorage.removeItem("refreshToken")
              localStorage.removeItem("user")
              router.push("/admin")
            }
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError)
            setError("Failed to refresh authentication token")
            router.push("/admin")
          }
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setError("Failed to verify authentication token")
        router.push("/admin")
      } finally {
        tokenRefreshInProgress.current = false
      }
    }

    // Fetch data function
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("authToken")

      try {
        if (
          activeSection === "dashboard" ||
          activeSection === "projects" ||
          activeSection === "typography" ||
          activeSection === "print" ||
          activeSection === "digital"
        ) {
          let endpoint = "/api/admin/projects"
          if (activeSection !== "dashboard" && activeSection !== "projects") {
            endpoint += `?category=${activeSection}`
          }

          console.log(`Fetching projects from endpoint: ${endpoint}`)
          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store", // Disable caching
          })

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired, redirect to login
              localStorage.removeItem("authToken")
              router.push("/admin")
              return
            }
            console.error(`Failed to fetch projects: ${response.status}`)
            const errorText = await response.text()
            console.error(`Error response: ${errorText}`)
            throw new Error("Failed to fetch projects")
          }

          const data = await response.json()
          console.log(`Fetched projects data:`, data)

          // Handle both paginated and non-paginated responses
          const projectsArray = data.results || data
          if (Array.isArray(projectsArray)) {
            setProjects(projectsArray)
          } else {
            console.error("Unexpected data format:", data)
            setProjects([])
          }
        }

        if (activeSection === "dashboard" || activeSection === "messages") {
          const response = await fetch("/api/admin/messages", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store", // Disable caching
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`Fetched messages data:`, data)

            // Handle both paginated and non-paginated responses
            const messagesArray = data.results || data
            if (Array.isArray(messagesArray)) {
              setMessages(messagesArray)
            } else {
              console.error("Unexpected messages data format:", data)
              setMessages([])
            }
          } else {
            console.error(`Failed to fetch messages: ${response.status}`)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    // Only verify token once when component mounts
    verifyToken()

    // Set up a refresh interval (every 30 minutes) to keep the token fresh
    const refreshInterval = setInterval(
      () => {
        // Only refresh if the last refresh was more than 25 minutes ago
        if (Date.now() - lastTokenRefresh.current > 25 * 60 * 1000) {
          tokenVerified.current = false // Force re-verification
          verifyToken()
        }
      },
      30 * 60 * 1000, // 30 minutes
    )

    return () => {
      clearInterval(refreshInterval)
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [activeSection, router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    router.push("/admin")
  }

  const handleDeleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch(`/api/admin/projects/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Remove project from state
          setProjects(projects.filter((project) => project.id !== id))
        } else {
          throw new Error("Failed to delete project")
        }
      } catch (error) {
        console.error("Error deleting project:", error)
        alert("Failed to delete project")
      }
    }
  }

  const handleMarkMessageAsRead = async (id, isRead) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_read: isRead }),
      })

      if (response.ok) {
        // Update message in state
        setMessages(messages.map((message) => (message.id === id ? { ...message, is_read: isRead } : message)))
      } else {
        throw new Error("Failed to update message")
      }
    } catch (error) {
      console.error("Error updating message:", error)
      alert("Failed to update message")
    }
  }

  const handleDeleteMessage = async (id) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch(`/api/admin/messages/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Remove message from state
          setMessages(messages.filter((message) => message.id !== id))
        } else {
          throw new Error("Failed to delete message")
        }
      } catch (error) {
        console.error("Error deleting message:", error)
        alert("Failed to delete message")
      }
    }
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-black flex-shrink-0">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className="text-xl font-bold hidden md:block">Admin Panel</span>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <LayoutDashboard size={20} />
                <span className="hidden md:block">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("projects")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "projects"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <ImageIcon size={20} />
                <span className="hidden md:block">All Projects</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("typography")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "typography"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Type size={20} />
                <span className="hidden md:block">Typography</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("print")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "print"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Printer size={20} />
                <span className="hidden md:block">Print</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("digital")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "digital"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Monitor size={20} />
                <span className="hidden md:block">Digital</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("messages")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "messages"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <MessageSquare size={20} />
                <span className="hidden md:block">Messages</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("settings")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === "settings"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Settings size={20} />
                <span className="hidden md:block">Settings</span>
              </button>
            </li>
          </ul>

          <div className="pt-6 mt-6 border-t border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                target="_blank"
              >
                View Site
              </Link>
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                <span className="font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {activeSection === "dashboard" && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-zinc-900 rounded-xl p-6">
                      <h3 className="text-zinc-400 text-sm mb-2">Total Projects</h3>
                      <p className="text-3xl font-bold">{projects.length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-6">
                      <h3 className="text-zinc-400 text-sm mb-2">Typography</h3>
                      <p className="text-3xl font-bold">{projects.filter((p) => p.category === "Typography").length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-6">
                      <h3 className="text-zinc-400 text-sm mb-2">Print</h3>
                      <p className="text-3xl font-bold">{projects.filter((p) => p.category === "Print").length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-6">
                      <h3 className="text-zinc-400 text-sm mb-2">Digital</h3>
                      <p className="text-3xl font-bold">{projects.filter((p) => p.category === "Digital").length}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Recent Projects</h2>
                      <Link
                        href="/admin/projects/new"
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add New Project
                      </Link>
                    </div>
                    {projects.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-zinc-800">
                              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Project</th>
                              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
                              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                              <th className="text-right py-3 px-4 text-zinc-400 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projects.slice(0, 5).map((project) => (
                              <tr key={project.id} className="border-b border-zinc-800">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        project.images && project.images.length > 0
                                          ? project.images[0].image
                                          : "/placeholder.svg?height=40&width=40&text=No+Image"
                                      }
                                      alt={project.title}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                    <span>{project.title}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">{project.category}</td>
                                <td className="py-3 px-4">{project.date}</td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/admin/projects/${project.id}/edit`}
                                      className="p-1 text-zinc-400 hover:text-white"
                                    >
                                      <Edit size={16} />
                                    </Link>
                                    <button
                                      className="p-1 text-zinc-400 hover:text-red-500"
                                      onClick={() => handleDeleteProject(project.id)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-zinc-400 mb-4">No projects found</p>
                        <Link
                          href="/admin/projects/new"
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Add New Project
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Recent Messages</h2>
                    <div className="space-y-4">
                      {messages.slice(0, 3).map((message) => (
                        <div
                          key={message.id}
                          className={`border ${message.is_read ? "border-zinc-800" : "border-orange-500/30"} rounded-lg p-4`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">{message.name}</h3>
                            <span className="text-xs text-zinc-500">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-sm mb-2">
                            {message.message.length > 100 ? `${message.message.substring(0, 100)}...` : message.message}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-500">{message.email}</span>
                            <div className="flex gap-2">
                              {!message.is_read && (
                                <button
                                  className="text-sm text-green-500 hover:text-green-400 flex items-center gap-1"
                                  onClick={() => handleMarkMessageAsRead(message.id, true)}
                                >
                                  <Check size={14} /> Mark as Read
                                </button>
                              )}
                              {message.is_read && (
                                <button
                                  className="text-sm text-zinc-500 hover:text-zinc-400 flex items-center gap-1"
                                  onClick={() => handleMarkMessageAsRead(message.id, false)}
                                >
                                  <X size={14} /> Mark as Unread
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-zinc-400">No messages yet</p>
                        </div>
                      )}
                      {messages.length > 3 && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setActiveSection("messages")}
                            className="text-orange-500 hover:text-orange-400"
                          >
                            View All Messages
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(activeSection === "projects" ||
                activeSection === "typography" ||
                activeSection === "print" ||
                activeSection === "digital") && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
                      />
                    </div>

                    <Link
                      href="/admin/projects/new"
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add New Project
                    </Link>
                  </div>

                  {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects
                        .filter(
                          (project) =>
                            activeSection === "projects" || project.category?.toLowerCase() === activeSection,
                        )
                        .map((project) => (
                          <div key={project.id} className="bg-zinc-900 rounded-xl overflow-hidden">
                            <div className="relative h-48">
                              <img
                                src={
                                  project.images && project.images.length > 0
                                    ? project.images[0].image
                                    : "/placeholder.svg?height=200&width=300&text=No+Image"
                                }
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <div className="relative">
                                  <button className="p-2 bg-black/50 rounded-full">
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold mb-1">{project.title}</h3>
                              <p className="text-zinc-400 text-sm mb-4">{project.category}</p>
                              <div className="flex justify-between">
                                <Link
                                  href={`/admin/projects/${project.id}/edit`}
                                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-sm"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors text-sm"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900 rounded-xl p-8 text-center">
                      <p className="text-zinc-400 mb-4">No projects found.</p>
                      <Link
                        href="/admin/projects/new"
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add New Project
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "messages" && (
                <div className="bg-zinc-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">Messages</h2>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`border ${message.is_read ? "border-zinc-800" : "border-orange-500/30"} rounded-lg p-4`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{message.name}</h3>
                          <span className="text-xs text-zinc-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-2">
                          {message.subject && <strong>{message.subject}: </strong>}
                          {message.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">{message.email}</span>
                          <div className="flex gap-2">
                            <button
                              className="text-sm text-orange-500 hover:text-orange-400"
                              onClick={() => handleMarkMessageAsRead(message.id, !message.is_read)}
                            >
                              {message.is_read ? "Mark as Unread" : "Mark as Read"}
                            </button>
                            <button
                              className="text-sm text-red-500 hover:text-red-400"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-zinc-400">No messages yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "settings" && (
                <div className="bg-zinc-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Site Title</label>
                          <input
                            type="text"
                            defaultValue="DesignSpace"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Site Description</label>
                          <textarea
                            defaultValue="A showcase of innovative graphic design work across typography, print, and digital media."
                            rows={3}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Admin Access</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Change Password</label>
                          <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
