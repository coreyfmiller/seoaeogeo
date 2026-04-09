'use client'

/** Score ring component for ad creatives */
function ScoreRing({ score, color, glowColor, size = 140, label }: { score: number; color: string; glowColor: string; size?: number; label: string }) {
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor})` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black tabular-nums" style={{ fontSize: size * 0.32 }}>{score}</span>
        </div>
      </div>
      <span className="text-white/80 font-bold tracking-wide" style={{ fontSize: size * 0.11 }}>{label}</span>
    </div>
  )
}

/** Ad frame wrapper — enforces aspect ratio */
function AdFrame({ ratio, children, id }: { ratio: '4:3' | '1:1' | '16:9' | '4:5'; children: React.ReactNode; id: string }) {
  const aspectMap = { '4:3': '4/3', '1:1': '1/1', '16:9': '16/9', '4:5': '4/5' }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{id}</span>
        <span className="text-xs text-white/20">({ratio})</span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ aspectRatio: aspectMap[ratio], width: ratio === '16:9' ? 800 : ratio === '4:5' ? 400 : 640 }}>
        {children}
      </div>
    </div>
  )
}

export default function AdsPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-2xl font-black mb-1">Ad Creatives</h1>
          <p className="text-sm text-white/40">Screenshot these at any resolution. Right-click → Save as image, or use a browser screenshot extension.</p>
        </div>


        {/* ═══ AD 1: SEO + GEO Side by Side (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-01-seo-geo">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#fe3f8c]/10 rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-2xl font-black text-center leading-tight px-8">
                Your SEO score is great.<br />
                <span className="text-white/50">But can AI find you?</span>
              </p>

              <div className="flex items-center gap-12">
                <ScoreRing score={98} color="#00e5ff" glowColor="#00e5ff66" size={150} label="SEO Score" />
                <ScoreRing score={83} color="#fe3f8c" glowColor="#fe3f8c66" size={150} label="GEO Score" />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 2: All Three Scores (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-02-three-scores">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#BC13FE]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <p className="text-xl font-black text-center leading-tight px-8">
                Three scores that tell you everything.
              </p>

              <div className="flex items-center gap-8">
                <ScoreRing score={92} color="#00e5ff" glowColor="#00e5ff66" size={120} label="SEO" />
                <ScoreRing score={78} color="#BC13FE" glowColor="#BC13FE66" size={120} label="AEO" />
                <ScoreRing score={85} color="#fe3f8c" glowColor="#fe3f8c66" size={120} label="GEO" />
              </div>

              <p className="text-sm text-white/50 text-center max-w-sm">
                Google. ChatGPT. Gemini. Perplexity.<br />One audit covers them all.
              </p>

              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 3: Competitive Angle (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-03-competitor">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 via-transparent to-[#fe3f8c]/5" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-10">
              <p className="text-3xl font-black text-center leading-tight">
                Your competitor didn&apos;t<br />get lucky.
              </p>
              <p className="text-xl text-[#00e5ff] font-black">They got optimized.</p>

              <div className="flex items-center gap-6 mt-2">
                <div className="text-center">
                  <div className="text-4xl font-black text-red-400">#7</div>
                  <div className="text-xs text-white/40 font-bold mt-1">Your Rank</div>
                </div>
                <div className="text-white/20 text-2xl">→</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-400">#2</div>
                  <div className="text-xs text-white/40 font-bold mt-1">After Duelly</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 4: ChatGPT Question (1:1 Instagram) ═══ */}
        <AdFrame ratio="1:1" id="ad-04-chatgpt-square">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden" style={{ width: 640 }}>
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#BC13FE]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00e5ff]/10 rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col items-center gap-8 px-12">
              <p className="text-2xl font-black text-center leading-tight">
                When someone asks<br />ChatGPT for a recommendation...
              </p>
              <p className="text-xl text-[#fe3f8c] font-black text-center">
                does it mention<br />your business?
              </p>

              <div className="flex items-center gap-8">
                <ScoreRing score={34} color="#fe3f8c" glowColor="#fe3f8c66" size={100} label="AEO" />
                <ScoreRing score={41} color="#fe3f8c" glowColor="#fe3f8c66" size={100} label="GEO" />
              </div>

              <p className="text-xs text-white/40 text-center">If your scores look like this, the answer is no.</p>

              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 5: Keyword Arena (16:9 YouTube/Banner) ═══ */}
        <AdFrame ratio="16:9" id="ad-05-arena-banner">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-between relative overflow-hidden px-12">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f59e0b]/6 rounded-full blur-[120px]" />

            <div className="relative z-10 flex-1">
              <p className="text-3xl font-black leading-tight mb-3">
                Search any keyword.<br />
                <span className="text-[#00e5ff]">Score every competitor.</span>
              </p>
              <p className="text-sm text-white/50 max-w-md">
                Keyword Arena shows you how every top-ranking site scores on SEO, AEO, and GEO — so you know exactly what to fix to climb.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-6">
              <ScoreRing score={91} color="#00e5ff" glowColor="#00e5ff44" size={100} label="SEO" />
              <ScoreRing score={72} color="#BC13FE" glowColor="#BC13FE44" size={100} label="AEO" />
              <ScoreRing score={88} color="#fe3f8c" glowColor="#fe3f8c44" size={100} label="GEO" />
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 6: Facebook Feed (4:5) ═══ */}
        <AdFrame ratio="4:5" id="ad-06-facebook-feed">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-8">
              <p className="text-xl font-black text-center leading-tight">
                Ranked on Google.<br />
                <span className="text-[#fe3f8c]">Invisible to AI.</span>
              </p>

              <ScoreRing score={94} color="#00e5ff" glowColor="#00e5ff66" size={130} label="SEO Score" />

              <div className="text-center">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">But your AI scores say...</p>
                <div className="flex items-center gap-6">
                  <ScoreRing score={38} color="#fe3f8c" glowColor="#fe3f8c44" size={80} label="AEO" />
                  <ScoreRing score={42} color="#fe3f8c" glowColor="#fe3f8c44" size={80} label="GEO" />
                </div>
              </div>

              <p className="text-xs text-white/40 text-center max-w-xs">
                SEO alone isn&apos;t enough anymore. Find out if Google, ChatGPT, and Perplexity can actually find you.
              </p>

              <div className="flex items-center gap-3 mt-2">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

      </div>
    </main>
  )
}
