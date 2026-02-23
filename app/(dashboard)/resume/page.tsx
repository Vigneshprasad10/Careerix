'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, CloudUpload, Loader2 } from 'lucide-react'

interface Resume {
    id: string
    file_name: string
    parsed_text: string
    created_at: string
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSize(text: string) {
    const words = text.split(' ').length
    return `~${words} words`
}

export default function ResumePage() {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchResumes = useCallback(async () => {
        if (fetched) return
        setLoading(true)
        try {
            const res = await fetch('/api/resume/upload')
            const data = await res.json()
            setResumes(data.resumes || [])
            setFetched(true)
        } catch { toast.error('Failed to load resumes') }
        finally { setLoading(false) }
    }, [fetched])

    useState(() => { fetchResumes() })

    const uploadFile = async (file: File) => {
        if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
        if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return }
        setUploading(true)

        // Add a timeout for mobile connections (60 seconds)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
            // CRITICAL FOR MOBILE: Pre-read the file as an ArrayBuffer.
            // On mobile, the browser may lose access to the file handle if the app goes to background
            // or if the upload is slow. Converting to a Blob/Buffer in memory fixes this.
            const arrayBuffer = await file.arrayBuffer()
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' })

            const fd = new FormData()
            fd.append('file', blob, file.name)

            const res = await fetch('/api/resume/upload', {
                method: 'POST',
                body: fd,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            const data = await res.json()
            if (!res.ok) {
                console.error('Upload failure details:', data)
                throw new Error(data.error || data.details || 'Upload failed')
            }
            setResumes(prev => [data.resume, ...prev])
            toast.success('Resume uploaded & parsed!')
        } catch (e) {
            const error = e as Error
            console.error('Upload catch:', error)
            if (error.name === 'AbortError') {
                toast.error('Upload timed out. Please check your internet connection.')
            } else {
                toast.error(error.message || 'Upload failed. Try a smaller file or different browser.')
            }
        }
        finally { setUploading(false); clearTimeout(timeoutId) }
    }

    const deleteResume = async (id: string) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/resume/delete?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            setResumes(prev => prev.filter(r => r.id !== id))
            toast.success('Resume deleted')
        } catch { toast.error('Failed to delete resume') }
        finally { setDeleting(null) }
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) uploadFile(file)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
        // Reset the input so the same file can be uploaded again if needed
        e.target.value = ''
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-up">
            {/* Hidden Input for Mobile Compatibility */}
            <input
                id="resume-upload-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Resume Manager</h1>
                <p className="text-white/40 text-sm">Upload your PDF resume — we extract the text for all AI tools</p>
            </div>

            {/* Upload Zone */}
            <div
                className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 mb-8 group
                    ${dragOver
                        ? 'border-purple-400 bg-purple-500/10 shadow-[0_0_40px_rgba(139,92,246,0.3)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('resume-upload-input')?.click()}
            >
                {/* Animated ring */}
                {dragOver && (
                    <div className="absolute inset-4 rounded-xl border border-purple-400/30 animate-ping" />
                )}

                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-purple-500/30 scale-110' : 'bg-white/5 group-hover:bg-purple-500/10 group-hover:scale-105'}`}>
                    {uploading
                        ? <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        : <CloudUpload className={`w-8 h-8 transition-colors ${dragOver ? 'text-purple-400' : 'text-white/30 group-hover:text-purple-400'}`} />
                    }
                </div>

                <p className="text-white font-semibold mb-1">
                    {uploading ? 'Parsing PDF...' : dragOver ? 'Drop it!' : 'Drop your PDF resume here'}
                </p>
                <p className="text-white/30 text-sm">
                    {uploading ? 'Extracting text with PDF.js' : 'or click to browse — PDF only, max 10MB'}
                </p>

                {!uploading && (
                    <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-sm">
                        <Upload className="w-4 h-4" />
                        Choose File
                    </div>
                )}
            </div>

            {/* Resume List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
                </div>
            ) : resumes.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/50 font-medium mb-1">No resumes uploaded yet</p>
                    <p className="text-white/25 text-sm">Upload your first PDF above to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Uploaded Resumes</h2>
                    {resumes.map((r) => {
                        const hasParsed = r.parsed_text && !r.parsed_text.startsWith('[Could not')
                        const isExpanded = expanded === r.id
                        return (
                            <div key={r.id} className="glass glass-hover rounded-2xl overflow-hidden animate-fade-up">
                                <div className="flex items-center gap-4 p-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-purple-400" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{r.file_name}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[11px] text-white/30">{formatDate(r.created_at)}</span>
                                            {hasParsed && (
                                                <>
                                                    <span className="text-white/10">·</span>
                                                    <span className="text-[11px] text-white/30">{formatSize(r.parsed_text)}</span>
                                                    <span className="text-white/10">·</span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                                        Parsed
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {hasParsed && (
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : r.id)}
                                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all duration-200"
                                                title="Preview text"
                                            >
                                                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteResume(r.id)}
                                            disabled={deleting === r.id}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                            title="Delete"
                                        >
                                            {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expandable text preview */}
                                {isExpanded && hasParsed && (
                                    <div className="border-t border-white/5 p-4 animate-fade-in">
                                        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Parsed Text Preview</p>
                                        <div className="bg-white/[0.02] rounded-xl p-4 max-h-48 overflow-y-auto">
                                            <p className="text-xs text-white/50 whitespace-pre-wrap leading-relaxed font-mono">
                                                {r.parsed_text.slice(0, 1000)}{r.parsed_text.length > 1000 ? '...' : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
