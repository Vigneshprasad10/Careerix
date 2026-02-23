'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, ChevronDown, Sparkles, Copy, Check, Loader2 } from 'lucide-react'

interface Resume { id: string; file_name: string; parsed_text: string }

export default function CoverLetterPage() {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [jd, setJd] = useState('')
    const [company, setCompany] = useState('')
    const [letter, setLetter] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetch('/api/resume/upload').then(r => r.json()).then(d => {
            setResumes(d.resumes || [])
            if (d.resumes?.length) setSelectedId(d.resumes[0].id)
        })
    }, [])

    const generate = async () => {
        const resume = resumes.find(r => r.id === selectedId)
        if (!resume?.parsed_text || !jd.trim()) { toast.error('Select a resume and paste a job description'); return }
        setLoading(true); setLetter('')
        try {
            const res = await fetch('/api/ai/cover-letter', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: resume.parsed_text, jobDescription: jd, companyName: company })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setLetter(data.coverLetter)
            toast.success('Cover letter generated!')
        } catch (e) { toast.error((e as Error).message) }
        finally { setLoading(false) }
    }

    const copy = () => {
        navigator.clipboard.writeText(letter)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="p-6 lg:p-12 max-w-6xl mx-auto anim-up">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Cover Letter <span className="grad-text">Generator</span></h1>
                <p className="text-white/40 text-sm font-medium">Generate a professionally tailored, AI-optimized cover letter instantly.</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12">
                {/* Left — Inputs */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="section-label px-1">Source Resume</div>
                        <div className="card-static p-1 relative">
                            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                                className="inp px-4 py-4 appearance-none pr-10 text-sm border-0 bg-transparent">
                                {resumes.length === 0
                                    ? <option>No resumes uploaded</option>
                                    : resumes.map(r => <option key={r.id} value={r.id}>{r.file_name}</option>)
                                }
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="section-label px-1">Company Name <span className="text-white/20 normal-case lowercase font-normal">(optional)</span></div>
                        <div className="card-static p-1">
                            <input
                                type="text" value={company} onChange={e => setCompany(e.target.value)}
                                placeholder="e.g. Google, Vercel, Linear..."
                                className="inp w-full px-5 py-4 text-sm border-0 bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="section-label px-1">Job Description</div>
                        <div className="card-static p-1">
                            <textarea
                                value={jd} onChange={e => setJd(e.target.value)}
                                placeholder="Paste the job requirements to tailor your letter..."
                                className="inp w-full px-5 py-5 text-sm min-h-[250px] border-0 bg-transparent resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    <button onClick={generate} disabled={loading || !selectedId || !jd.trim()}
                        className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'Crafting Letter...' : 'Generate Cover Letter'}
                    </button>
                </div>

                {/* Right — Output */}
                <div className="lg:col-span-3">
                    {loading && (
                        <div className="card-static p-8 h-full space-y-4 anim-in">
                            <div className="shimmer h-6 rounded-lg w-40 mb-6" />
                            <div className="shimmer h-4 rounded-lg w-full" />
                            <div className="shimmer h-4 rounded-lg w-11/12" />
                            <div className="shimmer h-4 rounded-lg w-5/6" />
                            <div className="shimmer h-4 rounded-lg w-full mt-6" />
                            <div className="shimmer h-4 rounded-lg w-3/4" />
                            <div className="shimmer h-4 rounded-lg w-11/12" />
                            <div className="shimmer h-4 rounded-lg w-full" />
                            <div className="shimmer h-4 rounded-lg w-4/5" />
                        </div>
                    )}

                    {!letter && !loading && (
                        <div className="card-static rounded-2xl p-12 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-white/5 bg-transparent">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-white/10" />
                            </div>
                            <p className="text-white/20 text-base font-medium max-w-xs mx-auto">Configure the inputs to generate your personalized cover letter.</p>
                        </div>
                    )}

                    {letter && !loading && (
                        <div className="animate-up h-full flex flex-col">
                            {/* Paper card header */}
                            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-white/[0.03] border border-white/10 border-b-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/30" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400/30" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/30" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest ml-2">Tailored Document</span>
                                </div>
                                <button onClick={copy}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-white/50 hover:text-purple-300 transition-all duration-300 text-xs font-bold">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'COPIED' : 'COPY'}
                                </button>
                            </div>

                            {/* Paper body */}
                            <div className="flex-1 rounded-b-2xl p-8 overflow-y-auto bg-white/[0.015] border border-white/10 leading-relaxed text-sm text-white/80 shadow-2xl">
                                <p className="whitespace-pre-wrap font-medium">{letter}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
