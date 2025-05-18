import Image from "next/image"
import JourneyTimeline from "@/components/journey-timeline"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div id="stars-container" className="absolute inset-0 overflow-hidden"></div>
      </div>

      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Me</h1>
              <p className="text-zinc-400 text-lg mb-8">
                I'm a passionate graphic designer with over 8 years of experience creating impactful visual solutions
                for brands and businesses.
              </p>
              <p className="text-zinc-400 mb-8">
                My design philosophy centers around the perfect balance of aesthetics and functionality. I believe that
                great design should not only look beautiful but also effectively communicate the intended message and
                solve real problems.
              </p>
              <p className="text-zinc-400 mb-8">
                Throughout my career, I've had the privilege of working with clients across various industries, from
                tech startups to established retail brands. This diverse experience has honed my ability to adapt my
                design approach to different brand voices and target audiences.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-orange-500">8+</p>
                  <p className="text-zinc-400">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">120+</p>
                  <p className="text-zinc-400">Projects Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">15+</p>
                  <p className="text-zinc-400">Design Awards</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">40+</p>
                  <p className="text-zinc-400">Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=800&width=600&text=Designer+Portrait"
                  alt="Designer Portrait"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-2/3 h-2/3 bg-orange-500/20 rounded-2xl -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-2/3 h-2/3 bg-orange-500/10 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-900/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">My Journey</h2>
          <JourneyTimeline />
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">My Skills</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Photoshop", icon: "/placeholder.svg?height=80&width=80&text=Ps" },
              { name: "Illustrator", icon: "/placeholder.svg?height=80&width=80&text=Ai" },
              { name: "InDesign", icon: "/placeholder.svg?height=80&width=80&text=Id" },
              { name: "After Effects", icon: "/placeholder.svg?height=80&width=80&text=Ae" },
              { name: "Figma", icon: "/placeholder.svg?height=80&width=80&text=Figma" },
              { name: "Sketch", icon: "/placeholder.svg?height=80&width=80&text=Sketch" },
              { name: "XD", icon: "/placeholder.svg?height=80&width=80&text=XD" },
              { name: "Blender", icon: "/placeholder.svg?height=80&width=80&text=Blender" },
              { name: "Cinema 4D", icon: "/placeholder.svg?height=80&width=80&text=C4D" },
              { name: "Procreate", icon: "/placeholder.svg?height=80&width=80&text=Procreate" },
              { name: "Lightroom", icon: "/placeholder.svg?height=80&width=80&text=Lr" },
              { name: "Premiere Pro", icon: "/placeholder.svg?height=80&width=80&text=Pr" },
            ].map((skill, index) => (
              <div key={index} className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-lg backdrop-blur-sm">
                  <img src={skill.icon || "/placeholder.svg"} alt={skill.name} className="w-12 h-12" />
                </div>
                <p className="text-center">{skill.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
