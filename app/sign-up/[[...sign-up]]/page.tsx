import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold grad-text">Careerix</h1>
                    <p className="text-white/40 text-sm mt-2">Create your free account</p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-2xl',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-[var(--text-secondary)]',
                            socialButtonsBlockButton: 'bg-[var(--surface-2)] border-[var(--border)] text-white hover:bg-[var(--border)]',
                            dividerLine: 'bg-[var(--border)]',
                            dividerText: 'text-[var(--text-muted)]',
                            formFieldLabel: 'text-[var(--text-secondary)]',
                            formFieldInput: 'bg-[var(--surface-2)] border-[var(--border)] text-white focus:border-indigo-500',
                            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500',
                            footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                        },
                    }}
                />
            </div>
        </div>
    )
}
