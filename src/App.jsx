import React from 'react'
import UnderwaterScene from './components/UnderwaterScene'

function GlassCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-cyan-100 text-xl sm:text-2xl font-semibold tracking-wide drop-shadow">{title}</h3>
          {subtitle && <p className="text-cyan-200/70 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-4 sm:mt-6 text-cyan-50/90 text-sm sm:text-base">{children}</div>}
    </div>
  )
}

function GlassButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-cyan-50 \
      bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-white/30 \" +
      " shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all ${className}`}
    >
      <span className="absolute inset-0 rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,0.25),rgba(255,255,255,0))] opacity-70 pointer-events-none" />
      {children}
    </button>
  )
}

function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#031a2a] text-white relative">
      {/* 3D background */}
      <div className="fixed inset-0 -z-10">
        <UnderwaterScene />
      </div>

      {/* Top Nav */}
      <header className="w-full sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/30 border border-white/20 shadow-inner" />
              <span className="text-cyan-100 font-semibold tracking-wide">AQUA.ONE</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-cyan-50/80 text-sm">
              <a href="#features" className="hover:text-cyan-50 transition-colors">Features</a>
              <a href="#tech" className="hover:text-cyan-50 transition-colors">Tech</a>
              <a href="#pricing" className="hover:text-cyan-50 transition-colors">Pricing</a>
              <a href="/test" className="hover:text-cyan-50 transition-colors">Status</a>
            </nav>
            <div className="flex items-center gap-3">
              <GlassButton>Sign in</GlassButton>
              <GlassButton className="hidden sm:inline-flex bg-cyan-400/20 border-cyan-300/30 hover:border-cyan-200/60">Get started</GlassButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-cyan-100 via-cyan-200 to-cyan-400/80 drop-shadow">
              Water, Reimagined
            </h1>
            <p className="mt-4 sm:mt-6 text-cyan-100/80 text-base sm:text-lg max-w-2xl mx-auto">
              Premium hydration technology with real-time sensing, aerospace glass, and ocean-grade design.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <GlassButton className="bg-cyan-400/30 border-cyan-200/40 hover:border-cyan-100/70">Preorder now</GlassButton>
              <GlassButton>Learn more</GlassButton>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              ['24h', 'Cold Retention'],
              ['12h', 'Heat Retention'],
              ['1.5L', 'Capacity'],
              ['< 400g', 'Weight']
            ].map(([k, v]) => (
              <div key={k} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-6 text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-cyan-100 drop-shadow">{k}</div>
                <div className="text-xs sm:text-sm text-cyan-100/70 mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-4 sm:gap-6">
          <GlassCard title="Smart Hydration" subtitle="AI-driven intake and reminders">
            Live analytics, adaptive reminders, and effortless daily goals.
          </GlassCard>
          <GlassCard title="Aerospace Glass" subtitle="Crystal clarity, extreme durability">
            Ultra-strong, scratch resistant, and beautifully transparent.
          </GlassCard>
          <GlassCard title="Ocean Optics" subtitle="Bio-inspired caustics & refraction">
            Dynamic light play creates a calming, immersive ambiance.
          </GlassCard>
          <GlassCard title="Thermal Core" subtitle="24h cold / 12h hot">
            Multi-layer vacuum microstructure keeps beverages perfect.
          </GlassCard>
          <GlassCard title="Seamless App" subtitle="Cloud sync & insights">
            Cross-device sync, privacy-first design, and rich insights.
          </GlassCard>
          <GlassCard title="Sustainably Made" subtitle="Traceable supply chain">
            Recycled materials, minimal footprint, and ethical sourcing.
          </GlassCard>
        </div>
      </section>

      {/* Tech Section */}
      <section id="tech" className="relative z-10 pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <GlassCard title="Real-time Sensing" subtitle="Capacitive + temp + motion">
            Our embedded sensor array samples at 100Hz, unlocking accurate intake detection and motion-aware spill prevention.
          </GlassCard>
          <GlassCard title="Edge + Cloud" subtitle="Bluetooth LE + secure sync">
            Low-latency device pairing with encrypted uploads for longitudinal wellness trends.
          </GlassCard>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="relative z-10 pb-24">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-4 sm:gap-6 items-end">
          <GlassCard title="Starter" subtitle="$79" className="md:translate-y-4">
            Essentials for elevated hydration. Great to try the experience.
            <div className="mt-6"><GlassButton className="w-full">Choose Starter</GlassButton></div>
          </GlassCard>
          <GlassCard title="Pro" subtitle="$129" className="ring-1 ring-cyan-200/40">
            Best for daily carry with real-time sensing and premium glass.
            <div className="mt-6"><GlassButton className="w-full bg-cyan-400/30 border-cyan-200/40">Choose Pro</GlassButton></div>
          </GlassCard>
          <GlassCard title="Elite" subtitle="$199" className="md:translate-y-4">
            Everything we offer + exclusive finishes and extended warranty.
            <div className="mt-6"><GlassButton className="w-full">Choose Elite</GlassButton></div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pb-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-cyan-100/80 text-sm">© {new Date().getFullYear()} AQUA.ONE</div>
            <div className="flex items-center gap-4 text-cyan-100/70 text-sm">
              <a href="#" className="hover:text-cyan-50">Privacy</a>
              <a href="#" className="hover:text-cyan-50">Terms</a>
              <a href="#" className="hover:text-cyan-50">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
