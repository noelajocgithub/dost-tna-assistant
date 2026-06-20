// Glass-style button. Rounded, soft shadow, subtle translucency.
const VARIANTS = {
  primary:
    'bg-primary/90 text-white border border-primary/60 hover:bg-primary shadow-lg shadow-primary/20 disabled:opacity-50',
  secondary:
    'bg-white/50 text-primary border border-white/70 hover:bg-white/70 disabled:opacity-50',
  accent:
    'bg-cyan/90 text-white border border-cyan/60 hover:bg-cyan shadow-lg shadow-cyan/20 disabled:opacity-50',
  danger:
    'bg-white/40 text-red-600 border border-red-400/70 hover:bg-red-600 hover:text-white disabled:opacity-50',
  success:
    'bg-green/90 text-white border border-green/60 hover:bg-green shadow-lg shadow-green/20 disabled:opacity-50',
  ghost:
    'bg-transparent text-charcoal border border-white/60 hover:bg-white/40 disabled:opacity-50',
}

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
