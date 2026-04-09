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

      </div>
    </main>
  )
}
