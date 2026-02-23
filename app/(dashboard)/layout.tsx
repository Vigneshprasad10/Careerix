import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen" style={{ background: '#0a0a0f' }}>
            {/* Animated background blobs */}
            <div className="bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <Sidebar />

            <main className="relative flex-1 overflow-y-auto z-10">
                {/* Mobile spacer for fixed header */}
                <div className="lg:hidden h-14" />
                {children}
            </main>
        </div>
    )
}
