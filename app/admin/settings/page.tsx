"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut, Shield, Server } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    contact_email: "",
  })
  const [sessions, setSessions] = useState([])
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/admin/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSessions(data)
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
    fetchSessions()
  }, [router])

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to save settings" })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully. You will be logged out." })
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })

        // Log out after password change
        setTimeout(() => {
          localStorage.removeItem("authToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          router.push("/admin")
        }, 2000)
      } else {
        setMessage({ type: "error", text: data.message || "Failed to change password" })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setMessage({ type: "error", text: "Failed to change password" })
    } finally {
      setIsLoading(false)
    }
  }

  const logoutFromAllDevices = async () => {
    if (!confirm("Are you sure you want to log out from all devices? You will need to log in again.")) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/auth/logout-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Logged out from all devices. You will be redirected to login." })

        // Log out after successful logout from all devices
        setTimeout(() => {
          localStorage.removeItem("authToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          router.push("/admin")
        }, 2000)
      } else {
        setMessage({ type: "error", text: "Failed to log out from all devices" })
      }
    } catch (error) {
      console.error("Error logging out from all devices:", error)
      setMessage({ type: "error", text: "Failed to log out from all devices" })
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (tokenId) => {
    if (!confirm("Are you sure you want to revoke this session?")) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id: tokenId }),
      })

      if (response.ok) {
        // Update sessions list
        setSessions(sessions.filter((session) => session.id !== tokenId))
        setMessage({ type: "success", text: "Session revoked successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to revoke session" })
      }
    } catch (error) {
      console.error("Error revoking session:", error)
      setMessage({ type: "error", text: "Failed to revoke session" })
    } finally {
      setIsLoading(false)
    }
  }

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
              <a
                href="/admin/dashboard"
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <Settings size={20} />
                <span className="hidden md:block">Dashboard</span>
              </a>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === "general"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Settings size={20} />
                <span className="hidden md:block">General Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === "security"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Shield size={20} />
                <span className="hidden md:block">Security</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === "sessions"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Server size={20} />
                <span className="hidden md:block">Active Sessions</span>
              </button>
            </li>
          </ul>

          <div className="pt-6 mt-6 border-t border-zinc-800">
            <button
              onClick={() => {
                localStorage.removeItem("authToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                router.push("/admin")
              }}
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
            <h1 className="text-xl font-bold">Settings</h1>

            <div className="flex items-center gap-4">
              <a
                href="/"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                View Site
              </a>
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                <span className="font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {activeTab === "general" && (
                <div className="bg-zinc-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Site Title</label>
                      <input
                        type="text"
                        name="site_title"
                        value={settings.site_title}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Site Description</label>
                      <textarea
                        name="site_description"
                        value={settings.site_description}
                        onChange={handleSettingsChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Email</label>
                      <input
                        type="email"
                        name="contact_email"
                        value={settings.contact_email}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={saveSettings}
                        disabled={isLoading}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-zinc-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Password</label>
                          <input
                            type="password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">New Password</label>
                          <input
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={changePassword}
                            disabled={isLoading}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoading ? "Changing..." : "Change Password"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-800">
                      <h3 className="text-lg font-medium mb-4">Session Management</h3>
                      <div>
                        <button
                          onClick={logoutFromAllDevices}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? "Processing..." : "Log Out From All Devices"}
                        </button>
                        <p className="text-sm text-zinc-400 mt-2">
                          This will log you out from all devices. You will need to log in again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sessions" && (
                <div className="bg-zinc-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`border ${
                            session.current ? "border-orange-500/30" : "border-zinc-800"
                          } rounded-lg p-4`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Server size={16} />
                                <span className="font-medium">{session.current ? "Current Session" : "Session"}</span>
                                {session.current && (
                                  <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-zinc-400 mt-1">
                                <p>Created: {new Date(session.created_at).toLocaleString()}</p>
                                <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              {!session.current && (
                                <button
                                  onClick={() => revokeSession(session.id)}
                                  className="text-sm text-red-500 hover:text-red-400"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-zinc-400">No active sessions found.</p>
                      </div>
                    )}
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
