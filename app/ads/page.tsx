'use client'

import { useState } from 'react'
import { CircularProgress } from '@/components/dashboard/circular-progress'

function AdFrame({ ratio, children, id }: { ratio: '4:3' | '1:1' | '16:9' | '4:5'; children: React.ReactNode; id: string }) {
  const [isHidden, setIsHidden] = useState(false)
  const aspectMap = { '4:3': '4/3', '1:1': '1/1', '16:9': '16/9', '4:5': '4/5' }
  const widthMap = { '4:3': 640, '1:1': 500, '16:9': 800, '4:5': 400 }

  if (isHidden) {
    return (
      <div className="flex items-center gap-2 opacity-50 py-2 border-b border-white/5 w-fit">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest line-through">{id}</span>
        <span className="text-xs text-white/20">({ratio})</span>
        <button onClick={() => setIsHidden(false)} className="text-[10px] uppercase font-bold text-[#00e5ff]/50 hover:text-[#00e5ff] ml-2">Restore</button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 group">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{id}</span>
        <span className="text-xs text-white/20">({ratio})</span>
        <button onClick={() => setIsHidden(true)} className="text-xs text-red-500/50 hover:text-red-500 ml-2 transition-colors" title="Hide Ad">✕</button>
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

function Logo({ size = 'lg' }: { size?: 'md' | 'lg' | 'xl' }) {
  const h = size === 'xl' ? 'h-24' : size === 'lg' ? 'h-16' : 'h-12'
  return <img src="/logo.png" alt="Duelly" className={h} />
}

export default function AdsPage() {
  const [seo, setSeo] = useState(92)
  const [aeo, setAeo] = useState(65)
  const [geo, setGeo] = useState(83)
  const [cSeo, setCseo] = useState(78)
  const [cAeo, setCaeo] = useState(82)
  const [cGeo, setCgeo] = useState(85)
  const [lAeo, setLaeo] = useState(34)
  const [lGeo, setLgeo] = useState(41)

  return (
    <main className="h-screen overflow-y-auto bg-[#050508] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div>
          <h1 className="text-2xl font-black mb-1">Ad Creatives</h1>
          <p className="text-sm text-white/40">Tweak scores — all ads update live.</p>
        </div>

        {/* CONTROL PANEL */}
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
              <p className="text-[10px] font-bold text-white/50 uppercase">Competitor</p>
              <Slider label="SEO" value={cSeo} set={setCseo} color="#00e5ff" />
              <Slider label="AEO" value={cAeo} set={setCaeo} color="#BC13FE" />
              <Slider label="GEO" value={cGeo} set={setCgeo} color="#fe3f8c" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/50 uppercase">Low / Warning</p>
              <Slider label="AEO" value={lAeo} set={setLaeo} color="#fe3f8c" />
              <Slider label="GEO" value={lGeo} set={setLgeo} color="#fe3f8c" />
            </div>
          </div>
        </div>

        {/* AD 1: SEO + GEO (4:3) */}
        <AdFrame ratio="4:3" id="ad-01-seo-geo">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#fe3f8c]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-2xl font-black text-center leading-tight px-8">Your SEO score is great.<br /><span className="text-white/50">But can AI find you?</span></p>
              <div className="flex items-center gap-12">
                <CircularProgress value={seo} variant="seo" size={150} strokeWidth={12} label="SEO Score" />
                <CircularProgress value={geo} variant="geo" size={150} strokeWidth={12} label="GEO Score" />
              </div>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 2: Three Scores (4:3) */}
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
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 3: Competitor Rank (4:3) */}
        <AdFrame ratio="4:3" id="ad-03-competitor">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 via-transparent to-[#fe3f8c]/5" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-10">
              <p className="text-3xl font-black text-center leading-tight">Your competitor didn&apos;t<br />get lucky.</p>
              <p className="text-xl text-[#00e5ff] font-black">They got optimized.</p>
              <div className="flex items-center gap-6 mt-2">
                <div className="text-center"><div className="text-4xl font-black text-red-400">#7</div><div className="text-xs text-white/40 font-bold mt-1">Your Rank</div></div>
                <div className="text-white/20 text-2xl">→</div>
                <div className="text-center"><div className="text-4xl font-black text-green-400">#2</div><div className="text-xs text-white/40 font-bold mt-1">After Duelly</div></div>
              </div>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 4: ChatGPT Question (1:1) */}
        <AdFrame ratio="1:1" id="ad-04-chatgpt-square">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#BC13FE]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-2xl font-black text-center leading-tight">When someone asks<br />ChatGPT for a recommendation...</p>
              <p className="text-xl text-[#fe3f8c] font-black text-center">does it mention<br />your business?</p>
              <div className="flex items-center gap-8">
                <CircularProgress value={lAeo} variant="geo" size={100} strokeWidth={8} label="AEO" />
                <CircularProgress value={lGeo} variant="geo" size={100} strokeWidth={8} label="GEO" />
              </div>
              <p className="text-xs text-white/40 text-center">If your scores look like this, the answer is no.</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 5: Arena Banner (16:9) */}
        <AdFrame ratio="16:9" id="ad-05-arena-banner">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-between relative overflow-hidden px-12">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f59e0b]/6 rounded-full blur-[120px]" />
            <div className="relative z-10 flex-1">
              <p className="text-3xl font-black leading-tight mb-3">Search any keyword.<br /><span className="text-[#00e5ff]">Score every competitor.</span></p>
              <p className="text-sm text-white/50 max-w-md mb-6">Keyword Arena shows how every top-ranking site scores on SEO, AEO, and GEO.</p>
              <Logo size="md" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <CircularProgress value={seo} variant="seo" size={90} strokeWidth={7} label="SEO" />
              <CircularProgress value={aeo} variant="aeo" size={90} strokeWidth={7} label="AEO" />
              <CircularProgress value={geo} variant="geo" size={90} strokeWidth={7} label="GEO" />
            </div>
          </div>
        </AdFrame>

        {/* AD 6: Invisible to AI (4:5) */}
        <AdFrame ratio="4:5" id="ad-06-invisible-to-ai">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-8">
              <p className="text-xl font-black text-center leading-tight">Ranked on Google.<br /><span className="text-[#fe3f8c]">Invisible to AI.</span></p>
              <CircularProgress value={seo} variant="seo" size={120} strokeWidth={10} label="SEO Score" />
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">But your AI scores say...</p>
              <div className="flex items-center gap-6">
                <CircularProgress value={lAeo} variant="geo" size={80} strokeWidth={6} label="AEO" />
                <CircularProgress value={lGeo} variant="geo" size={80} strokeWidth={6} label="GEO" />
              </div>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 7: SEO was for Google, GEO is for AI (4:3) */}
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
                <CircularProgress value={seo} variant="seo" size={130} strokeWidth={11} label="SEO" />
                <CircularProgress value={lGeo} variant="geo" size={130} strokeWidth={11} label="GEO" />
              </div>
              <p className="text-lg font-black text-white mt-2">Can AI find you?</p>
              <Logo size="xl" />
            </div>
          </div>
        </AdFrame>

        {/* AD 8: Duel VS (4:3) */}
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
                  <CircularProgress value={cSeo} variant="geo" size={100} strokeWidth={8} />
                  <p className="text-xs text-[#fe3f8c] font-bold">Competitor</p>
                </div>
              </div>
              <p className="text-lg font-black text-center mt-2">Know exactly where<br />you&apos;re winning — and losing.</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 9: Duel Bars (4:3) */}
        <AdFrame ratio="4:3" id="ad-09-duel-bars">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden px-12">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/3 via-transparent to-[#fe3f8c]/3" />
            <div className="relative z-10 w-full max-w-md space-y-5">
              <p className="text-2xl font-black text-center">Who&apos;s really winning<br />your keyword?</p>
              {[
                { label: 'SEO', you: seo, them: cSeo },
                { label: 'AEO', you: aeo, them: cAeo },
                { label: 'GEO', you: geo, them: cGeo },
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
              <div className="flex justify-center pt-2"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 10: Gap Table (1:1) */}
        <AdFrame ratio="1:1" id="ad-10-steal-strategy">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-2xl font-black text-center leading-tight">Your competitor ranks higher.<br /><span className="text-[#00e5ff]">Now you know why.</span></p>
              <div className="w-full max-w-xs space-y-2">
                {[
                  { label: 'Schema Markup', you: '✗', them: '✓' },
                  { label: 'FAQ Content', you: '✗', them: '✓' },
                  { label: 'Domain Authority', you: '12', them: '47' },
                  { label: 'Word Count', you: '280', them: '1,400' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] text-sm">
                    <span className="text-white/60">{row.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-red-400 font-bold">{row.you}</span>
                      <span className="text-white/20">vs</span>
                      <span className="text-green-400 font-bold">{row.them}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40 text-center">See the gaps. Get the fixes.</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 11: AI Question (4:3) */}
        <AdFrame ratio="4:3" id="ad-11-ai-question">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BC13FE]/5 via-transparent to-[#00e5ff]/5" />
            <div className="relative z-10 text-center space-y-6 px-12">
              <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">The question every business should ask</p>
              <p className="text-4xl font-black leading-tight">&ldquo;Hey ChatGPT,<br />recommend a <span className="text-[#00e5ff]">[your industry]</span><br />near me.&rdquo;</p>
              <p className="text-lg text-white/50">Are you in the answer?</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 12: Before/After — Vertical (4:5) */}
        <AdFrame ratio="4:5" id="ad-12-before-after-vertical">
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
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 13: Before/After — Square (1:1) */}
        <AdFrame ratio="1:1" id="ad-13-before-after-square">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-2xl font-black text-center">What Duelly finds.<br />What Duelly fixes.</p>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Before</p>
                  <CircularProgress value={28} variant="geo" size={90} strokeWidth={7} />
                  <p className="text-xs text-white/30 font-bold">Overall</p>
                </div>
                <div className="text-white/10 text-3xl">→</div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest">After</p>
                  <CircularProgress value={87} variant="seo" size={90} strokeWidth={7} />
                  <p className="text-xs text-white/30 font-bold">Overall</p>
                </div>
              </div>
              <p className="text-sm text-white/40 text-center">AI-powered fixes tailored to your platform.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 14: Before/After — Wide (4:3) */}
        <AdFrame ratio="4:3" id="ad-14-before-after-wide">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#fe3f8c]/6 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[140px]" />
            <div className="relative z-10 flex items-center gap-12">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-red-400/80 font-bold uppercase tracking-widest">Before</p>
                <div className="flex items-center gap-3">
                  <CircularProgress value={31} variant="geo" size={80} strokeWidth={6} label="SEO" />
                  <CircularProgress value={15} variant="geo" size={80} strokeWidth={6} label="AEO" />
                  <CircularProgress value={24} variant="geo" size={80} strokeWidth={6} label="GEO" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Logo size="lg" />
                <div className="text-white/10 text-4xl">→</div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-[#00e5ff]/80 font-bold uppercase tracking-widest">After</p>
                <div className="flex items-center gap-3">
                  <CircularProgress value={91} variant="seo" size={80} strokeWidth={6} label="SEO" />
                  <CircularProgress value={78} variant="aeo" size={80} strokeWidth={6} label="AEO" />
                  <CircularProgress value={84} variant="geo" size={80} strokeWidth={6} label="GEO" />
                </div>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 15: Before/After — Banner (16:9) */}
        <AdFrame ratio="16:9" id="ad-15-before-after-banner">
          <div className="w-full h-full bg-[#0a0a12] flex items-center relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center gap-3 border-r border-white/[0.06]">
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Before Duelly</p>
              <div className="flex items-center gap-3">
                <CircularProgress value={29} variant="geo" size={70} strokeWidth={5} label="SEO" />
                <CircularProgress value={12} variant="geo" size={70} strokeWidth={5} label="AEO" />
                <CircularProgress value={19} variant="geo" size={70} strokeWidth={5} label="GEO" />
              </div>
            </div>
            <div className="px-6 flex flex-col items-center gap-2">
              <Logo size="lg" />
              <p className="text-xs text-white/30 font-bold">The roadmap to<br />outrank your rivals.</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 border-l border-white/[0.06]">
              <p className="text-xs text-[#00e5ff] font-bold uppercase tracking-widest">After Duelly</p>
              <div className="flex items-center gap-3">
                <CircularProgress value={93} variant="seo" size={70} strokeWidth={5} label="SEO" />
                <CircularProgress value={81} variant="aeo" size={70} strokeWidth={5} label="AEO" />
                <CircularProgress value={86} variant="geo" size={70} strokeWidth={5} label="GEO" />
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 16: The F Score — Fear/Urgency (4:3) */}
        <AdFrame ratio="4:3" id="ad-16-the-f-score">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/8 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                <span className="text-xs font-black text-red-400 uppercase tracking-widest">Grade: F</span>
              </div>
              <CircularProgress value={lGeo} variant="geo" size={160} strokeWidth={13} />
              <p className="text-2xl font-black text-center leading-tight">This is what AI thinks<br />of your website.</p>
              <p className="text-sm text-white/40">Most businesses don&apos;t know their score. Do you?</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 17: The 3 Engines — Educational (4:3) */}
        <AdFrame ratio="4:3" id="ad-17-three-engines">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#00e5ff]/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#fe3f8c]/6 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-8">
              <p className="text-2xl font-black text-center">Your customers search<br />3 different ways now.</p>
              <div className="space-y-3 w-full max-w-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#00e5ff]/20 bg-[#00e5ff]/5">
                  <span className="text-2xl">🔍</span>
                  <div><p className="text-sm font-bold text-[#00e5ff]">Google Search</p><p className="text-xs text-white/40">Traditional rankings</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#BC13FE]/20 bg-[#BC13FE]/5">
                  <span className="text-2xl">🤖</span>
                  <div><p className="text-sm font-bold text-[#BC13FE]">AI Answers</p><p className="text-xs text-white/40">ChatGPT, Perplexity, Gemini</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#fe3f8c]/20 bg-[#fe3f8c]/5">
                  <span className="text-2xl">✨</span>
                  <div><p className="text-sm font-bold text-[#fe3f8c]">AI Overviews</p><p className="text-xs text-white/40">Google&apos;s AI-generated results</p></div>
                </div>
              </div>
              <p className="text-sm text-white/50">One audit covers all three.</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 18: The Blind Spot — Provocative (1:1) */}
        <AdFrame ratio="1:1" id="ad-18-blind-spot">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fe3f8c]/8 via-transparent to-[#BC13FE]/8" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-3xl font-black text-center leading-tight">You spent $5,000<br />on your website.</p>
              <p className="text-xl text-[#fe3f8c] font-black text-center">AI can&apos;t read it.</p>
              <div className="w-full max-w-xs space-y-1.5 mt-2">
                {['No schema markup', 'No FAQ content', 'No entity density', 'No definition statements'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/50">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40 text-center mt-2">Find out what AI actually sees<br />when it looks at your site.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 19: The Leaderboard — Social Proof (4:3) */}
        <AdFrame ratio="4:3" id="ad-19-leaderboard">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden px-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#f59e0b]/6 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-md">
              <p className="text-xl font-black text-center">Where do you rank for<br />&ldquo;plumber in Toronto&rdquo;?</p>
              <div className="w-full space-y-1.5">
                {[
                  { rank: 1, name: 'torontoplumbing.ca', score: 94, isYou: false },
                  { rank: 2, name: 'drainpros.com', score: 88, isYou: false },
                  { rank: 3, name: 'yoursite.com', score: 71, isYou: true },
                  { rank: 4, name: 'fixitfast.ca', score: 67, isYou: false },
                  { rank: 5, name: 'pipeworks.ca', score: 62, isYou: false },
                ].map(row => (
                  <div key={row.rank} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${row.isYou ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/30' : 'bg-white/[0.02]'}`}>
                    <span className={`font-black w-6 ${row.rank === 1 ? 'text-[#f59e0b]' : 'text-white/30'}`}>#{row.rank}</span>
                    <span className={`flex-1 font-bold ${row.isYou ? 'text-[#00e5ff]' : 'text-white/60'}`}>{row.name} {row.isYou && <span className="text-[10px] text-[#00e5ff]/60 ml-1">← YOU</span>}</span>
                    <span className={`font-black tabular-nums ${row.score >= 80 ? 'text-green-400' : row.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{row.score}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40">Keyword Arena scores every competitor. See where you stand.</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 20: The Wake-Up Call — Stats (4:5) */}
        <AdFrame ratio="4:5" id="ad-20-wake-up-stats">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#BC13FE]/5 via-transparent to-[#00e5ff]/5" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-8">
              <p className="text-xl font-black text-center leading-tight">By 2026, AI answers<br />40% of all searches.</p>
              <div className="w-full max-w-xs space-y-3">
                <div className="text-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-4xl font-black text-[#00e5ff]">40%</p>
                  <p className="text-xs text-white/40">of searches answered by AI</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-black text-[#fe3f8c]">0</p>
                    <p className="text-[10px] text-white/40">clicks if AI doesn&apos;t cite you</p>
                  </div>
                  <div className="text-center p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-black text-[#BC13FE]">3x</p>
                    <p className="text-[10px] text-white/40">more traffic when AI cites you</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-white/50 text-center">Is your site ready?</p>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 21: The Platform Fix — Specificity (4:3) */}
        <AdFrame ratio="4:3" id="ad-21-platform-fix">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00e5ff]/5 rounded-full blur-[140px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-2xl font-black text-center">Not just what to fix.<br /><span className="text-[#00e5ff]">How to fix it on YOUR platform.</span></p>
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                {['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Webflow', 'Next.js'].map(p => (
                  <div key={p} className="text-center py-2.5 px-2 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <p className="text-xs font-bold text-white/70">{p}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40 text-center max-w-sm">Every fix instruction references your actual admin paths, plugins, and settings.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 22: The Single Number — Minimal Impact (1:1) */}
        <AdFrame ratio="1:1" id="ad-22-single-number">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/8 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">Your AI visibility score</p>
              <CircularProgress value={lGeo} variant="geo" size={200} strokeWidth={16} />
              <p className="text-3xl font-black text-center">Not great.</p>
              <p className="text-sm text-white/40">Find out yours.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 23: The Question Stack — Curiosity (4:5) */}
        <AdFrame ratio="4:5" id="ad-23-question-stack">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#BC13FE]/6 rounded-full blur-[140px]" />
            <div className="relative z-10 flex flex-col items-center gap-4 px-8">
              <div className="space-y-3 text-center">
                {[
                  { q: 'Does Google rank you on page 1?', color: '#00e5ff' },
                  { q: 'Does ChatGPT recommend you?', color: '#BC13FE' },
                  { q: 'Does Perplexity cite your site?', color: '#fe3f8c' },
                  { q: 'Does Gemini know you exist?', color: '#f59e0b' },
                ].map((item, i) => (
                  <p key={i} className="text-lg font-black" style={{ color: item.color }}>{item.q}</p>
                ))}
              </div>
              <div className="w-16 h-px bg-white/10 my-2" />
              <p className="text-xl font-black text-white text-center">One audit.<br />Every answer.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 24: The Scoreboard — Sports Metaphor (16:9) */}
        <AdFrame ratio="16:9" id="ad-24-scoreboard">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/5 via-transparent to-[#fe3f8c]/5" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className="text-sm text-white/30 font-bold uppercase tracking-[0.4em]">The Scoreboard</p>
              <div className="flex items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={aeo} variant="aeo" size={80} strokeWidth={6} />
                  <div className="w-16 h-20 rounded-t-lg bg-[#BC13FE]/20 border border-[#BC13FE]/30 border-b-0 flex items-end justify-center pb-2">
                    <span className="text-xs font-black text-[#BC13FE]">AEO</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={seo} variant="seo" size={80} strokeWidth={6} />
                  <div className="w-16 h-28 rounded-t-lg bg-[#00e5ff]/20 border border-[#00e5ff]/30 border-b-0 flex items-end justify-center pb-2">
                    <span className="text-xs font-black text-[#00e5ff]">SEO</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={geo} variant="geo" size={80} strokeWidth={6} />
                  <div className="w-16 h-24 rounded-t-lg bg-[#fe3f8c]/20 border border-[#fe3f8c]/30 border-b-0 flex items-end justify-center pb-2">
                    <span className="text-xs font-black text-[#fe3f8c]">GEO</span>
                  </div>
                </div>
              </div>
              <p className="text-lg font-black mt-2">Know your numbers. Beat the competition.</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 25: The Dark Horse — Underdog Story (4:3) */}
        <AdFrame ratio="4:3" id="ad-25-dark-horse">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-[120px]" />
            <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40">
              <span className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">Small business. Big advantage.</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-3xl font-black text-center leading-tight">Your competitor has<br /><span className="text-white/30">10x your budget.</span></p>
              <p className="text-2xl text-[#00e5ff] font-black text-center">You have better data.</p>
              <div className="flex items-center gap-8 mt-2">
                <CircularProgress value={seo} variant="seo" size={110} strokeWidth={9} label="SEO" />
                <CircularProgress value={aeo} variant="aeo" size={110} strokeWidth={9} label="AEO" />
                <CircularProgress value={geo} variant="geo" size={110} strokeWidth={9} label="GEO" />
              </div>
              <Logo size="xl" />
            </div>
          </div>
        </AdFrame>

        {/* AD 26: The Equalizer (4:3) */}
        <AdFrame ratio="4:3" id="ad-26-equalizer">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/8 via-transparent to-[#00e5ff]/8" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-2xl font-black text-center leading-tight">They have a marketing team.<br />You have Duelly.</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] w-36">
                  <p className="text-xs text-white/30 font-bold mb-1">Their team</p>
                  <p className="text-3xl font-black text-white/20">$8K</p>
                  <p className="text-[10px] text-white/20">per month</p>
                </div>
                <p className="text-white/20 text-xl">vs</p>
                <div className="text-center p-4 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5 w-36">
                  <p className="text-xs text-[#00e5ff] font-bold mb-1">Your audit</p>
                  <p className="text-3xl font-black text-[#00e5ff]">$80</p>
                  <p className="text-[10px] text-white/40">one time</p>
                </div>
              </div>
              <p className="text-sm text-white/40">Same insights. Fraction of the cost.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 27: The Secret (1:1) */}
        <AdFrame ratio="1:1" id="ad-27-the-secret">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#BC13FE]/8 rounded-full blur-[140px]" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-12">
              <p className="text-sm text-[#BC13FE] font-bold uppercase tracking-widest">The secret</p>
              <p className="text-2xl font-black text-center leading-tight">The #1 result for your keyword<br />isn&apos;t the best business.</p>
              <p className="text-xl text-[#00e5ff] font-black text-center">It&apos;s the best optimized.</p>
              <CircularProgress value={seo} variant="seo" size={120} strokeWidth={10} />
              <p className="text-sm text-white/40 text-center">See exactly what they did right.<br />Then do it better.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 28: David vs Goliath (4:5) */}
        <AdFrame ratio="4:5" id="ad-28-david-goliath">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-4 px-8">
              <div className="flex items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={seo} variant="seo" size={90} strokeWidth={7} />
                  <p className="text-xs font-bold text-[#00e5ff]">You</p>
                  <p className="text-[10px] text-white/30">5 employees</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={cSeo} variant="geo" size={90} strokeWidth={7} />
                  <p className="text-xs font-bold text-[#fe3f8c]">Them</p>
                  <p className="text-[10px] text-white/30">500 employees</p>
                </div>
              </div>
              <p className="text-xl font-black text-center mt-2">Size doesn&apos;t win rankings.<br /><span className="text-[#00e5ff]">Optimization does.</span></p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 29: The Overnight Fix (4:3) */}
        <AdFrame ratio="4:3" id="ad-29-overnight-fix">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/5 via-transparent to-[#f59e0b]/5" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-2xl font-black text-center leading-tight">What if you could find<br />every SEO mistake on your site<br /><span className="text-[#00e5ff]">in 60 seconds?</span></p>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10"><p className="text-xs text-red-400 font-bold">Missing Schema</p></div>
                <div className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10"><p className="text-xs text-red-400 font-bold">Thin Content</p></div>
                <div className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10"><p className="text-xs text-red-400 font-bold">Slow Speed</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10"><p className="text-xs text-yellow-400 font-bold">No FAQ</p></div>
                <div className="px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10"><p className="text-xs text-yellow-400 font-bold">Bad Metadata</p></div>
              </div>
              <p className="text-sm text-white/50">Found. Prioritized. Fixed.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 30: Local Business (4:3) */}
        <AdFrame ratio="4:3" id="ad-30-local-business">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#22c55e]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-sm text-[#22c55e] font-bold uppercase tracking-widest">For local businesses</p>
              <p className="text-2xl font-black text-center leading-tight">&ldquo;Best plumber near me&rdquo;</p>
              <p className="text-lg text-white/50 text-center">Google shows 10 results.<br />AI shows <span className="text-[#fe3f8c] font-bold">one</span>.</p>
              <CircularProgress value={geo} variant="geo" size={130} strokeWidth={11} label="Your GEO Score" />
              <p className="text-sm text-white/40">Is it high enough to be the one?</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 31: Invisible Competitor (16:9) */}
        <AdFrame ratio="16:9" id="ad-31-invisible-competitor">
          <div className="w-full h-full bg-[#0a0a12] flex items-center justify-center relative overflow-hidden px-12">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fe3f8c]/5 via-transparent to-[#00e5ff]/5" />
            <div className="relative z-10 flex items-center gap-12">
              <div className="flex-1">
                <p className="text-3xl font-black leading-tight mb-3">There&apos;s a competitor<br />you&apos;ve never heard of.</p>
                <p className="text-lg text-white/50 mb-2">They rank above you in AI search.</p>
                <p className="text-sm text-[#00e5ff] font-bold">Duelly shows you who they are.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={cSeo} variant="geo" size={80} strokeWidth={6} />
                  <p className="text-[10px] text-[#fe3f8c] font-bold">???</p>
                </div>
                <div className="text-white/10 text-2xl">vs</div>
                <div className="flex flex-col items-center gap-2">
                  <CircularProgress value={seo} variant="seo" size={80} strokeWidth={6} />
                  <p className="text-[10px] text-[#00e5ff] font-bold">You</p>
                </div>
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 32: No Subscription (4:3) */}
        <AdFrame ratio="4:3" id="ad-32-no-subscription">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 via-transparent to-[#00e5ff]/5" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-sm text-white/20 line-through">$199/month SEO tool subscription</p>
              <p className="text-3xl font-black text-center leading-tight">One-time purchase.<br /><span className="text-[#00e5ff]">Credits never expire.</span></p>
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-2">
                <div className="text-center p-3 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5">
                  <p className="text-lg font-black text-[#22c55e]">$80</p>
                  <p className="text-[10px] text-white/40">180 credits</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-[#00e5ff]/20 bg-[#00e5ff]/5">
                  <p className="text-lg font-black text-[#00e5ff]">$150</p>
                  <p className="text-[10px] text-white/40">550 credits</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-[#BC13FE]/20 bg-[#BC13FE]/5">
                  <p className="text-lg font-black text-[#BC13FE]">$300</p>
                  <p className="text-[10px] text-white/40">1,450 credits</p>
                </div>
              </div>
              <p className="text-sm text-white/40">No monthly fees. No contracts.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 33: Pays for Itself (1:1) */}
        <AdFrame ratio="1:1" id="ad-33-pays-for-itself">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#f59e0b]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-12">
              <p className="text-2xl font-black text-center leading-tight">One new customer<br />pays for the entire audit.</p>
              <div className="w-full max-w-xs space-y-2 mt-2">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Audit cost</span>
                  <span className="text-sm font-bold text-white/70">$80</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Avg customer value</span>
                  <span className="text-sm font-bold text-[#22c55e]">$500+</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-white/50">ROI</span>
                  <span className="text-sm font-bold text-[#f59e0b]">6x return</span>
                </div>
              </div>
              <p className="text-sm text-white/40 text-center">The math is simple.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 34: While You Sleep (4:5) */}
        <AdFrame ratio="4:5" id="ad-34-while-you-sleep">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0a0a12] to-[#00e5ff]/8" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-8">
              <p className="text-xl font-black text-center leading-tight">Right now, someone is asking AI<br />to recommend a business like yours.</p>
              <div className="space-y-2 w-full max-w-xs">
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-white/30 mb-1">ChatGPT</p>
                  <p className="text-sm text-white/60">&ldquo;Based on my analysis, I&apos;d recommend <span className="text-[#00e5ff] font-bold">competitor.com</span> for this service...&rdquo;</p>
                </div>
                <div className="p-3 rounded-lg bg-[#fe3f8c]/5 border border-[#fe3f8c]/20">
                  <p className="text-xs text-[#fe3f8c] font-bold">Your site wasn&apos;t mentioned.</p>
                </div>
              </div>
              <p className="text-lg font-black text-center mt-2">Change that.</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 35: Better Intel (4:3) */}
        <AdFrame ratio="4:3" id="ad-35-better-intel">
          <div className="w-full h-full bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00e5ff]/6 rounded-full blur-[140px]" />
            <div className="relative z-10 flex flex-col items-center gap-5 px-10">
              <p className="text-2xl font-black text-center leading-tight">You don&apos;t need a bigger budget.<br />You need <span className="text-[#00e5ff]">better intel</span>.</p>
              <div className="flex items-center gap-10 mt-2">
                <CircularProgress value={seo} variant="seo" size={100} strokeWidth={8} label="SEO" />
                <CircularProgress value={aeo} variant="aeo" size={100} strokeWidth={8} label="AEO" />
                <CircularProgress value={geo} variant="geo" size={100} strokeWidth={8} label="GEO" />
              </div>
              <p className="text-sm text-white/50 text-center max-w-sm">Duelly tells you exactly what to fix, in what order, for your specific platform.</p>
              <Logo size="xl" />
            </div>
          </div>
        </AdFrame>

        {/* 20 NEW ADS SECTION */}
        <div className="pt-12 border-t border-white/10 mt-20">
          <h2 className="text-xl font-bold mb-4 text-[#00e5ff]">New Creatives Batch</h2>
        </div>

        {/* AD 36: Mesh Gradient (4:3) */}
        <AdFrame ratio="4:3" id="ad-36-v2-optimise-mesh">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/20 via-transparent to-[#BC13FE]/20 animate-pulse" />
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[#fe3f8c]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 text-center px-10 space-y-6">
              <p className="text-3xl font-black tracking-tight leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Optimise your site for AI<br />for $79.99
              </p>
              <div className="flex justify-center gap-4">
                <div className="h-1 w-12 bg-[#00e5ff] rounded-full" />
                <div className="h-1 w-12 bg-white/10 rounded-full" />
                <div className="h-1 w-12 bg-white/10 rounded-full" />
              </div>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 37: Orbiting Spheres (1:1) */}
        <AdFrame ratio="1:1" id="ad-37-v2-cited-expert-orbits">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full" />
            <div className="absolute top-[20%] left-[20%] w-4 h-4 bg-[#00e5ff] rounded-full blur-sm animate-ping" />
            <div className="absolute bottom-[30%] right-[15%] w-6 h-6 bg-[#fe3f8c] rounded-full blur-md" />
            <div className="relative z-10 text-center px-12 space-y-8">
              <p className="text-2xl font-black text-white leading-tight">
                Get cited as the expert source by ChatGPT<br />
                <span className="text-[#00e5ff]">for $79.99</span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#BC13FE]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Authority Status</p>
                  <p className="text-sm font-black text-green-400">VERIFIED</p>
                </div>
              </div>
              <Logo />
            </div>
          </div>
        </AdFrame>

        {/* AD 38: Holographic Scan (16:9) */}
        <AdFrame ratio="16:9" id="ad-38-v2-secure-spot-hologram">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center px-16">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00e5ff] to-transparent shadow-[0_0_20px_#00e5ff]" />
            <div className="flex-1 space-y-4 relative z-10">
              <div className="inline-block px-3 py-1 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
                <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">Citation Protection</span>
              </div>
              <p className="text-4xl font-black text-white leading-none">
                Secure your spot in<br />AI citations <span className="text-white/40">for only $79.99</span>
              </p>
            </div>
            <div className="relative z-10">
              <div className="w-40 h-40 rounded-full border-4 border-[#00e5ff]/20 flex items-center justify-center relative">
                <div className="absolute inset-2 rounded-full border border-[#00e5ff]/40 animate-spin" />
                <div className="text-4xl">🛡️</div>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 39: Competitor Comparison (4:3) */}
        <AdFrame ratio="4:3" id="ad-39-v2-competitors-ready">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50" />
            <div className="relative z-10 w-full px-12 space-y-8">
              <p className="text-2xl font-black text-center text-white italic">
                &ldquo;Your competitors are already AI-ready.&rdquo;
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase">Them</p>
                  <p className="text-xl font-black text-green-400">READY</p>
                </div>
                <div className="text-2xl font-black text-white/20">VS</div>
                <div className="flex-1 p-4 rounded-2xl bg-[#fe3f8c]/5 border border-[#fe3f8c]/20 text-center space-y-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase">You</p>
                  <p className="text-xl font-black text-red-400">WAITING</p>
                </div>
              </div>
              <p className="text-2xl font-black text-center text-white bg-white/5 py-3 rounded-xl border border-white/10">
                Are you? <span className="text-[#00e5ff]">$79.99</span>
              </p>
              <div className="flex justify-center"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 40: Glassmorphism Card (4:5) */}
        <AdFrame ratio="4:5" id="ad-40-v2-optimise-glass">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden p-8 flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#BC13FE]/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00e5ff]/20 rounded-full blur-[80px]" />
            <div className="flex-1 relative z-10 flex flex-col justify-center">
              <div className="p-8 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00e5ff] to-[#BC13FE] mb-4" />
                <p className="text-3xl font-black text-white leading-tight">
                  Optimise your site<br />for AI
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-[#00e5ff] tracking-tighter">$79.99</p>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  The most comprehensive AI SEO audit on the market.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center relative z-10"><Logo size="lg" /></div>
          </div>
        </AdFrame>

        {/* AD 41: Data Waterfall (4:3) */}
        <AdFrame ratio="4:3" id="ad-41-v2-cited-waterfall">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center px-12">
            <div className="absolute inset-0 flex justify-around opacity-10">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-full w-px bg-gradient-to-b from-transparent via-[#00e5ff] to-transparent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
            <div className="relative z-10 text-center space-y-6">
              <p className="text-4xl font-black text-white leading-tight">
                Get cited by <span className="text-[#00e5ff]">ChatGPT</span>
              </p>
              <p className="text-xl font-bold text-white/50">
                Become the expert source<br />for your niche.
              </p>
              <div className="inline-block px-8 py-3 rounded-full bg-white text-black font-black text-xl shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                ONLY $79.99
              </div>
              <div className="pt-2"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 42: Minimalist Split (1:1) */}
        <AdFrame ratio="1:1" id="ad-42-v2-secure-split">
          <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            <div className="flex-1 bg-black flex items-center justify-center p-12">
              <p className="text-3xl font-black text-white text-center leading-none">
                Secure your spot in<br />AI citations
              </p>
            </div>
            <div className="h-1/3 bg-white flex items-center justify-between px-10">
              <p className="text-4xl font-black text-black">$79.99</p>
              <Logo size="lg" />
            </div>
            <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#fe3f8c] rotate-45 flex items-center justify-center">
              <div className="text-2xl -rotate-45">✨</div>
            </div>
          </div>
        </AdFrame>

        {/* AD 43: Dark Mode Depth (4:3) */}
        <AdFrame ratio="4:3" id="ad-43-v2-competitors-depth">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-center px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#050508_100%)]" />
            <div className="relative z-10 space-y-8 w-full">
              <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.1)]">
                <p className="text-2xl font-black text-white/90 leading-tight">
                  Your competitors are<br />already AI-ready.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-[2px] flex-1 bg-white/10 overflow-hidden">
                    <div className="h-full w-[85%] bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]" />
                  </div>
                  <span className="text-xs font-black text-[#00e5ff]">85%</span>
                </div>
                <p className="mt-1 text-[10px] font-bold text-white/20 uppercase">Industry Readiness</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-black text-white">Are you? <span className="text-[#fe3f8c]">$79.99</span></p>
                <Logo size="lg" />
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 44: Geometric Cyber (4:5) */}
        <AdFrame ratio="4:5" id="ad-44-v2-optimise-cyber">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden p-10 flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(45deg,#00e5ff_25%,transparent_25%,transparent_50%,#00e5ff_50%,#00e5ff_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
            <div className="relative z-10 border-l-4 border-[#00e5ff] pl-6 py-4">
              <p className="text-4xl font-black text-white tracking-tighter leading-none mb-2">OPTIMISE</p>
              <p className="text-lg font-bold text-[#00e5ff] tracking-[0.3em]">FOR ARTIFICIAL INTEL</p>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-7xl font-black text-white tracking-tighter">$79</span>
                <span className="text-3xl font-black text-[#00e5ff]">.99</span>
              </div>
              <button className="w-full py-4 bg-[#00e5ff] text-black font-black uppercase tracking-widest text-sm skew-x-[-12deg]">
                Secure Your Spot
              </button>
            </div>
            <div className="relative z-10 pt-4"><Logo size="lg" /></div>
          </div>
        </AdFrame>

        {/* AD 45: Bright Accent (1:1) */}
        <AdFrame ratio="1:1" id="ad-45-v2-cited-accent">
          <div className="w-full h-full bg-[#fe3f8c] relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            <div className="relative z-10 bg-white p-10 rounded-[40px] shadow-2xl rotate-[-2deg] space-y-6 text-center">
              <p className="text-3xl font-black text-black leading-tight">
                Get cited as the expert source by <span className="text-[#fe3f8c]">ChatGPT</span>
              </p>
              <p className="text-xl font-bold text-black/40">$79.99</p>
              <div className="flex justify-center"><Logo size="lg" /></div>
            </div>
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full animate-bounce" />
          </div>
        </AdFrame>

        {/* AD 45: Bright Accent (1:1) */}
        <AdFrame ratio="1:1" id="ad-45-v2-cited-accent">
          <div className="w-full h-full bg-[#fe3f8c] relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            <div className="relative z-10 bg-white p-10 rounded-[40px] shadow-2xl rotate-[-2deg] space-y-6 text-center">
              <p className="text-3xl font-black text-black leading-tight">
                Get cited as the expert source by <span className="text-[#fe3f8c]">ChatGPT</span>
              </p>
              <p className="text-xl font-bold text-black/40">$79.99</p>
              <div className="flex justify-center"><Logo size="lg" /></div>
            </div>
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full animate-bounce" />
          </div>
        </AdFrame>

        {/* AD 46: Topographic Lines (4:3) */}
        <AdFrame ratio="4:3" id="ad-46-v2-secure-topo">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
            <div className="absolute inset-0 overflow-hidden">
               <svg viewBox="0 0 100 100" className="w-full h-full text-white/5 opacity-50">
                 <path d="M0,20 Q25,10 50,20 T100,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                 <path d="M0,40 Q25,30 50,40 T100,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                 <path d="M0,60 Q25,50 50,60 T100,60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                 <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
               </svg>
            </div>
            <div className="relative z-10 text-center space-y-4">
              <p className="text-sm font-bold text-[#f59e0b] uppercase tracking-[0.4em]">Strategic Placement</p>
              <p className="text-4xl font-black text-white">Secure your spot in<br />AI citations</p>
              <p className="text-5xl font-black text-white/20">$79.99</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 47: Cyberpunk Grid (4:5) */}
        <AdFrame ratio="4:5" id="ad-47-v2-competitors-cyber">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden p-10 flex flex-col justify-center border-2 border-white/5">
            <div className="absolute top-4 left-4 text-[8px] text-[#00e5ff] font-mono opacity-40 uppercase">System_Active // Port: 8080</div>
            <div className="absolute bottom-4 right-4 text-[8px] text-[#00e5ff] font-mono opacity-40 uppercase">Optim_Target: Competitor_AI</div>
            <div className="space-y-6">
              <p className="text-3xl font-black text-white leading-tight">
                Your competitors are already<br />
                <span className="text-[#00e5ff] uppercase italic tracking-wider">AI-Ready.</span>
              </p>
              <div className="h-px w-full bg-gradient-to-r from-[#00e5ff] to-transparent" />
              <p className="text-4xl font-black text-white/40">Are you?</p>
              <p className="text-6xl font-black text-white">$79.99</p>
            </div>
            <div className="mt-12"><Logo size="lg" /></div>
          </div>
        </AdFrame>

        {/* AD 48: Focus Rings (1:1) */}
        <AdFrame ratio="1:1" id="ad-48-v2-optimise-rings">
          <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
            <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,#00e5ff0d_0%,transparent_50%)] animate-pulse" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border border-[#00e5ff]/20 scale-110" />
                <div className="absolute inset-0 rounded-full border border-[#00e5ff]/10 scale-150" />
                <p className="text-2xl font-black text-white text-center leading-tight">
                  Optimise your site<br />for AI
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <CircularProgress value={98} variant="seo" size={80} strokeWidth={6} label="SEO" />
                <CircularProgress value={97} variant="geo" size={80} strokeWidth={6} label="GEO" />
              </div>

              <div className="px-6 py-2 rounded-full bg-[#00e5ff] text-black font-black text-lg">
                FOR $79.99
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 49: Prism Refraction (16:9) */}
        <AdFrame ratio="16:9" id="ad-49-v2-cited-prism">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center px-12 gap-12">
            <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-white/5 rotate-[30deg] blur-3xl pointer-events-none" />
            <div className="relative z-10 flex-1 space-y-4">
              <p className="text-4xl font-black text-white leading-none">
                Get cited as the<br /><span className="text-white/40 italic">expert source</span>
              </p>
              <p className="text-2xl font-bold text-[#fe3f8c]">by ChatGPT for $79.99</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md flex items-center justify-center text-xl">
                  {['✅', '📊', '🌐', '🤖'][i-1]}
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-12"><Logo size="md" /></div>
          </div>
        </AdFrame>

        {/* AD 50: Inner Glow Depth (4:3) */}
        <AdFrame ratio="4:3" id="ad-50-v2-secure-depth">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.8)] z-10" />
            <div className="w-full aspect-[4/3] rounded-[40px] bg-gradient-to-b from-[#1a1a2e] to-[#0a0a12] border border-white/10 flex flex-col items-center justify-center relative">
              <p className="text-2xl font-black text-white text-center leading-tight">
                Secure your spot in<br />AI citations
              </p>
              <p className="text-4xl font-black mt-4 text-[#00e5ff] drop-shadow-[0_0_15px_#00e5ff66]">$79.99</p>
              <div className="mt-8"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 51: Abstract Mosaic (4:3) */}
        <AdFrame ratio="4:3" id="ad-51-v2-competitors-mosaic">
          <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-6 opacity-20">
              {Array.from({length: 24}).map((_, i) => (
                <div key={i} className="border border-white/10" style={{ backgroundColor: i % 7 === 0 ? '#fe3f8c22' : 'transparent' }} />
              ))}
            </div>
            <div className="relative z-10 bg-black/80 backdrop-blur-xl p-10 border border-white/20 rounded-[40px] space-y-6 text-center">
              <p className="text-xl font-bold text-white/50 uppercase tracking-widest italic">The Hard Truth</p>
              <p className="text-3xl font-black text-white">
                Your competitors are<br />already AI-ready.
              </p>
              <p className="text-2xl font-black text-[#fe3f8c]">Are you? $79.99</p>
              <div className="flex justify-center pt-2"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 52: Clean Professional (16:9) */}
        <AdFrame ratio="16:9" id="ad-52-v2-optimise-clean">
          <div className="w-full h-full bg-[#f8fafc] relative overflow-hidden flex items-center justify-between px-20 text-slate-900 font-sans">
            <div className="space-y-4">
              <p className="text-4xl font-black flex flex-col leading-none">
                <span>Optimise your site</span>
                <span className="text-blue-600">for AI for $79.99</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">INSTANT AUDIT</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PDF REPORT</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-blue-600 rounded-[32px] shadow-2xl flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/20 rounded-full border-t-white animate-spin" />
            </div>
          </div>
        </AdFrame>

        {/* AD 53: Neon Glow (4:5) */}
        <AdFrame ratio="4:5" id="ad-53-v2-cited-neon">
          <div className="w-full h-full bg-[#030303] relative overflow-hidden flex flex-col items-center justify-center p-8">
            <div className="absolute w-full h-1 bg-[#fe3f8c] top-0 shadow-[0_0_20px_#fe3f8c]" />
            <div className="absolute w-full h-1 bg-[#00e5ff] bottom-0 shadow-[0_0_20px_#00e5ff]" />
            <div className="text-center space-y-10">
              <p className="text-2xl font-bold text-white/40 uppercase tracking-[0.5em]">Authority Lab</p>
              <p className="text-3xl font-black text-white leading-tight">
                Get cited as the<br />expert source by<br /><span className="text-[#fe3f8c] drop-shadow-[0_0_10px_#fe3f8c]">ChatGPT</span>
              </p>
              <p className="text-5xl font-black text-white">$79.99</p>
              <div className="pt-4"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 54: Soft UI (4:3) */}
        <AdFrame ratio="4:3" id="ad-54-v2-secure-soft">
          <div className="w-full h-full bg-[#f1f5f9] relative overflow-hidden flex flex-col items-center justify-center p-10 text-slate-800">
             <div className="w-full p-8 rounded-[40px] bg-white shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] space-y-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Visibility Booster</p>
                <p className="text-2xl font-black">Secure your spot in<br />AI citations for $79.99</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs font-bold text-slate-400">Limited availability for niche experts</p>
                </div>
             </div>
             <div className="mt-8 opacity-50"><Logo size="md" /></div>
          </div>
        </AdFrame>

        {/* AD 55: Particle Fusion (4:3) */}
        <AdFrame ratio="4:3" id="ad-55-v2-competitors-particles">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center px-12">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative z-10 text-center space-y-6">
               <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-2">
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Market Intel v2.0</span>
               </div>
               <p className="text-3xl font-black text-white leading-tight italic">
                 &ldquo;Your competitors are already AI-ready.&rdquo;
               </p>
               <p className="text-5xl font-black bg-gradient-to-r from-[#00e5ff] to-[#BC13FE] bg-clip-text text-transparent">
                 Are you? $79.99
               </p>
               <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* 10 MASTER MARKETER ADS */}
        <div className="pt-12 border-t border-white/10 mt-20">
          <h2 className="text-xl font-bold mb-4 text-[#00e5ff]">Master Marketer Series (Ads 56-65)</h2>
        </div>

        {/* AD 56: The Cost of Inaction (16:9) */}
        <AdFrame ratio="16:9" id="ad-56-cost-of-inaction">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-between px-16">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
            <div className="relative z-10 flex flex-col items-start gap-4 flex-1">
              <p className="text-sm font-black text-red-400 uppercase tracking-widest">The Cost of Inaction</p>
              <p className="text-4xl font-black text-white leading-tight">
                Every day you wait, AI sends<br />your customers to the competition.
              </p>
              <p className="text-lg text-white/50 font-medium">Stop the leak. Get your AI SEO audit <span className="text-white font-bold">for only $79.99</span>.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="px-8 py-4 bg-red-500 rounded-xl text-white font-black text-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                FIX IT NOW
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 57: The ROI Angle (1:1) */}
        <AdFrame ratio="1:1" id="ad-57-roi-angle">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center px-12 text-center">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <span className="text-3xl">📈</span>
              </div>
              <p className="text-3xl font-black text-white leading-tight">
                One new customer pays for<br />this entire audit.
              </p>
              <p className="text-lg text-white/50">
                Unlock your site&apos;s true AI potential<br />
                <span className="text-green-400 font-bold">for just $79.99</span>
              </p>
              <div className="mt-4"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 58: Local Dominance (4:5) */}
        <AdFrame ratio="4:5" id="ad-58-local-dominance">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center px-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00e5ff15,transparent_50%)]" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <p className="text-sm font-bold text-[#00e5ff] uppercase tracking-[0.3em]">Local Business Alert</p>
              <p className="text-4xl font-black text-white leading-tight">
                Be the <span className="text-[#00e5ff] italic">ONLY</span> business<br />ChatGPT recommends<br />in your city.
              </p>
              <div className="px-6 py-3 border border-[#00e5ff]/30 bg-[#00e5ff]/10 rounded-2xl">
                <p className="text-xl font-black text-white">Full Strategy for <span className="text-[#00e5ff]">$79.99</span></p>
              </div>
              <div className="mt-8"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 59: The Clear CTA (4:3) */}
        <AdFrame ratio="4:3" id="ad-59-clear-cta">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[50%] bg-[#BC13FE]/10 blur-[100px] rounded-[100%]" />
            <div className="relative z-10 w-full bg-white/[0.02] border border-white/10 rounded-[32px] p-10 flex flex-col items-center gap-6 shadow-2xl backdrop-blur-sm">
              <p className="text-3xl font-black text-white">Is your website invisible to AI?</p>
              <p className="text-lg text-white/60 max-w-sm">
                Get a comprehensive breakdown of your AI Search visibility and the exact steps to fix it.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-3xl font-black text-[#BC13FE]">$79.99</span>
                <span className="text-sm text-white/40 uppercase tracking-widest">One-time payment</span>
              </div>
            </div>
            <div className="mt-8 relative z-10"><Logo size="md" /></div>
          </div>
        </AdFrame>

        {/* AD 60: The ChatGPT Direct Quote (4:3) */}
        <AdFrame ratio="4:3" id="ad-60-chatgpt-quote">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="relative z-10 w-full max-w-md">
              <div className="bg-[#10a37f]/10 border border-[#10a37f]/30 p-6 rounded-2xl rounded-tl-none mb-8 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                <p className="text-lg text-white/90 italic">
                  &ldquo;I highly recommend <span className="text-[#10a37f] font-bold">[Your Competitor]</span> because their data is properly structured for my AI engine.&rdquo;
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-2xl font-black text-white">Change the conversation.</p>
                <p className="text-white/50">Force AI to recommend YOU <span className="text-white font-bold">for only $79.99</span>.</p>
                <div className="mt-4"><Logo size="lg" /></div>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 61: The Traffic Leak Fix (16:9) */}
        <AdFrame ratio="16:9" id="ad-61-traffic-leak">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center px-16 gap-12">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#fe3f8c]/20 to-transparent blur-3xl" />
            <div className="relative z-10 flex-1 space-y-6">
              <p className="text-4xl font-black text-white leading-tight">
                Traditional SEO is dying.<br />
                <span className="text-[#fe3f8c]">AI Search is here.</span>
              </p>
              <p className="text-xl text-white/60">
                Future-proof your website&apos;s traffic today.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center p-8 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl">
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Full Audit</p>
              <p className="text-5xl font-black text-white mb-6">$79.99</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 62: The Authority Play (1:1) */}
        <AdFrame ratio="1:1" id="ad-62-authority-play">
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#00e5ff] to-[#BC13FE] rounded-full p-1">
                <div className="w-full h-full bg-[#0a0a12] rounded-full flex items-center justify-center">
                  <span className="text-4xl">👑</span>
                </div>
              </div>
              <p className="text-3xl font-black text-white leading-tight">
                Establish absolute authority<br />in AI language models.
              </p>
              <div className="py-2 px-6 bg-white/5 border border-white/10 rounded-full">
                <p className="text-lg text-white">Full optimization strategy <span className="font-black text-[#00e5ff]">for $79.99</span></p>
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 63: Fast Results (4:3) */}
        <AdFrame ratio="4:3" id="ad-63-fast-results">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00e5ff]/5 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <p className="text-sm font-black text-[#00e5ff] uppercase tracking-[0.4em]">60-Second Scan</p>
              <p className="text-4xl font-black text-white leading-tight">
                Identify every AI blindspot<br />on your website instantly.
              </p>
              <p className="text-lg text-white/50 max-w-sm">
                Stop guessing. Get the exact blueprint to dominate AI search <span className="text-white font-bold">for $79.99</span>.
              </p>
              <div className="mt-4"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 64: The Competitor Nightmare (4:5) */}
        <AdFrame ratio="4:5" id="ad-64-competitor-nightmare">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-10 text-center">
            <div className="absolute inset-0 border-8 border-red-500/20 m-6 rounded-3xl" />
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <p className="text-5xl font-black text-white uppercase tracking-tighter">
                BE THEIR<br /><span className="text-red-500">NIGHTMARE</span>
              </p>
              <p className="text-xl text-white/70 leading-relaxed">
                Steal your competitors&apos;<br />AI search traffic.
              </p>
              <div className="w-full h-px bg-white/10" />
              <p className="text-lg text-white/50">
                Actionable AI SEO Audit<br />
                <span className="text-3xl font-black text-white mt-2 block">Only $79.99</span>
              </p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 65: The Ultimate Value Drop (16:9) */}
        <AdFrame ratio="16:9" id="ad-65-value-drop">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-between px-16 text-left">
            <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-white/5 rotate-[30deg] blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <p className="text-sm font-bold text-[#BC13FE] uppercase tracking-[0.3em]">The Ultimate AI Audit</p>
              <p className="text-4xl font-black text-white leading-tight">
                Everything you need to<br />rank in AI Overviews.
              </p>
              <ul className="text-white/60 space-y-2 text-sm mt-2">
                <li className="flex items-center gap-2"><span className="text-[#BC13FE]">✓</span> Platform-specific fixes</li>
                <li className="flex items-center gap-2"><span className="text-[#BC13FE]">✓</span> Competitor analysis</li>
                <li className="flex items-center gap-2"><span className="text-[#BC13FE]">✓</span> Entity gap identification</li>
              </ul>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total Investment</p>
                <p className="text-6xl font-black text-white tracking-tighter">$79<span className="text-3xl text-white/50">.99</span></p>
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* REDDIT OPTIMIZATION SERIES */}
        <div className="pt-12 border-t border-white/10 mt-20">
          <h2 className="text-xl font-bold mb-4 text-[#ff4500]">Reddit Optimization Series (Ads 66-75)</h2>
        </div>

        {/* AD 66: The Self-Aware Reddit Ad (1:1) */}
        <AdFrame ratio="1:1" id="ad-66-reddit-self-aware">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-2xl font-bold text-white/80">
                Yeah, this is an ad.
              </p>
              <p className="text-4xl font-black text-white leading-tight">
                But your SEO is broken<br />and we both know it.
              </p>
              <p className="text-lg text-white/50">
                Stop guessing what AI wants.<br />Get the exact blueprint.
              </p>
              <div className="px-8 py-3 mt-4 bg-[#ff4500] text-white font-black text-xl rounded-full">
                Audit Site ($79.99)
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 67: The Agency Roast (16:9) */}
        <AdFrame ratio="16:9" id="ad-67-reddit-agency-roast">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex items-center justify-center p-12">
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <p className="text-4xl font-black text-white leading-tight">
                Stop paying agencies $2k/mo for SEO<br />when AI is taking all the traffic anyway.
              </p>
              <div className="flex items-center gap-6">
                <p className="text-xl text-white/50">One-time AI audit.</p>
                <p className="text-xl font-black text-[#00e5ff]">$79.99</p>
                <p className="text-xl text-white/50">No subscription BS.</p>
              </div>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 68: The AMA Format (4:5) */}
        <AdFrame ratio="4:5" id="ad-68-reddit-ama">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-start justify-center p-10">
            <div className="w-full bg-[#272729] border border-[#343536] p-6 rounded-lg mb-8">
              <p className="text-[#818384] text-xs font-bold mb-2">r/Entrepreneur • Posted by u/DuellyHQ</p>
              <p className="text-2xl font-bold text-[#d7dadc] leading-tight">
                I built a tool that shows you EXACTLY why ChatGPT ignores your website. AMA.
              </p>
            </div>
            <div className="w-full flex flex-col items-center text-center gap-6">
              <p className="text-xl text-white/70">
                Find your AI blindspots<br />before your competitors do.
              </p>
              <p className="text-3xl font-black text-[#00e5ff]">$79.99</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 69: The TIL Format (4:3) */}
        <AdFrame ratio="4:3" id="ad-69-reddit-til">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="relative z-10 space-y-8">
              <p className="text-5xl font-black text-white leading-tight">
                <span className="text-[#ff4500]">TIL</span> that being #1 on Google<br />doesn&apos;t mean AI knows<br />you exist.
              </p>
              <p className="text-xl text-[#818384]">
                Get the audit that fixes your AI visibility.
              </p>
              <div className="inline-block border-b-2 border-[#00e5ff] pb-1">
                <p className="text-2xl font-black text-white">For only $79.99</p>
              </div>
              <div className="mt-4"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 70: The Dev Angle (16:9) */}
        <AdFrame ratio="16:9" id="ad-70-reddit-dev">
          <div className="w-full h-full bg-[#0d0d0d] relative overflow-hidden flex items-center justify-between px-16 font-mono">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="relative z-10 flex flex-col items-start gap-4">
              <p className="text-[#00ff00] text-xl">&gt; Traditional SEO is deprecated.</p>
              <p className="text-[#00ff00] text-xl">&gt; AEO is the new standard.</p>
              <p className="text-white/50 text-sm mt-4">Compile your site&apos;s AI visibility report.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center border border-[#333] bg-[#111] p-8 rounded-xl gap-4">
              <p className="text-3xl font-bold text-white">init --audit</p>
              <p className="text-xl text-[#00e5ff]">$79.99</p>
              <Logo size="sm" />
            </div>
          </div>
        </AdFrame>

        {/* AD 71: Roast My Site (1:1) */}
        <AdFrame ratio="1:1" id="ad-71-reddit-roast">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500]/10 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6">
              <p className="text-sm font-bold text-[#ff4500] uppercase tracking-[0.4em]">r/RoastMySite</p>
              <p className="text-4xl font-black text-white leading-tight">
                Let our AI absolutely roast<br />your website&apos;s visibility.
              </p>
              <p className="text-lg text-[#818384] max-w-sm mx-auto">
                We&apos;ll tell you exactly why ChatGPT hates your site, and how to fix it.
              </p>
              <p className="text-3xl font-black text-[#00e5ff] pt-4">$79.99</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 72: Shower Thoughts (4:3) */}
        <AdFrame ratio="4:3" id="ad-72-reddit-shower">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="w-full bg-[#272729] border border-[#343536] p-8 rounded-xl space-y-6">
              <p className="text-[#818384] text-sm font-bold text-left">r/Showerthoughts</p>
              <p className="text-3xl font-bold text-[#d7dadc] leading-tight italic">
                &ldquo;If an AI recommends your competitor in the forest, do you even exist?&rdquo;
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <p className="text-xl text-white">Exist in the AI era. Get the audit.</p>
              <p className="text-2xl font-black text-[#00e5ff]">Only $79.99</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 73: Life Pro Tip (4:3) */}
        <AdFrame ratio="4:3" id="ad-73-reddit-lpt">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
             <div className="relative z-10 space-y-6">
              <p className="text-4xl font-black text-white leading-tight">
                <span className="text-[#00e5ff]">LPT:</span> Stop optimizing for Google<br />when 40% of search is<br />moving to AI.
              </p>
              <p className="text-lg text-[#818384]">
                The algorithms changed. Your strategy should too.
              </p>
              <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-full mt-4">
                <p className="text-xl font-black text-white">Full AI Audit: $79.99</p>
              </div>
              <div className="pt-4"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 74: The Before/After Data (4:5) */}
        <AdFrame ratio="4:5" id="ad-74-reddit-data">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex flex-col items-center justify-center p-10">
            <div className="w-full max-w-sm space-y-8">
              <p className="text-3xl font-black text-white text-center">Data doesn&apos;t lie.</p>
              <div className="bg-[#272729] p-4 rounded-xl border border-red-500/30 flex justify-between items-center">
                <span className="text-[#818384] font-bold">Without Audit</span>
                <span className="text-red-400 font-black text-2xl">22% Vis</span>
              </div>
              <div className="text-center text-white/30 text-2xl">↓</div>
              <div className="bg-[#272729] p-4 rounded-xl border border-green-500/30 flex justify-between items-center">
                <span className="text-white font-bold">With Duelly ($79.99)</span>
                <span className="text-green-400 font-black text-2xl">94% Vis</span>
              </div>
              <div className="pt-8 flex justify-center"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 75: Brutal Honesty (16:9) */}
        <AdFrame ratio="16:9" id="ad-75-reddit-honest">
          <div className="w-full h-full bg-[#1a1a1b] relative overflow-hidden flex items-center justify-center p-16 text-center">
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <p className="text-5xl font-black text-white">
                No subscription.<br />No BS.
              </p>
              <p className="text-2xl text-[#818384]">
                Just a $79.99 audit that actually tells you<br />how to rank in AI search.
              </p>
              <div className="mt-4"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* HYPER-OPTIMIZED UNIVERSAL SERIES */}
        <div className="pt-12 border-t border-white/10 mt-20">
          <h2 className="text-xl font-bold mb-4 text-[#BC13FE]">Hyper-Optimized Series (Ads 76-85)</h2>
        </div>

        {/* AD 76: The Proof Dashboard (16:9) */}
        <AdFrame ratio="16:9" id="ad-76-hyper-proof">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-between px-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col items-start gap-4">
              <p className="text-sm font-black text-green-400 uppercase tracking-widest">Proven Results</p>
              <p className="text-4xl font-black text-white leading-tight">
                From invisible to<br />the definitive answer.
              </p>
              <p className="text-xl text-white/50">One audit. <span className="text-white font-bold">$79.99</span></p>
            </div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex flex-col items-center">
                <CircularProgress value={18} variant="geo" size={100} strokeWidth={8} label="Before" />
              </div>
              <div className="text-white/20 text-4xl">→</div>
              <div className="flex flex-col items-center">
                <CircularProgress value={96} variant="seo" size={120} strokeWidth={10} label="After Duelly" />
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 77: Local Domination Visualized (1:1) */}
        <AdFrame ratio="1:1" id="ad-77-hyper-local-podium">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-[#f59e0b]/10 to-transparent" />
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <p className="text-3xl font-black text-white leading-tight">
                Dominate your local<br />AI search results.
              </p>
              <div className="flex items-end gap-2 h-32">
                <div className="w-16 h-16 bg-white/5 rounded-t-lg border-t border-white/10 flex items-end justify-center pb-2"><span className="text-xs text-white/30 font-bold">#2</span></div>
                <div className="w-20 h-28 bg-[#f59e0b]/20 rounded-t-lg border-t-2 border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-end justify-center pb-4"><span className="text-lg text-[#f59e0b] font-black">YOU</span></div>
                <div className="w-16 h-12 bg-white/5 rounded-t-lg border-t border-white/10 flex items-end justify-center pb-2"><span className="text-xs text-white/30 font-bold">#3</span></div>
              </div>
              <p className="text-lg text-white/50">The exact roadmap for <span className="text-white font-bold">$79.99</span></p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 78: The Secret Weapon (4:5) */}
        <AdFrame ratio="4:5" id="ad-78-hyper-secret">
          <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center justify-center p-10 text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[50%] bg-[#BC13FE]/10 rounded-full blur-[100px] rotate-45" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00e5ff] to-[#BC13FE] rounded-2xl shadow-[0_0_40px_rgba(188,19,254,0.4)]" />
              <p className="text-sm font-black text-[#BC13FE] uppercase tracking-[0.4em]">The Secret Weapon</p>
              <p className="text-4xl font-black text-white leading-tight">
                The AI audit 7-figure<br />businesses use to stay<br />on top.
              </p>
              <p className="text-3xl font-black text-white border-t border-white/10 pt-6 w-full">$79.99</p>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* AD 79: The No Brainer ROI Matrix (4:3) */}
        <AdFrame ratio="4:3" id="ad-79-hyper-roi">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="relative z-10 space-y-6 w-full max-w-md">
              <p className="text-3xl font-black text-white">Pure Mathematics.</p>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/50">Audit Investment</span>
                  <span className="text-white font-bold">$79.99</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/50">Avg. Client Value</span>
                  <span className="text-green-400 font-bold">$1,500.00</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/80 font-bold">Risk Level</span>
                  <span className="text-[#00e5ff] font-black">ZERO</span>
                </div>
              </div>
              <p className="text-sm text-white/40">It only takes one AI referral to 20x your ROI.</p>
              <div className="pt-2"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 80: The Urgency Warning (16:9) */}
        <AdFrame ratio="16:9" id="ad-80-hyper-warning">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center p-12 gap-12">
            <div className="absolute inset-0 border-[12px] border-red-500/20" />
            <div className="relative z-10 text-center px-8 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <p className="text-3xl font-black text-red-500 animate-pulse">WARNING</p>
            </div>
            <div className="relative z-10 flex flex-col items-start gap-4 flex-1">
              <p className="text-3xl font-black text-white leading-tight">
                Your competitors are actively<br />optimizing for AI Search.
              </p>
              <p className="text-xl text-white/50">
                Don&apos;t get left behind. <span className="text-white font-bold">Secure your strategy for $79.99</span>
              </p>
            </div>
          </div>
        </AdFrame>

        {/* AD 81: The Executive Summary (4:3) */}
        <AdFrame ratio="4:3" id="ad-81-hyper-executive">
          <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center shadow-inner">
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">For Founders & CMOs</p>
              <p className="text-4xl font-black text-white leading-tight">
                The definitive board-ready<br />AI visibility report.
              </p>
              <div className="w-16 h-1 bg-blue-500 rounded-full" />
              <p className="text-lg text-slate-300 max-w-sm">
                Identify precisely where AI engines are dropping your brand.
              </p>
              <p className="text-2xl font-black text-blue-400">$79.99</p>
              <div className="pt-4"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 82: The E-Commerce Savior (1:1) */}
        <AdFrame ratio="1:1" id="ad-82-hyper-ecommerce">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <div className="text-5xl mb-4">🛍️</div>
              <p className="text-3xl font-black text-white leading-tight">
                Why didn&apos;t ChatGPT<br />recommend your product?
              </p>
              <p className="text-lg text-white/50">
                Your store lacks critical entity data.<br />We&apos;ll show you exactly what&apos;s missing.
              </p>
              <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl mt-2">
                <p className="text-2xl font-black text-[#f59e0b]">Fix it for $79.99</p>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 83: The Future-Proof Shield (4:5) */}
        <AdFrame ratio="4:5" id="ad-83-hyper-shield">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#00e5ff1a_0%,transparent_60%)]" />
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <div className="text-7xl drop-shadow-[0_0_20px_#00e5ff66]">🛡️</div>
              <p className="text-4xl font-black text-white leading-tight">
                Protect your revenue<br />from AI disruption.
              </p>
              <p className="text-lg text-[#00e5ff] font-bold uppercase tracking-widest">
                Future-Proof Audit: $79.99
              </p>
              <p className="text-sm text-white/40 max-w-xs">
                Ensure Google&apos;s AI Overviews and ChatGPT cite you as the source.
              </p>
              <div className="pt-6"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 84: The Unlock Box (4:3) */}
        <AdFrame ratio="4:3" id="ad-84-hyper-unlock">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center border-4 border-white/[0.02]">
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">🔓</span>
              </div>
              <p className="text-3xl font-black text-white leading-tight">
                Unlock the hidden traffic<br />vault of AI Search.
              </p>
              <p className="text-xl text-[#BC13FE] font-black">$79.99</p>
              <p className="text-sm text-white/50">The exact roadmap to dominate generative engines.</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 85: The Ultimate Competitor Hook (16:9) */}
        <AdFrame ratio="16:9" id="ad-85-hyper-competitor">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-center p-16">
            <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#fe3f8c]/10 to-transparent blur-2xl" />
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <p className="text-5xl font-black text-white leading-tight">
                We found exactly why you&apos;re<br />losing to your competitor in AI.
              </p>
              <div className="flex items-center gap-4">
                <p className="text-2xl text-white/60">See the data.</p>
                <div className="px-6 py-2 bg-[#fe3f8c] rounded-lg">
                  <p className="text-xl font-black text-white">For $79.99</p>
                </div>
              </div>
              <Logo size="lg" />
            </div>
          </div>
        </AdFrame>

        {/* INTEL & BLUEPRINT SERIES */}
        <div className="pt-12 border-t border-white/10 mt-20">
          <h2 className="text-xl font-bold mb-4 text-[#00e5ff]">The Intel & Blueprint Series (Ads 86-95)</h2>
        </div>

        {/* AD 86: The Deliverables List (4:5) */}
        <AdFrame ratio="4:5" id="ad-86-intel-deliverables">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col justify-center p-10">
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#00e5ff]/5 rounded-full blur-[100px]" />
            <div className="relative z-10 space-y-6 w-full">
              <p className="text-3xl font-black text-white leading-tight mb-8">
                What you get for <span className="text-[#00e5ff]">$79.99</span>:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                  <span className="text-2xl">🔍</span>
                  <p className="text-lg font-bold text-white/90">1. Deep Technical Scan</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                  <span className="text-2xl">📊</span>
                  <p className="text-lg font-bold text-white/90">2. Competitor Intel</p>
                </div>
                <div className="p-4 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl flex items-center gap-4">
                  <span className="text-2xl">🗺️</span>
                  <p className="text-lg font-bold text-[#00e5ff]">3. The Fix Blueprint</p>
                </div>
              </div>
              <div className="pt-6 text-center"><Logo size="md" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 87: Stop Guessing (16:9) */}
        <AdFrame ratio="16:9" id="ad-87-intel-stop-guessing">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex items-center justify-between px-16">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fe3f8c]/10 to-transparent blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6 w-1/2">
              <p className="text-4xl font-black text-white leading-tight">
                Stop guessing what<br />AI wants.
              </p>
              <p className="text-xl text-white/60">
                Buy the exact blueprint to rank in ChatGPT and AI Overviews.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4 bg-white/[0.03] p-8 border border-white/10 rounded-3xl">
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Full Analysis</p>
              <p className="text-5xl font-black text-[#fe3f8c]">$79.99</p>
              <Logo size="sm" />
            </div>
          </div>
        </AdFrame>

        {/* AD 88: The MRI Analogy (4:3) */}
        <AdFrame ratio="4:3" id="ad-88-intel-mri">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#00e5ff1a_0%,transparent_60%)]" />
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full border border-[#00e5ff]/30 flex items-center justify-center">
                <span className="text-4xl text-[#00e5ff]">🩻</span>
              </div>
              <p className="text-3xl font-black text-white leading-tight">
                We are the MRI for your<br />website&apos;s AI visibility.
              </p>
              <p className="text-lg text-white/50 max-w-sm mx-auto">
                You know you have a traffic problem. We provide the scan that finds exactly where it's broken.
              </p>
              <div className="inline-block mt-4 px-6 py-2 border border-[#00e5ff]/50 bg-[#00e5ff]/10 rounded-full">
                <p className="text-xl font-black text-[#00e5ff]">Scan Cost: $79.99</p>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 89: Architect Blueprint (1:1) */}
        <AdFrame ratio="1:1" id="ad-89-intel-architect">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center border-4 border-[#00e5ff]/20">
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.05 }} />
            <div className="relative z-10 space-y-8 flex flex-col items-center bg-[#0a0a12]/80 p-8 rounded-3xl backdrop-blur-sm border border-[#00e5ff]/20">
              <p className="text-4xl font-black text-white leading-tight">
                Don&apos;t buy promises.<br />
                <span className="text-[#00e5ff]">Buy the blueprint.</span>
              </p>
              <p className="text-lg text-white/70">
                Actionable, platform-specific fixes to optimize your site for AI engines.
              </p>
              <p className="text-4xl font-black text-white bg-white/10 px-6 py-2 rounded-xl">$79.99</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 90: Intel Acquisition (16:9) */}
        <AdFrame ratio="16:9" id="ad-90-intel-acquisition">
          <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-between px-16">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#BC13FE]/20 to-transparent blur-3xl" />
            <div className="relative z-10 space-y-6">
              <p className="text-sm font-bold text-[#BC13FE] uppercase tracking-[0.4em]">Strategic Acquisition</p>
              <p className="text-4xl font-black text-white leading-tight">
                Buy the intel your competitors<br />hope you never see.
              </p>
              <p className="text-xl text-white/50">Full AI Search Analysis + Fix Roadmap</p>
            </div>
            <div className="relative z-10">
              <div className="text-center p-8 border border-white/20 rounded-2xl bg-white/5 backdrop-blur-xl">
                <p className="text-5xl font-black text-white mb-2">$79.99</p>
                <p className="text-xs font-bold text-[#BC13FE] uppercase tracking-widest">One Time</p>
              </div>
            </div>
          </div>
        </AdFrame>

        {/* AD 91: Phase 1 & 2 (4:5) */}
        <AdFrame ratio="4:5" id="ad-91-intel-phases">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col justify-center p-10 text-center">
            <div className="absolute bottom-0 right-0 w-[100%] h-[50%] bg-[#00e5ff]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <p className="text-4xl font-black text-white">How it works:</p>
              <div className="w-full space-y-4 text-left">
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[#00e5ff] font-black text-sm uppercase tracking-widest mb-1">Phase 1</p>
                  <p className="text-xl font-bold text-white">We audit your AI visibility.</p>
                </div>
                <div className="p-5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-2xl">
                  <p className="text-[#00e5ff] font-black text-sm uppercase tracking-widest mb-1">Phase 2</p>
                  <p className="text-xl font-bold text-white">We tell you exactly what to fix.</p>
                </div>
              </div>
              <div className="w-full border-t border-white/10 pt-6">
                <p className="text-3xl font-black text-white mb-2">Total: $79.99</p>
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 92: The Blindspot Reveal (4:3) */}
        <AdFrame ratio="4:3" id="ad-92-intel-blindspot">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-[#fe3f8c]/10 to-transparent" />
            <div className="relative z-10 space-y-6">
              <div className="text-5xl mb-4">🔦</div>
              <p className="text-3xl font-black text-white leading-tight">
                Find the exact line of code<br />keeping you out of ChatGPT.
              </p>
              <p className="text-lg text-white/60 max-w-sm mx-auto">
                We scan for missing schema, poor entity density, and weak semantic structure.
              </p>
              <p className="text-2xl font-black text-[#fe3f8c] pt-4">The Fix Report: $79.99</p>
              <div className="pt-2"><Logo size="sm" /></div>
            </div>
          </div>
        </AdFrame>

        {/* AD 93: The Roadmap (16:9) */}
        <AdFrame ratio="16:9" id="ad-93-intel-roadmap">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex items-center justify-between px-16">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_right,#00e5ff15,transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-start gap-4 flex-1">
              <p className="text-4xl font-black text-white leading-tight">
                We don&apos;t sell rankings.<br />
                <span className="text-[#00e5ff]">We sell the roadmap to get them.</span>
              </p>
              <p className="text-xl text-white/50 font-medium">A step-by-step diagnostic of your AI Search visibility.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="px-8 py-4 bg-white/5 border border-white/20 rounded-2xl text-center">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Your Blueprint</p>
                <p className="text-4xl font-black text-white">$79.99</p>
              </div>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 94: Value Breakdown (1:1) */}
        <AdFrame ratio="1:1" id="ad-94-intel-value">
          <div className="w-full h-full bg-[#0a0a12] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="relative z-10 space-y-8 w-full">
              <p className="text-3xl font-black text-white">The exact same analysis.</p>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center opacity-50">
                  <span className="text-xl font-bold text-white">Agency Audit</span>
                  <span className="text-2xl font-black text-white line-through">$2,000</span>
                </div>
                <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 p-6 rounded-2xl flex justify-between items-center">
                  <span className="text-xl font-bold text-[#00e5ff]">Duelly AI Audit</span>
                  <span className="text-3xl font-black text-[#00e5ff]">$79.99</span>
                </div>
              </div>
              <p className="text-lg text-white/50">Why pay for the overhead?</p>
              <Logo size="md" />
            </div>
          </div>
        </AdFrame>

        {/* AD 95: Ultimate Transparency (4:3) */}
        <AdFrame ratio="4:3" id="ad-95-intel-transparency">
          <div className="w-full h-full bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute inset-0 border-[10px] border-white/5" />
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <p className="text-sm font-bold text-[#BC13FE] uppercase tracking-[0.3em]">Absolute Transparency</p>
              <p className="text-3xl font-black text-white leading-tight">
                What <span className="text-[#BC13FE]">$79.99</span> actually buys you.
              </p>
              <ul className="text-lg text-white/70 space-y-2 text-left bg-white/5 p-6 rounded-xl border border-white/10 w-full max-w-sm mx-auto">
                <li>• Current AI visibility scores</li>
                <li>• Top 5 competitor gaps</li>
                <li>• Missing schema identifiers</li>
                <li>• Exact steps to fix them</li>
              </ul>
              <div className="pt-4"><Logo size="lg" /></div>
            </div>
          </div>
        </AdFrame>

      </div>
    </main>
  )
}
