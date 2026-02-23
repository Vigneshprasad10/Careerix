import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import {
    FileText, Zap, Target, Mail, MessageSquare, Kanban,
    TrendingUp, ArrowRight, BarChart3, Users
} from 'lucide-react'

async function getStats(userId: string) {
    const [resumesRes, jobsRes] = await Promise.all([
        supabaseAdmin.from('resumes').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('jobs').select('id, status', { count: 'exact' }).eq('user_id', userId),
    ])
    const jobsData = jobsRes.data || []
    return {
        resumes: resumesRes.count || 0,
        jobs: jobsRes.count || 0,
        interviews: jobsData.filter(j => j.status === 'interview').length,
        offers: jobsData.filter(j => j.status === 'offer').length,
    }
}

const features = [
    { href: '/resume', label: 'Resume', desc: 'Upload & manage your PDF resumes', icon: FileText, gradient: 'from-purple-500 to-blue-500' },
    { href: '/analyze', label: 'ATS Analyzer', desc: 'Get an ATS score and improvement tips', icon: Zap, gradient: 'from-violet-500 to-purple-500' },
    { href: '/job-match', label: 'Job Match', desc: 'Compare your resume against any job description', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
    { href: '/cover-letter', label: 'Cover Letter', desc: 'Generate professionally tailored cover letters', icon: Mail, gradient: 'from-cyan-500 to-blue-500' },
    { href: '/interview-prep', label: 'Interview Prep', desc: 'Generate 10 tailored interview questions', icon: MessageSquare, gradient: 'from-purple-500 to-pink-500' },
    { href: '/tracker', label: 'Job Tracker', desc: 'Manage your applications with a Kanban board', icon: Kanban, gradient: 'from-green-500 to-cyan-500' },
]

export default async function DashboardPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
    const stats = await getStats(userId)

    const statCards = [
        { label: 'Resumes', value: stats.resumes, icon: FileText, bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
        { label: 'Total Jobs', value: stats.jobs, icon: BarChart3, bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
        { label: 'Interviews', value: stats.interviews, icon: Users, bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
        { label: 'Offers', value: stats.offers, icon: TrendingUp, bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
    ]

    return (
        <div className="relative min-h-screen p-6 lg:p-12 anim-up">
            {/* Hero Section */}
            <div className="mb-12 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                    Your AI-Powered <span className="grad-text">Career Intelligence</span> Platform
                </h1>
                <p className="text-white/40 text-lg max-w-2xl mx-auto lg:mx-0 font-medium">
                    Analyze, track, and optimize your career journey with precision AI tools.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {statCards.map((s, i) => (
                    <div key={s.label} className={`card-static p-6 flex flex-col justify-center items-center lg:items-start anim-up stagger-${i + 1}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
                            <s.icon className="w-5 h-5" style={{ color: s.color }} />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{s.value}</div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* AI Tools Grid */}
            <div className="space-y-6">
                <div className="section-label px-2">AI Command Suite</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <Link key={f.href} href={f.href} className={`card p-6 group cursor-pointer anim-up stagger-${(i % 3) + 1}`}>
                            <div className="flex flex-col h-full">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-indigo-500/20`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                                    {f.label}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6 flex-1">
                                    {f.desc}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-white/20 group-hover:text-purple-400 transition-colors uppercase tracking-widest">
                                    Open Tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
