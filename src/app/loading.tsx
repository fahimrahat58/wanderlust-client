export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9fa]">
      {/* Navbar Skeleton */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-[#15A1BF]/10">
              <div className="h-5 w-5 animate-pulse rounded-full bg-[#15A1BF]/40" />
            </div>
            <div className="h-5 w-28 animate-pulse rounded-md bg-gray-200" />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-3 w-16 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </nav>

          <div className="h-10 w-24 animate-pulse rounded-xl bg-[#15A1BF]/15" />
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e2f7fb] via-[#eef8fa] to-[#d7f0f5]">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#15A1BF]/10 blur-3xl" />

          <div className="relative grid min-h-[390px] items-center gap-8 p-7 md:min-h-[460px] md:grid-cols-2 md:p-14">
            <div className="space-y-6">
              <div className="h-7 w-36 animate-pulse rounded-full bg-[#15A1BF]/20" />

              <div className="space-y-3">
                <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-gray-300/70 md:h-12" />
                <div className="h-9 w-4/5 max-w-sm animate-pulse rounded-lg bg-gray-300/60 md:h-12" />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full max-w-sm animate-pulse rounded-full bg-gray-300/60" />
                <div className="h-3 w-4/5 max-w-xs animate-pulse rounded-full bg-gray-300/60" />
              </div>

              <div className="h-12 w-40 animate-pulse rounded-xl bg-[#15A1BF]/30" />
            </div>

            <div className="relative hidden h-[300px] md:block">
              <div className="absolute right-4 top-2 h-64 w-4/5 animate-pulse rounded-[32px] bg-white/70 shadow-xl shadow-[#15A1BF]/5" />
              <div className="absolute bottom-0 left-0 h-36 w-40 animate-pulse rounded-2xl border-4 border-white/70 bg-[#15A1BF]/15" />
              <div className="absolute right-0 top-10 h-12 w-32 animate-pulse rounded-2xl bg-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Heading */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pt-16">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[#15A1BF]/25" />
            <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-3 w-72 max-w-full animate-pulse rounded-full bg-gray-200" />
          </div>

          <div className="h-10 w-32 animate-pulse rounded-xl bg-[#15A1BF]/15" />
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="relative h-56 animate-pulse bg-gradient-to-br from-[#d8f0f5] via-gray-200 to-[#e7f5f7]">
                <div className="absolute left-4 top-4 h-7 w-20 animate-pulse rounded-full bg-white/80" />
                <div className="absolute bottom-4 right-4 h-8 w-20 animate-pulse rounded-lg bg-white/80" />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-5 w-2/3 animate-pulse rounded-md bg-gray-200" />
                  <div className="h-4 w-12 animate-pulse rounded-full bg-[#15A1BF]/15" />
                </div>

                <div className="h-3 w-2/5 animate-pulse rounded-full bg-gray-200" />

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="space-y-2">
                    <div className="h-3 w-14 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-6 w-24 animate-pulse rounded-md bg-[#15A1BF]/20" />
                  </div>

                  <div className="h-10 w-28 animate-pulse rounded-xl bg-[#15A1BF]/20" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Loading Indicator */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/95 px-5 py-3 shadow-lg shadow-gray-200/60 backdrop-blur-md">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#15A1BF]/20 border-t-[#15A1BF]" />
          <span className="text-sm font-medium text-gray-600">
            Preparing your journey...
          </span>
        </div>
      </div>
    </main>
  );
}
