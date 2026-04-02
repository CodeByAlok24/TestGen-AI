export default function Card({ title, subtitle, right, children }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white px-5 py-5 shadow-[var(--shadow-soft)]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-base font-semibold text-[var(--text-strong)]">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-[var(--muted)]">{subtitle}</div> : null}
        </div>
        {right}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  )
}
