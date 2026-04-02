export default function Card({ title, subtitle, right, children }) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-white px-5 py-5 shadow-[var(--shadow-soft)]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[1.12rem] font-semibold tracking-[-0.02em] text-[var(--text-strong)]">{title}</div>
          {subtitle ? <div className="mt-1 max-w-[34ch] text-sm leading-6 text-[var(--muted)]">{subtitle}</div> : null}
        </div>
        {right}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  )
}
