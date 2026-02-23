'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Target, ChevronDown, Sparkles, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Resume { id: string; file_name: string; parsed_text: string }
interface MatchResult {
    match_percent: number; verdict: string;
    matched_skills: string[]; gaps: string[]; recommendations: string[]
}

function DonutChart({ percent }: { percent: number }) {
    const r = 52, c = 2 * Math.PI * r
    const offset = c - (percent / 100) * c
    const color = percent >= 75 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444'
    const label = percent >= 75 ? 'Strong Match' : percent >= 50 ? 'Fair Match' : 'Weak Match'
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                    <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="16"
                        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 12px ${color}60)` }}
                    />
                </svg>
                <div className="text-center z-10">
                    <div className="text-5xl font-black text-white">{percent}<span className="text-xl text-white/40">%</span></div>
                </div>
            </div>
            <span className="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
            >{label}</span>
        </div>
    )
}

export default function JobMatchPage() {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [jd, setJd] = useState('')
    const [result, setResult] = useState<MatchResult | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/resume/upload').then(r => r.json()).then(d => {
            setResumes(d.resumes || [])
            if (d.resumes?.length) setSelectedId(d.resumes[0].id)
        })
    }, [])

    const analyze = async () => {
        const resume = resumes.find(r => r.id === selectedId)
        if (!resume?.parsed_text || !jd.trim()) { toast.error('Select a resume and paste a job description'); return }
        setLoading(true); setResult(null)
        try {
            const res = await fetch('/api/ai/job-match', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: resume.parsed_text, jobDescription: jd })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setResult(data.result)
        } catch (e) { toast.error((e as Error).message) }
        finally { setLoading(false) }
    }

    return (
        <div className="p-6 lg:p-12 max-w-6xl mx-auto anim-up">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Job Match <span className="grad-text">Analyzer</span></h1>
                <p className="text-white/40 text-sm font-medium">Instantly discover how well your profile matches any job description.</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12">
                {/* Input Panel */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-4">
                        <div className="section-label px-1">Select Resume</div>
                        <div className="card-static p-1 relative">
                            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                                className="inp px-4 py-4 appearance-none pr-10 text-sm border-0 bg-transparent">
                                {resumes.length === 0
                                    ? <option>No resumes found</option>
                                    : resumes.map(r => <option key={r.id} value={r.id}>{r.file_name}</option>)
                                }
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="section-label px-1">Job Description</div>
                        <div className="card-static p-1">
                            <textarea
                                value={jd} onChange={e => setJd(e.target.value)}
                                placeholder="Paste the job description here to analyze gaps and matching skills..."
                                className="inp w-full px-5 py-5 text-sm min-h-[350px] border-0 bg-transparent resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    <button onClick={analyze} disabled={loading || !selectedId || !jd.trim()}
                        className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                        {loading ? 'Analyzing Alignment...' : 'Analyze Match'}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-3">
                    {loading && (
                        <div className="space-y-6 anim-in">
                            <div className="card-static p-12 flex justify-center"><div className="shimmer w-40 h-40 rounded-full" /></div>
                            <div className="shimmer h-40 rounded-2xl" />
                            <div className="shimmer h-40 rounded-2xl" />
                        </div>
                    )}

                    {!result && !loading && (
                        <div className="card-static p-12 text-center h-full flex flex-col items-center justify-center border-dashed border-2 border-white/5 bg-transparent">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Target className="w-10 h-10 text-white/10" />
                            </div>
                            <p className="text-white/20 text-base font-medium max-w-xs mx-auto">Upload a resume and paste a job description to see your match alignment.</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-8 anim-up">
                            {/* Score Card */}
                            <div className="card-static p-8 flex flex-col items-center gap-6 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                                <DonutChart percent={result.match_percent} />
                                <p className="text-white/80 text-center max-w-md font-medium px-4">{result.verdict}</p>
                            </div>

                            {/* Skills Analysis */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="card-static p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <div className="section-label !mb-0 text-green-400/80">Matched Skills</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.matched_skills.map((s, i) => (
                                            <span key={i} className="badge-green">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-static p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                        <div className="section-label !mb-0 text-red-400/80">Skill Gaps</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.gaps.map((g, i) => (
                                            <span key={i} className="badge-red">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="space-y-4">
                                <div className="section-label px-1 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                    Strategic Action Items
                                </div>
                                <div className="grid gap-3">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-amber-400/50 uppercase tracking-tighter mb-1">Recommendation {i + 1}</p>
                                                <p className="text-sm text-white/70 leading-relaxed font-medium">{rec}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
