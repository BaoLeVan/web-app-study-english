import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center px-4 py-12">
      <Link
        href="/login"
        className="absolute left-8 top-8 flex items-center gap-3"
        aria-label="LinguoFlow home"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary-container text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined is-filled">language</span>
        </div>
        <div>
          <h1 className="font-display text-[20px] leading-tight text-on-surface">LinguoFlow</h1>
          <p className="font-label-sm text-outline">Master English</p>
        </div>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
