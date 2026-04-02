export default function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-[16px] px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50'
  const styles =
    variant === 'ghost'
      ? 'border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--panel-muted)]'
      : variant === 'soft'
        ? 'border border-[var(--border)] bg-[var(--panel-muted)] text-[var(--text)] hover:bg-[var(--panel)]'
        : 'border border-[var(--accent-border)] bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-[var(--shadow-soft)]'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
