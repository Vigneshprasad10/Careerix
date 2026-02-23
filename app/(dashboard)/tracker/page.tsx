'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import { Plus, X, Trash2, Loader2, Briefcase, Link as LinkIcon, MapPin, DollarSign, StickyNote, ChevronDown, ChevronUp } from 'lucide-react'

interface Job {
    id: string; company: string; title: string; status: string;
    location?: string; salary?: string; url?: string; notes?: string; created_at: string
}

const COLUMNS = [
    { id: 'saved', label: 'Saved', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
    { id: 'applied', label: 'Applied', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
    { id: 'interview', label: 'Interview', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    { id: 'offer', label: 'Offer', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    { id: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
]

function AddJobModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (job: Partial<Job>) => void }) {
    const [form, setForm] = useState({ company: '', title: '', status: 'saved', location: '', salary: '', url: '', notes: '' })
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        if (!form.company.trim() || !form.title.trim()) { toast.error('Company and title are required'); return }
        setSaving(true)
        try {
            const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            onAdd(data.job)
            setForm({ company: '', title: '', status: 'saved', location: '', salary: '', url: '', notes: '' })
            onClose()
            toast.success('Job added!')
        } catch (e) { toast.error((e as Error).message) }
        finally { setSaving(false) }
    }

    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md animate-scale-in rounded-2xl overflow-hidden"
                style={{ background: 'rgba(15,15,26,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)' }}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                    <h3 className="font-semibold text-white">Add New Job</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Fields */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Company *</label>
                            <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                                placeholder="e.g. Google" className="input-glow w-full px-3 py-2.5 text-sm" />
                        </div>
                        <div>
                            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                className="input-glow w-full px-3 py-2.5 text-sm appearance-none">
                                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Job Title *</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Senior Frontend Engineer" className="input-glow w-full px-3 py-2.5 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Location</label>
                            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                placeholder="Remote / City" className="input-glow w-full px-3 py-2.5 text-sm" />
                        </div>
                        <div>
                            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Salary</label>
                            <input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                                placeholder="$120k–$150k" className="input-glow w-full px-3 py-2.5 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Job URL</label>
                        <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                            placeholder="https://..." className="input-glow w-full px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Any notes about this role..." rows={2}
                            className="input-glow w-full px-3 py-2.5 text-sm resize-none" />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all duration-200">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={saving}
                        className="flex-1 btn-grad py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {saving ? 'Adding...' : 'Add Job'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function JobCard({ job, onDelete }: { job: Job; onDelete: (id: string) => void }) {
    const [expanded, setExpanded] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const col = COLUMNS.find(c => c.id === job.status)

    const del = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleting(true)
        try {
            await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
            onDelete(job.id)
            toast.success('Job removed')
        } catch { toast.error('Failed to delete') }
        finally { setDeleting(false) }
    }

    return (
        <div className="rounded-xl overflow-hidden cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = col?.border || 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
        >
            <div className="p-3" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col?.color, boxShadow: `0 0 6px ${col?.color}` }} />
                        <p className="text-xs font-semibold text-white truncate">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/30 transition-colors">
                            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button onClick={del} disabled={deleting}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
                <p className="text-[11px] text-white/50 truncate pl-4">{job.title}</p>
                <p className="text-[10px] text-white/25 pl-4 mt-0.5">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>

            {expanded && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-white/5 pt-2 animate-fade-in">
                    {job.location && <div className="flex items-center gap-2 text-[11px] text-white/40"><MapPin className="w-3 h-3 shrink-0" />{job.location}</div>}
                    {job.salary && <div className="flex items-center gap-2 text-[11px] text-white/40"><DollarSign className="w-3 h-3 shrink-0" />{job.salary}</div>}
                    {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        className="flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 truncate">
                        <LinkIcon className="w-3 h-3 shrink-0" />View Job</a>}
                    {job.notes && <div className="flex items-start gap-2 text-[11px] text-white/40"><StickyNote className="w-3 h-3 shrink-0 mt-0.5" /><span>{job.notes}</span></div>}
                </div>
            )}
        </div>
    )
}

export default function TrackerPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetch('/api/jobs').then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false) })
    }, [])

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return
        const { draggableId, destination } = result
        const newStatus = destination.droppableId
        setJobs(prev => prev.map(j => j.id === draggableId ? { ...j, status: newStatus } : j))
        try {
            await fetch(`/api/jobs/${draggableId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
        } catch { toast.error('Failed to update status') }
    }

    const addJob = (job: Partial<Job>) => setJobs(prev => [job as Job, ...prev])
    const deleteJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id))

    return (
        <div className="p-6 lg:p-8 animate-fade-up h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Job Tracker</h1>
                    <p className="text-white/40 text-sm">Drag cards between columns to update status</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="btn-grad px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Job
                </button>
            </div>

            {loading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map(c => (
                        <div key={c.id} className="w-64 shrink-0">
                            <div className="shimmer h-8 rounded-xl mb-3" />
                            <div className="space-y-2">
                                {[1, 2].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-6">
                        {COLUMNS.map(col => {
                            const colJobs = jobs.filter(j => j.status === col.id)
                            return (
                                <div key={col.id} className="w-64 shrink-0 flex flex-col">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
                                        style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                                            <span className="text-sm font-semibold text-white">{col.label}</span>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white/70"
                                            style={{ background: `${col.color}25` }}>{colJobs.length}</span>
                                    </div>

                                    {/* Droppable */}
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 space-y-2 min-h-[200px] rounded-xl p-2 transition-all duration-200"
                                                style={{
                                                    background: snapshot.isDraggingOver ? col.bg : 'transparent',
                                                    border: snapshot.isDraggingOver ? `1px dashed ${col.border}` : '1px dashed rgba(255,255,255,0.05)',
                                                }}
                                            >
                                                {colJobs.length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="flex flex-col items-center justify-center h-24 gap-2">
                                                        <Briefcase className="w-5 h-5 text-white/10" />
                                                        <p className="text-[11px] text-white/20">Drop jobs here</p>
                                                    </div>
                                                )}
                                                {colJobs.map((job, index) => (
                                                    <Draggable key={job.id} draggableId={job.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.85 : 1,
                                                                    transform: snapshot.isDragging
                                                                        ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                                                        : provided.draggableProps.style?.transform,
                                                                }}
                                                            >
                                                                <JobCard job={job} onDelete={deleteJob} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )
                        })}
                    </div>
                </DragDropContext>
            )}

            <AddJobModal open={showModal} onClose={() => setShowModal(false)} onAdd={addJob} />
        </div>
    )
}
