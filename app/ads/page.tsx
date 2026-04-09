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
    <main className="min-h-screen overflow-y-auto bg-[#050508] text-white p-8">
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

        {/* ═══ AD 7: SEO was for Google, GEO is for AI (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-07-seo-was-geo-is">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fe3f8c]/6 rounded-full blur-[140px]" />

            <div className="relative z-10 flex flex-col items-center gap-8 px-10">
              <div className="text-center space-y-1">
                <p className="text-3xl font-black"><span className="text-[#00e5ff]">SEO</span> was for Google.</p>
                <p className="text-3xl font-black"><span className="text-[#fe3f8c]">GEO</span> is for AI.</p>
              </div>

              <div className="flex items-center gap-16">
                <div className="text-center">
                  <ScoreRing score={92} color="#00e5ff" glowColor="#00e5ff55" size={120} label="" />
                  <p className="text-xs text-white/30 font-bold mt-2">Google can find you</p>
                </div>
                <div className="text-center">
                  <ScoreRing score={41} color="#fe3f8c" glowColor="#fe3f8c55" size={120} label="" />
                  <p className="text-xs text-white/30 font-bold mt-2">Can AI?</p>
                </div>
              </div>

              <p className="text-sm text-white/50">Find out where your site ranks.</p>

              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 8: Competitor Duel — VS (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-08-duel-vs">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <p className="text-xl font-black text-white/50 uppercase tracking-[0.3em]">Competitor Duel</p>

              <div className="flex items-center gap-6">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-[#00e5ff]">87</span>
                  </div>
                  <p className="text-xs text-[#00e5ff] font-bold">Your Site</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-black text-white/20">VS</span>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#fe3f8c]/10 border border-[#fe3f8c]/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-[#fe3f8c]">72</span>
                  </div>
                  <p className="text-xs text-[#fe3f8c] font-bold">Competitor</p>
                </div>
              </div>

              <p className="text-lg font-black text-center mt-2">
                Know exactly where<br />you&apos;re winning — and losing.
              </p>

              <div className="flex items-center gap-3 mt-2">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 9: Competitor Duel — Score Bars (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-09-duel-bars">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden px-12">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/3 via-transparent to-[#fe3f8c]/3" />

            <div className="relative z-10 w-full max-w-md space-y-6">
              <p className="text-2xl font-black text-center">
                Who&apos;s really winning<br />your keyword?
              </p>

              {[
                { label: 'SEO', you: 91, them: 78, color: '#00e5ff' },
                { label: 'AEO', you: 65, them: 82, color: '#BC13FE' },
                { label: 'GEO', you: 70, them: 85, color: '#fe3f8c' },
              ].map(bar => (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/60">{bar.label}</span>
                    <span className="text-white/40">{bar.you} vs {bar.them}</span>
                  </div>
                  <div className="flex gap-1.5 h-5">
                    <div className="rounded-full h-full" style={{ width: `${bar.you}%`, background: '#00e5ff', boxShadow: `0 0 10px #00e5ff44` }} />
                    <div className="rounded-full h-full" style={{ width: `${bar.them}%`, background: '#fe3f8c', boxShadow: `0 0 10px #fe3f8c44` }} />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#00e5ff]">You</span>
                    <span className="text-[#fe3f8c]">Competitor</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center gap-3 pt-2">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 10: Competitor Duel — Steal Their Strategy (1:1) ═══ */}
        <AdFrame ratio="1:1" id="ad-10-steal-strategy">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden" style={{ width: 640 }}>
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-2xl font-black text-center leading-tight">
                Your competitor ranks higher.<br />
                <span className="text-[#00e5ff]">Now you know why.</span>
              </p>

              <div className="w-full max-w-xs space-y-2">
                {[
                  { label: 'Schema Markup', you: false, them: true },
                  { label: 'FAQ Content', you: false, them: true },
                  { label: 'Domain Authority', you: '12', them: '47' },
                  { label: 'Word Count', you: '280', them: '1,400' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] text-sm">
                    <span className="text-white/60">{row.label}</span>
                    <div className="flex items-center gap-4">
                      <span className={typeof row.you === 'boolean' ? (row.you ? 'text-green-400' : 'text-red-400') : 'text-red-400 font-bold'}>
                        {typeof row.you === 'boolean' ? (row.you ? '✓' : '✗') : row.you}
                      </span>
                      <span className="text-white/20">vs</span>
                      <span className={typeof row.them === 'boolean' ? (row.them ? 'text-green-400' : 'text-red-400') : 'text-green-400 font-bold'}>
                        {typeof row.them === 'boolean' ? (row.them ? '✓' : '✗') : row.them}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-white/40 text-center">Duelly shows you the gaps — and exactly how to close them.</p>

              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 11: The AI Question — Minimal (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-11-ai-question-minimal">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BC13FE]/5 via-transparent to-[#00e5ff]/5" />

            <div className="relative z-10 text-center space-y-6 px-12">
              <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">The question every business should ask</p>
              <p className="text-4xl font-black leading-tight">
                &ldquo;Hey ChatGPT,<br />recommend a <span className="text-[#00e5ff]">[your industry]</span><br />near me.&rdquo;
              </p>
              <p className="text-lg text-white/50">Are you in the answer?</p>

              <div className="flex items-center justify-center gap-3 pt-4">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 12: Before/After (4:5 Facebook) ═══ */}
        <AdFrame ratio="4:5" id="ad-12-before-after">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00e5ff]/6 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-5 px-8">
              <p className="text-xs text-white/30 font-bold uppercase tracking-[0.3em]">Before Duelly</p>
              <div className="flex items-center gap-4">
                <ScoreRing score={34} color="#fe3f8c" glowColor="#fe3f8c44" size={80} label="SEO" />
                <ScoreRing score={18} color="#fe3f8c" glowColor="#fe3f8c44" size={80} label="AEO" />
                <ScoreRing score={22} color="#fe3f8c" glowColor="#fe3f8c44" size={80} label="GEO" />
              </div>

              <div className="w-16 h-px bg-white/10" />

              <p className="text-xs text-[#00e5ff] font-bold uppercase tracking-[0.3em]">After Duelly</p>
              <div className="flex items-center gap-4">
                <ScoreRing score={89} color="#00e5ff" glowColor="#00e5ff44" size={80} label="SEO" />
                <ScoreRing score={76} color="#00e5ff" glowColor="#00e5ff44" size={80} label="AEO" />
                <ScoreRing score={81} color="#00e5ff" glowColor="#00e5ff44" size={80} label="GEO" />
              </div>

              <p className="text-lg font-black text-center mt-2">
                Same site. Different strategy.
              </p>
              <p className="text-xs text-white/40 text-center">Duelly tells you what to fix — and how to fix it.</p>

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
