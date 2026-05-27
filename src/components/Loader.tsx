export function Loader() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_280px]">
      <div className="rounded-[30px] border border-white/60 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-6">
        <div className="animate-pulse space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-black/5" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-black/5" />
              <div className="h-4 w-40 rounded-full bg-black/5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-3/5 rounded-full bg-black/5" />
            <div className="h-4 w-full rounded-full bg-black/5" />
            <div className="h-4 w-11/12 rounded-full bg-black/5" />
            <div className="h-4 w-9/12 rounded-full bg-black/5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-32 rounded-[24px] bg-black/5" />
            <div className="h-32 rounded-[24px] bg-black/5" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-11 w-28 rounded-full bg-black/5" />
            <div className="h-11 w-24 rounded-full bg-black/5" />
            <div className="h-11 w-24 rounded-full bg-black/5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/60 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded-full bg-black/5" />
            <div className="h-16 rounded-[22px] bg-black/5" />
            <div className="h-16 rounded-[22px] bg-black/5" />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/60 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded-full bg-black/5" />
            <div className="h-12 rounded-[18px] bg-black/5" />
            <div className="h-12 rounded-[18px] bg-black/5" />
            <div className="h-12 rounded-[18px] bg-black/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
