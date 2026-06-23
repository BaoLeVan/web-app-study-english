import { GlassCard, Button } from '@/components/ui';

const QUICK_START = [
  { title: 'Exam', minutes: 20, gradient: 'from-primary-fixed to-secondary-fixed', icon: 'school' },
  { title: 'Writing', minutes: 15, gradient: 'from-primary-fixed to-tertiary-fixed', icon: 'draw' },
  { title: 'Grammar', minutes: 17, gradient: 'from-tertiary-fixed to-secondary-fixed', icon: 'folder' },
];

const WORD_SETS = [
  { title: 'Books and Library', gradient: 'mesh-card-1', icon: 'menu_book' },
  { title: 'Countries and cities', gradient: 'mesh-card-2', icon: 'public' },
  { title: "What is o'clock now?", gradient: 'mesh-card-3', icon: 'schedule' },
];

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-gutter">
      {/* Left column */}
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-8">
        {/* Word Sets */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline-lg text-on-surface">Word Sets</h2>
            <div className="flex gap-2">
              <CarouselBtn direction="left" />
              <CarouselBtn direction="right" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-card-gap">
            {WORD_SETS.map((ws) => (
              <div
                key={ws.title}
                className={`group relative h-[180px] cursor-pointer overflow-hidden rounded-[24px] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${ws.gradient}`}
              >
                <button className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm transition-colors hover:bg-white/50">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
                <div className="absolute inset-0 flex items-center justify-center opacity-80 transition-transform duration-500 group-hover:scale-110">
                  <span className="material-symbols-outlined text-[64px] text-white/60 drop-shadow-xl">
                    {ws.icon}
                  </span>
                </div>
                <h3 className="absolute bottom-4 left-4 right-4 font-label-bold text-[14px] text-white">
                  {ws.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline-lg text-on-surface">Statistics</h2>
            <YearSelector />
          </div>
          <GlassCard className="relative flex h-[300px] flex-col rounded-lg p-6">
            <div className="relative flex-1 w-full">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                <line stroke="#f2efff" x1="0" x2="800" y1="50" y2="50" />
                <line stroke="#f2efff" x1="0" x2="800" y1="100" y2="100" />
                <line stroke="#f2efff" x1="0" x2="800" y1="150" y2="150" />
                <path
                  d="M 0 150 C 100 120, 150 180, 250 150 C 350 120, 400 180, 500 100 C 600 20, 650 120, 800 50"
                  fill="none"
                  stroke="#5e41d0"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 100 C 100 80, 200 120, 300 80 C 400 40, 500 140, 600 80 C 700 20, 750 100, 800 120"
                  fill="none"
                  stroke="#5bd5fc"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="500" cy="100" r="6" fill="#1a1a27" stroke="#ffffff" strokeWidth="3" />
              </svg>
              {/* Tooltip */}
              <div className="absolute left-[62.5%] top-[20%] z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-inverse-surface px-3 py-1.5 text-center text-white shadow-xl">
                <p className="font-label-bold text-[14px]">4.5</p>
                <p className="font-label-sm text-[10px] text-outline-variant">Points</p>
                <div className="absolute bottom-[-4px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-inverse-surface" />
              </div>
            </div>
            <div className="mt-4 flex justify-between px-2 font-label-bold text-[11px] uppercase tracking-wider text-outline">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Right column */}
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-4">
        {/* Profile card */}
        <GlassCard className="relative mt-12 px-8 pb-6 pt-16 text-center rounded-lg">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-fixed to-secondary-container p-1 shadow-xl">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-fixed to-secondary-container text-3xl font-display text-on-surface">
                A
              </div>
            </div>
          </div>
          <h2 className="mb-1 font-headline-md text-on-surface">Annie Leonchart</h2>
          <p className="mb-6 font-body-md text-outline">annie_leonchart@mail.com</p>
          <div className="flex justify-center gap-8 border-t border-surface-dim pt-6">
            <div>
              <p className="mb-1 font-label-sm uppercase tracking-wider text-outline">Lessons</p>
              <p className="font-display text-[28px] text-on-surface">24</p>
            </div>
            <div className="w-[1px] bg-surface-dim" />
            <div>
              <p className="mb-1 font-label-sm uppercase tracking-wider text-outline">Terms</p>
              <p className="font-display text-[28px] text-on-surface">1</p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Start */}
        <section>
          <h2 className="mb-6 font-headline-lg text-on-surface">Quick Start</h2>
          <div className="flex flex-col gap-4">
            {QUICK_START.map((qs, i) => (
              <button
                key={qs.title}
                className="glass-card group flex w-full items-center gap-4 rounded-md p-4 text-left transition-shadow hover:ambient-glow-primary"
                style={{ marginLeft: `${i * 16}px` }}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${qs.gradient} p-2 shadow-inner`}
                >
                  <span className="material-symbols-outlined text-2xl text-on-surface/70">{qs.icon}</span>
                </div>
                <div>
                  <h4 className="font-label-bold text-[14px] text-on-surface transition-colors group-hover:text-primary">
                    {qs.title}
                  </h4>
                  <p className="font-label-sm text-outline">{qs.minutes} min</p>
                </div>
                <span className="material-symbols-outlined ml-auto -translate-x-2 text-outline opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CarouselBtn({ direction }: { direction: 'left' | 'right' }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-on-surface-variant transition-colors hover:bg-surface-container-low">
      <span className="material-symbols-outlined text-[20px]">
        {direction === 'left' ? 'chevron_left' : 'chevron_right'}
      </span>
    </button>
  );
}

function YearSelector() {
  return (
    <div className="flex items-center gap-4 rounded-full bg-white px-4 py-1.5 shadow-sm">
      <button className="text-outline hover:text-primary">
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>
      <span className="font-label-bold text-on-surface">2026</span>
      <button className="text-outline hover:text-primary">
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
}
