export default function PairPageLoading() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-6 lg:px-8">
        <section className="theme-panel rounded-[32px] px-6 py-10 text-center">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin" />
          <p className="theme-text-main mt-5 text-lg font-semibold">
            Loading route...
          </p>
        </section>
      </div>
    </main>
  );
}
