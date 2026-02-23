'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Brain, ChevronDown, Sparkles, MessageCircle, ArrowRight, Loader2, ChevronRight } from 'lucide-react'

interface Resume { id: string; file_name: string; parsed_text: string }
interface Question {
    question: string; answer: string;
    type: 'Behavioral' | 'Technical' | 'Situational' | 'Culture Fit'
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
    const [open, setOpen] = useState(false)
    const typeColors = {
        'Behavioral': '#8b5cf6',
        'Technical': '#3b82f6',
        'Situational': '#f59e0b',
        'Culture Fit': '#10b981'
    }

    return (
        <div className="card group overflow-hidden anim-up" style={{ animationDelay: `${index * 50}ms` }}>
            <button onClick={() => setOpen(!open)}
                className="w-full text-left p-6 flex items-start gap-5 transition-all duration-300 hover:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 text-white/40 font-black text-sm group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{ background: `${typeColors[q.type]}15`, color: typeColors[q.type], border: `1px solid ${typeColors[q.type]}30` }}>
                            {q.type}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic group-hover:text-white/40 transition-colors">Career Prep</span>
                    </div>
                    <h3 className="text-base font-semibold text-white/90 leading-relaxed group-hover:text-white transition-colors">{q.question}</h3>
                </div>
                <div className={`mt-2 shrink-0 transition-transform duration-300 ${open ? 'rotate-90 text-purple-400' : 'text-white/20'}`}>
                    <ChevronRight className="w-5 h-5" />
                </div>
            </button>

            {open && (
                <div className="px-6 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="ml-15 p-6 rounded-2xl bg-white/[0.03] border-l-2 border-purple-500/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><MessageCircle className="w-12 h-12 text-white" /></div>
                        <div className="section-label !mb-3 text-[10px] text-purple-400/50">Suggested Answer Strategy</div>
                        <p className="text-sm text-white/70 leading-relaxed font-medium whitespace-pre-wrap">{q.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function InterviewPrepPage() {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [jd, setJd] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/resume/upload').then(r => r.json()).then(d => {
            setResumes(d.resumes || [])
            if (d.resumes?.length) setSelectedId(d.resumes[0].id)
        })
    }, [])

    const generate = async () => {
        const resume = resumes.find(r => r.id === selectedId)
        if (!jd.trim()) { toast.error('Paste a job description first'); return }
        setLoading(true); setQuestions([])
        try {
            const res = await fetch('/api/ai/interview-prep', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: resume?.parsed_text || '', jobDescription: jd })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setQuestions(data.questions)
            toast.success('Interview questions generated!')
        } catch (e) { toast.error((e as Error).message) }
        finally { setLoading(false) }
    }

    return (
        <div className="p-6 lg:p-12 max-w-5xl mx-auto anim-up">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">Interview <span className="grad-text">Mastery</span></h1>
                <p className="text-white/40 text-sm font-medium">Generate targeted interview questions based on the role and your background.</p>
            </div>

            <div className="space-y-12">
                {/* Fixed Inputs Section */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="section-label px-1">Tailor with Resume <span className="text-white/20 lowercase font-normal">(optional)</span></div>
                        <div className="card-static p-1 relative">
                            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                                className="inp px-5 py-4 appearance-none pr-10 text-sm border-0 bg-transparent">
                                <option value="">No Resume (General Questions)</option>
                                {resumes.map(r => <option key={r.id} value={r.id}>{r.file_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="section-label px-1">Target Job Description</div>
                        <div className="card-static p-1">
                            <textarea
                                value={jd} onChange={e => setJd(e.target.value)}
                                placeholder="Paste the job requirements to generate targeted questions..."
                                className="inp w-full px-5 py-5 text-sm min-h-[140px] border-0 bg-transparent resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button onClick={generate} disabled={loading || !jd.trim()}
                        className="btn-primary px-10 py-4 text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-50 min-w-[280px]">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                        {loading ? 'Analyzing Role...' : 'Generate 10 Questions'}
                    </button>
                </div>

                {/* Questions Grid */}
                <div className="space-y-6">
                    {loading && (
                        <div className="space-y-4 anim-in">
                            <div className="shimmer h-24 rounded-2xl" />
                            <div className="shimmer h-24 rounded-2xl" />
                            <div className="shimmer h-24 rounded-2xl" />
                        </div>
                    )}

                    {!questions.length && !loading && (
                        <div className="card-static rounded-3xl p-16 text-center border-dashed border-2 border-white/5 bg-transparent mt-8">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <MessageCircle className="w-10 h-10 text-white/10" />
                            </div>
                            <p className="text-white/20 text-base font-medium max-w-xs mx-auto">Generate AI questions to start your interview preparation.</p>
                        </div>
                    )}

                    {questions.length > 0 && !loading && (
                        <div className="space-y-6 pt-4">
                            <div className="section-label px-2 text-purple-400/80">Tailored Q&A List</div>
                            <div className="grid gap-6">
                                {questions.map((q, i) => (
                                    <QuestionCard key={i} q={q} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-20" />
            </div>
        </div>
    )
}
