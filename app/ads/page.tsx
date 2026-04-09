'use client'

import { useState } from 'react'
import { CircularProgress } from '@/components/dashboard/circular-progress'

function AdFrame({ ratio, children, id }: { ratio: '4:3' | '1:1' | '16:9' | '4:5'; children: React.ReactNode; id: string }) {
  const aspectMap = { '4:3': '4/3', '1:1': '1/1', '16:9': '16/9', '4:5': '4/5' }
  const widthMap = { '4:3': 640, '1:1': 500, '16:9': 800, '4:5': 400 }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{id}</span>
        <span className="text-xs text-white/20">({ratio})</span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ aspectRatio: aspectMap[ratio], width: widthMap[ratio] }}>
        {children}
      </div>
    </div>
  )
}

function Slider({ label, value, set, color }: { label: string; value: number; set: (v: number) => void; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold w-8" style={{ color }}>{label}</span>
      <input type="range" min={0} max={100} value={value} onChange={e => set(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none bg-white/10" style={{ accentColor: color }} />
      <span className="text-xs font-bold tabular-nums w-7 text-right">{value}</span>
    </div>
  )
}

export default function AdsPage() {
  const [seo, setSeo] = useState(92)
  const [aeo, setAeo] = useState(65)
  const [geo, setGeo] = useState(83)
  const [compSeo, setCompSeo] = useState(78)
  const [compAeo, setCompAeo] = useState(82)
  const [compGeo, setCompGeo] = useState(85)
  const [lowAeo, setLowAeo] = useState(34)
  const [lowGeo, setLowGeo] = useState(41)

  return (
    <main className="h-screen overflow-y-auto bg-[#050508] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div>
          <h1 className="text-2xl font-black mb-1">Ad Creatives</h1>
          <p className="text-sm text-white/40">Tweak scores below — all ads update live. Screenshot at any resolution.</p>
        </div>

        {/* ═══ CONTROL PANEL ═══ */}
        <div className="rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.03] p-6 space-y-4 sticky top-0 z-50 backdrop-blur-xl">
          <p className="text-xs font-bold text-[#00e5ff] uppercase tracking-widest">Score Control Panel</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/50 uppercase">Your Scores</p>
              <Slider label="SEO" value={seo} set={setSeo} color="#00e5ff" />
              <Slider label="AEO" value={aeo} set={setAeo} color="#BC13FE" />
              <Slider label="GEO" value={geo} set={setGeo} color="#fe3f8c" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/50 uppercase">Competitor Scores</p>
              <Slider label="SEO" value={compSeo} set={setCompSeo} color="#00e5ff" />
              <Slider label="AEO" value={compAeo} set={setCompAeo} color="#BC13FE" />
              <Slider label="GEO" value={compGeo} set={setCompGeo} color="#fe3f8c" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/50 uppercase">Low Scores (warning ads)</p>
              <Slider label="AEO" value={lowAeo} set={setLowAeo} color="#fe3f8c" />
              <Slider label="GEO" value={lowGeo} set={setLowGeo} color="#fe3f8c" />
            </div>
          </div>
        </div>

        {/* ═══ AD 1: SEO + GEO Side by Side (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-01-seo-geo">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#fe3f8c]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-2xl font-black text-center leading-tight px-8">
                Your SEO score is great.<br /><span className="text-white/50">But can AI find you?</span>
              </p>
              <div className="flex items-center gap-12">
                <CircularProgress value={seo} variant="seo" size={150} strokeWidth={12} label="SEO Score" />
                <CircularProgress value={geo} variant="geo" size={150} strokeWidth={12} label="GEO Score" />
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
              <p className="text-xl font-black text-center">Three scores that tell you everything.</p>
              <div className="flex items-center gap-8">
                <CircularProgress value={seo} variant="seo" size={120} strokeWidth={10} label="SEO" />
                <CircularProgress value={aeo} variant="aeo" size={120} strokeWidth={10} label="AEO" />
                <CircularProgress value={geo} variant="geo" size={120} strokeWidth={10} label="GEO" />
              </div>
              <p className="text-sm text-white/50 text-center max-w-sm">Google. ChatGPT. Gemini. Perplexity.<br />One audit covers them all.</p>
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
              <p className="text-3xl font-black text-center leading-tight">Your competitor didn&apos;t<br />get lucky.</p>
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

        {/* ═══ AD 4: ChatGPT Question (1:1) ═══ */}
        <AdFrame ratio="1:1" id="ad-04-chatgpt-square">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#BC13FE]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-2xl font-black text-center leading-tight">When someone asks<br />ChatGPT for a recommendation...</p>
              <p className="text-xl text-[#fe3f8c] font-black text-center">does it mention<br />your business?</p>
              <div className="flex items-center gap-8">
                <CircularProgress value={lowAeo} variant="geo" size={100} strokeWidth={8} label="AEO" />
                <CircularProgress value={lowGeo} variant="geo" size={100} strokeWidth={8} label="GEO" />
              </div>
              <p className="text-xs text-white/40 text-center">If your scores look like this, the answer is no.</p>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 5: Keyword Arena Banner (16:9) ═══ */}
        <AdFrame ratio="16:9" id="ad-05-arena-banner">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-between relative overflow-hidden px-12">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f59e0b]/6 rounded-full blur-[120px]" />
            <div className="relative z-10 flex-1">
              <p className="text-3xl font-black leading-tight mb-3">Search any keyword.<br /><span className="text-[#00e5ff]">Score every competitor.</span></p>
              <p className="text-sm text-white/50 max-w-md">Keyword Arena shows you how every top-ranking site scores on SEO, AEO, and GEO — so you know exactly what to fix to climb.</p>
              <div className="flex items-center gap-3 mt-6">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <CircularProgress value={seo} variant="seo" size={90} strokeWidth={7} label="SEO" />
              <CircularProgress value={aeo} variant="aeo" size={90} strokeWidth={7} label="AEO" />
              <CircularProgress value={geo} variant="geo" size={90} strokeWidth={7} label="GEO" />
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 6: Ranked on Google, Invisible to AI (4:5) ═══ */}
        <AdFrame ratio="4:5" id="ad-06-invisible-to-ai">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-8">
              <p className="text-xl font-black text-center leading-tight">Ranked on Google.<br /><span className="text-[#fe3f8c]">Invisible to AI.</span></p>
              <CircularProgress value={seo} variant="seo" size={120} strokeWidth={10} label="SEO Score" />
              <div className="text-center">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">But your AI scores say...</p>
                <div className="flex items-center gap-6">
                  <CircularProgress value={lowAeo} variant="geo" size={80} strokeWidth={6} label="AEO" />
                  <CircularProgress value={lowGeo} variant="geo" size={80} strokeWidth={6} label="GEO" />
                </div>
              </div>
              <p className="text-xs text-white/40 text-center max-w-xs">SEO alone isn&apos;t enough anymore. Find out if Google, ChatGPT, and Perplexity can actually find you.</p>
              <div className="flex items-center gap-3 mt-1">
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
            <div className="relative z-10 flex flex-col items-center gap-6 px-10">
              <div className="text-center space-y-1">
                <p className="text-3xl font-black"><span className="text-[#00e5ff]">SEO</span> was for Google.</p>
                <p className="text-3xl font-black"><span className="text-[#fe3f8c]">GEO</span> is for AI.</p>
              </div>
              <div className="flex items-center gap-16">
                <div className="text-center">
                  <CircularProgress value={seo} variant="seo" size={120} strokeWidth={10} />
                  <p className="text-xs text-white/30 font-bold mt-1">Google can find you</p>
                </div>
                <div className="text-center">
                  <CircularProgress value={lowGeo} variant="geo" size={120} strokeWidth={10} />
                  <p className="text-xs text-white/30 font-bold mt-1">CAN AI FIND YOU?</p>
                </div>
              </div>
              <img src="/logo.png" alt="Duelly" className="h-14 mt-2" />
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 8: Competitor Duel VS (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-08-duel-vs">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <p className="text-xl font-black text-white/50 uppercase tracking-[0.3em]">Competitor Duel</p>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={seo} variant="seo" size={100} strokeWidth={8} />
                  <p className="text-xs text-[#00e5ff] font-bold">Your Site</p>
                </div>
                <span className="text-4xl font-black text-white/20">VS</span>
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={compSeo} variant="geo" size={100} strokeWidth={8} />
                  <p className="text-xs text-[#fe3f8c] font-bold">Competitor</p>
                </div>
              </div>
              <p className="text-lg font-black text-center mt-2">Know exactly where<br />you&apos;re winning — and losing.</p>
              <div className="flex items-center gap-3 mt-2">
                <img src="/logo.png" alt="Duelly" className="h-7" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 9: Competitor Duel Score Bars (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-09-duel-bars">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden px-12">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/3 via-transparent to-[#fe3f8c]/3" />
            <div className="relative z-10 w-full max-w-md space-y-6">
              <p className="text-2xl font-black text-center">Who&apos;s really winning<br />your keyword?</p>
              {[
                { label: 'SEO', you: seo, them: compSeo },
                { label: 'AEO', you: aeo, them: compAeo },
                { label: 'GEO', you: geo, them: compGeo },
              ].map(bar => (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/60">{bar.label}</span>
                    <span className="text-white/40">{bar.you} vs {bar.them}</span>
                  </div>
                  <div className="flex gap-1.5 h-5">
                    <div className="rounded-full h-full transition-all" style={{ width: `${bar.you}%`, background: '#00e5ff', boxShadow: '0 0 10px #00e5ff44' }} />
                    <div className="rounded-full h-full transition-all" style={{ width: `${bar.them}%`, background: '#fe3f8c', boxShadow: '0 0 10px #fe3f8c44' }} />
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

        {/* ═══ AD 10: Steal Their Strategy (1:1) ═══ */}
        <AdFrame ratio="1:1" id="ad-10-steal-strategy">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-2xl font-black text-center leading-tight">Your competitor ranks higher.<br /><span className="text-[#00e5ff]">Now you know why.</span></p>
              <div className="w-full max-w-xs space-y-2">
                {[
                  { label: 'Schema Markup', you: '✗', them: '✓', youBad: true },
                  { label: 'FAQ Content', you: '✗', them: '✓', youBad: true },
                  { label: 'Domain Authority', you: '12', them: '47', youBad: true },
                  { label: 'Word Count', you: '280', them: '1,400', youBad: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] text-sm">
                    <span className="text-white/60">{row.label}</span>
                    <div className="flex items-center gap-4">
                      <span className={row.youBad ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{row.you}</span>
                      <span className="text-white/20">vs</span>
                      <span className="text-green-400 font-bold">{row.them}</span>
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

        {/* ═══ AD 11: The AI Question Minimal (4:3) ═══ */}
        <AdFrame ratio="4:3" id="ad-11-ai-question">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BC13FE]/5 via-transparent to-[#00e5ff]/5" />
            <div className="relative z-10 text-center space-y-6 px-12">
              <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">The question every business should ask</p>
              <p className="text-4xl font-black leading-tight">&ldquo;Hey ChatGPT,<br />recommend a <span className="text-[#00e5ff]">[your industry]</span><br />near me.&rdquo;</p>
              <p className="text-lg text-white/50">Are you in the answer?</p>
              <div className="flex items-center justify-center gap-3 pt-4">
                <img src="/logo.png" alt="Duelly" className="h-8" />
                <span className="text-white/40 text-sm font-bold">duelly.ai</span>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* ═══ AD 12: Before/After (4:5) ═══ */}
        <AdFrame ratio="4:5" id="ad-12-before-after">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00e5ff]/6 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-4 px-8">
              <p className="text-xs text-white/30 font-bold uppercase tracking-[0.3em]">Before Duelly</p>
              <div className="flex items-center gap-3">
                <CircularProgress value={34} variant="geo" size={70} strokeWidth={6} label="SEO" />
                <CircularProgress value={18} variant="geo" size={70} strokeWidth={6} label="AEO" />
                <CircularProgress value={22} variant="geo" size={70} strokeWidth={6} label="GEO" />
              </div>
              <div className="w-16 h-px bg-white/10" />
              <p className="text-xs text-[#00e5ff] font-bold uppercase tracking-[0.3em]">After Duelly</p>
              <div className="flex items-center gap-3">
                <CircularProgress value={89} variant="seo" size={70} strokeWidth={6} label="SEO" />
                <CircularProgress value={76} variant="aeo" size={70} strokeWidth={6} label="AEO" />
                <CircularProgress value={81} variant="geo" size={70} strokeWidth={6} label="GEO" />
              </div>
              <p className="text-lg font-black text-center mt-2">Same site. Different strategy.</p>
              <p className="text-xs text-white/40 text-center">Duelly tells you what to fix — and how to fix it.</p>
              <div className="flex items-center gap-3 mt-1">
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
