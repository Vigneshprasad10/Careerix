'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Zap, ChevronDown, Sparkles, CheckCircle, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react'

interface Resume { id: string; file_name: string; parsed_text: string }
interface AnalysisResult {
    ats_score: number; summary: string;
    strengths: string[]; weaknesses: string[]; tips: string[]
}

function ScoreRing({ score }: { score: number }) {
    const r = 52, c = 2 * Math.PI * r
    const offset = c - (score / 100) * c
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 -rotate-90" width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 10px ${color}80)` }}
                />
            </svg>
            <div className="text-center relative z-10">
                <div className="text-5xl font-black text-white leading-none">{score}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">ATS Score</div>
            </div>
        </div>
    )
}

export default function AnalyzePage() {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/resume/upload').then(r => r.json()).then(d => {
            setResumes(d.resumes || [])
            if (d.resumes?.length) setSelectedId(d.resumes[0].id)
        })
    }, [])

    const analyze = async () => {
        const resume = resumes.find(r => r.id === selectedId)
        if (!resume?.parsed_text) { toast.error('Select a parsed resume first'); return }
        setLoading(true); setResult(null)
        try {
            const res = await fetch('/api/ai/analyze-resume', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: resume.parsed_text })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setResult(data.result)
        } catch (e) { toast.error((e as Error).message) }
        finally { setLoading(false) }
    }

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto anim-up">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">ATS Resume <span className="grad-text">Analyzer</span></h1>
                <p className="text-white/40 text-lg">Compare your resume against industry standards and high-performing benchmarks</p>
            </div>

            {/* Controls */}
            <div className="card-static p-6 mb-10 flex flex-col sm:flex-row gap-5 items-stretch">
                <div className="relative flex-1">
                    <div className="section-label !mb-2 opacity-100">Selected Resume</div>
                    <select
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        className="inp px-4 py-3.5 pr-10 text-sm"
                    >
                        {resumes.length === 0
                            ? <option>No resumes — upload one first</option>
                            : resumes.map(r => <option key={r.id} value={r.id}>{r.file_name}</option>)
                        }
                    </select>
                    <ChevronDown className="absolute right-3 bottom-3.5 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
                <div className="flex flex-col justify-end pt-5 sm:pt-0">
                    <button
                        onClick={analyze}
                        disabled={loading || !selectedId}
                        className="btn-primary flex-1 px-8 py-3.5 text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'Analyzing Profile...' : 'Analyze Resume'}
                    </button>
                </div>
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="space-y-6 anim-in">
                    <div className="card-static p-8 flex flex-col md:flex-row items-center gap-10">
                        <div className="shimmer w-40 h-40 rounded-full shrink-0" />
                        <div className="flex-1 space-y-4 w-full">
                            <div className="shimmer h-6 rounded-lg w-1/2" />
                            <div className="shimmer h-4 rounded-lg w-full" />
                            <div className="shimmer h-4 rounded-lg w-5/6" />
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && !loading && (
                <div className="space-y-8 anim-up-1">
                    {/* Score + Summary Card */}
                    <div className="card-static p-8 md:p-10 flex flex-col md:flex-row items-center gap-24 relative overflow-hidden group">
                        {/* Background glow decoration */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                        <ScoreRing score={result.ats_score} />

                        <div className="relative z-10 flex-1 text-center md:text-left">
                            <div className="section-label text-purple-400 opacity-100">Assessment Summary</div>
                            <p className="text-white/90 text-lg leading-relaxed font-medium mb-2">
                                {result.summary}
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                Validated by Careerix
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <div className="space-y-4">
                            <div className="section-label !mb-1 px-2">Key Strengths</div>
                            <div className="space-y-3">
                                {result.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/10 hover:border-green-500/30 transition-colors group">
                                        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed font-medium">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-4">
                            <div className="section-label !mb-1 px-2">Improvement Areas</div>
                            <div className="space-y-3">
                                {result.weaknesses.map((w, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-colors group">
                                        <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed font-medium">{w}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="space-y-4 pt-4">
                        <div className="section-label !mb-1 px-2">Strategic Improvement Tips</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.tips.map((t, i) => (
                                <div key={i} className="card-static p-5 flex items-start gap-5 glass-hover">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Lightbulb className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-black text-blue-400/50 tracking-tighter mb-1">Tip #{i + 1}</p>
                                        <p className="text-sm text-white/80 leading-relaxed font-medium">{t}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center pt-10 pb-20">
                        <p className="text-white/20 text-xs">Run another analysis by selecting a different resume above.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
