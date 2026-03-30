import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ── Animated QR code SVG (original, no copyright) ── */
function AnimatedQR() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="h-full w-full" aria-hidden="true">
      {/* QR corner squares */}
      <rect x="8" y="8" width="40" height="40" rx="4" stroke="white" strokeWidth="3" fill="none" className="animate-[heroFadeIn_1s_ease_0.2s_both]" />
      <rect x="16" y="16" width="24" height="24" rx="2" fill="white" className="animate-[heroFadeIn_1s_ease_0.4s_both]" />
      <rect x="112" y="8" width="40" height="40" rx="4" stroke="white" strokeWidth="3" fill="none" className="animate-[heroFadeIn_1s_ease_0.3s_both]" />
      <rect x="120" y="16" width="24" height="24" rx="2" fill="white" className="animate-[heroFadeIn_1s_ease_0.5s_both]" />
      <rect x="8" y="112" width="40" height="40" rx="4" stroke="white" strokeWidth="3" fill="none" className="animate-[heroFadeIn_1s_ease_0.4s_both]" />
      <rect x="16" y="120" width="24" height="24" rx="2" fill="white" className="animate-[heroFadeIn_1s_ease_0.6s_both]" />
      {/* Data dots */}
      {[
        [60, 12], [76, 12], [92, 12],
        [60, 28], [76, 28],
        [60, 44], [92, 44],
        [12, 60], [28, 60], [44, 60], [60, 60], [76, 60], [92, 60], [108, 60], [124, 60], [140, 60],
        [12, 76], [44, 76], [76, 76], [108, 76], [140, 76],
        [12, 92], [28, 92], [44, 92], [60, 92], [76, 92], [92, 92], [108, 92], [124, 92], [140, 92],
        [60, 108], [76, 108], [92, 108],
        [60, 124], [92, 124],
        [108, 112], [124, 112], [140, 112],
        [108, 128], [140, 128],
        [108, 144], [124, 144], [140, 144],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="10"
          height="10"
          rx="2"
          fill="white"
          className="animate-[heroFadeIn_0.6s_ease_both]"
          style={{ animationDelay: `${0.5 + i * 0.025}s` }}
        />
      ))}
      {/* Scan line */}
      <rect x="4" y="0" width="152" height="3" rx="1.5" fill="#16A34A" className="animate-[heroScanLine_2.5s_ease-in-out_1.5s_infinite]" />
    </svg>
  );
}

/* ── Floating particle dots (original generative art) ── */
function FloatingParticles() {
  const particles = [
    { size: 4, x: "10%", y: "20%", delay: "0s", dur: "6s" },
    { size: 6, x: "25%", y: "70%", delay: "1s", dur: "8s" },
    { size: 3, x: "50%", y: "15%", delay: "2s", dur: "7s" },
    { size: 5, x: "70%", y: "60%", delay: "0.5s", dur: "9s" },
    { size: 4, x: "85%", y: "30%", delay: "1.5s", dur: "6.5s" },
    { size: 3, x: "40%", y: "85%", delay: "3s", dur: "7.5s" },
    { size: 5, x: "60%", y: "40%", delay: "2.5s", dur: "8.5s" },
    { size: 4, x: "15%", y: "50%", delay: "0.8s", dur: "7s" },
    { size: 6, x: "90%", y: "80%", delay: "1.2s", dur: "6s" },
    { size: 3, x: "35%", y: "35%", delay: "2.2s", dur: "9s" },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/20 animate-[heroFloat_var(--dur)_ease-in-out_var(--delay)_infinite]"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            "--delay": p.delay,
            "--dur": p.dur,
          } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/* ── Verification demo card ── */
function VerifyDemoCard() {
  return (
    <div className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-2xl animate-[heroFadeIn_1s_ease_0.8s_both]">
      {/* Phone mockup with QR */}
      <div className="mx-auto w-36 rounded-xl border-2 border-white/30 bg-gradient-to-b from-white/5 to-white/10 p-3">
        <AnimatedQR />
      </div>
      {/* Verification result */}
      <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 animate-[heroFadeIn_0.8s_ease_2.5s_both]">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-success" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-success">Authentic Product</span>
        </div>
        <p className="mt-1 text-xs text-white/70">PureLife Milk 1L — Batch DF-2025-001</p>
      </div>
      {/* Animated scan stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 animate-[heroFadeIn_0.8s_ease_3s_both]">
        <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">1</p>
          <p className="text-[10px] text-white/60">Scan Count</p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">1.2s</p>
          <p className="text-[10px] text-white/60">Verify Time</p>
        </div>
      </div>
    </div>
  );
}

/* ── Grid pattern SVG background ── */
function GridPattern() {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0v40" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-grid)" />
    </svg>
  );
}

/* ── Gradient orbs (original) ── */
function GradientOrbs() {
  return (
    <>
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl animate-[heroPulse_8s_ease-in-out_infinite]" aria-hidden="true" />
      <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl animate-[heroPulse_10s_ease-in-out_2s_infinite]" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-[heroPulse_12s_ease-in-out_4s_infinite]" aria-hidden="true" />
    </>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a3d38] via-primary-dark to-primary min-h-[600px]">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      <GridPattern />
      <GradientOrbs />
      <FloatingParticles />

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="white" strokeWidth="1" className="animate-[heroFadeIn_2s_ease_1s_both]" />
        <line x1="60%" y1="10%" x2="85%" y2="45%" stroke="white" strokeWidth="1" className="animate-[heroFadeIn_2s_ease_1.5s_both]" />
        <line x1="30%" y1="70%" x2="70%" y2="90%" stroke="white" strokeWidth="1" className="animate-[heroFadeIn_2s_ease_2s_both]" />
        <circle cx="10%" cy="20%" r="3" fill="white" className="animate-[heroPulse_4s_ease-in-out_infinite]" />
        <circle cx="60%" cy="10%" r="3" fill="white" className="animate-[heroPulse_4s_ease-in-out_1s_infinite]" />
        <circle cx="85%" cy="45%" r="3" fill="white" className="animate-[heroPulse_4s_ease-in-out_2s_infinite]" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text content */}
          <div className="animate-[heroFadeIn_1s_ease_both]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Live — 2.8M+ verifications this month
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Scan. Verify.{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Trust.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl max-w-xl">
              Protect your brand and your customers with real-time QR-based product
              authentication — built for the scale of modern supply chains.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold text-base shadow-lg shadow-black/20" asChild>
                <Link href="/verify">Verify a Product</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold text-base"
                asChild
              >
                <Link href="/contact?subject=demo">For Brands — Book a Demo</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                50M+ verifications
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                200+ brands
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                99.99% uptime
              </span>
            </div>
          </div>

          {/* Right: Animated verification demo */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-72">
              <VerifyDemoCard />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
