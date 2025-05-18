"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Mail, MapPin, Phone, Instagram, Twitter, Dribbble, Linkedin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div id="stars-container" className="absolute inset-0 overflow-hidden"></div>
      </div>

      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Have a project in mind or want to discuss a collaboration? I'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900/40 backdrop-blur-sm rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-orange-500 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-zinc-400">hello@designspace.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-orange-500 flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Location</h3>
                      <p className="text-zinc-400">New York, NY</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-orange-500 flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-zinc-400">Available upon request</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Find Me On</h2>

                <div className="flex gap-4 mb-8">
                  <a
                    href="https://instagram.com"
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="https://twitter.com"
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
                  >
                    <Twitter size={18} />
                  </a>
                  <a
                    href="https://dribbble.com"
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
                  >
                    <Dribbble size={18} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>

                <div className="bg-zinc-800 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Freelance Platforms</h3>
                  <p className="text-zinc-400 mb-4">You can also hire me through these platforms:</p>
                  <div className="flex flex-col gap-4">
                    <a
                      href="https://fiverr.com"
                      className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                    >
                      <img src="/placeholder.svg?height=24&width=24&text=F" alt="Fiverr" className="w-6 h-6" />
                      Fiverr Profile
                    </a>
                    <a
                      href="https://upwork.com"
                      className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                    >
                      <img src="/placeholder.svg?height=24&width=24&text=U" alt="Upwork" className="w-6 h-6" />
                      Upwork Profile
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900/40 backdrop-blur-sm rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                {status === "success" ? (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                    <p className="text-zinc-300 mb-4">Thank you for reaching out. I'll get back to you soon.</p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === "error" && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                        <p className="text-red-500">{errorMessage || "Something went wrong. Please try again."}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors flex items-center gap-2 ${
                        status === "submitting" ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {status === "submitting" ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
