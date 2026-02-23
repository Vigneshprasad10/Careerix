'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
    LayoutDashboard, FileText, Zap, Target,
    Mail, MessageSquare, Kanban, Menu, X, Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-blue-500' },
    { href: '/resume', label: 'Resume', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { href: '/analyze', label: 'Analyzer', icon: Zap, color: 'from-violet-500 to-purple-500' },
    { href: '/job-match', label: 'Job Match', icon: Target, color: 'from-blue-500 to-indigo-500' },
    { href: '/cover-letter', label: 'Cover Letter', icon: Mail, color: 'from-cyan-500 to-blue-500' },
    { href: '/interview-prep', label: 'Interview Prep', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { href: '/tracker', label: 'Job Tracker', icon: Kanban, color: 'from-green-500 to-cyan-500' },
]

function NavContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname()
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <Link href="/" onClick={onClose} className="flex items-center gap-3">
                <img src="/careerix-logo.svg" alt="Careerix" className="h-8" />
            </Link>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navLinks.map(({ href, label, icon: Icon, color }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                isActive
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                            )}
                        >
                            {isActive && (
                                <div className={cn('absolute inset-0 rounded-xl bg-gradient-to-r opacity-20', color)} />
                            )}
                            {isActive && (
                                <div className={cn('absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10')} />
                            )}
                            <div className={cn(
                                'relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                                isActive
                                    ? `bg-gradient-to-br ${color}`
                                    : 'bg-white/5 group-hover:bg-white/10'
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="relative">{label}</span>
                            {isActive && (
                                <div className={cn('ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br', color)} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-3" />

            {/* User Section */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/8 transition-all duration-200">
                    <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-white/60">My Account</p>
                        <p className="text-[10px] text-white/30">Manage profile</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-[260px] shrink-0 h-screen sticky top-0"
                style={{
                    background: 'rgba(10,10,15,0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: 'inset -1px 0 0 rgba(139,92,246,0.1)',
                }}
            >
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
                style={{
                    background: 'rgba(10,10,15,0.9)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Link href="/" className="flex items-center gap-2">
                    <img src="/careerix-logo.svg" alt="Careerix" className="h-7" />
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[260px] transition-transform duration-300 ease-in-out',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                style={{
                    background: 'rgba(10,10,20,0.97)',
                    backdropFilter: 'blur(30px)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <NavContent onClose={() => setMobileOpen(false)} />
            </aside>
        </>
    )
}
